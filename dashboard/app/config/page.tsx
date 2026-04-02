"use client";

import { useEffect, useState } from "react";
import { fetchAgent } from "@/lib/api";

interface Step {
  label: string;
  description: string;
  check: () => Promise<boolean>;
}

export default function ConfigPage() {
  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const [checking, setChecking] = useState(false);

  const steps: Step[] = [
    {
      label: "Clone repo & npm install",
      description: "git clone + npm install in the arbi-agent directory",
      check: async () => true, // If they can see this page, it's done
    },
    {
      label: "Add AGENT_PRIVATE_KEY to .env",
      description: "EOA private key for the agent wallet on Arbitrum Sepolia",
      check: async () => {
        try {
          const data = await fetchAgent();
          return data.wallet !== undefined && data.wallet !== "";
        } catch {
          return false;
        }
      },
    },
    {
      label: "Add OPENAI_API_KEY to .env",
      description: "API key for GPT-4o-mini (AI summarization)",
      check: async () => {
        // Can't directly verify, assume set if agent is running
        try {
          await fetchAgent();
          return true;
        } catch {
          return false;
        }
      },
    },
    {
      label: "Fund wallet with USDC",
      description: "Get testnet USDC from faucet.circle.com",
      check: async () => {
        try {
          const data = await fetchAgent();
          return parseFloat(data.usdcBalance) > 0;
        } catch {
          return false;
        }
      },
    },
    {
      label: "Fund wallet with ETH for gas",
      description: "Get testnet ETH from an Arbitrum Sepolia faucet",
      check: async () => true, // Hard to verify programmatically
    },
    {
      label: "npm start — agent online",
      description: "Agent responds at http://localhost:4021",
      check: async () => {
        try {
          const data = await fetchAgent();
          return data.name === "ArbiAgent";
        } catch {
          return false;
        }
      },
    },
  ];

  const runChecks = async () => {
    setChecking(true);
    const results: Record<number, boolean> = {};
    for (let i = 0; i < steps.length; i++) {
      results[i] = await steps[i].check();
    }
    setChecks(results);
    setChecking(false);
  };

  useEffect(() => {
    runChecks();
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-xl font-bold text-[#E6EDF3]">Setup</h2>
      <p className="text-sm text-[#8B949E]">
        Get ArbiAgent running in 6 steps
      </p>

      {/* Onboarding Checklist */}
      <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-medium text-[#E6EDF3]">
            Setup Checklist
          </h3>
          <button
            onClick={runChecks}
            disabled={checking}
            className="text-xs px-3 py-1.5 border border-[#21262D] text-[#8B949E] rounded hover:text-[#E6EDF3] transition-colors"
          >
            {checking ? "Checking..." : "Re-check"}
          </button>
        </div>
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className={`mt-0.5 text-lg ${
                  checks[i] ? "text-[#238636]" : "text-[#8B949E]"
                }`}
              >
                {checks[i] ? "✓" : "○"}
              </span>
              <div>
                <p
                  className={`text-sm ${
                    checks[i] ? "text-[#238636]" : "text-[#E6EDF3]"
                  }`}
                >
                  Step {i + 1}: {step.label}
                </p>
                <p className="text-xs text-[#8B949E] mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-6">
        <h3 className="text-sm font-medium text-[#E6EDF3] mb-4">
          Quick Links
        </h3>
        <div className="space-y-2">
          {[
            {
              label: "USDC Faucet (Arbitrum Sepolia)",
              url: "https://faucet.circle.com/",
            },
            {
              label: "Arbitrum Sepolia Explorer",
              url: "https://sepolia.arbiscan.io",
            },
            { label: "x402 Documentation", url: "https://x402.org" },
            {
              label: "CDP Agentic Wallet Docs",
              url: "https://docs.cdp.coinbase.com/agentic-wallet/welcome",
            },
          ].map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#12AAFF] hover:underline"
            >
              <span>→</span>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
