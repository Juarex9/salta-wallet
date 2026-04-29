# Arquitectura Mejorada - Salta Wallet

## Diagrama General del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    SALTA WALLET - Arquitectura                   │
└─────────────────────────────────────────────────────────────────┘

                          ┌──────────────────┐
                          │  Cliente Web/App │
                          │   (Next.js 16)   │
                          └────────┬─────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
           ┌────────▼────────┐ ┌──▼────────┐ ┌─▼──────────┐
           │  useChat Hook   │ │ useUser   │ │ usePayment │
           │  (AI SDK 6)     │ │ (SWR)     │ │ Recomm(IA)│
           └────────┬────────┘ └──┬────────┘ └─┬──────────┘
                    │              │           │
           ┌────────▼──────────────▼───────────▼──────────┐
           │        API Route Handlers (Next.js App)      │
           └────────┬──────────────┬───────────┬──────────┘
                    │              │           │
        ┌───────────┴──┐ ┌─────────┴───┐ ┌───▼──────────┐
        │              │ │             │ │              │
   ┌────▼────┐    ┌───▼─┴────┐   ┌────▼─┴────┐    ┌──▼────────┐
   │ /auth   │    │ /wallets │   │ /agent    │    │ /binance  │
   ├─────────┤    ├───────────┤   ├───────────┤    ├───────────┤
   │Login    │    │Get balance│   │Recommend  │    │Balance    │
   │Register │    │Send       │   │Payment    │    │Orders     │
   │Verify   │    │History    │   │Method     │    │Withdraw   │
   └────┬────┘    └─────┬─────┘   └─────┬─────┘    └────┬──────┘
        │                │               │              │
        └────────────────┼───────────────┼──────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
   ┌──────▼──────┐ ┌────▼──────┐ ┌─────▼─────┐
   │ Auth Layer  │ │ Validation│ │   Error   │
   ├─────────────┤ ├───────────┤ ├───────────┤
   │JWT (bcrypt) │ │  Zod      │ │ Handler   │
   │Auth0        │ │ Schemas   │ │ Logger    │
   │Unified      │ │           │ │ Sentry    │
   └──────┬──────┘ └─────┬─────┘ └─────┬─────┘
          │              │              │
          └──────────────┼──────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
   ┌──────▼──────┐ ┌────▼───┐    ┌─────▼──────┐
   │   Database  │ │Binance  │    │MercadoPago │
   │             │ │ API     │    │ API        │
   │ Prisma ORM  │ │         │    │            │
   │ PostgreSQL  │ │HMAC Auth│    │REST Client │
   └─────────────┘ └─────────┘    └────────────┘
          │              │              │
   ┌──────▴──────┐ ┌────▴───┐    ┌─────▴──────┐
   │Supabase     │ │Crypto  │    │Pagos Latam │
   │or Neon      │ │Trading │    │Conversión  │
   └─────────────┘ └────────┘    └────────────┘


      ┌────────────────────────────────────┐
      │      AI Payment Agent              │
      │  ┌──────────────────────────────┐  │
      │  │  ToolLoopAgent (GPT-4o-mini) │  │
      │  └───────────────┬──────────────┘  │
      │                  │                  │
      │  ┌───────────────┴────────────┐    │
      │  │                            │    │
      │  ├─ getMercadopagoFee()      │    │
      │  ├─ getBinanceInfo()         │    │
      │  ├─ getBlockchainInfo()      │    │
      │  ├─ analyzeUserPreferences() │    │
      │  │                            │    │
      │  └────────────────────────────┘    │
      │                                    │
      │  Output:                           │
      │  ├─ recommendedMethod              │
      │  ├─ reasoning                      │
      │  ├─ pros/cons                      │
      │  ├─ estimatedFee                   │
      │  ├─ estimatedTime                  │
      │  └─ confidence                     │
      └────────────────────────────────────┘
```

---

## Flujo de Autenticación

```
┌─────────────────────┐
│  Usuario             │
└──────────┬──────────┘
           │
        LOGIN
           │
           ▼
