import { tool, ToolLoopAgent, Output } from 'ai'
import { z } from 'zod'
import { createBinanceClient } from './blockchain/binance'
import { logger } from './errors'

// Esquema de recomendación
export const paymentRecommendationSchema = z.object({
  recommendedMethod: z.enum(['MERCADOPAGO', 'BLOCKCHAIN', 'BINANCE']),
  reasoning: z.string(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  estimatedFee: z.number(),
  estimatedTime: z.string(),
  confidence: z.number().min(0).max(1),
})

export type PaymentRecommendation = z.infer<typeof paymentRecommendationSchema>

// Herramientas para el agente
export const paymentTools = {
  // Obtener tasa de comisión de MercadoPago
  getMercadopagoFee: tool({
    description: 'Obtiene la tasa de comisión y tiempo de procesamiento de MercadoPago',
    inputSchema: z.object({
      amount: z.number().positive(),
      currency: z.string(),
    }),
    execute: async ({ amount, currency }) => {
      // Las tasas varían según el país y tipo de cuenta
      const fees: Record<string, number> = {
        ARS: 0.029, // 2.9%
        BRL: 0.039, // 3.9%
        CLP: 0.029, // 2.9%
        USD: 0.024, // 2.4%
      }

      const feePercentage = fees[currency] || 0.035
      const feeAmount = amount * feePercentage

      return {
        feePercentage: (feePercentage * 100).toFixed(2) + '%',
        feeAmount: feeAmount.toFixed(2),
        processingTime: '1-2 días hábiles',
        limits: {
          min: 1,
          max: 100000,
        },
      }
    },
  }),

  // Obtener información de Binance
  getBinanceInfo: tool({
    description: 'Obtiene información de tasas y tiempos de Binance',
    inputSchema: z.object({
      amount: z.number().positive(),
      fromCurrency: z.string(),
      toCurrency: z.string(),
    }),
    execute: async ({ amount, fromCurrency, toCurrency }) => {
      try {
        const binance = createBinanceClient()
        if (!binance) {
          return {
            available: false,
            reason: 'Binance no configurado',
          }
        }

        // Tasas de Binance varían según volumen
        const baseFee = 0.001 // 0.1%
        const feeAmount = amount * baseFee

        return {
          available: true,
          feePercentage: (baseFee * 100).toFixed(4) + '%',
          feeAmount: feeAmount.toFixed(6),
          processingTime: '5-30 minutos',
          pair: `${fromCurrency}${toCurrency}`,
          networkFee: '0.0005 - 0.002 BNB',
        }
      } catch (error) {
        logger.error('Error getting Binance info', error instanceof Error ? error : undefined)
        return {
          available: false,
          reason: 'Error al obtener información de Binance',
        }
      }
    },
  }),

  // Obtener información de blockchain genérica
  getBlockchainInfo: tool({
    description: 'Obtiene información sobre transacciones blockchain (gas fees, tiempo)',
    inputSchema: z.object({
      blockchain: z.enum(['ETHEREUM', 'POLYGON', 'BASE', 'ARBITRUM']),
      amount: z.number().positive(),
    }),
    execute: async ({ blockchain, amount }) => {
      const gasPrices: Record<string, { gwei: number; processingTime: string }> = {
        ETHEREUM: {
          gwei: 50,
          processingTime: '5-15 minutos',
        },
        POLYGON: {
          gwei: 50,
          processingTime: '2-5 minutos',
        },
        BASE: {
          gwei: 0.1,
          processingTime: '2-5 minutos',
        },
        ARBITRUM: {
          gwei: 0.5,
          processingTime: '2-5 minutos',
        },
      }

      const gas = gasPrices[blockchain] || { gwei: 50, processingTime: '5-15 minutos' }
      const estimatedGasCost = (gas.gwei * 21000) / 1e9 // Aproximado para transferencia simple

      return {
        blockchain,
        estimatedGasGwei: gas.gwei.toFixed(2),
        estimatedGasUSD: estimatedGasCost.toFixed(4),
        processingTime: gas.processingTime,
        permanence: 'Permanente e irreversible',
        decentralization: 'Totalmente descentralizado',
      }
    },
  }),

  // Analizar preferencias del usuario
  analyzeUserPreferences: tool({
    description: 'Analiza las preferencias del usuario para hacer una mejor recomendación',
    inputSchema: z.object({
      prefersFastTransactions: z.boolean(),
      prefersLowFees: z.boolean(),
      prefersDecentralized: z.boolean(),
      prefersTraditional: z.boolean(),
      country: z.string(),
    }),
    execute: async ({
      prefersFastTransactions,
      prefersLowFees,
      prefersDecentralized,
      prefersTraditional,
      country,
    }) => {
      const scores = {
        MERCADOPAGO: 0,
        BLOCKCHAIN: 0,
        BINANCE: 0,
      }

      // Puntaje para MercadoPago
      if (prefersTraditional) scores.MERCADOPAGO += 2
      if (!prefersFastTransactions) scores.MERCADOPAGO += 1
      if (!prefersDecentralized) scores.MERCADOPAGO += 1.5
      if (['AR', 'BR', 'CL', 'CO', 'MX'].includes(country)) scores.MERCADOPAGO += 1

      // Puntaje para Blockchain
      if (prefersDecentralized) scores.BLOCKCHAIN += 2.5
      if (prefersFastTransactions) scores.BLOCKCHAIN += 0.5
      if (!prefersLowFees) scores.BLOCKCHAIN += 1

      // Puntaje para Binance
      if (prefersFastTransactions) scores.BINANCE += 2
      if (prefersLowFees) scores.BINANCE += 2
      if (prefersDecentralized) scores.BINANCE += 1.5

      return {
        scores,
        topChoice: Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0],
        analysis: 'Análisis completado basado en preferencias',
      }
    },
  }),
}

