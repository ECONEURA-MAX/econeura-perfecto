# ✅ ORDEN CORRECTO PARA CONFIGURAR econeura.com

---

## PASO 1: Cloudflare DNS (PRIMERO)

**Ve a:** https://dash.cloudflare.com

1. Selecciona **econeura.com**
2. Ve a **DNS → Records**
3. Haz clic en **"Add record"**
4. Configura:
   - **Tipo:** CNAME
   - **Nombre:** www
   - **Target:** delightful-sand-04fd53203.3.azurestaticapps.net
   - **Proxy status:** ON (icono naranja)
5. Haz clic en **"Save"**

**ESPERA 2 MINUTOS**

---

## PASO 2: Azure (DESPUÉS)

```powershell
az staticwebapp hostname set `
  --name econeura-web `
  --resource-group appsvc_linux_northeurope_basic `
  --hostname www.econeura.com
```

---

## PASO 3: Verificar (5 minutos después)

```powershell
Invoke-WebRequest -Uri "https://www.econeura.com" -UseBasicParsing
```

---

## ⚠️ ERROR ACTUAL:

Azure dice "CNAME Record is invalid" porque Cloudflare NO tiene el CNAME configurado aún.

**SOLUCIÓN:** Empieza por Cloudflare (PASO 1), luego Azure (PASO 2)

