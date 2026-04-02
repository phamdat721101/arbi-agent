/**
 * agent.ts
 *
 * The AI reasoning layer. Given a user query,
 * the LLM decides what data to fetch and composes a response.
 *
 * This is what makes it an "AI agent" rather than just an API.
 */

import OpenAI from "openai";
import { getUniswapPools, getArbitrumStats } from "./arbitrum";
import { getUsdcBalance } from "./wallet";
import { config } from "./config";

const openai = new OpenAI({ apiKey: config.openai.apiKey });

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

export async function runAgent(query: AgentQuery): Promise<AgentResponse> {
  // Step 1: Fetch relevant on-chain data
  const [pools, stats, balance] = await Promise.all([
    getUniswapPools(5),
    getArbitrumStats(),
    getUsdcBalance(),
  ]);

  const rawData = { pools, stats };

  // Step 2: LLM summarizes the data for the caller
  const prompt = `You are an autonomous DeFi agent running on Arbitrum.
A user queried your endpoint: ${query.endpoint}
With params: ${JSON.stringify(query.params)}

Here is the live on-chain data you fetched:
${JSON.stringify(rawData, null, 2)}

Provide a concise, useful 2-3 sentence summary of the most actionable insights.
Focus on: best APR opportunities, notable TVL, any risks.
Be direct and quantitative. No fluff.`;

  const completion = await openai.chat.completions.create({
    model: config.openai.model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200,
    temperature: 0.3,
  });

  return {
    summary: completion.choices[0].message.content || "No summary available",
    data: rawData,
    agentWallet: config.wallet.address,
    usdcBalance: balance,
    timestamp: new Date().toISOString(),
  };
}
