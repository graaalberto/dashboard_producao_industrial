/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShiftStat, ProductStat, ProductionStatusStat } from '../../types/production';

interface OperationalProfileDonutsProps {
  shiftsData: ShiftStat[];
  productsData: ProductStat[];
  statusData: ProductionStatusStat[];
}

export const OperationalProfileDonuts: React.FC<OperationalProfileDonutsProps> = ({
  shiftsData,
  productsData,
  statusData,
}) => {
  // Helper to render mini donut chart with percentages and legend
  const renderMiniDonut = (
    title: string,
    items: { label: string; percentage: number; color: string }[],
    radius = 36,
    strokeWidth = 14
  ) => {
    const circumference = 2 * Math.PI * radius;
    let accumulated = 0;

    const slices = items.map((item) => {
      const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((accumulated / 100) * circumference);
      accumulated += item.percentage;
      return {
        ...item,
        strokeDasharray,
        strokeDashoffset,
      };
    });

    return (
      <div className="flex flex-col items-center flex-1 min-w-[170px] p-2">
        <h4 className="text-xs font-semibold text-slate-800 mb-2">{title}</h4>
        <div className="flex items-center gap-3 w-full justify-center">
          {/* SVG Donut */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 90 90" className="w-full h-full -rotate-90">
              <circle
                cx="45"
                cy="45"
                r={radius}
                fill="transparent"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
              />
              {slices.map((slice) => (
                <circle
                  key={slice.label}
                  cx="45"
                  cy="45"
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  className="transition-all duration-300"
                />
              ))}
            </svg>

            {/* In-donut callout text showing primary percentage */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-mono font-bold text-slate-800">
                {items[0].percentage}%
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1 text-[11px]">
            {items.map((it) => (
              <div key={it.label} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: it.color }}
                />
                <span className="text-slate-600 truncate max-w-[80px]">{it.label}</span>
                <span className="font-mono text-slate-800 font-semibold ml-auto">
                  {it.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 1. Shift Donut Items from live shiftsData
  const shiftColors = ['#0f3a6d', '#2563eb', '#7dd3fc'];
  const shiftItems = shiftsData.length > 0
    ? shiftsData.map((s, idx) => ({
        label: s.shift,
        percentage: s.percentage,
        color: shiftColors[idx % shiftColors.length],
      }))
    : [
        { label: '1º Turno', percentage: 35, color: '#0f3a6d' },
        { label: '2º Turno', percentage: 33, color: '#2563eb' },
        { label: '3º Turno', percentage: 32, color: '#7dd3fc' },
      ];

  // 2. Product Donut Items from live productsData
  const prodColors = ['#0f3a6d', '#3b82f6', '#93c5fd', '#38bdf8'];
  const productItems = productsData.length > 0
    ? productsData.map((p, idx) => ({
        label: p.product,
        percentage: p.percentage,
        color: prodColors[idx % prodColors.length],
      }))
    : [
        { label: 'Produto A', percentage: 52, color: '#0f3a6d' },
        { label: 'Produto B', percentage: 28, color: '#3b82f6' },
        { label: 'Produto C', percentage: 20, color: '#93c5fd' },
      ];

  // 3. Status Donut Items from live statusData
  const statusItems = statusData.length > 0
    ? statusData.map((st) => ({
        label: st.status,
        percentage: st.percentage,
        color: st.color,
      }))
    : [
        { label: 'Em Produção', percentage: 88, color: '#16a34a' },
        { label: 'Em Setup', percentage: 9, color: '#38bdf8' },
        { label: 'Parada', percentage: 3, color: '#94a3b8' },
      ];

  const inProduction = statusItems.find((s) => s.label === 'Em Produção') || statusItems[0];

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
      <h3 className="text-sm font-bold text-slate-900 mb-1">Perfil Operacional</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 my-auto">
        {renderMiniDonut('Produção por Turno', shiftItems)}
        {renderMiniDonut('Tipo de Produto', productItems)}
        {renderMiniDonut('Status da Produção', statusItems)}
      </div>

      <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100 mt-1">
        <span>Equilíbrio Operacional: Estável</span>
        <span className="font-semibold text-emerald-600">
          {inProduction.percentage}% {inProduction.label}
        </span>
      </div>
    </div>
  );
};
