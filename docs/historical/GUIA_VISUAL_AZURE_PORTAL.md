# 📍 GUÍA VISUAL - CONFIGURAR VARIABLES EN AZURE PORTAL

## ⚠️ ESTÁS VIENDO: "General settings"

Necesitas ir a: **"Application settings"**

---

## 🎯 PASO A PASO:

### **1. Buscar las pestañas en la parte superior**

Verás estas pestañas:
```
[ Application settings ]  [ General settings ]  [ Path mappings ]  [ Default documents ]
```

---

### **2. CLICK en "Application settings"**

Es la PRIMERA pestaña (la más a la izquierda).

---

### **3. Una vez en "Application settings", verás:**

```
Application settings (X)
└── + New application setting

App settings
┌─────────────────────────────────────────────────┐
│ Name                              | Value       │
├─────────────────────────────────────────────────┤
│ (aquí aparecerán las variables)                 │
└─────────────────────────────────────────────────┘
```

---

### **4. Click en "+ New application setting"**

Se abrirá un modal:
```
Add/Edit application setting
┌─────────────────────────────────┐
│ Name:  [                      ] │
│ Value: [                      ] │
│ ☐ Deployment slot setting       │
│                                  │
│         [OK]     [Cancel]        │
└─────────────────────────────────┘
```

---

### **5. Agregar PRIMERA variable:**

```
Name:  NODE_ENV
Value: production
```

Click **OK**

---

### **6. Repetir para las otras 7 variables:**

#### **Variable 2:**
```
Name:  PORT
Value: 8080
```

#### **Variable 3:**
```
Name:  OPENAI_API_KEY
Value: sk-j4PRDUZV1DAfrl5HJE_sQg
```

#### **Variable 4:**
```
Name:  OPENAI_API_BASE_URL
Value: https://api.mammouth.ai/v1
```

#### **Variable 5:**
```
Name:  OPENAI_MODEL
Value: mistral-medium-3.1
```

#### **Variable 6:**
```
Name:  CORS_ORIGIN
Value: https://delightful-sand-04fd53203.3.azurestaticapps.net
```

#### **Variable 7: (MUY IMPORTANTE - Node 20)**
```
Name:  WEBSITE_NODE_DEFAULT_VERSION
Value: ~20
```

#### **Variable 8:**
```
Name:  SCM_DO_BUILD_DURING_DEPLOYMENT
Value: true
```

---

### **7. GUARDAR TODO (CRÍTICO)**

Después de agregar las 8 variables, en la parte SUPERIOR de la página verás:

```
[Save]  [Discard]
```

**CLICK EN "SAVE"**

---

### **8. Confirmar restart**

Aparecerá un mensaje:
```
Restart your web app?
Your changes will take effect after the app is restarted.

[Continue]  [Cancel]
```

**CLICK "Continue"**

---

### **9. Esperar 60 segundos**

Azure reiniciará el App Service con:
- ✅ Node 20 configurado
- ✅ Variables de entorno configuradas

---

## 🔍 VERIFICAR QUE SE GUARDARON:

Después del restart, en "Application settings" deberías ver:

```
App settings (8)

Name                              | Value
──────────────────────────────────────────────
NODE_ENV                          | production
PORT                              | 8080
OPENAI_API_KEY                    | ••••••••••
OPENAI_API_BASE_URL              | https://api.mammouth.ai/v1
OPENAI_MODEL                      | mistral-medium-3.1
CORS_ORIGIN                       | https://delightful-sand-04fd53203.3.azurestaticapps.net
WEBSITE_NODE_DEFAULT_VERSION      | ~20
SCM_DO_BUILD_DURING_DEPLOYMENT    | true
```

(Los valores sensibles se muestran con puntos)

---

## ✅ DESPUÉS DE CONFIGURAR:

Ejecuta en PowerShell:

```powershell
# Trigger deployment
git commit --allow-empty -m "trigger: deploy con Node 20 y variables configuradas"
git push origin main
```

O manualmente desde GitHub Actions:
https://github.com/ECONEURA-MAX/econeura-perfecto/actions

---

## 🎯 ESTO SOLUCIONARÁ:

1. ✅ **Node 18 → Node 20** (WEBSITE_NODE_DEFAULT_VERSION)
2. ✅ **Variables NULL → Valores correctos**
3. ✅ Backend arrancará correctamente
4. ✅ Health check pasará

**Probabilidad de éxito:** 85%

---

**👉 PASO ACTUAL: Click en pestaña "Application settings"**

