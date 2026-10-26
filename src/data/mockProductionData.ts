/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MonthlyProductionStat,
  LineStat,
  StoppageReasonStat,
  ShiftStat,
  ProductStat,
  ProductionStatusStat,
  GranularProductionRecord,
  GranularStoppageRecord,
} from '../types/production';

// Monthly historical data (2024) matching the dashboard charts
export const monthlyHistoricalData: MonthlyProductionStat[] = [
  { month: 'Jan', monthFullName: 'Janeiro/2024', volume: 60200, oee: 75.8, stoppages: 28, productivity: 88.2, losses: 4.8, efficiency: 84.5 },
  { month: 'Fev', monthFullName: 'Fevereiro/2024', volume: 88400, oee: 80.2, stoppages: 24, productivity: 90.1, losses: 4.1, efficiency: 86.2 },
  { month: 'Mar', monthFullName: 'Março/2024', volume: 72100, oee: 74.9, stoppages: 22, productivity: 87.5, losses: 4.5, efficiency: 83.9 },
  { month: 'Abr', monthFullName: 'Abril/2024', volume: 89600, oee: 79.1, stoppages: 20, productivity: 91.0, losses: 3.8, efficiency: 87.0 },
  { month: 'Mai', monthFullName: 'Maio/2024', volume: 92800, oee: 77.4, stoppages: 26, productivity: 89.4, losses: 4.2, efficiency: 85.8 },
  { month: 'Jun', monthFullName: 'Junho/2024', volume: 88300, oee: 82.5, stoppages: 19, productivity: 92.0, losses: 3.5, efficiency: 88.1 },
  { month: 'Jul', monthFullName: 'Julho/2024', volume: 110400, oee: 81.3, stoppages: 18, productivity: 91.8, losses: 3.6, efficiency: 87.9 },
  { month: 'Ago', monthFullName: 'Agosto/2024', volume: 118200, oee: 84.0, stoppages: 16, productivity: 93.5, losses: 3.1, efficiency: 89.8 },
  { month: 'Set', monthFullName: 'Setembro/2024', volume: 115000, oee: 79.8, stoppages: 21, productivity: 90.7, losses: 3.9, efficiency: 86.8 },
  { month: 'Out', monthFullName: 'Outubro/2024', volume: 114180, oee: 78.8, stoppages: 14, productivity: 90.3, losses: 3.4, efficiency: 86.1 },
  { month: 'Nov', monthFullName: 'Novembro/2024', volume: 128450, oee: 78.6, stoppages: 17, productivity: 92.4, losses: 3.2, efficiency: 88.9 },
  { month: 'Dez', monthFullName: 'Dezembro/2024', volume: 141900, oee: 81.2, stoppages: 12, productivity: 94.1, losses: 2.7, efficiency: 90.5 },
];

// Production lines stats for November 2024 (Exact replica of image)
export const initialLinesData: LineStat[] = [
  { lineId: 'L-A', name: 'Linha A', volume: 42350, losses: 2.8, efficiency: 89.7, oee: 81.5, targetVolume: 44000, stoppages: 3, supervisor: 'Carlos Mendes' },
  { lineId: 'L-B', name: 'Linha B', volume: 36280, losses: 3.6, efficiency: 85.1, oee: 76.8, targetVolume: 39000, stoppages: 4, supervisor: 'Renata Silva' },
  { lineId: 'L-C', name: 'Linha C', volume: 28450, losses: 5.2, efficiency: 72.4, oee: 65.1, targetVolume: 35000, stoppages: 6, supervisor: 'Marcos Souza' },
  { lineId: 'L-D', name: 'Linha D', volume: 15670, losses: 2.1, efficiency: 78.9, oee: 70.3, targetVolume: 18000, stoppages: 3, supervisor: 'Fernanda Lima' },
  { lineId: 'L-E', name: 'Linha E', volume: 5700, losses: 1.4, efficiency: 91.2, oee: 86.0, targetVolume: 6000, stoppages: 1, supervisor: 'Thiago Rocha' },
];

