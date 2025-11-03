# FinOps - Control de Costes IA

## Headers en respuestas API

Todas las respuestas `/v1/*` incluyen:

```
X-Est-Cost-EUR: 0.0023
X-Budget-Pct: 15
X-Latency-ms: 234
X-Route: chat
X-Correlation-Id: uuid-v4
```

## Límites por tenant

```json
{
  "tenant_id": "acme-corp",
  "limits": {
    "daily_eur": 50.00,
    "monthly_eur": 1200.00,
    "hard_stop": true,
    "current_daily": 12.34,
    "current_monthly": 456.78
  }
}
```

## Métricas EUR por tarea p95

Medición por agente y modelo:

- Chat NEURA CEO (Claude Sonnet 4.5): EUR 0.004 p95
- Chat NEURA CFO (GPT-5): EUR 0.003 p95
- Multi-actor (3 NEURAs): EUR 0.012 p95
- Webhook Make.com: EUR 0.001 p95

**Nota:** Cifras orientativas. Verificar en [docs/evidence/slos/](../evidence/slos/) para datos reales.

## Hard-stop

Si `current >= limit`:
- Respuesta: `402 Payment Required`
- Body: `{ "error": "Budget exceeded", "limit": 50.00, "current": 50.12 }`
- Acción: usuario debe aumentar límite o esperar reset diario/mensual

## Forecast

Dashboard mensual con:
- Tendencia últimos 7 días
- Proyección fin de mes
- Alertas si proyección > límite * 0.9


