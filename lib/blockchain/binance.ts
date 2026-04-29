import * as crypto from 'crypto'
import { BlockchainError, logger } from './errors'

export interface BinanceConfig {
  apiKey: string
  apiSecret: string
  baseUrl?: string
  testnet?: boolean
}

export interface BinanceBalance {
  asset: string
  free: string
  locked: string
}

export interface BinancePrice {
  symbol: string
  price: string
}

export interface BinanceOrder {
  orderId: number
  symbol: string
  side: 'BUY' | 'SELL'
  price: string
  origQty: string
  executedQty: string
  status: string
  timeInForce: string
  type: string
  time: number
  updateTime: number
}

export interface BinanceTransaction {
  coin: string
  address: string
  addressTag?: string
  txId: string
  amount: string
  confirmNo: number
  insertTime: number
  status: number
  txKey?: string
  id?: string
}

export class BinanceClient {
  private apiKey: string
  private apiSecret: string
  private baseUrl: string
  private testnet: boolean

  constructor(config: BinanceConfig) {
    this.apiKey = config.apiKey
    this.apiSecret = config.apiSecret
    this.testnet = config.testnet || false
    this.baseUrl = config.baseUrl || (this.testnet
      ? 'https://testnet.binance.vision'
      : 'https://api.binance.com'
    )
  }

  /**
   * Generar firma HMAC SHA256 para solicitudes autenticadas
   */
  private generateSignature(params: Record<string, string | number>): string {
    const queryString = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&')

    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(queryString)
      .digest('hex')
  }

  /**
   * Realizar solicitud a API de Binance
   */
  private async request<T>(
    method: string,
    endpoint: string,
    params?: Record<string, string | number>,
    authenticated: boolean = false
  ): Promise<T> {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`)

      if (authenticated && params) {
        const timestamp = Date.now()
        params.timestamp = timestamp
        const signature = this.generateSignature(params as Record<string, string | number>)
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value))
        })
        url.searchParams.append('signature', signature)
      } else if (params && method === 'GET') {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value))
        })
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (authenticated) {
        headers['X-MBX-APIKEY'] = this.apiKey
      }

      const response = await fetch(url.toString(), {
        method,
        headers,
        body: params && method !== 'GET' ? JSON.stringify(params) : undefined,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new BlockchainError(`Binance API error: ${errorData.msg || response.statusText}`, {
          status: response.status,
          data: errorData,
        })
      }

      return response.json()
    } catch (error) {
      logger.error('Binance request failed', error instanceof Error ? error : undefined)
      throw error
    }
  }

  /**
   * Obtener balances de la cuenta
   */
  async getBalance(): Promise<BinanceBalance[]> {
    const response = await this.request<any>(
      'GET',
      '/api/v3/account',
      {},
      true
    )

    return response.balances.filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
  }

  /**
   * Obtener precios actuales
   */
  async getPrices(symbols?: string[]): Promise<Record<string, string>> {
    const response = await this.request<BinancePrice[]>(
      'GET',
      '/api/v3/ticker/price',
      {}
    )

    const prices: Record<string, string> = {}
    response.forEach((item) => {
      if (!symbols || symbols.includes(item.symbol)) {
        prices[item.symbol] = item.price
      }
    })

    return prices
  }

  /**
   * Obtener órdenes recientes
   */
  async getOrders(symbol: string, limit: number = 10): Promise<BinanceOrder[]> {
    return this.request<BinanceOrder[]>(
      'GET',
      '/api/v3/allOrders',
      {
        symbol,
        limit,
      },
      true
    )
  }

  /**
   * Crear orden de mercado
   */
  async createMarketOrder(
    symbol: string,
    side: 'BUY' | 'SELL',
    quantity: number
  ): Promise<BinanceOrder> {
    return this.request<BinanceOrder>(
      'POST',
      '/api/v3/order',
      {
        symbol,
        side,
        type: 'MARKET',
        quantity,
      },
      true
    )
  }

  /**
   * Crear orden limitada
   */
  async createLimitOrder(
    symbol: string,
    side: 'BUY' | 'SELL',
    quantity: number,
    price: number
  ): Promise<BinanceOrder> {
    return this.request<BinanceOrder>(
      'POST',
      '/api/v3/order',
      {
        symbol,
        side,
        type: 'LIMIT',
        timeInForce: 'GTC',
        quantity,
        price,
      },
      true
    )
  }

  /**
   * Obtener transacciones de depósito
   */
  async getDepositHistory(coin?: string): Promise<BinanceTransaction[]> {
    const params: Record<string, string | number> = {}
    if (coin) params.coin = coin

    return this.request<BinanceTransaction[]>(
      'GET',
      '/sapi/v1/capital/deposit/hisrec',
      params,
      true
    )
  }

  /**
   * Obtener transacciones de retiro
   */
  async getWithdrawHistory(coin?: string): Promise<BinanceTransaction[]> {
    const params: Record<string, string | number> = {}
    if (coin) params.coin = coin

    return this.request<BinanceTransaction[]>(
      'GET',
      '/sapi/v1/capital/withdraw/history',
      params,
      true
    )
  }

  /**
   * Solicitar retiro de fondos
   */
  async withdraw(
    coin: string,
    address: string,
    amount: number,
    network?: string
  ): Promise<{ id: string }> {
    const params: Record<string, string | number> = {
      coin,
      address,
      amount,
    }
    if (network) params.network = network

    return this.request<{ id: string }>(
      'POST',
      '/sapi/v1/capital/withdraw/apply',
      params,
      true
    )
  }
}

/**
 * Crear cliente Binance desde variables de entorno
 */
export function createBinanceClient(): BinanceClient | null {
  if (!process.env.BINANCE_API_KEY || !process.env.BINANCE_API_SECRET) {
    logger.warn('Binance credentials not configured')
    return null
  }

  return new BinanceClient({
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
    testnet: process.env.BINANCE_TESTNET === 'true',
  })
}
