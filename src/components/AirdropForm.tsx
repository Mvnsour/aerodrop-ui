"use client";
import { InputForm } from "./ui/InputForm"
import { useState } from "react";

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState<string>("");

  return (
    <>
      <InputForm
        label="Token Address"
        placeholder="0x"
        value={tokenAddress}
        onChange={e => setTokenAddress(e.target.value)}
      />
    </>
  );
}