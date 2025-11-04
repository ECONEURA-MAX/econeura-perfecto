#!/usr/bin/env node
/**
 * ECONEURA - Script de verificación PRE-DEPLOY
 * Ejecutar antes de hacer commit/push/deploy
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICACIÓN PRE-DEPLOY ECONEURA\n');

let errors = 0;
let warnings = 0;

// 1. Verificar archivos críticos
const criticalFiles = [
  'server.js',
  'package.json',
  'package-lock.json',
  '.deployment',
  'deploy.sh',
  'web.config',
  '.nvmrc',
  'config/envValidation.js',
  'services/logger.js',
  'api/health.js'
];

console.log('📁 Verificando archivos críticos...');
criticalFiles.forEach(file => {
  if (!fs.existsSync(path.join(__dirname, file))) {
    console.log(`  ❌ Falta: ${file}`);
    errors++;
  } else {
    console.log(`  ✅ ${file}`);
  }
});

// 2. Verificar package.json
console.log('\n📦 Verificando package.json...');
const pkg = require('./package.json');

if (!pkg.engines || !pkg.engines.node) {
  console.log('  ⚠️  No hay engines.node especificado');
  warnings++;
} else {
  console.log(`  ✅ Node: ${pkg.engines.node}`);
}

if (!pkg.scripts || !pkg.scripts.start) {
  console.log('  ❌ Falta script "start"');
  errors++;
} else {
  console.log(`  ✅ start: ${pkg.scripts.start}`);
}

// 3. Verificar que NO haya SQLite
console.log('\n🗄️  Verificando NO SQLite...');
const lockfile = fs.readFileSync(path.join(__dirname, 'package-lock.json'), 'utf8');
if (lockfile.includes('sqlite') || lockfile.includes('better-sqlite3')) {
  console.log('  ❌ SQLite encontrado en package-lock.json');
  errors++;
} else {
  console.log('  ✅ No hay SQLite');
}

// 4. Verificar .env.example
console.log('\n📝 Verificando env.example.txt...');
if (!fs.existsSync(path.join(__dirname, 'env.example.txt'))) {
  console.log('  ⚠️  No existe env.example.txt');
  warnings++;
} else {
  console.log('  ✅ env.example.txt existe');
}

// 5. Verificar que .env NO esté en Git
console.log('\n🔒 Verificando .env no está en Git...');
try {
  const { execSync } = require('child_process');
  const gitFiles = execSync('git ls-files', { encoding: 'utf8' });
  if (gitFiles.includes('.env') && !gitFiles.includes('.env.example')) {
    console.log('  ❌ .env está en Git (PELIGRO)');
    errors++;
  } else {
    console.log('  ✅ .env no está en Git');
  }
} catch (e) {
  console.log('  ⚠️  No se puede verificar (no es repo Git)');
}

// 6. Verificar server.js básico
console.log('\n🖥️  Verificando server.js...');
const serverJs = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
if (!serverJs.includes('process.env.PORT')) {
  console.log('  ⚠️  server.js no usa process.env.PORT');
  warnings++;
} else {
  console.log('  ✅ Usa process.env.PORT');
}

if (!serverJs.includes('app.listen')) {
  console.log('  ❌ No hay app.listen');
  errors++;
} else {
  console.log('  ✅ Tiene app.listen');
}

// 7. Verificar logging
console.log('\n📊 Verificando sistema de logging...');
if (!fs.existsSync(path.join(__dirname, 'services/logger.js'))) {
  console.log('  ❌ Falta services/logger.js');
  errors++;
} else {
  console.log('  ✅ Logger configurado');
}

// 8. Verificar health check
console.log('\n🏥 Verificando health check...');
const healthJs = fs.readFileSync(path.join(__dirname, 'api/health.js'), 'utf8');
if (!healthJs.includes('/simple') && !healthJs.includes('router.get')) {
  console.log('  ⚠️  Health check puede ser demasiado complejo');
  warnings++;
} else {
  console.log('  ✅ Health check configurado');
}

// Resumen
console.log('\n' + '='.repeat(50));
if (errors === 0 && warnings === 0) {
  console.log('✅ VERIFICACIÓN COMPLETA - LISTO PARA DEPLOY');
  console.log('='.repeat(50));
  process.exit(0);
} else if (errors === 0) {
  console.log(`⚠️  ${warnings} ADVERTENCIAS - Revisar antes de deploy`);
  console.log('='.repeat(50));
  process.exit(0);
} else {
  console.log(`❌ ${errors} ERRORES, ${warnings} ADVERTENCIAS`);
  console.log('='.repeat(50));
  console.log('\n🚨 NO DEPLOYAR HASTA RESOLVER ERRORES');
  process.exit(1);
}

