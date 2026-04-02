"use client";

import { useEffect, useState } from "react";

interface ActivityItem {
  id: number;
  type: "earn" | "fetch" | "ai" | "error";
  message: string;
  detail: string;
  time: string;
}

const typeColors = {
  earn: "#238636",
  fetch: "#12AAFF",
  ai: "#D29922",
  error: "#F85149",
};

const typeLabels = {
  earn: "Payment",
  fetch: "Data fetch",
  ai: "AI process",
  error: "Error",
};

export default function ActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([]);

  // Populate initial item on client mount (avoids hydration mismatch)
  useEffect(() => {
    setItems([
      {
        id: 1,
        type: "ai",
        message: "Agent started",
        detail: "ArbiAgent online",
        time: new Date().toLocaleTimeString(),
      },
    ]);
  }, []);

  // Poll for activity by checking agent endpoint
  useEffect(() => {
    let id = 2;
    const poll = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4021"}/`
        );
        if (res.ok) {
          const data = await res.json();
          setItems((prev) => [
            {
              id: id++,
              type: "fetch",
              message: "Health check",
              detail: `Block ${data.blockNumber}`,
              time: new Date().toLocaleTimeString(),
            },
            ...prev.slice(0, 19),
          ]);
        }
      } catch {
        // Agent not reachable
      }
    };
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-4 h-80 overflow-y-auto">
      <h3 className="text-sm font-medium text-[#E6EDF3] mb-3">
        Live Activity
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-2 text-xs">
            <span
              className="w-2 h-2 rounded-full mt-1 shrink-0"
              style={{ backgroundColor: typeColors[item.type] }}
            />
            <span className="text-[#8B949E] font-mono shrink-0">
              {item.time}
            </span>
            <span style={{ color: typeColors[item.type] }}>
              {typeLabels[item.type]}
            </span>
            <span className="text-[#E6EDF3] truncate">{item.message}</span>
            <span className="text-[#8B949E] truncate">{item.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
