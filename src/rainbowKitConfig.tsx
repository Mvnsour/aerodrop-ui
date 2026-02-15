"use client"

import { getDefaultConfig, } from '@rainbow-me/rainbowkit';
import { zksync, mainnet, arbitrum, base, optimism, sepolia, anvil } from 'wagmi/chains';

export default getDefaultConfig({
  appName: "AeroDrop",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID! || "",
  chains: [zksync, mainnet, arbitrum, base, optimism, sepolia, anvil],
  ssr: false,
})