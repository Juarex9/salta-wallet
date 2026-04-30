#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('Generando cliente Prisma...');

try {
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✓ Cliente Prisma generado exitosamente');
} catch (error) {
  console.error('✗ Error al generar cliente Prisma:', error.message);
  process.exit(1);
}