┌─────────────────────────────────────┐
│  POST /api/auth/login               │
│  ├─ Validar email/password (Zod)   │
│  ├─ Buscar usuario en DB            │
│  ├─ Comparar password (bcrypt)      │
│  └─ Generar JWT (7 días)            │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Response                           │
│  ├─ user { id, email }              │
│  └─ token (JWT Bearer)              │
└──────────┬──────────────────────────┘
           │
        STORE TOKEN
           │
           ▼
┌─────────────────────────────────────┐
│  Próximas Solicitudes               │
│  Header: Authorization: Bearer <JWT>│
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Auth Middleware                    │
│  ├─ Extraer token del header        │
│  ├─ Verificar JWT (jose)            │
│  ├─ Validar no expirado             │
│  └─ Retornar user payload           │
└──────────┬──────────────────────────┘
           │
    ✓ Autorizado
           │
           ▼
┌─────────────────────────────────────┐
│  Ejecutar endpoint protegido        │
└─────────────────────────────────────┘
```

---

## Flujo del Agente IA de Pagos

```
┌──────────────────────────────────┐
│  Usuario solicita recomendación  │
│                                  │
│  POST /api/agent/recommend       │
│  {                               │
│    amount: 500,                  │
│    currency: "USD",              │
│    country: "AR",                │
│    userPreferences: {...}        │
│  }                               │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  1. Validar entrada (Zod)        │
│  2. Verificar autenticación      │
│  3. Rate limit check             │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│  Agente IA (ToolLoopAgent)                   │
│                                              │
│  "Recomendarme el mejor método de pago       │
│   para $500 USD en Argentina"                │
└────────────┬─────────────────────────────────┘
             │
    ┌────────┴────────┬───────────┬──────────┐
    │                 │           │          │
    ▼                 ▼           ▼          ▼
┌─────────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐
│getMercadoPago│ │getBinance│ │getBlock │ │analyze   │
│Fee()         │ │Info()    │ │chainInfo│ │Prefs()   │
│              │ │          │ │         │ │          │
│2.9% comisión │ │0.1% fee  │ │$50 gas  │ │Puntuación│
│1-2 días      │ │5-30 min  │ │5-15 min │ │Argentina │
└──────────────┘ └──────────┘ └─────────┘ └──────────┘
    │                 │           │          │
    └────────────────┬┴───────────┴──────────┘
                     │
                     ▼
         ┌──────────────────────────────┐
         │ Análisis Combinado:          │
         │                              │
         │ MercadoPago: 2.5 puntos      │
         │ Binance: 2.0 puntos         │
         │ Blockchain: 1.5 puntos      │
         │                              │
         │ MEJOR: MercadoPago           │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │ Respuesta IA:                │
         │                              │
         │ {                            │
         │   recommendedMethod: ...     │
         │   reasoning: "Por tus pref.."│
         │   pros: [...]                │
         │   cons: [...]                │
         │   estimatedFee: 14.50        │
         │   confidence: 0.92           │
         │ }                            │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │ Cliente recibe respuesta     │
         │ y muestra recomendación      │
         └──────────────────────────────┘
```

---

## Pipeline de Validación

```
Input (Body JSON)
    │
    ▼
┌──────────────────────────────┐
│  Zod Schema Parsing          │
│  ├─ Email format?            │
│  ├─ Password min 8 chars?    │
│  ├─ Amount positive?         │
│  └─ Currency válido?         │
└──────────┬───────────────────┘
           │
    ✓ OK   │
           ▼
┌──────────────────────────────┐
│  Lógica de Negocio           │
│  ├─ Usuario existe?          │
│  ├─ Balance suficiente?      │
│  ├─ Límites de transacción?  │
│  └─ Blacklist/Fraud check?   │
└──────────┬───────────────────┘
           │
    ✓ OK   │
           ▼
┌──────────────────────────────┐
│  Ejecutar Transacción        │
│  └─ Procesar pago            │
└──────────┬───────────────────┘
           │
           ├─ Éxito ──→ Respuesta 200
           │
           └─ Error  ──→ Error Handler
                        ├─ Log error
                        ├─ Enviar a Sentry
                        └─ Respuesta error JSON
