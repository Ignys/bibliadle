import { BOOK_BY_ID, bookOrder } from '../data/books';
import { DAILY_VERSES, type BibleReference } from '../data/dailyVerses';
export interface Guess extends BibleReference { id: string }
export type Direction = 'correct' | 'higher' | 'lower';
export type Match = 'correct' | 'wrong';
export interface Feedback { book: Direction; chapter: Direction; verse: Direction }
export interface GameRecord { date: string; guesses: Guess[]; completed: boolean }
export type Records = Record<string, GameRecord>;
const FORMATTER = new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'});
export function getBrazilDay(now = new Date()) {
  const parts = FORMATTER.formatToParts(now);
  const find = (type: string) => parts.find(part=>part.type===type)?.value??'';
  return `${find('year')}-${find('month')}-${find('day')}`;
}
export const dayNumber = (day: string) => Math.floor(Date.parse(`${day}T00:00:00Z`)/86400000);
/** 71 é coprimo com o total de passagens (411): nenhum desafio se repete dentro de um ciclo, que começa em 2025-01-01. */
export function getDailyReference(day: string): BibleReference {
  const n=DAILY_VERSES.length, elapsed=dayNumber(day)-dayNumber('2025-01-01');
  const cycle=Math.floor(elapsed/n), pos=((elapsed%n)+n)%n;
  return DAILY_VERSES[((pos*71+cycle*29)%n+n)%n];
}
function compareNumber(answer:number, guess:number):Direction { return answer===guess?'correct':answer>guess?'higher':'lower'; }
export function compareGuess(answer:BibleReference,guess:BibleReference):Feedback {
  return {book:compareNumber(bookOrder(answer.bookId),bookOrder(guess.bookId)),chapter:compareNumber(answer.chapter,guess.chapter),verse:compareNumber(answer.verse,guess.verse)};
}
export const isWinningGuess=(a:BibleReference,b:BibleReference)=>a.bookId===b.bookId&&a.chapter===b.chapter&&a.verse===b.verse;
export const formatReference=(ref:BibleReference)=>`${BOOK_BY_ID.get(ref.bookId)?.name??ref.bookId} ${ref.chapter}:${ref.verse}`;
export function getStatistics(records:Records) {
  const played=Object.values(records).filter(record=>record.guesses.length>0).sort((a,b)=>a.date.localeCompare(b.date));
  const won=played.filter(record=>record.completed);
  let longest=0,streak=0,last:number|null=null;
  for(const record of won) { const day=dayNumber(record.date); streak=last!==null&&day===last+1?streak+1:1; longest=Math.max(streak,longest);last=day; }
  const today=dayNumber(getBrazilDay());
  return {played:played.length,wins:won.length,winRate:played.length?Math.round(won.length/played.length*100):0,currentStreak:last!==null&&last>=today-1?streak:0,bestStreak:longest,averageGuesses:won.length?(won.reduce((sum,record)=>sum+record.guesses.length,0)/won.length).toFixed(1):'—'};
}
export function msToNextBrazilMidnight(now=new Date()) { const next=Date.parse(`${getBrazilDay(now)}T03:00:00Z`)+86400000;return Math.max(0,next-now.getTime()); }
export function formatCountdown(ms:number) {const seconds=Math.floor(ms/1000);return `${String(Math.floor(seconds/3600)).padStart(2,'0')}:${String(Math.floor(seconds%3600/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}
