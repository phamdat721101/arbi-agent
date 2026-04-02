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
  bedrock: {
    apiKey: process.env.BEDROCK_API_KEY!,
    region: "us-east-1",
    model: "us.anthropic.claude-opus-4-6-v1",
  },
  x402: {
    facilitatorUrl: process.env.X402_FACILITATOR_URL || "http://localhost:3002",
    pricePerCall: "$0.001",
    enableSettlement: process.env.ENABLE_SETTLEMENT === "true",
    merchantApiKey: process.env.MERCHANT_API_KEY || "dev-api-key",
  },
  usdc: {
    mainnet: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    testnet: process.env.MOCK_USDC_ADDRESS || "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  },
  network: {
    mainnet: "eip155:42161",
    testnet: "eip155:421614",
  },
  port: parseInt(process.env.PORT || "4021"),
  facilitatorPort: parseInt(process.env.FACILITATOR_PORT || "3002"),
  isTestnet: process.env.NETWORK === "arbitrum-sepolia",
};
