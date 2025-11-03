import React, { useMemo, useState, useEffect, useRef, memo } from "react";
import { Link } from "react-router-dom";
import {
  Crown, Cpu, Shield, Workflow, Users, Target, Brain, LineChart, Wallet, Database,
  ShieldCheck, UserCheck, MessageCircle, ClipboardList, Megaphone, FileText, Radar,
  Bug, Gauge, Activity as ActivityIcon, Inbox, Mail, TrendingUp, FileBarChart2, ListChecks, CalendarDays,
  Mic, MicOff, Volume2, StopCircle, Play, Pause, Zap, Moon, Sun, User, LogOut, Settings, Menu, X,
  DollarSign, FileCheck, Clock, Send, Book, Globe
} from "lucide-react";
// Imports de componentes premium removidos - manteniendo diseño original
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { WorkflowManager } from './components/WorkflowManager';
import { shouldExecuteAgentsForNeura, getSpecializedContext, getSpecializedReasoning, calculateAgentConfidence } from "./services/NeuraAgentIntegration";
import { ConnectAgentModal } from './components/ConnectAgentModal';
import { ChatHistory } from './components/ChatHistory';
// import { CustomerPortal } from './components/CustomerPortal'; // Component not exported
import { AgentExecutionPanel } from './components/AgentExecutionPanel';
import { LibraryPanel } from './components/LibraryPanel';
import { ReferencesBlock } from './components/ReferencesBlock';
import { HITLApprovalModal } from './components/HITLApprovalModal';
// Sistema de internacionalización eliminado - solo español
import { Toaster, toast } from "sonner";
import confetti from "canvas-confetti";
import Fuse from "fuse.js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Tipos exportados (únicos)
export type Agent = {
  id: string;
  title: string;
  desc: string;
  pills?: string[];
};

export interface Department {
  id: string;
  name: string;
  chips: string[];
  neura: {
    title: string;
    subtitle: string;
    tags: string[];
    // NUEVO: Métricas de VALOR
    value?: {
      timeSavedHoursMonth: number;    // Horas ahorradas/mes
      valueEurMonth: number;           // Valor en EUR/mes
      roiPercentage: number;           // ROI %
      problem: string;                 // Problema que resuelve
      solution: string;                // Solución que ofrece
    };
  };
  agents: Agent[];
}

import { cx } from './utils/classnames';
import { hexToRgb, rgba } from './utils/colors';
import { DepartmentButton } from './components/DepartmentButton';

// Tipo de actividad NEURA
type NeuraActivity = {
  id: string;
  ts: string;
  agentId: string;
  deptId: string;
  status: 'OK' | 'ERROR';
  message: string;
  executionId?: string;
};

/**
 * ECONEURA â€" Cockpit completo al 100%
 * - 10 NEURA con chat GPT-5 (simulado gratis o real con API key)
 * - 40 agentes Make con webhooks configurables
 * - Posibilidad de crear nuevos agentes
 * - UI exacta sin cambios de textos ni diseño
 */

// Tipos ahora importados desde ./types/

/**
 * Logo ECONEURA - Soporta imagen personalizada
 *
 * OPCIÓN 1: Usar imagen personalizada
 * Coloca tu imagen en: apps/web/public/logo-econeura.png
 * Formatos soportados: PNG, JPG, SVG, WEBP
 * Tamaño recomendado: 36x36px o múltiplos (72x72, 144x144)
 *
 * OPCIÓN 2: Usar SVG inline (fallback automático)
 * Si no hay imagen, usa el SVG del código
 */
// MEJORA 7: Memoization de componente logo para evitar re-renders
const LogoEconeura = memo(function LogoEconeura(): JSX.Element {
  const [useImage, setUseImage] = useState(true);
  const [imagePath] = useState('/logo-econeura.png'); // SVG para mejor calidad

  if (useImage) {
    return (
      <div className="relative flex-shrink-0 group">
        {/* Logo container con efecto glassmorphism premium */}
        <div className="relative w-8 h-8">
          {/* Borde circular con gradiente */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              padding: '1px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.8), rgba(20, 184, 166, 0.8), rgba(6, 182, 212, 0.8))',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)'
            }}
          ></div>
          {/* Inner glow effect */}
          <div className="absolute inset-[1px] rounded-full bg-gradient-to-br from-emerald-400/20 via-teal-400/20 to-cyan-400/20 blur-xl animate-pulse"></div>
          {/* Imagen circular */}
          <div className="absolute inset-[1px] rounded-full overflow-hidden transform transition-all duration-300 hover:scale-110">
          <img
            src={imagePath}
            alt="Logo ECONEURA"
            className="w-full h-full object-cover relative z-10"
            style={{
              filter: 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.4))',
              transform: 'scale(1.35) translateY(0px)',
              transformOrigin: 'center center',
              objectPosition: 'center'
            }}
            onError={() => setUseImage(false)}
          />
          </div>
        </div>
      </div>
    );
  }

  // SVG - Réplica EXACTA del logo circular (sin cambios)
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="ECONEURA"
      className="flex-shrink-0"
      style={{ borderRadius: '50%' }}
    >
      <title>ECONEURA</title>
      <defs>
        {/* Gradiente dorado realista */}
        <radialGradient id="goldGradient">
          <stop offset="0%" stopColor="#FFEB99" />
          <stop offset="30%" stopColor="#FFD54F" />
          <stop offset="70%" stopColor="#FFA726" />
          <stop offset="100%" stopColor="#F57C00" />
        </radialGradient>
        {/* Highlight */}
        <radialGradient id="highlight">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Fondo circular beige claro */}
      <circle cx="256" cy="256" r="256" fill="#F5F5DC"/>

      {/* Círculo borde verde azulado */}
      <circle cx="256" cy="256" r="240" fill="none" stroke="#0E6B67" strokeWidth="8"/>

      {/* Tronco principal central */}
      <rect x="246" y="130" width="20" height="260" fill="#0E6B67" rx="10"/>

      {/* Ramas superiores */}
      <path d="M 256 180 L 200 150 Q 195 148 190 150" stroke="#0E6B67" strokeWidth="16" fill="none" strokeLinecap="round"/>
      <path d="M 256 150 L 256 120" stroke="#0E6B67" strokeWidth="16" fill="none" strokeLinecap="round"/>
      <path d="M 256 180 L 312 150 Q 317 148 322 150" stroke="#0E6B67" strokeWidth="16" fill="none" strokeLinecap="round"/>

      {/* Ramas medias superiores */}
      <path d="M 256 220 L 180 200 Q 172 198 165 200" stroke="#0E6B67" strokeWidth="16" fill="none" strokeLinecap="round"/>
      <path d="M 256 220 L 332 200 Q 340 198 347 200" stroke="#0E6B67" strokeWidth="16" fill="none" strokeLinecap="round"/>

      {/* Ramas medias */}
      <path d="M 256 270 Q 220 265 170 275" stroke="#0E6B67" strokeWidth="16" fill="none" strokeLinecap="round"/>
      <path d="M 256 270 Q 292 265 342 275" stroke="#0E6B67" strokeWidth="16" fill="none" strokeLinecap="round"/>

      {/* Ramas inferiores con curvas */}
      <path d="M 256 320 Q 230 325 190 340" stroke="#0E6B67" strokeWidth="16" fill="none" strokeLinecap="round"/>
      <path d="M 256 320 Q 282 325 322 340" stroke="#0E6B67" strokeWidth="16" fill="none" strokeLinecap="round"/>

      {/* Ramas base inferiores */}
      <path d="M 256 360 Q 240 368 210 375" stroke="#0E6B67" strokeWidth="16" fill="none" strokeLinecap="round"/>
      <path d="M 256 360 Q 272 368 302 375" stroke="#0E6B67" strokeWidth="16" fill="none" strokeLinecap="round"/>

      {/* ESFERAS DORADAS CIRCULARES */}
      {/* Esfera superior central */}
      <circle cx="256" cy="110" r="24" fill="url(#goldGradient)"/>
      <circle cx="256" cy="110" r="24" fill="url(#highlight)" opacity="0.5"/>
      <circle cx="248" cy="102" r="8" fill="white" opacity="0.6"/>

      {/* Esferas nivel 1 */}
      <circle cx="190" cy="145" r="22" fill="url(#goldGradient)"/>
      <circle cx="190" cy="145" r="22" fill="url(#highlight)" opacity="0.5"/>
      <circle cx="183" cy="138" r="7" fill="white" opacity="0.6"/>

      <circle cx="322" cy="145" r="22" fill="url(#goldGradient)"/>
      <circle cx="322" cy="145" r="22" fill="url(#highlight)" opacity="0.5"/>
      <circle cx="315" cy="138" r="7" fill="white" opacity="0.6"/>

      {/* Esferas nivel 2 */}
      <circle cx="165" cy="195" r="22" fill="url(#goldGradient)"/>
      <circle cx="165" cy="195" r="22" fill="url(#highlight)" opacity="0.5"/>
      <circle cx="158" cy="188" r="7" fill="white" opacity="0.6"/>

      <circle cx="347" cy="195" r="22" fill="url(#goldGradient)"/>
      <circle cx="347" cy="195" r="22" fill="url(#highlight)" opacity="0.5"/>
      <circle cx="340" cy="188" r="7" fill="white" opacity="0.6"/>

      {/* Esferas nivel 3 */}
      <circle cx="170" cy="270" r="22" fill="url(#goldGradient)"/>
      <circle cx="170" cy="270" r="22" fill="url(#highlight)" opacity="0.5"/>
      <circle cx="163" cy="263" r="7" fill="white" opacity="0.6"/>

      <circle cx="342" cy="270" r="22" fill="url(#goldGradient)"/>
      <circle cx="342" cy="270" r="22" fill="url(#highlight)" opacity="0.5"/>
      <circle cx="335" cy="263" r="7" fill="white" opacity="0.6"/>

      {/* Esferas nivel 4 */}
      <circle cx="190" cy="335" r="22" fill="url(#goldGradient)"/>
      <circle cx="190" cy="335" r="22" fill="url(#highlight)" opacity="0.5"/>
      <circle cx="183" cy="328" r="7" fill="white" opacity="0.6"/>

      <circle cx="322" cy="335" r="22" fill="url(#goldGradient)"/>
      <circle cx="322" cy="335" r="22" fill="url(#highlight)" opacity="0.5"/>
      <circle cx="315" cy="328" r="7" fill="white" opacity="0.6"/>

      {/* Esferas nivel 5 base */}
      <circle cx="210" cy="372" r="22" fill="url(#goldGradient)"/>
      <circle cx="210" cy="372" r="22" fill="url(#highlight)" opacity="0.5"/>
      <circle cx="203" cy="365" r="7" fill="white" opacity="0.6"/>

      <circle cx="302" cy="372" r="22" fill="url(#goldGradient)"/>
      <circle cx="302" cy="372" r="22" fill="url(#highlight)" opacity="0.5"/>
      <circle cx="295" cy="365" r="7" fill="white" opacity="0.6"/>
    </svg>
  );
}); // Fin memo LogoEconeura

// Lectura de variables de entorno segura
const readVar = (winKey: string, viteKey: string, nodeKey: string): string | undefined => {
  const fromWin = (typeof window !== 'undefined' && (window as any)[winKey]) as string | undefined;
  const fromVite = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.[viteKey]) as string | undefined;
  const fromNode = (typeof process !== 'undefined' && (process as any)?.env?.[nodeKey]) as string | undefined;
  return fromWin || fromVite || fromNode || undefined;
};

// Auto-detecta producción vs local
const isProduction = typeof window !== 'undefined' && (
  window.location.hostname.includes('vercel.app') ||
  window.location.hostname.includes('econeura.com') ||
  window.location.hostname.includes('azurestaticapps.net')
);

