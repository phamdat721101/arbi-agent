/**
 * test-payment.ts
 *
 * Tests the full x402 payment flow.
 * Requires: BUYER_PRIVATE_KEY in .env + funded wallet on Arbitrum Sepolia.
 * Run: npm run test:payment (requires agent running on port 4021)
 */

import dotenv from "dotenv";
dotenv.config();

import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { ExactEvmScheme, toClientEvmSigner } from "@x402/evm";
import type { Network } from "@x402/core/types";

const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;

const BASE_URL = process.env.API_URL || "http://localhost:4021";
const NETWORK: Network = "eip155:421614"; // Arbitrum Sepolia

async function main() {
  console.log("");
  console.log(cyan("╔══════════════════════════════════════════╗"));
  console.log(cyan("║     ArbiAgent — Payment Flow Test        ║"));
  console.log(cyan("╚══════════════════════════════════════════╝"));
  console.log("");

  // 1. Check buyer wallet config
  const buyerKey = process.env.BUYER_PRIVATE_KEY;
  if (!buyerKey) {
    console.error(red("  BUYER_PRIVATE_KEY not set in .env"));
    console.error(yellow("  Add a funded wallet private key to test payments"));
    process.exit(1);
  }

  const account = privateKeyToAccount(buyerKey as `0x${string}`);
  console.log(yellow(`  Buyer wallet: ${account.address}`));

  // 2. Setup x402 client
  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http("https://sepolia-rollup.arbitrum.io/rpc"),
  });

  const signer = toClientEvmSigner(account, publicClient);
  const client = new x402Client().register(NETWORK, new ExactEvmScheme(signer));
  const x402Fetch = wrapFetchWithPayment(fetch, client);

  // 3. Get agent balance before
  console.log(yellow("\n  [1] Checking agent balance before..."));
  const beforeRes = await fetch(`${BASE_URL}/`);
  const beforeData = (await beforeRes.json()) as any;
  console.log(yellow(`      Agent USDC before: ${beforeData.usdcBalance}`));

  // 4. Make paid request
  console.log(cyan("\n  [2] Making paid request to /yield..."));
  console.log(yellow("      Auto-signing EIP-712 payment..."));

  const res = await x402Fetch(`${BASE_URL}/yield`);
  if (!res.ok) {
    const text = await res.text();
    console.error(red(`  Payment failed: HTTP ${res.status}`));
    console.error(red(`  ${text}`));
    process.exit(1);
  }

  const data = (await res.json()) as any;
  console.log(green("      Payment successful!"));
  console.log(yellow(`\n  [3] AI Summary:`));
  console.log(`      ${data.summary}`);

  // 5. Check agent balance after
  console.log(yellow("\n  [4] Checking agent balance after..."));
  const afterRes = await fetch(`${BASE_URL}/`);
  const afterData = (await afterRes.json()) as any;
  console.log(yellow(`      Agent USDC after: ${afterData.usdcBalance}`));

  const earned =
    parseFloat(afterData.usdcBalance) - parseFloat(beforeData.usdcBalance);
  if (earned > 0) {
    console.log(green(`\n      Agent earned +$${earned.toFixed(6)} USDC`));
  }

  console.log("");
  console.log(green("  Payment flow test complete!"));
  console.log("");
}

main().catch((err) => {
  console.error(red(`\n  Error: ${err.message}`));
  process.exit(1);
});
