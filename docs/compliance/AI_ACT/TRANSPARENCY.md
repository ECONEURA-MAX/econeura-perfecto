# Transparencia - AI Act

## Sistema de IA clasificado

**Riesgo:** Limitado (Art. 52 AI Act)

**Razón:** Interacción con humanos via chat, toma decisiones con supervisión (HITL).

## Obligaciones de transparencia

### 1. Información al usuario

Usuarios deben ser informados que interactúan con un sistema de IA.

**Implementación:**
- Disclaimer en UI: "Respuestas generadas por IA. Verifica información crítica."
- Sección "Sobre NEURAs" explica modelos usados

### 2. Contenido generado por IA

Todo output de NEURAs se marca como generado por IA.

**Headers API:**
```
X-Generated-By: AI
X-Model: claude-sonnet-4.5
X-Confidence: 0.87
```

### 3. Human-in-the-Loop (HITL)

Operaciones sensibles requieren aprobación humana (ver [HUMAN_IN_LOOP.md](./HUMAN_IN_LOOP.md)).

### 4. Explicabilidad

Reasoning visible en multi-actor:
- Pasos de razonamiento mostrados
- NEURAs participantes identificadas
- Confidence scores por decisión

### 5. Modelo card

Ver [MODEL_CARD.md](./MODEL_CARD.md) para detalles de modelos usados.

## Documentación técnica

- Arquitectura: [docs/architecture/SYSTEM.md](../../architecture/SYSTEM.md)
- Logs y auditoría: inmutables, exportables
- Risk assessment: [RISK_ASSESSMENT.md](./RISK_ASSESSMENT.md)

## Actualizaciones

Este documento se revisa trimestralmente para alineación con AI Act (aplicable desde Agosto 2026).

Última revisión: Noviembre 2025