// Stoppage reasons distribution (Exact replica of image: 17 events total)
export const stoppageReasonsData: StoppageReasonStat[] = [
  { reason: 'Mecânica', percentage: 35.3, count: 6, durationMinutes: 280, color: '#1d4ed8' }, // dark blue
  { reason: 'Setup', percentage: 23.5, count: 4, durationMinutes: 195, color: '#3b82f6' }, // blue
  { reason: 'Falta de Material', percentage: 17.6, count: 3, durationMinutes: 140, color: '#38bdf8' }, // sky/cyan
  { reason: 'Elétrica', percentage: 11.8, count: 2, durationMinutes: 90, color: '#22c55e' }, // emerald green
  { reason: 'Qualidade', percentage: 8.8, count: 1.5, durationMinutes: 65, color: '#4ade80' }, // light green
  { reason: 'Outros', percentage: 2.9, count: 0.5, durationMinutes: 25, color: '#94a3b8' }, // slate
];

// Shift breakdown (Exact replica of image)
export const initialShiftsData: ShiftStat[] = [
  { shift: '1º Turno', volume: 45320, percentage: 35, efficiency: 90.2, oee: 80.4 },
  { shift: '2º Turno', volume: 42180, percentage: 33, efficiency: 88.5, oee: 78.1 },
  { shift: '3º Turno', volume: 40950, percentage: 32, efficiency: 87.8, oee: 77.2 },
];

// Product distribution (Exact replica of image: 52%, 28%, 20%)
export const initialProductsData: ProductStat[] = [
  { product: 'Produto A', percentage: 52, volume: 66794, scrapUnits: 2050 },
  { product: 'Produto B', percentage: 28, volume: 35966, scrapUnits: 1240 },
  { product: 'Produto C', percentage: 20, volume: 25690, scrapUnits: 820 },
];

// Production status breakdown (Exact replica of image: 88%, 9%, 3%)
export const initialProductionStatusData: ProductionStatusStat[] = [
  { status: 'Em Produção', percentage: 88, color: '#16a34a' },
  { status: 'Em Setup', percentage: 9, color: '#0284c7' },
  { status: 'Parada', percentage: 3, color: '#64748b' },
];

// Filter options
export const filterOptions = {
  months: [
    'Janeiro/2024',
    'Fevereiro/2024',
    'Março/2024',
    'Abril/2024',
    'Maio/2024',
    'Junho/2024',
    'Julho/2024',
    'Agosto/2024',
    'Setembro/2024',
    'Outubro/2024',
    'Novembro/2024',
    'Dezembro/2024',
  ],
  plants: ['Todas', 'Planta Sul (Matriz)', 'Planta Norte', 'Planta Leste'],
  lines: ['Todas', 'Linha A', 'Linha B', 'Linha C', 'Linha D', 'Linha E'],
  shifts: ['Todos', '1º Turno (06h - 14h)', '2º Turno (14h - 22h)', '3º Turno (22h - 06h)'],
};

