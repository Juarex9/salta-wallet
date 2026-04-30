# Testing Guide - Salta Wallet Improvements

## Testing Local

### 1. Test de Autenticación (bcrypt + Zod)

```bash
# Terminal 1: Correr servidor
npm run dev

# Terminal 2: Test de registro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'

# Response esperado:
{
  "user": {
    "id": "user-id-123",
    "email": "test@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

### 2. Test de Validación Zod

```bash
# Test con contraseña muy corta (debería fallar)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "short"
  }'

# Response esperado (400):
{
  "error": "Validación fallida",
  "details": [
    {
      "code": "too_small",
      "minimum": 8,
      "type": "string",
      "path": ["password"]
    }
  ]
}
```

### 3. Test de Rate Limiting

```bash
# Script para probar rate limiting
for i in {1..101}; do
  echo "Request $i"
  curl -X GET http://localhost:3000/api/binance/balance \
    -H "Authorization: Bearer test-token" \
    -w "\nStatus: %{http_code}\n"
  
  # Request 101 debería retornar 429
done
```

### 4. Test de SWR (Client-side)

```typescript
// En una página/componente
import { useBalance } from '@/hooks/use-api'

export function TestSWR() {
  const { balance, isLoading, error } = useBalance('wallet-id-123')

  if (isLoading) return <p>Cargando...</p>
  if (error) return <p>Error: {error.message}</p>

  return <p>Balance: {balance?.total} USDT</p>
}

// Deberías ver:
// 1. "Cargando..." mientras fetcha
// 2. Balance mostrado después
// 3. Auto-refetch cada 30 segundos
// 4. Deduplicación si abres otra pestaña
```

### 5. Test del Agente IA

```bash
# Necesita JWT token válido
TOKEN="eyJhbGciOiJIUzI1NiIs..." # Obtener de login

curl -X POST http://localhost:3000/api/agent/recommend \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'

# Response esperado (200):
{
  "success": true,
  "recommendation": {
    "recommendedMethod": "MERCADOPAGO",
    "reasoning": "...",
    "pros": ["...", "..."],
    "cons": ["...", "..."],
    "estimatedFee": 14.50,
    "estimatedTime": "1-2 días hábiles",
    "confidence": 0.92
  },
  "timestamp": "2024-04-28T10:30:00Z"
}
```

### 6. Test de Binance API

```bash
# Conectar Binance credentials en .env.local
BINANCE_API_KEY=test-key-testnet
BINANCE_API_SECRET=test-secret-testnet
BINANCE_TESTNET=true

# Test obtener balance
TOKEN="tu_jwt_token"

curl -X GET http://localhost:3000/api/binance/balance \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Response esperado:
{
  "balance": [
    {
      "asset": "BNB",
      "free": "1.5",
      "locked": "0"
    },
    {
      "asset": "USDT",
      "free": "100.00",
      "locked": "0"
    }
  ]
}
```

---

## Integration Tests

### Test de Flujo Completo (E2E)

```typescript
// test/e2e/payment-flow.test.ts
import { describe, it, expect } from '@jest/globals'

describe('Payment Flow', () => {
  it('should recommend payment method', async () => {
    // 1. Registrar usuario
    const registerRes = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@e2e.com',
        password: 'TestPass123',
        confirmPassword: 'TestPass123'
      })
    })
    
    const { token } = await registerRes.json()
    expect(registerRes.status).toBe(200)
    expect(token).toBeDefined()

    // 2. Solicitar recomendación de pago
    const recommendRes = await fetch('/api/agent/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: 500,
        currency: 'USD',
        country: 'AR',
        paymentFrequency: 'ONE_TIME',
        userPreferences: {
          prefersFastTransactions: true,
          prefersLowFees: true,
          prefersDecentralized: false,
          prefersTraditional: true
        }
      })
    })

    const recommendation = await recommendRes.json()
    expect(recommendRes.status).toBe(200)
    expect(recommendation.recommendation.recommendedMethod).toBeDefined()
    expect(recommendation.recommendation.confidence).toBeGreaterThan(0)
  })
})
```

---

## Performance Tests

### Medir tiempo de respuesta

```bash
# Test 1: Login performance
time curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "SecurePass123"}'

# Debería estar < 200ms

# Test 2: Recomendación de pago
TOKEN="..." # Obtener token

time curl -X POST http://localhost:3000/api/agent/recommend \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Debería estar < 2 segundos (incluye latencia IA)
```

### Load testing con wrk

```bash
# Instalar wrk
brew install wrk  # macOS
apt-get install wrk  # Linux

# Test 100 conexiones concurrentes, 30 segundos
wrk -t12 -c100 -d30s \
  -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/wallets

