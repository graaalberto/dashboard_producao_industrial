/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  Calculator,
  Compass,
  FileCheck,
} from 'lucide-react';
import { LineStat, StoppageReasonStat } from '../../types/production';
import { sqliteManager } from '../../services/sqliteService';

interface StatisticalAnalysisTabProps {
  liveCapabilityData?: {
    line: string;
    meanVolume: number;
    stdDev: number;
    cp: number;
    cpk: number;
    status: string;
    color: string;
  }[];
  linesData?: LineStat[];
  stoppageReasons?: StoppageReasonStat[];
  totalVolume?: number;
  totalStoppages?: number;
  oeePct?: number;
  efficiencyPct?: number;
}

export const StatisticalAnalysisTab: React.FC<StatisticalAnalysisTabProps> = ({
  liveCapabilityData,
  linesData,
  stoppageReasons,
  totalVolume = 128450,
  totalStoppages = 17,
  oeePct = 78.6,
  efficiencyPct = 88.9,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'diagnostico' | 'capacidade' | '5w2h'>('diagnostico');

  // Compute live process capability data or fallback to defaults
  const processCapabilityData = liveCapabilityData && liveCapabilityData.length > 0
    ? liveCapabilityData
    : [
        { line: 'Linha A', meanVolume: 1411, stdDev: 48, cp: 1.42, cpk: 1.34, status: 'Capaz (Processo Estável)', color: 'text-emerald-700 bg-emerald-50' },
        { line: 'Linha B', meanVolume: 1209, stdDev: 62, cp: 1.25, cpk: 1.18, status: 'Marginalmente Capaz', color: 'text-blue-700 bg-blue-50' },
        { line: 'Linha C', meanVolume: 948, stdDev: 115, cp: 0.82, cpk: 0.69, status: 'Incapaz (Alta Variabilidade)', color: 'text-red-700 bg-red-50' },
        { line: 'Linha D', meanVolume: 522, stdDev: 34, cp: 1.38, cpk: 1.29, status: 'Capaz', color: 'text-emerald-700 bg-emerald-50' },
        { line: 'Linha E', meanVolume: 190, stdDev: 12, cp: 1.76, cpk: 1.68, status: 'Altamente Capaz (Classe Mundial)', color: 'text-emerald-800 bg-emerald-100' },
      ];

  // Dynamic ranking from lines
  const sortedByLosses = linesData ? [...linesData].sort((a, b) => b.losses - a.losses) : [];
  const sortedByVolume = linesData ? [...linesData].sort((a, b) => b.volume - a.volume) : [];
  const worstLine = sortedByLosses[0] || { name: 'Linha C', losses: 5.2, oee: 65.1 };
  const topLine = sortedByVolume[0] || { name: 'Linha A', volume: 42350 };
  const secondLine = sortedByVolume[1] || { name: 'Linha B', volume: 36280 };

  const reasons = stoppageReasons && stoppageReasons.length >= 2 ? stoppageReasons : [
    { reason: 'Mecânica', percentage: 35.3 },
    { reason: 'Setup', percentage: 23.5 },
  ];
  const top2ParetoPct = (reasons[0].percentage + reasons[1].percentage).toFixed(1);

  // Dynamic MTBF & MTTR calculation from live records
  const totalStopsCount = totalStoppages > 0 ? totalStoppages : 1;
  const totalOpHours = Math.round((sqliteManager.productionRecords.reduce((a, b) => a + b.operatingMinutes, 0) / 60));
  const totalDownMin = sqliteManager.stoppageRecords.reduce((a, b) => a + b.durationMinutes, 0);

  const mtbfHours = Math.round((totalOpHours / totalStopsCount) * 10) / 10 || 42.3;
  const mttrMinutes = Math.round((totalDownMin / totalStopsCount) * 10) / 10 || 38.5;

  const actionPlan5W2H = [
    {
      id: 1,
      what: 'Implementação de Metodologia SMED (Troca Rápida de Ferramentas)',
      why: 'O Setup representa 23,5% do total de paradas na Linha C (50 min por evento)',
      where: 'Linha C - Setor de Rotulagem & Encadernação',
      when: '01/12/2024 a 15/01/2025',
      who: 'Marcos Souza (Supervisor) & Equipe Kaizen',
      how: 'Gabaritagem externa, pré-ajuste de guias e carrinhos de setup dedicados',
      howMuch: 'R$ 18.500 (Gabaritos rápidos)',
      roi: 'Ganho estimado de R$ 94.000/ano em tempo produtivo',
      priority: 'Alta',
    },
    {
      id: 2,
      what: 'Reforma Preventiva e Alinhamento a Laser dos Rolamentos',
      why: 'Falhas mecânicas lideram os eventos (35,3%), com 280 minutos de parada no mês',
      where: 'Linhas B e C',
      when: '10/12/2024 (Parada técnica programada)',
      who: 'Rodrigo Paiva (Manutenção Mecânica)',
      how: 'Termografia e análise de vibração preditiva antes da quebra funcional',
      howMuch: 'R$ 12.000 (Sensores de vibração IoT)',
      roi: 'Redução de 45% nos chamados de corretiva mecânica',
      priority: 'Crítica',
    },
    {
      id: 3,
      what: 'Controle Estatístico de Processo (CEP) na Entrada de Embalagens',
      why: 'Falta de material e rótulos com código ilegível causaram 17,6% das paradas',
      where: 'Recebimento & Almoxarifado Central',
      when: 'Imediato (em andamento)',
      who: 'Mariana Duarte (Garantia da Qualidade)',
      how: 'Inspeção por amostragem AQL nos fornecedores homologados',
      howMuch: 'R$ 5.000 (Treinamento e gabaritos ópticos)',
      roi: 'Eliminação do refugo gerado por insumos defeituosos',
      priority: 'Média',
    },
    {
      id: 4,
      what: 'Padronização Operacional e Treinamento do 3º Turno',
      why: 'O 3º turno apresenta OEE 77,2% vs 80,4% do 1º turno e maior índice de paradas',
      where: 'Todas as linhas industriais',
      when: '05/01/2025 a 30/01/2025',
      who: 'Danilo Ramos (Supervisor 3º Turno)',
      how: 'Checklists digitais na troca de turno e procedimento operacional padrão (POP)',
      howMuch: 'R$ 8.000 (Capacitação e tablets industriais)',
      roi: 'Aumento de 2,2% no volume entregue na madrugada',
      priority: 'Alta',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 gap-3">
        <button
          onClick={() => setActiveSubTab('diagnostico')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeSubTab === 'diagnostico'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BrainCircuit className="w-4 h-4 text-blue-600" />
          <span>Diagnóstico Executivo de Novembro/2024</span>
        </button>
        <button
          onClick={() => setActiveSubTab('capacidade')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeSubTab === 'capacidade'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4 text-indigo-600" />
          <span>Capacidade do Processo (Cp &amp; Cpk)</span>
        </button>
        <button
          onClick={() => setActiveSubTab('5w2h')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeSubTab === '5w2h'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Compass className="w-4 h-4 text-emerald-600" />
          <span>Plano de Ação Estratégico 5W2H</span>
        </button>
      </div>

      {/* 1. DIAGNÓSTICO ESTRATÉGICO */}
      {activeSubTab === 'diagnostico' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                Ponto Forte
              </span>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                Volume Total Atingiu {totalVolume.toLocaleString('pt-BR')} un.
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Superação com destaque para a <strong>{topLine.name} ({topLine.volume.toLocaleString('pt-BR')} un.)</strong> e{' '}
                <strong>{secondLine.name} ({secondLine.volume.toLocaleString('pt-BR')} un.)</strong>.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block mb-1">
                Gargalo Crítico
              </span>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                {worstLine.name} com Perdas de {worstLine.losses}% e OEE de {worstLine.oee}%
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                A {worstLine.name} opera com o maior índice de refugo e menor disponibilidade no banco de dados.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                Oportunidade de Otimização
              </span>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                Regra 80/20 das Paradas (Pareto)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Os dois maiores motivos — <strong>{reasons[0].reason} ({reasons[0].percentage}%)</strong> e <strong>{reasons[1].reason} ({reasons[1].percentage}%)</strong> —
                somam <strong>{top2ParetoPct}% de todos os eventos</strong>.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800">
            <h4 className="text-sm font-bold text-sky-400 mb-2 flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              <span>Conclusão Estratégica para Diretoria Industrial</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Os dados consolidados no SQLite apontam estabilidade nas linhas principais com OEE geral de {oeePct.toFixed(1)}%.
              O foco prioritário deve ser a padronização de setup e manutenção autônoma (TPM) na {worstLine.name}.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-3 border-t border-slate-800 text-slate-400">
              <span>MTBF Médio: {mtbfHours} horas</span>
              <span>•</span>
              <span>MTTR Médio: {mttrMinutes} minutos</span>
              <span>•</span>
              <span>Disponibilidade Global: {efficiencyPct.toFixed(1)}%</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">OEE Atual: {oeePct.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. CAPACIDADE DO PROCESSO */}
      {activeSubTab === 'capacidade' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Índices de Capacidade do Processo (Cp &amp; Cpk) por Linha de Produção
            </h4>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              O <strong>Cp</strong> mede a dispersão potencial do processo em relação aos limites de especificação
              (LEP - LIE / 6σ). O <strong>Cpk</strong> considera o alinhamento da média com o valor nominal.
              Processos com Cpk &ge; 1,33 são considerados estatisticamente capazes.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                    <th className="py-2.5 px-3">Linha</th>
                    <th className="py-2.5 px-3 text-right">Média Diária (un.)</th>
                    <th className="py-2.5 px-3 text-right">Desvio Padrão (&sigma;)</th>
                    <th className="py-2.5 px-3 text-right">Índice Cp</th>
                    <th className="py-2.5 px-3 text-right">Índice Cpk</th>
                    <th className="py-2.5 px-3">Classificação Estatística</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processCapabilityData.map((row) => (
                    <tr key={row.line} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-bold text-slate-800">{row.line}</td>
                      <td className="py-3 px-3 text-right font-mono">{row.meanVolume.toLocaleString('pt-BR')}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">{row.stdDev}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{row.cp.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{row.cpk.toFixed(2)}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${row.color}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. PLANO DE AÇÃO 5W2H */}
      {activeSubTab === '5w2h' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Matriz 5W2H de Tomada de Decisão Estratégica
                </h4>
                <p className="text-xs text-slate-500">
                  Ações prioritárias para elevar o OEE da fábrica de 78,6% para 83,5% em 60 dias
                </p>
              </div>
              <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md font-semibold">
                ROI Total Estimado: R$ 280.000 / ano
              </span>
            </div>

            <div className="space-y-3">
              {actionPlan5W2H.map((plan) => (
                <div
                  key={plan.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                        {plan.id}
                      </span>
                      <h5 className="text-xs font-bold text-slate-900">{plan.what}</h5>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        plan.priority === 'Crítica'
                          ? 'bg-red-100 text-red-800'
                          : plan.priority === 'Alta'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      Prioridade {plan.priority}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs text-slate-700 mt-3 pt-3 border-t border-slate-200/80">
                    <div>
                      <span className="font-semibold text-slate-500 block text-[10px]">POR QUE (WHY):</span>
                      <span>{plan.why}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block text-[10px]">ONDE (WHERE):</span>
                      <span>{plan.where}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block text-[10px]">QUANDO (WHEN):</span>
                      <span>{plan.when}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block text-[10px]">QUEM (WHO):</span>
                      <span>{plan.who}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block text-[10px]">COMO (HOW):</span>
                      <span>{plan.how}</span>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <span className="font-semibold text-emerald-800 block text-[10px]">RETORNO (ROI):</span>
                      <span className="text-emerald-900 font-bold">{plan.roi}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
