## Solución de Errores - Guía de Setup

Hemos identificado y solucionado los siguientes problemas:

### 1. Error de Prisma - Cliente no generado

**Problema:** `Cannot find module '.prisma/client/default'`

**Causa:** El cliente Prisma no estaba siendo generado.

**Solución implementada:**
- Agregado script `postinstall` en `package.json` que ejecuta `prisma generate`
- Actualizado script `build` para ejecutar `prisma generate` antes de compilar
- Creado `next.config.js` que genera Prisma automáticamente al iniciar Next.js

**Acción requerida del usuario:**
1. Eliminar carpeta `.next`: `rm -rf .next`
2. Ejecutar: `npm install` (esto ejecutará `prisma generate`)
3. O ejecutar manualmente: `npm run prisma:generate`

### 2. Error en ProtectedRoute - setState durante render

**Problema:** `Cannot update a component (Router) while rendering a different component (ProtectedRoute)`

**Causa:** Estaba haciendo `router.push()` directamente en el render.

**Solución:** 
- Movido `router.push()` a un `useEffect`
- Agregada protección para evitar múltiples redirecciones

**Archivo actualizado:** `lib/auth/protected-route.tsx`

### 3. Error de Google Auth - Rutas API 404

**Problema:** GET `/auth/profile 404` cuando intenta usar Google OAuth

**Causa:** Las rutas de Auth0 no están configuradas correctamente.

**Solución:**
- Las rutas de Auth0 deben estar en `app/auth/[auth0]/route.ts`
- Auth0 NextJS SDK maneja las rutas automáticamente con el middleware

**Verificación:**
- Asegúrate de tener `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` en `.env.local`

### Pasos finales:

1. **Limpiar y reinstalar:**
   ```bash
   rm -rf .next node_modules
   npm install
   npm run dev
   ```

2. **Verificar variables de entorno:**
   - Crear `.env.local` con las credenciales de Auth0 (ver `.env.example`)

3. **La aplicación debería compilar sin errores.**

Si aún hay problemas:
- Revisar `/user_read_only_context/v0_debug_logs.log` para nuevos errores
- Asegúrate de que `DATABASE_URL` está configurado
