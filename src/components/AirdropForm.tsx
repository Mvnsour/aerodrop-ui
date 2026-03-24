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
        functionName: "airdropERC20",
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
      // Handle UI feedback for error
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

    const approvedAmount = await readContract(config, {
      abi: erc20Abi,
      address: tokenAddress as `0x${string}`,
      functionName: "allowance",
      args: [account.address, aerodropAddress as `0x${string}`],
    }) as bigint;
 
    if (approvedAmount < BigInt(total)) { 
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
          // Handle UI feedback
        }
      } catch (err) {
        console.error("Approval process error:", err);
        // Handle UI feedback
      }
    } else {
      console.log("Sufficient allowance, proceeding directly to airdrop.");
      await executeAirdrop(); // Call airdrop directly
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