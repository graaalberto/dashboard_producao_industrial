/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertOctagon,
  CheckCircle,
  Users,
  Search,
  Filter,
  Clock,
  Wrench,
  ShieldAlert,
} from 'lucide-react';
import {
  LineStat,
  ShiftStat,
  ProductStat,
  GranularStoppageRecord,
} from '../../types/production';
import { granularStoppagesNovember } from '../../data/mockProductionData';

// -------------------------------------------------------------
// 1. ABA DE PRODUÇÃO DETALHADA
// -------------------------------------------------------------
export const ProductionDetailTab: React.FC<{ linesData: LineStat[] }> = ({ linesData }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span>Monitoramento de Capacidade &amp; Velocidade de Linha</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Acompanhamento da taxa de produção horária nominal vs. produção real entregue
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {linesData.map((line) => {
            const adherence = Math.round((line.volume / line.targetVolume) * 100);
            return (
              <div key={line.lineId} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm">{line.name}</span>
                  <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                    adherence >= 95 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {adherence}% da Meta
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Produção Realizada:</span>
                    <span className="font-mono font-bold text-slate-900">{line.volume.toLocaleString('pt-BR')} un.</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Meta Programada:</span>
                    <span className="font-mono text-slate-700">{line.targetVolume.toLocaleString('pt-BR')} un.</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Supervisor:</span>
                    <span className="font-medium text-slate-800">{line.supervisor}</span>
                  </div>
                </div>

                <div className="mt-3 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${adherence >= 95 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(adherence, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. ABA DE EFICIÊNCIA & OEE (6 GRANDES PERDAS)
// -------------------------------------------------------------
interface EfficiencyOeeTabProps {
  liveAvailability?: number;
  livePerformance?: number;
  liveQuality?: number;
}

export const EfficiencyOeeTab: React.FC<EfficiencyOeeTabProps> = ({
  liveAvailability = 88.9,
  livePerformance = 91.4,
  liveQuality = 96.8,
}) => {
  const sixBigLosses = [
    { category: 'Disponibilidade', loss: '1. Quebras e Falhas de Equipamentos', impact: '280 min/mês', action: 'Manutenção Preditiva & TPM', status: 'Crítico' },
    { category: 'Disponibilidade', loss: '2. Setup e Ajustes de Linha', impact: '195 min/mês', action: 'SMED (Troca Rápida de Ferramentas)', status: 'Alto' },
    { category: 'Performance', loss: '3. Pequenas Paradas e Ociosidade (< 5 min)', impact: '45 min/mês', action: 'Automação de sensores e calhas', status: 'Médio' },
    { category: 'Performance', loss: '4. Velocidade Reduzida da Linha', impact: '3.200 un.', action: 'Balanceamento de postos operacionais', status: 'Médio' },
    { category: 'Qualidade', loss: '5. Refugo e Sucata na Inicialização', impact: '1.450 un.', action: 'Procedimento Padrão de Setup', status: 'Alto' },
    { category: 'Qualidade', loss: '6. Defeitos de Produção em Regime', impact: '2.660 un.', action: 'Poka-Yoke & Controle Estatístico', status: 'Crítico' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <span>Matriz TPM: As 6 Grandes Perdas do OEE</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Framework padrão da metodologia Total Productive Maintenance (TPM) e World Class Manufacturing (WCM)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-1">Pilar 1</span>
            <h4 className="text-sm font-bold text-blue-950">Disponibilidade: {liveAvailability.toFixed(1)}%</h4>
            <p className="text-xs text-blue-800 mt-1">Tempo real de funcionamento da máquina dividido pelo tempo total planejado.</p>
          </div>
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">Pilar 2</span>
            <h4 className="text-sm font-bold text-emerald-950">Performance: {livePerformance.toFixed(1)}%</h4>
            <p className="text-xs text-emerald-800 mt-1">Velocidade operacional real comparada com a velocidade de projeto nominal.</p>
          </div>
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">Pilar 3</span>
            <h4 className="text-sm font-bold text-indigo-950">Qualidade: {liveQuality.toFixed(1)}%</h4>
            <p className="text-xs text-indigo-800 mt-1">Percentual de unidades conformes sem necessidade de retrabalho ou refugo.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 font-semibold">
                <th className="py-2 px-3">Pilar OEE</th>
                <th className="py-2 px-3">Grande Perda</th>
                <th className="py-2 px-3">Impacto em Novembro</th>
                <th className="py-2 px-3">Contramedida Lean</th>
                <th className="py-2 px-3">Severidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sixBigLosses.map((loss, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{loss.category}</td>
                  <td className="py-2.5 px-3 text-slate-700">{loss.loss}</td>
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{loss.impact}</td>
                  <td className="py-2.5 px-3 text-blue-700 font-medium">{loss.action}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      loss.status === 'Crítico' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {loss.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. ABA DE PARADAS & PARETO
// -------------------------------------------------------------
interface StoppagesDetailTabProps {
  stoppagesData?: GranularStoppageRecord[];
}

export const StoppagesDetailTab: React.FC<StoppagesDetailTabProps> = ({ stoppagesData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReasonFilter, setSelectedReasonFilter] = useState('Todos');

  const records = stoppagesData || granularStoppagesNovember;

  const filtered = records.filter((st) => {
    const matchesReason = selectedReasonFilter === 'Todos' || st.reason === selectedReasonFilter;
    const matchesSearch =
      st.lineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.rootCause.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.technician.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesReason && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-red-600" />
              <span>Registro Detalhado das 17 Paradas Não Programadas (Novembro/2024)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Histórico com análise de causa-raiz (5 Porquês) e ação corretiva aplicada
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por linha, causa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <select
              value={selectedReasonFilter}
              onChange={(e) => setSelectedReasonFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Todos">Todos os Motivos</option>
              <option value="Mecânica">Mecânica</option>
              <option value="Setup">Setup</option>
              <option value="Falta de Material">Falta de Material</option>
              <option value="Elétrica">Elétrica</option>
              <option value="Qualidade">Qualidade</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 font-semibold">
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3">Linha</th>
                <th className="py-2.5 px-3">Turno</th>
                <th className="py-2.5 px-3">Motivo</th>
                <th className="py-2.5 px-3 text-right">Duração (min)</th>
                <th className="py-2.5 px-3">Causa-Raiz</th>
                <th className="py-2.5 px-3">Ação Corretiva</th>
                <th className="py-2.5 px-3">Técnico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">{item.id}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono">{item.date}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{item.lineId}</td>
                  <td className="py-2.5 px-3 text-slate-600">{item.shift}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-800">
                      {item.reason}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">
                    {item.durationMinutes} min
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate" title={item.rootCause}>
                    {item.rootCause}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate" title={item.correctiveAction}>
                    {item.correctiveAction}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{item.technician}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 4. ABA DE QUALIDADE
// -------------------------------------------------------------
export const QualityDetailTab: React.FC<{ productsData: ProductStat[] }> = ({ productsData }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>Qualidade &amp; First Pass Yield (FPY)</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Índice de conformidade na primeira passagem e custo de sucata gerada por produto
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {productsData.map((prod) => {
            const fpy = Math.round(((prod.volume - prod.scrapUnits) / prod.volume) * 1000) / 10;
            return (
              <div key={prod.product} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 text-sm">{prod.product}</h4>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    FPY: {fpy}%
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Volume Total:</span>
                    <span className="font-mono font-bold text-slate-900">{prod.volume.toLocaleString('pt-BR')} un.</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unidades Refugadas:</span>
                    <span className="font-mono text-red-600 font-bold">{prod.scrapUnits.toLocaleString('pt-BR')} un.</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de Perda:</span>
                    <span className="font-mono text-slate-700">{((prod.scrapUnits / prod.volume) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 5. ABA DE TURNOS
// -------------------------------------------------------------
export const ShiftsDetailTab: React.FC<{ shiftsData: ShiftStat[] }> = ({ shiftsData }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span>Benchmark e Desempenho Comparativo por Turno</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Análise de OEE, volume e transição de turnos para identificar oportunidades de nivelamento
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shiftsData.map((shift) => (
            <div key={shift.shift} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h4 className="font-bold text-slate-900 text-sm mb-3">{shift.shift}</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Volume Entregue:</span>
                  <span className="font-mono font-bold text-slate-900">{shift.volume.toLocaleString('pt-BR')} un.</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Eficiência Média:</span>
                  <span className="font-mono font-bold text-blue-700">{shift.efficiency.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>OEE do Turno:</span>
                  <span className="font-mono font-bold text-emerald-700">{shift.oee.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Participação na Fábrica:</span>
                  <span className="font-mono text-slate-800">{shift.percentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
