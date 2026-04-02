/**
 * test-payment.ts
 *
 * Tests the full x402 payment flow using the agent wallet as buyer.
 * Run: npm run test:payment (requires facilitator + agent running)
 */

import dotenv from "dotenv";
dotenv.config();

import { createPublicClient, http } from "viem";
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
const NETWORK: Network = "eip155:421614";

async function main() {
  console.log("");
  console.log(cyan("╔══════════════════════════════════════════╗"));
  console.log(cyan("║     ArbiAgent — Payment Flow Test        ║"));
  console.log(cyan("╚══════════════════════════════════════════╝"));
  console.log("");

  // Single wallet mode: use AGENT_PRIVATE_KEY as buyer
  const buyerKey = process.env.BUYER_PRIVATE_KEY || process.env.AGENT_PRIVATE_KEY;
  if (!buyerKey) {
    console.error(red("  No private key found (BUYER_PRIVATE_KEY or AGENT_PRIVATE_KEY)"));
    process.exit(1);
  }

  const account = privateKeyToAccount(buyerKey as `0x${string}`);
  console.log(yellow(`  Buyer wallet: ${account.address}`));

  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(process.env.ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc"),
  });

  const signer = toClientEvmSigner(account, publicClient);
  const client = new x402Client().register(NETWORK, new ExactEvmScheme(signer));
  const x402Fetch = wrapFetchWithPayment(fetch, client);

  // 1. Check agent info
  console.log(yellow("\n  [1] Checking agent status..."));
  const beforeRes = await fetch(`${BASE_URL}/`);
  const beforeData = (await beforeRes.json()) as any;
  console.log(yellow(`      Agent USDC: ${beforeData.usdcBalance}`));
  console.log(yellow(`      Facilitator: ${beforeData.x402Facilitator}`));

  // 2. Test 402 response
  console.log(cyan("\n  [2] Testing 402 response from /yield..."));
  const rawRes = await fetch(`${BASE_URL}/yield`);
  console.log(yellow(`      Status: ${rawRes.status} (expected 402)`));

  // 3. Make paid request
  console.log(cyan("\n  [3] Making paid request to /yield..."));
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
  console.log(yellow(`\n  [4] AI Summary:`));
  console.log(`      ${data.summary}`);

  // 4. Check balance after
  console.log(yellow("\n  [5] Checking agent status after..."));
  const afterRes = await fetch(`${BASE_URL}/`);
  const afterData = (await afterRes.json()) as any;
  console.log(yellow(`      Agent USDC: ${afterData.usdcBalance}`));

  const earned = parseFloat(afterData.usdcBalance) - parseFloat(beforeData.usdcBalance);
  if (earned > 0) {
    console.log(green(`\n      Agent earned +$${earned.toFixed(6)} USDC`));
  }

  console.log("");
  console.log(green("  ✓ Full x402 payment flow test complete!"));
  console.log("");
}

main().catch((err) => {
  console.error(red(`\n  Error: ${err.message}`));
  process.exit(1);
});
