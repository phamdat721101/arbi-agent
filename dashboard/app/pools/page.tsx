"use client";

import { useEffect, useState } from "react";
import PoolTable from "@/components/pool-table";
import { fetchAgent, type AgentIdentity, type PoolData, API_URL } from "@/lib/api";

export default function PoolsPage() {
  const [agent, setAgent] = useState<AgentIdentity | null>(null);
  const [pools, setPools] = useState<PoolData[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const agentData = await fetchAgent();
        setAgent(agentData);

        // Try fetching pools (will get 402 without payment, that's expected)
        const res = await fetch(`${API_URL}/pools`);
        if (res.status === 200) {
          const data = await res.json();
          setPools(data.pools || []);
        }
      } catch {
        // Agent not reachable
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl">
      <h2 className="text-xl font-bold text-[#E6EDF3]">Pool Data</h2>
      <p className="text-sm text-[#8B949E]">
        Live Uniswap v3 Arbitrum pool data with AI summary
      </p>

      {/* AI Summary Banner */}
      {summary && (
        <div className="bg-[#161B22] border border-[#12AAFF] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span>🧠</span>
            <span className="text-sm font-medium text-[#E6EDF3]">
              AI Agent Summary
            </span>
          </div>
          <p className="text-sm text-[#8B949E]">{summary}</p>
        </div>
      )}

      {/* Payment Notice */}
      {pools.length === 0 && !loading && (
        <div className="bg-[#161B22] border border-[#D29922] rounded-lg p-4">
          <p className="text-sm text-[#D29922] mb-2">
            Payment required to access pool data
          </p>
          <p className="text-xs text-[#8B949E]">
            The GET /pools endpoint requires $0.001 USDC via x402 protocol. Use
            the API Console or test-client.ts to make a paid request.
          </p>
        </div>
      )}

      {/* Pool Table */}
      <div className="bg-[#161B22] border border-[#21262D] rounded-lg">
        {loading ? (
          <div className="p-8 text-center text-[#8B949E]">
            Loading pool data...
          </div>
        ) : (
          <PoolTable pools={pools} />
        )}
      </div>
    </div>
  );
}
