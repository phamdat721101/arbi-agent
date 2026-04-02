const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4021";

export async function fetchAgent(): Promise<AgentIdentity> {
  const res = await fetch(`${API_URL}/`, { cache: "no-store" });
  return res.json();
}

export async function fetchYield(): Promise<YieldResponse> {
  const res = await fetch(`${API_URL}/buy/yield`, { cache: "no-store" });
  if (!res.ok) return { status: res.status };
  return { status: 200, data: await res.json() };
}

export async function fetchPools(): Promise<PoolsResponse> {
  const res = await fetch(`${API_URL}/buy/pools`, { cache: "no-store" });
  if (!res.ok) return { status: res.status };
  return { status: 200, data: await res.json() };
}

export interface AgentIdentity {
  name: string;
  description: string;
  wallet: string;
  usdcBalance: string;
  network: string;
  blockNumber: string;
  endpoints: Record<string, string>;
  x402Facilitator: string;
}

export interface YieldResponse {
  status: number;
  data?: {
    summary: string;
    data: { pools: PoolData[]; stats: ArbitrumStats };
    agentWallet: string;
    usdcBalance: string;
    timestamp: string;
  };
  paymentRequired?: any;
}

export interface PoolsResponse {
  status: number;
  data?: { pools: PoolData[]; timestamp: string };
  paymentRequired?: any;
}

export interface PoolData {
  id: string;
  token0: string;
  token1: string;
  feeTier: string;
  tvlUSD: string;
  volumeUSD24h: string;
  apr: string;
}

export interface ArbitrumStats {
  blockNumber: string;
  timestamp: string;
  gasPrice: string;
  network: string;
}

export { API_URL };
