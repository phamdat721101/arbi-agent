"use client";

import { useState } from "react";
import type { PoolData } from "@/lib/api";

interface PoolTableProps {
  pools: PoolData[];
}

type SortKey = "token0" | "feeTier" | "tvlUSD" | "volumeUSD24h" | "apr";

export default function PoolTable({ pools }: PoolTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("tvlUSD");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...pools].sort((a, b) => {
    const aVal = parseFloat(a[sortKey].replace(/[^0-9.-]/g, "")) || 0;
    const bVal = parseFloat(b[sortKey].replace(/[^0-9.-]/g, "")) || 0;
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const header = (key: SortKey, label: string) => (
    <th
      className="text-left px-4 py-3 text-xs text-[#8B949E] cursor-pointer hover:text-[#E6EDF3] transition-colors"
      onClick={() => handleSort(key)}
    >
      {label} {sortKey === key ? (sortAsc ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-[#21262D]">
          <tr>
            {header("token0", "Pair")}
            {header("feeTier", "Fee Tier")}
            {header("tvlUSD", "TVL")}
            {header("volumeUSD24h", "24h Volume")}
            {header("apr", "APR")}
          </tr>
        </thead>
        <tbody>
          {sorted.map((pool) => (
            <tr
              key={pool.id}
              className="border-b border-[#21262D] hover:bg-[#161B22] transition-colors"
            >
              <td className="px-4 py-3 text-sm font-medium text-[#E6EDF3]">
                {pool.token0}/{pool.token1}
              </td>
              <td className="px-4 py-3 text-sm text-[#8B949E]">
                {pool.feeTier}
              </td>
              <td className="px-4 py-3 text-sm font-mono text-[#E6EDF3]">
                {pool.tvlUSD}
              </td>
              <td className="px-4 py-3 text-sm font-mono text-[#E6EDF3]">
                {pool.volumeUSD24h}
              </td>
              <td className="px-4 py-3 text-sm font-mono text-[#238636] font-bold">
                {pool.apr}
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-[#8B949E]">
                No pool data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
