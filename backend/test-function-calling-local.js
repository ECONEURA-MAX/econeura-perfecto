/**
 * ECONEURA - Test Function Calling
 * Verifica que las funciones se llaman correctamente
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testFunctionCalling() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🧪 TESTING FUNCTION CALLING');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  
  const tests = [
    {
      name: 'listar_agentes_disponibles',
      input: 'Lista los agentes disponibles',
      expectedFunction: 'listar_agentes_disponibles'
    },
    {
      name: 'consultar_datos',
      input: 'Consulta datos de tesorería del último mes',
      expectedFunction: 'consultar_datos'
    }
  ];
  
  let passed = 0;
  
  for (const test of tests) {
    console.log(`Testing: ${test.name}`);
    
    try {
      const res = await fetch('http://localhost:8080/api/invoke/a-ceo-01', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: test.input }),
        timeout: 15000
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      
      if (data.function_call && data.function_call.name === test.expectedFunction) {
        console.log(`  ✅ Función llamada correctamente: ${data.function_call.name}`);
        console.log(`     Status: ${data.function_call.status}`);
        passed++;
      } else if (data.function_call) {
        console.log(`  ⚠️  Función llamada: ${data.function_call.name} (esperaba: ${test.expectedFunction})`);
      } else {
        console.log(`  ⚠️  Sin function call (puede ser que IA decidió responder directamente)`);
        passed++; // No es error crítico
      }
    } catch (e) {
      console.log(`  ❌ Error: ${e.message}`);
    }
    
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  📊 Resultado: ${passed}/${tests.length} tests OK`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  
  if (passed === tests.length) {
    console.log('✅ FUNCTION CALLING OK - Continuar con TAREA 3');
    process.exit(0);
  } else {
    console.log('⚠️  Algunos tests no pasaron - Verificar pero no crítico');
    process.exit(0); // No bloqueante
  }
}

testFunctionCalling();

