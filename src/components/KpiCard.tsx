/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowUp, ArrowDown, HelpCircle, LucideIcon } from 'lucide-react';

export interface KpiCardProps {
  title: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  trendText: string;
  trendDirection: 'up' | 'down';
  trendIsPositive: boolean; // whether this trend direction is good for the plant
  comparisonText?: string;
  tooltipText: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  iconBgColor,
  iconColor,
  trendText,
  trendDirection,
  trendIsPositive,
  comparisonText = 'vs. período anterior',
  tooltipText,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow relative flex flex-col justify-between">
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBgColor} ${iconColor} shrink-0 shadow-2xs`}>
            <Icon className="w-4.5 h-4.5" />
          </div>
          <span className="text-xs font-semibold text-slate-700">{title}</span>
        </div>

        {/* Info Tooltip */}
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            aria-label={`Informações sobre ${title}`}
            className="text-slate-400 hover:text-slate-600 p-0.5 transition-colors focus:outline-none"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {showTooltip && (
            <div className="absolute right-0 top-6 w-56 p-2.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl z-50 pointer-events-none leading-relaxed border border-slate-700">
              <div className="font-semibold text-sky-300 mb-0.5">{title}</div>
              <div>{tooltipText}</div>
            </div>
          )}
        </div>
      </div>

      {/* Metric Value */}
      <div className="my-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl lg:text-[28px] font-extrabold tracking-tight text-slate-900 font-mono tabular-nums leading-none">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-medium text-slate-500">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Comparison Trend */}
      <div className="flex items-center gap-1.5 mt-2 text-xs">
        <div
          className={`flex items-center font-semibold font-mono tabular-nums ${
            trendIsPositive ? 'text-emerald-600' : 'text-red-500'
          }`}
        >
          {trendDirection === 'up' ? (
            <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
          )}
          <span>{trendText}</span>
        </div>
        <span className="text-[11px] text-slate-400 truncate">{comparisonText}</span>
      </div>
    </div>
  );
};
