# 🌐 MEJORA 0 (CRÍTICA): CONFIGURAR www.econeura.com

**PRIORIDAD**: P0 🚨 (SIN ESTO, PROYECTO NO SIRVE)

**TIEMPO**: 1 hora

**OBJETIVO**: www.econeura.com → Frontend + api.econeura.com → Backend

---

## 🎯 DATOS CLOUDFLARE

**Dominio**: econeura.com  
**Cuenta**: Samupanzardi@gmail.com  
**ID Zona**: 068d477791c3c37dc7be2020f54d38c7  
**ID Cuenta**: c2169a397d1ed2482592a83861f092fd  
**Plan**: Gratuito ✅  
**Estado**: Activo ✅

**Dashboard**: https://dash.cloudflare.com/c2169a397d1ed2482592a83861f092fd/econeura.com

---

## 📋 PLAN CONFIGURACIÓN DNS (6 PASOS)

### PASO 1: AGREGAR REGISTROS DNS EN CLOUDFLARE

**Cloudflare Dashboard** → DNS → Registros DNS

**4 REGISTROS A CREAR**:

| Tipo | Nombre | Destino | TTL | Proxy | Estado |
|------|--------|---------|-----|-------|--------|
| **CNAME** | `www` | `econeura-frontend.azurestaticapps.net` | Auto | ✅ Proxied | ⬜ TODO |
| **CNAME** | `@` | `econeura-frontend.azurestaticapps.net` | Auto | ✅ Proxied | ⬜ TODO |
| **CNAME** | `api` | `econeura-backend.azurewebsites.net` | Auto | ✅ Proxied | ⬜ TODO |
| **TXT** | `asuid.www` | `<azure-verification-code>` | Auto | - | ⬜ TODO |

**Comandos Cloudflare API** (PowerShell):
```powershell
$zone = "068d477791c3c37dc7be2020f54d38c7"
$email = "Samupanzardi@gmail.com"
$apiKey = $env:CLOUDFLARE_API_KEY  # Obtener de Cloudflare Dashboard → API Tokens

# 1. CNAME www → frontend
Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zone/dns_records" `
  -Method POST `
  -Headers @{
    "X-Auth-Email" = $email
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
  } `
  -Body (@{
    type = "CNAME"
    name = "www"
    content = "econeura-frontend.azurestaticapps.net"
    ttl = 1
    proxied = $true
  } | ConvertTo-Json)

# 2. CNAME @ (root) → frontend
Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zone/dns_records" `
  -Method POST `
  -Headers @{
    "X-Auth-Email" = $email
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
  } `
  -Body (@{
    type = "CNAME"
    name = "@"
    content = "econeura-frontend.azurestaticapps.net"
    ttl = 1
    proxied = $true
  } | ConvertTo-Json)

# 3. CNAME api → backend
Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zone/dns_records" `
  -Method POST `
  -Headers @{
    "X-Auth-Email" = $email
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
  } `
  -Body (@{
    type = "CNAME"
    name = "api"
    content = "econeura-backend.azurewebsites.net"
    ttl = 1
    proxied = $true
  } | ConvertTo-Json)
```

---

### PASO 2: OBTENER TOKENS DE VERIFICACIÓN AZURE

**Static Web App**:
```bash
az staticwebapp hostname set \
  --name econeura-frontend \
  --resource-group econeura-rg \
  --hostname www.econeura.com

# Azure responderá con:
# "To verify domain ownership, add this TXT record:
#  Name: _dnsauth.www
#  Value: <token-123456789>"
```

**App Service**:
```bash
az webapp config hostname add \
  --webapp-name econeura-backend \
  --resource-group econeura-rg \
  --hostname api.econeura.com

# Azure responderá con:
# "To verify domain ownership, add this TXT record:
#  Name: asuid.api
#  Value: <azure-verification-code>"
```

---

### PASO 3: AGREGAR TXT RECORDS EN CLOUDFLARE

**Cloudflare Dashboard** → DNS → Agregar:

```
Tipo    Nombre              Destino
─────────────────────────────────────────────────────
TXT     _dnsauth.www        <token-frontend-azure>
TXT     _dnsauth            <token-frontend-azure>
TXT     asuid.api           <token-backend-azure>
```

**PowerShell**:
```powershell
# TXT _dnsauth.www (frontend verification)
Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zone/dns_records" `
  -Method POST `
  -Headers @{ "X-Auth-Email" = $email; "Authorization" = "Bearer $apiKey"; "Content-Type" = "application/json" } `
  -Body (@{ type = "TXT"; name = "_dnsauth.www"; content = "<TOKEN_AZURE_FRONTEND>" } | ConvertTo-Json)

# TXT asuid.api (backend verification)
Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zone/dns_records" `
  -Method POST `
  -Headers @{ "X-Auth-Email" = $email; "Authorization" = "Bearer $apiKey"; "Content-Type" = "application/json" } `
  -Body (@{ type = "TXT"; name = "asuid.api"; content = "<TOKEN_AZURE_BACKEND>" } | ConvertTo-Json)
```

---

### PASO 4: VERIFICAR DOMINIOS EN AZURE

**Static Web App**:
```bash
# Verificar dominio www.econeura.com
az staticwebapp hostname show \
  --name econeura-frontend \
  --resource-group econeura-rg \
  --hostname www.econeura.com

