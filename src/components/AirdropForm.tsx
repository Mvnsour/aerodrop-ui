"use client";
import { InputForm } from "./ui/InputForm"
import { useState, useMemo } from "react";
import { chainsToAeroDrop, erc20Abi, aeroDropAbi } from "@/constants";
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
    const aeroDropAddress = chainsToAeroDrop[chainId]?.["aerodrop"];

    if (!account.address) {
        alert("Please connect your wallet.");
        return;
    }
    if (!aeroDropAddress) {
        alert("AeroDrop contract not found for the connected network. Please switch networks.");
        return;
    }
    if (!tokenAddress || !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
       alert("Please enter a valid ERC20 token address (0x...).");
       return;
    }

    try {
      const approvedAmount = await getApprovedAmount(
        aeroDropAddress as `0x${string}`,
        tokenAddress as `0x${string}`,
        account.address);
      console.log(`Current allowance: ${approvedAmount}`);

      if (approvedAmount < total) {
        const approvalHash = await writeContractAsync({
          abi: erc20Abi,
          address: tokenAddress as `0x${string}`,
          functionName: "approve",
          args: [aeroDropAddress as `0x${string}`, BigInt(total)]
        })

        const approvalReceipt = await waitForTransactionReceipt(config, {
          hash: approvalHash
        });

        console.log("Approval transaction confirmed:", approvalReceipt);
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