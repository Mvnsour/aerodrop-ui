"use client";
import { InputForm } from "./ui/InputForm"
import { useState, useMemo } from "react";
import { chainsToAerodrop, erc20Abi, aerodropAbi } from "@/constants";
import { useChainId, useConfig, useAccount, useWriteContract } from 'wagmi'
import { readContract, waitForTransactionReceipt } from '@wagmi/core';
import { calculateTotal } from "@/utils";

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [recipients, setRecipients] = useState<string>("");
  const [amounts, setAmounts] = useState<string>("");
  const chainId = useChainId();
  console.log("Current chainId:", chainId);
  const config = useConfig();
  const account = useAccount();
  const total: number = useMemo(() => calculateTotal(amounts), [amounts]);
  const { data: hash, isPending, writeContractAsync } = useWriteContract();

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

    try {
      const approvedAmount = await getApprovedAmount(
      aerodropAddress as `0x${string}`,
      tokenAddress as `0x${string}`,
      account.address);
      console.log(`Current allowance: ${approvedAmount}`);

      if (approvedAmount < total) {
        try {
          console.log(`current ${approvedAmount}, requiered ${total}`);
          // initiate approval transaction
          const approvalHash = await writeContractAsync({
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "approve",
            args: [aerodropAddress as `0x${string}`, BigInt(total)]
          })

          console.log("Approval transaction sent, hash:", approvalHash);
          // wait confirmation
          console.log("Waiting for apporoval confirmation...");
          const approvalReceipt = await waitForTransactionReceipt(config, {
            hash: approvalHash,
          })
          console.log("Approval transaction confirmed:", approvalReceipt);

          // Check receipt status for success
          if (approvalReceipt.status !== 'success') {
            console.error("Approval transaction failed:", approvalReceipt);
            // Handle UI feedback for failed transaction
            return;
            }
        } catch (error) {
          console.error("Error during approval process:", error);
          return; // Stop further execution if approval fails
        }
      } else {
        const executeAirdrop = async () => {
          try {
            console.log("Initiating airdrop transaction...");
            const recipientAddresses = recipients
            .split(/[, \n]+/) // Split by comma, space, or newline
            .map((addr) => addr.trim()) // Remove whitespace
            .filter(addr => addr !== "") // Remove empty entries
            .map(addr => addr as `0x${string}`); // Cast to address type

            const transferAmounts = amounts
            .split(/[, \n]+/)
            .map((amt) => amt.trim())
            .filter(amt => amt !== "")
            .map(amount => BigInt(amount)); // Convert amounts to BigInt

            if (recipientAddresses.length !== transferAmounts.length) {
            throw new Error("Mismatch between number of recipients and amounts.");
            }

            // initiate airdrop transaction
            const airdropHash= await writeContractAsync({
              abi: aerodropAbi, // Spender contract's ABI
              address: aerodropAddress as `0x${string}`, // Spender contract's address
              functionName: 'airdropERC20',
              args: [
                tokenAddress as `0x${string}`, // 1. Token being sent
                recipientAddresses,            // 2. Array of recipient addresses
                transferAmounts                // 3. Array of amounts (BigInt)
              ]
            });
            console.log("Airdrop transaction sent, hash:", airdropHash);

            // Optional: Wait for airdrop confirmation if needed for further UI updates
            console.log("Waiting for airdrop confirmation...");
            const airdropReceipt = await waitForTransactionReceipt(config, { hash: airdropHash });
            console.log("Airdrop confirmed:", airdropReceipt);
            // Update UI based on success/failure

          } catch (error) {
            console.error("Error during airdrop process:", error); // Handle UI feedback for error
          }
        }
      }

    } catch (error) {
      console.error("Error during submission process:", error);
    }
  }

  async function getApprovedAmount(
    spenderAddress: `0x${string}`,
    erc20TokenAddress: `0x${string}`,
    ownerAddress: `0x${string}`
  ): Promise<bigint> {

    console.log(`Spender: ${spenderAddress}, Token: ${erc20TokenAddress}, Owner: ${ownerAddress}`);
    // read from the chain if we have enough tokens
    try {
      const allowance = await readContract(config, {
        abi: erc20Abi,
        address: erc20TokenAddress as `0x${string}`,
        functionName: "allowance",
        args: [ownerAddress, spenderAddress]
      })
      console.log("Raw allowance response:", allowance);
      // The response from 'allowance' is typically a BigInt
      return allowance as bigint; // Assert type if necessary based on ABI return type
    } catch (error) {
        console.error("Error fetching allowance:", error);
        // Rethrow or handle error appropriately
        throw new Error("Failed to fetch token allowance.");
      }
  }

  return (
    <>
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
        <button 
        onClick={handleSubmit}
        type="submit"
        className="
        px-6 py-3
        bg-blue-600 hover:bg-blue-700
        text-white font-semibold
        rounded-lg
        shadow-sm
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ">
          Send Tokens
        </button>
      </form>
    </>
  );
}