const env = {
  GW_URL: readVar('__ECONEURA_GW_URL', 'VITE_NEURA_GW_URL', 'NEURA_GW_URL', 'VITE_API_URL') ||
          (isProduction ? 'https://econeura-backend-prod.azurewebsites.net' : 'http://localhost:8080'),
  GW_KEY: readVar('__ECONEURA_GW_KEY', 'VITE_NEURA_GW_KEY', 'NEURA_GW_KEY'),
  LA_ID:  readVar('__LA_WORKSPACE_ID', 'VITE_LA_WORKSPACE_ID', 'LA_WORKSPACE_ID'),
  LA_KEY: readVar('__LA_SHARED_KEY', 'VITE_LA_SHARED_KEY', 'LA_SHARED_KEY'),
};

const nowIso = () => new Date().toISOString();

function correlationId() {
  try {
    const rnd = (globalThis as any).crypto?.getRandomValues(new Uint32Array(4));
    if (rnd) return Array.from(rnd as Iterable<number>).map((n: number) => n.toString(16)).join("");
    throw new Error('no crypto');
  } catch {
    const r = () => Math.floor(Math.random() * 1e9).toString(16);
    return `${Date.now().toString(16)}${r()}${r()}`;
  }
}

// Función para comprimir imágenes
function compressImage(base64Image: string, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calcular nuevas dimensiones manteniendo aspect ratio
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Dibujar imagen redimensionada
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convertir a base64 con compresión
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    img.src = base64Image;
  });
}

// Obtener webhook Make por departamento
function getDeptWebhook(deptId: string): string | undefined {
  const envObj = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
  const key = `VITE_MAKE_WEBHOOK_${String(deptId).toUpperCase()}`;
  const url = envObj[key] as string | undefined;
  return url && /^https:\/\/hook\.[a-z0-9.-]+\.make\.com\//i.test(url) ? url : undefined;
}

async function invokeAgent(agentId: string, _route: 'local' | 'azure' = 'azure', payload: Record<string, unknown> = {}) {
  const base = (env.GW_URL || 'https://econeura-backend-prod.azurewebsites.net').replace(/\/$/, '');
  const url = `${base}/api/invoke/${agentId}`;

  try {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
        'X-Correlation-Id': correlationId(),
      },
      body: JSON.stringify({ input: payload?.input ?? "" }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json().catch(() => ({ ok: true, simulated: true, output: `Simulado ${agentId}` }));
  } catch {
    return { ok: true, simulated: true, output: `Simulado ${agentId}` };
  }
}

// Telemetría opcional Azure Log Analytics (solo si hay credenciales)
async function logActivity(row: Record<string, any>) {
  if (!env.LA_ID || !env.LA_KEY) return;
  const g: any = globalThis as any;
  if (!g.crypto || !g.crypto.subtle) return;
  if (typeof g.atob !== 'function' || typeof g.btoa !== 'function') return;
  try {
    const body = JSON.stringify([{ ...row, TimeGenerated: nowIso(), Product: 'ECONEURA', Type: 'EconeuraLogs' }]);
    const endpoint = `https://${env.LA_ID}.ods.opinsights.azure.com/api/logs?api-version=2016-04-01`;
    const keyBytes = Uint8Array.from(g.atob(String(env.LA_KEY)), (c: string) => c.charCodeAt(0));
    const crypto = g.crypto.subtle;
    const k = await crypto.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const date = nowIso();
    const toSign = new TextEncoder().encode(`POST\n${body.length}\napplication/json\nx-ms-date:${date}\n/api/logs`);
    const sig = await crypto.sign('HMAC', k, toSign);
    const signature = g.btoa(String.fromCharCode(...new Uint8Array(sig)));
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Log-Type': 'EconeuraLogs',
        'Authorization': `SharedKey ${env.LA_ID}:${signature}`,
        'x-ms-date': date,
      },
      body,
    }).catch(() => {});
  } catch { /* no-op */ }
}

// Iconos por departamento
const DeptIcon: Record<string, React.ElementType> = {
  CEO: Crown,
  IA: Brain,
  CSO: Target,
  CTO: Cpu,
  CISO: Shield,
  COO: Workflow,
  CHRO: Users,
  MKT: LineChart,
  CFO: Wallet,
  CDO: Database,
};

const isComponent = (x: any): x is React.ElementType => !!x && (typeof x === 'function' || typeof x === 'object');

function getDeptIcon(id: string): React.ElementType {
  const Icon = (DeptIcon as any)[id];
  return isComponent(Icon) ? Icon : Crown;
}

// Paleta PREMIUM - Colores tecnológicos modernos y sofisticados
const DEFAULTS_HEX: Record<string, string> = (typeof window!=='undefined' && (window as any).__ECONEURA_COLORS) || {
  CEO: "#1B263B",      // Azul Profundo autoridad
  IA: "#3A86FF",       // Azul Brillante tecnología
  CSO: "#FFD43B",      // Amarillo dorado visión
  CTO: "#4ECDC4",      // Turquesa avanzado
  CISO: "#E63946",     // Rojo seguridad
  COO: "#6D597A",      // Morado control operativo
  CHRO: "#43AA8B",     // Verde humano
  MKT: "#FF8800",      // Naranja ventas/creatividad
  CFO: "#27AE60",      // Verde finanzas
  CDO: "#808080",      // Gris datos
  INO: "#B5179E"       // Magenta innovación
};

type Pal = { accentText:string; accentBg:string; accentBorder:string; textHex:string; bgCss:string; borderCss:string };
const PALETTE: Record<string, Pal> = Object.fromEntries(Object.entries(DEFAULTS_HEX).map(([k,hex])=>{
    const textHex = hex;
  return [k, {
        accentText: 'text-slate-900',
        accentBg: 'bg-white',
        accentBorder: 'border-gray-200',
        textHex,
        bgCss: rgba(hex, 0.08),
        borderCss: rgba(hex, 0.35),
  }];
})) as Record<string, Pal>;

const DEFAULT_PALETTE = PALETTE.CEO;
function getPalette(id: string) { return PALETTE[id] || DEFAULT_PALETTE; }

const theme = { border: '#e5e7eb', muted: '#64748b', ink: '#1f2937', surface: '#ffffff' };
const i18n = { es: { privacy: 'Tus opciones de privacidad', cookies: 'Gestionar cookies', terms: 'Condiciones de uso', tm: 'Marcas registradas', eu_docs: 'Docs cumplimiento de la UE' } };

