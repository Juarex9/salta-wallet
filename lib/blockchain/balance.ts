import { createPublicClient, http } from 'viem'
import { getChain, CHAINS, type ChainConfig } from './providers'

// ERC-20 ABI minimal - only balanceOf
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

// Simple ETH balance check (no contract needed)
async function getNativeBalance(client: any, address: string): Promise<bigint> {
  try {
    return await client.getBalance({ address })
  } catch {
    return 0n
  }
}

// Get ERC-20 token balance
async function getTokenBalance(
  client: any,
  tokenAddress: string,
  walletAddress: string
): Promise<bigint> {
  try {
    return await client.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [walletAddress as `0x${string}`],
    })
  } catch {
    return 0n
  }
}

// Common token addresses (mainnets)
const TOKEN_ADDRESSES: Record<string, Record<string, string>> = {
  ethereum: {
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0E3606Eb448',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  bsc: {
    USDT: '0x55d39818f06C09bA80FB8E019c7e7E9DbA2140B',
    USDC: '0x8AC76a51cc950d7552Cc5a5ac66c092ba25D3Ea',
    BNB: '0x0000000000000000000000000000000000000000', // native
  },
  polygon: {
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa54174',
    MATIC: '0x0000000000000000000000000000000000000000',
  },
}

// Token decimals
const TOKEN_DECIMALS: Record<string, number> = {
  USDT: 6, // different!
  USDC: 6,
  WETH: 18,
  ETH: 18,
  BNB: 18,
  MATIC: 18,
  WBTC: 8,
}

export interface BalanceResult {
  balance: string
  balanceUsd: number
  currency: string
  network: string
}

export async function getWalletBalance(
  network: string,
  address: string,
  currency: string = 'ETH'
): Promise<BalanceResult> {
  const chain = getChain(network)
  if (!chain) {
    return { balance: '0', balanceUsd: 0, currency, network }
  }

  const client = createPublicClient({
    chain: {
      id: chain.chainId,
      name: chain.name,
      nativeCurrency: chain.nativeCurrency,
      rpc: [http(chain.rpc)],
    },
    transport: http(chain.rpc),
  })

  // Check if it's native currency or token
  const tokenAddr = TOKEN_ADDRESSES[network]?.[currency]
  let balance: bigint

  if (tokenAddr && tokenAddr !== '0x0000000000000000000000000000000000000000') {
    // It's a token
    balance = await getTokenBalance(client, tokenAddr, address)
  } else {
    // Native currency (ETH, BNB, MATIC, etc.)
    balance = await getNativeBalance(client, address as `0x${string}`)
  }

  // Convert to human readable
  const decimals = TOKEN_DECIMALS[currency] || 18
  const balanceStr = (Number(balance) / Math.pow(10, decimals)).toFixed(decimals === 6 ? 2 : 6)

  return {
    balance: balanceStr,
    balanceUsd: 0, // TODO: add price feed
    currency,
    network,
  }
}

// Batch fetch balances for multiple wallets
export async function getMultipleWalletsBalances(
  wallets: Array<{ network: string; address: string; currency: string }>
): Promise<BalanceResult[]> {
  const results = await Promise.all(
    wallets.map(w => getWalletBalance(w.network, w.address, w.currency))
  )
  return results
}

// Get supported tokens list
export function getSupportedTokens(): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  for (const [network, tokens] of Object.entries(TOKEN_ADDRESSES)) {
    result[network] = ['native', ...Object.keys(tokens)]
  }
  return result
}