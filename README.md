# ArbiAgent

Autonomous AI agent that sells DeFi data via [x402](https://www.x402.org/) micropayments on Arbitrum. Built with Claude AI (AWS Bedrock), x402 payment protocol, and ERC-8004 on-chain identity.

## What is it?

ArbiAgent is an autonomous AI agent that:

- **Earns money** by selling Arbitrum DeFi pool data and AI-generated yield insights
- **Charges $0.001 USDC** per API request using the x402 payment protocol
- **Analyzes data** with Claude AI via AWS Bedrock to provide actionable DeFi summaries
- **Operates autonomously** — no human approves payments, the agent handles everything on-chain
- **Has on-chain identity** via ERC-8004 on the Arbitrum Sepolia registry

## Architecture

```
┌─────────────┐     x402 payment      ┌──────────────┐     verify/settle     ┌──────────────┐
│   Buyer /    │ ──────────────────▶   │  ArbiAgent   │ ──────────────────▶   │  Facilitator │
│   Dashboard  │ ◀──────────────────   │  (Express)   │ ◀──────────────────   │  (x402)      │
└─────────────┘     DeFi data          └──────┬───────┘                       └──────────────┘
                                              │
                                    ┌─────────┴─────────┐
                                    │                   │
                              ┌─────▼─────┐     ┌──────▼──────┐
                              │  Claude   │     │  Arbitrum   │
                              │  Bedrock  │     │  Sepolia    │
                              └───────────┘     └─────────────┘
```

## Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /` | Free | Agent identity, wallet, balance |
| `GET /yield` | x402 ($0.001) | AI-summarized yield opportunities |
| `GET /pools` | x402 ($0.001) | Top liquidity pool data |
| `GET /buy/:endpoint` | Free | Proxy that auto-pays via env wallet |
| `GET /spend` | Free | Spending history log |

## Prerequisites

- **Node.js** >= 18
- **Arbitrum Sepolia ETH** for gas ([faucet](https://www.alchemy.com/faucets/arbitrum-sepolia))
- **AWS Bedrock API key** with Claude model access ([generate here](https://console.aws.amazon.com/bedrock/home?region=us-east-1#/api-keys))

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/phamdat721101/arbi-agent.git
cd arbi-agent
npm install
cd dashboard && npm install && cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
AGENT_PRIVATE_KEY=0x...your_private_key...
AGENT_WALLET_ADDRESS=0x...your_address...
BEDROCK_API_KEY="your_bedrock_api_key"
NETWORK=arbitrum-sepolia
```

### 3. Deploy & Seed Mock USDC

This deploys a TestUSDC contract to Arbitrum Sepolia and mints 10,000 USDC to your agent wallet:

```bash
npm run setup:usdc
```

The script auto-updates `MOCK_USDC_ADDRESS` in your `.env`.

### 4. Start All Services

```bash
npm run dev:all
```

This starts 3 services concurrently:
- **Facilitator** on port 3002 — handles x402 payment verification
- **Agent API** on port 4021 — the x402-protected endpoints
- **Dashboard** on port 3000 — web UI

### 5. Test It

Open in your browser:
- Dashboard: http://localhost:3000
- Agent info: http://localhost:4021
- Buy pools (auto-pay): http://localhost:4021/buy/pools
- Buy yield (auto-pay): http://localhost:4021/buy/yield

## Register On-Chain Identity (ERC-8004)

Register your agent on the Arbitrum Sepolia identity registry:

```bash
npm run register:agent
```

This mints an ERC-721 NFT on the [ERC-8004 registry](https://sepolia.arbiscan.io/address/0x8004A818BFB912233c491871b3d84c89A494BD9e) with your agent's metadata, endpoints, and wallet.

## Project Structure

```
arbi-agent/
├── src/
│   ├── index.ts          # Entry point
│   ├── server.ts         # Express server with x402 middleware
│   ├── agent.ts          # Claude AI reasoning layer
│   ├── arbitrum.ts       # On-chain data fetching
│   ├── client.ts         # x402 buyer client
│   ├── facilitator.ts    # Local x402 facilitator
│   ├── wallet.ts         # Wallet & USDC balance
│   └── config.ts         # Environment config
├── contracts/
│   └── TestUSDC.sol      # Mock USDC for testnet
├── scripts/
│   ├── register-agent.ts # ERC-8004 registration
│   ├── deploy-usdc.ts    # Deploy mock USDC
│   ├── seed-usdc.ts      # Mint USDC to wallet
│   ├── test-payment.ts   # Test x402 payment flow
│   └── demo.ts           # Demo script
├── dashboard/            # Next.js dashboard UI
│   ├── app/
│   │   ├── page.tsx      # Home — agent status
│   │   ├── pools/        # Pool data view
│   │   ├── earn/         # Earnings tracker
│   │   ├── spend/        # Spending tracker
│   │   ├── api-console/  # Interactive API tester
│   │   └── config/       # Configuration view
│   └── lib/api.ts        # API client
└── .env.example          # Environment template
```

## How x402 Payment Works

1. Client requests `GET /yield` or `GET /pools`
2. Server returns **HTTP 402** with payment requirements
3. Client signs an EIP-712 payment authorization
4. Client retries with `PAYMENT-SIGNATURE` header
5. Server verifies payment via facilitator
6. Data is returned, payment is settled on-chain

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:all` | Start facilitator + agent + dashboard |
| `npm run setup:usdc` | Compile, deploy, and seed mock USDC |
| `npm run register:agent` | Register on ERC-8004 identity registry |
| `npm run test:endpoints` | Test all API endpoints |
| `npm run test:payment` | Test full x402 payment flow |
| `npm run demo` | Run demo for judges |

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **AI**: Claude Opus 4.6 via AWS Bedrock
- **Payments**: x402 protocol (Coinbase)
- **Blockchain**: Arbitrum Sepolia (viem)
- **Identity**: ERC-8004 Trustless Agents
- **Smart Contracts**: Hardhat + Solidity
- **Dashboard**: Next.js + Tailwind CSS
- **Server**: Express.js

## License

MIT
