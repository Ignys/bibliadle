import { describe, expect, it } from 'vitest';
import { BOOKS } from '../src/data/books';
import { DAILY_VERSES } from '../src/data/dailyVerses';
import { compareGuess, getBrazilDay, getDailyReference, isWinningGuess } from '../src/lib/game';

describe('dados e regras bíblicas',()=>{
  it('possui os 66 livros e 411 referências válidas',()=>{
    expect(BOOKS).toHaveLength(66);
    expect(DAILY_VERSES).toHaveLength(411);
    for(const verse of DAILY_VERSES){
      const book=BOOKS.find(book=>book.id===verse.bookId);
      expect(book).toBeDefined();
      expect(verse.chapter).toBeGreaterThan(0);
      expect(verse.chapter).toBeLessThanOrEqual(book!.chapters);
      expect(verse.verse).toBeGreaterThan(0);
    }
  });
  it('não repete uma referência dentro do ciclo de 411 dias',()=>{
    const start=Date.parse('2025-01-01T00:00:00Z'),set=new Set<string>();
    for(let i=0;i<DAILY_VERSES.length;i++){
      const date=new Date(start+i*86400000).toISOString().slice(0,10);
      const ref=getDailyReference(date);
      set.add(`${ref.bookId}:${ref.chapter}:${ref.verse}`);
    }
    expect(set.size).toBe(DAILY_VERSES.length);
  });
  it('reconhece meia-noite em Brasília',()=>{
    expect(getBrazilDay(new Date('2026-10-22T02:30:00Z'))).toBe('2026-10-21');
    expect(getBrazilDay(new Date('2026-10-22T03:00:00Z'))).toBe('2026-10-22');
  });
  it('compara livros pela ordem bíblica e números independentemente',()=>{
    expect(compareGuess({bookId:'john',chapter:3,verse:16},{bookId:'genesis',chapter:4,verse:16})).toEqual({book:'higher',chapter:'lower',verse:'correct'});
  });
  it('só vence com os 3 campos corretos',()=>{
    const verse={bookId:'john',chapter:3,verse:16};
    expect(isWinningGuess(verse,{...verse,verse:15})).toBe(false);
    expect(isWinningGuess(verse,verse)).toBe(true);
  });
});
