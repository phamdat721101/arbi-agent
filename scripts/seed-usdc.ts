import hre from "hardhat";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const addressesPath = path.join(__dirname, "..", "out", "addresses.json");
  const { usdc: usdcAddress } = JSON.parse(readFileSync(addressesPath, "utf8"));

  const walletAddress = process.env.AGENT_WALLET_ADDRESS;
  if (!walletAddress) throw new Error("AGENT_WALLET_ADDRESS not set in .env");

  const TestUSDC = await hre.ethers.getContractAt("TestUSDC", usdcAddress);

  // Mint 10,000 USDC (6 decimals)
  const amount = 10_000n * 1_000_000n;
  const tx = await TestUSDC.mint(walletAddress, amount);
  await tx.wait();

  console.log(`Minted 10,000 USDC to ${walletAddress}`);
  console.log(`TestUSDC address: ${usdcAddress}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
