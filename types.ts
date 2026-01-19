
export enum UserRole {
  ADMIN = 'Gestor Comercial',
  SDR_BDR = 'SDR / BDR',
  SALES = 'Vendedor',
  STRATEGIC = 'Diretor / Sócio'
}

export interface Responsibility {
  id: string;
  role: string;
  mainGoal: string;
  keyActivities: string[];
  primaryMetric: string;
  secondaryMetric: string;
  deliverables: string[];
}

export interface FunnelData {
  leadsGeneratedMQL: number;
  leadsQualifiedSQL: number;
  opportunitiesOPPS: number;
  closedSales: number;
  avgTicket: number;
  revenueGoal: number;
}

export interface RoutineEntry {
  id: string;
  date: string;
  role: string;
  activityType: 'Ligações' | 'Mensagens' | 'E-mail' | 'Follow Up';
  quantity: number;
  timeSpent: number; // in minutes
  result: string;
  qualityCheck: {
    budgetValidated: boolean;
    decisionMakerIdentified: boolean;
    clearPain: boolean;
    definedDeadline: boolean;
  };
}

export interface PDCAEntry {
  id: string;
  responsibleName: string;
  responsibleRole: string;
  problem: string;
  funnelStage: string;
  metricAffected: string;
  rootCause: 'Pessoas' | 'Processo' | 'Ferramenta' | 'Oferta';
  actionPlan: string;
  completionDeadline: string; 
  status: 'Pendente' | 'Em Curso' | 'Concluído';
}

export interface Insight {
  type: 'alert' | 'success' | 'suggestion';
  title: string;
  content: string;
}
