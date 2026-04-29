// Coingecko API for crypto prices
// Free tier: 10-30 calls/minute

const COINGECKO_API = "https://api.coingecko.com/api/v3"

// Map our supported tokens to CoinGecko IDs
const TOKEN_TO_COINGECKO: Record<string, string> = {
  ethereum: "ethereum",
  bsc: "binancecoin",
  polygon: "matic-network",
  arbitrum: "arbitrum",
  optimism: "optimism",
  avalanche: "avalanche-2",
}

const TOKEN_PRICES: Record<string, string> = {
  ETH: "ethereum",
  BNB: "binancecoin",
  MATIC: "matic-network",
  USDT: "tether",
  USDC: "usd-coin",
  WBTC: "wrapped-bitcoin",
  WETH: "weth",
}

export interface PriceResponse {
  [id: string]: {
    ars: number
    usd: number
  }
}

export async function getPrices(
  currencies: string[] = ["USDT", "ETH", "BNB", "MATIC", "USDC", "WBTC", "WETH"]
): Promise<Record<string, { ars: number; usd: number }>> {
  const ids = currencies.map((c) => TOKEN_PRICES[c] || c.toLowerCase()).join(",")
  
  try {
    const res = await fetch(
      `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=ars,usd`,
      { next: { revalidate: 60 } } // Cache for 60 seconds
    )
    
    if (!res.ok) {
      throw new Error("Price fetch failed")
    }
    
    const data: PriceResponse = await res.json()
    
    // Convert back to our format
    const result: Record<string, { ars: number; usd: number }> = {}
    for (const currency of currencies) {
      const cgId = TOKEN_PRICES[currency] || currency.toLowerCase()
      if (data[cgId]) {
        result[currency] = {
          ars: data[cgId].ars,
          usd: data[cgId].usd,
        }
      } else {
        result[currency] = { ars: 0, usd: 0 }
      }
    }
    
    return result
  } catch (error) {
    console.error("Price feed error:", error)
    return {}
  }
}

// Get single price
export async function getPrice(currency: string): Promise<{ ars: number; usd: number }> {
  const prices = await getPrices([currency])
  return prices[currency] || { ars: 0, usd: 0 }
}