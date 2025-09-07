"use client"

import { ReactNode } from "react";
import config from "@/rainbowKitConfig";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';


export function Providers(props: {children: ReactNode}) {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider>
        {props.children}
      </RainbowKitProvider>
    </WagmiProvider>
  )
}