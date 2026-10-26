/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MonthKey =
  | 'Jan'
  | 'Fev'
  | 'Mar'
  | 'Abr'
  | 'Mai'
  | 'Jun'
  | 'Jul'
  | 'Ago'
  | 'Set'
  | 'Out'
  | 'Nov'
  | 'Dez';

export interface MonthlyProductionStat {
  month: MonthKey;
  monthFullName: string;
  volume: number;
  oee: number;
  stoppages: number;
  productivity: number;
  losses: number;
  efficiency: number;
}

export interface LineStat {
  lineId: string;
  name: string;
  volume: number;
  losses: number; // percentage e.g. 5.2%
  efficiency: number; // e.g. 72.4%
  oee: number; // e.g. 65.1%
  targetVolume: number;
  stoppages: number;
  supervisor: string;
}

export interface StoppageReasonStat {
  reason: string;
  percentage: number;
  count: number;
  durationMinutes: number;
  color: string;
}

export interface ShiftStat {
  shift: string;
  volume: number;
  percentage: number;
  efficiency: number;
  oee: number;
}

export interface ProductStat {
  product: string;
  percentage: number;
  volume: number;
  scrapUnits: number;
}

export interface ProductionStatusStat {
  status: string;
  percentage: number;
  color: string;
}

export interface FilterState {
  month: string;
  plant: string;
  line: string;
  shift: string;
}

export interface GranularProductionRecord {
  id: string;
  date: string;
  month: string;
  plant: string;
  lineId: string;
  shift: string;
  productId: string;
  plannedUnits: number;
  producedUnits: number;
  defectUnits: number;
  availableMinutes: number;
  operatingMinutes: number;
  downtimeMinutes: number;
  oeePercent: number;
  productivityPercent: number;
  efficiencyPercent: number;
}

export interface GranularStoppageRecord {
  id: string;
  date: string;
  month: string;
  plant: string;
  lineId: string;
  shift: string;
  reason: 'Mecânica' | 'Setup' | 'Falta de Material' | 'Elétrica' | 'Qualidade' | 'Outros';
  durationMinutes: number;
  rootCause: string;
  correctiveAction: string;
  technician: string;
}
