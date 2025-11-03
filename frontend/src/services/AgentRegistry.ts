/**
 * Registro de agentes automatizados disponibles
 * Cada agente tiene triggers, capacidades y tipo de ejecución
 */

import { Agent } from '../types/agent';

export const AGENT_REGISTRY: Agent[] = [
  // AGENTES DE REPORTES Y ANÁLISIS
  {
    id: 'sales-report-generator',
    name: 'Generador de Reportes de Ventas',
    description: 'Genera reportes automáticos de ventas con métricas y gráficos',
    capabilities: ['generar reportes', 'análisis de datos', 'métricas de ventas'],
    triggers: ['reporte', 'ventas', 'análisis', 'métricas', 'dashboard', 'estadísticas'],
    executionType: 'make',
    status: 'active',
    icon: '📊',
    category: 'reportes'
  },
  {
    id: 'financial-analysis',
    name: 'Analizador Financiero',
    description: 'Analiza datos financieros y genera insights automáticos',
    capabilities: ['análisis financiero', 'proyecciones', 'ROI', 'costos'],
    triggers: ['financiero', 'costos', 'presupuesto', 'inversión', 'ROI', 'análisis'],
    executionType: 'make',
    status: 'active',
    icon: '💰',
    category: 'finanzas'
  },

  // AGENTES DE MARKETING
  {
    id: 'campaign-optimizer',
    name: 'Optimizador de Campañas',
    description: 'Optimiza automáticamente campañas de marketing digital',
    capabilities: ['optimización', 'A/B testing', 'métricas de campaña'],
    triggers: ['campaña', 'marketing', 'optimizar', 'conversión', 'CTR', 'ROAS'],
    executionType: 'make',
    status: 'active',
    icon: '📈',
    category: 'marketing'
  },
  {
    id: 'social-media-scheduler',
    name: 'Programador de Redes Sociales',
    description: 'Programa y publica contenido en redes sociales automáticamente',
    capabilities: ['programación', 'publicación', 'redes sociales', 'contenido'],
    triggers: ['redes sociales', 'publicar', 'programar', 'contenido', 'social media'],
    executionType: 'make',
    status: 'active',
    icon: '📱',
    category: 'marketing'
  },

  // AGENTES DE OPERACIONES
  {
    id: 'inventory-manager',
    name: 'Gestor de Inventario',
    description: 'Gestiona inventario y alertas de stock automáticamente',
    capabilities: ['inventario', 'stock', 'alertas', 'reabastecimiento'],
    triggers: ['inventario', 'stock', 'almacén', 'productos', 'reabastecer'],
    executionType: 'make',
    status: 'active',
    icon: '📦',
    category: 'operaciones'
  },
  {
    id: 'customer-support-automation',
    name: 'Automatización de Soporte',
    description: 'Automatiza respuestas y tickets de soporte al cliente',
    capabilities: ['soporte', 'tickets', 'respuestas automáticas', 'chatbot'],
    triggers: ['soporte', 'cliente', 'ticket', 'ayuda', 'problema', 'resolver'],
    executionType: 'make',
    status: 'active',
    icon: '🎧',
    category: 'soporte'
  },

  // AGENTES DE RECURSOS HUMANOS
  {
    id: 'hr-recruitment',
    name: 'Reclutador Automático',
    description: 'Automatiza procesos de reclutamiento y selección',
    capabilities: ['reclutamiento', 'selección', 'CVs', 'entrevistas'],
    triggers: ['reclutar', 'contratar', 'empleado', 'candidato', 'selección', 'HR'],
    executionType: 'make',
    status: 'active',
    icon: '👥',
    category: 'recursos humanos'
  },
  {
    id: 'employee-onboarding',
    name: 'Onboarding Automático',
    description: 'Automatiza procesos de incorporación de empleados',
    capabilities: ['onboarding', 'incorporación', 'documentación', 'capacitación'],
    triggers: ['onboarding', 'incorporar', 'nuevo empleado', 'bienvenida'],
    executionType: 'make',
    status: 'active',
    icon: '🚀',
    category: 'recursos humanos'
  },

  // AGENTES DE SEGURIDAD
  {
    id: 'security-monitor',
    name: 'Monitor de Seguridad',
    description: 'Monitorea y alerta sobre amenazas de seguridad',
    capabilities: ['monitoreo', 'seguridad', 'alertas', 'amenazas'],
    triggers: ['seguridad', 'monitoreo', 'amenaza', 'vulnerabilidad', 'auditoría'],
    executionType: 'make',
    status: 'active',
    icon: '🔒',
    category: 'seguridad'
  },
  {
    id: 'compliance-checker',
    name: 'Verificador de Cumplimiento',
    description: 'Verifica cumplimiento de regulaciones y políticas',
    capabilities: ['cumplimiento', 'regulaciones', 'auditoría', 'políticas'],
    triggers: ['cumplimiento', 'regulación', 'auditoría', 'política', 'GDPR'],
    executionType: 'make',
    status: 'active',
    icon: '✅',
    category: 'seguridad'
  },

  // AGENTES DE DESARROLLO
  {
    id: 'code-reviewer',
    name: 'Revisor de Código',
    description: 'Revisa automáticamente código y sugiere mejoras',
    capabilities: ['revisión', 'código', 'calidad', 'mejoras'],
    triggers: ['código', 'revisar', 'desarrollo', 'programación', 'calidad'],
    executionType: 'make',
    status: 'active',
    icon: '💻',
    category: 'desarrollo'
  },
  {
    id: 'deployment-automation',
    name: 'Automatización de Despliegues',
    description: 'Automatiza procesos de despliegue y CI/CD',
    capabilities: ['despliegue', 'CI/CD', 'automatización', 'deployment'],
    triggers: ['desplegar', 'deployment', 'CI/CD', 'producción', 'release'],
    executionType: 'make',
    status: 'active',
    icon: '🚀',
    category: 'desarrollo'
  }
];

/**
 * Buscar agentes por palabras clave
 */
export function findAgentsByKeywords(keywords: string[]): Agent[] {
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  
  return AGENT_REGISTRY.filter(agent => 
    agent.status === 'active' &&
    agent.triggers.some(trigger => 
      lowerKeywords.some(keyword => 
        trigger.toLowerCase().includes(keyword) || 
        keyword.includes(trigger.toLowerCase())
      )
    )
  );
}

/**
 * Obtener agente por ID
 */
export function getAgentById(id: string): Agent | undefined {
  return AGENT_REGISTRY.find(agent => agent.id === id);
}

/**
 * Obtener agentes por categoría
 */
export function getAgentsByCategory(category: string): Agent[] {
  return AGENT_REGISTRY.filter(agent => 
    agent.status === 'active' && 
    agent.category === category
  );
}

/**
 * Obtener todas las categorías disponibles
 */
export function getAvailableCategories(): string[] {
  return [...new Set(AGENT_REGISTRY.map(agent => agent.category))];
}
