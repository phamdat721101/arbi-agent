/**
 * wallet.ts
 *
 * Wallet client for the agent. Uses mock USDC when MOCK_USDC_ADDRESS is set.
 */

import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrum, arbitrumSepolia } from "viem/chains";
import { config } from "./config";

const account = privateKeyToAccount(config.wallet.privateKey);
const chain = config.isTestnet ? arbitrumSepolia : arbitrum;
const rpcUrl = config.isTestnet ? config.rpc.testnet : config.rpc.mainnet;

export const walletClient = createWalletClient({
  account,
  chain,
  transport: http(rpcUrl),
}).extend(publicActions);

export const agentAddress = account.address;

const balanceOfAbi = [{
  name: "balanceOf", type: "function", stateMutability: "view",
  inputs: [{ name: "account", type: "address" }],
  outputs: [{ name: "", type: "uint256" }],
}] as const;

export async function getUsdcBalance(): Promise<string> {
  const usdcAddress = (config.isTestnet ? config.usdc.testnet : config.usdc.mainnet) as `0x${string}`;

  const balance = await walletClient.readContract({
    address: usdcAddress,
    abi: balanceOfAbi,
    functionName: "balanceOf",
    args: [agentAddress],
  });

  return (Number(balance) / 1_000_000).toFixed(6);
}
