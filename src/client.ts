/**
 * client.ts
 *
 * ArbiAgent as a BUYER — autonomously pays x402 endpoints.
 * This is used when the agent needs to query OTHER x402 services.
 *
 * Example: agent pays an external price oracle, a gas tracker,
 * or another ArbiAgent instance for data.
 */

import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrum, arbitrumSepolia } from "viem/chains";
import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import type { Network } from "@x402/core/types";
import { ExactEvmScheme, toClientEvmSigner } from "@x402/evm";
import { config } from "./config";

const account = privateKeyToAccount(config.wallet.privateKey);
const chain = config.isTestnet ? arbitrumSepolia : arbitrum;
const rpcUrl = config.isTestnet ? config.rpc.testnet : config.rpc.mainnet;

const publicClient = createPublicClient({
  chain,
  transport: http(rpcUrl),
});

// Compose a ClientEvmSigner from account + publicClient
const signer = toClientEvmSigner(account, publicClient);

// Network ID in CAIP-2 format
const networkId = (
  config.isTestnet ? config.network.testnet : config.network.mainnet
) as Network;

// x402 client — registers EVM scheme with the agent's wallet as signer
const client = new x402Client().register(
  networkId,
  new ExactEvmScheme(signer)
);

/**
 * x402Fetch — drop-in replacement for fetch()
 * Automatically handles 402 responses:
 * 1. Receives 402 from server
 * 2. Reads payment requirements
 * 3. Signs EIP-712 authorization with agent wallet
 * 4. Retries request with X-PAYMENT header
 * All of this happens autonomously without human input.
 */
export const x402Fetch = wrapFetchWithPayment(fetch, client);

/**
 * Fetch data from an x402-protected endpoint, paying automatically.
 */
export async function fetchPaidData(url: string): Promise<any> {
  try {
    console.log(`[BUYER] Requesting: ${url}`);
    const response = await x402Fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    console.log(`[BUYER] Paid and received data from: ${url}`);
    return data;
  } catch (err) {
    console.error(`[BUYER] Payment or request failed:`, err);
    throw err;
  }
}
