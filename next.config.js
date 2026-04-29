/** @type {import('next').NextConfig} */

const { execSync } = require('child_process');

// Generar cliente Prisma si no existe
try {
  execSync('npx prisma generate', { stdio: 'ignore' });
} catch (e) {
  // Ignorar errores silenciosamente
}

const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
