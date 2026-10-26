/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LineStat } from '../../types/production';

interface BarLossesByLineProps {
  data: LineStat[];
  onSelectLine?: (lineName: string) => void;
  selectedLine?: string;
}

export const BarLossesByLine: React.FC<BarLossesByLineProps> = ({
  data,
  onSelectLine,
  selectedLine,
}) => {
  // Sort lines by loss descending to match the image: Linha C (5,2%), Linha B (3,6%), Linha A (2,8%), Linha D (2,1%), Linha E (1,4%)
  const sortedData = [...data].sort((a, b) => b.losses - a.losses);
  const maxLoss = 6.0;

  // Blue gradient shades matching the image
  const barShades = ['#1d5eb8', '#2563eb', '#3b82f6', '#93c5fd', '#bfdbfe'];

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-baseline justify-between mb-0.5">
          <h3 className="text-sm font-bold text-slate-900">Perdas por Linha</h3>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">% sobre o volume produzido</p>
      </div>

      <div className="space-y-3.5 my-auto">
        {sortedData.map((item, idx) => {
          const widthPercent = (item.losses / maxLoss) * 100;
          const isSelected = selectedLine === item.name;

          return (
            <div
              key={item.lineId}
              onClick={() => onSelectLine && onSelectLine(item.name)}
              className={`group cursor-pointer rounded-lg p-1 transition-all ${
                isSelected ? 'bg-blue-50/80 ring-1 ring-blue-500/30' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
                  {item.name}
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {item.losses.toFixed(1).replace('.', ',')}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-sm h-4 overflow-hidden relative">
                <div
                  className="h-full rounded-sm transition-all duration-500"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: barShades[idx % barShades.length],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100">
        <span>Meta corporativa: &lt; 3,0%</span>
        <span className="font-semibold text-red-500">Linha C acima do limite</span>
      </div>
    </div>
  );
};
