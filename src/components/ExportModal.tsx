/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Database,
  FileText,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import {
  downloadCompleteExcelWorkbook,
  downloadCsv,
  jsonToCsv,
  generateSqlScript,
} from '../utils/exportUtils';
import { sqliteManager } from '../services/sqliteService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'excel' | 'csv' | 'sql' | 'powerbi'>('excel');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleDownloadCsv = (type: 'producao' | 'paradas' | 'linhas') => {
    if (type === 'producao') {
      downloadCsv('fato_producao.csv', jsonToCsv(sqliteManager.productionRecords));
    } else if (type === 'paradas') {
      downloadCsv('fato_paradas.csv', jsonToCsv(sqliteManager.stoppageRecords));
    } else {
      downloadCsv('dim_linhas.csv', jsonToCsv(sqliteManager.linesRecords));
    }
  };

  const handleDownloadSql = () => {
    const sql = generateSqlScript();
    const blob = new Blob([sql], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'banco_dados_producao_industrial.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const daxCoreSnippets = `// ==========================================
// PACOTE DE MEDIDAS DAX ESSENCIAIS (POWER BI)
// ==========================================

// 1. Volume Total Produzido
[Volume Produzido] = SUM(fato_producao[producedUnits])

// 2. Meta de Produção
[Meta Volume] = SUM(fato_producao[plannedUnits])

// 3. Produtividade %
[Produtividade %] = 
DIVIDE(
    [Volume Produzido],
    [Meta Volume],
    0
)

// 4. Taxa de Perdas / Sucata %
[Taxa Perdas %] = 
DIVIDE(
    SUM(fato_producao[defectUnits]),
    [Volume Produzido],
    0
)

// 5. Disponibilidade % (OEE Componente 1)
[Disponibilidade %] = 
DIVIDE(
    SUM(fato_producao[operatingMinutes]),
    SUM(fato_producao[availableMinutes]),
    0
)

// 6. Eficiência Operacional %
[Eficiência %] = [Disponibilidade %]

// 7. OEE Geral %
[OEE %] = 
DIVIDE(
    [Volume Produzido] * 1.0,
    [Meta Volume] * (SUM(fato_producao[availableMinutes]) / 480.0),
    0
)

// 8. Quantidade de Paradas Não Programadas
[Qtd Paradas] = COUNTROWS(fato_paradas)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Central de Dados & Exportação para Power BI / Excel
              </h2>
              <p className="text-xs text-slate-500">
                Estrutura relacional normalizada pronta para desenvolvimento e aprendizagem
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 gap-2 bg-white">
          <button
            onClick={() => setActiveTab('excel')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'excel'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Planilha Excel (.xlsx)</span>
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'csv'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Tabelas CSV</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'sql'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-600" />
            <span>Script SQL (DDL + DML)</span>
          </button>
          <button
            onClick={() => setActiveTab('powerbi')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'powerbi'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Medidas DAX</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'excel' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">
                      Pasta de Trabalho do Excel (.XLSX) Multi-Abas
                    </h4>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                      Arquivo completo pronto para abrir no Excel ou importar diretamente no
                      Power BI Desktop via <i>Obter Dados &gt; Excel</i>. Inclui 6 tabelas
                      organizadas em Esquema Estrela (Star Schema) e um Dicionário de Fórmulas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <h5 className="text-xs font-bold text-slate-700 mb-2.5 uppercase tracking-wide">
                  Abas incluídas no arquivo:
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <span className="font-semibold text-slate-800 block">1. Fato_Producao</span>
                    <span className="text-[11px] text-slate-500">
                      30 dias de registros diários por linha, turno e produto.
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <span className="font-semibold text-slate-800 block">2. Fato_Paradas</span>
                    <span className="text-[11px] text-slate-500">
                      17 paradas detalhadas com causa-raiz e tempo.
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <span className="font-semibold text-slate-800 block">3. Dim_Linhas</span>
                    <span className="text-[11px] text-slate-500">
                      Metadados das Linhas A a E, capacidade e responsáveis.
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <span className="font-semibold text-slate-800 block">4. Dim_Turnos &amp; Produtos</span>
                    <span className="text-[11px] text-slate-500">
                      Horários, supervisores, tempos de ciclo e custos.
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <span className="font-semibold text-slate-800 block">5. Dim_Calendario</span>
                    <span className="text-[11px] text-slate-500">
                      Tabela dCalendario completa para Inteligência Temporal.
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <span className="font-semibold text-slate-800 block">6. Dicionario_Indicadores</span>
                    <span className="text-[11px] text-slate-500">
                      Fórmulas Excel e DAX de cada KPI do dashboard.
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={downloadCompleteExcelWorkbook}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Planilha Excel Completa (.xlsx)</span>
              </button>
            </div>
          )}

          {activeTab === 'csv' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Exporte as tabelas em formato <strong>CSV delimitado por ponto e vírgula (;)</strong>,
                ideal para importação limpa no Power Query do Power BI ou bibliotecas Python/R:
              </p>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">fato_producao.csv</h5>
                    <p className="text-[11px] text-slate-500">
                      Registros de produção diária, OEE e volumes (450+ linhas)
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadCsv('producao')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar CSV</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">fato_paradas.csv</h5>
                    <p className="text-[11px] text-slate-500">
                      17 ocorrências com motivo, duração e ações corretivas
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadCsv('paradas')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar CSV</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">dim_linhas.csv</h5>
                    <p className="text-[11px] text-slate-500">
                      Dimensão de linhas com capacidades e supervisores
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadCsv('linhas')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar CSV</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Script SQL Completo (PostgreSQL / MySQL / SQLite)
                  </h4>
                  <p className="text-xs text-slate-500">
                    DDL para criação de tabelas relacionais + DML com inserts e consultas analíticas
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(generateSqlScript(), 'sql')}
                    className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                  >
                    {copiedSnippet === 'sql' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar SQL</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => sqliteManager.downloadSqliteDatabase()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Baixar Banco SQLite (.db)</span>
                  </button>
                  <button
                    onClick={handleDownloadSql}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar .sql</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="bg-slate-900 text-slate-200 text-xs p-4 rounded-xl font-mono overflow-x-auto max-h-72 border border-slate-800">
                  {generateSqlScript()}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'powerbi' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Biblioteca de Medidas DAX Prontas
                  </h4>
                  <p className="text-xs text-slate-500">
                    Copie e cole na barra de fórmulas do Power BI Desktop
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(daxCoreSnippets, 'dax')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  {copiedSnippet === 'dax' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Todas as Medidas</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="bg-slate-900 text-amber-200 text-xs p-4 rounded-xl font-mono overflow-x-auto max-h-72 border border-slate-800 leading-relaxed">
                {daxCoreSnippets}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Padrão WCM (World Class Manufacturing) &amp; Lean Six Sigma</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
