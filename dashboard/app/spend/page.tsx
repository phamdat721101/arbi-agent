"use client";

import StatsCard from "@/components/stats-card";

interface SpendEntry {
  id: number;
  time: string;
  target: string;
  amount: string;
  service: string;
  status: string;
}

export default function SpendPage() {
  const entries: SpendEntry[] = [];

  return (
    <div className="space-y-6 max-w-6xl">
      <h2 className="text-xl font-bold text-[#E6EDF3]">Spending</h2>
      <p className="text-sm text-[#8B949E]">
        What the agent autonomously spent on upstream data services.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Total Spent" value="$0.000" icon="→" color="#F85149" />
        <StatsCard
          label="Services Used"
          value="0"
          icon="◎"
          color="#12AAFF"
        />
        <StatsCard
          label="Avg Cost/Request"
          value="$0.000"
          icon="~"
          color="#8B949E"
        />
      </div>

      <div className="bg-[#161B22] border border-[#21262D] rounded-lg">
        <div className="p-4 border-b border-[#21262D]">
          <h3 className="text-sm font-medium text-[#E6EDF3]">Spend Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#21262D]">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-[#8B949E]">
                  Time
                </th>
                <th className="text-left px-4 py-3 text-xs text-[#8B949E]">
                  Target
                </th>
                <th className="text-left px-4 py-3 text-xs text-[#8B949E]">
                  Amount
                </th>
                <th className="text-left px-4 py-3 text-xs text-[#8B949E]">
                  Service
                </th>
                <th className="text-left px-4 py-3 text-xs text-[#8B949E]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-[#8B949E]"
                  >
                    <div>
                      <p className="text-2xl mb-2">🛒</p>
                      <p>No outgoing payments yet</p>
                      <p className="text-xs mt-1">
                        When the agent pays other x402 services, transactions
                        appear here
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
