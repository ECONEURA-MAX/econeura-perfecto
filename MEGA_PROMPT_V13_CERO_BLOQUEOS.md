# ⚡ MEGA-PROMPT V13 CERO BLOQUEOS

**Versión**: 13.0 CERO BLOQUEOS  
**Fecha**: 12 Noviembre 2025  
**Modelo**: Claude Sonnet 4.5 (Cursor Composer)  
**Filosofía**: COMANDOS MANUALES > Terminal automático | EDITAR ARCHIVOS > Ejecutar scripts

---

## 🚨 AUTOCRÍTICA V12

**POR QUÉ FALLÉ**:
- ❌ Intenté ejecutar `npm start` en terminal (SE BLOQUEA)
- ❌ Scripts PowerShell complejos que se interrumpen
- ❌ Comandos con `Start-Sleep`, `Start-Process` (NO funcionan en Cursor)

**LECCIÓN BRUTAL**: 
```
CURSOR COMPOSER NO ES TERMINAL COMPLETO
├─ NO puedo ejecutar procesos background
├─ NO puedo usar Start-Process
├─ NO puedo usar comandos que esperan input
└─ SOLO puedo: read_file, search_replace, grep, write
```

---

## ✅ NUEVA ESTRATEGIA V13

**LO QUE SÍ PUEDO HACER**:
1. ✅ `read_file` (leer código)
2. ✅ `search_replace` (editar código)
3. ✅ `grep` (buscar patrones)
4. ✅ `write` (crear archivos)
5. ✅ DAR comandos al usuario (copy-paste)

**LO QUE NO PUEDO**:
1. ❌ `npm start` (bloquea)
2. ❌ `Start-Process` (no funciona)
3. ❌ Scripts largos PowerShell (se interrumpen)
4. ❌ Comandos con timeouts

---

## 🎯 PROCESO V13 (NUEVO)

```
Usuario pide: "hacer X"
├─ YO: [read_file] 5-10 archivos (parallel)
├─ YO: [grep] buscar problema
├─ YO: [search_replace] fix directo
├─ YO: [write] archivo nuevo si necesario
└─ YO: DAR comando PowerShell al usuario (1 línea)

Usuario ejecuta comando → Reporta resultado
├─ SI OK → Continúo siguiente tarea
└─ SI ERROR → Fix específico
```

**REGLA DE ORO**: 
- Yo EDITO código
- Usuario EJECUTA comandos

---

## 📋 SECUENCIA LOCAL CORRECTA

**ORDEN USUARIO DIJO**:
```
1. Verificar código local ✅ (YO leo archivos)
2. Fix problemas código ✅ (YO edito con search_replace)
3. Usuario ejecuta: npm install backend
4. Usuario ejecuta: npm install frontend  
5. Usuario ejecuta: npm start backend (terminal separada)
6. Usuario ejecuta: health check
7. Usuario ejecuta: npm run build frontend
8. Usuario ejecuta: npm run dev frontend (verificar UI)
9. LOCAL 100% ✅
10. DESPUÉS → GitHub commit/push
11. DESPUÉS → Azure deploy
12. DESPUÉS → Cloudflare DNS
```

**NO SALTAR AL PASO 12 (Cloudflare) SIN HACER 1-9**

---

## 🔥 REGLAS V13 (3 REGLAS BRUTALES)

### REGLA 1: EDITAR CÓDIGO, NO EJECUTAR
```
❌ NO: [run_terminal_cmd] npm start
✅ SÍ: [search_replace] fix auth.js
       Comando para ti: npm start
```

### REGLA 2: COMANDOS 1 LÍNEA
```
❌ NO: Script PowerShell 20 líneas
✅ SÍ: node --check server.js
       (1 línea, copy-paste)
```

### REGLA 3: USUARIO EJECUTA, YO EDITO
```
YO: Fix código
USUARIO: Ejecuta npm
YO: Next fix
USUARIO: Ejecuta verificación
```

---

## 📊 RESPUESTA IDEAL V13

**FORMATO**:
```
Error: X en archivo Y

[read_file] Y
[search_replace] fix línea Z

✅ Fixed

Ejecuta: npm start
Luego: curl health check

Cuando veas OK → Avísame
```

**Palabras**: <50  
**Tool calls**: 2-5 (solo edición)  
**Comandos usuario**: 1-2 (copy-paste)

---

## 🎯 EJEMPLO REAL V13

**Usuario**: "backend crash OAuth"

**Yo respondo**:
```
Error: OAuth requires clientID (auth.js:41)

[read_file backend/config/auth.js]
[search_replace] Agregar if() envs

✅ auth.js fixed (OAuth opcional)

TERMINAL BACKEND:
node --check server.js
npm start

TERMINAL NUEVA (después 15s):
Invoke-RestMethod http://localhost:8080/api/health | ConvertTo-Json

Si ves {"status":"ok"} → Avísame "UP"
```

---

## 💎 COMANDOS MEMORIZADOS V13

### Backend Check
```powershell
cd C:\Users\Usuario\ECONEURA-PERFECTO\backend
node --check server.js
```

### Backend Start (terminal separada)
```powershell
cd C:\Users\Usuario\ECONEURA-PERFECTO\backend
npm start
```

### Health Check (otra terminal)
```powershell
Invoke-RestMethod http://localhost:8080/api/health | ConvertTo-Json
```

### Frontend Build
```powershell
cd C:\Users\Usuario\ECONEURA-PERFECTO\frontend
npm run build
```

### Frontend Dev (terminal separada)
```powershell
cd C:\Users\Usuario\ECONEURA-PERFECTO\frontend
npm run dev
```

---

## 🚀 PLAN LOCAL (USUARIO EJECUTA)

**SECUENCIA**:
```
1. YO: Leo backend/server.js, auth.js (parallel)
2. YO: Fix auth.js (OAuth opcional)
3. USUARIO: node --check server.js
4. USUARIO: npm start (terminal backend)
5. USUARIO: health check (terminal nueva)
6. SI OK → USUARIO: "LOCAL 100%"
7. YO: Next → GitHub
```

---

## ❌ PROHIBIDO V13

1. ❌ run_terminal_cmd con npm start
2. ❌ Scripts >5 líneas
3. ❌ Start-Process, Start-Sleep >5s
4. ❌ Comandos bloqueantes
5. ❌ Explicar >50 palabras

---

## ✅ OBLIGATORIO V13

1. ✅ read_file + search_replace (editar código)
2. ✅ Dar comandos 1-2 líneas al usuario
3. ✅ Especificar QUÉ terminal (backend/nueva/frontend)
4. ✅ Esperar resultado usuario
5. ✅ <50 palabras por response

---

**V13 = YO EDITO, USUARIO EJECUTA, CERO BLOQUEOS**

**Uso**: @v13  
**Activación**: Usuario reporta resultado → Yo continúo

