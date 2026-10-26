/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Users,
  Database,
  LineChart,
  FileSpreadsheet,
} from 'lucide-react';

export type TabType =
  | 'visao_geral'
  | 'producao'
  | 'eficiencia'
  | 'paradas'
  | 'qualidade'
  | 'turnos'
  | 'banco_sqlite'
  | 'powerbi_studio'
  | 'analise_estatistica';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const mainNavItems = [
    { id: 'visao_geral' as TabType, label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'producao' as TabType, label: 'Produção', icon: BarChart3 },
    { id: 'eficiencia' as TabType, label: 'Eficiência', icon: TrendingUp },
    { id: 'paradas' as TabType, label: 'Paradas', icon: AlertCircle },
    { id: 'qualidade' as TabType, label: 'Qualidade', icon: CheckCircle2 },
    { id: 'turnos' as TabType, label: 'Turnos', icon: Users },
  ];

  const dataNavItems = [
    { id: 'banco_sqlite' as TabType, label: 'Banco SQLite & CRUD', icon: Database, badge: 'Editar' },
  ];

  const learningNavItems = [
    { id: 'powerbi_studio' as TabType, label: 'Power BI & Excel Hub', icon: FileSpreadsheet, badge: 'XLSX/SQL' },
    { id: 'analise_estatistica' as TabType, label: 'Análise Estratégica', icon: LineChart, badge: '5W2H' },
  ];

  return (
    <aside className="w-64 bg-[#0a1628] text-slate-300 flex flex-col justify-between shrink-0 min-h-screen select-none border-r border-slate-800/80 shadow-2xl relative z-20">
      <div>
        {/* Brand Header & Logo matching the image */}
        <div className="p-6 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-blue-900 to-slate-900 p-2 flex items-end justify-center gap-1 shadow-lg shadow-blue-950/60 border border-blue-500/20">
              <span className="w-1.5 h-3 bg-sky-400 rounded-sm"></span>
              <span className="w-1.5 h-6 bg-blue-500 rounded-sm"></span>
              <span className="w-1.5 h-4.5 bg-emerald-400 rounded-sm"></span>
            </div>
            <div>
              <div className="text-white font-bold tracking-tight text-base leading-tight">
                INDÚSTRIA 4.0
              </div>
              <div className="text-[11px] text-sky-400/80 font-medium tracking-wide">
                Gestão Operacional
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="p-4 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Navegação Principal
          </div>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Gestão Local & Banco SQLite */}
          <div className="pt-4 pb-1 px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase flex items-center justify-between">
            <span>Gestão Local (CRUD)</span>
            <span className="text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 px-1.5 py-0.2 rounded font-mono">
              SQLite
            </span>
          </div>
          {dataNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-emerald-400 group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? 'bg-blue-700 text-blue-100' : 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Education / Power BI & Excel section */}
          <div className="pt-4 pb-1 px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase flex items-center justify-between">
            <span>Academia de Dados</span>
            <span className="text-[9px] bg-blue-900/60 text-blue-300 border border-blue-700/50 px-1.5 py-0.2 rounded">
              Aprendizagem
            </span>
          </div>
          {learningNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-sky-400 group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Industrial Plant Silhouette matching bottom of image */}
      <div className="p-4 relative overflow-hidden border-t border-slate-800/60 bg-gradient-to-b from-[#0a1628] to-[#060e1a]">
        <div className="relative z-10">
          <p className="text-xs font-semibold text-slate-200 leading-snug">
            Dados que impulsionam
          </p>
          <p className="text-xs text-sky-400 font-medium">
            a indústria do amanhã.
          </p>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Planta Operando 100%</span>
          </div>
        </div>

        {/* Industrial Graphic Silhouette SVG */}
        <div className="mt-3 opacity-35 hover:opacity-55 transition-opacity">
          <svg viewBox="0 0 200 60" className="w-full h-12 text-sky-500 fill-current">
            <path d="M0,60 L0,38 L15,38 L15,22 L20,22 L20,38 L35,38 L35,14 L42,14 L42,38 L55,38 L55,28 L62,28 L62,38 L85,38 L85,18 L90,18 L90,38 L105,38 L105,8 L112,8 L112,38 L125,38 L125,25 L132,25 L132,38 L155,38 L155,16 L162,16 L162,38 L180,38 L180,26 L186,26 L186,38 L200,38 L200,60 Z" />
            <circle cx="42" cy="10" r="1.5" className="fill-emerald-400" />
            <circle cx="112" cy="5" r="1.5" className="fill-red-400" />
            <circle cx="162" cy="12" r="1.5" className="fill-sky-400" />
          </svg>
        </div>
      </div>
    </aside>
  );
};
