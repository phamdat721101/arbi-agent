/**
 * server.ts
 *
 * ArbiAgent as a SELLER — exposes x402-gated endpoints.
 * Any caller (human or bot) must pay $0.001 USDC per request.
 * Payment settles on Arbitrum via x402 facilitator.
 */

import express from "express";
import { paymentMiddlewareFromHTTPServer, x402HTTPResourceServer, x402ResourceServer } from "@x402/express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import type { Network } from "@x402/core/types";
import { config } from "./config";
import { runAgent } from "./agent";
import { fetchPaidData } from "./client";

export async function createServer() {
  const app = express();
  app.set("trust proxy", true);
  app.use(express.json());

  // CORS — allow dashboard to fetch from the agent
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
  });

  // ─── Public Routes (always available, no payment required) ────

  const spendLog: { time: string; target: string; amount: string; service: string; status: string }[] = [];

  app.get("/", async (_req, res) => {
    const { getUsdcBalance } = await import("./wallet");
    const { getArbitrumStats } = await import("./arbitrum");

    const [balance, stats] = await Promise.all([
      getUsdcBalance(),
      getArbitrumStats(),
    ]);

    res.json({
      name: "ArbiAgent",
      description: "Autonomous AI agent selling DeFi data via x402 on Arbitrum",
      wallet: config.wallet.address,
      usdcBalance: balance,
      network: stats.network,
      blockNumber: stats.blockNumber,
      endpoints: {
        "GET /yield": `${config.x402.pricePerCall} USDC — AI yield summary`,
        "GET /pools": `${config.x402.pricePerCall} USDC — Top pool data`,
      },
      x402Facilitator: config.x402.facilitatorUrl,
    });
  });

  app.get("/buy/:endpoint", async (req, res) => {
    const { endpoint } = req.params;
    if (!["yield", "pools"].includes(endpoint)) {
      return res.status(404).json({ error: "Unknown endpoint" });
    }
    try {
      const data = await fetchPaidData(`http://localhost:${config.port}/${endpoint}`);
      spendLog.push({ time: new Date().toISOString(), target: `/${endpoint}`, amount: "0.001", service: "ArbiAgent", status: "confirmed" });
      res.json(data);
    } catch (err) {
      spendLog.push({ time: new Date().toISOString(), target: `/${endpoint}`, amount: "0.001", service: "ArbiAgent", status: "failed" });
      res.status(500).json({ error: "Buy failed", detail: String(err) });
    }
  });

  app.get("/spend", (_req, res) => {
    const confirmed = spendLog.filter((e) => e.status === "confirmed");
    const totalSpent = confirmed.length * 0.001;
    const services = new Set(confirmed.map((e) => e.target)).size;
    res.json({
      totalSpent: `$${totalSpent.toFixed(3)}`,
      servicesUsed: services,
      avgCost: confirmed.length ? `$${(totalSpent / confirmed.length).toFixed(3)}` : "$0.000",
      entries: spendLog.slice().reverse(),
    });
  });

  // ─── x402 Payment Setup (non-fatal) ──────────────────────────

  const networkId = (
    config.isTestnet ? config.network.testnet : config.network.mainnet
  ) as Network;

  const facilitatorClient = new HTTPFacilitatorClient({
    url: config.x402.facilitatorUrl,
  });

  const evmScheme = new ExactEvmScheme().registerMoneyParser(
    async (amount, network) => {
      if (network !== config.network.testnet) return null;
      const tokenAmount = Math.round(amount * 1_000_000).toString();
      return { amount: tokenAmount, asset: config.usdc.testnet, extra: { name: "TestUSDC", version: "1" } };
    }
  );
  const resourceServer = new x402ResourceServer(facilitatorClient).register(
    networkId,
    evmScheme
  );

  const routes = {
    "GET /yield": {
      accepts: {
        scheme: "exact",
        payTo: config.wallet.address,
        price: config.x402.pricePerCall,
        network: networkId,
      },
      description: "Get AI-summarized Uniswap v3 yield data on Arbitrum",
      mimeType: "application/json",
    },
    "GET /pools": {
      accepts: {
        scheme: "exact",
        payTo: config.wallet.address,
        price: config.x402.pricePerCall,
        network: networkId,
      },
      description: "Get top liquidity pool data on Arbitrum",
      mimeType: "application/json",
    },
  };

  let x402Ready = false;
  const httpServer = new x402HTTPResourceServer(resourceServer, routes);
  for (let i = 0; i < 5; i++) {
    try {
      await httpServer.initialize();
      x402Ready = true;
      break;
    } catch (err) {
      if (i === 4) {
        console.warn("[x402] Facilitator not reachable after 5 retries — paid routes will return 503");
      } else {
        console.log(`[x402] Waiting for facilitator... (${i + 1}/5)`);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

  if (x402Ready) {
    app.use(paymentMiddlewareFromHTTPServer(httpServer, undefined, undefined, false));
  }

  // ─── Paid Routes (require x402) ──────────────────────────────

  app.get("/yield", async (req, res) => {
    if (!x402Ready) return res.status(503).json({ error: "x402 payment system unavailable" });
    try {
      const result = await runAgent({
        endpoint: "/yield",
        params: req.query as Record<string, string>,
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Agent error", detail: String(err) });
    }
  });

  app.get("/pools", async (req, res) => {
    if (!x402Ready) return res.status(503).json({ error: "x402 payment system unavailable" });
    try {
      const result = await runAgent({
        endpoint: "/pools",
        params: req.query as Record<string, string>,
      });
      res.json({ pools: result.data.pools, timestamp: result.timestamp });
    } catch (err) {
      res.status(500).json({ error: "Agent error", detail: String(err) });
    }
  });

  return app;
}
