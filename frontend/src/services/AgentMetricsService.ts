/**
 * ECONEURA - Agent Metrics Service
 * Servicio para tracking y análisis de métricas de agentes
 */

export interface AgentMetrics {
  agentId: string;
  totalExecutions: number;
  successRate: number;
  averageLatency: number;
  totalTokens: number;
  totalCost: number;
  lastExecution?: Date;
  weeklyTrend: number;
  errorCount: number;
}

export interface ModelConsumption {
  model: string;
  executions: number;
  tokens: number;
  cost: number;
  averageLatency: number;
  errorRate: number;
}

export interface ProviderFallback {
  timestamp: Date;
  primaryProvider: string;
  fallbackProvider: string;
  fallbackReason: string;
  agentId: string;
}

export interface SystemHealth {
  systemStatus: 'healthy' | 'degraded' | 'critical';
  activeAgents: number;
  averageLatency: number;
  errorRate: number;
  uptime: number;
}

export interface ExecutionLog {
  agentId: string;
  agentTitle: string;
  department: string;
  prompt: string;
  response: string;
  model: string;
  tokens: number;
  cost: number;
  latency: number;
  status: 'success' | 'error';
  timestamp?: Date;
  errorMessage?: string;
  userId: string;
}

class AgentMetricsService {
  private executionLogs: ExecutionLog[] = [];
  private maxLogs = 1000;

  /**
   * Registrar una ejecución de agente
   */
  logExecution(log: ExecutionLog) {
    const execution = {
      ...log,
      timestamp: log.timestamp || new Date()
    };

    this.executionLogs.push(execution);

    // Mantener solo los últimos N logs
    if (this.executionLogs.length > this.maxLogs) {
      this.executionLogs.shift();
    }

    // Guardar en localStorage para persistencia
    this.saveToStorage();
  }

  /**
   * Obtener métricas de un agente específico
   */
  getAgentMetrics(agentId: string): AgentMetrics {
    const agentLogs = this.executionLogs.filter(log => log.agentId === agentId);

    if (agentLogs.length === 0) {
      return {
        agentId,
        totalExecutions: 0,
        successRate: 0,
        averageLatency: 0,
        totalTokens: 0,
        totalCost: 0,
        weeklyTrend: 0,
        errorCount: 0
      };
    }

    const successCount = agentLogs.filter(log => log.status === 'success').length;
    const totalLatency = agentLogs.reduce((sum, log) => sum + log.latency, 0);
    const totalTokens = agentLogs.reduce((sum, log) => sum + log.tokens, 0);
    const totalCost = agentLogs.reduce((sum, log) => sum + log.cost, 0);
    const errorCount = agentLogs.filter(log => log.status === 'error').length;

    // Calcular tendencia semanal (últimos 7 días vs 7 días anteriores)
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

    const lastWeekLogs = agentLogs.filter(log => log.timestamp!.getTime() >= weekAgo);
    const previousWeekLogs = agentLogs.filter(
      log => log.timestamp!.getTime() >= twoWeeksAgo && log.timestamp!.getTime() < weekAgo
    );

    const weeklyTrend = previousWeekLogs.length > 0
      ? Math.round(((lastWeekLogs.length - previousWeekLogs.length) / previousWeekLogs.length) * 100)
      : 0;

    return {
      agentId,
      totalExecutions: agentLogs.length,
      successRate: Math.round((successCount / agentLogs.length) * 100),
      averageLatency: Math.round(totalLatency / agentLogs.length),
      totalTokens,
      totalCost,
      lastExecution: agentLogs[agentLogs.length - 1].timestamp,
      weeklyTrend,
      errorCount
    };
  }

  /**
   * Obtener métricas de todos los agentes
   */
  getAllAgentMetrics(): AgentMetrics[] {
    const agentIds = [...new Set(this.executionLogs.map(log => log.agentId))];
    return agentIds.map(id => this.getAgentMetrics(id));
  }

