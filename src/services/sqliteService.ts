/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// @ts-ignore - inline wasm bundle
import initSqlJs from 'sql.js/dist/sql-wasm-inline.js';
import type { Database } from 'sql.js';
import {
  GranularProductionRecord,
  GranularStoppageRecord,
  LineStat,
  ShiftStat,
  ProductStat,
  ProductionStatusStat,
  MonthlyProductionStat,
  StoppageReasonStat,
} from '../types/production';
import {
  generateGranularProductionRecords,
  granularStoppagesNovember,
  dimensionTables,
  monthlyHistoricalData,
} from '../data/mockProductionData';

export interface SqlQueryResult {
  columns: string[];
  values: any[][];
  error?: string;
}

const STORAGE_KEY_PROD = 'industria_fato_producao_v2';
const STORAGE_KEY_STOPS = 'industria_fato_paradas_v2';
const STORAGE_KEY_LINES = 'industria_dim_linhas_v2';
const STORAGE_KEY_PRODUCTS = 'industria_dim_produtos_v2';

class SqliteManager {
  private db: Database | null = null;
  private isInitialized = false;

  public productionRecords: GranularProductionRecord[] = [];
  public stoppageRecords: GranularStoppageRecord[] = [];
  public linesRecords: typeof dimensionTables.dimLinhas = [];
  public productsRecords: typeof dimensionTables.dimProdutos = [];

  // Initialize SQLite database
  public async init(): Promise<void> {
    if (this.isInitialized && this.db) return;

    // Load from localStorage or defaults
    this.loadStateFromStorage();

    try {
      // With inline wasm, no external locateFile or network fetch is needed
      const SQL = await (initSqlJs as any)();
      this.db = new SQL.Database();
      this.seedSqliteDatabase();
      this.isInitialized = true;
    } catch (err) {
      console.warn('SQLite inline wasm fallback:', err);
      // Fallback: try loading from /sql-wasm.wasm if inline fails
      try {
        const SQL = await (initSqlJs as any)({
          locateFile: () => '/sql-wasm.wasm',
        });
        this.db = new SQL.Database();
        this.seedSqliteDatabase();
        this.isInitialized = true;
      } catch (fallbackErr) {
        console.warn('SQLite engine operating in virtual mode:', fallbackErr);
        this.isInitialized = true;
      }
    }
  }

  private loadStateFromStorage() {
    const savedProd = localStorage.getItem(STORAGE_KEY_PROD);
    const savedStops = localStorage.getItem(STORAGE_KEY_STOPS);
    const savedLines = localStorage.getItem(STORAGE_KEY_LINES);
    const savedProducts = localStorage.getItem(STORAGE_KEY_PRODUCTS);

    if (savedProd) {
      try {
        this.productionRecords = JSON.parse(savedProd);
      } catch {
        this.productionRecords = generateGranularProductionRecords();
      }
    } else {
      this.productionRecords = generateGranularProductionRecords();
    }

    if (savedStops) {
      try {
        this.stoppageRecords = JSON.parse(savedStops);
      } catch {
        this.stoppageRecords = granularStoppagesNovember;
      }
    } else {
      this.stoppageRecords = [...granularStoppagesNovember];
    }

    if (savedLines) {
      try {
        this.linesRecords = JSON.parse(savedLines);
      } catch {
        this.linesRecords = [...dimensionTables.dimLinhas];
      }
    } else {
      this.linesRecords = [...dimensionTables.dimLinhas];
    }

    if (savedProducts) {
      try {
        this.productsRecords = JSON.parse(savedProducts);
      } catch {
        this.productsRecords = [...dimensionTables.dimProdutos];
      }
    } else {
      this.productsRecords = [...dimensionTables.dimProdutos];
    }
  }

  public saveToStorage() {
    localStorage.setItem(STORAGE_KEY_PROD, JSON.stringify(this.productionRecords));
    localStorage.setItem(STORAGE_KEY_STOPS, JSON.stringify(this.stoppageRecords));
    localStorage.setItem(STORAGE_KEY_LINES, JSON.stringify(this.linesRecords));
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(this.productsRecords));

