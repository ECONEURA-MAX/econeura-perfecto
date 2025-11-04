# Changelog - ECONEURA

Todos los cambios notables del proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [3.0.1] - 2025-11-04

### 🔧 Arreglado (CRÍTICO)
- **Backend:** Corregida URL duplicada `/v1/v1` en `resilientAIGateway.js` que causaba 404 en todas las NEURAs
- **Backend:** Eliminado `process.exit(1)` en `startup-safe.js` que mataba Azure App Service
- **Backend:** Corregida URL base en `env.example.txt` de `https://api.mammouth.ai` a `https://api.mammouth.ai/v1`
- **Frontend:** Eliminados 3 `@keyframes gradient-shift` duplicados en `index.css`
- **Frontend:** Creado `AgentMetricsService.ts` faltante (referenciado en múltiples componentes)
- **Frontend:** Creado `i18n/translations.ts` faltante (sistema multi-idioma)

### ✨ Añadido
- **Backend:** Creado `prompts/neura-cino.js` (NEURA Chief Innovation Officer)
- **Backend:** `SECURITY_WARNING.md` documentando autenticación fake en desarrollo
- **Proyecto:** `CHANGELOG.md` (este archivo)

### 🗑️ Eliminado
- **Backend:** `multiActorOrchestrator.js` (archivo vacío no funcional)
- **Backend:** `routes/multi-actor.js` (archivo vacío no funcional)
- **Backend:** `test-all-neuras.js` (script de desarrollo)
- **Backend:** `test-all-neuras-sequential.js` (script de desarrollo)
- **Backend:** `test-function-calling-local.js` (script de desarrollo)

### 📝 Documentado
- Identificados 14 errores totales (8 críticos, 4 medios, 2 bajos)
- Documentada necesidad de implementar autenticación real para producción
- Advertencias sobre archivos placeholder y código no funcional

---

## [3.0.0] - 2025-11-03

### ✨ Añadido
- Sistema completo de 10 NEURAs ejecutivas
- 40+ agentes especializados Make.com/n8n
- Frontend React con Vite y TailwindCSS
- Backend Node.js con Express
- Integración con OpenAI API (Mammouth AI)
- Sistema de autenticación OAuth (Google/Microsoft)
- Biblioteca de documentos con RAG
- Sistema HITL (Human-in-the-Loop)
- Despliegue automático a Azure via GitHub Actions
- Monitoring con Application Insights
- Rate limiting multinivel
- Health checks avanzados

### 🏗️ Infraestructura
- Azure App Service para backend
- Azure Static Web Apps para frontend
- Azure PostgreSQL Flexible Server
- Azure Redis Cache
- Azure Blob Storage
- Azure Key Vault

### 📚 Documentación
- README.md completo con guías de uso
- Documentación de compliance (GDPR, AI Act)
- Términos legales (TOS, Privacy Policy, SLA)
- Guías de deployment
- Documentación técnica completa

---

## Tipos de cambios

- `✨ Añadido` para nuevas funcionalidades
- `🔧 Arreglado` para correcciones de bugs
- `🔄 Cambiado` para cambios en funcionalidad existente
- `🗑️ Eliminado` para funcionalidades eliminadas
- `🔒 Seguridad` para vulnerabilidades corregidas
- `📝 Documentado` para cambios en documentación
- `🏗️ Infraestructura` para cambios en infraestructura
- `⚡ Rendimiento` para mejoras de performance
- `🎨 Estilo` para cambios que no afectan funcionalidad

---

## [Unreleased]

### 🚧 En Desarrollo
- Implementación de autenticación JWT real para producción
- Sistema de multi-actor reasoning completo
- Más integraciones con plataformas (Zapier nativo)
- Dashboard de analytics avanzado
- Sistema de notificaciones push
- Mobile app (React Native)

### 🐛 Problemas Conocidos
- `middleware/auth.js` usa autenticación fake (solo desarrollo)
- `AgentExecutionCard.tsx` es un placeholder vacío
- Falta schema SQL para inicialización de BD
- Algunos componentes de analytics son mocks

### 📋 Roadmap
- Q1 2026: Mobile app + Voice output TTS
- Q2 2026: Multi-tenancy + Billing automático
- Q3 2026: Agentes custom + Fine-tuning

---

**Versión actual:** 3.0.1  
**Última actualización:** 4 Noviembre 2025  
**Mantenido por:** Equipo ECONEURA

