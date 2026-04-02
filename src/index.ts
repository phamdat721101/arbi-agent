/**
 * index.ts — ArbiAgent entry point
 *
 * Starts the x402 server, logs agent identity.
 */

import { createServer } from "./server";
import { agentAddress, getUsdcBalance } from "./wallet";
import { getArbitrumStats } from "./arbitrum";
import { config } from "./config";

async function main() {
  const app = createServer();

  app.listen(config.port, async () => {
    const [balance, stats] = await Promise.all([
      getUsdcBalance(),
      getArbitrumStats(),
    ]);

    console.log(`
╔══════════════════════════════════════════════════════╗
║              ArbiAgent — Online                      ║
╠══════════════════════════════════════════════════════╣
║  Wallet:  ${agentAddress}
║  USDC:    ${balance} USDC
║  Network: ${stats.network}
║  Block:   ${stats.blockNumber}
║  Port:    ${config.port}
╠══════════════════════════════════════════════════════╣
║  Endpoints (require $0.001 USDC via x402):           ║
║    GET http://localhost:${config.port}/yield              ║
║    GET http://localhost:${config.port}/pools              ║
║  Public:                                              ║
║    GET http://localhost:${config.port}/           (free)  ║
╚══════════════════════════════════════════════════════╝
    `);
  });
}

main().catch(console.error);
