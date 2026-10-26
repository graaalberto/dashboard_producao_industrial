/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LineStat } from '../../types/production';

interface BarProductionByLineProps {
  data: LineStat[];
  onSelectLine?: (lineName: string) => void;
  selectedLine?: string;
}

export const BarProductionByLine: React.FC<BarProductionByLineProps> = ({
  data,
  onSelectLine,
  selectedLine,
}) => {
  const maxVolume = 50000;

  // Blue tones matching the image
  const barColors = ['#1d5eb8', '#2563eb', '#60a5fa', '#93c5fd', '#bfdbfe'];

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-baseline justify-between mb-0.5">
          <h3 className="text-sm font-bold text-slate-900">Produção por Linha</h3>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">unidades</p>
      </div>

      <div className="space-y-3.5 my-auto">
        {data.map((item, idx) => {
          const percentage = Math.min((item.volume / maxVolume) * 100, 100);
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
                  {item.volume.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-sm h-4 overflow-hidden relative">
                <div
                  className="h-full rounded-sm transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: barColors[idx % barColors.length],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 text-[10px] text-slate-400 text-right font-mono">
        Total: {data.reduce((sum, d) => sum + d.volume, 0).toLocaleString('pt-BR')} un.
      </div>
    </div>
  );
};
