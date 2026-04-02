"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/stats-card";
import { API_URL } from "@/lib/api";

interface SpendEntry {
  time: string;
  target: string;
  amount: string;
  service: string;
  status: string;
}

interface SpendData {
  totalSpent: string;
  servicesUsed: number;
  avgCost: string;
  entries: SpendEntry[];
}

export default function SpendPage() {
  const [data, setData] = useState<SpendData | null>(null);

  useEffect(() => {
    const load = () => fetch(`${API_URL}/spend`).then((r) => r.json()).then(setData).catch(() => {});
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 max-w-6xl">
      <h2 className="text-xl font-bold text-[#E6EDF3]">Spending</h2>
      <p className="text-sm text-[#8B949E]">
        What the agent autonomously spent on upstream data services.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Total Spent" value={data?.totalSpent || "$0.000"} icon="→" color="#F85149" />
        <StatsCard label="Services Used" value={`${data?.servicesUsed || 0}`} icon="◎" color="#12AAFF" />
        <StatsCard label="Avg Cost/Request" value={data?.avgCost || "$0.000"} icon="~" color="#8B949E" />
      </div>

      <div className="bg-[#161B22] border border-[#21262D] rounded-lg">
        <div className="p-4 border-b border-[#21262D]">
          <h3 className="text-sm font-medium text-[#E6EDF3]">Spend Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#21262D]">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-[#8B949E]">Time</th>
                <th className="text-left px-4 py-3 text-xs text-[#8B949E]">Target</th>
                <th className="text-left px-4 py-3 text-xs text-[#8B949E]">Amount</th>
                <th className="text-left px-4 py-3 text-xs text-[#8B949E]">Service</th>
                <th className="text-left px-4 py-3 text-xs text-[#8B949E]">Status</th>
              </tr>
            </thead>
            <tbody>
              {(!data || data.entries.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#8B949E]">
                    <p className="text-2xl mb-2">🛒</p>
                    <p>No outgoing payments yet</p>
                    <p className="text-xs mt-1">When the agent pays other x402 services, transactions appear here</p>
                  </td>
                </tr>
              )}
              {data?.entries.map((e, i) => (
                <tr key={i} className="border-b border-[#21262D] hover:bg-[#0D1117]">
                  <td className="px-4 py-3 text-xs text-[#8B949E] font-mono">{new Date(e.time).toLocaleTimeString()}</td>
                  <td className="px-4 py-3 text-xs font-mono text-[#E6EDF3]">{e.target}</td>
                  <td className="px-4 py-3 text-xs font-mono text-[#F85149]">-${e.amount} USDC</td>
                  <td className="px-4 py-3 text-xs text-[#E6EDF3]">{e.service}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className={e.status === "confirmed" ? "text-[#238636]" : "text-[#F85149]"}>{e.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