# Output esperado:
# Requests/sec: > 100
# Latency avg: < 50ms
```

---

## Security Tests

### 1. Test inyección SQL (debería fallar)

```bash
# Intentar SQL injection
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin\"--\"; DROP TABLE users; --",
    "password": "anything"
  }'

# Debería rechazar (Zod validation falla)
# Response: "email" must be valid
```

### 2. Test contraseña insegura

```bash
# Verificar que bcrypt hace la contraseña impredecible
# Mismo password, diferentes hashes cada vez

# Registro 1
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test1@example.com", "password": "SamePassword123"}'

# Registro 2
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test2@example.com", "password": "SamePassword123"}'

# En DB: Los hashes son diferentes
# ✓ Correcto: bcrypt incluye salt único
```

### 3. Test Token Expiration

```bash
# Token debería expirar en 7 días
const token = await createToken('user-id', 'email@example.com')

// Esperar 7 días... (o simular)
const payload = await verifyToken(token)
expect(payload).toBeNull() // Expirado

// ✓ Correcto
```

### 4. Test Rate Limiting (anti-brute-force)

```bash
# Intentar 101 requests en 15 minutos
for i in {1..110}; do
  curl -X GET http://localhost:3000/api/auth/me \
    -H "Authorization: Bearer token" \
    -w "\n%{http_code}\n"
done

# Requests 1-100: 200/401 (OK o unauthorized)
# Request 101+: 429 (Too Many Requests)

# ✓ Correcto
```

---

## Validation Tests

### Test Zod Schemas

```typescript
// test/lib/schemas.test.ts
import { loginSchema, paymentSchema } from '@/lib/schemas'

describe('Validation Schemas', () => {
  it('should validate login', () => {
    const valid = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'SecurePass123'
    })
    expect(valid.success).toBe(true)

    const invalid = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'short'
    })
    expect(invalid.success).toBe(false)
  })

  it('should validate payment', () => {
    const valid = paymentSchema.safeParse({
      amount: 500,
      currency: 'USD',
      description: 'Test payment',
      paymentMethod: 'MERCADOPAGO'
    })
    expect(valid.success).toBe(true)

    const invalid = paymentSchema.safeParse({
      amount: -100,  // Negativo
      currency: 'INVALID'
    })
    expect(invalid.success).toBe(false)
  })
})
```

---

## Checklist de QA

Antes de deploy a producción:

### Seguridad
- [ ] Contraseñas hash con bcrypt
- [ ] Rate limiting activo
- [ ] Validación Zod en todas las rutas
- [ ] JWT tokens no hardcodeados
- [ ] HTTPS habilitado
- [ ] CORS configurado correctamente
- [ ] Secrets en env vars, no en código

### Performance
- [ ] SWR deduplicando requests
- [ ] Cache con refresh intervals apropiados
- [ ] Response times < 200ms (auth)
- [ ] Response times < 2s (IA)
- [ ] Binance API requests < 1s

### Confiabilidad
- [ ] Error handling en todos los endpoints
- [ ] Logging configurado
- [ ] Retry logic en blockchain calls
- [ ] Fallback methods si falla uno
- [ ] Database backups automáticos

### Monitoreo
- [ ] Sentry conectado
- [ ] Alertas configuradas
- [ ] Logs centralizados
- [ ] Métricas de negocio rastreadas
- [ ] Health checks en Vercel

### Datos
- [ ] Migrations de DB ejecutadas
- [ ] Seeds de prueba creados
- [ ] Backups pre-deploy
- [ ] RLS policies en Supabase
- [ ] Indexes en queries frecuentes

---

## Debugging Tips

### Ver logs en desarrollo

```bash
# Activar debug mode
DEBUG=salta:* npm run dev

# Ver logs específicos
DEBUG=salta:auth npm run dev
DEBUG=salta:api npm run dev
```

### Inspeccionar requests/responses

```bash
# Instalar http client tool
npm install -D @http/client

# Test con logging detallado
curl -v -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Verificar tokens JWT

```typescript
// Decodificar JWT (sin verificar firma - solo inspeccionar)
import { jwtDecode } from 'jwt-decode'

const token = 'eyJhbGciOiJIUzI1NiIs...'
const decoded = jwtDecode(token)
console.log(decoded)

// Output:
// {
//   userId: "...",
//   email: "...",
//   iat: 1234567890,
//   exp: 1234567890
// }
```

### Verificar Binance connection

```bash
# Test sin autenticación (datos públicos)
curl https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT

# Debería retornar precio BTC actual
```

---

## CI/CD Testing

### GitHub Actions workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run build
```

