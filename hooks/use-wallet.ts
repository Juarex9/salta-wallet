import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'

interface Transaction {
  id: string
  amount: number
  currency: string
  method: string
  status: string
  description?: string
  createdAt: string
}

interface Wallet {
  id: string
  address?: string
  type: 'FIAT' | 'CRYPTO'
  currency: string
  balance: number
  network?: string
}

interface BalanceData {
  totalBalance: number
  currency: string
  lastUpdated: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useBalance() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/wallet/balance',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  )

  return {
    balance: data?.totalBalance || 0,
    currency: data?.currency || 'ARS',
    lastUpdated: data?.lastUpdated,
    loading: isLoading,
    error,
    refetch: mutate,
  }
}

export function useWallets() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/wallet/wallets',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
    }
  )

  return {
    wallets: (data?.wallets as Wallet[]) || [],
    loading: isLoading,
    error,
    refetch: mutate,
  }
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/transactions")
      const data = await res.json()
      setTransactions(data.transactions || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return { transactions, loading, error, refetch: fetchTransactions }
}

