/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Database,
  Layers,
  BookOpen,
  Copy,
  Check,
  Download,
  ArrowRight,
  ExternalLink,
  Code2,
  Table,
} from 'lucide-react';
import {
  downloadCompleteExcelWorkbook,
  generateSqlScript,
  downloadCsv,
  jsonToCsv,
} from '../../utils/exportUtils';
import {
  generateGranularProductionRecords,
  granularStoppagesNovember,
  dimensionTables,
} from '../../data/mockProductionData';

export const PowerBiAcademyTab: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedSchemaTable, setSelectedSchemaTable] = useState<string>('fato_producao');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const daxFormulas = [
    {
      name: 'Volume Produzido Total',
      dax: `Volume Produzido = 
SUM(fato_producao[unidades_produzidas])`,
      explanation:
        'Soma simples do volume entregue. Ponto de partida para todos os cálculos de capacidade e produtividade.',
      category: 'Volume & Entrega',
    },
    {
      name: 'Produtividade %',
      dax: `Produtividade % = 
DIVIDE(
    [Volume Produzido],
    SUM(fato_producao[unidades_planejadas]),
    0
)`,
      explanation:
        'Utiliza a função DIVIDE para evitar erros de divisão por zero (#DIV/0!). Mede a aderência ao plano mestre de produção.',
      category: 'Performance',
    },
    {
      name: 'Taxa de Perdas % (Scrap Rate)',
      dax: `Taxa Perdas % = 
DIVIDE(
    SUM(fato_producao[unidades_refugo]),
    [Volume Produzido] + SUM(fato_producao[unidades_refugo]),
    0
)`,
      explanation:
        'Calcula a proporção de refugo sobre a produção total bruta (boas + ruins). Fundamental para o indicador de Qualidade do OEE.',
      category: 'Qualidade',
    },
    {
      name: 'OEE Geral % (Overall Equipment Effectiveness)',
      dax: `// Medida OEE = Disponibilidade × Performance × Qualidade
OEE % = 
VAR _Disponibilidade = 
    DIVIDE(
        SUM(fato_producao[minutos_operando]),
        SUM(fato_producao[minutos_disponiveis]),
        0
    )
VAR _Performance = 
    DIVIDE(
        [Volume Produzido],
        SUM(fato_producao[unidades_planejadas]),
        0
    )
VAR _Qualidade = 
    DIVIDE(
        [Volume Produzido],
        [Volume Produzido] + SUM(fato_producao[unidades_refugo]),
        0
    )
RETURN
    _Disponibilidade * _Performance * _Qualidade`,
      explanation:
        'Calcula as 3 variáveis essenciais do WCM usando variáveis (VAR...RETURN) para máxima performance de cálculo na engine VertiPaq.',
      category: 'OEE Avançado',
    },
    {
      name: 'Crescimento de Volume MoM (Mês contra Mês)',
      dax: `Volume MoM % = 
VAR _VolumeAtual = [Volume Produzido]
VAR _VolumeMesAnterior = 
    CALCULATE(
        [Volume Produzido],
        DATEADD(dim_calendario[Data], -1, MONTH)
    )
RETURN
    DIVIDE(_VolumeAtual - _VolumeMesAnterior, _VolumeMesAnterior, 0)`,
      explanation:
        'Aplica CALCULATE com a função de inteligência temporal DATEADD sobre a tabela dim_calendario relacionada.',
      category: 'Inteligência Temporal',
    },
  ];

  const powerQueryMCode = `// ==========================================
// CÓDIGO POWER QUERY M: TRATAMENTO FATO PRODUÇÃO
// Cole no 'Editor Avançado' do Power Query
// ==========================================
let
    Fonte = Csv.Document(File.Contents("C:\\Dados\\fato_producao.csv"),[Delimiter=";", Columns=15, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    #"Cabeçalhos Promovidos" = Table.PromoteHeaders(Fonte, [PromoteAllScalars=true]),
    #"Tipo Alterado" = Table.TransformColumnTypes(#"Cabeçalhos Promovidos",{
        {"id_fato", type text}, 
        {"data_producao", type date}, 
        {"mes_referencia", type text}, 
        {"planta", type text}, 
        {"id_linha", type text}, 
        {"id_turno", type text}, 
        {"id_produto", type text}, 
        {"unidades_planejadas", Int64.Type}, 
        {"unidades_produzidas", Int64.Type}, 
        {"unidades_refugo", Int64.Type}, 
        {"minutos_disponiveis", Int64.Type}, 
        {"minutos_operando", Int64.Type}, 
        {"minutos_parada", Int64.Type}, 
        {"percentual_oee", type number}, 
        {"percentual_produtividade", type number}
    }),
    #"Coluna Condicional Status" = Table.AddColumn(#"Tipo Alterado", "Classificacao_OEE", each 
        if [percentual_oee] >= 85 then "Excelente (Classe Mundial)" 
        else if [percentual_oee] >= 75 then "Aceitável" 
        else "Crítico (Ação Imediata)")
in
    #"Coluna Condicional Status"`;

  const excelFormulasGuide = [
    {
      topic: 'Soma Condicional por Linha (SOMASE)',
      syntax: '=SOMASE(fato_producao[id_linha]; "Linha A"; fato_producao[unidades_produzidas])',
      useCase: 'Agrega a produção física de uma linha específica sem necessidade de tabela dinâmica.',
    },
    {
      topic: 'Busca Dinâmica Moderna (PROCX / XLOOKUP)',
      syntax: '=PROCX(A2; dim_linhas[id_linha]; dim_linhas[responsavel]; "Não Encontrado")',
      useCase: 'Substituto moderno e seguro do PROCV, não trava com inserção de colunas e pesquisa bidirecional.',
    },
    {
      topic: 'Média de OEE Excluindo Paradas Graves (MÉDIA.SE)',
      syntax: '=MÉDIA.SE(fato_producao[id_linha]; "Linha C"; fato_producao[percentual_oee])',
      useCase: 'Média aritmética precisa filtrando apenas registros da linha de interesse.',
    },
    {
      topic: 'Cálculo de Percentil e Desvio Padrão',
      syntax: '=DESVPAD.A(fato_producao[unidades_produzidas])',
      useCase: 'Mede a volatilidade e dispersão do processo produtivo ao longo dos dias do mês.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#0a1628] via-[#0f274a] to-[#0a1628] rounded-2xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-sky-300 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guia Completo de Engenharia de Dados &amp; Business Intelligence</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            Como Replicar e Analisar este Dashboard no Power BI &amp; Excel
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Aqui você encontra toda a arquitetura relacional (Star Schema), códigos Power Query
            (M), biblioteca de medidas DAX, fórmulas Excel e os arquivos completos para download
            imediato em <strong>.xlsx, .csv e .sql</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={downloadCompleteExcelWorkbook}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-lg shadow-emerald-700/30 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Baixar Planilha Excel (.xlsx)</span>
            </button>
            <button
              onClick={() => {
                const sql = generateSqlScript();
                const blob = new Blob([sql], { type: 'text/sql;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'banco_dados_producao_industrial.sql';
                a.click();
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-lg shadow-blue-700/30 transition-all cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>Baixar Script SQL Completo</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid in background */}
        <div className="absolute right-0 bottom-0 top-0 w-80 opacity-10 pointer-events-none hidden md:block">
          <svg viewBox="0 0 100 100" className="w-full h-full stroke-current text-white">
            <line x1="0" y1="20" x2="100" y2="20" strokeWidth="0.5" />
            <line x1="0" y1="40" x2="100" y2="40" strokeWidth="0.5" />
            <line x1="0" y1="60" x2="100" y2="60" strokeWidth="0.5" />
            <line x1="0" y1="80" x2="100" y2="80" strokeWidth="0.5" />
            <line x1="20" y1="0" x2="20" y2="100" strokeWidth="0.5" />
            <line x1="40" y1="0" x2="40" y2="100" strokeWidth="0.5" />
            <line x1="60" y1="0" x2="60" y2="100" strokeWidth="0.5" />
            <line x1="80" y1="0" x2="80" y2="100" strokeWidth="0.5" />
          </svg>
        </div>
      </div>

      {/* 1. MODELO RELACIONAL (STAR SCHEMA / ESQUEMA ESTRELA) */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              1. Arquitetura do Modelo de Dados (Esquema Estrela / Star Schema)
            </h3>
            <p className="text-xs text-slate-500">
              Padrão recomendado pela Microsoft e Kimball para máxima velocidade no Power BI
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Card Dimensões */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold tracking-wider text-blue-700 uppercase block mb-1">
              Tabelas Dimensão (Filtros &amp; Contexto)
            </span>
            <ul className="text-xs space-y-2 mt-2">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-slate-800">dim_linhas:</span>
                <span className="text-slate-600">id_linha (PK), nome, setor, capacidade, ano.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-slate-800">dim_turnos:</span>
                <span className="text-slate-600">id_turno (PK), nome_turno, horarios, supervisor.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-slate-800">dim_produtos:</span>
                <span className="text-slate-600">id_produto (PK), nome, familia, ciclo_padrao.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-slate-800">dim_calendario:</span>
                <span className="text-slate-600">data (PK), ano, mes, dia_semana, eh_dia_util.</span>
              </li>
            </ul>
          </div>

          {/* Card Fatos */}
          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200">
            <span className="text-[10px] font-bold tracking-wider text-blue-800 uppercase block mb-1">
              Tabelas Fato (Métricas &amp; Transações)
            </span>
            <ul className="text-xs space-y-2 mt-2">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-blue-950">fato_producao:</span>
                <span className="text-blue-900">
                  Granularidade diária por linha, turno e produto. Registra volume real, meta,
                  minutos operando e refugo.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-blue-950">fato_paradas:</span>
                <span className="text-blue-900">
                  Granularidade por evento. Registra motivo (Mecânica, Setup, etc.), tempo parado,
                  causa-raiz e ação corretiva.
                </span>
              </li>
            </ul>
          </div>

          {/* Card Cardinalidade */}
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold tracking-wider text-emerald-800 uppercase block mb-1">
              Relacionamentos (1:N)
            </span>
            <p className="text-xs text-emerald-950 leading-relaxed">
              No Power BI Desktop, conecte sempre o lado <strong>1 (Dimensão)</strong> com o lado{' '}
              <strong>N (Muitos - Fato)</strong> com direção de filtro cruzado <strong>Único</strong>.
              Isso garante que segmentações por Linha, Mês ou Turno filtrem instantaneamente todos os
              gráficos e cartões.
            </p>
          </div>
        </div>
      </div>

      {/* 2. BIBLIOTECA DE MEDIDAS DAX */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Code2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              2. Fórmulas DAX para Construir o Dashboard
            </h3>
            <p className="text-xs text-slate-500">
              Medidas calculadas com suporte a contexto de filtro, agregadores e inteligência temporal
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {daxFormulas.map((formula, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{formula.name}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono">
                    {formula.category}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(formula.dax, `dax-${idx}`)}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  {copiedKey === `dax-${idx}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar DAX</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 bg-slate-900">
                <pre className="text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto">
                  {formula.dax}
                </pre>
              </div>
              <div className="px-4 py-2 text-xs bg-slate-50 text-slate-600 border-t border-slate-100">
                <strong>Por que funciona:</strong> {formula.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. GUIA EXCEL (TABELAS DINÂMICAS & FÓRMULAS) */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <FileSpreadsheet className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              3. Melhores Práticas para Microsoft Excel
            </h3>
            <p className="text-xs text-slate-500">
              Como construir tabelas dinâmicas e fórmulas eficientes a partir da pasta de trabalho
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {excelFormulasGuide.map((item, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-900 mb-1">{item.topic}</h4>
              <p className="text-[11px] text-slate-600 mb-2">{item.useCase}</p>
              <div className="p-2 bg-slate-800 rounded-lg text-xs font-mono text-emerald-400 select-all overflow-x-auto">
                {item.syntax}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SCRIPT POWER QUERY M */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Code2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                4. Código Power Query (M) para ETL Automatizado
              </h3>
              <p className="text-xs text-slate-500">
                Lê o CSV, promove cabeçalhos, tipa colunas e gera colunas condicionais
              </p>
            </div>
          </div>
          <button
            onClick={() => handleCopy(powerQueryMCode, 'mcode')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
          >
            {copiedKey === 'mcode' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Código M</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 bg-slate-900 text-sky-200 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
          {powerQueryMCode}
        </pre>
      </div>
    </div>
  );
};
