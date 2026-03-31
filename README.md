# AeroDrop UI

A production-ready ERC20 token airdrop interface built on top of the TSender smart contract. Send tokens to multiple recipients in a single transaction — with a clean UI, full wallet integration, and a robust approve/airdrop flow.

---

## Overview

AeroDrop UI is a decentralized application (dApp) that lets users airdrop ERC20 tokens to multiple addresses simultaneously. It handles the full interaction lifecycle: checking existing allowances, requesting approval if needed, and executing the airdrop — all with real-time feedback and persistent form state.

Built as part of the [Cyfrin](https://www.cyfrin.io/) web3 development curriculum, with deliberate architectural choices made independently of the course defaults.

---

## Features

- Connect wallet via RainbowKit (MetaMask, WalletConnect, and more)
- Input token address, recipients, and amounts with localStorage persistence
- Auto-fetches token name, decimals, and your current balance via `useReadContracts`
- Checks existing ERC20 allowance before sending — approves only when necessary
- Confirms each transaction with `waitForTransactionReceipt` before proceeding
- Loading indicators during pending and confirming states
- Error modal with auto-close progress bar
- Component-based architecture with a clean `./ui/` barrel export

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Wallet / Chain | Wagmi + Viem |
| Wallet UI | RainbowKit |
| Styling | Tailwind CSS |
| Loading states | react-spinners |
| Package manager | pnpm |

---

## Transaction Flow

```
User submits form
      │
      ▼
readContract → check current allowance
      │
      ├── allowance < total?
      │         │
      │         ▼
      │   writeContractAsync (approve)
      │   waitForTransactionReceipt
      │
      ▼
writeContractAsync (airdropERC20)
waitForTransactionReceipt
      │
      ▼
Success / Error feedback
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
git clone https://github.com/your-username/aerodrop-ui.git
cd aerodrop-ui
pnpm install
```

### Environment Variables

Create a `.env.local` file at the root:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AirdropForm.tsx       # Core form — handles approve + airdrop logic
│   ├── Header.tsx
│   ├── HomeContent.tsx
│   └── ui/
│       ├── index.ts          # Barrel export
│       ├── SubmitButton.tsx
│       ├── TokenDetails.tsx  # Fetches token name, decimals, balance
│       └── ErrorModal.tsx    # Auto-close error modal
├── constants/
│   └── index.ts              # Contract addresses and ABIs
└── utils/
    └── calculateTotal/
        ├── calculateTotal.ts
        └── calculateTotal.test.ts
```

---

## Testing

### Unit Tests (Vitest)

Tests cover the `calculateTotal` utility, which parses recipient/amount strings and returns the correct `bigint` total.

```bash
pnpm run test:unit
```

### End-to-End Tests (Playwright + Synpress)

E2E tests simulate real wallet interactions in a browser with MetaMask installed via Synpress.

```bash
pnpm exec playwright test
```

---

## Deployment

Deployed on **Vercel** for fast, reliable hosting with automatic preview deployments on each push.

> IPFS hosting via **Pinata** is also being explored as an alternative for decentralized deployment.

---

## Key Implementation Notes

**`bigint` consistency** — all token amounts are handled as `bigint` throughout. Passing strings to contract calls causes silent bugs.

**No double-trigger** — the submit button uses `onClick` only, not `onSubmit` on the form, to avoid double-firing.

**Additive component design** — new features (TokenDetails, ErrorModal, SubmitButton) were extracted into a `./ui/` subfolder without modifying the core AirdropForm structure.

---

## License

MIT