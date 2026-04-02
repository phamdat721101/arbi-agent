/**
 * wallet.ts
 *
 * For hackathon: uses a plain viem wallet client with private key.
 * For production / CDP Agentic Wallet, replace this with:
 *   - @coinbase/cdp-sdk: CdpClient
 *   - docs.cdp.coinbase.com/agentic-wallet/welcome
 *
 * The x402 client only needs: address + signTypedData function.
 * Both approaches expose the same interface.
 */

import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrum, arbitrumSepolia } from "viem/chains";
import { config } from "./config";

const account = privateKeyToAccount(config.wallet.privateKey);
const chain = config.isTestnet ? arbitrumSepolia : arbitrum;
const rpcUrl = config.isTestnet ? config.rpc.testnet : config.rpc.mainnet;

// Wallet client — signs x402 payment headers automatically
export const walletClient = createWalletClient({
  account,
  chain,
  transport: http(rpcUrl),
}).extend(publicActions);

export const agentAddress = account.address;

// Check USDC balance
export async function getUsdcBalance(): Promise<string> {
  const usdcAddress = config.isTestnet
    ? config.usdc.testnet
    : config.usdc.mainnet;

  const balance = await walletClient.readContract({
    address: usdcAddress as `0x${string}`,
    abi: [
      {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
      },
    ],
    functionName: "balanceOf",
    args: [agentAddress],
  });

  // USDC has 6 decimals
  return (Number(balance) / 1_000_000).toFixed(6);
}
