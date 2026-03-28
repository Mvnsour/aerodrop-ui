"use client";
import { InputForm, SubmitButton, TokenDetails, ErrorModal } from "@/components/ui"
import { useState, useMemo, useEffect } from "react";
import { chainsToAerodrop, erc20Abi, aerodropAbi } from "@/constants";
import { useChainId, useConfig, useAccount, useWriteContract, useReadContracts, useWaitForTransactionReceipt } from 'wagmi'
import { readContract, waitForTransactionReceipt } from '@wagmi/core';
import { calculateTotal } from "@/utils";

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [recipients, setRecipients] = useState<string>("");
  const [amounts, setAmounts] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const chainId = useChainId();
  const config = useConfig();
  const account = useAccount();
  const total: number = useMemo(() => calculateTotal(amounts), [amounts]);
  const { data: hash, isPending, error, writeContractAsync } = useWriteContract();
  // useWaitForTransactionReceipt watches hash automatically and gives isConfirming, isConfirmed, isError for free
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError } = useWaitForTransactionReceipt({
    confirmations: 1,
    hash,
  });

  // Inside your component...
  const { data: tokenData } = useReadContracts({
    contracts: [
      { // Call 1: Get token decimals
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'decimals',
      },
      { // Call 2: Get token name
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'name',
      },
      { // Call 3: Get user's token balance (optional, for UI feedback)
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [account.address]
      }
    ],
    // Conditionally enable the hook, e.g., only run if tokenAddress is valid
    query: { enabled: /^0x[a-fA-F0-9]{40}$/.test(tokenAddress) }
  });

  // Access results (tokenData will be an array):
  const tokenDecimals = tokenData?.[0]?.result as number | undefined; // Result of the 'decimals' call
  const tokenName = tokenData?.[1]?.result as string | undefined; // Result of the 'name' call

  // Retrieve data on component mount
  useEffect(() => {
    const savedAddress = localStorage.getItem('aerodropTokenAddress');
    const savedRecipients = localStorage.getItem('aerodropRecipients');
    const savedAmounts = localStorage.getItem('aerodropAmounts');
    if (savedAddress) setTokenAddress(savedAddress);
    if (savedRecipients) setRecipients(savedRecipients);
    if (savedAmounts) setAmounts(savedAmounts);
  }, []); // Empty dependency array: run only on mount

  // Save data when tokenAddress state changes
  useEffect(() => {
    localStorage.setItem('aerodropTokenAddress', tokenAddress);
  }, [tokenAddress]); // Dependency: run when tokenAddress changes

  useEffect(() => {
    localStorage.setItem('aerodropRecipients', recipients);
  }, [recipients]);

  useEffect(() => {
    localStorage.setItem('aerodropAmounts', amounts);
  }, [amounts]);

  const executeAirdrop = async () => {
    try {
      console.log("Executing airdropERC20...");
      const recipientAddresses = recipients // Assuming 'recipients' is a string like "addr1, addr2\naddr3"
        .split(/[, \n]+/) // Split by comma, space, or newline
        .map((addr) => addr.trim()) // Remove whitespace
        .filter(addr => addr !== "") // Remove empty entries
        .map(addr => addr as `0x${string}`); // Cast to address type

      const transferAmounts = amounts // Assuming 'amounts' is a string like "10, 20\n30"
        .split(/[, \n]+/)
        .map((amt) => amt.trim())
        .filter(amt => amt !== "")
        .map(amount => BigInt(amount)); // Convert amounts to BigInt

      if (recipientAddresses.length !== transferAmounts.length) {
        throw new Error("Mismatch between number of recipients and amounts.");
      }

      // Initiate Airdrop Transaction
      const airdropHash = await writeContractAsync({
        abi: aerodropAbi, // Spender contract's ABI
        address: chainsToAerodrop[chainId]?.["aerodrop"] as `0x${string}`, // Spender contract's address
        functionName: 'airdropERC20',
        args: [
          tokenAddress as `0x${string}`, // 1. Token being sent
          recipientAddresses,            // 2. Array of recipient addresses
          transferAmounts,               // 3. Array of amounts (BigInt)
          BigInt(total),
        ],
      });
      console.log("Airdrop transaction hash:", airdropHash);

      // Optional: Wait for airdrop confirmation if needed for further UI updates
      console.log("Waiting for airdrop confirmation...");
      const airdropReceipt = await waitForTransactionReceipt(config, { hash: airdropHash });
      console.log("Airdrop confirmed:", airdropReceipt);
      // Update UI based on success/failure

    } catch (err) {
      console.error("Airdrop failed:", err);
      setErrorMessage("Airdrop transaction failed. Please try again.");
    }
  };

  async function handleSubmit() {
    const aerodropAddress = chainsToAerodrop[chainId]?.["aerodrop"];

    if (!account.address) {
      alert("Please connect your wallet.");
      return;
    }
    if (!aerodropAddress) {
      alert("AeroDrop contract not found for the connected network. Please switch networks.");
      return;
    }
    if (!tokenAddress || !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
      alert("Please enter a valid ERC20 token address (0x...).");
      return;
    }

    // Conditional check
    const approvedAmount = await readContract(config, {
      abi: erc20Abi,
      address: tokenAddress as `0x${string}`,
      functionName: "allowance",
      args: [account.address, aerodropAddress as `0x${string}`],
    }) as bigint;

    if (approvedAmount < total) {
      try {
        console.log(`Approval needed: Current ${approvedAmount}, Required ${total}`);
        // Initiate Approve Transaction
        const approvalHash = await writeContractAsync({
          abi: erc20Abi, // ERC20 token ABI
          address: tokenAddress as `0x${string}`, // ERC20 token address
          functionName: "approve",
          args: [aerodropAddress as `0x${string}`, BigInt(total)], // Spender address and total amount
        });
        console.log("Approval transaction hash:", approvalHash);

        // Wait for the transaction to be mined
        console.log("Waiting for approval confirmation...");
        const approvalReceipt = await waitForTransactionReceipt(config, { // Pass config here!
          hash: approvalHash,
        });
        console.log("Approval confirmed:", approvalReceipt);

        if (approvalReceipt.status === "success") {
          console.log("Approval successful, proceeding to airdrop.");
          await executeAirdrop(); // Call airdrop AFTER successful approval
        } else {
          console.error("Approval transaction failed.");
          setErrorMessage("Approval transaction failed. Please try again.");
        }
      } catch (err) {
        console.error("Approval process error:", err);
        setErrorMessage("Approval failed. Please try again.");
      }
    } else {
      console.log("Sufficient allowance, proceeding directly to airdrop.");
      await executeAirdrop(); // Call airdrop directly
    }
  }

  return (
    <>
    {errorMessage && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
      <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
        <InputForm
          label="Token Address"
          placeholder="0x..."
          value={tokenAddress}
          onChange={e => setTokenAddress(e.target.value)}
        />
        <InputForm
          label="Recipient Address"
          placeholder="0x123..., 0x456..."
          value={recipients}
          onChange={e => setRecipients(e.target.value)}
          large={true}
        />
        <InputForm
          label="Amounts"
          placeholder="100, 200, 300"
          value={amounts}
          onChange={e => setAmounts(e.target.value)}
          large={true}
        />
        <TokenDetails
          tokenName={tokenName}
          tokenDecimals={tokenDecimals}
          total={total}
        />
        <SubmitButton
          isPending={isPending}
          isConfirming={isConfirming}
          isConfirmed={isConfirmed}
          isError={isError}
          error={error}
        />
      </form>
    </>
  );
}