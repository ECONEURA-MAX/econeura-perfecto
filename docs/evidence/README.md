# Evidencias y Verificación

Esta carpeta contiene evidencias verificables para claims en documentación marketing y producto.

## Estructura

```
evidence/
├── slos/           # Métricas de rendimiento reales
├── benchmarks/     # Resultados de pruebas de carga
└── case-studies/   # Casos de éxito con datos reales
```

## Metodología

Toda evidencia debe incluir:
- Fecha de medición
- Metodología usada
- Herramientas (Lighthouse, k6, etc.)
- Resultados raw (JSON/CSV)
- Contexto (carga, escenario)

## Ejemplo: SLO de latencia

Ver `slos/api-p95-latency.json`:

```json
{
  "metric": "API p95 latency",
  "period": "2025-10",
  "value_ms": 1423,
  "target_ms": 1500,
  "status": "met",
  "tool": "Application Insights",
  "query": "requests | where timestamp > ago(30d) | summarize percentile(duration, 95)"
}
```

## Claims que requieren evidencia

Según [scripts/claim-guard.rules.json](../../scripts/claim-guard.rules.json):

- ROI y payback
- Multiplicadores (x2, x10)
- SLA y uptime específicos
- Porcentajes de mejora
- Certificaciones
- Casos de éxito

**Regla:** Si aparece en README/marketing, debe tener enlace a evidencia en esta carpeta.

## Estado actual

⚠️ **En construcción** - Añadiendo evidencias reales según se recopilan métricas en producción.

Próximos items:
- [ ] API p95 latency (Application Insights)
- [ ] Frontend Lighthouse scores
- [ ] Load test results (k6)
- [ ] Caso de éxito piloto #1 (bajo NDA)


