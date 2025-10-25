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

  async function getApprovedAmount(aeroDropAddress: string | null): Promise<number> {
    if (!aeroDropAddress) {
      alert("AeroDrop contract address not found for this chain, please switch to a supported network.");
      return 0;
    }
    // read from the chain if we have enough tokens
    const result = await readContract(config, {
      abi: erc20Abi,
      address: tokenAddress as `0x${string}`,
      functionName: "allowance",
      args: [account.address, aeroDropAddress as `0x${string}`]
    })
    return result as number;
  }

  async function handleSubmit() {
    const aeroDropAddress = chainsToAeroDrop[chainId]["aerodrop"];
    const amount = await getApprovedAmount(aeroDropAddress);
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
      className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600">
        Send Tokens
      </button>
    </>
  );
}