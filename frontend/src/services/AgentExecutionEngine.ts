/**
 * Motor de ejecución de agentes automatizados
 * Analiza contexto del chat y ejecuta agentes basado en razonamiento
 */

import { Agent, AgentExecutionRequest, AgentExecution, ExecutionResult, AgentExecutionContext } from '../types/agent';
import { AGENT_REGISTRY, findAgentsByKeywords } from './AgentRegistry';

export class AgentExecutionEngine {
  private executions: Map<string, AgentExecution> = new Map();
  private executionCounter = 0;

  /**
   * Analizar contexto del chat y determinar qué agentes ejecutar
   */
  async analyzeChatContext(messages: any[], userIntent: string): Promise<AgentExecutionRequest> {
    // Extraer palabras clave del contexto
    const contextText = messages.map(m => m.content).join(' ').toLowerCase();
    const intentText = userIntent.toLowerCase();
    const allText = `${contextText} ${intentText}`;

    // Palabras clave extraídas del contexto
    const keywords = this.extractKeywords(allText);
    
    // Buscar agentes relevantes
    const suggestedAgents = findAgentsByKeywords(keywords);
    
    // Generar razonamiento
    const reasoning = this.generateReasoning(keywords, suggestedAgents, userIntent);
    
    // Calcular confianza
    const confidence = this.calculateConfidence(keywords, suggestedAgents);

    return {
      chatContext: contextText,
      userIntent,
      suggestedAgents: suggestedAgents.map(a => a.id),
      reasoning,
      confidence
    };
  }

  /**
   * Ejecutar agente específico
   */
  async executeAgent(agentId: string, context: string, userId: string, chatId: string): Promise<ExecutionResult> {
    const agent = AGENT_REGISTRY.find(a => a.id === agentId);
    if (!agent) {
      throw new Error(`Agente ${agentId} no encontrado`);
    }

    const executionId = `exec_${++this.executionCounter}_${Date.now()}`;
    const startTime = new Date().toISOString();

    // Crear ejecución
    const execution: AgentExecution = {
      id: executionId,
      agentId,
      agentName: agent.name,
      status: 'pending',
      startTime,
      reasoning: `Ejecutando ${agent.name} basado en: ${context}`,
    };

    this.executions.set(executionId, execution);

    try {
      // Simular ejecución del agente
      execution.status = 'running';
      
      // Aquí iría la lógica real de ejecución del agente
      const result = await this.simulateAgentExecution(agent, context);
      
      execution.status = 'completed';
      execution.endTime = new Date().toISOString();
      execution.result = result;

      return {
        success: true,
        data: result,
        executionTime: Date.now() - new Date(startTime).getTime(),
        agentId
      };

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date().toISOString();
      execution.error = error instanceof Error ? error.message : 'Error desconocido';

      return {
        success: false,
        error: execution.error,
        executionTime: Date.now() - new Date(startTime).getTime(),
        agentId
      };
    }
  }

  /**
   * Obtener ejecuciones activas
   */
  getActiveExecutions(): AgentExecution[] {
    return Array.from(this.executions.values()).filter(
      exec => exec.status === 'running' || exec.status === 'pending'
    );
  }

  /**
   * Obtener historial de ejecuciones
   */
  getExecutionHistory(): AgentExecution[] {
    return Array.from(this.executions.values()).sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  /**
   * Obtener ejecución por ID
   */
  getExecutionById(id: string): AgentExecution | undefined {
    return this.executions.get(id);
  }

  /**
   * Extraer palabras clave del texto
   */
  private extractKeywords(text: string): string[] {
    // Palabras comunes a ignorar
    const stopWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'una', 'unas', 'unos', 'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas', 'aquel', 'aquella', 'aquellos', 'aquellas'];
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remover puntuación
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 10); // Máximo 10 palabras clave
  }

  /**
   * Generar razonamiento para la ejecución
   */
  private generateReasoning(keywords: string[], agents: Agent[], userIntent: string): string {
    if (agents.length === 0) {
      return `No se encontraron agentes relevantes para: "${userIntent}". Palabras clave detectadas: ${keywords.join(', ')}`;
    }

    const agentNames = agents.map(a => a.name).join(', ');
    const keywordList = keywords.join(', ');
    
    return `Basado en el análisis del contexto, se sugieren los siguientes agentes: ${agentNames}. 
    Palabras clave detectadas: ${keywordList}. 
    Intención del usuario: ${userIntent}. 
    Estos agentes pueden ayudar a automatizar las tareas relacionadas con la solicitud.`;
  }

  /**
   * Calcular nivel de confianza
   */
  private calculateConfidence(keywords: string[], agents: Agent[]): number {
    if (agents.length === 0) return 0;
    
    // Calcular confianza basada en número de matches
    const totalTriggers = agents.reduce((sum, agent) => sum + agent.triggers.length, 0);
    const matchedTriggers = agents.reduce((sum, agent) => {
      return sum + agent.triggers.filter(trigger => 
        keywords.some(keyword => 
          trigger.toLowerCase().includes(keyword) || 
          keyword.includes(trigger.toLowerCase())
        )
      ).length;
    }, 0);

    return Math.min(matchedTriggers / totalTriggers, 1);
  }

  /**
   * Simular ejecución del agente (placeholder)
   */
  private async simulateAgentExecution(agent: Agent, context: string): Promise<any> {
    // Simular tiempo de ejecución
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simular resultado basado en el tipo de agente
    const result = {
      agentId: agent.id,
      agentName: agent.name,
      executionTime: Date.now(),
      result: this.generateSimulatedResult(agent, context),
      status: 'completed'
    };

    return result;
  }

  /**
   * Generar resultado simulado
   */
  private generateSimulatedResult(agent: Agent, context: string): any {
    const results = {
      'sales-report-generator': {
        reportUrl: 'https://reports.econeura.com/sales-2025.pdf',
        metrics: { totalSales: 125000, growth: 15.2, topProduct: 'Producto A' },
        charts: ['sales-trend.png', 'product-breakdown.png']
      },
      'financial-analysis': {
        insights: ['ROI positivo del 23%', 'Reducción de costos del 8%', 'Proyección de crecimiento del 12%'],
        recommendations: ['Optimizar presupuesto de marketing', 'Invertir en automatización'],
        riskLevel: 'Bajo'
      },
      'campaign-optimizer': {
        optimizations: ['Aumentar presupuesto en Google Ads', 'Mejorar targeting de audiencia'],
        expectedImprovement: '15% más conversiones',
        newBudget: 5000
      },
      'inventory-manager': {
        alerts: ['Stock bajo en Producto B', 'Reabastecer Producto C'],
        recommendations: ['Aumentar stock de productos populares', 'Reducir stock de productos lentos']
      }
    };

    return results[agent.id as keyof typeof results] || {
      message: `Agente ${agent.name} ejecutado exitosamente`,
      context: context,
      timestamp: new Date().toISOString()
    };
  }
}

// Instancia singleton
export const agentExecutionEngine = new AgentExecutionEngine();
