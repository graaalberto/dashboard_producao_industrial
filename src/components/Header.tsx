/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Download, RefreshCw, Database } from 'lucide-react';
import { FilterState } from '../types/production';
import { filterOptions } from '../data/mockProductionData';

interface HeaderProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onOpenExportModal: () => void;
  onOpenSqliteTab?: () => void;
  lastUpdated?: string;
}

export const Header: React.FC<HeaderProps> = ({
  filters,
  onFilterChange,
  onOpenExportModal,
  onOpenSqliteTab,
  lastUpdated = '30/11/2024 14:32',
}) => {
  const handleSelect = (key: keyof FilterState, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const isFiltered =
    filters.month !== 'Novembro/2024' ||
    filters.plant !== 'Todas' ||
    filters.line !== 'Todas' ||
    filters.shift !== 'Todos';

  const resetFilters = () => {
    onFilterChange({
      month: 'Novembro/2024',
      plant: 'Todas',
      line: 'Todas',
      shift: 'Todos',
    });
  };

  return (
    <header className="bg-white border-b border-slate-200/90 px-6 py-4 shadow-xs sticky top-0 z-30">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Subtitle matching the image */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Dashboard de Produção Industrial
            </h1>
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                title="Restaurar visão original de Novembro/2024"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Resetar Filtros</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visão integrada de produtividade, eficiência e performance operacional
          </p>
        </div>

        {/* Filters and Metadata aligned to the right, exactly as in image */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mês Filter */}
          <div className="flex flex-col">
            <label className="text-[11px] font-semibold text-slate-600 mb-0.5">Mês</label>
            <select
              value={filters.month}
              onChange={(e) => handleSelect('month', e.target.value)}
              className="text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors shadow-2xs cursor-pointer min-w-[125px]"
            >
              {filterOptions.months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Planta Filter */}
          <div className="flex flex-col">
            <label className="text-[11px] font-semibold text-slate-600 mb-0.5">Planta</label>
            <select
              value={filters.plant}
              onChange={(e) => handleSelect('plant', e.target.value)}
              className="text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors shadow-2xs cursor-pointer min-w-[90px]"
            >
              {filterOptions.plants.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Linha Filter */}
          <div className="flex flex-col">
            <label className="text-[11px] font-semibold text-slate-600 mb-0.5">Linha</label>
            <select
              value={filters.line}
              onChange={(e) => handleSelect('line', e.target.value)}
              className="text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors shadow-2xs cursor-pointer min-w-[85px]"
            >
              {filterOptions.lines.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Turno Filter */}
          <div className="flex flex-col">
            <label className="text-[11px] font-semibold text-slate-600 mb-0.5">Turno</label>
            <select
              value={filters.shift}
              onChange={(e) => handleSelect('shift', e.target.value)}
              className="text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors shadow-2xs cursor-pointer min-w-[85px]"
            >
              {filterOptions.shifts.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Última atualização Box matching image */}
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/90 rounded-lg px-3 py-1.5 text-slate-700 shadow-2xs mt-auto">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <div className="text-[11px] leading-tight">
              <span className="text-slate-400 block text-[10px]">Última atualização</span>
              <span className="font-mono font-semibold text-slate-800">{lastUpdated}</span>
            </div>
          </div>

          {/* Quick SQLite CRUD Button */}
          {onOpenSqliteTab && (
            <button
              onClick={onOpenSqliteTab}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-2xs mt-auto cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Editar Dados (SQLite)</span>
            </button>
          )}

          {/* Quick Export Button */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm shadow-blue-600/20 mt-auto cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar Dados (XLSX/SQL)</span>
            <span className="sm:hidden">Exportar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
