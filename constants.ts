
import { Responsibility, FunnelData, PDCAEntry, UserRole } from './types';

export const INITIAL_RESPONSIBILITIES: Responsibility[] = [
  {
    id: '1',
    role: 'SDR',
    mainGoal: 'Qualificar leads frios e agendar reuniões',
    keyActivities: ['Prospecção ativa', 'Primeiro contato', 'Qualificação'],
    primaryMetric: 'Reuniões Agendadas',
    secondaryMetric: 'Leads Qualificados',
    deliverables: ['Pipeline de reuniões semanal']
  },
  {
    id: '2',
    role: 'Account Executive',
    mainGoal: 'Fechar novos negócios e bater meta de receita',
    keyActivities: ['Apresentação de solução', 'Negociação', 'Fechamento'],
    primaryMetric: 'Receita Vendida (R$)',
    secondaryMetric: 'Taxa de Conversão Proposta > Venda',
    deliverables: ['Contratos assinados']
  }
];

export const INITIAL_FUNNEL_DATA: FunnelData = {
  leadsGeneratedMQL: 400,
  leadsQualifiedSQL: 120,
  opportunitiesOPPS: 45,
  closedSales: 8,
  avgTicket: 5000,
  revenueGoal: 60000
};

export const INITIAL_PDCA: PDCAEntry[] = [
  {
    id: 'pdca-1',
    responsibleName: 'João Gestor',
    responsibleRole: 'Gestor Comercial',
    problem: 'Baixa conversão de Lead Gerado para Lead Qualificado',
    funnelStage: 'Topo do Funil',
    metricAffected: 'Taxa de Qualificação',
    rootCause: 'Oferta',
    actionPlan: 'Ajustar script de abordagem inicial focando na dor principal do ICP',
    completionDeadline: '10 dias',
    status: 'Em Curso'
  }
];
