import hre from "hardhat";
import { writeFileSync, readFileSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const TestUSDC = await hre.ethers.getContractFactory("TestUSDC");
  const usdc = await TestUSDC.deploy();
  await usdc.waitForDeployment();

  const address = await usdc.getAddress();
  console.log(`TestUSDC deployed to: ${address}`);

  const outDir = path.join(__dirname, "..", "out");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    path.join(outDir, "addresses.json"),
    JSON.stringify({ usdc: address }, null, 2)
  );
  console.log("Address written to out/addresses.json");

  // Auto-update .env
  const envPath = path.join(__dirname, "..", ".env");
  let env = readFileSync(envPath, "utf8");
  env = env.replace(/^MOCK_USDC_ADDRESS=.*$/m, `MOCK_USDC_ADDRESS=${address}`);
  writeFileSync(envPath, env);
  console.log(`Updated .env: MOCK_USDC_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
