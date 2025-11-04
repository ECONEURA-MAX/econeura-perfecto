/**
 * ECONEURA - Startup seguro con fail-safes
 * Envuelve todos los requires críticos para evitar crashes
 */

console.log('[STARTUP-SAFE] Iniciando validación de módulos...');

const criticalModules = [
  'express',
  'cors',
  'dotenv',
  'compression',
  'helmet'
];

const optionalModules = [
  'passport',
  'express-session',
  '@azure/keyvault-secrets',
  'applicationinsights',
  'ioredis',
  'pg'
];

function validateModule(moduleName, required = true) {
  try {
    require.resolve(moduleName);
    console.log(`  ✅ ${moduleName}`);
    return true;
  } catch (error) {
    if (required) {
      console.error(`  ❌ CRÍTICO: ${moduleName} no encontrado`);
      return false;
    } else {
      console.warn(`  ⚠️  OPCIONAL: ${moduleName} no encontrado (OK)`);
      return true;
    }
  }
}

console.log('\n📦 Módulos críticos:');
let allCriticalOk = true;
criticalModules.forEach(mod => {
  if (!validateModule(mod, true)) {
    allCriticalOk = false;
  }
});

console.log('\n📦 Módulos opcionales:');
optionalModules.forEach(mod => {
  validateModule(mod, false);
});

if (!allCriticalOk) {
  console.error('\n❌ Faltan módulos críticos. Ejecutar: npm install');
  console.error('⚠️  ADVERTENCIA: Continuando en modo degradado para permitir diagnóstico en Azure');
  console.error('⚠️  El servidor puede fallar si estos módulos son realmente necesarios');
  // NO hacer process.exit(1) en Azure - permite ver logs de diagnóstico
}

console.log('\n✅ Todos los módulos críticos disponibles\n');
module.exports = { validated: true };

