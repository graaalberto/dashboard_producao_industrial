/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LineStat } from '../../types/production';

interface TableLowEfficiencyProps {
  data: LineStat[];
  onSelectLine?: (lineName: string) => void;
  selectedLine?: string;
}

export const TableLowEfficiency: React.FC<TableLowEfficiencyProps> = ({
  data,
  onSelectLine,
  selectedLine,
}) => {
  // Sort lines by efficiency ascending (lowest efficiency first)
  const rankedRows = [...data]
    .sort((a, b) => a.efficiency - b.efficiency)
    .map((item, index) => ({
      rank: index + 1,
      name: item.name,
      efficiency: item.efficiency,
      oee: item.oee,
      losses: item.losses,
    }));

  const worstLine = rankedRows[0];

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-2">
          Linhas com Menor Eficiência
        </h3>
      </div>

      <div className="overflow-x-auto my-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
              <th className="py-1.5 px-2 text-center w-8">#</th>
              <th className="py-1.5 px-2">Linha</th>
              <th className="py-1.5 px-2 text-right">Eficiência</th>
              <th className="py-1.5 px-2 text-right">OEE</th>
              <th className="py-1.5 px-2 text-right">Perdas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            {rankedRows.map((row) => {
              const isSelected = selectedLine === row.name;
              return (
                <tr
                  key={row.rank}
                  onClick={() => onSelectLine && onSelectLine(row.name)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/90 font-medium' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <td className="py-2 px-2 text-center font-mono text-slate-400 text-[11px]">
                    {row.rank}
                  </td>
                  <td className="py-2 px-2 font-semibold text-slate-700">
                    {row.name}
                  </td>
                  <td className="py-2 px-2 text-right font-mono tabular-nums">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] ${
                        row.efficiency < 80
                          ? 'bg-amber-50 text-amber-700 font-semibold'
                          : 'text-slate-700'
                      }`}
                    >
                      {row.efficiency.toFixed(1).replace('.', ',')}%
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right font-mono tabular-nums">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] ${
                        row.oee < 75
                          ? 'bg-red-50 text-red-700 font-semibold'
                          : 'text-slate-700'
                      }`}
                    >
                      {row.oee.toFixed(1).replace('.', ',')}%
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right font-mono tabular-nums">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] ${
                        row.losses > 4.0
                          ? 'bg-red-100 text-red-800 font-bold'
                          : 'text-slate-600'
                      }`}
                    >
                      {row.losses.toFixed(1).replace('.', ',')}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100">
        <span>Gargalo de Manutenção: {worstLine ? worstLine.name : 'N/A'}</span>
        <span className="font-semibold text-amber-600">Prioridade 1</span>
      </div>
    </div>
  );
};
