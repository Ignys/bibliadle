import { describe, expect, it } from 'vitest';
import { getArchiveStatus, getChallengeNumber, getDayFromUrl, getMonthGrid, isAvailableDay, isValidDay, shiftDay, shiftMonth } from '../src/lib/archive';
import { getDailyReference, type Records } from '../src/lib/game';

describe('arquivo de desafios', () => {
  const today = '2026-10-21';

  it('preserva a numeração iniciada em janeiro, inclusive o desafio #294', () => {
    expect(getChallengeNumber('2026-01-01')).toBe(1);
    expect(getChallengeNumber('2026-10-20')).toBe(293);
    expect(getChallengeNumber(today)).toBe(294);
  });

  it('permite apenas datas reais, desde a estreia até hoje', () => {
    expect(isAvailableDay('2026-01-01', today)).toBe(true);
    expect(isAvailableDay('2026-10-20', today)).toBe(true);
    expect(isAvailableDay('2025-12-31', today)).toBe(false);
    expect(isAvailableDay('2026-10-22', today)).toBe(false);
    expect(isValidDay('2026-02-30')).toBe(false);
    expect(isValidDay('2026-13-01')).toBe(false);
  });

  it('aceita links para desafios anteriores e rejeita links para o futuro', () => {
    expect(getDayFromUrl(today, '?data=2026-09-04')).toBe('2026-09-04');
    expect(getDayFromUrl(today, '?data=2026-10-22')).toBe(today);
    expect(getDayFromUrl(today, '?data=2026-02-30')).toBe(today);
  });

  it('navega dias e meses atravessando viradas de calendário', () => {
    expect(shiftDay('2026-03-01', -1)).toBe('2026-02-28');
    expect(shiftDay('2026-12-31', 1)).toBe('2027-01-01');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
  });

  it('gera calendário com semanas começando na segunda e todos os dias do mês', () => {
    const january = getMonthGrid('2026-01');
    expect(january.slice(0, 3)).toEqual([null, null, null]);
    expect(january[3]).toBe('2026-01-01');
    expect(january.filter(Boolean)).toHaveLength(31);
    expect(getMonthGrid('2026-02').filter(Boolean)).toHaveLength(28);
    expect(getMonthGrid('2026-13')).toEqual([]);
  });

  it('distingue jogos concluídos, iniciados e novos', () => {
    const records: Records = {
      '2026-10-19': { date: '2026-10-19', completed: true, guesses: [{ id: '1', bookId: 'john', chapter: 3, verse: 16 }] },
      '2026-10-20': { date: '2026-10-20', completed: false, guesses: [{ id: '2', bookId: 'genesis', chapter: 1, verse: 1 }] },
    };
    expect(getArchiveStatus(records, '2026-10-19')).toBe('completed');
    expect(getArchiveStatus(records, '2026-10-20')).toBe('started');
    expect(getArchiveStatus(records, '2026-10-21')).toBe('not-played');
  });

  it('mantém a referência diária existente ao navegar pelo arquivo', () => {
    const original = getDailyReference('2026-10-20');
    expect(getDailyReference('2026-10-20')).toEqual(original);
    expect(getDailyReference('2026-10-21')).not.toEqual(original);
  });
});
