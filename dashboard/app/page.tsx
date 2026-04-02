"use client";

import { useEffect, useState } from "react";
import AgentCard from "@/components/agent-card";
import StatsCard from "@/components/stats-card";
import ActivityFeed from "@/components/activity-feed";
import { fetchAgent, type AgentIdentity, API_URL } from "@/lib/api";

export default function Home() {
  const [agent, setAgent] = useState<AgentIdentity | null>(null);

  useEffect(() => {
    fetchAgent().then(setAgent).catch(() => {});
    const interval = setInterval(() => {
      fetchAgent().then(setAgent).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 max-w-6xl">
      <AgentCard />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          label="USDC Balance"
          value={agent ? `${agent.usdcBalance} USDC` : "..."}
          icon="$"
          color="#238636"
        />
        <StatsCard
          label="Network"
          value={agent?.network || "..."}
          icon="◎"
          color="#12AAFF"
        />
        <StatsCard
          label="Current Block"
          value={agent?.blockNumber || "..."}
          icon="#"
          color="#E6EDF3"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <ActivityFeed />

        {/* Endpoint Status */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[#E6EDF3]">
            Protected Endpoints
          </h3>
          {["yield", "pools"].map((endpoint) => (
            <div
              key={endpoint}
              className="bg-[#161B22] border border-[#21262D] rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-[#E6EDF3]">
                  GET /{endpoint}
                </span>
                <span className="flex items-center gap-1 text-xs text-[#238636]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#238636]" />
                  LIVE
                </span>
              </div>
              <p className="text-xs text-[#8B949E] mb-3">
                Price: $0.001 USDC per request
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    window.open(`${API_URL}/${endpoint}`, "_blank")
                  }
                  className="text-xs px-3 py-1.5 bg-[#12AAFF] text-white rounded hover:bg-[#0E8AD6] transition-colors"
                >
                  Try it
                </button>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `curl ${API_URL}/${endpoint}`
                    )
                  }
                  className="text-xs px-3 py-1.5 border border-[#21262D] text-[#8B949E] rounded hover:text-[#E6EDF3] transition-colors"
                >
                  Copy curl
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
