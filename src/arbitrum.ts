/**
 * arbitrum.ts
 *
 * Fetches real on-chain data from Arbitrum:
 * - Uniswap v3 pool data via The Graph
 * - Arbitrum block and gas stats
 *
 * This is the VALUE the agent sells via x402.
 */

import { createPublicClient, http } from "viem";
import { arbitrum, arbitrumSepolia } from "viem/chains";
import { config } from "./config";

const publicClient = createPublicClient({
  chain: config.isTestnet ? arbitrumSepolia : arbitrum,
  transport: http(config.isTestnet ? config.rpc.testnet : config.rpc.mainnet),
});

// Uniswap v3 subgraph on Arbitrum
const UNISWAP_SUBGRAPH =
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3-arbitrum";

export interface PoolData {
  id: string;
  token0: string;
  token1: string;
  feeTier: string;
  tvlUSD: string;
  volumeUSD24h: string;
  apr: string;
}

// Fetch top pools from Uniswap v3 on Arbitrum
export async function getUniswapPools(limit = 5): Promise<PoolData[]> {
  const query = `{
    pools(
      first: ${limit}
      orderBy: totalValueLockedUSD
      orderDirection: desc
      where: { totalValueLockedUSD_gt: "100000" }
    ) {
      id
      token0 { symbol }
      token1 { symbol }
      feeTier
      totalValueLockedUSD
      volumeUSD
      poolDayData(first: 1, orderBy: date, orderDirection: desc) {
        volumeUSD
        feesUSD
      }
    }
  }`;

  try {
    const res = await fetch(UNISWAP_SUBGRAPH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const { data } = (await res.json()) as any;

    return data.pools.map((p: any) => {
      const dailyFees = parseFloat(p.poolDayData[0]?.feesUSD || "0");
      const tvl = parseFloat(p.totalValueLockedUSD);
      const apr = tvl > 0 ? ((dailyFees * 365) / tvl) * 100 : 0;

      return {
        id: p.id,
        token0: p.token0.symbol,
        token1: p.token1.symbol,
        feeTier: `${parseInt(p.feeTier) / 10000}%`,
        tvlUSD: `$${(tvl / 1_000_000).toFixed(2)}M`,
        volumeUSD24h: `$${(parseFloat(p.poolDayData[0]?.volumeUSD || "0") / 1_000_000).toFixed(2)}M`,
        apr: `${apr.toFixed(2)}%`,
      };
    });
  } catch (err) {
    console.error("Uniswap subgraph error:", err);
    return [];
  }
}

// Get current block and gas info from Arbitrum
export async function getArbitrumStats() {
  const block = await publicClient.getBlock();
  const gasPrice = await publicClient.getGasPrice();

  return {
    blockNumber: block.number.toString(),
    timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
    gasPrice: `${(Number(gasPrice) / 1e9).toFixed(4)} gwei`,
    network: config.isTestnet ? "Arbitrum Sepolia" : "Arbitrum One",
  };
}
