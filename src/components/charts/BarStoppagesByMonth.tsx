/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MonthlyProductionStat } from '../../types/production';

interface BarStoppagesByMonthProps {
  data: MonthlyProductionStat[];
  selectedMonth?: string;
  onSelectMonth?: (monthFullName: string) => void;
}

export const BarStoppagesByMonth: React.FC<BarStoppagesByMonthProps> = ({
  data,
  selectedMonth,
  onSelectMonth,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = 40;
  const svgWidth = 420;
  const svgHeight = 220;
  const paddingLeft = 32;
  const paddingRight = 15;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const colWidth = chartWidth / data.length;
  const barWidth = colWidth * 0.58;

  const yTicks = [0, 10, 20, 30, 40];

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-baseline justify-between mb-0.5">
          <h3 className="text-sm font-bold text-slate-900">Paradas por Mês</h3>
        </div>
        <p className="text-[11px] text-slate-400 mb-2">nº de eventos</p>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Y Axis Grid lines */}
          {yTicks.map((val) => {
            const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 text-[9px] font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Green Vertical Bars */}
          {data.map((d, i) => {
            const x = paddingLeft + i * colWidth + (colWidth - barWidth) / 2;
            const barHeight = (d.stoppages / maxVal) * chartHeight;
            const y = paddingTop + chartHeight - barHeight;
            const isNov = d.month === 'Nov';
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={d.month}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelectMonth && onSelectMonth(d.monthFullName)}
              >
                {/* Bar Value text on top */}
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className={`text-[9px] font-mono font-bold ${
                    isNov ? 'fill-emerald-800' : 'fill-slate-600'
                  }`}
                >
                  {d.stoppages}
                </text>

                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="1.5"
                  fill={isNov ? '#15803d' : isHovered ? '#16a34a' : '#22c55e'}
                  className="transition-colors duration-150"
                />

                {/* Month label below */}
                <text
                  x={x + barWidth / 2}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  className={`text-[9px] font-medium ${
                    isNov ? 'fill-emerald-800 font-bold' : 'fill-slate-500'
                  }`}
                >
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 mt-1">
        <span>Média Anual: 19,8 eventos/mês</span>
        <span className="font-semibold text-emerald-600">Queda de 32% em Nov</span>
      </div>
    </div>
  );
};
