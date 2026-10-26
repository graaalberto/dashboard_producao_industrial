/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BarChart2,
  Settings,
  AlertTriangle,
  Gauge,
  Box,
  Timer,
} from 'lucide-react';
import { KpiCard } from '../KpiCard';
import { ComboVolumeOee } from '../charts/ComboVolumeOee';
import { BarProductionByLine } from '../charts/BarProductionByLine';
import { BarStoppagesByMonth } from '../charts/BarStoppagesByMonth';
import { DonutStoppageReasons } from '../charts/DonutStoppageReasons';
import { BarLossesByLine } from '../charts/BarLossesByLine';
import { TableLowEfficiency } from '../charts/TableLowEfficiency';
import { BarProductionByShift } from '../charts/BarProductionByShift';
import { OperationalProfileDonuts } from '../charts/OperationalProfileDonuts';
import {
  MonthlyProductionStat,
  LineStat,
  StoppageReasonStat,
  ShiftStat,
  ProductStat,
  ProductionStatusStat,
  FilterState,
} from '../../types/production';

interface OverviewTabProps {
  monthlyData: MonthlyProductionStat[];
  linesData: LineStat[];
  stoppageReasons: StoppageReasonStat[];
  shiftsData: ShiftStat[];
  productsData: ProductStat[];
  statusData: ProductionStatusStat[];
  filters: FilterState;
  liveKpis?: {
    volume: number;
    productivity: number;
    oee: number;
    losses: number;
    efficiency: number;
    stoppages: number;
  };
  onSelectMonth?: (month: string) => void;
  onSelectLine?: (line: string) => void;
  onSelectShift?: (shift: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  monthlyData,
  linesData,
  stoppageReasons,
  shiftsData,
  productsData,
  statusData,
  filters,
  liveKpis,
  onSelectMonth,
  onSelectLine,
  onSelectShift,
}) => {
  // If user filtered by a specific line, adjust the headline KPI values responsively
  const isLineFiltered = filters.line !== 'Todas';
  const selectedLineData = linesData.find((l) => l.name === filters.line);

  // Dynamic or standard values matching live SQLite calculations or image
  const productivityVal = isLineFiltered && selectedLineData
    ? `${(selectedLineData.efficiency * 1.04).toFixed(1).replace('.', ',')}%`
    : liveKpis
    ? `${liveKpis.productivity.toFixed(1).replace('.', ',')}%`
    : '92,4%';

  const oeeVal = isLineFiltered && selectedLineData
    ? `${selectedLineData.oee.toFixed(1).replace('.', ',')}%`
    : liveKpis
    ? `${liveKpis.oee.toFixed(1).replace('.', ',')}%`
    : '78,6%';

  const perdasVal = isLineFiltered && selectedLineData
    ? `${selectedLineData.losses.toFixed(1).replace('.', ',')}%`
    : liveKpis
    ? `${liveKpis.losses.toFixed(1).replace('.', ',')}%`
    : '3,2%';

  const eficienciaVal = isLineFiltered && selectedLineData
    ? `${selectedLineData.efficiency.toFixed(1).replace('.', ',')}%`
    : liveKpis
    ? `${liveKpis.efficiency.toFixed(1).replace('.', ',')}%`
    : '88,9%';

  const volumeVal = isLineFiltered && selectedLineData
    ? selectedLineData.volume.toLocaleString('pt-BR')
    : liveKpis
    ? liveKpis.volume.toLocaleString('pt-BR')
    : '128.450';

  const paradasVal = isLineFiltered && selectedLineData
    ? `${selectedLineData.stoppages}`
    : liveKpis
    ? `${liveKpis.stoppages}`
    : '17';

  return (
    <div className="space-y-4">
      {/* 1. TOP ROW: 6 KPI CARDS (Exact match to image) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* KPI 1: Produtividade */}
        <KpiCard
          title="Produtividade"
          value={productivityVal}
          icon={BarChart2}
          iconBgColor="bg-blue-600"
          iconColor="text-white"
          trendText="+2,1 p.p."
          trendDirection="up"
          trendIsPositive={true}
          tooltipText="Percentual entre volume realizado e volume programado no plano mestre de produção."
        />

        {/* KPI 2: OEE */}
        <KpiCard
          title="OEE"
          value={oeeVal}
          icon={Settings}
          iconBgColor="bg-emerald-600"
          iconColor="text-white"
          trendText="+3,4 p.p."
          trendDirection="up"
          trendIsPositive={true}
          tooltipText="Overall Equipment Effectiveness: indicador global de eficiência (Disponibilidade × Performance × Qualidade)."
        />

        {/* KPI 3: Perdas */}
        <KpiCard
          title="Perdas"
          value={perdasVal}
          icon={AlertTriangle}
          iconBgColor="bg-red-500"
          iconColor="text-white"
          trendText="+0,6 p.p."
          trendDirection="up"
          trendIsPositive={false}
          tooltipText="Taxa de refugo e sucata gerada no processo sobre o total produzido."
        />

        {/* KPI 4: Eficiência */}
        <KpiCard
          title="Eficiência"
          value={eficienciaVal}
          icon={Gauge}
          iconBgColor="bg-teal-600"
          iconColor="text-white"
          trendText="+2,8 p.p."
          trendDirection="up"
          trendIsPositive={true}
          tooltipText="Aproveitamento do tempo efetivamente disponível para operação das máquinas."
        />

        {/* KPI 5: Volume Produzido */}
        <KpiCard
          title="Volume Produzido"
          value={volumeVal}
          unit="unidades"
          icon={Box}
          iconBgColor="bg-sky-600"
          iconColor="text-white"
          trendText="+12,5%"
          trendDirection="up"
          trendIsPositive={true}
          tooltipText="Total de unidades finalizadas e aprovadas no controle de qualidade."
        />

        {/* KPI 6: Paradas */}
        <KpiCard
          title="Paradas"
          value={paradasVal}
          unit="eventos"
          icon={Timer}
          iconBgColor="bg-[#0f2d59]"
          iconColor="text-white"
          trendText="-32,0%"
          trendDirection="down"
          trendIsPositive={true}
          tooltipText="Número de ocorrências de parada não programada nas linhas fabris."
        />
      </div>

      {/* 2. SECOND ROW: 3 CHARTS (Evolução Volume/OEE, Produção por Linha, Paradas por Mês) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Combo Chart (5 cols on lg/xl) */}
        <div className="lg:col-span-5 flex">
          <div className="w-full">
            <ComboVolumeOee
              data={monthlyData}
              selectedMonth={filters.month}
              onSelectMonth={onSelectMonth}
            />
          </div>
        </div>

        {/* Produção por Linha (4 cols on lg/xl) */}
        <div className="lg:col-span-4 flex">
          <div className="w-full">
            <BarProductionByLine
              data={linesData}
              selectedLine={filters.line}
              onSelectLine={onSelectLine}
            />
          </div>
        </div>

        {/* Paradas por Mês (3 cols on lg/xl) */}
        <div className="lg:col-span-3 flex">
          <div className="w-full">
            <BarStoppagesByMonth
              data={monthlyData}
              selectedMonth={filters.month}
              onSelectMonth={onSelectMonth}
            />
          </div>
        </div>
      </div>

      {/* 3. THIRD ROW: 3 CARTS (Distribuição Paradas, Perdas por Linha, Linhas Menor Eficiência) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Distribuição de Paradas por Motivo (4 cols) */}
        <div className="lg:col-span-4 flex">
          <div className="w-full">
            <DonutStoppageReasons data={stoppageReasons} />
          </div>
        </div>

        {/* Perdas por Linha (4 cols) */}
        <div className="lg:col-span-4 flex">
          <div className="w-full">
            <BarLossesByLine
              data={linesData}
              selectedLine={filters.line}
              onSelectLine={onSelectLine}
            />
          </div>
        </div>

        {/* Linhas com Menor Eficiência (4 cols) */}
        <div className="lg:col-span-4 flex">
          <div className="w-full">
            <TableLowEfficiency
              data={linesData}
              selectedLine={filters.line}
              onSelectLine={onSelectLine}
            />
          </div>
        </div>
      </div>

      {/* 4. FOURTH ROW: 2 SECTIONS (Produção por Turno, Perfil Operacional) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Produção por Turno (4 cols) */}
        <div className="lg:col-span-4 flex">
          <div className="w-full">
            <BarProductionByShift
              data={shiftsData}
              selectedShift={filters.shift}
              onSelectShift={onSelectShift}
            />
          </div>
        </div>

        {/* Perfil Operacional (8 cols) */}
        <div className="lg:col-span-8 flex">
          <div className="w-full">
            <OperationalProfileDonuts
              shiftsData={shiftsData}
              productsData={productsData}
              statusData={statusData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
