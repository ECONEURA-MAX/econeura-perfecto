/**
 * ECONEURA - Test Todas las NEURAs
 * Verifica que las 11 NEURAs responden correctamente
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const NEURAS = [
  { id: 'a-ceo-01', name: 'CEO' },
  { id: 'a-ia-01', name: 'CTO IA' },
  { id: 'a-cso-01', name: 'CSO' },
  { id: 'a-cto-01', name: 'CTO' },
  { id: 'a-ciso-01', name: 'CISO' },
  { id: 'a-coo-01', name: 'COO' },
  { id: 'a-chro-01', name: 'CHRO' },
  { id: 'a-mkt-01', name: 'CMO' },
  { id: 'a-cfo-01', name: 'CFO' },
  { id: 'a-cdo-01', name: 'CDO' },
  { id: 'a-cino-01', name: 'CINO' }
];

async function testNEURA(neura) {
  const startTime = Date.now();
  
  try {
    const res = await fetch(`http://localhost:8080/api/invoke/${neura.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: 'Test rápido' }),
      timeout: 15000
    });
    
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`HTTP ${res.status}: ${error}`);
    }
    
    const data = await res.json();
    const latency = Date.now() - startTime;
    
    const hasOutput = data.output && data.output.length > 10;
    const hasTokens = data.tokens > 0;
    
    if (hasOutput && hasTokens) {
      console.log(`✅ ${neura.name.padEnd(10)} | ${latency}ms | ${data.tokens} tokens`);
      return { success: true, latency, tokens: data.tokens };
    } else {
      console.log(`⚠️  ${neura.name.padEnd(10)} | Respuesta incompleta`);
      return { success: false, latency };
    }
    
  } catch (e) {
    console.log(`❌ ${neura.name.padEnd(10)} | ${e.message}`);
    return { success: false, error: e.message };
  }
}

(async () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🧪 TESTING 11 NEURAs LOCALMENTE');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('NEURA      | Latencia | Tokens');
  console.log('───────────┼──────────┼────────');
  
  const results = await Promise.all(NEURAS.map(testNEURA));
  
  const passed = results.filter(r => r.success).length;
  const avgLatency = results
    .filter(r => r.latency)
    .reduce((sum, r) => sum + r.latency, 0) / results.length;
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  📊 Resultado: ${passed}/11 NEURAs funcionando`);
  console.log(`  ⏱️  Latencia promedio: ${Math.round(avgLatency)}ms`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  
  if (passed === 11) {
    console.log('✅ TODAS LAS NEURAS OK - Continuar con TAREA 2');
    process.exit(0);
  } else {
    console.log(`❌ FALLAN ${11 - passed} NEURAs - ARREGLAR ANTES DE CONTINUAR`);
    process.exit(1);
  }
})();

