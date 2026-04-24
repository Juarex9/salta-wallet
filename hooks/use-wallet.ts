"use client"

import { useState, useEffect, useCallback } from "react"
import { balanceApi, walletsApi, agentApi } from "@/lib/auth/api-client"

interface Wallet {
  id: string
  type: string
  network?: string
  address: string
  balance: number
  currency: string
}

interface Balance {
  total: { ars: number; usd: number }
  fiat: Wallet[]
  crypto: Wallet[]
}

interface Recommendation {
  method: "FIAT" | "CRYPTO"
  wallet: Wallet
  reasoning: string
  estimatedFee: string
  estimatedTime: string
}

export function useBalance() {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true)
      const data = await balanceApi.get()
      setBalance(data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  return { balance, loading, error, refetch: fetchBalance }
}

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWallets = useCallback(async () => {
    try {
      setLoading(true)
      const data = await walletsApi.getAll()
      setWallets(data.wallets)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const addWallet = useCallback(async (wallet: {
    type: string
    network?: string
    address: string
    currency?: string
  }) => {
    const data = await walletsApi.add(wallet)
    await fetchWallets()
    return data.wallet
  }, [fetchWallets])

  useEffect(() => {
    fetchWallets()
  }, [fetchWallets])

  return { wallets, loading, error, addWallet, refetch: fetchWallets }
}

export function useAgent() {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getRecommendation = useCallback(async (params: {
    amount: number
    currency: string
    category?: string
    urgency?: string
  }) => {
    try {
      setLoading(true)
      const data = await agentApi.recommend(params)
      setRecommendation(data.recommended)
      setError(null)
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { recommendation, loading, error, getRecommendation }
}