// Crear el agente
export function createPaymentRecommendationAgent() {
  return new ToolLoopAgent({
    model: 'openai/gpt-4o-mini',
    instructions: `Eres un experto en sistemas de pago y criptomonedas. Tu rol es recomendar el mejor método de pago 
(MercadoPago, Blockchain directo o Binance) basado en las necesidades específicas del usuario.

Analiza siempre:
1. El monto de la transacción
2. La velocidad requerida
3. Las preferencias del usuario
4. El país del usuario
5. Las comisiones y costos asociados
6. El tiempo de procesamiento

Usa las herramientas disponibles para obtener información actual sobre tasas y tiempos.
Proporciona una recomendación clara con justificación detallada, pros y contras de cada opción.

Sé objetivo y considera todos los factores antes de hacer la recomendación final.`,
    tools: paymentTools,
  })
}

/**
 * Función para obtener recomendación de pago
 */
export async function getPaymentRecommendation(
  amount: number,
  currency: string,
  country: string,
  userPreferences: {
    prefersFastTransactions: boolean
    prefersLowFees: boolean
    prefersDecentralized: boolean
    prefersTraditional: boolean
  }
): Promise<PaymentRecommendation> {
  const agent = createPaymentRecommendationAgent()

  const prompt = `
    Analiza y recomienda el mejor método de pago para:
    - Monto: ${amount} ${currency}
    - País: ${country}
    - Transacciones rápidas: ${userPreferences.prefersFastTransactions ? 'Sí' : 'No'}
    - Comisiones bajas: ${userPreferences.prefersLowFees ? 'Sí' : 'No'}
    - Descentralizado: ${userPreferences.prefersDecentralized ? 'Sí' : 'No'}
    - Tradicional: ${userPreferences.prefersTraditional ? 'Sí' : 'No'}
    
    Proporciona una recomendación en formato JSON con:
    {
      "recommendedMethod": "MERCADOPAGO" | "BLOCKCHAIN" | "BINANCE",
      "reasoning": "explicación clara",
      "pros": ["ventaja1", "ventaja2"],
      "cons": ["desventaja1", "desventaja2"],
      "estimatedFee": número,
      "estimatedTime": "tiempo estimado",
      "confidence": número entre 0 y 1
    }
  `

  try {
    // Ejecutar el agente
    const result = await agent.stream({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Procesar respuesta
    let fullText = ''
    for await (const chunk of result) {
      if (chunk.type === 'text-delta') {
        fullText += chunk.delta
      }
    }

    // Parsear JSON de la respuesta
    const jsonMatch = fullText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const recommendation = JSON.parse(jsonMatch[0])
      return paymentRecommendationSchema.parse(recommendation)
    }

    // Fallback si no se encuentra JSON
    throw new Error('No se pudo generar una recomendación válida')
  } catch (error) {
    logger.error('Error generating payment recommendation', error instanceof Error ? error : undefined)
    // Retornar recomendación por defecto
    return {
      recommendedMethod: 'MERCADOPAGO',
      reasoning: 'Opción por defecto cuando no se puede procesar la solicitud',
      pros: ['Familiar para usuarios latinoamericanos', 'Soporte local'],
      cons: ['Comisiones más altas', 'Menos privacidad'],
      estimatedFee: amount * 0.035,
      estimatedTime: '1-2 días hábiles',
      confidence: 0.3,
    }
  }
}
