// LIVE METRICS PANEL - Métricas dinámicas con refresh cada 5s
// Archivo: frontend/src/components/LiveMetricsPanel.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Zap,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { agentMetricsService, AgentMetrics, ModelConsumption, ProviderFallback } from '../services/AgentMetricsService';

interface LiveMetricsPanelProps {
  className?: string;
}

export function LiveMetricsPanel({ className = '' }: LiveMetricsPanelProps) {
  const [metrics, setMetrics] = useState<AgentMetrics[]>([]);
  const [modelConsumption, setModelConsumption] = useState<ModelConsumption[]>([]);
  const [fallbacks, setFallbacks] = useState<ProviderFallback[]>([]);
  const [systemHealth, setSystemHealth] = useState(agentMetricsService.getSystemHealth());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // === REFRESH AUTOMÁTICO CADA 5 SEGUNDOS ===
  useEffect(() => {
    const refreshData = () => {
      setIsRefreshing(true);
      
      // Simular delay de red
      setTimeout(() => {
        setMetrics(agentMetricsService.getAllAgentMetrics());
        setModelConsumption(agentMetricsService.getModelConsumption());
        setFallbacks(agentMetricsService.getFallbacks());
        setSystemHealth(agentMetricsService.getSystemHealth());
        setLastUpdate(new Date());
        setIsRefreshing(false);
      }, 200);
    };

    // Refresh inicial
    refreshData();

    // Refresh cada 5 segundos
    const interval = setInterval(refreshData, 5000);

    return () => clearInterval(interval);
  }, []);

  // === MÉTRICAS CALCULADAS ===
  const totalExecutions = useMemo(() => 
    metrics.reduce((sum, m) => sum + m.totalExecutions, 0), [metrics]
  );

  const totalCost = useMemo(() => 
    metrics.reduce((sum, m) => sum + m.totalCost, 0), [metrics]
  );

  const averageSuccessRate = useMemo(() => 
    metrics.length > 0 
      ? Math.round(metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length)
      : 0, [metrics]
  );

  const topPerformingAgent = useMemo(() => 
    metrics.reduce((top, current) => 
      current.successRate > top.successRate ? current : top, 
      metrics[0] || { successRate: 0, agentId: 'N/A' }
    ), [metrics]
  );

  const recentFallbacks = useMemo(() => 
    fallbacks.slice(-5).reverse(), [fallbacks]
  );

  // === COMPONENTES DE MÉTRICA ===
  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    color = 'blue',
    subtitle 
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    trend?: number;
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
    subtitle?: string;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      red: 'bg-red-50 text-red-700 border-red-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200'
    };

    return (
      <div className={`p-4 rounded-xl border-2 ${colorClasses[color]} transition-all duration-300 hover:scale-105 hover:shadow-lg`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Icon className="w-5 h-5" />
            <span className="font-semibold text-sm">{title}</span>
          </div>
          {trend !== undefined && (
            <div className={`flex items-center space-x-1 text-xs ${
              trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {trend > 0 ? <TrendingUp className="w-3 h-3" /> : 
               trend < 0 ? <TrendingDown className="w-3 h-3" /> : null}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <div className="text-xs opacity-75 mt-1">{subtitle}</div>}
      </div>
    );
  };

  const SystemStatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      healthy: { color: 'green', icon: CheckCircle, text: 'Sistema Saludable' },
      degraded: { color: 'yellow', icon: AlertTriangle, text: 'Rendimiento Degradado' },
      critical: { color: 'red', icon: AlertTriangle, text: 'Sistema Crítico' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.healthy;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
        config.color === 'green' ? 'bg-green-100 text-green-800' :
        config.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        <Icon className="w-4 h-4" />
        <span>{config.text}</span>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* HEADER CON REFRESH */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Métricas en Tiempo Real</h2>
          <SystemStatusBadge status={systemHealth.systemStatus} />
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Última actualización: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* MÉTRICAS PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Ejecuciones Totales"
          value={totalExecutions.toLocaleString()}
          icon={Activity}
          color="blue"
          subtitle={`${systemHealth.activeAgents} agentes activos`}
        />
        
        <MetricCard
          title="Tasa de Éxito"
          value={`${averageSuccessRate}%`}
          icon={CheckCircle}
          color={averageSuccessRate >= 90 ? 'green' : averageSuccessRate >= 70 ? 'yellow' : 'red'}
          subtitle="Promedio del sistema"
        />
        
        <MetricCard
          title="Latencia Promedio"
          value={`${Math.round(systemHealth.averageLatency)}ms`}
          icon={Clock}
          color={systemHealth.averageLatency < 2000 ? 'green' : systemHealth.averageLatency < 5000 ? 'yellow' : 'red'}
          subtitle="Tiempo de respuesta"
        />
        
        <MetricCard
          title="Costo Total"
          value={`€${totalCost.toFixed(2)}`}
          icon={DollarSign}
          color="purple"
          subtitle="Gasto acumulado"
        />
      </div>

      {/* CONSUMO POR MODELO */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Zap className="w-5 h-5 text-blue-600" />
          <span>Consumo por Modelo</span>
        </h3>
        
        {modelConsumption.length > 0 ? (
          <div className="space-y-3">
            {modelConsumption.map((model, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{model.model}</div>
                  <div className="text-sm text-gray-500">
                    {model.executions} ejecuciones • {model.tokens.toLocaleString()} tokens
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">€{model.cost.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">{model.averageLatency}ms avg</div>
                </div>
                <div className="ml-4">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    model.errorRate < 5 ? 'bg-green-100 text-green-800' :
                    model.errorRate < 15 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {model.errorRate}% errores
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay datos de consumo aún</p>
            <p className="text-sm">Los datos aparecerán cuando se ejecuten agentes</p>
          </div>
        )}
      </div>

      {/* FALLBACKS RECIENTES */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <span>Fallbacks Recientes</span>
        </h3>
        
        {recentFallbacks.length > 0 ? (
          <div className="space-y-2">
            {recentFallbacks.map((fallback, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {fallback.primaryProvider} → {fallback.fallbackProvider}
                  </div>
                  <div className="text-sm text-gray-600">{fallback.fallbackReason}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {fallback.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay fallbacks recientes</p>
            <p className="text-xs">Todos los proveedores funcionando correctamente</p>
          </div>
        )}
      </div>

      {/* AGENTE TOP PERFORMER */}
      {topPerformingAgent.agentId !== 'N/A' && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>Agente Top Performer</span>
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-lg text-gray-900">{topPerformingAgent.agentId}</div>
              <div className="text-sm text-gray-600">
                {topPerformingAgent.totalExecutions} ejecuciones • 
                {topPerformingAgent.totalTokens.toLocaleString()} tokens • 
                €{topPerformingAgent.totalCost.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{topPerformingAgent.successRate}%</div>
              <div className="text-sm text-gray-600">Tasa de éxito</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

