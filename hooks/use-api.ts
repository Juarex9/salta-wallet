import useSWR from 'swr'
import { logger } from '@/lib/errors'

// Fetcher global con manejo de errores
export const fetcher = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = new Error('API error')
      ;(error as any).status = response.status
      ;(error as any).data = await response.json()
      throw error
    }

    return response.json()
  } catch (error) {
    logger.error('Fetch error', error instanceof Error ? error : undefined)
    throw error
  }
}

// Hook personalizado para datos de usuario
export function useUser() {
  const { data, error, isLoading, mutate } = useSWR('/api/auth/me', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // 1 minuto
  })

  return {
    user: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}

// Hook para datos de billetera
export function useWallet(walletId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    walletId ? `/api/wallets/${walletId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 segundos
    }
  )

  return {
    wallet: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}

// Hook para balance
export function useBalance(walletId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    walletId ? `/api/balance/${walletId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 5000, // Actualizar cada 5 segundos
    }
  )

  return {
    balance: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}

// Hook para transacciones
export function useTransactions(walletId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    walletId ? `/api/transactions?walletId=${walletId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10 segundos
    }
  )

  return {
    transactions: data?.transactions || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}

// Hook para precios de criptomonedas
export function usePrices() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/prices',
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 30000, // Actualizar cada 30 segundos
      dedupingInterval: 10000,
    }
  )

  return {
    prices: data?.prices || {},
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}

// Hook para recomendaciones de pago del agente IA
export function usePaymentRecommendation(amount: number, currency: string) {
  const { data, error, isLoading, mutate } = useSWR(
    amount && currency ? `/api/agent/recommend?amount=${amount}&currency=${currency}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    recommendation: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}
