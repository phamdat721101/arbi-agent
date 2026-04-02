/**
 * demo.ts
 *
 * 3-minute judge demo automation.
 * Walks through the full ArbiAgent flow with dramatic timing.
 * Run: npm run demo (requires agent running on port 4021)
 */

import dotenv from "dotenv";
dotenv.config();

import { createPublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { http } from "viem";
import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { ExactEvmScheme, toClientEvmSigner } from "@x402/evm";
import type { Network } from "@x402/core/types";

const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

const BASE_URL = process.env.API_URL || "http://localhost:4021";
const NETWORK: Network = "eip155:421614";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function banner(text: string) {
  console.log("");
  console.log(cyan("━".repeat(60)));
  console.log(bold(cyan(`  ${text}`)));
  console.log(cyan("━".repeat(60)));
}

async function main() {
  console.log("");
  console.log(bold(cyan("╔══════════════════════════════════════════════════════╗")));
  console.log(bold(cyan("║          ArbiAgent — Live Demo for Judges            ║")));
  console.log(bold(cyan("║   Autonomous AI Agent + x402 Payments on Arbitrum    ║")));
  console.log(bold(cyan("╚══════════════════════════════════════════════════════╝")));

  // ═══ Step 1: Show Agent Identity ═══
  banner("[0:00] Step 1 — Agent Identity");
  await sleep(1000);

  console.log(dim("  > GET /"));
  const identityRes = await fetch(`${BASE_URL}/`);
  const identity = (await identityRes.json()) as any;

  console.log("");
  console.log(`  ${bold("Name:")}     ${identity.name}`);
  console.log(`  ${bold("Wallet:")}   ${identity.wallet}`);
  console.log(`  ${bold("USDC:")}     ${green(identity.usdcBalance + " USDC")}`);
  console.log(`  ${bold("Network:")}  ${identity.network}`);
  console.log(`  ${bold("Block:")}    ${identity.blockNumber}`);
  console.log("");
  console.log(yellow("  \"This is an autonomous AI agent. It has its own wallet"));
  console.log(yellow("   and earns USDC by selling DeFi data via x402.\""));

  await sleep(3000);

  // ═══ Step 2: Show 402 Flow ═══
  banner("[0:30] Step 2 — HTTP 402 Payment Required");
  await sleep(1000);

  console.log(dim("  > GET /yield (no payment)"));
  const yieldRes = await fetch(`${BASE_URL}/yield`);
  console.log("");
  console.log(`  ${bold("Status:")} ${red("HTTP " + yieldRes.status + " Payment Required")}`);

  const paymentInfo = (await yieldRes.json()) as any;
  console.log(`  ${bold("Response:")}`);
  console.log(dim("  " + JSON.stringify(paymentInfo, null, 2).split("\n").join("\n  ")));
  console.log("");
  console.log(yellow("  \"No payment, no data. The agent requires $0.001 USDC"));
  console.log(yellow("   per request, settled on-chain via x402 protocol.\""));

  await sleep(3000);

  // ═══ Step 3: Paid Request ═══
  banner("[1:00] Step 3 — Auto-Pay with x402");

  const buyerKey = process.env.BUYER_PRIVATE_KEY;
  if (!buyerKey) {
    console.log(yellow("\n  Skipping paid request (BUYER_PRIVATE_KEY not set)"));
    console.log(yellow("  Set BUYER_PRIVATE_KEY in .env to demo full payment flow"));
  } else {
    await sleep(1000);

    const account = privateKeyToAccount(buyerKey as `0x${string}`);
    console.log(dim(`  Buyer wallet: ${account.address}`));
    console.log(cyan("  Signing EIP-712 payment authorization..."));

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

    console.log(cyan("  Sending paid request to /yield..."));
    const paidRes = await x402Fetch(`${BASE_URL}/yield`);

    if (paidRes.ok) {
      const data = (await paidRes.json()) as any;
      console.log("");
      console.log(green("  Payment verified! Data received:"));
      console.log("");
      console.log(bold("  AI Summary:"));
      console.log(`  ${data.summary}`);
      console.log("");
      console.log(bold("  Top Pools:"));
      if (data.data?.pools) {
        for (const pool of data.data.pools.slice(0, 3)) {
          console.log(
            `    ${pool.token0}-${pool.token1} | TVL: ${pool.tvlUSD} | APR: ${pool.apr}`
          );
        }
      }
      console.log("");
      console.log(
        yellow(
          '  "The buyer auto-signed an EIP-712 authorization. The x402'
        )
      );
      console.log(
        yellow(
          '   facilitator verified and settled the $0.001 USDC on Arbitrum."'
        )
      );
    } else {
      console.log(red(`  Payment failed: HTTP ${paidRes.status}`));
    }

    await sleep(3000);

    // ═══ Step 4: Show Updated Balance ═══
    banner("[2:00] Step 4 — Agent Earned USDC");
    await sleep(1000);

    console.log(dim("  > GET /"));
    const afterRes = await fetch(`${BASE_URL}/`);
    const after = (await afterRes.json()) as any;

    const before = parseFloat(identity.usdcBalance);
    const now = parseFloat(after.usdcBalance);
    const earned = now - before;

    console.log("");
    console.log(`  ${bold("Before:")} ${identity.usdcBalance} USDC`);
    console.log(`  ${bold("After:")}  ${green(after.usdcBalance + " USDC")}`);
    if (earned > 0) {
      console.log(`  ${bold("Earned:")} ${green("+" + earned.toFixed(6) + " USDC")}`);
    }
    console.log("");
    console.log(
      yellow(
        '  "The agent earned money autonomously. No human approved the'
      )
    );
    console.log(
      yellow(
        '   transfer. This is the agent economy in action."'
      )
    );
  }

  await sleep(2000);

  // ═══ Summary ═══
  banner("[2:30] Summary — What Makes This Special");
  console.log("");
  console.log(`  ${green("1.")} First known x402 deployment on Arbitrum`);
  console.log(`  ${green("2.")} AI agent makes autonomous decisions (LLM summarization)`);
  console.log(`  ${green("3.")} Handles money autonomously (signs x402 payments)`);
  console.log(`  ${green("4.")} On-chain settlement — every payment is verifiable`);
  console.log(`  ${green("5.")} Agent-to-agent commerce ready (buyer + seller modes)`);
  console.log("");
  console.log(bold(cyan("  Built with: x402 + viem + OpenAI + Arbitrum")));
  console.log("");
}

main().catch((err) => {
  console.error(red(`\n  Error: ${err.message}`));
  process.exit(1);
});