# Esperado: "validationStatus": "Approved"
```

**App Service**:
```bash
# Verificar dominio api.econeura.com
az webapp config hostname list \
  --webapp-name econeura-backend \
  --resource-group econeura-rg

# Esperado: api.econeura.com en la lista
```

---

### PASO 5: CONFIGURAR SSL/TLS EN CLOUDFLARE

**Cloudflare Dashboard** → SSL/TLS → Configuración:

1. **Modo de cifrado**: Full (strict) ✅
   - Cloudflare verifica certificado Azure
   - Azure usa certificados managed (Let's Encrypt)

2. **Always Use HTTPS**: ON ✅
   - http://econeura.com → https://econeura.com

3. **Automatic HTTPS Rewrites**: ON ✅

4. **Minimum TLS Version**: TLS 1.2 ✅

5. **Edge Certificates**: Auto (Cloudflare Universal SSL) ✅

---

### PASO 6: ACTUALIZAR CÓDIGO PARA PRODUCCIÓN

**backend/server.js** - CORS:
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://econeura.com',
      'https://www.econeura.com',
      'https://api.econeura.com',
      'http://localhost:5173' // Dev
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

**backend/server.js** - Redirect www:
```javascript
// Redirect non-www to www (SEO)
app.use((req, res, next) => {
  if (req.hostname === 'econeura.com' && process.env.NODE_ENV === 'production') {
    return res.redirect(301, `https://www.econeura.com${req.url}`);
  }
  next();
});
```

**frontend/src/config/api.ts**:
```typescript
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  // PRODUCCIÓN
  if (hostname.includes('econeura.com')) {
    return 'https://api.econeura.com/api';
  }
  
  // LOCAL
  return 'http://localhost:8080/api';
};

export const API_URL = getApiUrl();
```

**frontend/.env.production**:
```bash
VITE_API_URL=https://api.econeura.com/api
```

---

## ✅ VERIFICACIÓN FINAL

**Checklist DNS** (8 puntos):
- [ ] Cloudflare CNAME `www` → `econeura-frontend.azurestaticapps.net`
- [ ] Cloudflare CNAME `@` → `econeura-frontend.azurestaticapps.net`
- [ ] Cloudflare CNAME `api` → `econeura-backend.azurewebsites.net`
- [ ] Cloudflare TXT `_dnsauth.www` → Azure verification
- [ ] Cloudflare TXT `asuid.api` → Azure verification
- [ ] Azure Static Web App custom domain: `www.econeura.com` ✅
- [ ] Azure App Service custom domain: `api.econeura.com` ✅
- [ ] SSL/TLS Cloudflare: Full (strict) ✅

**Checklist Funcionamiento** (6 puntos):
- [ ] `https://www.econeura.com` → Frontend carga ✅
- [ ] `https://econeura.com` → Redirect a www ✅
- [ ] `https://api.econeura.com/api/health` → 200 OK ✅
- [ ] Login OAuth desde www.econeura.com → Funciona ✅
- [ ] Chat con NEURAs → Funciona ✅
- [ ] CORS: Frontend conecta a Backend sin errores ✅

**Checklist SSL** (4 puntos):
- [ ] SSL Labs test: A+ rating
- [ ] TLS 1.3 enabled
- [ ] HSTS header presente
- [ ] No mixed content warnings

**SI 18/18 ✅ → DOMINIO CONFIGURADO CORRECTAMENTE**

---

## 🚨 CRÍTICO: ORDEN DE EJECUCIÓN

**ESTE PASO ES EL PRIMERO** (antes que las otras 10 mejoras):

```
MEJORA 0: Configurar dominio (1h)
    ↓
VERIFICAR: www.econeura.com funciona
    ↓
ENTONCES: Mejoras 1-10
    ↓
RESULTADO: ECONEURA 10/10 en www.econeura.com
```

**SI NO FUNCIONA EN www.econeura.com**:
- ❌ No continuar con otras mejoras
- ❌ Debuggear DNS primero
- ❌ Verificar Azure custom domains

---

## 📞 TROUBLESHOOTING

### Error: "DNS_PROBE_FINISHED_NXDOMAIN"
**Causa**: DNS no propagado  
**Solución**: Esperar 5-10 min, limpiar cache DNS
```bash
ipconfig /flushdns  # Windows
```

### Error: "SSL_PROTOCOL_ERROR"
**Causa**: Cloudflare SSL mode incorrecto  
**Solución**: Cambiar a "Full (strict)"

### Error: "ERR_TOO_MANY_REDIRECTS"
**Causa**: Loop redirect Cloudflare ↔ Azure  
**Solución**: Cloudflare SSL = Full, NO Flexible

### Error: "CORS policy blocked"
**Causa**: Backend CORS no incluye www.econeura.com  
**Solución**: Agregar origin en corsOptions

---

## ✅ RESULTADO FINAL

**URLS FUNCIONALES**:
- ✅ https://www.econeura.com → Frontend (Static Web App)
- ✅ https://econeura.com → Redirect a www
- ✅ https://api.econeura.com → Backend (App Service)
- ✅ https://api.econeura.com/api/health → Health check
- ✅ SSL/TLS A+ rating
- ✅ CORS configurado
- ✅ OAuth callback a www.econeura.com funciona

**🎉 ECONEURA ACCESIBLE EN DOMINIO PROFESIONAL 🎉**

