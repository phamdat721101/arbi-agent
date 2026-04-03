/**
 * register-agent.ts
 *
 * Registers ArbiAgent on the ERC-8004 Identity Registry (Arbitrum Sepolia).
 * Run: npm run register:agent
 */

import dotenv from "dotenv";
dotenv.config();

import { createWalletClient, http, publicActions, decodeEventLog } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";

const REGISTRY = "0x8004A818BFB912233c491871b3d84c89A494BD9e" as const;

const registerAbi = [{
  name: "register",
  type: "function",
  stateMutability: "nonpayable",
  inputs: [{ name: "agentURI", type: "string" }],
  outputs: [{ name: "agentId", type: "uint256" }],
}] as const;

const registeredEvent = [{
  name: "Registered",
  type: "event",
  inputs: [
    { name: "agentId", type: "uint256", indexed: true },
    { name: "agentURI", type: "string", indexed: false },
    { name: "owner", type: "address", indexed: true },
  ],
}] as const;

async function main() {
  const account = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY! as `0x${string}`);
  const client = createWalletClient({
    account,
    chain: arbitrumSepolia,
    transport: http(process.env.ARBITRUM_SEPOLIA_RPC_URL),
  }).extend(publicActions);

  const registration = {
    type: "autonomousAgent",
    name: "ArbiAgent",
    description: "Autonomous AI agent selling DeFi data via x402 micropayments on Arbitrum",
    image: "",
    endpoints: [
      { name: "x402", endpoint: "https://13-212-80-72.sslip.io", version: "2" },
      { name: "wallet", endpoint: `eip155:421614:${account.address}` },
    ],
    x402Support: true,
    active: true,
    registrations: [{
      agentRegistry: `eip155:421614:${REGISTRY}`,
    }],
  };

  const json = JSON.stringify(registration);
  const agentURI = `data:application/json;base64,${Buffer.from(json).toString("base64")}`;

  console.log("Registering ArbiAgent on ERC-8004...");
  console.log(`  Registry: ${REGISTRY}`);
  console.log(`  Owner:    ${account.address}`);

  const hash = await client.writeContract({
    address: REGISTRY,
    abi: registerAbi,
    functionName: "register",
    args: [agentURI],
  });

  console.log(`  Tx:       ${hash}`);
  const receipt = await client.waitForTransactionReceipt({ hash });

  for (const log of receipt.logs) {
    try {
      const event = decodeEventLog({ abi: registeredEvent, data: log.data, topics: log.topics });
      if (event.eventName === "Registered") {
        console.log(`\n✅ Registered! agentId: ${event.args.agentId}`);
        console.log(`   View: https://sepolia.arbiscan.io/tx/${hash}`);
        return;
      }
    } catch {}
  }

  console.log(`\n✅ Registered! Tx: https://sepolia.arbiscan.io/tx/${hash}`);
}

main().catch((err) => {
  console.error("Registration failed:", err.message || err);
  process.exit(1);
});
