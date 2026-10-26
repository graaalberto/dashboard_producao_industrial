/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShiftStat } from '../../types/production';

interface BarProductionByShiftProps {
  data: ShiftStat[];
  onSelectShift?: (shiftName: string) => void;
  selectedShift?: string;
}

export const BarProductionByShift: React.FC<BarProductionByShiftProps> = ({
  data,
  onSelectShift,
  selectedShift,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = 50000;
  const svgWidth = 280;
  const svgHeight = 180;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 22;
  const paddingBottom = 28;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const colWidth = chartWidth / data.length;
  const barWidth = colWidth * 0.52;

  const yTicks = [0, 10000, 20000, 30000, 40000, 50000];

  // Distinct blues for the 3 shifts
  const shiftColors = ['#1d5eb8', '#3b82f6', '#93c5fd'];

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-baseline justify-between mb-0.5">
          <h3 className="text-sm font-bold text-slate-900">Produção por Turno</h3>
        </div>
        <p className="text-[11px] text-slate-400 mb-2">unidades</p>
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
                  className="fill-slate-400 text-[8px] font-mono"
                >
                  {val === 0 ? '0' : `${val.toLocaleString('pt-BR')}`}
                </text>
              </g>
            );
          })}

          {/* 3 Vertical Bars */}
          {data.map((d, i) => {
            const x = paddingLeft + i * colWidth + (colWidth - barWidth) / 2;
            const barHeight = (d.volume / maxVal) * chartHeight;
            const y = paddingTop + chartHeight - barHeight;
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={d.shift}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelectShift && onSelectShift(d.shift)}
              >
                {/* Value on top of bar */}
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="fill-slate-700 text-[9px] font-mono font-bold"
                >
                  {d.volume.toLocaleString('pt-BR')}
                </text>

                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="1.5"
                  fill={shiftColors[i % shiftColors.length]}
                  opacity={isHovered ? 0.9 : 1}
                  className="transition-all duration-150"
                />

                {/* Shift label below */}
                <text
                  x={x + barWidth / 2}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  className="fill-slate-600 text-[9px] font-medium"
                >
                  {d.shift}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100">
        <span>Distribuição equilibrada</span>
        <span className="font-semibold text-slate-600">Turno 1 lidera (+5%)</span>
      </div>
    </div>
  );
};