// Datos exactos: 10 departamentos NEURA + 40 agentes Make
const DATA: Department[] = [
  { id:'CEO',  name:'Ejecutivo (CEO)', chips:['88h/mes','4.400 €/mes','ROI 4.340%'],
    neura:{
      title:'NEURA-CEO',
      subtitle:'Consejero ejecutivo. Ahorra 88h/mes.',
      tags:['Resumen del día','Top riesgos','OKR en alerta'],
      value: {
        timeSavedHoursMonth: 88,
        valueEurMonth: 4400,
        roiPercentage: 4340,
        problem: '200+ emails/día (3h), 20 decisiones/día (2h), reuniones interminables',
        solution: 'IA resume emails -> 10 críticos (5min), prioriza decisiones -> top 5 (30min)'
      }
    },
    agents:[
      { id:'a-ceo-01', title:'Agenda Consejo', desc:'Genera agenda + materiales de reunión. Ahorra 2h/sem (€80/sem)', pills:['2h/sem','€320/mes'] },
      { id:'a-ceo-02', title:'Anuncio Semanal', desc:'Redacta comunicado de empresa. Ahorra 1h/sem (€40/sem)', pills:['1h/sem','€160/mes'] },
      { id:'a-ceo-03', title:'Resumen Ejecutivo', desc:'Compila KPIs + insights. Ahorra 3h/sem (€120/sem)', pills:['3h/sem','€480/mes'] },
      { id:'a-ceo-04', title:'Seguimiento OKR', desc:'Dashboard de OKRs en tiempo real. Ahorra 2h/sem (€80/sem)', pills:['2h/sem','€320/mes'] },
    ] },
  { id:'IA',   name:'Plataforma IA', chips:['40h/mes','3.000 €/mes','ROI 2.929%'],
    neura:{
      title:'NEURA-IA',
      subtitle:'Director de plataforma IA. Ahorra 40h/mes.',
      tags:['Consumo por modelo','Errores por proveedor','Fallbacks últimos 7d'],
      value: {
        timeSavedHoursMonth: 40,
        valueEurMonth: 3000,
        roiPercentage: 2929,
        problem: 'Monitoreo manual costes IA (10h/semana), troubleshooting errores (5h/semana)',
        solution: 'IA optimiza costes automáticamente, detecta/resuelve errores'
      }
    },
    agents:[
      { id:'a-ia-01', title:'Salud y Failover', desc:'Ahorra 2h/semana en monitoreo' },
      { id:'a-ia-02', title:'Cost Tracker', desc:'Ahorra 3h/semana en análisis de costes' },
      { id:'a-ia-03', title:'Revisión Prompts', desc:'Ahorra 2h/semana en optimización' },
      { id:'a-ia-04', title:'Vigilancia Cuotas', desc:'Ahorra 1h/semana en control de cuotas' },
    ] },
  { id:'CSO',  name:'Estrategia (CSO)', chips:['32h/mes','2.400 €/mes','ROI 2.323%'],
    neura:{
      title:'NEURA-CSO',
      subtitle:'Asesor estratégico. Ahorra 32h/mes.',
      tags:['Riesgos emergentes','Tendencias del sector','Oportunidades M&A'],
      value: {
        timeSavedHoursMonth: 32,
        valueEurMonth: 2400,
        roiPercentage: 2323,
        problem: 'Análisis de riesgos manual (4h/semana), vigilancia competencia (4h/semana)',
        solution: 'IA detecta riesgos automáticamente, monitorea competencia 24/7'
      }
    },
    agents:[
      { id:'a-cso-01', title:'Gestor de Riesgos', desc:'Ahorra 4h/semana en análisis de riesgos' },
      { id:'a-cso-02', title:'Vigilancia Competitiva', desc:'Ahorra 2h/semana en monitoreo competitivo' },
      { id:'a-cso-03', title:'Radar de Tendencias', desc:'Ahorra 1h/semana en investigación de tendencias' },
      { id:'a-cso-04', title:'M&A Sync', desc:'Ahorra 1h/semana en oportunidades de M&A' },
    ] },
  { id:'CTO',  name:'Tecnología (CTO)', chips:['94h/mes','7.050 €/mes','ROI 7.020%'],
    neura:{
      title:'NEURA-CTO',
      subtitle:'Director tecnológico. Ahorra 94h/mes.',
      tags:['Incidentes críticos','SLO semanales','Optimización cloud'],
      value: {
        timeSavedHoursMonth: 94,
        valueEurMonth: 7050,
        roiPercentage: 7020,
        problem: 'Monitoring 24/7 (10h/semana), incidentes (8h/semana), code reviews (6h/semana)',
        solution: 'IA monitorea automáticamente, diagnostica incidentes, revisa código'
      }
    },
    agents:[
      { id:'a-cto-01', title:'FinOps Cloud', desc:'Ahorra 3h/semana optimizando costes de cloud' },
      { id:'a-cto-02', title:'Seguridad CI/CD', desc:'Ahorra 2h/semana en auditorías de seguridad' },
      { id:'a-cto-03', title:'Observabilidad SLO', desc:'Ahorra 4h/semana en monitoreo de SLOs' },
      { id:'a-cto-04', title:'Gestión Incidencias', desc:'Ahorra 3h/semana en análisis de postmortems' },
    ] },
  { id:'CISO', name:'Seguridad (CISO)', chips:['51h/mes','3.825 €/mes','ROI 3.762%'],
    neura:{
      title:'NEURA-CISO',
      subtitle:'Director de seguridad. Ahorra 51h/mes.',
      tags:['Vulnerabilidades críticas','Phishing últimos 7d','Recertificaciones'],
      value: {
        timeSavedHoursMonth: 51,
        valueEurMonth: 3825,
        roiPercentage: 3762,
        problem: 'Monitoreo CVEs (10h/semana), phishing triage (5h/semana), compliance (8h/mes)',
        solution: 'IA escanea vulnerabilidades 24/7, clasifica phishing, genera reportes compliance'
      }
    },
    agents:[
      { id:'a-ciso-01', title:'Vulnerabilidades', desc:'Ahorra 4h/semana en escaneo de CVEs' },
      { id:'a-ciso-02', title:'Phishing Triage', desc:'Ahorra 3h/semana en clasificación de phishing' },
      { id:'a-ciso-03', title:'Backup/Restore DR', desc:'Ahorra 1h/semana en verificación de backups' },
      { id:'a-ciso-04', title:'Recertificación', desc:'Ahorra 2h/mes en auditorías de recertificación' },
    ] },
  { id:'COO',  name:'Operaciones (COO)', chips:['112h/mes','5.600 €/mes','ROI 5.555%'],
    neura:{
      title:'NEURA-COO',
      subtitle:'Director de operaciones. Ahorra 112h/mes.',
      tags:['Pedidos atrasados','SLA por canal','Cuellos de botella'],
      value: {
        timeSavedHoursMonth: 112,
        valueEurMonth: 5600,
        roiPercentage: 5555,
        problem: 'Apagar fuegos (15h/semana), SLA tracking (10h/semana), excepciones (10h/semana)',
        solution: 'IA detecta atrasos antes de SLA breach, monitorea 24/7, resuelve 80% excepciones'
      }
    },
    agents:[
      { id:'a-coo-01', title:'Atrasos y Excepciones', desc:'Ahorra 6h/semana detectando problemas operativos' },
      { id:'a-coo-02', title:'Centro NPS/CSAT', desc:'Ahorra 2h/semana analizando feedback de clientes' },
      { id:'a-coo-03', title:'Latido de SLA', desc:'Ahorra 4h/semana en monitoreo de SLAs' },
      { id:'a-coo-04', title:'Torre de Control', desc:'Ahorra 3h/semana en reportes operativos' },
    ] },
  { id:'CHRO', name:'RRHH (CHRO)', chips:['34.5h/mes','2.070 €/mes','ROI 2.000%'],
    neura:{
      title:'NEURA-CHRO',
      subtitle:'Director de RRHH. Ahorra 34.5h/mes.',
      tags:['Clima semanal','Onboardings','Vacantes críticas'],
      value: {
        timeSavedHoursMonth: 34.5,
        valueEurMonth: 2070,
        roiPercentage: 2000,
        problem: 'Onboarding manual (6h/empleado), recruitment (20h/mes), clima laboral (8h/mes)',
        solution: 'IA orquesta onboarding, filtra CVs, analiza clima automáticamente'
      }
    },
    agents:[
      { id:'a-chro-01', title:'Encuesta de Pulso', desc:'Ahorra 2h/semana en análisis del clima laboral' },
      { id:'a-chro-02', title:'Offboarding Seguro', desc:'Ahorra 1.5h/empleado en proceso de offboarding' },
      { id:'a-chro-03', title:'Onboarding Orquestado', desc:'Ahorra 3h/empleado en gestión de onboarding' },
      { id:'a-chro-04', title:'Pipeline Contratación', desc:'Ahorra 4h/semana en filtrado de CVs' },
    ] },
  { id:'MKT',  name:'Marketing y Ventas (CMO/CRO)', chips:['64h/mes','3.840 €/mes','ROI 3.778%'],
    neura:{
      title:'NEURA-CMO/CRO',
      subtitle:'Director comercial. Ahorra 64h/mes.',
      tags:['Embudo comercial','Churn y upsell','Campañas activas'],
      value: {
        timeSavedHoursMonth: 64,
        valueEurMonth: 3840,
        roiPercentage: 3778,
        problem: 'Pipeline manual (3h/semana), lead scoring (5h/semana), reportes (6h/semana)',
        solution: 'IA actualiza pipeline automáticamente, score leads, genera reportes'
      }
    },
    agents:[
      { id:'a-mkt-01', title:'Embudo Comercial', desc:'Actualiza CRM automáticamente. Ahorra 3h/sem (€120/sem)', pills:['3h/sem','€480/mes'] },
      { id:'a-mkt-02', title:'Salud de Pipeline', desc:'Detecta deals en riesgo. Ahorra 2h/sem (€80/sem)', pills:['2h/sem','€320/mes'] },
      { id:'a-mkt-03', title:'Calidad de Leads', desc:'Score automático de leads. Ahorra 4h/sem (€160/sem)', pills:['4h/sem','€640/mes'] },
      { id:'a-mkt-04', title:'Post-Campaña', desc:'Analiza ROI + recomendaciones. Ahorra 3h/sem (€120/sem)', pills:['3h/sem','€480/mes'] },
    ] },
  { id:'CFO',  name:'Finanzas (CFO)', chips:['38h/mes','2.850 €/mes','ROI 2.778%'],
    neura:{
      title:'NEURA-CFO',
      subtitle:'Director financiero. Ahorra 38h/mes.',
      tags:['Cash runway','Variance vs budget','Cobros y pagos'],
      value: {
        timeSavedHoursMonth: 38,
        valueEurMonth: 2850,
        roiPercentage: 2778,
        problem: 'Cierres mensuales (24h/mes), forecasting (8h/mes), variance (4h/mes), board prep (6h/mes)',
        solution: 'IA hace cierre automático, genera forecast, detecta varianzas, crea slides'
      }
    },
    agents:[
      { id:'a-cfo-01', title:'Tesorería', desc:'Ahorra 2h/semana en proyecciones de tesorería' },
      { id:'a-cfo-02', title:'Variance', desc:'Ahorra 1h/semana en análisis de P&L' },
      { id:'a-cfo-03', title:'Facturación', desc:'Ahorra 1.5h/semana en gestión de cobros' },
      { id:'a-cfo-04', title:'Compras', desc:'Ahorra 1h/semana en gestión de contratos' },
    ] },
  { id:'CDO',  name:'Datos (CDO)', chips:['28h/mes','2.100 €/mes','ROI 2.020%'],
    neura:{
      title:'NEURA-CDO',
      subtitle:'Director de datos. Ahorra 28h/mes.',
      tags:['SLAs datos','Gobierno','Catálogo'],
      value: {
        timeSavedHoursMonth: 28,
        valueEurMonth: 2100,
        roiPercentage: 2020,
        problem: 'Calidad datos manual (4h/semana), catálogo (3h/semana), optimización queries (4h/mes)',
        solution: 'IA monitorea calidad 24/7, mantiene catálogo, optimiza queries automáticamente'
      }
    },
    agents:[
      { id:'a-cdo-01', title:'Linaje', desc:'Ahorra 1h/semana en análisis de impacto de datos' },
      { id:'a-cdo-02', title:'Calidad de Datos', desc:'Ahorra 3h/semana en validación de datos' },
      { id:'a-cdo-03', title:'Catálogo', desc:'Ahorra 2h/semana en actualización de catálogo' },
      { id:'a-cdo-04', title:'Coste DWH', desc:'Ahorra 1h/semana en optimización de costes' },
    ] },
  // AGREGADO NUEVO DEPARTAMENTO/NEURA (INNOVACIÓN)
  { id:'INO',  name:'Innovación (CINO)', chips:['36h/mes','2.200 €/mes','ROI 2200%'],
    neura:{
      title:'NEURA-INO',
      subtitle:'Chief Innovation Officer. Ahorra 36h/mes.',
      tags:['Patentes','Startups','Tendencias','Prototipos'],
      value: {
        timeSavedHoursMonth: 36,
        valueEurMonth: 2200,
        roiPercentage: 2200,
        problem: 'Décadas para innovar = obsolescencia. Datos dispersos, scouting manual, experimentos lentos.',
        solution: 'IA escanea patentes/papers, radar startups, automatiza PoCs y acelera innovación 10x.'
      }
    },
    agents:[
      { id:'a-ino-01', title:'Explorador de Patentes y Papers', desc:'Escanea bases científicas y de IP. Resume tecnologías emergentes (TRL).', pills:['TRL','Vigilancia'] },
      { id:'a-ino-02', title:'Radar de Startups y Ecosistemas', desc:'Monitorea hubs, fondos, sinergias. Oportunidades de partnership.', pills:['Open Innovation'] },
      { id:'a-ino-03', title:'Generador de Prototipos IA/No-Code', desc:'Automatiza PoCs y mide "time-to-first-value" para hipótesis.', pills:['PoC','NoCode','TTFV'] },
      { id:'a-ino-04', title:'Agente de Tendencias de Usuario', desc:'Analiza foros/feedback para sugerir features antes que la competencia.', pills:['Tendencias','Feedback'] },
      { id:'a-ino-05', title:'Orquestador de Innovación Abierta', desc:'Gestiona retos con universidades/partners. Scoring y priorización.', pills:['Open','Scoring','Universidades'] }
    ] },
];

function iconForAgent(title: string): React.ElementType {
  const t = title.toLowerCase();
  let Icon: React.ElementType = ClipboardList;
  if (t.includes('agenda')) Icon = CalendarDays;
  else if (t.includes('anuncio') || t.includes('comunicado')) Icon = Megaphone;
  else if (t.includes('resumen') || t.includes('registro')) Icon = FileText;
  else if (t.includes('okr') || t.includes('score')) Icon = Gauge;
  else if (t.includes('salud') || t.includes('health')) Icon = ActivityIcon;
  else if (t.includes('cost') || t.includes('gasto')) Icon = FileBarChart2;
  else if (t.includes('prompts')) Icon = MessageCircle;
  else if (t.includes('cuotas')) Icon = ListChecks;
  else if (t.includes('incidenc')) Icon = Bug;
  else if (t.includes('observabilidad') || t.includes('slo')) Icon = Radar;
  else if (t.includes('phishing')) Icon = Inbox;
  else if (t.includes('email')) Icon = Mail;
  else if (t.includes('tendencias')) Icon = TrendingUp;
  return isComponent(Icon) ? Icon : ClipboardList;
}

function TagIcon({ text }: { text: string }) {
  const s = text.toLowerCase();
  const Maybe: React.ElementType = s.includes('riesgo') ? Shield : s.includes('consumo') ? Gauge : s.includes('errores') ? Bug : s.includes('m&a') ? Target : s.includes('tendencias') ? TrendingUp : FileText;
  const I = isComponent(Maybe) ? Maybe : FileText;
  return <I className="w-3 h-3" />;
}

const light = { surface: '#FFFFFF', ink: '#1F2937', border: '#E5E7EB' };
const paletteLocal = { ceo: { primary: '#5D7177' } };

function FooterComponent(){
  const handleFooterClick = (section: string) => {
    // Navegación funcional a páginas legales
    switch(section) {
      case 'Privacidad':
        window.open('/privacy', '_blank');
        break;
      case 'Cookies':
        window.open('/cookies', '_blank');
        break;
      case 'Términos':
        window.open('/terms', '_blank');
        break;
      case 'Marcas registradas':
        window.open('/trademarks', '_blank');
        break;
      case 'Cumplimiento UE':
        window.open('/compliance', '_blank');
        break;
      default:
        // Navegación a sección desconocida (log removido para producción)
    }
  };

  return (
    <footer className="bg-slate-50/50 px-6 py-3 text-[10px] text-slate-500">
      <div className="flex flex-wrap items-center justify-center gap-2 font-normal">
        <span className="text-slate-600">Español (España)</span>
        <span role="separator" aria-hidden className="text-slate-300">·</span>
        <button
          onClick={() => handleFooterClick('Privacidad')}
          className="hover:text-slate-700 transition-colors hover:underline cursor-pointer bg-transparent border-0 p-0 font-normal"
        >
          Tus opciones de privacidad
        </button>
        <span role="separator" aria-hidden className="text-slate-300">·</span>
        <button
          onClick={() => handleFooterClick('Cookies')}
          className="hover:text-slate-700 transition-colors hover:underline cursor-pointer bg-transparent border-0 p-0 font-normal"
        >
          Gestionar cookies
        </button>
        <span role="separator" aria-hidden className="text-slate-300">·</span>
        <button
          onClick={() => handleFooterClick('Términos')}
          className="hover:text-slate-700 transition-colors hover:underline cursor-pointer bg-transparent border-0 p-0 font-normal"
        >
          Condiciones de uso
        </button>
        <span role="separator" aria-hidden className="text-slate-300">·</span>
        <button
          onClick={() => handleFooterClick('Marcas registradas')}
          className="hover:text-slate-700 transition-colors hover:underline cursor-pointer bg-transparent border-0 p-0 font-normal"
        >
          Marcas registradas
        </button>
        <span role="separator" aria-hidden className="text-slate-300">·</span>
        <button
          onClick={() => handleFooterClick('Cumplimiento UE')}
          className="hover:text-slate-700 transition-colors hover:underline cursor-pointer bg-transparent border-0 p-0 font-normal"
        >
          Docs cumplimiento de la UE
        </button>
        <span role="separator" aria-hidden className="text-slate-300">·</span>
        <span className="text-slate-600">© ECONEURA 2025</span>
      </div>
    </footer>
  );
}