    // Re-seed SQLite DB if active
    if (this.db) {
      this.seedSqliteDatabase();
    }
  }

  public resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY_PROD);
    localStorage.removeItem(STORAGE_KEY_STOPS);
    localStorage.removeItem(STORAGE_KEY_LINES);
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    this.productionRecords = generateGranularProductionRecords();
    this.stoppageRecords = [...granularStoppagesNovember];
    this.linesRecords = [...dimensionTables.dimLinhas];
    this.productsRecords = [...dimensionTables.dimProdutos];
    this.saveToStorage();
  }

  private seedSqliteDatabase() {
    if (!this.db) return;

    try {
      this.db.run(`DROP TABLE IF EXISTS fato_producao;`);
      this.db.run(`DROP TABLE IF EXISTS fato_paradas;`);
      this.db.run(`DROP TABLE IF EXISTS dim_linhas;`);
      this.db.run(`DROP TABLE IF EXISTS dim_produtos;`);

      // DDL
      this.db.run(`
        CREATE TABLE dim_linhas (
          id_linha TEXT PRIMARY KEY,
          nome_linha TEXT NOT NULL,
          capacidade_hora INTEGER NOT NULL,
          setor TEXT NOT NULL,
          ano_instalacao INTEGER NOT NULL,
          responsavel TEXT NOT NULL
        );
      `);

      this.db.run(`
        CREATE TABLE dim_produtos (
          id_produto TEXT PRIMARY KEY,
          nome_produto TEXT NOT NULL,
          familia TEXT NOT NULL,
          ciclo_padrao_seg REAL NOT NULL,
          preco_unitario REAL NOT NULL
        );
      `);

      this.db.run(`
        CREATE TABLE fato_producao (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          mes TEXT NOT NULL,
          planta TEXT NOT NULL,
          id_linha TEXT NOT NULL,
          shift TEXT NOT NULL,
          id_produto TEXT NOT NULL,
          unidades_planejadas INTEGER NOT NULL,
          unidades_produzidas INTEGER NOT NULL,
          unidades_refugo INTEGER NOT NULL,
          minutos_disponiveis INTEGER NOT NULL,
          minutos_operando INTEGER NOT NULL,
          minutos_parada INTEGER NOT NULL,
          oee_percent REAL NOT NULL,
          produtividade_percent REAL NOT NULL,
          eficiencia_percent REAL NOT NULL
        );
      `);

      this.db.run(`
        CREATE TABLE fato_paradas (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          mes TEXT NOT NULL,
          planta TEXT NOT NULL,
          id_linha TEXT NOT NULL,
          shift TEXT NOT NULL,
          motivo TEXT NOT NULL,
          duracao_minutos INTEGER NOT NULL,
          causa_raiz TEXT NOT NULL,
          acao_corretiva TEXT NOT NULL,
          tecnico TEXT NOT NULL
        );
      `);

      // Seed dim_linhas
      for (const line of this.linesRecords) {
        this.db.run(
          `INSERT INTO dim_linhas VALUES (?, ?, ?, ?, ?, ?);`,
          [line.id_linha, line.nome, line.capacidade_hora, line.setor, line.ano_instalacao, line.responsavel]
        );
      }

      // Seed dim_produtos
      for (const prod of this.productsRecords) {
        this.db.run(
          `INSERT INTO dim_produtos VALUES (?, ?, ?, ?, ?);`,
          [prod.id_produto, prod.nome_produto, prod.familia, prod.ciclo_padrao_seg, prod.preco_unitario]
        );
      }

      // Seed fato_producao
      for (const p of this.productionRecords) {
        this.db.run(
          `INSERT INTO fato_producao VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            p.id,
            p.date,
            p.month,
            p.plant,
            p.lineId,
            p.shift,
            p.productId,
            p.plannedUnits,
            p.producedUnits,
            p.defectUnits,
            p.availableMinutes,
            p.operatingMinutes,
            p.downtimeMinutes,
            p.oeePercent,
            p.productivityPercent,
            p.efficiencyPercent,
          ]
        );
      }

      // Seed fato_paradas
      for (const s of this.stoppageRecords) {
        this.db.run(
          `INSERT INTO fato_paradas VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            s.id,
            s.date,
            s.month,
            s.plant,
            s.lineId,
            s.shift,
            s.reason,
            s.durationMinutes,
            s.rootCause,
            s.correctiveAction,
            s.technician,
          ]
        );
      }
    } catch (e) {
      console.error('Error seeding SQLite database:', e);
    }
  }

  // Execute custom SQL query
  public executeSql(query: string): SqlQueryResult {
    if (!this.db) {
      // Fallback simple query parser if wasm wasn't active
      return this.fallbackQueryRunner(query);
    }

    try {
      const res = this.db.exec(query);
      if (res.length === 0) {
        return { columns: [], values: [] };
      }
      return {
        columns: res[0].columns,
        values: res[0].values,
      };
    } catch (err: any) {
      return {
        columns: [],
        values: [],
        error: err.message || 'Erro ao executar instrução SQL',
      };
    }
  }

  // Download binary .sqlite database file
  public downloadSqliteDatabase() {
    if (this.db) {
      const data = this.db.export();
      const blob = new Blob([data as any], { type: 'application/x-sqlite3' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'industria_producao_local.sqlite';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Export as text DDL/DML if binary not generated
      const sqlContent = this.generateExportSql();
      const blob = new Blob([sqlContent], { type: 'text/sql' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'industria_producao_local.sql';
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  public generateExportSql(): string {
    const sqlStatements: string[] = [
      '-- BANCO DE DADOS SQLITE - PRODUÇÃO INDUSTRIAL LOCAL',
      'PRAGMA foreign_keys = ON;',
      '',
      'CREATE TABLE IF NOT EXISTS dim_linhas (id_linha TEXT PRIMARY KEY, nome_linha TEXT, capacidade_hora INTEGER, setor TEXT, ano_instalacao INTEGER, responsavel TEXT);',
      'CREATE TABLE IF NOT EXISTS dim_produtos (id_produto TEXT PRIMARY KEY, nome_produto TEXT, familia TEXT, ciclo_padrao_seg REAL, preco_unitario REAL);',
      'CREATE TABLE IF NOT EXISTS fato_producao (id TEXT PRIMARY KEY, data TEXT, mes TEXT, planta TEXT, id_linha TEXT, shift TEXT, id_produto TEXT, unidades_planejadas INTEGER, unidades_produzidas INTEGER, unidades_refugo INTEGER, minutos_disponiveis INTEGER, minutos_operando INTEGER, minutos_parada INTEGER, oee_percent REAL, produtividade_percent REAL, eficiencia_percent REAL);',
      'CREATE TABLE IF NOT EXISTS fato_paradas (id TEXT PRIMARY KEY, data TEXT, mes TEXT, planta TEXT, id_linha TEXT, shift TEXT, motivo TEXT, duracao_minutos INTEGER, causa_raiz TEXT, acao_corretiva TEXT, tecnico TEXT);',
      '',
    ];

    for (const l of this.linesRecords) {
      sqlStatements.push(
        `INSERT OR REPLACE INTO dim_linhas VALUES ('${l.id_linha}', '${l.nome}', ${l.capacidade_hora}, '${l.setor}', ${l.ano_instalacao}, '${l.responsavel}');`
      );
    }

    for (const pr of this.productsRecords) {
      sqlStatements.push(
        `INSERT OR REPLACE INTO dim_produtos VALUES ('${pr.id_produto}', '${pr.nome_produto}', '${pr.familia}', ${pr.ciclo_padrao_seg}, ${pr.preco_unitario});`
      );
    }

    for (const p of this.productionRecords) {
      sqlStatements.push(
        `INSERT OR REPLACE INTO fato_producao VALUES ('${p.id}', '${p.date}', '${p.month}', '${p.plant}', '${p.lineId}', '${p.shift}', '${p.productId}', ${p.plannedUnits}, ${p.producedUnits}, ${p.defectUnits}, ${p.availableMinutes}, ${p.operatingMinutes}, ${p.downtimeMinutes}, ${p.oeePercent}, ${p.productivityPercent}, ${p.efficiencyPercent});`
      );
    }

    for (const s of this.stoppageRecords) {
      sqlStatements.push(
        `INSERT OR REPLACE INTO fato_paradas VALUES ('${s.id}', '${s.date}', '${s.month}', '${s.plant}', '${s.lineId}', '${s.shift}', '${s.reason}', ${s.durationMinutes}, '${s.rootCause.replace(/'/g, "''")}', '${s.correctiveAction.replace(/'/g, "''")}', '${s.technician}');`
      );
    }

    return sqlStatements.join('\n');
  }

  // Fallback query runner for basic exploration
  private fallbackQueryRunner(query: string): SqlQueryResult {
    const q = query.trim().toLowerCase();

    // Group by motivo query support
    if (q.includes('group by motivo') || (q.includes('count(') && q.includes('fato_paradas'))) {
      const counts: Record<string, { count: number; dur: number }> = {};
      for (const s of this.stoppageRecords) {
        if (!counts[s.reason]) counts[s.reason] = { count: 0, dur: 0 };
        counts[s.reason].count++;
        counts[s.reason].dur += s.durationMinutes;
      }
      const sorted = Object.entries(counts).sort((a, b) => b[1].dur - a[1].dur);
      return {
        columns: ['motivo', 'total_paradas', 'tempo_total_minutos'],
        values: sorted.map(([motivo, stat]) => [motivo, stat.count, stat.dur]),
      };
    }

    // Group by id_linha query support
    if (q.includes('group by id_linha') || q.includes('group by linha')) {
      const lineMap: Record<string, { vol: number; oeeSum: number; count: number }> = {};
      for (const p of this.productionRecords) {
        if (!lineMap[p.lineId]) lineMap[p.lineId] = { vol: 0, oeeSum: 0, count: 0 };
        lineMap[p.lineId].vol += p.producedUnits;
        lineMap[p.lineId].oeeSum += p.oeePercent;
        lineMap[p.lineId].count++;
      }
      return {
        columns: ['id_linha', 'total_produzido', 'oee_medio'],
        values: Object.entries(lineMap).map(([id_linha, stat]) => [
          id_linha,
          stat.vol,
          Math.round((stat.oeeSum / stat.count) * 10) / 10,
        ]),
      };
    }

    if (q.includes('from fato_paradas')) {
      return {
        columns: ['id', 'data', 'id_linha', 'motivo', 'duracao_minutos', 'causa_raiz', 'tecnico'],
        values: this.stoppageRecords.slice(0, 20).map((s) => [
          s.id,
          s.date,
          s.lineId,
          s.reason,
          s.durationMinutes,
          s.rootCause,
          s.technician,
        ]),
      };
    } else if (q.includes('from dim_linhas')) {
      return {
        columns: ['id_linha', 'nome_linha', 'capacidade_hora', 'setor', 'responsavel'],
        values: this.linesRecords.map((l) => [
          l.id_linha,
          l.nome,
          l.capacidade_hora,
          l.setor,
          l.responsavel,
        ]),
      };
    } else if (q.includes('from dim_produtos')) {
      return {
        columns: ['id_produto', 'nome_produto', 'familia', 'preco_unitario'],
        values: this.productsRecords.map((pr) => [
          pr.id_produto,
          pr.nome_produto,
          pr.familia,
          pr.preco_unitario,
        ]),
      };
    } else {
      return {
        columns: ['id', 'data', 'id_linha', 'shift', 'unidades_produzidas', 'oee_percent'],
        values: this.productionRecords.slice(0, 20).map((p) => [
          p.id,
          p.date,
          p.lineId,
          p.shift,
          p.producedUnits,
          p.oeePercent,
        ]),
      };
    }
  }

  // Calculate live dynamic metrics for dashboard
  public getLiveDashboardAggregates(filterLine = 'Todas', filterShift = 'Todos') {
    let filteredProd = [...this.productionRecords];
    let filteredStops = [...this.stoppageRecords];

    if (filterLine !== 'Todas') {
      filteredProd = filteredProd.filter((p) => p.lineId === filterLine);
      filteredStops = filteredStops.filter((s) => s.lineId === filterLine);
    }

    if (filterShift !== 'Todos') {
      const shiftPrefix = filterShift.split(' ')[0]; // e.g. "1º"
      filteredProd = filteredProd.filter((p) => p.shift.startsWith(shiftPrefix));
      filteredStops = filteredStops.filter((s) => s.shift.startsWith(shiftPrefix));
    }

    // Totals
    const totalVolume = filteredProd.reduce((acc, p) => acc + p.producedUnits, 0);
    const totalPlanned = filteredProd.reduce((acc, p) => acc + p.plannedUnits, 0);
    const totalDefects = filteredProd.reduce((acc, p) => acc + p.defectUnits, 0);
    const totalAvailMin = filteredProd.reduce((acc, p) => acc + p.availableMinutes, 0);
    const totalOpMin = filteredProd.reduce((acc, p) => acc + p.operatingMinutes, 0);
    const totalStoppages = filteredStops.length;

    // Line totals
    const lineStats: LineStat[] = this.linesRecords.map((lineMeta) => {
      const lineProd = this.productionRecords.filter((p) => p.lineId === lineMeta.nome);
      const lineStops = this.stoppageRecords.filter((s) => s.lineId === lineMeta.nome);

      const vol = lineProd.reduce((a, b) => a + b.producedUnits, 0);
      const def = lineProd.reduce((a, b) => a + b.defectUnits, 0);
      const planned = lineProd.reduce((a, b) => a + b.plannedUnits, 0);
      const opM = lineProd.reduce((a, b) => a + b.operatingMinutes, 0);
      const avM = lineProd.reduce((a, b) => a + b.availableMinutes, 0);

      const lossesPct = vol > 0 ? (def / vol) * 100 : 0;
      const effPct = avM > 0 ? (opM / avM) * 100 : 0;
      const perfPct = planned > 0 ? (vol / planned) : 1;
      const qualPct = vol > 0 ? (vol - def) / vol : 1;
      const oeePct = (effPct / 100) * perfPct * qualPct * 100;

      return {
        lineId: lineMeta.id_linha,
        name: lineMeta.nome,
        volume: vol,
        losses: Math.round(lossesPct * 10) / 10,
        efficiency: Math.round(effPct * 10) / 10,
        oee: Math.round(oeePct * 10) / 10,
        targetVolume: planned,
        stoppages: lineStops.length,
        supervisor: lineMeta.responsavel,
      };
    });

    // Reason stats
    const reasonCounts: Record<string, number> = {
      Mecânica: 0,
      Setup: 0,
      'Falta de Material': 0,
      Elétrica: 0,
      Qualidade: 0,
      Outros: 0,
    };

    filteredStops.forEach((s) => {
      if (reasonCounts[s.reason] !== undefined) {
        reasonCounts[s.reason]++;
      } else {
        reasonCounts['Outros']++;
      }
    });

    const colors: Record<string, string> = {
      Mecânica: '#1d4ed8',
      Setup: '#3b82f6',
      'Falta de Material': '#38bdf8',
      Elétrica: '#22c55e',
      Qualidade: '#4ade80',
      Outros: '#94a3b8',
    };

    const stoppageReasons: StoppageReasonStat[] = Object.keys(reasonCounts).map((reason) => {
      const count = reasonCounts[reason];
      const pct = totalStoppages > 0 ? (count / totalStoppages) * 100 : 0;
      return {
        reason,
        count,
        percentage: Math.round(pct * 10) / 10,
        durationMinutes: count * 40,
        color: colors[reason] || '#94a3b8',
      };
    });

    // Shift breakdown
    const shiftsData: ShiftStat[] = ['1º Turno', '2º Turno', '3º Turno'].map((sh) => {
      const pRows = this.productionRecords.filter((p) => p.shift === sh);
      const v = pRows.reduce((a, b) => a + b.producedUnits, 0);
      const op = pRows.reduce((a, b) => a + b.operatingMinutes, 0);
      const av = pRows.reduce((a, b) => a + b.availableMinutes, 0);
      const allVol = this.productionRecords.reduce((a, b) => a + b.producedUnits, 0);

      const eff = av > 0 ? (op / av) * 100 : 88;
      const oee = eff * 0.89;

      return {
        shift: sh,
        volume: v,
        percentage: allVol > 0 ? Math.round((v / allVol) * 100) : 33,
        efficiency: Math.round(eff * 10) / 10,
        oee: Math.round(oee * 10) / 10,
      };
    });

    // Product breakdown computed from live records
    const allProdVol = this.productionRecords.reduce((a, b) => a + b.producedUnits, 0);
    const productsData: ProductStat[] = this.productsRecords.map((pr) => {
      // match by name or ID
      const pRows = this.productionRecords.filter(
        (p) => p.productId === pr.nome_produto || p.productId === pr.id_produto || pr.nome_produto.startsWith(p.productId)
      );
      const v = pRows.reduce((a, b) => a + b.producedUnits, 0);
      const scrap = pRows.reduce((a, b) => a + b.defectUnits, 0);
      const pct = allProdVol > 0 ? Math.round((v / allProdVol) * 100) : 0;

      return {
        product: pr.nome_produto.split(' (')[0], // e.g. "Produto A"
        volume: v,
        percentage: pct,
        scrapUnits: scrap,
      };
    });

    // Production Status breakdown computed from live records
    const sumAvail = this.productionRecords.reduce((a, b) => a + b.availableMinutes, 0);
    const sumOper = this.productionRecords.reduce((a, b) => a + b.operatingMinutes, 0);
    const sumSetup = this.stoppageRecords
      .filter((s) => s.reason === 'Setup')
      .reduce((a, b) => a + b.durationMinutes, 0);

    const inProductionPct = sumAvail > 0 ? Math.min(Math.round((sumOper / sumAvail) * 100), 96) : 88;
    const inSetupPct = sumAvail > 0 ? Math.max(Math.round((sumSetup / sumAvail) * 100), 2) : 9;
    const inDowntimePct = Math.max(100 - inProductionPct - inSetupPct, 1);

    const statusData: ProductionStatusStat[] = [
      { status: 'Em Produção', percentage: inProductionPct, color: '#16a34a' },
      { status: 'Em Setup', percentage: inSetupPct, color: '#0284c7' },
      { status: 'Parada', percentage: inDowntimePct, color: '#64748b' },
    ];

    // Dynamic Monthly Historical data with current live values for November
    const liveMonthlyData: MonthlyProductionStat[] = monthlyHistoricalData.map((m) => {
      if (m.month === 'Nov') {
        return {
          ...m,
          volume: totalVolume,
          oee: Math.round(((totalOpMin / (totalAvailMin || 1)) * 0.89) * 1000) / 10 || 78.6,
          stoppages: totalStoppages,
          productivity: Math.round((totalVolume / (totalPlanned || 1)) * 1000) / 10 || 92.4,
          losses: Math.round((totalDefects / (totalVolume || 1)) * 1000) / 10 || 3.2,
          efficiency: Math.round((totalOpMin / (totalAvailMin || 1)) * 1000) / 10 || 88.9,
        };
      }
      return m;
    });

    // Statistical Process Capability (Cp, Cpk, Mean, StdDev) computed from live records
    const processCapabilityData = this.linesRecords.map((lineMeta) => {
      const pRows = this.productionRecords.filter((p) => p.lineId === lineMeta.nome);
      const vals = pRows.map((p) => p.producedUnits);
      const n = vals.length || 1;
      const mean = vals.reduce((a, b) => a + b, 0) / n;

      // Variance & StdDev
      const variance = vals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n > 1 ? n - 1 : 1);
      const stdDev = Math.sqrt(variance) || 10;

      // Specification Limits: ±15% of nominal capacity per day
      const nominal = (lineMeta.capacidade_hora || 200) * 8;
      const USL = nominal * 1.15;
      const LSL = nominal * 0.85;

      const cp = (USL - LSL) / (6 * stdDev);
      const cpu = (USL - mean) / (3 * stdDev);
      const cpl = (mean - LSL) / (3 * stdDev);
      const cpk = Math.max(0.1, Math.min(cpu, cpl));

      let status = 'Capaz (Processo Estável)';
      let color = 'text-emerald-700 bg-emerald-50';

      if (cpk < 1.0) {
        status = 'Incapaz (Alta Variabilidade / Refugo)';
        color = 'text-red-700 bg-red-50';
      } else if (cpk < 1.33) {
        status = 'Marginalmente Capaz';
        color = 'text-amber-700 bg-amber-50';
      } else if (cpk >= 1.67) {
        status = 'Altamente Capaz (Classe Mundial)';
        color = 'text-emerald-800 bg-emerald-100';
      }

      return {
        line: lineMeta.nome,
        meanVolume: Math.round(mean),
        stdDev: Math.round(stdDev),
        cp: Math.round(cp * 100) / 100,
        cpk: Math.round(cpk * 100) / 100,
        status,
        color,
      };
    });

    return {
      totalVolume,
      totalPlanned,
      totalDefects,
      totalStoppages,
      productivityPct: totalPlanned > 0 ? (totalVolume / totalPlanned) * 100 : 92.4,
      efficiencyPct: totalAvailMin > 0 ? (totalOpMin / totalAvailMin) * 100 : 88.9,
      lossesPct: totalVolume > 0 ? (totalDefects / totalVolume) * 100 : 3.2,
      oeePct: totalAvailMin > 0 && totalPlanned > 0 && totalVolume > 0
        ? Math.round(((totalOpMin / totalAvailMin) * (totalVolume / totalPlanned) * ((totalVolume - totalDefects) / totalVolume)) * 1000) / 10
        : 78.6,
      lineStats,
      stoppageReasons,
      shiftsData,
      productsData,
      statusData,
      monthlyData: liveMonthlyData,
      processCapabilityData,
    };
  }
}

export const sqliteManager = new SqliteManager();
