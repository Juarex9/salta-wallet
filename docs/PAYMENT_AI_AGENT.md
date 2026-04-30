# Agente IA para Recomendaciones de Pago

## Descripción General

El agente IA analiza el contexto de transacción del usuario y recomienda el mejor método de pago entre:
- **MercadoPago**: Sistema tradicional de pagos digitales
- **Blockchain**: Transacciones directas en redes descentralizadas
- **Binance**: Exchange de criptomonedas con tasas competitivas

## Arquitectura

```
┌─────────────────────────────────────────┐
│  Cliente (aplicación front-end)         │
└──────────────────┬──────────────────────┘
                   │
        POST /api/agent/recommend
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Route Handler: app/api/agent/recommend │
│  - Valida entrada                       │
│  - Autentica usuario                    │
│  - Rate limiting                        │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Agente IA (ToolLoopAgent)              │
│  - Modelo: GPT-4o-mini                  │
│  - Herramientas disponibles:            │
│    • getMercadopagoFee                   │
│    • getBinanceInfo                      │
│    • getBlockchainInfo                   │
│    • analyzeUserPreferences              │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  PaymentRecommendation (respuesta)      │
└─────────────────────────────────────────┘
```

## Flujo de Recomendación

1. **Entrada del Usuario**
   - Monto de transacción
   - Moneda/Cryptocurrency
   - País
   - Preferencias (velocidad, comisiones, descentralización)

2. **Análisis del Agente**
   - Obtiene información de tasas de cada método
   - Analiza preferencias del usuario
   - Evalúa factores contextuales

3. **Recomendación Final**
   - Método recomendado
   - Justificación detallada
   - Ventajas y desventajas
   - Comisiones estimadas
   - Tiempo de procesamiento

## Ejemplo de Uso

### Request

```bash
curl -X POST http://localhost:3000/api/agent/recommend \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    "amount": 500,
    "currency": "USD",
    "country": "AR",
    "paymentFrequency": "ONE_TIME",
    "userPreferences": {
      "prefersFastTransactions": true,
      "prefersLowFees": true,
      "prefersDecentralized": false,
      "prefersTraditional": true
    }
  }
```

### Response

```json
{
  "success": true,
  "recommendation": {
    "recommendedMethod": "MERCADOPAGO",
    "reasoning": "Basado en tus preferencias de transacciones rápidas y bajas comisiones, con preferencia por métodos tradicionales, MercadoPago es la mejor opción en Argentina.",
    "pros": [
      "Comisiones competitivas (2.9%)",
      "Procesamiento rápido (1-2 días hábiles)",
      "Soporte local en Argentina",
      "Interfaz familiar para usuarios locales"
    ],
    "cons": [
      "Requiere cuenta bancaria verificada",
      "Límites de transferencia",
      "Comisiones más altas que blockchain"
    ],
    "estimatedFee": 14.50,
    "estimatedTime": "1-2 días hábiles",
    "confidence": 0.92
  },
  "timestamp": "2024-04-28T10:30:00Z"
}
```

## Herramientas Disponibles

### 1. getMercadopagoFee
Obtiene información de tasas y comisiones de MercadoPago según el país y moneda.

**Input:**
- `amount`: número positivo
- `currency`: string (ARS, BRL, CLP, USD, etc.)

**Output:**
- `feePercentage`: porcentaje de comisión
- `feeAmount`: monto de comisión calculado
- `processingTime`: tiempo de procesamiento
- `limits`: límites min/max

### 2. getBinanceInfo
Obtiene información de Binance como tasas de intercambio y tiempos.

**Input:**
- `amount`: número positivo
- `fromCurrency`: string (BTC, ETH, USDT, etc.)
- `toCurrency`: string

**Output:**
- `available`: boolean
- `feePercentage`: porcentaje de comisión
- `feeAmount`: monto de comisión
- `processingTime`: tiempo estimado
- `networkFee`: comisión de red estimada

### 3. getBlockchainInfo
Obtiene información sobre transacciones blockchain en diferentes redes.

