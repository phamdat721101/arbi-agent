"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "⌂" },
  { href: "/pools", label: "Pool Data", icon: "◎" },
  { href: "/earn", label: "Earnings", icon: "$" },
  { href: "/spend", label: "Spending", icon: "→" },
  { href: "/api-console", label: "API Console", icon: ">" },
  { href: "/config", label: "Setup", icon: "⚙" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen border-r border-[#21262D] bg-[#0D1117] p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[#E6EDF3]">ArbiAgent</h1>
        <p className="text-xs text-[#8B949E] mt-1">x402 on Arbitrum</p>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-[#161B22] text-[#12AAFF] font-medium"
                  : "text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]"
              }`}
            >
              <span className="font-mono text-base w-5 text-center">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-[#21262D]">
        <p className="text-xs text-[#8B949E]">Arbitrum Sepolia</p>
      </div>
    </aside>
  );
}