// Generate 120+ granular daily production records for learning and database export
export function generateGranularProductionRecords(): GranularProductionRecord[] {
  const records: GranularProductionRecord[] = [];
  const lines = ['Linha A', 'Linha B', 'Linha C', 'Linha D', 'Linha E'];
  const shifts = ['1º Turno', '2º Turno', '3º Turno'];
  const products = ['Produto A', 'Produto B', 'Produto C'];
  const plants = ['Planta Sul (Matriz)', 'Planta Norte'];

  let idCounter = 1001;

  // Let's create comprehensive daily records across November 2024
  for (let day = 1; day <= 30; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const date = `2024-11-${dayStr}`;

    for (const line of lines) {
      for (const shift of shifts) {
        const prod = products[(day + line.length + shift.length) % products.length];
        const plant = line === 'Linha E' || line === 'Linha D' ? 'Planta Norte' : 'Planta Sul (Matriz)';

        let planned = 0;
        let produced = 0;
        let defect = 0;
        let availMin = 480; // 8h
        let downMin = 0;

        if (line === 'Linha A') {
          planned = Math.round(480 + (day % 5) * 8);
          produced = Math.round(planned * 0.96);
          defect = Math.round(produced * 0.028);
          downMin = day % 7 === 0 ? 45 : 12;
        } else if (line === 'Linha B') {
          planned = Math.round(420 + (day % 4) * 6);
          produced = Math.round(planned * 0.92);
          defect = Math.round(produced * 0.036);
          downMin = day % 5 === 0 ? 55 : 18;
        } else if (line === 'Linha C') {
          planned = Math.round(390 + (day % 3) * 10);
          produced = Math.round(planned * 0.81);
          defect = Math.round(produced * 0.052);
          downMin = day % 4 === 0 ? 80 : 35;
        } else if (line === 'Linha D') {
          planned = Math.round(200 + (day % 6) * 5);
          produced = Math.round(planned * 0.87);
          defect = Math.round(produced * 0.021);
          downMin = day % 8 === 0 ? 40 : 15;
        } else {
          planned = Math.round(80 + (day % 2) * 4);
          produced = Math.round(planned * 0.95);
          defect = Math.round(produced * 0.014);
          downMin = day % 15 === 0 ? 30 : 5;
        }

        const opMin = availMin - downMin;
        const oee = Math.round(((opMin / availMin) * (produced / planned) * ((produced - defect) / produced)) * 1000) / 10;
        const efficiency = Math.round((opMin / availMin) * 1000) / 10;
        const productivity = Math.round((produced / planned) * 1000) / 10;

        records.push({
          id: `FATO-${idCounter++}`,
          date,
          month: 'Novembro/2024',
          plant,
          lineId: line,
          shift,
          productId: prod,
          plannedUnits: planned,
          producedUnits: produced,
          defectUnits: defect,
          availableMinutes: availMin,
          operatingMinutes: opMin,
          downtimeMinutes: downMin,
          oeePercent: oee,
          productivityPercent: productivity,
          efficiencyPercent: efficiency,
        });
      }
    }
  }

  return records;
}

