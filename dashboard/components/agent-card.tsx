"use client";

import { useEffect, useState } from "react";
import { fetchAgent, type AgentIdentity } from "@/lib/api";

export default function AgentCard() {
  const [agent, setAgent] = useState<AgentIdentity | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAgent();
        setAgent(data);
      } catch {
        setError("Cannot connect to agent");
      }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="bg-[#161B22] border border-[#F85149] rounded-lg p-6">
        <p className="text-[#F85149]">{error}</p>
        <p className="text-xs text-[#8B949E] mt-1">
          Make sure the agent is running on port 4021
        </p>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-[#21262D] rounded w-48 mb-4" />
        <div className="h-4 bg-[#21262D] rounded w-96" />
      </div>
    );
  }

  return (
    <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <h2 className="text-xl font-bold text-[#E6EDF3]">{agent.name}</h2>
        </div>
        <span className="flex items-center gap-2 text-sm text-[#238636]">
          <span className="w-2 h-2 rounded-full bg-[#238636] animate-pulse" />
          ONLINE
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-[#8B949E]">Wallet</p>
          <p className="font-mono text-[#E6EDF3] truncate">{agent.wallet}</p>
        </div>
        <div>
          <p className="text-[#8B949E]">USDC Balance</p>
          <p className="font-mono text-[#238636] font-bold">
            {agent.usdcBalance} USDC
          </p>
        </div>
        <div>
          <p className="text-[#8B949E]">Network</p>
          <p className="text-[#E6EDF3]">{agent.network}</p>
        </div>
        <div>
          <p className="text-[#8B949E]">Block</p>
          <p className="font-mono text-[#E6EDF3]">{agent.blockNumber}</p>
        </div>
      </div>
    </div>
  );
}
