/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { sqliteManager } from '../services/sqliteService';
import { dimensionTables } from '../data/mockProductionData';

// Download native .xlsx workbook with complete Star Schema data model
export function downloadCompleteExcelWorkbook() {
  const wb = XLSX.utils.book_new();

  // 1. Fato Producao (using live SQLite records)
  const fProduction = sqliteManager.productionRecords.length > 0
    ? sqliteManager.productionRecords
    : [];
  const wsProduction = XLSX.utils.json_to_sheet(fProduction);
  XLSX.utils.book_append_sheet(wb, wsProduction, 'Fato_Producao');

  // 2. Fato Paradas (using live SQLite records)
  const wsStoppages = XLSX.utils.json_to_sheet(sqliteManager.stoppageRecords);
  XLSX.utils.book_append_sheet(wb, wsStoppages, 'Fato_Paradas');

  // 3. Dim Linhas (using live SQLite records)
  const wsLinhas = XLSX.utils.json_to_sheet(sqliteManager.linesRecords);
  XLSX.utils.book_append_sheet(wb, wsLinhas, 'Dim_Linhas');

  // 4. Dim Turnos
  const wsTurnos = XLSX.utils.json_to_sheet(dimensionTables.dimTurnos);
  XLSX.utils.book_append_sheet(wb, wsTurnos, 'Dim_Turnos');

  // 5. Dim Produtos (using live SQLite records)
  const wsProdutos = XLSX.utils.json_to_sheet(sqliteManager.productsRecords);
  XLSX.utils.book_append_sheet(wb, wsProdutos, 'Dim_Produtos');

  // 6. Dim Calendario
  const calendarioData = [];
  for (let d = 1; d <= 30; d++) {
    const dayStr = d < 10 ? `0${d}` : `${d}`;
    calendarioData.push({
      Data: `2024-11-${dayStr}`,
      Ano: 2024,
      Mes_Num: 11,
      Mes_Nome: 'Novembro',
      Ano_Mes: '2024-11',
      Dia: d,
      Dia_Semana: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][new Date(2024, 10, d).getDay()],
      Eh_Dia_Util: new Date(2024, 10, d).getDay() > 0 && new Date(2024, 10, d).getDay() < 6 ? 'Sim' : 'Não',
    });
  }
  const wsCalendario = XLSX.utils.json_to_sheet(calendarioData);
  XLSX.utils.book_append_sheet(wb, wsCalendario, 'Dim_Calendario');

  // 7. Dicionario de Indicadores e Formulas DAX / Excel
  const dicionario = [
    { Indicador: 'Volume Produzido', Unidade: 'unidades', Formula_Excel: '=SOMA(Fato_Producao[producedUnits])', Medida_DAX: 'Volume Produzido = SUM(Fato_Producao[producedUnits])', Objetivo_Estrategico: 'Acompanhar a entrega física da fábrica' },
    { Indicador: 'Produtividade', Unidade: '%', Formula_Excel: '=SOMA(Fato_Producao[producedUnits])/SOMA(Fato_Producao[plannedUnits])', Medida_DAX: 'Produtividade % = DIVIDE([Volume Produzido], SUM(Fato_Producao[plannedUnits]), 0)', Objetivo_Estrategico: 'Comparar produção real vs. meta programada' },
    { Indicador: 'OEE (Eficiência Global)', Unidade: '%', Formula_Excel: '=[@Disponibilidade]*[@Performance]*[@Qualidade]', Medida_DAX: 'OEE % = [Disponibilidade %] * [Performance %] * [Qualidade %]', Objetivo_Estrategico: 'Padrão mundial de eficiência de manufatura' },
    { Indicador: 'Taxa de Perdas / Refugo', Unidade: '%', Formula_Excel: '=SOMA(Fato_Producao[defectUnits])/SOMA(Fato_Producao[producedUnits])', Medida_DAX: 'Taxa Perdas % = DIVIDE(SUM(Fato_Producao[defectUnits]), [Volume Produzido], 0)', Objetivo_Estrategico: 'Minimizar custo de sucata e reprocessamento' },
    { Indicador: 'Eficiência Operacional', Unidade: '%', Formula_Excel: '=SOMA(Fato_Producao[operatingMinutes])/SOMA(Fato_Producao[availableMinutes])', Medida_DAX: 'Eficiência % = DIVIDE(SUM(Fato_Producao[operatingMinutes]), SUM(Fato_Producao[availableMinutes]), 0)', Objetivo_Estrategico: 'Reduzir perdas por paradas não programadas' },
    { Indicador: 'Total de Paradas', Unidade: 'eventos', Formula_Excel: '=CONT.VALORES(Fato_Paradas[id])', Medida_DAX: 'Qtd Paradas = COUNTROWS(Fato_Paradas)', Objetivo_Estrategico: 'Identificar estabilidade dos equipamentos' },
  ];
  const wsDicionario = XLSX.utils.json_to_sheet(dicionario);
  XLSX.utils.book_append_sheet(wb, wsDicionario, 'Dicionario_Indicadores');

  // Trigger download
  XLSX.writeFile(wb, 'Industria_Producao_PowerBI_Dataset.xlsx');
}

