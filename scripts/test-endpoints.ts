/**
 * test-endpoints.ts
 *
 * Automated test that verifies all ArbiAgent endpoints.
 * Run: npm run test:endpoints (requires agent running on port 4021)
 */

const BASE_URL = process.env.API_URL || "http://localhost:4021";

const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(green(`  PASS `) + name);
    passed++;
  } catch (err: any) {
    console.log(red(`  FAIL `) + name);
    console.log(red(`       ${err.message}`));
    failed++;
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log("");
  console.log(cyan("╔══════════════════════════════════════════╗"));
  console.log(cyan("║     ArbiAgent — Endpoint Tests           ║"));
  console.log(cyan("╚══════════════════════════════════════════╝"));
  console.log("");

  // Test 1: Health endpoint (GET /)
  await test("GET / → 200 with agent identity", async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);

    const data = (await res.json()) as any;
    assert(data.name === "ArbiAgent", `Expected name=ArbiAgent, got ${data.name}`);
    assert(typeof data.wallet === "string", "Missing wallet address");
    assert(typeof data.usdcBalance === "string", "Missing USDC balance");
    assert(typeof data.network === "string", "Missing network");
    assert(typeof data.blockNumber === "string", "Missing block number");
    assert(data.endpoints !== undefined, "Missing endpoints");
    console.log(yellow(`       Wallet: ${data.wallet}`));
    console.log(yellow(`       USDC:   ${data.usdcBalance}`));
    console.log(yellow(`       Network: ${data.network}`));
  });

  // Test 2: Yield endpoint (GET /yield) — should return 402
  await test("GET /yield → 402 Payment Required", async () => {
    const res = await fetch(`${BASE_URL}/yield`);
    assert(res.status === 402, `Expected 402, got ${res.status}`);

    const body = (await res.json()) as any;
    console.log(yellow(`       x402 response received`));

    // Check that response contains payment requirements
    const hasPaymentInfo =
      body.x402Version !== undefined ||
      body.accepts !== undefined ||
      body.paymentRequirements !== undefined;
    assert(hasPaymentInfo, "Missing x402 payment info in 402 response");
  });

  // Test 3: Pools endpoint (GET /pools) — should return 402
  await test("GET /pools → 402 Payment Required", async () => {
    const res = await fetch(`${BASE_URL}/pools`);
    assert(res.status === 402, `Expected 402, got ${res.status}`);
    console.log(yellow(`       x402 response received`));
  });

  // Summary
  console.log("");
  console.log("─────────────────────────────────────────");
  console.log(`  Results: ${green(`${passed} passed`)}, ${failed > 0 ? red(`${failed} failed`) : `${failed} failed`}`);
  console.log("─────────────────────────────────────────");
  console.log("");

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(red(`\n  Connection failed: ${err.message}`));
  console.error(yellow("  Make sure ArbiAgent is running: npm start"));
  process.exit(1);
});
