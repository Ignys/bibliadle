import { dayNumber, type Records } from './game';

export const FIRST_CHALLENGE_DAY = '2026-01-01';
const DAY_MS = 86_400_000;
const DAY_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDay(day: string): boolean {
  if (!DAY_FORMAT.test(day)) return false;
  const parsed = Date.parse(`${day}T00:00:00Z`);
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === day;
}

export function isAvailableDay(day: string, today: string): boolean {
  return isValidDay(day) && day >= FIRST_CHALLENGE_DAY && day <= today;
}

export function getChallengeNumber(day: string): number {
  return dayNumber(day) - dayNumber(FIRST_CHALLENGE_DAY) + 1;
}

export function shiftDay(day: string, offset: number): string {
  return new Date((dayNumber(day) + offset) * DAY_MS).toISOString().slice(0, 10);
}

export function getDayFromUrl(today: string, search: string): string {
  const requested = new URLSearchParams(search).get('data') ?? '';
  return isAvailableDay(requested, today) ? requested : today;
}

export function getMonthGrid(month: string): Array<string | null> {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return [];
  const first = new Date(`${month}-01T00:00:00Z`);
  const mondayOffset = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  return [
    ...Array<null>(mondayOffset).fill(null),
    ...Array.from({ length: days }, (_, index) => `${month}-${String(index + 1).padStart(2, '0')}`),
  ];
}

export function shiftMonth(month: string, offset: number): string {
  const [year, monthIndex] = month.split('-').map(Number);
  return new Date(Date.UTC(year, monthIndex - 1 + offset, 1)).toISOString().slice(0, 7);
}

export type ArchiveStatus = 'completed' | 'started' | 'not-played';
export function getArchiveStatus(records: Records, day: string): ArchiveStatus {
  const record = records[day];
  return record?.completed ? 'completed' : record?.guesses.length ? 'started' : 'not-played';
}