// Download pure CSV string
export function downloadCsv(filename: string, csvContent: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Convert object array to CSV
export function jsonToCsv(data: Record<string, any>[]): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const val = row[header] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(';')
  );
  return [headers.join(';'), ...rows].join('\r\n');
}

// Generate complete SQL script (DDL + DML)
export function generateSqlScript(): string {
  const prod = sqliteManager.productionRecords.slice(0, 50); // representative rows for DML demo
  const stops = sqliteManager.stoppageRecords;

  return `-- ===============================================================
-- BANCO DE DADOS: SISTEMA DE PRODUÇÃO INDUSTRIAL & OEE
-- MODELO RELACIONAL (STAR SCHEMA / ESQUEMA ESTRELA)
-- Compatível com: PostgreSQL, MySQL, Microsoft SQL Server, SQLite
-- ===============================================================

-- 1. TABELA DIMENSÃO: LINHAS DE PRODUÇÃO
CREATE TABLE dim_linhas (
    id_linha VARCHAR(10) PRIMARY KEY,
    nome_linha VARCHAR(50) NOT NULL,
    capacidade_hora INT NOT NULL,
    setor VARCHAR(50) NOT NULL,
    ano_instalacao INT NOT NULL,
    responsavel VARCHAR(100) NOT NULL
);

INSERT INTO dim_linhas (id_linha, nome_linha, capacidade_hora, setor, ano_instalacao, responsavel) VALUES
('L-A', 'Linha A', 320, 'Envase Líquidos', 2021, 'Carlos Mendes'),
('L-B', 'Linha B', 280, 'Envase Pós', 2019, 'Renata Silva'),
('L-C', 'Linha C', 250, 'Rotulagem & Encadernação', 2017, 'Marcos Souza'),
('L-D', 'Linha D', 160, 'Empacotamento Automático', 2020, 'Fernanda Lima'),
('L-E', 'Linha E', 90, 'Linha Piloto / Especiais', 2023, 'Thiago Rocha');

-- 2. TABELA DIMENSÃO: TURNOS OPERACIONAIS
CREATE TABLE dim_turnos (
    id_turno VARCHAR(10) PRIMARY KEY,
    nome_turno VARCHAR(30) NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    supervisor VARCHAR(100) NOT NULL
);

INSERT INTO dim_turnos (id_turno, nome_turno, horario_inicio, horario_fim, supervisor) VALUES
('T1', '1º Turno', '06:00:00', '14:00:00', 'Gilberto Lima'),
('T2', '2º Turno', '14:00:00', '22:00:00', 'Valéria Costa'),
('T3', '3º Turno', '22:00:00', '06:00:00', 'Danilo Ramos');

-- 3. TABELA DIMENSÃO: PRODUTOS
CREATE TABLE dim_produtos (
    id_produto VARCHAR(20) PRIMARY KEY,
    nome_produto VARCHAR(80) NOT NULL,
    familia VARCHAR(40) NOT NULL,
    ciclo_padrao_seg NUMERIC(5,2) NOT NULL,
    preco_unitario NUMERIC(10,2) NOT NULL
);

INSERT INTO dim_produtos (id_produto, nome_produto, familia, ciclo_padrao_seg, preco_unitario) VALUES
('PRD-A', 'Produto A (Industrial Premium)', 'Premium', 11.20, 42.50),
('PRD-B', 'Produto B (Standard Comercial)', 'Standard', 13.50, 28.00),
('PRD-C', 'Produto C (Econômico Bulk)', 'Econômico', 17.00, 18.20);

-- 4. TABELA FATO: REGISTRO DIÁRIO DE PRODUÇÃO
CREATE TABLE fato_producao (
    id_fato VARCHAR(20) PRIMARY KEY,
    data_producao DATE NOT NULL,
    mes_referencia VARCHAR(20) NOT NULL,
    planta VARCHAR(50) NOT NULL,
    id_linha VARCHAR(10) REFERENCES dim_linhas(id_linha),
    id_turno VARCHAR(10),
    id_produto VARCHAR(20) REFERENCES dim_produtos(id_produto),
    unidades_planejadas INT NOT NULL,
    unidades_produzidas INT NOT NULL,
    unidades_refugo INT NOT NULL,
    minutos_disponiveis INT NOT NULL,
    minutos_operando INT NOT NULL,
    minutos_parada INT NOT NULL,
    percentual_oee NUMERIC(5,2) NOT NULL,
    percentual_produtividade NUMERIC(5,2) NOT NULL,
    percentual_eficiencia NUMERIC(5,2) NOT NULL
);

-- Inserção de dados de amostra da fato_producao
${prod
  .map(
    (p) =>
      `INSERT INTO fato_producao VALUES ('${p.id}', '${p.date}', '${p.month}', '${p.plant}', '${p.lineId}', '${p.shift}', '${p.productId}', ${p.plannedUnits}, ${p.producedUnits}, ${p.defectUnits}, ${p.availableMinutes}, ${p.operatingMinutes}, ${p.downtimeMinutes}, ${p.oeePercent}, ${p.productivityPercent}, ${p.efficiencyPercent});`
  )
  .join('\n')}

-- 5. TABELA FATO: EVENTOS DE PARADAS E AVARIAS
CREATE TABLE fato_paradas (
    id_parada VARCHAR(20) PRIMARY KEY,
    data_parada DATE NOT NULL,
    planta VARCHAR(50) NOT NULL,
    id_linha VARCHAR(10) NOT NULL,
    turno VARCHAR(30) NOT NULL,
    motivo_parada VARCHAR(50) NOT NULL,
    duracao_minutos INT NOT NULL,
    causa_raiz TEXT NOT NULL,
    acao_corretiva TEXT NOT NULL,
    tecnico_responsavel VARCHAR(100) NOT NULL
);

-- Inserção das 17 paradas registradas em Novembro/2024
${stops
  .map(
    (s) =>
      `INSERT INTO fato_paradas VALUES ('${s.id}', '${s.date}', '${s.plant}', '${s.lineId}', '${s.shift}', '${s.reason}', ${s.durationMinutes}, '${s.rootCause.replace(/'/g, "''")}', '${s.correctiveAction.replace(/'/g, "''")}', '${s.technician}');`
  )
  .join('\n')}

-- ===============================================================
-- CONSULTAS ANALÍTICAS ESTATÍSTICAS E ESTRATÉGICAS
-- ===============================================================

-- Consulta 1: Cálculo consolidado do OEE e Produtividade do Mês de Novembro/2024
SELECT 
    ROUND(SUM(unidades_produzidas) * 1.0 / SUM(unidades_planejadas) * 100, 1) AS produtividade_pct,
    ROUND(AVG(percentual_oee), 1) AS oee_medio_pct,
    ROUND(SUM(unidades_refugo) * 1.0 / SUM(unidades_produzidas) * 100, 1) AS perdas_refugo_pct,
    SUM(unidades_produzidas) AS volume_total_produzido
FROM fato_producao
WHERE mes_referencia = 'Novembro/2024';

-- Consulta 2: Curva de Pareto dos Motivos de Paradas
SELECT 
    motivo_parada,
    COUNT(*) AS total_eventos,
    SUM(duracao_minutos) AS tempo_total_minutos,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM fato_paradas), 1) AS percentual_eventos
FROM fato_paradas
GROUP BY motivo_parada
ORDER BY total_eventos DESC;
`;
}