// Granular stoppage events matching the 17 events of November 2024
export const granularStoppagesNovember: GranularStoppageRecord[] = [
  { id: 'PAR-2401', date: '2024-11-03', month: 'Novembro/2024', plant: 'Planta Sul (Matriz)', lineId: 'Linha C', shift: '1º Turno', reason: 'Mecânica', durationMinutes: 75, rootCause: 'Desgaste prematuro de correia do transportador', correctiveAction: 'Substituição da correia e ajuste de alinhamento', technician: 'Rodrigo Paiva' },
  { id: 'PAR-2402', date: '2024-11-05', month: 'Novembro/2024', plant: 'Planta Sul (Matriz)', lineId: 'Linha B', shift: '2º Turno', reason: 'Setup', durationMinutes: 55, rootCause: 'Troca de matriz para embalagem de 500g', correctiveAction: 'Calibração dos sensores e teste de vácuo', technician: 'Carla Dias' },
  { id: 'PAR-2403', date: '2024-11-07', month: 'Novembro/2024', plant: 'Planta Sul (Matriz)', lineId: 'Linha C', shift: '3º Turno', reason: 'Falta de Material', durationMinutes: 60, rootCause: 'Atraso no abastecimento de bobinas pelo almoxarifado', correctiveAction: 'Acionamento do kanban de emergência', technician: 'José Ferreira' },
  { id: 'PAR-2404', date: '2024-11-09', month: 'Novembro/2024', plant: 'Planta Norte', lineId: 'Linha D', shift: '1º Turno', reason: 'Elétrica', durationMinutes: 45, rootCause: 'Disparo de relé térmico por sobreaquecimento', correctiveAction: 'Limpeza de ventilador do painel e rearme', technician: 'Lucas Martins' },
  { id: 'PAR-2405', date: '2024-11-11', month: 'Novembro/2024', plant: 'Planta Sul (Matriz)', lineId: 'Linha A', shift: '1º Turno', reason: 'Setup', durationMinutes: 40, rootCause: 'Higienização e sanitização programada de bicos', correctiveAction: 'Validação microbiológica e liberação da linha', technician: 'Ana Paula' },
  { id: 'PAR-2406', date: '2024-11-13', month: 'Novembro/2024', plant: 'Planta Sul (Matriz)', lineId: 'Linha C', shift: '2º Turno', reason: 'Mecânica', durationMinutes: 80, rootCause: 'Travamento de engrenagem motora de envase', correctiveAction: 'Desmontagem, substituição de rolamento e lubrificação', technician: 'Rodrigo Paiva' },
  { id: 'PAR-2407', date: '2024-11-15', month: 'Novembro/2024', plant: 'Planta Sul (Matriz)', lineId: 'Linha B', shift: '3º Turno', reason: 'Qualidade', durationMinutes: 40, rootCause: 'Desvio de peso padrão (>2,5% do nominal)', correctiveAction: 'Recalibração de célula de carga e descarte do lote', technician: 'Mariana Duarte' },
  { id: 'PAR-2408', date: '2024-11-17', month: 'Novembro/2024', plant: 'Planta Sul (Matriz)', lineId: 'Linha C', shift: '1º Turno', reason: 'Setup', durationMinutes: 50, rootCause: 'Ajuste de guias para novo tamanho de frasco', correctiveAction: 'Aplicação do método SMED para padronizar gabarito', technician: 'Carla Dias' },
  { id: 'PAR-2409', date: '2024-11-18', month: 'Novembro/2024', plant: 'Planta Norte', lineId: 'Linha E', shift: '2º Turno', reason: 'Mecânica', durationMinutes: 30, rootCause: 'Vazamento de ar comprimido em conexão pneumática', correctiveAction: 'Troca de vedação e reaperto com torquímetro', technician: 'Lucas Martins' },
  { id: 'PAR-2410', date: '2024-11-20', month: 'Novembro/2024', plant: 'Planta Sul (Matriz)', lineId: 'Linha A', shift: '3º Turno', reason: 'Falta de Material', durationMinutes: 45, rootCause: 'Rótulos com código de barras ilegível pelo leitor', correctiveAction: 'Substituição de lote pelo fornecedor homologado', technician: 'José Ferreira' },
  { id: 'PAR-2411', date: '2024-11-22', month: 'Novembro/2024', plant: 'Planta Sul (Matriz)', lineId: 'Linha B', shift: '1º Turno', reason: 'Mecânica', durationMinutes: 40, rootCause: 'Obstrução na esteira de alimentação de tampas', correctiveAction: 'Desobstrução e inspeção de calha vibratória', technician: 'Rodrigo Paiva' },
  { id: 'PAR-2412', date: '2024-11-23', month: 'Novembro/2024', plant: 'Planta Sul (Matriz)', lineId: 'Linha C', shift: '2º Turno', reason: 'Elétrica', durationMinutes: 45, rootCause: 'Falha intermitente em sensor fotoelétrico de presença', correctiveAction: 'Substituição do sensor óptico e reconfiguração de ganho', technician: 'Lucas Martins' },
  { id: 'PAR-2413', date: '2024-11-25', month: 'Novembro/2024', plant: 'Planta Norte', lineId: 'Linha D', shift: '3º Turno', reason: 'Setup', durationMinutes: 50, rootCause: 'Troca de ferramental de selagem térmica', correctiveAction: 'Aquecimento gradual e verificação de perfil de temperatura', technician: 'Carla Dias' },
  { id: 'PAR-2414', date: '2024-11-26', month: 'Novembro/2024', plant: 'Planta Sul (Matriz)', lineId: 'Linha A', shift: '2º Turno', reason: 'Mecânica', durationMinutes: 35, rootCause: 'Folga no acoplamento elástico do motor principal', correctiveAction: 'Ajuste de torque e medição de vibração', technician: 'Rodrigo Paiva' },
  { id: 'PAR-2415', date: '2024-11-28', month: 'Novembro/2024', plant: 'Planta Sul (Matriz)', lineId: 'Linha B', shift: '1º Turno', reason: 'Falta de Material', durationMinutes: 35, rootCause: 'Aguardando validação do lote de matéria-prima pelo CQ', correctiveAction: 'Liberação acelerada de laudo técnico pelo laboratório', technician: 'Mariana Duarte' },
  { id: 'PAR-2416', date: '2024-11-29', month: 'Novembro/2024', plant: 'Planta Norte', lineId: 'Linha D', shift: '2º Turno', reason: 'Qualidade', durationMinutes: 25, rootCause: 'Bolhas na selagem de filme plástico', correctiveAction: 'Ajuste de pressão nos mordentes de corte e selagem', technician: 'Mariana Duarte' },
  { id: 'PAR-2417', date: '2024-11-30', month: 'Novembro/2024', plant: 'Planta Sul (Matriz)', lineId: 'Linha C', shift: '3º Turno', reason: 'Outros', durationMinutes: 25, rootCause: 'Pausa para diálogo diário de segurança (DDS) extraordinário', correctiveAction: 'Reunião de alinhamento com equipe operacional', technician: 'Marcos Souza' },
];

