/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, TabType } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewTab } from './components/tabs/OverviewTab';
import {
  ProductionDetailTab,
  EfficiencyOeeTab,
  StoppagesDetailTab,
  QualityDetailTab,
  ShiftsDetailTab,
} from './components/tabs/OperationalSubTabs';
import { PowerBiAcademyTab } from './components/tabs/PowerBiAcademyTab';
import { StatisticalAnalysisTab } from './components/tabs/StatisticalAnalysisTab';
import { DataManagementTab } from './components/tabs/DataManagementTab';
import { ExportModal } from './components/ExportModal';
import {
  monthlyHistoricalData,
  initialLinesData,
  stoppageReasonsData,
  initialShiftsData,
  initialProductsData,
  initialProductionStatusData,
} from './data/mockProductionData';
import { FilterState } from './types/production';
import { sqliteManager } from './services/sqliteService';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('visao_geral');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [dbVersion, setDbVersion] = useState(0);

  // Initialize SQLite database on load
  useEffect(() => {
    sqliteManager.init().then(() => {
      setDbVersion((v) => v + 1);
    });
  }, []);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    month: 'Novembro/2024',
    plant: 'Todas',
    line: 'Todas',
    shift: 'Todos',
  });

  // Calculate live aggregates from SQLite database
  const liveData = sqliteManager.getLiveDashboardAggregates(filters.line, filters.shift);

  // Handle clicking a specific month on chart
  const handleSelectMonth = (monthFullName: string) => {
    setFilters((prev) => ({
      ...prev,
      month: monthFullName,
    }));
  };

  // Handle clicking a specific line on charts/tables
  const handleSelectLine = (lineName: string) => {
    setFilters((prev) => ({
      ...prev,
      line: prev.line === lineName ? 'Todas' : lineName,
    }));
  };

  // Handle clicking a specific shift
  const handleSelectShift = (shiftName: string) => {
    setFilters((prev) => ({
      ...prev,
      shift: prev.shift === shiftName ? 'Todos' : shiftName,
    }));
  };

  const handleDataChanged = () => {
    setDbVersion((v) => v + 1);
  };

  return (
    <div className="flex h-screen w-full bg-[#f0f4f9] text-slate-800 overflow-hidden font-sans">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header with Filters and Actions */}
        <Header
          filters={filters}
          onFilterChange={setFilters}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenSqliteTab={() => setActiveTab('banco_sqlite')}
          lastUpdated="30/11/2024 14:32"
        />

        {/* Dynamic Tab Body with Smooth Scrolling */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-[1560px] mx-auto pb-10">
            {activeTab === 'visao_geral' && (
              <OverviewTab
                monthlyData={liveData.monthlyData}
                linesData={liveData.lineStats.length > 0 ? liveData.lineStats : initialLinesData}
                stoppageReasons={liveData.stoppageReasons.length > 0 ? liveData.stoppageReasons : stoppageReasonsData}
                shiftsData={liveData.shiftsData.length > 0 ? liveData.shiftsData : initialShiftsData}
                productsData={liveData.productsData}
                statusData={liveData.statusData}
                filters={filters}
                liveKpis={{
                  volume: liveData.totalVolume,
                  productivity: liveData.productivityPct,
                  oee: liveData.oeePct,
                  losses: liveData.lossesPct,
                  efficiency: liveData.efficiencyPct,
                  stoppages: liveData.totalStoppages,
                }}
                onSelectMonth={handleSelectMonth}
                onSelectLine={handleSelectLine}
                onSelectShift={handleSelectShift}
              />
            )}

            {activeTab === 'banco_sqlite' && (
              <DataManagementTab onDataChanged={handleDataChanged} />
            )}

            {activeTab === 'producao' && (
              <ProductionDetailTab linesData={liveData.lineStats.length > 0 ? liveData.lineStats : initialLinesData} />
            )}

            {activeTab === 'eficiencia' && (
              <EfficiencyOeeTab
                liveAvailability={liveData.efficiencyPct}
                livePerformance={liveData.productivityPct}
                liveQuality={100 - liveData.lossesPct}
              />
            )}

            {activeTab === 'paradas' && (
              <StoppagesDetailTab stoppagesData={sqliteManager.stoppageRecords} />
            )}

            {activeTab === 'qualidade' && (
              <QualityDetailTab productsData={liveData.productsData} />
            )}

            {activeTab === 'turnos' && (
              <ShiftsDetailTab shiftsData={liveData.shiftsData.length > 0 ? liveData.shiftsData : initialShiftsData} />
            )}

            {activeTab === 'powerbi_studio' && <PowerBiAcademyTab />}

            {activeTab === 'analise_estatistica' && (
              <StatisticalAnalysisTab
                liveCapabilityData={liveData.processCapabilityData}
                linesData={liveData.lineStats}
                stoppageReasons={liveData.stoppageReasons}
                totalVolume={liveData.totalVolume}
                totalStoppages={liveData.totalStoppages}
                oeePct={liveData.oeePct}
                efficiencyPct={liveData.efficiencyPct}
              />
            )}
          </div>
        </main>
      </div>

      {/* 3. Export Modal for Excel XLSX, CSV and SQL downloads */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
