/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoppageReasonStat } from '../../types/production';

interface DonutStoppageReasonsProps {
  data: StoppageReasonStat[];
  totalEvents?: number;
}

export const DonutStoppageReasons: React.FC<DonutStoppageReasonsProps> = ({
  data,
  totalEvents = 17,
}) => {
  const [hoveredReason, setHoveredReason] = useState<string | null>(null);

  const radius = 55;
  const innerRadius = 38;
  const circumference = 2 * Math.PI * radius;

  // Compute SVG stroke-dasharray and stroke-dashoffset for each slice
  let accumulatedPercent = 0;
  const slices = data.map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += item.percentage;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
      <h3 className="text-sm font-bold text-slate-900 mb-2">
        Distribuição de Paradas por Motivo
      </h3>

      <div className="flex items-center justify-between gap-4 my-auto">
        {/* Donut graphic */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
            {/* Background track */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth="24"
            />
            {/* Slices */}
            {slices.map((slice) => {
              const isHovered = hoveredReason === slice.reason;
              return (
                <circle
                  key={slice.reason}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isHovered ? 28 : 24}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredReason(slice.reason)}
                  onMouseLeave={() => setHoveredReason(null)}
                />
              );
            })}
          </svg>

          {/* Center Info Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums leading-none">
              {totalEvents}
            </span>
            <span className="text-[11px] font-medium text-slate-500 mt-0.5">
              eventos
            </span>
          </div>
        </div>

        {/* Legend list matching image */}
        <div className="flex-1 space-y-1.5 min-w-[130px]">
          {data.map((item) => {
            const isHovered = hoveredReason === item.reason;
            return (
              <div
                key={item.reason}
                onMouseEnter={() => setHoveredReason(item.reason)}
                onMouseLeave={() => setHoveredReason(null)}
                className={`flex items-center justify-between text-xs py-0.5 px-1.5 rounded transition-colors cursor-pointer ${
                  isHovered ? 'bg-slate-100 font-semibold' : ''
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-700 truncate">{item.reason}</span>
                </div>
                <span className="font-mono text-slate-800 font-medium ml-2">
                  {item.percentage.toFixed(1).replace('.', ',')}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
        <span>Gargalo: Mecânica + Setup</span>
        <span className="font-semibold text-slate-600">58,8% dos eventos</span>
      </div>
    </div>
  );
};
