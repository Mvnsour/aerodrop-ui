"use client";
import { InputForm } from "./ui/InputForm"
import { useState } from "react";

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [recipients, setRecipients] = useState<string>("");
  const [amounts, setAmounts] = useState<string>("");

  async function handleSubmit() {
    console.log({ tokenAddress, recipients, amounts });
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