```

---

## Seguridad por Capas

```
┌─────────────────────────────────┐
│  Capa 1: Transporte             │
│  └─ HTTPS/TLS                   │
└─────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│  Capa 2: Autenticación          │
│  ├─ JWT Bearer Token (bcrypt)   │
│  ├─ Validación de firma         │
│  └─ Rate limiting               │
└─────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│  Capa 3: Validación             │
│  ├─ Zod Schemas                 │
│  ├─ Sanitización de entrada     │
│  └─ Type checking               │
└─────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│  Capa 4: Autorización           │
│  ├─ Verificar propiedad recurso │
│  ├─ Permisos de usuario         │
│  └─ Roles                       │
└─────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│  Capa 5: Lógica de Negocio      │
│  ├─ Validaciones específicas    │
│  ├─ Límites y cuotas            │
│  └─ Reglas de negocio           │
└─────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│  Capa 6: Datos                  │
│  ├─ Encriptación en DB          │
│  ├─ Backups automáticos         │
│  └─ Auditoría                   │
└─────────────────────────────────┘
```

---

## Flujo de Cache (SWR)

```
Solicitud Initial
    │
    ▼
¿Datos en caché?
    │
    ├─ SÍ ──→ Retornar caché + Revalidar background
    │
    └─ NO  ──→ Fetcher (fetch API)
                │
                ▼
            ¿Respuesta OK?
                │
                ├─ SÍ  ──→ Guardar en caché + Retornar
                │
                └─ NO  ──→ Usar fallback + Error
                           │
                           ├─ Caché anterior
                           └─ Mensaje error


Deduplicación:
    Múltiples componentes solicitan mismo URL
    │
    └─ SWR deduplica ──→ Una sola petición HTTP
                         │
                         ├─ Todos reciben resultado
                         └─ Economiza ancho de banda
```

---

## Monitoreo y Observabilidad

```
┌────────────────────────────────────────┐
│  Aplicación (Salta Wallet)             │
│  ├─ Logs locales                       │
│  ├─ Console.log("[v0] ...")            │
│  └─ Errors capturados                  │
└────────────┬─────────────────────────┬─┘
             │                         │
         ┌───▼────────┐         ┌─────▼─────┐
         │  Sentry    │         │  Vercel   │
         │ (opcional) │         │  Logs     │
         │            │         │           │
         │ ├─ Errors  │         │ ├─ Build  │
         │ ├─ Events  │         │ ├─ Runtime│
         │ └─ Reports │         │ └─ Deploy │
         └────────────┘         └───────────┘
             │
             ▼
         Alertas → Email/Slack
```

---

## Resumen de Cambios Clave

| Componente | Antes | Después | Beneficio |
|------------|-------|---------|-----------|
| Hash Contraseñas | SHA-256 | bcrypt | Seguro 99% más |
| Validación | Manual | Zod Schemas | Automática, consistente |
| Rate Limiting | Ninguno | 100 req/15min | Anti-DDoS/abuso |
| Cache | Ninguno | SWR Smart | 50% menos requests |
| Auth | Auth0 solo | JWT + Auth0 | Flexible, fallback |
| Errors | console.error | Sistema centralizado | Trazable, monitoreado |
| Binance | No | Full API | Trading, retiros |
| Recomendaciones | Reglas fijas | IA adaptativa | 10x más smart |

---

## Próximos Milestones

```
v1.1 (Próximo Sprint)
├─ Dashboard de Analytics
├─ Historial de transacciones
├─ Exportar a PDF/Excel
└─ 2FA (Two-Factor Auth)

v1.2 (Sprint +2)
├─ Mobile app (React Native)
├─ Notificaciones push
├─ Webhook para eventos
└─ API pública

v1.3 (Sprint +3)
├─ Límites de transacción personalizados
├─ Preferencias de comisión
├─ Análisis de gastos
└─ Cashback/rewards

v2.0 (Roadmap)
├─ Contratos inteligentes
├─ Staking/DeFi
├─ NFT marketplace
└─ DAO governance
```

