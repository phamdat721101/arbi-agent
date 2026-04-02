/**
 * test-client.ts — Standalone paying client
 *
 * Run: npx tsx test-client.ts
 * Requires: BUYER_PRIVATE_KEY in .env + funded wallet on Arbitrum Sepolia
 */

import dotenv from "dotenv";
dotenv.config();

import { createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { ExactEvmScheme, toClientEvmSigner } from "@x402/evm";
import type { Network } from "@x402/core/types";

const NETWORK: Network = "eip155:421614"; // Arbitrum Sepolia

async function main() {
  const buyerKey = process.env.BUYER_PRIVATE_KEY;
  if (!buyerKey) {
    console.error("Set BUYER_PRIVATE_KEY in .env");
    process.exit(1);
  }

  const account = privateKeyToAccount(buyerKey as `0x${string}`);
  console.log(`Buyer wallet: ${account.address}`);

  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http("https://sepolia-rollup.arbitrum.io/rpc"),
  });

  const signer = toClientEvmSigner(account, publicClient);
  const client = new x402Client().register(
    NETWORK,
    new ExactEvmScheme(signer)
  );
  const x402Fetch = wrapFetchWithPayment(fetch, client);

  console.log("Requesting http://localhost:4021/yield with x402 payment...\n");

  const response = await x402Fetch("http://localhost:4021/yield");
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
