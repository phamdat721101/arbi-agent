/**
 * agent.ts
 *
 * The AI reasoning layer using Claude via AWS Bedrock.
 */

import { getUniswapPools, getArbitrumStats } from "./arbitrum";
import { getUsdcBalance } from "./wallet";
import { config } from "./config";

export interface AgentQuery {
  endpoint: string;
  params: Record<string, string>;
}

export interface AgentResponse {
  summary: string;
  data: any;
  agentWallet: string;
  usdcBalance: string;
  timestamp: string;
}

async function callClaude(prompt: string): Promise<string> {
  const url = `https://bedrock-runtime.${config.bedrock.region}.amazonaws.com/model/${encodeURIComponent(config.bedrock.model)}/converse`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.bedrock.apiKey}`,
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: [{ text: prompt }] }],
      inferenceConfig: { maxTokens: 200, temperature: 0.3 },
    }),
  });
  if (!res.ok) throw new Error(`Bedrock error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.output?.message?.content?.[0]?.text || "No summary available";
}

export async function runAgent(query: AgentQuery): Promise<AgentResponse> {
  const [pools, stats, balance] = await Promise.all([
    getUniswapPools(5),
    getArbitrumStats(),
    getUsdcBalance(),
  ]);

  const rawData = { pools, stats };

  const prompt = `You are an autonomous DeFi agent running on Arbitrum.
A user queried your endpoint: ${query.endpoint}
With params: ${JSON.stringify(query.params)}

Here is the live on-chain data you fetched:
${JSON.stringify(rawData, null, 2)}

Provide a concise, useful 2-3 sentence summary of the most actionable insights.
Focus on: best APR opportunities, notable TVL, any risks.
Be direct and quantitative. No fluff.`;

  const summary = await callClaude(prompt);

  return {
    summary,
    data: rawData,
    agentWallet: config.wallet.address,
    usdcBalance: balance,
    timestamp: new Date().toISOString(),
  };
}
