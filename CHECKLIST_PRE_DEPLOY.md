# ✅ CHECKLIST PRE-DEPLOY - ECONEURA 10/10

## VERIFICACIÓN LOCAL OBLIGATORIA

### BACKEND ✅

- [x] **Dependencies instaladas:** 968 packages
- [x] **No SQLite:** 0 referencias en package.json y package-lock.json
- [x] **db.js existe:** PostgreSQL wrapper funcional
- [x] **Backend arranca:** `node server.js` sin crashear
- [x] **PostgreSQL Pool:** "PostgreSQL Pool inicializado" en logs
- [x] **10 NEURAs:** Prompts en `prompts/neura-*.js`
- [x] **Rutas críticas habilitadas:**
  - `/api/health` ✅
  - `/api/invoke/:id` ✅
  - `/api/ai-gateway` ✅
  - `/api/agents` ✅ (Make/n8n)
  - `/api/integration` ✅ (Webhooks)
  - `/api/proposals` ✅ (HITL)
  - `/api/library` ✅ (RAG)
  - `/api/chats` ✅ (Historial)

### FRONTEND ✅

- [x] **Dependencies instaladas:** 660 packages
- [x] **Build exitoso:** `npm run build` sin errores
- [x] **Bundle size:** 788 KB total, 248 KB gzipped
- [x] **Login.tsx:** 14.28 KB (diseño innegociable)
- [x] **EconeuraCockpit.tsx:** 315 KB (diseño innegociable)
- [x] **Componentes críticos:**
  - ConnectAgentModal.tsx ✅ (784 bytes)
  - AgentExecutionPanel.tsx ✅ (848 bytes)
  - LibraryPanel.tsx ✅ (14 KB)
  - ChatHistory.tsx ✅ (12 KB)
- [x] **URLs correctas:** econeura-backend-prod (NO -v2)
- [x] **Logo:** econeura-logo.png presente

### WORKFLOWS ✅

- [x] **backend-deploy.yml:** Sin cache npm, health check 5 intentos
- [x] **frontend-deploy.yml:** Token validation, build verification

### DOCUMENTACIÓN ✅

- [x] **README.md:** Completo con casos de uso, APIs, troubleshooting
- [x] **GITHUB_SECRETS_SETUP.md:** Comandos para obtener tokens
- [x] **.gitignore:** Protección anti-secrets

### SEGURIDAD 🔒

- [ ] **Verificar no hay secrets hardcodeados**
- [ ] **Verificar .env* en .gitignore**
- [ ] **Verificar *.ps1 en .gitignore**

---

## COMANDOS DE VERIFICACIÓN FINAL

```powershell
# 1. Buscar secrets en código
cd C:\Users\Usuario\ECONEURA-REPO-LIMPIO
Select-String -Path backend\*.js,frontend\src\**\*.tsx -Pattern "sk-proj-|sk-|postgresql://.*:.*@|redis://.*:.*@" -Exclude node_modules

# Esperado: 0 resultados (solo .env.example OK)

# 2. Verificar .gitignore protege
Test-Path .gitignore
Select-String -Path .gitignore -Pattern "\.env|\*\.ps1|\*secret\*"

# Esperado: Encuentra las líneas

# 3. Backend health check
Start-Job -ScriptBlock { 
  cd C:\Users\Usuario\ECONEURA-REPO-LIMPIO\backend
  $env:DATABASE_URL = "postgresql://..."
  node server.js 
} -Name BackendCheck

Start-Sleep -Seconds 15
Invoke-RestMethod http://localhost:8080/api/health | ConvertTo-Json -Depth 3
Stop-Job -Name BackendCheck
Remove-Job -Name BackendCheck

# Esperado: JSON con status "ok" o "degraded"

# 4. Frontend preview
cd frontend
npm run preview &
Start-Sleep -Seconds 5
# Abrir http://localhost:4173
# Verificar: Login carga, Cockpit visible

# 5. Git diff antes de commit
git init
git add .
git diff --cached --name-only | Select-String "\.env|secret|token|\.ps1"

# Esperado: 0 resultados
```

---

## CUANDO TODO ✅ → READY PARA PUSH

```powershell
git commit -m "feat: ECONEURA 10/10 verified - PostgreSQL, 10 NEURAs, agents integration"
git remote add origin https://github.com/ECONEURA-MAX/ECONEURA.COM.git
git branch -M main
git push -u origin main --force
```

---

## POST-DEPLOY VERIFICATION

```powershell
# 1. Backend health
Invoke-RestMethod https://econeura-backend-prod.azurewebsites.net/api/health

# 2. Test NEURA CEO
$body = @{input="Hola"} | ConvertTo-Json
Invoke-RestMethod https://econeura-backend-prod.azurewebsites.net/api/invoke/a-ceo-01 `
  -Method Post -Body $body -ContentType "application/json"

# 3. Frontend
# Abrir https://econeura.com
# Login → Cockpit → Click NEURA → Chat
```

---

**SCORE ACTUAL: 9.5/10**  
**Falta:** Verificar no hay secrets en código (-0.5)

