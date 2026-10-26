/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Database,
  Plus,
  Edit2,
  Trash2,
  Play,
  RotateCcw,
  Download,
  Search,
  Filter,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Terminal,
  Factory,
  Layers,
  Wrench,
  Package,
} from 'lucide-react';
import { sqliteManager, SqlQueryResult } from '../../services/sqliteService';
import {
  GranularProductionRecord,
  GranularStoppageRecord,
} from '../../types/production';
import { downloadCompleteExcelWorkbook } from '../../utils/exportUtils';

interface DataManagementTabProps {
  onDataChanged: () => void;
}

export const DataManagementTab: React.FC<DataManagementTabProps> = ({ onDataChanged }) => {
  const [activeSubTab, setActiveSubTab] = useState<'producao' | 'paradas' | 'linhas' | 'produtos' | 'sql_terminal'>('producao');
  const [searchQuery, setSearchQuery] = useState('');
  const [lineFilter, setLineFilter] = useState('Todas');

  // SQL Terminal State
  const [sqlQuery, setSqlQuery] = useState<string>(
    'SELECT motivo, COUNT(*) AS qtd_eventos, SUM(duracao_minutos) AS tempo_total_minutos FROM fato_paradas GROUP BY motivo ORDER BY qtd_eventos DESC;'
  );
  const [queryResult, setQueryResult] = useState<SqlQueryResult | null>(null);
  const [queryExecutionTime, setQueryExecutionTime] = useState<number | null>(null);

  // Modals state
  const [prodModalOpen, setProdModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<GranularProductionRecord | null>(null);

  const [stoppageModalOpen, setStoppageModalOpen] = useState(false);
  const [editingStoppage, setEditingStoppage] = useState<GranularStoppageRecord | null>(null);

  const [lineModalOpen, setLineModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<any | null>(null);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Status message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Run SQL query in SQLite
  const handleRunSql = () => {
    const t0 = performance.now();
    const res = sqliteManager.executeSql(sqlQuery);
    const t1 = performance.now();
    setQueryResult(res);
    setQueryExecutionTime(Math.round((t1 - t0) * 100) / 100);
  };

  // Reset to initial database state
  const handleResetData = () => {
    if (confirm('Deseja realmente restaurar os dados originais de fábrica de Novembro/2024? Todas as alterações manuais serão resetadas.')) {
      sqliteManager.resetToDefaults();
      onDataChanged();
      showToast('Banco SQLite restaurado para os dados originais!');
    }
  };

  // Download SQLite .db/.sqlite file
  const handleDownloadDb = () => {
    sqliteManager.downloadSqliteDatabase();
    showToast('Download do banco SQLite iniciado!');
  };

  // -------------------------------------------------------------
  // CRUD ACTIONS: FATO PRODUÇÃO
  // -------------------------------------------------------------
  const handleDeleteProd = (id: string) => {
    if (confirm(`Excluir apontamento ${id}?`)) {
      sqliteManager.productionRecords = sqliteManager.productionRecords.filter((p) => p.id !== id);
      sqliteManager.saveToStorage();
      onDataChanged();
      showToast('Apontamento de produção excluído com sucesso!');
    }
  };

  const handleSaveProd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const planned = Number(formData.get('plannedUnits'));
    const produced = Number(formData.get('producedUnits'));
    const defect = Number(formData.get('defectUnits'));
    const availMin = Number(formData.get('availableMinutes'));
    const opMin = Number(formData.get('operatingMinutes'));
    const downMin = availMin - opMin;

    const oee = Math.round(((opMin / availMin) * (produced / planned) * ((produced - defect) / produced)) * 1000) / 10;
    const eff = Math.round((opMin / availMin) * 1000) / 10;
    const prodPct = Math.round((produced / planned) * 1000) / 10;

    if (editingProd) {
      // Edit
      const idx = sqliteManager.productionRecords.findIndex((p) => p.id === editingProd.id);
      if (idx !== -1) {
        sqliteManager.productionRecords[idx] = {
          ...editingProd,
          date: String(formData.get('date')),
          plant: String(formData.get('plant')),
          lineId: String(formData.get('lineId')),
          shift: String(formData.get('shift')),
          productId: String(formData.get('productId')),
          plannedUnits: planned,
          producedUnits: produced,
          defectUnits: defect,
          availableMinutes: availMin,
          operatingMinutes: opMin,
          downtimeMinutes: downMin,
          oeePercent: oee,
          productivityPercent: prodPct,
          efficiencyPercent: eff,
        };
      }
      showToast(`Apontamento ${editingProd.id} atualizado com sucesso!`);
    } else {
      // Create new
      const newId = `FATO-${Date.now().toString().slice(-5)}`;
      sqliteManager.productionRecords.unshift({
        id: newId,
        date: String(formData.get('date')),
        month: 'Novembro/2024',
        plant: String(formData.get('plant')),
        lineId: String(formData.get('lineId')),
        shift: String(formData.get('shift')),
        productId: String(formData.get('productId')),
        plannedUnits: planned,
        producedUnits: produced,
        defectUnits: defect,
        availableMinutes: availMin,
        operatingMinutes: opMin,
        downtimeMinutes: downMin,
        oeePercent: oee,
        productivityPercent: prodPct,
        efficiencyPercent: eff,
      });
      showToast(`Novo apontamento ${newId} cadastrado no banco SQLite!`);
    }

    sqliteManager.saveToStorage();
    onDataChanged();
    setProdModalOpen(false);
    setEditingProd(null);
  };

  // -------------------------------------------------------------
  // CRUD ACTIONS: FATO PARADAS
  // -------------------------------------------------------------
  const handleDeleteStoppage = (id: string) => {
    if (confirm(`Excluir registro de parada ${id}?`)) {
      sqliteManager.stoppageRecords = sqliteManager.stoppageRecords.filter((s) => s.id !== id);
      sqliteManager.saveToStorage();
      onDataChanged();
      showToast('Registro de parada excluído!');
    }
  };

  const handleSaveStoppage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const duration = Number(formData.get('durationMinutes'));

    if (editingStoppage) {
      const idx = sqliteManager.stoppageRecords.findIndex((s) => s.id === editingStoppage.id);
      if (idx !== -1) {
        sqliteManager.stoppageRecords[idx] = {
          ...editingStoppage,
          date: String(formData.get('date')),
          plant: String(formData.get('plant')),
          lineId: String(formData.get('lineId')),
          shift: String(formData.get('shift')),
          reason: formData.get('reason') as any,
          durationMinutes: duration,
          rootCause: String(formData.get('rootCause')),
          correctiveAction: String(formData.get('correctiveAction')),
          technician: String(formData.get('technician')),
        };
      }
      showToast(`Parada ${editingStoppage.id} atualizada com sucesso!`);
    } else {
      const newId = `PAR-${Date.now().toString().slice(-4)}`;
      sqliteManager.stoppageRecords.unshift({
        id: newId,
        date: String(formData.get('date')),
        month: 'Novembro/2024',
        plant: String(formData.get('plant')),
        lineId: String(formData.get('lineId')),
        shift: String(formData.get('shift')),
        reason: formData.get('reason') as any,
        durationMinutes: duration,
        rootCause: String(formData.get('rootCause')),
        correctiveAction: String(formData.get('correctiveAction')),
        technician: String(formData.get('technician')),
      });
      showToast(`Nova parada ${newId} registrada no SQLite!`);
    }

    sqliteManager.saveToStorage();
    onDataChanged();
    setStoppageModalOpen(false);
    setEditingStoppage(null);
  };

  // -------------------------------------------------------------
  // CRUD ACTIONS: DIMENSÃO LINHAS
  // -------------------------------------------------------------
  const handleDeleteLine = (id_linha: string) => {
    if (confirm(`Excluir linha industrial ${id_linha}?`)) {
      sqliteManager.linesRecords = sqliteManager.linesRecords.filter((l) => l.id_linha !== id_linha);
      sqliteManager.saveToStorage();
      onDataChanged();
      showToast('Linha industrial excluída!');
    }
  };

  const handleSaveLine = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const lineData = {
      id_linha: String(formData.get('id_linha')),
      nome: String(formData.get('nome')),
      capacidade_hora: Number(formData.get('capacidade_hora')),
      setor: String(formData.get('setor')),
      ano_instalacao: Number(formData.get('ano_instalacao')),
      responsavel: String(formData.get('responsavel')),
    };

    if (editingLine) {
      const idx = sqliteManager.linesRecords.findIndex((l) => l.id_linha === editingLine.id_linha);
      if (idx !== -1) {
        sqliteManager.linesRecords[idx] = lineData;
      }
      showToast(`Linha ${lineData.nome} atualizada!`);
    } else {
      sqliteManager.linesRecords.push(lineData);
      showToast(`Nova linha ${lineData.nome} cadastrada!`);
    }

    sqliteManager.saveToStorage();
    onDataChanged();
    setLineModalOpen(false);
    setEditingLine(null);
  };

  // -------------------------------------------------------------
  // CRUD ACTIONS: DIMENSÃO PRODUTOS
  // -------------------------------------------------------------
  const handleDeleteProduct = (id_produto: string) => {
    if (confirm(`Excluir produto ${id_produto}?`)) {
      sqliteManager.productsRecords = sqliteManager.productsRecords.filter((p) => p.id_produto !== id_produto);
      sqliteManager.saveToStorage();
      onDataChanged();
      showToast('Produto excluído!');
    }
  };

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const prodData = {
      id_produto: String(formData.get('id_produto')),
      nome_produto: String(formData.get('nome_produto')),
      familia: String(formData.get('familia')),
      ciclo_padrao_seg: Number(formData.get('ciclo_padrao_seg')),
      preco_unitario: Number(formData.get('preco_unitario')),
    };

    if (editingProduct) {
      const idx = sqliteManager.productsRecords.findIndex((p) => p.id_produto === editingProduct.id_produto);
      if (idx !== -1) {
        sqliteManager.productsRecords[idx] = prodData;
      }
      showToast(`Produto ${prodData.nome_produto} atualizado!`);
    } else {
      sqliteManager.productsRecords.push(prodData);
      showToast(`Novo produto ${prodData.nome_produto} cadastrado!`);
    }

    sqliteManager.saveToStorage();
    onDataChanged();
    setProductModalOpen(false);
    setEditingProduct(null);
  };

  // Filtered Production Records
  const filteredProduction = sqliteManager.productionRecords.filter((p) => {
    const matchesLine = lineFilter === 'Todas' || p.lineId === lineFilter;
    const matchesSearch =
      p.date.includes(searchQuery) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lineId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shift.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.productId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLine && matchesSearch;
  });

  // Filtered Stoppages Records
  const filteredStoppages = sqliteManager.stoppageRecords.filter((s) => {
    const matchesLine = lineFilter === 'Todas' || s.lineId === lineFilter;
    const matchesSearch =
      s.date.includes(searchQuery) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rootCause.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.technician.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLine && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-500/30 animate-in fade-in slide-in-from-top-3">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Gerenciador de Banco de Dados Local (SQLite)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                  SQLITE 3 ATIVO
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Adicione, edite ou exclua apontamentos de produção, paradas e cadastros industriais. O dashboard é recalculado em tempo real!
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadDb}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shadow-indigo-600/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Banco SQLite (.db)</span>
            </button>
            <button
              onClick={downloadCompleteExcelWorkbook}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shadow-emerald-600/20 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Excel (.xlsx)</span>
            </button>
            <button
              onClick={handleResetData}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              title="Restaurar valores de referência de Novembro/2024"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Resetar Dados</span>
            </button>
          </div>
        </div>

        {/* Database Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Fato Produção</span>
            <span className="text-base font-extrabold text-slate-800 font-mono">
              {sqliteManager.productionRecords.length}
            </span>
            <span className="text-[11px] text-slate-500 ml-1">apontamentos</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Fato Paradas</span>
            <span className="text-base font-extrabold text-red-600 font-mono">
              {sqliteManager.stoppageRecords.length}
            </span>
            <span className="text-[11px] text-slate-500 ml-1">eventos</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Dim Linhas</span>
            <span className="text-base font-extrabold text-blue-700 font-mono">
              {sqliteManager.linesRecords.length}
            </span>
            <span className="text-[11px] text-slate-500 ml-1">linhas fabris</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Dim Produtos</span>
            <span className="text-base font-extrabold text-emerald-700 font-mono">
              {sqliteManager.productsRecords.length}
            </span>
            <span className="text-[11px] text-slate-500 ml-1">SKUs</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 bg-white px-4 rounded-xl shadow-2xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('producao')}
          className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'producao'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Factory className="w-4 h-4" />
          <span>Apontamentos de Produção ({sqliteManager.productionRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('paradas')}
          className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'paradas'
              ? 'border-red-600 text-red-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4 text-red-500" />
          <span>Eventos de Parada ({sqliteManager.stoppageRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('linhas')}
          className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'linhas'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Linhas Industriais ({sqliteManager.linesRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('produtos')}
          className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'produtos'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4 text-emerald-600" />
          <span>Produtos &amp; SKUs ({sqliteManager.productsRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sql_terminal')}
          className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'sql_terminal'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4 text-indigo-600" />
          <span>Console SQL SQLite</span>
        </button>
      </div>

      {/* 1. ABA FATO PRODUÇÃO */}
      {activeSubTab === 'producao' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por ID, data, linha, produto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <select
                value={lineFilter}
                onChange={(e) => setLineFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Todas">Todas as Linhas</option>
                {sqliteManager.linesRecords.map((l) => (
                  <option key={l.id_linha} value={l.nome}>
                    {l.nome}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setEditingProd(null);
                setProdModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Apontamento de Produção</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Linha</th>
                  <th className="py-2.5 px-3">Turno</th>
                  <th className="py-2.5 px-3">Produto</th>
                  <th className="py-2.5 px-3 text-right">Planejado</th>
                  <th className="py-2.5 px-3 text-right">Produzido</th>
                  <th className="py-2.5 px-3 text-right">Refugo</th>
                  <th className="py-2.5 px-3 text-right">OEE</th>
                  <th className="py-2.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProduction.slice(0, 30).map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80">
                    <td className="py-2 px-3 font-mono text-blue-700 font-semibold">{row.id}</td>
                    <td className="py-2 px-3 text-slate-600 font-mono">{row.date}</td>
                    <td className="py-2 px-3 font-bold text-slate-800">{row.lineId}</td>
                    <td className="py-2 px-3 text-slate-600">{row.shift}</td>
                    <td className="py-2 px-3 text-slate-700">{row.productId}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-500">{row.plannedUnits}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{row.producedUnits}</td>
                    <td className="py-2 px-3 text-right font-mono text-red-600 font-medium">{row.defectUnits}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                      {row.oeePercent.toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProd(row);
                            setProdModalOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="Editar apontamento"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProd(row.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Excluir apontamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-[11px] text-slate-400 text-right">
            Exibindo os primeiros 30 de {filteredProduction.length} apontamentos registrados
          </div>
        </div>
      )}

      {/* 2. ABA FATO PARADAS */}
      {activeSubTab === 'paradas' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar parada por causa, técnico, linha..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setEditingStoppage(null);
                setStoppageModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nova Parada</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Linha</th>
                  <th className="py-2.5 px-3">Turno</th>
                  <th className="py-2.5 px-3">Motivo</th>
                  <th className="py-2.5 px-3 text-right">Duração (min)</th>
                  <th className="py-2.5 px-3">Causa-Raiz</th>
                  <th className="py-2.5 px-3">Técnico</th>
                  <th className="py-2.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStoppages.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80">
                    <td className="py-2 px-3 font-mono text-red-700 font-semibold">{row.id}</td>
                    <td className="py-2 px-3 text-slate-600 font-mono">{row.date}</td>
                    <td className="py-2 px-3 font-bold text-slate-800">{row.lineId}</td>
                    <td className="py-2 px-3 text-slate-600">{row.shift}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-800">
                        {row.reason}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-red-600">
                      {row.durationMinutes} min
                    </td>
                    <td className="py-2 px-3 text-slate-700 max-w-xs truncate" title={row.rootCause}>
                      {row.rootCause}
                    </td>
                    <td className="py-2 px-3 text-slate-600">{row.technician}</td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingStoppage(row);
                            setStoppageModalOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="Editar parada"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStoppage(row.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Excluir parada"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ABA DIMENSÃO LINHAS */}
      {activeSubTab === 'linhas' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Linhas de Produção Cadastradas no SQLite
            </h3>
            <button
              onClick={() => {
                setEditingLine(null);
                setLineModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Linha de Produção</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">ID Linha</th>
                  <th className="py-2.5 px-3">Nome da Linha</th>
                  <th className="py-2.5 px-3 text-right">Capacidade Nominal (un./h)</th>
                  <th className="py-2.5 px-3">Setor Fabril</th>
                  <th className="py-2.5 px-3 text-center">Ano Instalação</th>
                  <th className="py-2.5 px-3">Supervisor</th>
                  <th className="py-2.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sqliteManager.linesRecords.map((line) => (
                  <tr key={line.id_linha} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{line.id_linha}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{line.nome}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                      {line.capacidade_hora} un./h
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{line.setor}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">{line.ano_instalacao}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{line.responsavel}</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingLine(line);
                            setLineModalOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                          title="Editar linha"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLine(line.id_linha)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Excluir linha"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. ABA DIMENSÃO PRODUTOS */}
      {activeSubTab === 'produtos' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Catálogo de Produtos e Metas de Engenharia
            </h3>
            <button
              onClick={() => {
                setEditingProduct(null);
                setProductModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Produto (SKU)</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">Código SKU</th>
                  <th className="py-2.5 px-3">Nome do Produto</th>
                  <th className="py-2.5 px-3">Família</th>
                  <th className="py-2.5 px-3 text-right">Tempo de Ciclo Padrão (seg)</th>
                  <th className="py-2.5 px-3 text-right">Preço Unitário</th>
                  <th className="py-2.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sqliteManager.productsRecords.map((prod) => (
                  <tr key={prod.id_produto} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{prod.id_produto}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{prod.nome_produto}</td>
                    <td className="py-2.5 px-3 text-slate-600">{prod.familia}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                      {prod.ciclo_padrao_seg} s
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      R$ {prod.preco_unitario.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProduct(prod);
                            setProductModalOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                          title="Editar produto"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id_produto)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Excluir produto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ABA CONSOLE SQL SQLITE */}
      {activeSubTab === 'sql_terminal' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-600" />
              <span>Console Interativo SQLite (Terminal de Consultas)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Execute consultas SQL reais diretamente no banco de dados SQLite local.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="text-slate-400 font-semibold self-center">Consultas Prontas:</span>
              <button
                onClick={() =>
                  setSqlQuery(
                    'SELECT motivo, COUNT(*) AS total_paradas, SUM(duracao_minutos) AS minutos FROM fato_paradas GROUP BY motivo ORDER BY minutos DESC;'
                  )
                }
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-mono"
              >
                Pareto Paradas
              </button>
              <button
                onClick={() =>
                  setSqlQuery(
                    'SELECT id_linha, SUM(unidades_produzidas) AS total_produzido, ROUND(AVG(oee_percent), 1) AS oee_medio FROM fato_producao GROUP BY id_linha;'
                  )
                }
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-mono"
              >
                OEE por Linha
              </button>
              <button
                onClick={() =>
                  setSqlQuery('SELECT * FROM fato_producao ORDER BY unidades_refugo DESC LIMIT 10;')
                }
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-mono"
              >
                Top 10 Refugos
              </button>
            </div>

            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              rows={4}
              className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              placeholder="Digite sua query SQL (ex: SELECT * FROM fato_producao)..."
            />

            <div className="flex items-center justify-between">
              <button
                onClick={handleRunSql}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Executar Query SQL</span>
              </button>

              {queryExecutionTime !== null && (
                <span className="text-[11px] font-mono text-slate-400">
                  Tempo de execução: {queryExecutionTime} ms
                </span>
              )}
            </div>
          </div>

          {/* Results table */}
          {queryResult && (
            <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
              {queryResult.error ? (
                <div className="p-4 bg-red-50 text-red-700 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Erro SQL: {queryResult.error}</span>
                </div>
              ) : queryResult.values.length === 0 ? (
                <div className="p-4 bg-slate-50 text-slate-500 text-xs text-center">
                  Consulta executada com sucesso. Nenhum registro retornado.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-mono">
                        {queryResult.columns.map((col, i) => (
                          <th key={i} className="py-2 px-3 font-semibold">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {queryResult.values.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-slate-50">
                          {row.map((val, colIdx) => (
                            <td key={colIdx} className="py-2 px-3 text-slate-700 whitespace-nowrap">
                              {val !== null ? String(val) : 'NULL'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADICIONAR / EDITAR APONTAMENTO DE PRODUÇÃO */}
      {prodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingProd ? `Editar Apontamento: ${editingProd.id}` : 'Novo Apontamento de Produção'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Os valores serão gravados na tabela <code>fato_producao</code> do SQLite.
            </p>

            <form onSubmit={handleSaveProd} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Data</label>
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={editingProd?.date || '2024-11-20'}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Planta</label>
                  <select
                    name="plant"
                    defaultValue={editingProd?.plant || 'Planta Sul (Matriz)'}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  >
                    <option value="Planta Sul (Matriz)">Planta Sul (Matriz)</option>
                    <option value="Planta Norte">Planta Norte</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Linha</label>
                  <select
                    name="lineId"
                    defaultValue={editingProd?.lineId || 'Linha A'}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  >
                    {sqliteManager.linesRecords.map((l) => (
                      <option key={l.id_linha} value={l.nome}>
                        {l.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Turno</label>
                  <select
                    name="shift"
                    defaultValue={editingProd?.shift || '1º Turno'}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  >
                    <option value="1º Turno">1º Turno</option>
                    <option value="2º Turno">2º Turno</option>
                    <option value="3º Turno">3º Turno</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Produto</label>
                  <select
                    name="productId"
                    defaultValue={editingProd?.productId || 'Produto A'}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  >
                    <option value="Produto A">Produto A</option>
                    <option value="Produto B">Produto B</option>
                    <option value="Produto C">Produto C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Meta Planejada</label>
                  <input
                    type="number"
                    name="plannedUnits"
                    required
                    min="1"
                    defaultValue={editingProd?.plannedUnits || 500}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Produzido Real</label>
                  <input
                    type="number"
                    name="producedUnits"
                    required
                    min="0"
                    defaultValue={editingProd?.producedUnits || 475}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Refugo / Perda</label>
                  <input
                    type="number"
                    name="defectUnits"
                    required
                    min="0"
                    defaultValue={editingProd?.defectUnits || 12}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono text-red-600 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Minutos Disponíveis</label>
                  <input
                    type="number"
                    name="availableMinutes"
                    required
                    defaultValue={editingProd?.availableMinutes || 480}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Minutos Operando</label>
                  <input
                    type="number"
                    name="operatingMinutes"
                    required
                    defaultValue={editingProd?.operatingMinutes || 440}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setProdModalOpen(false);
                    setEditingProd(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Salvar no SQLite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR / EDITAR PARADA */}
      {stoppageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingStoppage ? `Editar Parada: ${editingStoppage.id}` : 'Registrar Nova Parada'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Os dados de paradas alimentam diretamente o cálculo de OEE e gráficos de Pareto.
            </p>

            <form onSubmit={handleSaveStoppage} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Data da Parada</label>
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={editingStoppage?.date || '2024-11-25'}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Planta</label>
                  <select
                    name="plant"
                    defaultValue={editingStoppage?.plant || 'Planta Sul (Matriz)'}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  >
                    <option value="Planta Sul (Matriz)">Planta Sul (Matriz)</option>
                    <option value="Planta Norte">Planta Norte</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Linha</label>
                  <select
                    name="lineId"
                    defaultValue={editingStoppage?.lineId || 'Linha C'}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  >
                    {sqliteManager.linesRecords.map((l) => (
                      <option key={l.id_linha} value={l.nome}>
                        {l.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Turno</label>
                  <select
                    name="shift"
                    defaultValue={editingStoppage?.shift || '1º Turno'}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  >
                    <option value="1º Turno">1º Turno</option>
                    <option value="2º Turno">2º Turno</option>
                    <option value="3º Turno">3º Turno</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Motivo</label>
                  <select
                    name="reason"
                    defaultValue={editingStoppage?.reason || 'Mecânica'}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="Mecânica">Mecânica</option>
                    <option value="Setup">Setup</option>
                    <option value="Falta de Material">Falta de Material</option>
                    <option value="Elétrica">Elétrica</option>
                    <option value="Qualidade">Qualidade</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Duração (minutos)</label>
                  <input
                    type="number"
                    name="durationMinutes"
                    required
                    min="1"
                    defaultValue={editingStoppage?.durationMinutes || 45}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono font-bold text-red-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Técnico Responsável</label>
                  <input
                    type="text"
                    name="technician"
                    required
                    defaultValue={editingStoppage?.technician || 'Rodrigo Paiva'}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Causa-Raiz (Diagnóstico)</label>
                <input
                  type="text"
                  name="rootCause"
                  required
                  defaultValue={editingStoppage?.rootCause || 'Falha prematura de correia transportadora'}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Ação Corretiva Realizada</label>
                <input
                  type="text"
                  name="correctiveAction"
                  required
                  defaultValue={editingStoppage?.correctiveAction || 'Troca de componente e teste de alinhamento'}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setStoppageModalOpen(false);
                    setEditingStoppage(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
                >
                  Salvar Parada no SQLite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR / EDITAR LINHA */}
      {lineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingLine ? `Editar: ${editingLine.nome}` : 'Cadastrar Nova Linha'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Cadastro na dimensão <code>dim_linhas</code> do banco.
            </p>

            <form onSubmit={handleSaveLine} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">ID Linha</label>
                  <input
                    type="text"
                    name="id_linha"
                    required
                    defaultValue={editingLine?.id_linha || `L-${String.fromCharCode(65 + sqliteManager.linesRecords.length)}`}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nome da Linha</label>
                  <input
                    type="text"
                    name="nome"
                    required
                    defaultValue={editingLine?.nome || `Linha ${String.fromCharCode(65 + sqliteManager.linesRecords.length)}`}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Capacidade (un./h)</label>
                  <input
                    type="number"
                    name="capacidade_hora"
                    required
                    min="10"
                    defaultValue={editingLine?.capacidade_hora || 200}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Ano Instalação</label>
                  <input
                    type="number"
                    name="ano_instalacao"
                    required
                    defaultValue={editingLine?.ano_instalacao || 2022}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Setor Fabril</label>
                <input
                  type="text"
                  name="setor"
                  required
                  defaultValue={editingLine?.setor || 'Envase e Fechamento'}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Supervisor Responsável</label>
                <input
                  type="text"
                  name="responsavel"
                  required
                  defaultValue={editingLine?.responsavel || 'Carlos Mendes'}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setLineModalOpen(false);
                    setEditingLine(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Salvar Linha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR / EDITAR PRODUTO */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingProduct ? `Editar: ${editingProduct.nome_produto}` : 'Cadastrar Novo Produto'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Cadastro na dimensão <code>dim_produtos</code>.
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Código SKU</label>
                  <input
                    type="text"
                    name="id_produto"
                    required
                    defaultValue={editingProduct?.id_produto || `PRD-D`}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Família</label>
                  <select
                    name="familia"
                    defaultValue={editingProduct?.familia || 'Standard'}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  >
                    <option value="Premium">Premium</option>
                    <option value="Standard">Standard</option>
                    <option value="Econômico">Econômico</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nome do Produto</label>
                <input
                  type="text"
                  name="nome_produto"
                  required
                  defaultValue={editingProduct?.nome_produto || 'Produto D (Linha Exportação)'}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Ciclo Padrão (seg)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="ciclo_padrao_seg"
                    required
                    defaultValue={editingProduct?.ciclo_padrao_seg || 12.5}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Preço Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="preco_unitario"
                    required
                    defaultValue={editingProduct?.preco_unitario || 35.0}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setProductModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