// Dimension tables metadata for Star Schema modeling
export const dimensionTables = {
  dimLinhas: [
    { id_linha: 'L-A', nome: 'Linha A', capacidade_hora: 320, setor: 'Envase Líquidos', ano_instalacao: 2021, responsavel: 'Carlos Mendes' },
    { id_linha: 'L-B', nome: 'Linha B', capacidade_hora: 280, setor: 'Envase Pós', ano_instalacao: 2019, responsavel: 'Renata Silva' },
    { id_linha: 'L-C', nome: 'Linha C', capacidade_hora: 250, setor: 'Rotulagem & Encadernação', ano_instalacao: 2017, responsavel: 'Marcos Souza' },
    { id_linha: 'L-D', nome: 'Linha D', capacidade_hora: 160, setor: 'Empacotamento Automático', ano_instalacao: 2020, responsavel: 'Fernanda Lima' },
    { id_linha: 'L-E', nome: 'Linha E', capacidade_hora: 90, setor: 'Linha Piloto / Especiais', ano_instalacao: 2023, responsavel: 'Thiago Rocha' },
  ],
  dimTurnos: [
    { id_turno: 'T1', nome_turno: '1º Turno', horario_inicio: '06:00', horario_fim: '14:00', supervisor: 'Gilberto Lima' },
    { id_turno: 'T2', nome_turno: '2º Turno', horario_inicio: '14:00', horario_fim: '22:00', supervisor: 'Valéria Costa' },
    { id_turno: 'T3', nome_turno: '3º Turno', horario_inicio: '22:00', horario_fim: '06:00', supervisor: 'Danilo Ramos' },
  ],
  dimProdutos: [
    { id_produto: 'PRD-A', nome_produto: 'Produto A (Industrial Premium)', familia: 'Premium', ciclo_padrao_seg: 11.2, preco_unitario: 42.50 },
    { id_produto: 'PRD-B', nome_produto: 'Produto B (Standard Comercial)', familia: 'Standard', ciclo_padrao_seg: 13.5, preco_unitario: 28.00 },
    { id_produto: 'PRD-C', nome_produto: 'Produto C (Econômico Bulk)', familia: 'Econômico', ciclo_padrao_seg: 17.0, preco_unitario: 18.20 },
  ],
};
