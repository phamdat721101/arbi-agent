"use client";

import { useState } from "react";
import CodeSnippet from "@/components/code-snippet";
import { API_URL } from "@/lib/api";

export default function ApiConsolePage() {
  const [endpoint, setEndpoint] = useState("/yield");
  const [params, setParams] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const sendRequest = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const url = `${API_URL}${endpoint}${params ? `?${params}` : ""}`;
      const res = await fetch(url);
      setStatus(res.status);
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setStatus(0);
      setResponse(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const snippetTabs = [
    {
      label: "curl",
      language: "bash",
      code: `# Step 1: See payment requirement
curl ${API_URL}${endpoint}

# Response: HTTP 402 with x402 payment requirements

# Step 2: Use test-client.ts for automated payment
npx tsx test-client.ts`,
    },
    {
      label: "Node.js",
      language: "typescript",
      code: `import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { ExactEvmScheme, toClientEvmSigner } from "@x402/evm";
import { privateKeyToAccount } from "viem/accounts";
import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";

const account = privateKeyToAccount("0x...");
const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http("https://sepolia-rollup.arbitrum.io/rpc"),
});
const signer = toClientEvmSigner(account, publicClient);
const client = new x402Client()
  .register("eip155:421614", new ExactEvmScheme(signer));
const x402Fetch = wrapFetchWithPayment(fetch, client);

const res = await x402Fetch("${API_URL}${endpoint}");
const data = await res.json();
console.log(data);`,
    },
    {
      label: "Python",
      language: "python",
      code: `import requests

# Step 1: See payment requirements
response = requests.get("${API_URL}${endpoint}")
print(f"Status: {response.status_code}")
print(response.json())

# Note: x402 payment signing requires the x402 Python SDK
# or manual EIP-712 signature construction`,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <h2 className="text-xl font-bold text-[#E6EDF3]">API Console</h2>
      <p className="text-sm text-[#8B949E]">
        Test endpoints and copy integration code
      </p>

      {/* Interactive Tester */}
      <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-4">
        <h3 className="text-sm font-medium text-[#E6EDF3] mb-4">
          Interactive API Tester
        </h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-[#0D1117] border border-[#21262D] rounded px-3 py-2">
              <span className="text-xs text-[#238636] font-mono font-bold">
                GET
              </span>
            </div>
            <select
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="bg-[#0D1117] border border-[#21262D] rounded px-3 py-2 text-sm text-[#E6EDF3] font-mono"
            >
              <option value="/">/</option>
              <option value="/yield">/yield</option>
              <option value="/pools">/pools</option>
            </select>
            <input
              type="text"
              value={params}
              onChange={(e) => setParams(e.target.value)}
              placeholder="pool=ETH-USDC"
              className="flex-1 bg-[#0D1117] border border-[#21262D] rounded px-3 py-2 text-sm text-[#E6EDF3] font-mono placeholder-[#8B949E]"
            />
            <button
              onClick={sendRequest}
              disabled={loading}
              className="px-4 py-2 bg-[#12AAFF] text-white text-sm rounded hover:bg-[#0E8AD6] transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>

        {/* Response */}
        {response && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-[#8B949E]">Response</span>
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded ${
                  status === 200
                    ? "bg-[#238636]/20 text-[#238636]"
                    : status === 402
                      ? "bg-[#D29922]/20 text-[#D29922]"
                      : "bg-[#F85149]/20 text-[#F85149]"
                }`}
              >
                {status}
              </span>
            </div>
            <pre className="bg-[#0D1117] border border-[#21262D] rounded p-4 text-xs font-mono text-[#E6EDF3] overflow-auto max-h-64">
              {response}
            </pre>
          </div>
        )}
      </div>

      {/* Code Snippets */}
      <div>
        <h3 className="text-sm font-medium text-[#E6EDF3] mb-3">
          Integration Code
        </h3>
        <CodeSnippet tabs={snippetTabs} />
      </div>
    </div>
  );
}
