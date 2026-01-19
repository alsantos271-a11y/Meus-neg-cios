
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell 
} from 'recharts';
import { 
  Responsibility, FunnelData, PDCAEntry, RoutineEntry, Insight 
} from './types';
import { 
  INITIAL_RESPONSIBILITIES, INITIAL_FUNNEL_DATA, INITIAL_PDCA 
} from './constants';
import { generateExecutiveInsights } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('funnel');
  const [responsibilities, setResponsibilities] = useState<Responsibility[]>(INITIAL_RESPONSIBILITIES);
  const [funnelData, setFunnelData] = useState<FunnelData>(INITIAL_FUNNEL_DATA);
  const [pdcaEntries, setPdcaEntries] = useState<PDCAEntry[]>(INITIAL_PDCA);
  const [routines, setRoutines] = useState<RoutineEntry[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Calcula o total de atividades baseadas na Rotina Comercial
  const totalActivities = useMemo(() => {
    return routines.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  }, [routines]);

  // Modal States
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [editingResponsibility, setEditingResponsibility] = useState<Responsibility | null>(null);

  // Form States for New Entries
  const [newRoutine, setNewRoutine] = useState<Partial<RoutineEntry>>({
    role: 'SDR',
    activityType: 'Ligações',
    quantity: 1,
    timeSpent: 10,
    qualityCheck: { budgetValidated: false, decisionMakerIdentified: false, clearPain: false, definedDeadline: false }
  });

  const [newPdca, setNewPdca] = useState<Partial<PDCAEntry>>({
    responsibleName: '',
    responsibleRole: 'Gestor Comercial',
    problem: '',
    rootCause: 'Processo',
    funnelStage: 'Topo do Funil',
    status: 'Pendente',
    actionPlan: '',
    completionDeadline: ''
  });

  const [matrixFormData, setMatrixFormData] = useState<Partial<Responsibility>>({
    role: '',
    mainGoal: '',
    primaryMetric: '',
    secondaryMetric: '',
    keyActivities: [],
    deliverables: []
  });

  const handleRefreshInsights = useCallback(async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const newInsights = await generateExecutiveInsights(funnelData, pdcaEntries, routines, totalActivities);
      if (newInsights && Array.isArray(newInsights)) {
        setInsights(newInsights);
      }
    } catch (err) {
      console.error("Erro ao carregar insights:", err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [funnelData, pdcaEntries, routines, totalActivities, isAnalyzing]);

  useEffect(() => {
    handleRefreshInsights();
  }, []); // Carrega uma vez no mount

  const addRoutine = () => {
    const entry: RoutineEntry = {
      ...newRoutine as RoutineEntry,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };
    setRoutines([entry, ...routines]);
    setNewRoutine({
      role: 'SDR',
      activityType: 'Ligações',
      quantity: 1,
      timeSpent: 10,
      qualityCheck: { budgetValidated: false, decisionMakerIdentified: false, clearPain: false, definedDeadline: false }
    });
  };

  const addPdca = () => {
    const entry: PDCAEntry = {
      ...newPdca as PDCAEntry,
      id: Math.random().toString(36).substr(2, 9),
    };
    setPdcaEntries([entry, ...pdcaEntries]);
    setNewPdca({ 
      responsibleName: '',
      responsibleRole: 'Gestor Comercial',
      problem: '',
      rootCause: 'Processo', 
      funnelStage: 'Topo do Funil', 
      status: 'Pendente', 
      actionPlan: '',
      completionDeadline: ''
    });
  };

  const handleSaveMatrix = () => {
    if (editingResponsibility) {
      setResponsibilities(responsibilities.map(r => r.id === editingResponsibility.id ? { ...editingResponsibility, ...matrixFormData } as Responsibility : r));
    } else {
      const newEntry: Responsibility = {
        ...matrixFormData as Responsibility,
        id: Math.random().toString(36).substr(2, 9),
        keyActivities: [],
        deliverables: []
      };
      setResponsibilities([...responsibilities, newEntry]);
    }
    setShowMatrixModal(false);
    setEditingResponsibility(null);
    setMatrixFormData({ role: '', mainGoal: '', primaryMetric: '', secondaryMetric: '' });
  };

  const openEditMatrix = (resp: Responsibility) => {
    setEditingResponsibility(resp);
    setMatrixFormData(resp);
    setShowMatrixModal(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'funnel':
        return (
          <div className="space-y-6">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Funil Matemático</h2>
                <p className="text-slate-500">Ajuste os números da sua operação para ver o impacto em tempo real.</p>
              </div>
              <div className="flex gap-4">
                 <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Receita Atual</p>
                   <p className="text-sm font-bold text-purple-700">R$ {(funnelData.closedSales * funnelData.avgTicket).toLocaleString()}</p>
                 </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold mb-6 text-slate-800 border-b pb-2">Entradas da Operação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Atividades Realizadas (Automático)
                    </label>
                    <input
                      type="number"
                      value={totalActivities}
                      readOnly
                      disabled
                      className="w-full px-3 py-2 border border-slate-100 bg-slate-50 text-slate-400 rounded-lg cursor-not-allowed outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Leads Gerados (MQL)</label>
                    <input
                      type="number"
                      value={funnelData.leadsGeneratedMQL}
                      onChange={(e) => setFunnelData({...funnelData, leadsGeneratedMQL: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Leads Qualif. Vendas (SQL)</label>
                    <input
                      type="number"
                      value={funnelData.leadsQualifiedSQL}
                      onChange={(e) => setFunnelData({...funnelData, leadsQualifiedSQL: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Oportunidades (OPPS)</label>
                    <input
                      type="number"
                      value={funnelData.opportunitiesOPPS}
                      onChange={(e) => setFunnelData({...funnelData, opportunitiesOPPS: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vendas</label>
                    <input
                      type="number"
                      value={funnelData.closedSales}
                      onChange={(e) => setFunnelData({...funnelData, closedSales: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ticket Médio (R$)</label>
                    <input
                      type="number"
                      value={funnelData.avgTicket}
                      onChange={(e) => setFunnelData({...funnelData, avgTicket: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 text-purple-600">Meta de Receita (R$)</label>
                    <input
                      type="number"
                      value={funnelData.revenueGoal}
                      onChange={(e) => setFunnelData({...funnelData, revenueGoal: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-purple-200 bg-purple-50 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-bold text-purple-900"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-800 to-indigo-900 text-white p-8 rounded-xl shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">Projeção Baseada em Dados</h3>
                    <p className="text-purple-100 text-sm mb-6 opacity-80">Com as conversões atuais, sua operação entrega:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10">
                        <p className="text-xs text-purple-200 uppercase font-bold mb-1 tracking-wider">Receita Esperada</p>
                        <p className="text-2xl font-bold">R$ {(funnelData.closedSales * funnelData.avgTicket).toLocaleString()}</p>
                      </div>
                      <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10">
                        <p className="text-xs text-purple-200 uppercase font-bold mb-1 tracking-wider">Eficiência Geral</p>
                        <p className="text-2xl font-bold">{totalActivities > 0 ? ((funnelData.closedSales / totalActivities) * 100).toFixed(2) : 0}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-xl flex flex-col border border-purple-500/20 min-h-[200px]">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="text-purple-400">✨</span> Motor de Insights IA
                  </h3>
                  <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-2">
                    {isAnalyzing ? (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                         <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                         <p className="text-xs font-medium">Analisando sua performance...</p>
                      </div>
                    ) : insights.length > 0 ? (
                      insights.slice(0, 3).map((insight, idx) => (
                        <div key={idx} className={`p-4 rounded-lg border-l-4 animate-in fade-in slide-in-from-left-2 duration-300 ${
                          insight.type === 'alert' ? 'bg-red-500/10 border-red-500' : 
                          insight.type === 'success' ? 'bg-emerald-500/10 border-emerald-500' : 
                          'bg-purple-500/10 border-purple-500'
                        }`}>
                          <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">{insight.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                         <p className="text-slate-400 text-sm italic">Clique no botão flutuante de IA para gerar uma consultoria agora.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'matrix':
        return (
          <div className="space-y-6">
            <header className="flex justify-between items-center">
               <div>
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Matriz de Responsabilidades</h2>
                  <p className="text-slate-500">Defina claramente o que se espera de cada função no processo.</p>
               </div>
               <button 
                onClick={() => {
                  setEditingResponsibility(null);
                  setMatrixFormData({ role: '', mainGoal: '', primaryMetric: '', secondaryMetric: '' });
                  setShowMatrixModal(true);
                }}
                className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 text-sm font-bold transition-all active:scale-95 shadow-md"
               >
                + Adicionar Função
               </button>
            </header>

            {showMatrixModal && (
              <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full transform transition-all border border-slate-200">
                  <h3 className="text-xl font-bold mb-6 text-slate-800">{editingResponsibility ? 'Editar Função' : 'Adicionar Nova Função'}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Função</label>
                      <input 
                        type="text" 
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        placeholder="Ex: Closer, BDR, etc."
                        value={matrixFormData.role}
                        onChange={(e) => setMatrixFormData({...matrixFormData, role: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Objetivo Principal</label>
                      <textarea 
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none h-24 transition-all"
                        placeholder="Qual o propósito final desta função?"
                        value={matrixFormData.mainGoal}
                        onChange={(e) => setMatrixFormData({...matrixFormData, mainGoal: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Métrica Primária</label>
                        <input 
                          type="text" 
                          className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                          placeholder="Ex: Reuniões"
                          value={matrixFormData.primaryMetric}
                          onChange={(e) => setMatrixFormData({...matrixFormData, primaryMetric: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Métrica Secundária</label>
                        <input 
                          type="text" 
                          className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                          placeholder="Ex: Taxa de Qualif."
                          value={matrixFormData.secondaryMetric}
                          onChange={(e) => setMatrixFormData({...matrixFormData, secondaryMetric: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => { setShowMatrixModal(false); setEditingResponsibility(null); }}
                        className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={handleSaveMatrix}
                        className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg"
                      >
                        {editingResponsibility ? 'Salvar Alterações' : 'Adicionar Função'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {responsibilities.map((resp) => (
                <div key={resp.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group overflow-hidden hover:shadow-md transition-all">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-600"></div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-slate-900">{resp.role}</h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEditMatrix(resp)}
                        className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        ✏️
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Objetivo Principal</h4>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{resp.mainGoal}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Métrica Primária</h4>
                        <div className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-100 text-center">
                          {resp.primaryMetric}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Métrica Secundária</h4>
                        <div className="px-3 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-100 text-center">
                          {resp.secondaryMetric}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'pdca':
        return (
          <div className="space-y-6">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">PDCA & Gestão de Gargalos</h2>
                <p className="text-slate-500">Identifique problemas e rode ações para aumentar a conversão.</p>
              </div>
              <button 
                onClick={() => {
                  const modal = document.getElementById('pdca-modal');
                  if(modal) modal.classList.toggle('hidden');
                }}
                className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 text-sm font-bold transition-all active:scale-95 shadow-md"
              >
                + Nova Ação
              </button>
            </header>

            <div id="pdca-modal" className="hidden fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full border border-slate-200">
                <h3 className="text-xl font-bold mb-6">Criar Nova Ação PDCA</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Responsável</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="Ex: João Silva"
                        value={newPdca.responsibleName}
                        onChange={(e) => setNewPdca({...newPdca, responsibleName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Função</label>
                      <select 
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        value={newPdca.responsibleRole}
                        onChange={(e) => setNewPdca({...newPdca, responsibleRole: e.target.value})}
                      >
                        <option>Gestor Comercial</option>
                        <option>SDR / BDR</option>
                        <option>Account Executive</option>
                        <option>Diretor</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Problema Identificado</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="Ex: Baixa conversão em reunião"
                      value={newPdca.problem}
                      onChange={(e) => setNewPdca({...newPdca, problem: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Causa Raiz</label>
                      <select 
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        value={newPdca.rootCause}
                        onChange={(e) => setNewPdca({...newPdca, rootCause: e.target.value as any})}
                      >
                        <option>Pessoas</option>
                        <option>Processo</option>
                        <option>Ferramenta</option>
                        <option>Oferta</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prazo de Conclusão</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="Ex: 15 dias"
                        value={newPdca.completionDeadline}
                        onChange={(e) => setNewPdca({...newPdca, completionDeadline: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plano de Ação</label>
                    <textarea 
                      className="w-full p-2 border border-slate-200 rounded-lg h-24 focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="Quais ações serão tomadas?"
                      value={newPdca.actionPlan}
                      onChange={(e) => setNewPdca({...newPdca, actionPlan: e.target.value})}
                    ></textarea>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => document.getElementById('pdca-modal')?.classList.add('hidden')}
                      className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => { addPdca(); document.getElementById('pdca-modal')?.classList.add('hidden'); }}
                      className="flex-1 py-3 bg-purple-700 text-white rounded-lg font-bold hover:bg-purple-800 transition-colors shadow-lg"
                    >
                      Salvar Nova Ação
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Pendente', 'Em Curso', 'Concluído'].map((status) => (
                <div key={status} className="space-y-4">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest px-2">
                    <span className={`w-2 h-2 rounded-full ${status === 'Pendente' ? 'bg-slate-400' : status === 'Em Curso' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                    {status} ({pdcaEntries.filter(e => e.status === status).length})
                  </h4>
                  <div className="space-y-4">
                    {pdcaEntries.filter(e => e.status === status).map((entry) => (
                      <div key={entry.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded uppercase tracking-tighter">{entry.rootCause}</span>
                          <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 italic">{entry.completionDeadline}</span>
                        </div>
                        <h5 className="font-bold text-slate-900 mb-1 leading-tight">{entry.problem}</h5>
                        
                        <div className="my-3 py-2 border-y border-slate-50">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">Responsável</p>
                           <p className="text-xs font-semibold text-slate-700">{entry.responsibleName || 'Sem nome'} • <span className="text-slate-500 font-normal">{entry.responsibleRole}</span></p>
                        </div>

                        <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">Plano de Ação</p>
                           <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{entry.actionPlan}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'routine':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 h-fit shadow-sm">
              <h3 className="text-lg font-bold mb-4 text-slate-800 border-b pb-2">Registrar Atividade</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Tipo de Atividade</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'Ligações', icon: '📞' },
                      { id: 'Mensagens', icon: '💬' },
                      { id: 'E-mail', icon: '📧' },
                      { id: 'Follow Up', icon: '🔄' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setNewRoutine({ ...newRoutine, activityType: type.id as any })}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                          newRoutine.activityType === type.id 
                            ? 'bg-purple-700 border-purple-700 text-white shadow-md' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-purple-200'
                        }`}
                      >
                        <span>{type.icon}</span>
                        {type.id}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantidade</label>
                    <input 
                      type="number" 
                      min="1"
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                      value={newRoutine.quantity}
                      onChange={(e) => setNewRoutine({...newRoutine, quantity: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tempo (min)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                      value={newRoutine.timeSpent}
                      onChange={(e) => setNewRoutine({...newRoutine, timeSpent: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Função</label>
                  <select 
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    value={newRoutine.role}
                    onChange={(e) => setNewRoutine({...newRoutine, role: e.target.value})}
                  >
                    <option>SDR</option>
                    <option>BDR</option>
                    <option>Account Executive</option>
                  </select>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Checklist de Qualidade</label>
                  {[
                    { key: 'budgetValidated', label: 'Budget Validado?' },
                    { key: 'decisionMakerIdentified', label: 'Decisor Identificado?' },
                    { key: 'clearPain', label: 'Dor Clara?' },
                    { key: 'definedDeadline', label: 'Prazo Definido?' }
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-purple-50 rounded-lg transition-colors group">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-purple-700 rounded border-slate-300 focus:ring-purple-500"
                        checked={(newRoutine.qualityCheck as any)[item.key]}
                        onChange={(e) => setNewRoutine({
                          ...newRoutine, 
                          qualityCheck: { ...newRoutine.qualityCheck!, [item.key]: e.target.checked }
                        })}
                      />
                      <span className="text-sm text-slate-700 group-hover:text-purple-900 transition-colors">{item.label}</span>
                    </label>
                  ))}
                </div>

                <button 
                  onClick={addRoutine}
                  className="w-full py-4 bg-purple-900 text-white rounded-xl font-bold mt-4 hover:bg-purple-950 transition-colors shadow-lg active:scale-[0.98]"
                >
                  Salvar Registro
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Histórico de Atividades</h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full uppercase">{routines.length} registros hoje</span>
              </div>
              
              {routines.length === 0 ? (
                <div className="p-16 text-center bg-white rounded-xl border border-dashed border-slate-300">
                  <div className="text-4xl mb-4 grayscale opacity-50">📝</div>
                  <p className="text-slate-500 font-medium">Nenhuma atividade registrada hoje.</p>
                  <p className="text-slate-400 text-xs mt-1">O volume diário aparecerá aqui conforme o time preencher.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {routines.map((r) => (
                    <div key={r.id} className="bg-white p-5 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm hover:border-purple-200 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-transform group-hover:scale-110 ${
                          r.activityType === 'Ligações' ? 'bg-purple-100' : 
                          r.activityType === 'Mensagens' ? 'bg-emerald-100' : 
                          r.activityType === 'E-mail' ? 'bg-amber-100' : 'bg-rose-100'
                        }`}>
                          {r.activityType === 'Ligações' ? '📞' : 
                           r.activityType === 'Mensagens' ? '💬' : 
                           r.activityType === 'E-mail' ? '📧' : '🔄'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-slate-900">{r.quantity} {r.activityType}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-bold uppercase tracking-wider">{r.role}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 font-medium">Duração: {r.timeSpent} min • Às {new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5 p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        {Object.values(r.qualityCheck).map((checked, idx) => (
                          <div key={idx} className={`w-3 h-3 rounded-full shadow-inner ${checked ? 'bg-purple-600' : 'bg-slate-300'}`} title={['Budget', 'Authority', 'Need', 'Timeline'][idx]}></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <h2 className="text-xl font-bold text-slate-800">Selecione uma opção no menu lateral</h2>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-purple-200 selection:text-purple-900 overflow-x-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="ml-64 p-8 max-w-7xl mx-auto min-h-screen transition-all duration-300">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
            DNA FOR SMALL Online • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-sm">AB</div>
              <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-purple-700 shadow-sm">DNA</div>
            </div>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <button className="text-slate-400 hover:text-purple-600 transition-colors" title="Notificações">🔔</button>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {renderContent()}
        </div>
      </main>

      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={handleRefreshInsights}
          disabled={isAnalyzing}
          className={`bg-purple-800 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 hover:bg-purple-900 transition-all active:scale-95 group border border-white/20 ${isAnalyzing ? 'cursor-not-allowed opacity-80' : ''}`}
          title="Gerar Insights com IA"
        >
          <span className={`text-xl transition-transform ${isAnalyzing ? 'animate-spin' : 'group-hover:rotate-12'}`}>{isAnalyzing ? '⏳' : '✨'}</span>
        </button>
      </div>
    </div>
  );
};

export default App;
