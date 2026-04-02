import dotenv from "dotenv";
dotenv.config();

export const config = {
  rpc: {
    mainnet: process.env.ARBITRUM_RPC_URL!,
    testnet: process.env.ARBITRUM_SEPOLIA_RPC_URL!,
  },
  wallet: {
    privateKey: process.env.AGENT_PRIVATE_KEY! as `0x${string}`,
    address: process.env.AGENT_WALLET_ADDRESS! as `0x${string}`,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o-mini",
  },
  x402: {
    facilitatorUrl: process.env.X402_FACILITATOR_URL!,
    // Price per API call: $0.001 USDC = 1000 (6 decimals)
    pricePerCall: "$0.001",
  },
  // USDC contract on Arbitrum One
  usdc: {
    mainnet: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    testnet: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // Arbitrum Sepolia USDC
  },
  // Arbitrum chain IDs in CAIP-2 format for x402
  network: {
    mainnet: "eip155:42161",
    testnet: "eip155:421614",
  },
  port: parseInt(process.env.PORT || "4021"),
  isTestnet: process.env.NETWORK === "arbitrum-sepolia",
};
