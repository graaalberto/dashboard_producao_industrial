/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MonthlyProductionStat } from '../../types/production';

interface ComboVolumeOeeProps {
  data: MonthlyProductionStat[];
  selectedMonth?: string;
  onSelectMonth?: (monthFullName: string) => void;
}

export const ComboVolumeOee: React.FC<ComboVolumeOeeProps> = ({
  data,
  selectedMonth,
  onSelectMonth,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVolume = 160000;
  const maxOee = 100;

  // Chart dimensions in SVG coordinates
  const svgWidth = 560;
  const svgHeight = 220;
  const paddingLeft = 55;
  const paddingRight = 45;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const numPoints = data.length;
  const colWidth = chartWidth / numPoints;
  const barWidth = colWidth * 0.52;

  // Calculate coordinates for OEE line
  const points = data.map((d, i) => {
    const x = paddingLeft + i * colWidth + colWidth / 2;
    const y = paddingTop + chartHeight - (d.oee / maxOee) * chartHeight;
    return { x, y, ...d };
  });

  const linePath = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  // Volume Y Axis steps: 0 to 160.000 in steps of 20.000
  const yTicks = [0, 20000, 40000, 60000, 80000, 100000, 120000, 140000, 160000];

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
      {/* Chart Title and Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <h3 className="text-sm font-bold text-slate-900">
          Evolução de Volume Produzido e OEE
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#1d64c8]"></span>
            <span className="text-slate-600 font-medium">Volume Produzido (un.)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#16a34a] relative flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]"></span>
            </span>
            <span className="text-slate-600 font-medium">OEE (%)</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none font-sans"
        >
          {/* Grid lines */}
          {yTicks.map((val) => {
            const y = paddingTop + chartHeight - (val / maxVolume) * chartHeight;
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
                {/* Left Y-axis label (Volume) */}
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 text-[9px] font-mono"
                >
                  {val === 0 ? '0' : `${val.toLocaleString('pt-BR')}`}
                </text>
                {/* Right Y-axis label (OEE %) */}
                <text
                  x={svgWidth - paddingRight + 8}
                  y={y + 3}
                  textAnchor="start"
                  className="fill-slate-400 text-[9px] font-mono"
                >
                  {Math.round((val / maxVolume) * 100)}%
                </text>
              </g>
            );
          })}

          {/* Vertical axis titles */}
          <text
            x={12}
            y={paddingTop + chartHeight / 2}
            transform={`rotate(-90, 12, ${paddingTop + chartHeight / 2})`}
            textAnchor="middle"
            className="fill-slate-400 text-[8px] font-medium tracking-wide"
          >
            Volume Produzido
          </text>
          <text
            x={svgWidth - 6}
            y={paddingTop + chartHeight / 2}
            transform={`rotate(90, ${svgWidth - 6}, ${paddingTop + chartHeight / 2})`}
            textAnchor="middle"
            className="fill-slate-400 text-[8px] font-medium tracking-wide"
          >
            OEE (%)
          </text>

          {/* Volume Bars */}
          {data.map((d, i) => {
            const x = paddingLeft + i * colWidth + (colWidth - barWidth) / 2;
            const barHeight = (d.volume / maxVolume) * chartHeight;
            const y = paddingTop + chartHeight - barHeight;
            const isNov = d.month === 'Nov';
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={d.month}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelectMonth && onSelectMonth(d.monthFullName)}
              >
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="1.5"
                  fill={isNov ? '#1d5eb8' : isHovered ? '#2563eb' : '#3374cc'}
                  className="transition-colors duration-150"
                />
                {/* Month label on X Axis */}
                <text
                  x={paddingLeft + i * colWidth + colWidth / 2}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  className={`text-[10px] font-medium ${
                    isNov ? 'fill-blue-700 font-bold' : 'fill-slate-500'
                  }`}
                >
                  {d.month}
                </text>
              </g>
            );
          })}

          {/* OEE Trend Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#16a34a"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* OEE Points / Circles */}
          {points.map((pt, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <g key={`pt-${pt.month}`}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 4.5 : 3.2}
                  fill="#ffffff"
                  stroke="#16a34a"
                  strokeWidth="2"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => onSelectMonth && onSelectMonth(pt.monthFullName)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIdx !== null && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 text-white px-3 py-2 rounded-lg text-xs shadow-xl border border-slate-700"
            style={{
              left: `${Math.min(
                Math.max(paddingLeft + hoveredIdx * colWidth - 20, 10),
                svgWidth - 140
              )}px`,
              top: '15px',
            }}
          >
            <div className="font-bold text-sky-300 border-b border-slate-700 pb-1 mb-1">
              {data[hoveredIdx].monthFullName}
            </div>
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span className="text-slate-300">Volume:</span>
              <span className="font-mono font-bold text-white">
                {data[hoveredIdx].volume.toLocaleString('pt-BR')} un.
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span className="text-slate-300">OEE:</span>
              <span className="font-mono font-bold text-emerald-400">
                {data[hoveredIdx].oee.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
