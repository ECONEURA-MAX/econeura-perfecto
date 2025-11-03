# SLO y SLA

## Service Level Objectives (SLO)

**Objetivos internos, no garantías contractuales:**

- API p95 < 1500 ms (objetivo)
- UI p95 < 2000 ms (objetivo)
- Error rate < 1% (objetivo)
- Availability > 99% (objetivo mensual)

## Error Budget

Ventana móvil: 28 días

Cálculo:
- Disponibilidad objetivo: 99%
- Error budget: 1% mensual = ~7.2 horas/mes
- Si se agota: freeze de features, solo hotfixes

## Medición

- Métricas via Application Insights
- Paneles OTel con p50/p95/p99
- Alertas en Slack/Teams cuando budget < 20%

## SLA (Service Level Agreement)

**Para clientes enterprise (contrato firmado):**

Ver [legal/SLA.md](../../legal/SLA.md) para términos legales.

SLA contractual típico:
- Uptime 99.5% mensual
- Créditos si < 99.5%: 10% MRR
- Créditos si < 99%: 25% MRR
- Exclusiones: mantenimiento programado, fuerza mayor

**Nota:** SLO != SLA. SLO son objetivos internos más exigentes que SLA contractuales.


