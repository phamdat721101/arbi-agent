"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/stats-card";
import { fetchAgent } from "@/lib/api";

interface Transaction {
  id: number;
  time: string;
  caller: string;
  amount: string;
  endpoint: string;
  txHash: string;
}

export default function EarnPage() {
  const [balance, setBalance] = useState("0.000000");
  const [transactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchAgent()
      .then((data) => setBalance(data.usdcBalance))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-6xl">
      <h2 className="text-xl font-bold text-[#E6EDF3]">Earnings</h2>
      <p className="text-sm text-[#8B949E]">
        Full transparency on agent earning history. On-chain verifiable.
      </p>

      {/* Earnings Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          label="Current Balance"
          value={`${balance} USDC`}
          icon="$"
          color="#238636"
        />
        <StatsCard
          label="Total Requests"
          value={`${transactions.length}`}
          icon="↗"
          color="#12AAFF"
        />
        <StatsCard
          label="Price per Call"
          value="$0.001"
          icon="◎"
          color="#E6EDF3"
        />
      </div>

      {/* Earnings Chart Placeholder */}
      <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-6">
        <h3 className="text-sm font-medium text-[#E6EDF3] mb-4">
          Cumulative Earnings (Last 24h)
        </h3>
        <div className="h-48 flex items-center justify-center text-[#8B949E] text-sm">
          <div className="text-center">
            <p className="text-4xl mb-2">📈</p>
            <p>Earnings chart will populate as payments are received</p>
            <p className="text-xs mt-1">Each x402 payment is recorded on-chain</p>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-[#161B22] border border-[#21262D] rounded-lg">
        <div className="p-4 border-b border-[#21262D]">
          <h3 className="text-sm font-medium text-[#E6EDF3]">
            Transaction History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[#21262D]">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-[#8B949E]">
                  Time
                </th>
                <th className="text-left px-4 py-3 text-xs text-[#8B949E]">
                  Caller
                </th>
                <th className="text-left px-4 py-3 text-xs text-[#8B949E]">
                  Amount
                </th>
                <th className="text-left px-4 py-3 text-xs text-[#8B949E]">
                  Endpoint
                </th>
                <th className="text-left px-4 py-3 text-xs text-[#8B949E]">
                  Tx Hash
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-[#8B949E]"
                  >
                    No transactions yet. Earnings will appear here after paid
                    requests.
                  </td>
                </tr>
              )}
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-[#21262D] hover:bg-[#0D1117]"
                >
                  <td className="px-4 py-3 text-xs text-[#8B949E] font-mono">
                    {tx.time}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-[#E6EDF3] truncate max-w-32">
                    {tx.caller}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-[#238636]">
                    +{tx.amount} USDC
                  </td>
                  <td className="px-4 py-3 text-xs text-[#E6EDF3]">
                    {tx.endpoint}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono">
                    <a
                      href={`https://sepolia.arbiscan.io/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#12AAFF] hover:underline"
                    >
                      {tx.txHash.slice(0, 10)}...
                    </a>
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