  /**
   * Obtener consumo por modelo
   */
  getModelConsumption(): ModelConsumption[] {
    const modelMap = new Map<string, ExecutionLog[]>();

    this.executionLogs.forEach(log => {
      if (!modelMap.has(log.model)) {
        modelMap.set(log.model, []);
      }
      modelMap.get(log.model)!.push(log);
    });

    const consumption: ModelConsumption[] = [];

    modelMap.forEach((logs, model) => {
      const executions = logs.length;
      const tokens = logs.reduce((sum, log) => sum + log.tokens, 0);
      const cost = logs.reduce((sum, log) => sum + log.cost, 0);
      const totalLatency = logs.reduce((sum, log) => sum + log.latency, 0);
      const errorCount = logs.filter(log => log.status === 'error').length;

      consumption.push({
        model,
        executions,
        tokens,
        cost,
        averageLatency: Math.round(totalLatency / executions),
        errorRate: Math.round((errorCount / executions) * 100)
      });
    });

    return consumption.sort((a, b) => b.executions - a.executions);
  }

  /**
   * Obtener fallbacks recientes
   */
  getFallbacks(): ProviderFallback[] {
    // Por ahora retornamos array vacío
    // En producción, esto vendría del backend
    return [];
  }

  /**
   * Obtener estado de salud del sistema
   */
  getSystemHealth(): SystemHealth {
    const recentLogs = this.executionLogs.filter(
      log => Date.now() - log.timestamp!.getTime() < 60 * 60 * 1000 // última hora
    );

    if (recentLogs.length === 0) {
      return {
        systemStatus: 'healthy',
        activeAgents: 0,
        averageLatency: 0,
        errorRate: 0,
        uptime: 100
      };
    }

    const errorCount = recentLogs.filter(log => log.status === 'error').length;
    const errorRate = Math.round((errorCount / recentLogs.length) * 100);
    const totalLatency = recentLogs.reduce((sum, log) => sum + log.latency, 0);
    const averageLatency = Math.round(totalLatency / recentLogs.length);
    const activeAgents = new Set(recentLogs.map(log => log.agentId)).size;

    let systemStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (errorRate > 20 || averageLatency > 5000) {
      systemStatus = 'critical';
    } else if (errorRate > 10 || averageLatency > 3000) {
      systemStatus = 'degraded';
    }

    return {
      systemStatus,
      activeAgents,
      averageLatency,
      errorRate,
      uptime: 100 - errorRate
    };
  }

  /**
   * Limpiar logs antiguos
   */
  clearOldLogs(daysOld: number = 30) {
    const cutoffDate = Date.now() - daysOld * 24 * 60 * 60 * 1000;
    this.executionLogs = this.executionLogs.filter(
      log => log.timestamp!.getTime() >= cutoffDate
    );
    this.saveToStorage();
  }

  /**
   * Guardar en localStorage
   */
  private saveToStorage() {
    try {
      localStorage.setItem('econeura-metrics', JSON.stringify(this.executionLogs));
    } catch (error) {
      console.warn('No se pudo guardar métricas en localStorage:', error);
    }
  }

  /**
   * Cargar desde localStorage
   */
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('econeura-metrics');
      if (stored) {
        this.executionLogs = JSON.parse(stored).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
    } catch (error) {
      console.warn('No se pudo cargar métricas desde localStorage:', error);
    }
  }

  /**
   * Exportar métricas a CSV
   */
  exportToCSV(): string {
    const headers = ['Timestamp', 'Agent', 'Department', 'Model', 'Tokens', 'Cost', 'Latency', 'Status'];
    const rows = this.executionLogs.map(log => [
      log.timestamp?.toISOString(),
      log.agentTitle,
      log.department,
      log.model,
      log.tokens,
      log.cost.toFixed(4),
      log.latency,
      log.status
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  /**
   * Obtener estadísticas globales
   */
  getGlobalStats() {
    const totalExecutions = this.executionLogs.length;
    const successCount = this.executionLogs.filter(log => log.status === 'success').length;
    const totalCost = this.executionLogs.reduce((sum, log) => sum + log.cost, 0);
    const totalTokens = this.executionLogs.reduce((sum, log) => sum + log.tokens, 0);

    return {
      totalExecutions,
      successRate: totalExecutions > 0 ? Math.round((successCount / totalExecutions) * 100) : 0,
      totalCost,
      totalTokens,
      activeAgents: new Set(this.executionLogs.map(log => log.agentId)).size,
      averageCostPerExecution: totalExecutions > 0 ? totalCost / totalExecutions : 0
    };
  }
}

// Singleton instance
export const agentMetricsService = new AgentMetricsService();

// Cargar datos al iniciar
if (typeof window !== 'undefined') {
  (agentMetricsService as any).loadFromStorage();
}
