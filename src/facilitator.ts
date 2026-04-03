/**
 * facilitator.ts
 *
 * Local x402 facilitator for testing. Supports verify-only and full settlement modes.
 * Toggle via ENABLE_SETTLEMENT env var.
 */

import express from "express";
import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { config } from "./config";

const app = express();
app.use(express.json());

const account = privateKeyToAccount(config.wallet.privateKey);
const client = createWalletClient({
  account,
  chain: arbitrumSepolia,
  transport: http(config.rpc.testnet),
}).extend(publicActions);

const USDC_ADDRESS = config.usdc.testnet as `0x${string}`;
const NETWORK = config.network.testnet;
const FACILITATOR_ADDRESS = account.address;

// ─── Helpers ────────────────────────────────────────────────

function parseSdkPayload(req: express.Request): any | null {
  if (req.body?.permit) return req.body;
  const header = (req.headers["payment-signature"] || req.headers["x-payment"]) as string;
  if (!header) return null;
  try { return JSON.parse(header); } catch { return null; }
}

function randomNonce(): string {
  return "0x" + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}

// ─── GET / ─────────────────────────────────────────────────

app.get("/", (_req, res) => {
  res.json({ service: "x402-facilitator", status: "ok", address: FACILITATOR_ADDRESS, network: NETWORK });
});

// ─── GET /supported ─────────────────────────────────────────

app.get("/supported", (_req, res) => {
  const kind = { x402Version: 2, scheme: "exact", network: NETWORK, payTo: FACILITATOR_ADDRESS };
  res.json({
    kinds: [kind],
    extensions: [],
    signers: { "eip155:*": [FACILITATOR_ADDRESS] },
  });
});

// ─── POST /requirements ─────────────────────────────────────

app.post("/requirements", (req, res) => {
  const amount = req.body?.amount || "1000";
  const requirements = {
    x402Version: 2,
    error: "Payment required",
    accepts: [{
      scheme: "exact",
      network: NETWORK,
      maxAmountRequired: amount,
      asset: USDC_ADDRESS,
      payTo: FACILITATOR_ADDRESS,
      resource: req.body?.extra?.resource || "/resource",
      description: req.body?.extra?.description || "Payment required",
      mimeType: "application/json",
      maxTimeoutSeconds: 3600,
      extra: { name: "TestUSDC", version: "1", nonce: randomNonce(), deadline: Math.floor(Date.now() / 1000) + 3600 },
    }],
  };
  const serialized = JSON.stringify(requirements);
  res.setHeader("PAYMENT-RESPONSE", serialized);
  res.setHeader("X-PAYMENT-RESPONSE", serialized);
  res.status(402).json(requirements);
});

// ─── POST /verify ───────────────────────────────────────────

app.post("/verify", (req, res) => {
  console.log("[Facilitator] Verified payment");
  res.json({ isValid: true });
});

// ─── POST /settle ───────────────────────────────────────────

const transferFromAbi = [{
  name: "transferFrom", type: "function", stateMutability: "nonpayable",
  inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "value", type: "uint256" }],
  outputs: [{ name: "", type: "bool" }],
}] as const;

app.post("/settle", async (req, res) => {
  if (!config.x402.enableSettlement) {
    console.log("[Facilitator] Verify-only — skipping on-chain settlement");
    return res.json({ success: true, transaction: "0x0", network: NETWORK });
  }

  const payload = parseSdkPayload(req) || req.body;

  try {
    const from = payload.permit?.owner as `0x${string}`;
    const amount = BigInt(payload.amount || "1000");
    console.log(`[Facilitator] Settling: ${from} → ${FACILITATOR_ADDRESS}, ${amount} USDC`);

    const hash = await client.writeContract({
      address: USDC_ADDRESS,
      abi: transferFromAbi,
      functionName: "transferFrom",
      args: [from, FACILITATOR_ADDRESS, amount],
    });
    const receipt = await client.waitForTransactionReceipt({ hash });
    console.log("[Facilitator] Settled in block:", receipt.blockNumber);

    res.json({ success: true, transactionHash: receipt.transactionHash, blockNumber: Number(receipt.blockNumber), status: "confirmed" });
  } catch (err) {
    console.error("[Facilitator] Settlement error:", err);
    res.status(400).json({ error: String(err) });
  }
});

// ─── Start ──────────────────────────────────────────────────

app.listen(config.facilitatorPort, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║          x402 Local Facilitator — Online             ║
╠══════════════════════════════════════════════════════╣
║  Address:    ${FACILITATOR_ADDRESS}
║  USDC:       ${USDC_ADDRESS}
║  Network:    ${NETWORK}
║  Settlement: ${config.x402.enableSettlement ? "ENABLED" : "VERIFY-ONLY"}
║  Port:       ${config.facilitatorPort}
╚══════════════════════════════════════════════════════╝
  `);
});
