// Supported blockchain networks configuration
export interface ChainConfig {
  name: string
  chainId: number
  rpc: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

export const CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    name: 'Ethereum',
    chainId: 1,
    rpc: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  bsc: {
    name: 'BNB Chain',
    chainId: 56,
    rpc: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  },
  polygon: {
    name: 'Polygon',
    chainId: 137,
    rpc: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  },
  arbitrum: {
    name: 'Arbitrum One',
    chainId: 42161,
    rpc: 'https://arb1.arbitrum.io/rpc',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  optimism: {
    name: 'Optimism',
    chainId: 10,
    rpc: 'https://mainnet.optimism.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  avalanche: {
    name: 'Avalanche',
    chainId: 43114,
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
  },
}

// Get chain by any identifier
export function getChain(chainKey: string): ChainConfig | null {
  return CHAINS[chainKey.toLowerCase()] || null
}

// Get all supported chains
export function getSupportedChains(): ChainConfig[] {
  return Object.values(CHAINS)
}