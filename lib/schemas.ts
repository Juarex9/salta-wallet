import { z } from 'zod'

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
})

// Payment Schemas
export const paymentSchema = z.object({
  amount: z.number().positive('El monto debe ser positivo'),
  currency: z.enum(['USD', 'ARS', 'BRL', 'CLP']),
  description: z.string().min(1).max(200),
  paymentMethod: z.enum(['MERCADOPAGO', 'BLOCKCHAIN', 'CARD']),
  walletId: z.string().uuid().optional(),
})

export const transactionSchema = z.object({
  fromWalletId: z.string().uuid(),
  toAddress: z.string().min(1),
  amount: z.number().positive(),
  gasPrice: z.number().positive().optional(),
  chainId: z.number().optional(),
})

// Wallet Schemas
export const walletSchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().min(1),
  chainId: z.number(),
  type: z.enum(['PERSONAL', 'BUSINESS']),
})

export const binanceCredentialsSchema = z.object({
  apiKey: z.string().min(1),
  apiSecret: z.string().min(1),
  nickname: z.string().min(1).max(100),
})

// AI Agent Schemas
export const paymentRecommendationSchema = z.object({
  amount: z.number().positive(),
  currency: z.string(),
  country: z.string(),
  paymentFrequency: z.enum(['ONE_TIME', 'RECURRING', 'INSTANT']),
  userPreferences: z.object({
    prefersFastTransactions: z.boolean(),
    prefersLowFees: z.boolean(),
    prefersDecentralized: z.boolean(),
    prefersTraditional: z.boolean(),
  }),
})

// Type exports for TypeScript
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type PaymentInput = z.infer<typeof paymentSchema>
export type TransactionInput = z.infer<typeof transactionSchema>
export type WalletInput = z.infer<typeof walletSchema>
export type BinanceCredentialsInput = z.infer<typeof binanceCredentialsSchema>
export type PaymentRecommendationInput = z.infer<typeof paymentRecommendationSchema>