interface EconeuraCockpitProps {
  user?: any;
  onLogout?: () => void;
}

export default function EconeuraCockpit({ user, onLogout }: EconeuraCockpitProps = {}) {
  const [activeDept, setActiveDept] = useState(DATA[0].id);
  const [orgView, setOrgView] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [activity, setActivity] = useState<NeuraActivity[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Sistema de idiomas eliminado - solo español
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [chatMsgs, setChatMsgs] = useState<{
    id:string;
    text:string;
    role:'user'|'assistant';
    model?:string;
    tokens?:number;
    reasoning_tokens?:number;
    references?: Array<{ index: number; docId: string; title: string; pages: string; preview: string }>;
    agentExecution?: {
      agentId: string;
      status: 'pending' | 'running' | 'success' | 'error';
      message?: string;
    }
  }[]>([]);
  const [showAllUsage, setShowAllUsage] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [pendingAgentExecution, setPendingAgentExecution] = useState<string | null>(null);
  const [listening, setListening] = useState(false);

  // Estado para modal de conexión
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [connectingAgent, setConnectingAgent] = useState<{id: string; title: string} | null>(null);

  // Estado para historial de chats
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);

  // Customer portal state
  const [portalOpen, setPortalOpen] = useState(false);
  
  // Agent execution panel state
  const [agentExecutionOpen, setAgentExecutionOpen] = useState(false);
  
  // NEURA Library state
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [useInternet, setUseInternet] = useState(false);
  
  // HITL state
  const [hitlModalOpen, setHitlModalOpen] = useState(false);
  const [pendingHITL, setPendingHITL] = useState<any>(null);

  // User token (from localStorage or empty)
  const [userToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('econeura_token') || '';
    }
    return '';
  });

  // User data
  const [userData, setUserData] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('econeura_user');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  // Settings dropdown
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Logout function
  const handleLogout = () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      localStorage.removeItem('econeura_token');
      localStorage.removeItem('econeura_user');
      sessionStorage.removeItem('econeura_token');
      sessionStorage.removeItem('econeura_user');
      
      // Llamar función de logout del padre si existe
      if (onLogout) {
        onLogout();
      } else {
        window.location.href = '/';
      }
    }
  };

  // MEJORA 10: Animaciones CSS personalizadas premium
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes floatParticle {
        0%, 100% {
          transform: translateY(0px) translateX(0px);
          opacity: 0.2;
        }
        50% {
          transform: translateY(-30px) translateX(15px);
          opacity: 0.6;
        }
      }
      @keyframes shimmer {
        0% {
          transform: translateX(-100%) skewX(-12deg);
        }
        100% {
          transform: translateX(200%) skewX(-12deg);
        }
      }
      .animate-shimmer {
        animation: shimmer 3s infinite;
      }
      .animate-fadeInLeft {
        animation: fadeInLeft 0.6s ease-out forwards;
      }
      .animate-fadeInUp {
        animation: fadeInUp 0.6s ease-out forwards;
        animation-delay: 0.1s;
        opacity: 0;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);
  const [voiceSupported] = useState<boolean>(typeof window !== 'undefined' && 'speechSynthesis' in window);
  const recognitionRef = useRef<any>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dept = useMemo(() => DATA.find(d => d.id === activeDept) ?? DATA[0], [activeDept]);
  const lastByAgent = useMemo(() => {
    const m: Record<string, NeuraActivity | undefined> = {};
    for (const e of activity) { if (!m[e.agentId]) m[e.agentId] = e; }
    return m;
  }, [activity]);

  // ⌨️ Keyboard shortcut: Ctrl+K / Cmd+K para focus en búsqueda
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Voice: TTS + STT
  useEffect(() => {
    try {
      const g: any = globalThis as any;
      const SR = g.SpeechRecognition || g.webkitSpeechRecognition;
      if (SR) {
        const rec = new SR();
        rec.lang = 'es-ES';
        rec.interimResults = true;
        rec.onresult = (e: SpeechRecognitionEvent) => {
          let t = '';
          for (let i = e.resultIndex; i < e.results.length; i++) { t += e.results[i][0].transcript; }
          setChatInput(t);
        };
        rec.onend = () => setListening(false);
        recognitionRef.current = rec;
      }
    } catch {}
  }, []);

  function speak(text: string) {
    try {
      const g: any = globalThis as any;
      if (!g.speechSynthesis) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'es-ES';
      g.speechSynthesis.cancel();
      g.speechSynthesis.speak(u);
    } catch {}
  }

  function stopSpeak(){ try { (globalThis as any).speechSynthesis?.cancel(); } catch {} }

  function toggleListen(){
    const rec:any = recognitionRef.current;
    if(!rec) return;
    if(!listening){ setChatInput(''); setListening(true); try{ rec.start(); }catch{} }
    else { try{ rec.stop(); }catch{} }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function sendChatMessage() {
    const text = chatInput.trim();
    if (!text) return;

    // Agregar mensaje del usuario
    const userMsg = { id: correlationId(), text, role: 'user' as const };
    setChatMsgs(v => [...v, userMsg]);
    setChatInput('');

    // Sistema agentic temporalmente deshabilitado para deployment

    try {
      // Llamar al primer agente del departamento actual para chat
      const chatAgentId = dept.agents[0]?.id || 'a-ceo-01';
      
      // Detectar si estamos en producción
      const hostname = window.location.hostname;
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      
      // API URL: localhost en dev, Azure en produccion
      const apiUrl = isLocalhost ? 'http://localhost:8080' : 'https://econeura-backend-prod.azurewebsites.net';

      console.log('[EconeuraCockpit] Chat - Hostname:', hostname);
      console.log('[EconeuraCockpit] Chat - API URL:', apiUrl);

      // MEMORIA CONVERSACIONAL: Enviar historial completo (últimos 10 mensajes)
      const conversationHistory = chatMsgs.slice(-10).concat([userMsg]).map(m => ({
        role: m.role,
        content: m.text
      }));

      const token = localStorage.getItem('econeura_token') || '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Correlation-Id': correlationId(),
        'X-Department': dept.id
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Usar el endpoint que SÍ funciona: /api/invoke/[id]
      const res = await fetch(`${apiUrl}/api/invoke/${chatAgentId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          input: text
        })
      });

      // Limpiar imagen después de enviar
      if (uploadedImage) {
        removeImage();
      }

      const data = await res.json();
      let output = data?.output || data?.message || 'Sin respuesta';
      const model = data?.model || 'mistral-medium-3.1';
      const tokens = data?.tokens || 0;
      const cost = data?.cost || 0;
      const references = [];
      const functionCall = data?.function_call || null;

      // Verificar si el mensaje contiene solicitud de ejecución de agente usando integración especializada
      const shouldExecuteAgent = shouldExecuteAgentsForNeura(chatAgentId, text);
      
      if (shouldExecuteAgent) {
        // Abrir panel de ejecución de agentes automáticamente con animación suave
        setTimeout(() => {
          setAgentExecutionOpen(true);
          // Scroll suave al panel de agentes
          const agentPanel = document.getElementById('agent-execution-panel');
          if (agentPanel) {
            agentPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 800);
        
        // Obtener contexto especializado para el NEURA actual con análisis mejorado
        const specializedContext = getSpecializedContext(chatAgentId, text);
        const specializedReasoning = getSpecializedReasoning(chatAgentId, text);
        
        // Análisis de confianza mejorado
        const confidenceScore = calculateAgentConfidence(chatAgentId, text, specializedContext);
        
        // Log de análisis para debugging
        console.log(`[NEURA-${chatAgentId}] Análisis de ejecución:`, {
          context: specializedContext,
          reasoning: specializedReasoning,
          confidence: confidenceScore,
          shouldExecute: shouldExecuteAgent
        });
        
        output += `\n\n🤖 **Sistema de Agentes Automatizados Activado**\n\n${specializedContext}\n\n**Razonamiento:** ${specializedReasoning}\n\nAbriendo el panel de ejecución de agentes especializados para tu departamento.`;
      }

      // Si NEURA ejecutó una función
      if (functionCall) {
        const funcEmoji = functionCall.name === 'agendar_reunion' ? '📅' :
                         functionCall.name === 'consultar_datos' ? '📊' :
                         functionCall.name === 'enviar_alerta' ? '🚨' :
                         functionCall.name === 'generar_reporte' ? '📄' :
                         functionCall.name === 'ejecutar_webhook' ? '⚡' : '🔧';
        
        let funcOutput = `${output}\n\n${funcEmoji} **Función Ejecutada:** \`${functionCall.name}\`\n\n` +
          `**Resultado:** ${functionCall.result?.message || 'Ejecutado'}\n`;
        
        // Si requiere HITL, abrir modal
        if (functionCall.hitl_required) {
          funcOutput += `\n⚠️ **Requiere aprobación humana**`;
          
          // Guardar para modal HITL
          setPendingHITL({
            functionName: functionCall.name,
            functionArgs: functionCall.arguments,
            functionResult: functionCall.result,
            neuraName: dept.neura.title
          });
          setHitlModalOpen(true);
        }
        
        setChatMsgs(v => [...v, {
          id: correlationId(),
          text: funcOutput,
          role: 'assistant' as const,
          model: model,
          tokens: tokens,
          reasoning_tokens: 0,
          cost: cost,
          references: references,
          function_call: functionCall
        }]);
      } else {
        // Respuesta normal sin función
        setChatMsgs(v => [...v, {
          id: correlationId(),
          text: output,
          role: 'assistant' as const,
          model: model,
          tokens: tokens,
          reasoning_tokens: 0,
          cost: cost,
          references: references
        }]);
      }

      // Registrar actividad
      logActivity({
        AgentId: `${dept.id}-chat`,
        DeptId: dept.id,
        Status: 'OK',
        Model: model
      });
    } catch (err) {
      // Mostrar error real para debugging
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[EconeuraCockpit] Chat error:', err);
      
      setChatMsgs(v => [...v, {
        id: correlationId(),
        text: `âŒ Error al conectar con el backend: ${errorMessage}`,
        role: 'assistant'
      }]);
    }
  }

  // ðŸ" BÚSQUEDA FUZZY GLOBAL con Fuse.js (permite errores tipográficos)
  const allAgentsWithDept = useMemo(() => {
    const all: Array<Agent & { deptId: string; deptName: string }> = [];
    DATA.forEach(d => {
      d.agents.forEach((a: Agent) => {
        all.push({ ...a, deptId: d.id, deptName: d.name });
      });
    });
    return all;
  }, []);

  const fuse = useMemo(() => new Fuse(allAgentsWithDept, {
    keys: ['title', 'desc', 'deptName'],
    threshold: 0.4, // Permite 40% de diferencia (muy tolerante a errores)
    ignoreLocation: true,
    includeScore: true
  }), [allAgentsWithDept]);

  const filteredAgents = useMemo(() => {
    if (!q.trim()) return dept.agents;

    const results = fuse.search(q);
    return results.map(r => r.item);
  }, [fuse, q, dept.agents]); // Búsqueda en todos los departamentos

  // Sistema agentic temporalmente deshabilitado

  async function runAgent(a: Agent) {
    try {
      setBusyId(a.id);

      // Verificar si el agente está conectado a algún proveedor
      const hostname = window.location.hostname;
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      const apiUrl = isLocalhost ? 'http://localhost:8080' : 'https://econeura-backend-prod.azurewebsites.net';

      try {
        // Usar endpoint de NEURA agents
        const response = await fetch(`${apiUrl}/api/neura-agents/execute/${a.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: {},
            userId: null,
            action: 'execute',
            parameters: {
              input: `Ejecutar ${a.title}`,
              context: 'cockpit-execution'
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error ejecutando agente: ${response.status}`);
        }

        const result = await response.json();
        console.log('[EconeuraCockpit] Agent execution result:', result);

        // Mostrar resultado en actividad
        setActivity(v => [{
          id: correlationId(),
          ts: nowIso(),
          agentId: a.id,
          deptId: dept.id,
          status: 'OK',
          message: `Ejecutado exitosamente - Status: ${result.status}`,
          executionId: result.timestamp
        }, ...v]);

        // 🎉 Confetti + Toast al completar exitosamente
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success(`✅ ${a.title} ejecutado exitosamente`);
        return;

        if (mappingResponse.status === 404) {
          // Agente no conectado â†' abrir modal
          setConnectingAgent({ id: a.id, title: a.title });
          setConnectModalOpen(true);
          setBusyId('');
          return;
        }

        // Agente conectado â†' invocar
        const invokeResponse = await fetch(`${apiUrl}/api/integration/agents/${a.id}/invoke`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: 'Ejecutar automatización',
            context: { deptId: dept.id, ts: nowIso(), source: 'cockpit' }
          })
        });

        const invokeData = await invokeResponse.json();

        if (invokeResponse.ok && invokeData.success) {
          setActivity(v => [{
            id: correlationId(),
            ts: nowIso(),
            agentId: a.id,
            deptId: dept.id,
            status: 'OK',
            message: `Ejecutado vía ${invokeData.provider} (${invokeData.latency}ms)`,
            executionId: invokeData.executionId
          }, ...v]);
          logActivity({ AgentId: a.id, DeptId: dept.id, Status: 'OK', Type: 'Integration', Provider: invokeData.provider });

          // 🎉 Confetti + Toast al completar exitosamente
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          toast.success(`âœ" ${a.title} ejecutado exitosamente`, {
            description: `Completado en ${invokeData.latency}ms vía ${invokeData.provider}`,
            duration: 3000
          });
        } else {
          throw new Error(invokeData.error || 'Ejecución fallida');
        }
      } catch (mappingError: unknown) {
        // Fallback: intentar webhook Make si está configurado
        const webhook = getDeptWebhook(dept.id);
        if (webhook) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);
          await fetch(webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentId: a.id, deptId: dept.id, ts: nowIso(), source: 'cockpit' }),
            signal: controller.signal
          });
          clearTimeout(timeout);
          setActivity(v => [{ id: correlationId(), ts: nowIso(), agentId: a.id, deptId: dept.id, status: 'OK', message: 'Webhook Make OK' }, ...v]);
          logActivity({ AgentId: a.id, DeptId: dept.id, Status: 'OK', Type: 'Make' });

          // 🎉 Confetti + Toast
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
          toast.success(`âœ" ${a.title} ejecutado exitosamente`, {
            description: 'Webhook Make completado',
            duration: 3000
          });
        } else {
          throw mappingError;
        }
      }
    } catch (e: unknown) {
      setActivity(v => [{ id: correlationId(), ts: nowIso(), agentId: a.id, deptId: dept.id, status: 'ERROR', message: String(e?.message||'Error') }, ...v]);
      logActivity({ AgentId: a.id, DeptId: dept.id, Status: 'ERROR' });

      // âŒ Toast de error
      toast.error(`✗ Error al ejecutar ${a.title}`, {
        description: String(e?.message || 'Verifica la conexión con el backend'),
        duration: 4000
      });
    } finally {
      setBusyId(null);
    }
  }

  function openChatWithErrorSamples() {
    setChatOpen(true);
    setChatMsgs([
      { id: correlationId(), text: 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.', role: 'assistant' },
      { id: correlationId(), text: 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.', role: 'assistant' },
    ]);
  }

  function startCreateAgent(deptId: string){
    const instructions = `NEW AGENTE · ${deptId}
Crea un agente y conéctalo a Make.
1) Pega el Webhook de Make en backend.
2) Define I/O y permisos.
3) Publica.`;
    setActivity(v => [{ id: correlationId(), ts: nowIso(), agentId: 'new-agent', deptId, status: 'OK', message: 'Solicitud de creación de agente' }, ...v]);
    setChatOpen(true);
    setChatMsgs(v => [...v, { id: correlationId(), text: instructions, role: 'assistant' }]);
  }

  const DeptIconComp = getDeptIcon(dept.id);
  const pal = getPalette(dept.id);

  return (
    <>
      {/* Toast Notifications Premium */}
      <Toaster
        position="top-right"
        theme={darkMode ? 'dark' : 'light'}
        richColors
        closeButton
      />

      <div
        className={`min-h-screen relative transition-colors duration-500 overflow-hidden ${
          darkMode
            ? 'bg-[#0d1117] text-slate-100'
            : 'bg-gradient-to-br from-slate-50 via-white to-slate-50/80 text-slate-900'
        }`}
        style={{
          boxShadow: darkMode ? 'none' : 'inset 0 1px 0 rgba(255, 255, 255, 0.5)'
        }}
      >
        {/* Floating particles background */}
        {darkMode && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `floatParticle 20s ${Math.random() * 5}s infinite ease-in-out`,
                  background: `hsl(${200 + Math.random() * 60}, 70%, 60%)`,
                  opacity: 0.3 + Math.random() * 0.4
                }}
              />
            ))}
          </div>
        )}
        
      {/* Top bar ultra premium con efectos 3D */}
      <div
        className={`relative h-20 border-b flex items-center px-8 justify-between z-20 ${
          darkMode
            ? 'border-slate-800 bg-[#161b22]'
            : 'border-slate-200/40 bg-gradient-to-b from-white via-white to-slate-50/30'
        }`}
        style={{
          boxShadow: darkMode
            ? '0 4px 20px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'
            : '0 2px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          transform: 'translateZ(0)',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Borde superior sutil con efecto 3D */}
        <div className={`absolute inset-x-0 top-0 h-[1px] ${
          darkMode
            ? 'bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent'
            : 'bg-gradient-to-r from-transparent via-slate-300/40 to-transparent'
        }`} style={{ transform: 'translateZ(1px)' }}></div>

        {/* Borde inferior con profundidad */}
        <div className={`absolute inset-x-0 bottom-0 h-[1px] ${
          darkMode
            ? 'bg-gradient-to-r from-transparent via-slate-700/40 to-transparent'
            : 'bg-gradient-to-r from-transparent via-slate-200/60 to-transparent'
        }`} style={{ transform: 'translateZ(-1px)' }}></div>

        <div className="flex items-center gap-3.5 group">
          {/* Hamburger Menu - Solo móvil */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`md:hidden w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
            }`}
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <LogoEconeura />

          {/* ECONEURA text con relieve */}
          <div className="relative">
            {/* Sombra inferior para relieve */}
            <span
              className="absolute top-[1.5px] left-0 text-xl font-black tracking-tight text-slate-400/40"
              style={{
                fontFamily: '"Inter", "SF Pro Display", system-ui, -apple-system, sans-serif',
                letterSpacing: '-0.03em',
                fontWeight: 900
              }}
              aria-hidden="true"
            >
              ECONEURA
            </span>

            {/* Texto principal con relieve 3D */}
            <span
              className={`relative text-xl font-black tracking-tight ${
                darkMode
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent'
                  : 'text-slate-900'
              }`}
              style={{
                fontFamily: '"Inter", "SF Pro Display", system-ui, -apple-system, sans-serif',
                letterSpacing: '-0.03em',
                fontWeight: 900,
                textShadow: darkMode
                  ? '0 2px 8px rgba(16, 185, 129, 0.3)'
                  : '0 2px 0 rgba(255, 255, 255, 0.9), 0 -1px 0 rgba(0, 0, 0, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08)'
              }}
            >
            ECONEURA
          </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* MEJORA 8: Buscador - Oculto en móvil pequeño */}
          <div className="relative hidden sm:block">
            <input
              ref={searchInputRef}
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="Buscar agentes... (Ctrl+K)"
              aria-label="Buscar agentes"
              className={`h-11 w-80 rounded-xl border px-5 pr-12 text-sm font-medium focus:outline-none transition-colors duration-200 ${
                darkMode
                  ? 'border-slate-700/40 bg-slate-800/30 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 shadow-md'
                  : 'border-slate-200/80 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:border-slate-300 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
              }`}
              style={{
                fontFamily: '"Inter", "SF Pro Text", system-ui, -apple-system, sans-serif'
              }}
            />
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? 'text-emerald-500/50' : 'text-slate-400'}`}>
              <Radar className="w-[18px] h-[18px]" />
            </div>

            {/* Dropdown de resultados en tiempo real */}
            {q.trim() && (
              <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                {/* Header del dropdown */}
                <div className="bg-gradient-to-r from-blue-50 to-slate-50 px-4 py-2 border-b border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {filteredAgents.length} resultado{filteredAgents.length !== 1 ? 's' : ''}
                    </span>
                    {filteredAgents.length > 0 && (
                      <button
                        onClick={() => setQ('')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                </div>

                {/* Resultados */}
                <div className="max-h-96 overflow-y-auto">
                  {filteredAgents.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-500">
                      No se encontraron agentes
                    </div>
                  ) : (
                    filteredAgents.map((a: Agent) => {
                      const I: React.ElementType = iconForAgent(a.title);

                      // Obtener departamento del agente
                      const agentDept = DATA.find(d => d.id === a.deptId);
                      const agentPal = agentDept ? getPalette(agentDept.id) : pal;
                      const { r, g, b } = hexToRgb(agentPal.textHex);

                      return (
                        <button
                          key={a.id}
                          onClick={() => {
                            // Cambiar al departamento del agente antes de ejecutar
                            if (a.deptId !== activeDept) {
                              setActiveDept(a.deptId);
                            }
                            runAgent(a);
                            setQ('');
                          }}
                          className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                        >
                          <div
                            className="mt-0.5 p-2 rounded-lg"
                            style={{ backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)` }}
                          >
                            {React.createElement(I, {
                              className: "w-4 h-4",
                              style: { color: agentPal.textHex }
                            })}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="text-sm font-semibold text-slate-900">{a.title}</div>
                              <span
                                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                style={{
                                  backgroundColor: `rgba(${r}, ${g}, ${b}, 0.15)`,
                                  color: agentPal.textHex
                                }}
                              >
                                {a.deptName}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 mt-0.5">{a.desc}</div>
                            {a.pills && a.pills.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {a.pills.slice(0, 2).map((pill: string, i: number) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
                                    {pill}
                                  </span>
                                ))}
                                {a.pills.length > 2 && (
                                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
                                    +{a.pills.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-blue-600 font-medium mt-1">
                            Ejecutar →
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Settings Premium */}
          <div className="relative">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-105 active:scale-95 relative overflow-hidden group ${
                darkMode
                  ? 'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 shadow-md hover:shadow-xl'
                  : 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 hover:from-slate-700 hover:to-slate-700 shadow-md hover:shadow-lg'
              }`}
              aria-label="Settings"
              style={{
                boxShadow: darkMode
                  ? '0 6px 20px rgba(0, 0, 0, 0.3), 0 3px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : '0 4px 12px rgba(15, 23, 42, 0.15), 0 2px 6px rgba(15, 23, 42, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              {/* Anillo sutil decorativo */}
              <div className={`absolute inset-[2px] rounded-full border ${
                darkMode ? 'border-slate-500/30' : 'border-slate-600/20'
              }`}></div>

              <Settings className="w-[18px] h-[18px] text-white relative z-10" />
            </button>

            {/* Settings Dropdown - CONSOLIDADO */}
            {settingsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)} />
                <div className={`absolute top-full right-0 mt-2 w-72 rounded-xl shadow-2xl overflow-hidden z-50 border ${
                  darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  {/* User Info */}
                  <div className={`px-4 py-3 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {userData?.name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                          {userData?.name || 'Usuario'}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                          {userData?.email || 'usuario@econeura.com'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    {/* Dark Mode Toggle */}
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`w-full px-4 py-2 flex items-center gap-3 transition-colors ${
                        darkMode
                          ? 'text-slate-100 hover:bg-slate-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      <span className="text-sm">{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
                    </button>

                    {/* Sistema de idiomas eliminado - solo español */}

                    {/* Cambio de Tema Premium eliminado - solo queda el simple */}

                    {/* Mi Perfil Premium */}
                    <button
                      onClick={() => {
                        setSettingsOpen(false);
                        setPortalOpen(true);
                      }}
                      className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-300 hover:scale-[1.02] rounded-xl backdrop-blur-sm ${
                        darkMode
                          ? 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30 text-slate-100 hover:from-slate-700/60 hover:to-slate-600/60 hover:border-slate-500/50'
                          : 'bg-gradient-to-r from-white/80 to-slate-50/80 border border-slate-200/50 text-slate-800 hover:from-slate-50/90 hover:to-white/90 hover:border-slate-300/70'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${
                        darkMode 
                          ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30' 
                          : 'bg-gradient-to-br from-emerald-100/80 to-teal-100/80 border border-emerald-300/50'
                      }`}>
                        <User className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                          Mi Perfil
                        </span>
                        <span className="text-xs opacity-60 font-medium">Gestión Premium</span>
                      </div>
                      <div className="ml-auto">
                        <div className={`w-2 h-2 rounded-full ${
                          darkMode ? 'bg-emerald-400' : 'bg-emerald-500'
                        } animate-pulse`} />
                      </div>
                    </button>

                    {/* Configuración eliminada del menú */}

                    {/* FinOps, Audit Log y Proposals eliminados del menú */}

                    {/* Cerrar Sesión Premium */}
                    <button
                      onClick={() => {
                        setSettingsOpen(false);
                        handleLogout();
                      }}
                      className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-300 hover:scale-[1.02] rounded-xl backdrop-blur-sm ${
                        darkMode
                          ? 'bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-600/30 text-red-300 hover:from-red-800/40 hover:to-red-700/40 hover:border-red-500/50'
                          : 'bg-gradient-to-r from-red-50/80 to-red-100/80 border border-red-200/50 text-red-700 hover:from-red-100/90 hover:to-red-50/90 hover:border-red-300/70'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${
                        darkMode 
                          ? 'bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-400/30' 
                          : 'bg-gradient-to-br from-red-100/80 to-pink-100/80 border border-red-300/50'
                      }`}>
                        <LogOut className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                          Cerrar Sesión
                        </span>
                        <span className="text-xs opacity-60 font-medium">Salir del sistema</span>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
                  </div>
                </div>

      <div className="flex relative">
        {/* Overlay oscuro en móvil */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Premium - Overlay en móvil, fijo en desktop */}
        <aside
          className={`fixed md:relative inset-y-0 left-0 w-80 border-r p-5 space-y-2 flex-col z-50 transition-transform duration-300 ${
            sidebarOpen ? 'flex translate-x-0' : 'hidden md:flex md:translate-x-0 -translate-x-full'
          } ${
            darkMode
              ? 'bg-[#161b22] border-slate-800'
              : 'bg-gradient-to-br from-slate-50 via-white to-slate-50/80 border-slate-200/60'
          }`}
          style={{
            boxShadow: darkMode
              ? '2px 0 16px rgba(0, 0, 0, 0.25), 1px 0 4px rgba(0, 0, 0, 0.15)'
              : '2px 0 12px rgba(0, 0, 0, 0.04), 1px 0 4px rgba(0, 0, 0, 0.02), inset -1px 0 0 rgba(255, 255, 255, 0.5)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Botón cerrar sidebar - Solo móvil */}
          <button
            onClick={() => setSidebarOpen(false)}
            className={`md:hidden self-end p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
            }`}
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>

          {DATA.map(d => (
            <DepartmentButton
              key={d.id}
              dept={d}
              isActive={activeDept === d.id && !orgView}
              icon={getDeptIcon(d.id)}
              palette={getPalette(d.id)}
              darkMode={darkMode}
              onClick={() => { setActiveDept(d.id); setOrgView(false); }}
            />
          ))}
          <div className={`mt-3 border-t pt-3 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <button
              onClick={() => setOrgView(true)}
              className={cx(
                "w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition-all",
                orgView
                  ? darkMode
                    ? "bg-emerald-500/10 text-emerald-400 font-semibold shadow-md border-l-4 border-emerald-500"
                    : "bg-gradient-to-r from-sky-100 to-blue-100 text-slate-900 font-semibold shadow-md"
                  : darkMode
                    ? "text-slate-400 hover:bg-slate-800/50 hover:text-slate-300"
                    : "text-slate-700 hover:bg-slate-50"
              )}
            >
              <ListChecks className="w-5 h-5" />
              <span>Organigrama</span>
            </button>
          </div>
        </aside>

        {/* MEJORA 7: Main con animación de entrada y scroll suave */}
        <main className="flex-1 p-6 relative z-10 animate-fadeInUp overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
          {!orgView ? (
            <>
              {/* Header sección PROFESIONAL */}
              <div
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-start gap-4">
                    <div
                      className="p-2.5 rounded-lg border transition-colors"
                      style={{
                        backgroundColor: rgba(pal.textHex, 0.06),
                        borderColor: rgba(pal.textHex, 0.15)
                      }}
                    >
                      {React.createElement(DeptIconComp, {
                        className: "w-6 h-6",
                        style:{ color: pal.textHex }
                      })}
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-slate-900">{dept.name}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className="text-[10px] px-2.5 py-1 rounded-md font-medium"
                          style={{
                            backgroundColor: rgba(pal.textHex, 0.08),
                            color: pal.textHex,
                            border: `1px solid ${rgba(pal.textHex, 0.15)}`
                          }}
                        >
                          {dept.agents.length} agentes
                        </span>
                        {dept.chips.map((c: string, i: number)=>(
                          <span
                            key={i}
                            className={cx(
                              "text-[10px] px-2.5 py-1 rounded-md border inline-flex items-center gap-1 font-medium",
                              c.toLowerCase().includes('hitl')
                                ?'bg-amber-50 text-amber-700 border-amber-200'
                                :'bg-blue-50 text-blue-700 border-blue-200'
                            )}
                          >
                            {c.toLowerCase().includes('hitl')?<UserCheck className="w-3 h-3"/>:<ShieldCheck className="w-3 h-3"/>}
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6 mt-6">
                  <div
                    className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-semibold mb-3 border border-slate-300 shadow-sm"
                    style={{
                      backgroundColor: rgba(pal.textHex, 0.1),
                      color: pal.textHex
                    }}
                  >
                    <Brain className="w-5 h-5" />
                    {dept.neura.title}
                  </div>
                  <div className="text-sm text-slate-700 leading-relaxed font-medium mb-5">{dept.neura.subtitle}</div>

                  <div className="mt-5 flex gap-2.5 flex-wrap">
                    {dept.neura.tags.map((t: string, i: number) => (
                      <button
                        key={i}
                        className="text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-all inline-flex items-center gap-2 font-medium shadow-sm hover:shadow-md hover:scale-102"
                        style={{
                          color: pal.textHex
                        }}
                      >
                        <TagIcon text={t} />
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      className="h-10 px-5 rounded-lg border border-slate-300 text-white inline-flex items-center gap-2 text-sm font-semibold hover:scale-102 transition-all shadow-sm hover:shadow-md"
                      style={{
                        backgroundColor: pal.textHex,
                        opacity: 0.9
                      }}
                      onClick={() => setChatOpen(true)}
                    >
                      <MessageCircle className="w-4 h-4"/>
                      Abrir chat
                    </button>
                    <button
                      onClick={() => setPortalOpen(true)}
                      className="h-9 px-4 rounded-lg border border-slate-200 bg-white inline-flex items-center gap-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Portal
                    </button>
                    <button
                      onClick={() => setChatHistoryOpen(true)}
                      className="h-9 px-4 rounded-lg border border-slate-200 bg-white inline-flex items-center gap-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <ClipboardList className="w-4 h-4"/>
                      Ver historial
                    </button>
                    <button
                      onClick={() => setAgentExecutionOpen(true)}
                      className="h-9 px-4 rounded-lg border border-emerald-200 bg-emerald-50 inline-flex items-center gap-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      <Zap className="w-4 h-4"/>
                      Ejecutar Agentes
                    </button>
                  </div>
                </div>
              </div>

                {/* Grid de agentes - Responsive: 1â†'2â†'3 cols */}
              <div className="mt-6 grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start justify-items-center">
                {filteredAgents.map((a: Agent) => (
                  <AgentCard key={a.id} a={a} deptColor={pal.textHex} busy={busyId===a.id} progress={lastByAgent[a.id]?.status==='OK'?100:(lastByAgent[a.id]?.status==='ERROR'?0:11)} showUsage={showAllUsage} onRun={() => runAgent(a)} onConfigure={() => {
                    setConnectingAgent({ id: a.id, title: a.title });
                    setConnectModalOpen(true);
                  }} />
                  ))}
                <NewAgentCard deptId={dept.id} deptColor={pal.textHex} onCreate={startCreateAgent} />
                </div>

                {/* Actividad Reciente - Premium */}
              <div
                className={`mt-6 rounded-xl border p-6 transition-colors duration-500 ${
                  darkMode
                    ? 'bg-slate-800/30 border-slate-700/50'
                    : 'bg-white border-slate-200/80'
                }`}
                style={{
                  boxShadow: darkMode
                    ? '0 8px 24px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    : '0 4px 20px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                  transform: 'translateZ(0)',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="flex items-center gap-2.5 mb-5">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-emerald-500/10' : 'bg-slate-100'}`}>
                    <ActivityIcon className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-slate-600'}`} />
                  </div>
                  <div className={`font-semibold text-base ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>Actividad Reciente</div>
                </div>
                  {activity.length === 0 ? (
                  <div className={`text-sm text-center py-10 rounded-xl border border-dashed ${
                    darkMode
                      ? 'bg-slate-800/20 border-slate-700 text-slate-500'
                      : 'bg-slate-100/50 border-slate-300 text-slate-500'
                  }`}>
                    Sin actividad aún. Ejecuta un agente para ver resultados.
                  </div>
                  ) : (
                  <div className="max-h-[280px] overflow-y-auto pr-2">
                    <ul className="space-y-2.5">
                        {activity.slice(0, 4).map(e => (
                        <li
                          key={e.id}
                          className={`flex items-center gap-3 p-3.5 rounded-lg transition-all ${
                            darkMode
                              ? 'bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/50'
                              : 'bg-white hover:bg-slate-50 border border-slate-200'
                          }`}
                          style={{
                            boxShadow: darkMode
                              ? '0 2px 8px rgba(0, 0, 0, 0.2)'
                              : '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
                            transform: 'translateZ(2px)'
                          }}
                        >
                          <span className={cx(
                            'px-2.5 py-1 rounded-md text-[11px] font-bold',
                            e.status==='OK'
                              ? darkMode
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : darkMode
                                ? 'bg-slate-700/30 text-slate-400 border border-slate-600/30'
                                : 'bg-slate-100 text-slate-600 border border-slate-300'
                          )}>
                            {e.status === 'OK' ? 'OK' : 'Procesando'}
                          </span>
                          <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {new Date(e.ts).toLocaleTimeString()}
                          </span>
                          <span className={`font-semibold text-sm ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                            {e.agentId}
                          </span>
                          <span className={`truncate flex-1 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            {e.message}
                          </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

              </>
            ) : (
            <OrgChart />
          )}

          {/* Footer legal */}
          <div className="text-xs mt-6 pb-8" style={{ color: theme.muted, borderTop: `1px dashed ${theme.border}`, paddingTop: 8 }}>
            GDPR & AI Act · datos en la UE · TLS 1.2+ y AES-256 · auditoría HITL.
          </div>
        </main>
      </div>

      {/* Chat NEURA - Fullscreen en móvil */}
      {chatOpen && (
        <div className="fixed inset-0 bg-black/5 z-50 animate-fadeIn" onClick={()=>setChatOpen(false)}>
          <aside
            className="absolute right-0 top-0 h-full w-full md:w-[1160px] bg-white overflow-hidden flex flex-col"
            onClick={e=>e.stopPropagation()}
            style={{
              transform: 'perspective(2000px) rotateY(-1deg)',
              transformStyle: 'preserve-3d',
              boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.12), -10px 0 30px rgba(0, 0, 0, 0.08), inset 1px 0 0 rgba(255, 255, 255, 0.5)',
              animation: 'slideInRightPremium 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Header Premium Ultra-Elegante */}
            <div className="sticky top-0 bg-white border-b border-slate-200/40 px-8 py-5 z-20">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/20 to-transparent opacity-50"></div>
                <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {React.createElement(DeptIconComp, {
                      className: "w-6 h-6 relative z-10",
                      style:{ color: pal.textHex }
                    })}
                    <div className="absolute inset-0 bg-gradient-to-br opacity-20 rounded-full" style={{ backgroundColor: pal.textHex }}></div>
                  </div>
                  <div>
                    <div className="text-base font-semibold text-slate-900">{dept.neura.title}</div>
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-50 border border-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                        <span className="text-slate-900 font-semibold text-[11px]">Mistral Medium 3.1</span>
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 text-[10px] font-medium">Mammouth AI</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={()=>setChatOpen(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Cerrar"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Ñrea de mensajes Premium - fondo SÑ"LIDO */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-8 py-8 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent relative bg-gradient-to-b from-slate-50 via-white to-slate-50">

              {/* Saludo Premium */}
              {chatMsgs.length === 0 && (
                <div className="pt-16 pb-8 relative animate-fadeIn">
                  <div className="max-w-2xl">
                    <h1 className="text-3xl font-light text-slate-900 leading-tight mb-3">
                      Hola, ¿en qué deberíamos profundizar hoy?
                    </h1>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Estoy aquí para ayudarte con análisis, estrategias y decisiones ejecutivas. Puedes hacerme cualquier pregunta o pedirme que ejecute tareas específicas.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button 
                        onClick={() => setChatInput("Sugerir estrategia Q4")}
                        className="px-4 py-2.5 bg-white hover:bg-slate-50 rounded-lg text-xs text-slate-700 font-medium transition-colors border border-slate-200 shadow-sm"
                      >
                        Sugerir estrategia Q4
                      </button>
                      <button 
                        onClick={() => setChatInput("Analizar métricas clave")}
                        className="px-4 py-2.5 bg-white hover:bg-slate-50 rounded-lg text-xs text-slate-700 font-medium transition-colors border border-slate-200 shadow-sm"
                      >
                        Analizar métricas clave
                      </button>
                      <button 
                        onClick={() => setChatInput("Revisar OKRs")}
                        className="px-4 py-2.5 bg-white hover:bg-slate-50 rounded-lg text-xs text-slate-700 font-medium transition-colors border border-slate-200 shadow-sm"
                      >
                        Revisar OKRs
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mensajes Premium Ultra-Elegantes */}
              <div className="space-y-8 relative">
              {chatMsgs.map((m, idx) => (
                <div key={m.id} className={cx("flex flex-col gap-2", m.role === 'user' ? 'items-end' : 'items-start')}
                  style={{ 
                    animation: `fadeInUp 0.5s ease-out forwards ${idx * 40}ms`
                  }}>
                  {/* Badge de función ejecutada si aplica */}
                  {m.role === 'assistant' && m.function_call && (
                    <div className="flex items-center gap-2 px-3 py-1 mb-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                          {m.function_call.name === 'ejecutar_webhook' ? '⚡ Agente Ejecutado' :
                           m.function_call.name === 'agendar_reunion' ? '📅 Reunión Agendada' :
                           m.function_call.name === 'consultar_datos' ? '📊 Datos Consultados' :
                           m.function_call.name === 'enviar_alerta' ? '🚨 Alerta Enviada' :
                           m.function_call.name === 'generar_reporte' ? '📄 Reporte Generando' :
                           m.function_call.name === 'listar_agentes_disponibles' ? '📋 Agentes Listados' : '🔧 Función'}
                        </span>
                        {m.function_call.hitl_required && (
                          <span className="text-[9px] font-bold text-amber-400">⚠ HITL</span>
                        )}
                      </div>
                    </div>
                  )}
                  <div
                    className={cx(
                      "max-w-[80%] rounded-3xl px-6 py-5 text-sm transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden",
                      m.role === 'user'
                        ? darkMode
                          ? 'bg-slate-700 text-white shadow-lg'
                          : 'bg-slate-900 text-white shadow-lg'
                        : darkMode
                          ? 'bg-white/10 text-slate-100 border border-white/20 shadow-lg'
                          : 'bg-white text-slate-900 border-2 border-slate-300 shadow-lg'
                    )}
                    style={{
                      transform: 'perspective(1000px) translateZ(0)',
                      transformStyle: 'preserve-3d'
                    }}
                  >

                    <div className="leading-relaxed relative z-10 prose prose-sm max-w-none prose-slate" style={{ color: m.role === 'assistant' ? '#000000' : 'inherit' }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Referencias de la biblioteca */}
                  {m.role === 'assistant' && m.references && m.references.length > 0 && (
                    <div className="w-full">
                      <ReferencesBlock references={m.references} darkMode={!darkMode} />
                    </div>
                  )}

                  {/* Sistema agentic temporalmente deshabilitado */}

                  {/* Metadata + Acciones */}
                  <div className="flex items-center gap-3 px-2">
                    {m.role === 'assistant' && (m.tokens ?? 0) > 0 && (
                      <span className="text-[10px] text-slate-400 font-mono">{m.tokens} tokens</span>
                    )}
                    {m.role === 'assistant' && m.function_call && (
                      <span className="text-[10px] font-semibold text-slate-700 px-2 py-0.5 bg-slate-100 rounded">
                        {m.function_call.status === 'executed' ? '✅ Ejecutado' : '❌ Falló'}
                      </span>
                    )}
                    {m.role === 'assistant' && (
                      <div className="flex items-center gap-1">
                        <button
                          className="p-1.5 rounded-lg hover:bg-slate-100 transition-all group"
                          title="Copiar"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                        </button>
                        {voiceSupported && (
                          <button
                            onClick={() => speak(m.text)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition-all group"
                            title="Escuchar"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              </div>
            </div>

            {/* Composer Premium Ultra-Elegante */}
            <div
              className="sticky bottom-0 bg-white border-t border-slate-200/40 px-8 py-6"
              style={{
                transform: 'perspective(1000px) translateZ(10px)',
                transformStyle: 'preserve-3d',
                boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.03), 0 -1px 0 rgba(255, 255, 255, 0.5) inset'
              }}
            >

              {/* Preview de imagen si está cargada */}
              {uploadedImage && (
                <div className="mb-4 relative inline-block">
                  <img src={uploadedImage} alt="Preview" className="max-w-xs max-h-32 rounded-lg border-2 border-slate-300 shadow-md" />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-slate-800 shadow-lg"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Input Premium Minimalista */}
              <div className="flex items-center gap-3 bg-white rounded-2xl p-4 border-2 border-slate-300 shadow-md hover:border-slate-400 transition-all duration-200 group"
              >
                
                <input
                  value={chatInput}
                  onChange={(e)=>setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                  className="flex-1 bg-transparent border-none outline-none px-2 py-2 text-[14px] text-slate-900 placeholder-slate-500 font-normal"
                  placeholder="Escribe tu mensaje o comando..."
                />

                {/* Botones de acción Premium */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div className="flex items-center gap-2 border-l border-slate-300 pl-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                    title="Subir imagen"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  {voiceSupported && (
                    <button
                      onClick={toggleListen}
                      className={cx(
                        "p-2 rounded-lg transition-colors",
                        listening 
                          ? "bg-slate-900 text-white" 
                          : "hover:bg-slate-100 text-slate-600"
                      )}
                      title={listening ? "Detener micrófono" : "Activar micrófono"}
                    >
                      {listening ? <MicOff className="w-4 h-4"/> : <Mic className="w-4 h-4"/>}
                    </button>
                  )}
                  <button
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim() && !uploadedImage}
                    className={cx(
                      "px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                      chatInput.trim() || uploadedImage
                        ? "bg-slate-900 text-white hover:bg-slate-800"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
      <FooterComponent />

      {/* Modals */}
      <EconeuraModals
        chatHistoryOpen={chatHistoryOpen}
        setChatHistoryOpen={setChatHistoryOpen}
        portalOpen={portalOpen}
        setPortalOpen={setPortalOpen}
        agentExecutionOpen={agentExecutionOpen}
        setAgentExecutionOpen={setAgentExecutionOpen}
        token={userToken || ''}
        darkMode={darkMode}
        chatContext={chatInput}
        userIntent={chatInput}
      />

      {/* Modal de Conexión de Proveedores */}
      {connectModalOpen && connectingAgent && (
        <ConnectAgentModal
          agentName={connectingAgent.title}
          isOpen={connectModalOpen}
          onClose={() => {
            setConnectModalOpen(false);
            setConnectingAgent(null);
            setBusyId('');
          }}
          onConnect={(agentData) => {
            // Guardar configuración del webhook en localStorage
            const webhookConfig = JSON.parse(localStorage.getItem('econeura_webhooks') || '{}');
            webhookConfig[connectingAgent.id] = {
              provider: agentData.provider,
              providerName: agentData.providerName,
              webhookUrl: agentData.webhookUrl,
              connectedAt: agentData.connectedAt
            };
            localStorage.setItem('econeura_webhooks', JSON.stringify(webhookConfig));
            
            // Notificar al usuario
            toast.success(`✅ ${agentData.providerName} conectado correctamente`, {
              description: `Agente: ${connectingAgent.title}`
            });
            
            setConnectModalOpen(false);
            
            // Ejecutar el agente ahora que está conectado
            const agent = dept.agents.find(a => a.id === connectingAgent.id);
            if (agent) {
              runAgent(agent);
            }
            setConnectingAgent(null);
          }}
        />
      )}

      {/* NEURA Library Panel */}
      <LibraryPanel
        darkMode={darkMode}
        visible={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        userId={userData?.id}
      />

      {/* HITL Approval Modal */}
      {hitlModalOpen && pendingHITL && (
        <HITLApprovalModal
          isOpen={hitlModalOpen}
          onClose={() => {
            setHitlModalOpen(false);
            setPendingHITL(null);
          }}
          onApprove={() => {
            setChatMsgs(v => [...v, {
              id: correlationId(),
              text: '✅ Aprobado por usuario. Ejecutando acción...',
              role: 'assistant'
            }]);
            setHitlModalOpen(false);
            setPendingHITL(null);
          }}
          onReject={() => {
            setChatMsgs(v => [...v, {
              id: correlationId(),
              text: '❌ Acción rechazada por usuario.',
              role: 'assistant'
            }]);
            setHitlModalOpen(false);
            setPendingHITL(null);
          }}
          functionName={pendingHITL.functionName}
          functionArgs={pendingHITL.functionArgs}
          functionResult={pendingHITL.functionResult}
          neuraName={pendingHITL.neuraName}
        />
      )}
    </div>
    </>
  );
}

type AgentCardProps = { a: Agent; deptColor: string; busy?: boolean; progress?: number; showUsage?: boolean; onRun: () => Promise<any> | void; onConfigure: () => void };
const AgentCard = memo(function AgentCard({ a, deptColor, busy, progress, showUsage, onRun, onConfigure }: AgentCardProps) {
  const pct = Math.max(0, Math.min(100, (progress ?? 11)));
  const I: React.ElementType = iconForAgent(a.title);
  const { r, g, b } = hexToRgb(deptColor);

  return (
    <div className="group relative w-full max-w-full md:max-w-[580px] bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/60 rounded-2xl p-4 md:p-8 flex flex-col shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-400/30 hover:-translate-y-2 transition-all duration-500" style={{
      transform: 'perspective(1000px) rotateX(0deg)',
      transformStyle: 'preserve-3d'
    }}>
      {/* Efecto 3D sutil */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none" style={{ transform: 'translateZ(1px)' }}></div>

      <div className="flex items-start justify-between gap-3 mb-4 relative" style={{ transform: 'translateZ(2px)' }}>
        <div className="flex items-start gap-3 flex-1">
          <div
            className="mt-0.5 p-2.5 rounded-xl border border-slate-200/60 group-hover:scale-105 transition-all duration-200 shadow-md"
            style={{
              backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
              boxShadow: `0 4px 12px rgba(${r}, ${g}, ${b}, 0.15)`
            }}
          >
            {React.createElement(I, { className: "w-5 h-5", style: { color: deptColor } })}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-slate-900 leading-tight">{a.title}</div>
            <div className="text-sm text-slate-600 mt-2 leading-relaxed">{a.desc}</div>
          </div>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium whitespace-nowrap shadow-sm">
          ✅
        </span>
        <button
          onClick={onConfigure}
          className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shadow-sm hover:shadow-md"
          aria-label="Configurar agente"
          title="Conectar con Make, n8n o ChatGPT"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {showUsage && (
        a.pills && a.pills.length ? (
          <div className="mb-4 text-xs text-slate-700 flex gap-2 flex-wrap relative" style={{ transform: 'translateZ(2px)' }}>
            {a.pills.map((p: string, i: number) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 font-medium shadow-sm">{p}</span>
          ))}
        </div>
        ) : (
          <div className="mb-4 text-xs text-slate-500 font-medium">Consumo: N/D</div>
        )
      )}

      <div className="mb-5 relative" style={{ transform: 'translateZ(2px)' }}>
        <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden shadow-inner border border-slate-200/60">
          <div
            className="absolute inset-y-0 left-0 h-2 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${pct}%`,
              minWidth: pct > 0 ? '8px' : '0px',
              background: `linear-gradient(90deg, rgba(${r}, ${g}, ${b}, 0.7), rgba(${r}, ${g}, ${b}, 0.9))`,
              boxShadow: `0 0 10px rgba(${r}, ${g}, ${b}, 0.3)`
            }}
          />
        </div>
        <div className="mt-2.5 text-sm text-slate-600 font-medium">{pct}% completado</div>
      </div>

      <div className="flex gap-3 relative" style={{ transform: 'translateZ(3px)' }}>
        {/* MEJORA 9: Botón ejecutar con brillo premium */}
        <button
          onClick={() => onRun()}
          disabled={!!busy}
          className={cx("w-[230px] h-11 px-5 rounded-xl text-base font-semibold transition-shadow duration-200 active:scale-95 inline-flex items-center justify-center gap-2 shrink-0 relative",
            busy
              ? "opacity-60 cursor-not-allowed bg-slate-100 text-slate-500 border border-slate-200/60"
              : "text-white shadow-lg hover:shadow-2xl border-0"
          )}
          style={!busy ? {
            background: `linear-gradient(135deg, rgb(${r}, ${g}, ${b}), rgb(${Math.floor(r*0.9)}, ${Math.floor(g*0.9)}, ${Math.floor(b*0.9)}))`,
            boxShadow: `0 6px 20px rgba(${r}, ${g}, ${b}, 0.35), 0 2px 8px rgba(${r}, ${g}, ${b}, 0.2)`,
            width: '230px'
          } : { width: '230px' }}>
          {busy ? (
            <>
              <span className="animate-spin text-base">â³</span>
              <span>Ejecutando</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Ejecutar</span>
            </>
          )}
        </button>
        <button className="h-11 w-11 shrink-0 rounded-xl border border-slate-200/60 text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center">
          <Pause className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});

type NewAgentCardProps = { deptId: string; deptColor: string; onCreate: (deptId: string) => void };
function NewAgentCard({ deptId, deptColor, onCreate }: NewAgentCardProps){
  const { r, g, b } = hexToRgb(deptColor);

  const handleCreate = () => {
    const name = prompt('Nombre del nuevo agente:');
    if (name) {
      alert(`Creando agente "${name}" para ${deptId}...\n\n(En producción esto se guardaría en la base de datos)`);
      onCreate(deptId);
    }
  };

  return (
    <div
      className="group relative w-full max-w-[580px] bg-gradient-to-b from-slate-50 to-white border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 shadow-lg hover:shadow-2xl hover:border-solid hover:-translate-y-2 transition-all duration-500"
      style={{
        transform: 'perspective(1000px) rotateX(0deg)',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Icono central - MISMO TAMAÑ'O que AgentCard */}
      <div
        className="p-2.5 rounded-xl border border-slate-200/60 shadow-md group-hover:scale-110 transition-all duration-300"
        style={{
          backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
          boxShadow: `0 4px 15px rgba(${r}, ${g}, ${b}, 0.15)`
        }}
      >
        <Workflow className="w-5 h-5" style={{ color: deptColor }} />
      </div>

      {/* Texto */}
      <div className="text-center">
        <div className="text-base font-bold text-slate-900">Nuevo Agente</div>
        <div className="text-sm text-slate-600 mt-1">Crear agente personalizado</div>
      </div>

      {/* Botón crear */}
      <button
        onClick={handleCreate}
        className="w-full h-11 rounded-xl text-base font-semibold text-white shadow-md hover:shadow-lg hover:scale-102 transition-all duration-200 border border-slate-200/60"
        style={{
          background: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.75), rgba(${r}, ${g}, ${b}, 0.9))`,
          boxShadow: `0 4px 12px rgba(${r}, ${g}, ${b}, 0.25)`
        }}
      >
        + Crear
      </button>
    </div>
  );
}

export function OrgChart() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {DATA.map((d: Department) => {
        const Icon = getDeptIcon(d.id);
        const p = getPalette(d.id);
        const { r, g, b } = hexToRgb(p.textHex);
        return (
          <div
            key={d.id}
            className="group relative bg-white border border-slate-200/80 rounded-2xl p-6 hover:-translate-y-2 transition-all duration-300"
            style={{
              transform: 'perspective(1200px) rotateX(2deg)',
              transformStyle: 'preserve-3d',
              boxShadow: `0 12px 32px rgba(${r}, ${g}, ${b}, 0.15), 0 6px 16px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)`
            }}
          >
            {/* Efecto 3D overlay mejorado */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/60 via-transparent to-slate-50/20 pointer-events-none group-hover:from-white/40 transition-all duration-300" style={{ transform: 'translateZ(2px)' }}></div>

            {/* Borde inferior 3D */}
            <div className="absolute inset-x-4 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-slate-200/50 to-transparent" style={{ transform: 'translateZ(-1px)' }}></div>

            {/* Header del departamento */}
            <div className="flex items-start justify-between mb-5 relative" style={{ transform: 'translateZ(2px)' }}>
              <div className="flex items-start gap-3 flex-1">
                <div
                  className="p-3 rounded-xl border border-slate-200/60 shadow-lg group-hover:scale-110 transition-all duration-300"
                  style={{
                    backgroundColor: rgba(p.textHex, 0.1),
                    boxShadow: `0 4px 15px rgba(${r}, ${g}, ${b}, 0.2)`
                  }}
                >
                  {React.createElement(Icon, {
                    className: "w-6 h-6",
                    style:{ color: p.textHex }
                  })}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base text-slate-900 leading-tight">
                    {d.name}
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg font-semibold mt-2 border shadow-sm"
                    style={{
                      backgroundColor: rgba(p.textHex, 0.1),
                      color: p.textHex,
                      borderColor: rgba(p.textHex, 0.2)
                    }}
                  >
                    <Brain className="w-3.5 h-3.5" />
                    NEURA
                  </div>
                </div>
              </div>
              <span
                className="text-xs px-3 py-1.5 rounded-full font-bold whitespace-nowrap border-2 shadow-md"
                style={{
                  backgroundColor: rgba(p.textHex, 0.1),
                  color: p.textHex,
                  borderColor: rgba(p.textHex, 0.3)
                }}
              >
                {d.agents.length}
              </span>
            </div>

            {/* Lista de agentes con efecto 3D */}
            <ul className="text-sm text-slate-700 space-y-2 mb-5 relative" style={{ transform: 'translateZ(2px)' }}>
              <li className="flex items-start gap-2.5 font-bold">
                <span
                  className="mt-1.5 w-2 h-2 rounded-full shadow-md"
                  style={{
                    backgroundColor: p.textHex,
                    boxShadow: `0 0 8px rgba(${r}, ${g}, ${b}, 0.4)`
                  }}
                />
                <span style={{ color: p.textHex }}>{d.neura.title}</span>
              </li>
              {d.agents.slice(0, 4).map((a: Agent) => (
                <li
                  key={a.id}
                  className="flex items-start gap-2.5 text-xs hover:translate-x-1 transition-transform duration-200"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shadow-sm"/>
                  <span className="text-slate-600">{a.title}</span>
                </li>
              ))}
              {d.agents.length > 4 && (
                <li className="text-xs text-slate-500 pl-4 font-medium">
                  + {d.agents.length - 4} agentes más
                </li>
              )}
            </ul>

            {/* Footer con tags premium */}
            <div className="flex gap-2 flex-wrap pt-4 border-t-2 border-slate-200/50 relative" style={{ transform: 'translateZ(2px)' }}>
              {d.neura.tags.slice(0, 3).map((tag: string, i: number) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold shadow-sm border hover:scale-105 transition-all duration-200"
                  style={{
                    backgroundColor: rgba(p.textHex, 0.08),
                    color: rgba(p.textHex, 0.9),
                    borderColor: rgba(p.textHex, 0.2)
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Exportar helpers para tests
export const __TEST_HELPERS = { iconForAgent, getDeptIcon, getPalette, isReactComponent: isComponent, correlationId, invokeAgent };
export const __RUN_SELF_TESTS = (overrides?: Record<string, unknown>) => {
  const failures: string[] = [];
  try {
    const LogoComp = overrides?.LogoEconeura || LogoEconeura;
    const samples = ['Agente: Agenda Consejo','Agente: Resumen','Agente: OKR','Agente: Phishing Triage','Agente: X'];
    samples.forEach((s: string) => {
      const I = iconForAgent(s);
      if (!isComponent(I)) failures.push(`iconForAgent inválido: ${s}`);
    });
    DATA.forEach((d: Department) => {
      const I = getDeptIcon(d.id);
      if (!isComponent(I)) failures.push(`getDeptIcon inválido: ${d.id}`);
      const pal = getPalette(d.id);
      if (!pal || typeof pal.accentText !== 'string') failures.push(`getPalette inválido: ${d.id}`);
    });
    const el = LogoComp();
    if (!el) failures.push('LogoEconeura falla');
  } catch (e: any) {
    failures.push(`self-test: ${e?.message||e}`);
  } finally {
    if (failures.length && process.env.NODE_ENV === 'development') {
      // Self-test failures solo en desarrollo
    }
  }
  return failures;
};

// Auto-ejecutar self-tests en runtime
(() => {
__RUN_SELF_TESTS();
})();

// Modals (render at end of component)
export function EconeuraModals({ 
  chatHistoryOpen, 
  setChatHistoryOpen, 
  portalOpen, 
  setPortalOpen, 
  agentExecutionOpen, 
  setAgentExecutionOpen, 
  token, 
  darkMode, 
  chatContext, 
  userIntent 
}: any) {
  return (
    <>
      {chatHistoryOpen && (
        <ChatHistory
          isOpen={chatHistoryOpen}
          onClose={() => setChatHistoryOpen(false)}
          token={token}
        />
      )}
      {/* CustomerPortal component not exported - disabled
      {portalOpen && (
        <CustomerPortal
          isOpen={portalOpen}
          onClose={() => setPortalOpen(false)}
          token={token}
          darkMode={darkMode}
        />
      )}
      */}
      {agentExecutionOpen && (
        <AgentExecutionPanel
          darkMode={darkMode}
          visible={agentExecutionOpen}
          onClose={() => setAgentExecutionOpen(false)}
          chatContext={chatContext}
          userIntent={userIntent}
        />
      )}
    </>
  );
}