**Input:**
- `blockchain`: ETHEREUM | POLYGON | BASE | ARBITRUM
- `amount`: número positivo

**Output:**
- `estimatedGasGwei`: gas en Gwei
- `estimatedGasUSD`: equivalente en USD
- `processingTime`: tiempo de confirmación
- `permanence`: características de la red

### 4. analyzeUserPreferences
Analiza las preferencias del usuario para ponderar la recomendación.

**Input:**
- `prefersFastTransactions`: boolean
- `prefersLowFees`: boolean
- `prefersDecentralized`: boolean
- `prefersTraditional`: boolean
- `country`: string

**Output:**
- `scores`: puntuación para cada método
- `topChoice`: método mejor puntuado
- `analysis`: análisis de preferencias

## Criterios de Recomendación

### MercadoPago
**Se recomienda cuando:**
- Usuario prefiere métodos tradicionales
- Transacciones pequeñas a medianas (<$10,000)
- Usuario está en Latinoamérica
- No requiere transacciones instantáneas
- Prefiere interfaz familiar

**No se recomienda cuando:**
- Usuario prefiere descentralización
- Requiere velocidad extrema
- Busca mínimas comisiones

### Blockchain Directo
**Se recomienda cuando:**
- Usuario prefiere descentralización
- Moneda es stablecoin (USDT, USDC)
- Transacciones de alto monto (>$10,000)
- Usuario tiene experiencia con crypto
- Requiere anonimato/privacidad

**No se recomienda cuando:**
- Usuario es novato en crypto
- Requiere soporte inmediato
- Prefiere métodos familiares

### Binance
**Se recomienda cuando:**
- Usuario busca tasas muy bajas
- Requiere velocidad (transacciones rápidas)
- Necesita exchange o conversión
- Transacciones medianas a grandes
- Usuario tiene cuenta en Binance

## Integración con Frontend

### Hook personalizado (hooks/use-payment-recommendation.ts)

```typescript
import { usePaymentRecommendation } from '@/hooks/use-api'

export function PaymentRecommendationWidget() {
  const [amount, setAmount] = useState(100)
  const [currency, setCurrency] = useState('USD')
  
  const { recommendation, isLoading, error } = usePaymentRecommendation(
    amount,
    currency
  )

  if (isLoading) return <div>Analizando opciones...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h2>Se recomienda: {recommendation?.recommendedMethod}</h2>
      <p>{recommendation?.reasoning}</p>
      <div className="pros-cons">
        <ul>
          {recommendation?.pros.map(pro => <li key={pro}>{pro}</li>)}
        </ul>
      </div>
    </div>
  )
}
```

## Variables de Entorno Requeridas

```env
# Autenticación
JWT_SECRET=tu_secreto_jwt_aqui

# OpenAI/AI Gateway
OPENAI_API_KEY=tu_key_aqui

# Binance (Opcional)
BINANCE_API_KEY=tu_key_aqui
BINANCE_API_SECRET=tu_secret_aqui
BINANCE_TESTNET=false

# MercadoPago (Opcional)
MERCADOPAGO_ACCESS_TOKEN=tu_token_aqui
```

## Rate Limiting

El agente tiene límites de tasa de solicitudes:
- Máximo 30 solicitudes por ventana (15 minutos)
- Responde con `429 Too Many Requests` si se excede

## Manejo de Errores

```json
{
  "error": "Descripción del error",
  "statusCode": 400|401|429|500,
  "context": {
    "field": "detalles del error"
  }
}
```

## Mejoras Futuras

1. **Historial de transacciones**: Analizar patrones de uso del usuario
2. **ML prediction**: Mejorar recomendaciones basado en histórico
3. **Multi-moneda**: Soporte para más monedas y métodos
4. **Webhooks**: Notificaciones cuando cambian tasas o montos
5. **A/B Testing**: Validar que las recomendaciones mejoran conversión
6. **Cache distribuido**: Redis para tasas de exchanges
7. **Fallback automático**: Si un método falla, sugerir alternativa
