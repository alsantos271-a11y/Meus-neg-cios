
import { GoogleGenAI, Type } from "@google/genai";
import { FunnelData, PDCAEntry, RoutineEntry } from "../types";

// Inicializa o SDK apenas uma vez se possível, mas garante que não quebre se o process.env estiver instável
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export async function generateExecutiveInsights(
  funnel: FunnelData,
  pdca: PDCAEntry[],
  routines: RoutineEntry[],
  totalActivities: number
) {
  if (!process.env.API_KEY) {
    console.warn("API Key ausente.");
    return [{ type: 'alert', title: 'Configuração Necessária', content: 'A chave de API do Gemini não foi detectada.' }];
  }

  const ai = getAI();

  const prompt = `
    Como um Consultor Comercial Sênior, analise os seguintes dados de uma operação de vendas e forneça 3 a 4 insights estratégicos em português (Brasil). 
    
    DADOS DO FUNIL MATEMÁTICO:
    - Atividades Realizadas (Total): ${totalActivities}
    - Leads Gerados (MQL): ${funnel.leadsGeneratedMQL}
    - Leads Qualificados por Vendas (SQL): ${funnel.leadsQualifiedSQL}
    - Oportunidades (OPPS): ${funnel.opportunitiesOPPS}
    - Vendas Fechadas: ${funnel.closedSales}
    - Ticket Médio: R$ ${funnel.avgTicket}
    - Meta de Receita: R$ ${funnel.revenueGoal}
    
    TAXAS DE CONVERSÃO CALCULADAS:
    - Atividade > MQL: ${totalActivities > 0 ? ((funnel.leadsGeneratedMQL / totalActivities) * 100).toFixed(1) : 0}%
    - MQL > SQL: ${funnel.leadsGeneratedMQL > 0 ? ((funnel.leadsQualifiedSQL / funnel.leadsGeneratedMQL) * 100).toFixed(1) : 0}%
    - SQL > OPPS: ${funnel.leadsQualifiedSQL > 0 ? ((funnel.opportunitiesOPPS / funnel.leadsQualifiedSQL) * 100).toFixed(1) : 0}%
    - OPPS > Venda: ${funnel.opportunitiesOPPS > 0 ? ((funnel.closedSales / funnel.opportunitiesOPPS) * 100).toFixed(1) : 0}%
    
    AÇÕES PDCA ATIVAS:
    ${pdca.length > 0 ? pdca.map(p => `- [Problema: ${p.problem}] -> [Ação: ${p.actionPlan}] -> [Prazo: ${p.completionDeadline}]`).join('\n') : "Nenhuma ação ativa."}
    
    A análise deve ser executiva, direta e orientada à ação. Identifique o gargalo principal e sugira onde o gestor deve focar o esforço do time para bater a meta de R$ ${funnel.revenueGoal}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: 'alert, success, or suggestion' },
              title: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ['type', 'title', 'content']
          }
        }
      }
    });

    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Erro ao gerar insights:", error);
    return [
      {
        type: 'alert',
        title: 'Análise Indisponível',
        content: 'Não foi possível gerar insights automáticos no momento devido a um erro na conexão com a IA.'
      }
    ];
  }
}
