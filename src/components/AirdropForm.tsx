"use client";
import { InputForm } from "./ui/InputForm"
import { useState } from "react";
import { chainsToAeroDrop, erc20Abi, aeroDropAbi } from "@/constants";
import { useChainId, useConfig, useAccount } from 'wagmi'
import { readContract } from '@wagmi/core';

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [recipients, setRecipients] = useState<string>("");
  const [amounts, setAmounts] = useState<string>("");
  const chainId = useChainId();
  const config = useConfig();
  const account = useAccount();

  async function getApprovedAmount(aeroDropAddress: string | null): Promise<bigint> {
    // read from the chain if we have enough tokens
    try {
      const allowance = await readContract(config, {
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "allowance",
        args: [account.address, aeroDropAddress as `0x${string}`]
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

  async function handleSubmit() {
    const aeroDropAddress = chainsToAeroDrop[chainId]?.["aerodrop"];
    const approvedAmount = await getApprovedAmount(aeroDropAddress);
    console.log(approvedAmount);

      // Basic validation
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
    if (!aeroDropAddress) {
      alert("AeroDrop contract address not found for this chain, please switch to a supported network.");
      return;
    }
  }

  return (
    <>
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
      "
      >
        Send Tokens
      </button>
    </>
  );
}