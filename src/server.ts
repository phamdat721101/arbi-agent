/**
 * server.ts
 *
 * ArbiAgent as a SELLER — exposes x402-gated endpoints.
 * Any caller (human or bot) must pay $0.001 USDC per request.
 * Payment settles on Arbitrum via x402 facilitator.
 */

import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import type { Network } from "@x402/core/types";
import { config } from "./config";
import { runAgent } from "./agent";

export function createServer() {
  const app = express();
  app.use(express.json());

  // CORS — allow dashboard to fetch from the agent
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
  });

  // Network ID in CAIP-2 format
  const networkId = (
    config.isTestnet ? config.network.testnet : config.network.mainnet
  ) as Network;

  // x402 Facilitator — handles on-chain settlement verification
  const facilitatorClient = new HTTPFacilitatorClient({
    url: config.x402.facilitatorUrl,
  });

  // Resource server delegates verification to the facilitator
  const resourceServer = new x402ResourceServer(facilitatorClient).register(
    networkId,
    new ExactEvmScheme()
  );

  // Route payment configuration
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

  // x402 payment middleware — wraps protected routes
  app.use(paymentMiddleware(routes, resourceServer, undefined, undefined, false));

  // ─── Routes (only reached after payment verified) ─────────────

  // GET /yield — AI-summarized yield opportunities
  app.get("/yield", async (req, res) => {
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

  // GET /pools — Raw pool data
  app.get("/pools", async (req, res) => {
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

  // ─── Public Routes (no payment required) ──────────────────────

  // Health check — shows agent identity and balance
  app.get("/", async (_req, res) => {
    const { getUsdcBalance } = await import("./wallet");
    const { getArbitrumStats } = await import("./arbitrum");

    const [balance, stats] = await Promise.all([
      getUsdcBalance(),
      getArbitrumStats(),
    ]);

    res.json({
      name: "ArbiAgent",
      description:
        "Autonomous AI agent selling DeFi data via x402 on Arbitrum",
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

  return app;
}
