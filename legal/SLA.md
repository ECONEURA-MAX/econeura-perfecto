# Service Level Agreement (SLA)

**PLANTILLA - Solo para clientes enterprise con contrato firmado**

**Última actualización:** Noviembre 2025

## 1. Ámbito

Este SLA aplica a clientes con plan **Premium Enterprise** o superior.

## 2. Disponibilidad

### Compromiso de uptime

**99.5% mensual** (medido como disponibilidad de API `/v1/health`)

Cálculo:
- Periodo: mes natural
- Downtime excluye: mantenimiento programado (notificado 7 días antes)
- Medición: synthetic checks cada 5 minutos desde 3 regiones EU

### Downtime excluido

- Mantenimiento programado (máximo 4 horas/mes, notificado)
- Fuerza mayor (desastres naturales, guerra, pandemias)
- Problemas en proveedores externos (Azure outage)
- Abuso/ataques DDoS
- Configuración incorrecta del Cliente

## 3. Créditos por incumplimiento

Si uptime < 99.5% mensual:

| Uptime real | Crédito |
|-------------|---------|
| 99.0% - 99.49% | 10% MRR |
| 98.0% - 98.99% | 25% MRR |
| < 98.0% | 50% MRR |

### Solicitud de créditos

- Plazo: 30 días tras fin del mes afectado
- Método: email a sla@econeura.com con evidencia
- Aplicación: descuento en próxima factura

## 4. Soporte

### Niveles de severidad

**Sev 1 (Crítico):** Servicio caído
- Respuesta: 1 hora
- Actualización: cada 2 horas
- Disponibilidad: 24/7

**Sev 2 (Alto):** Funcionalidad importante degradada
- Respuesta: 4 horas laborables
- Actualización: cada día laborable
- Disponibilidad: 9h-18h CET

**Sev 3 (Medio):** Problema menor
- Respuesta: 1 día laborable
- Disponibilidad: 9h-18h CET

**Sev 4 (Bajo):** Consulta/feature request
- Respuesta: 3 días laborables
- Disponibilidad: 9h-18h CET

### Canales de soporte

- Email: support@econeura.com (Sev 3-4)
- Slack dedicado: Sev 1-2 (solo enterprise)
- Teléfono: +34 XXX XXX XXX (Sev 1, solo 24/7)

## 5. Objetivos de rendimiento (no contractuales)

**Objetivos, no garantías:**
- API p95 < 1500 ms
- UI p95 < 2000 ms
- Error rate < 1%

Ver [docs/ops/SLO_SLA.md](../docs/ops/SLO_SLA.md) para SLO completos.

## 6. Seguridad

- Notificación de brechas: < 72 horas (GDPR)
- Pentests: anuales (resumen disponible bajo NDA)
- Certificaciones objetivo: ISO 27001, SOC 2 (roadmap 2026)

## 7. Cambios

SLA puede modificarse con notificación 90 días. Cliente puede cancelar si no acepta cambios.

## Contacto

Email: sla@econeura.com  
Emergencias (Sev 1): +34 XXX XXX XXX


