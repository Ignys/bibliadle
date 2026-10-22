import { ArrowDown, ArrowUp, Check, X } from 'lucide-react';
import { motion } from 'motion/react';
import type { BibleReference } from '../data/dailyVerses';
import type { Direction, Guess, Match } from '../lib/game';
import { compareGuess } from '../lib/game';
import { BOOK_BY_ID } from '../data/books';
function Cell({value,direction,label,isBook=false,delay=0}:{value:string|number;direction:Direction|Match;label:string;isBook?:boolean;delay?:number}) {
  const correct=direction==='correct';
  const Icon=correct?Check:direction==='higher'?ArrowUp:direction==='lower'?ArrowDown:X;
  const short=correct?'Certo':direction==='higher'?(isBook?'Mais adiante':'Maior'):direction==='lower'?(isBook?'Mais atrás':'Menor'):'Errado';
  const hint=correct?'Correto':direction==='higher'?'A resposta é maior ou posterior':direction==='lower'?'A resposta é menor ou anterior':'Incorreto';
  const state=correct?'correct':'wrong';
  return <motion.div className={`feedback-cell feedback-${state}`} initial={{opacity:0,rotateX:-70}} animate={{opacity:1,rotateX:0}} transition={{delay,duration:.45,ease:[.2,.7,.2,1]}} title={`${label}: ${hint}`} aria-label={`${label}: ${value}. ${hint}`}>
    <span className="feedback-value">{value}</span>
    <span className="feedback-hint"><Icon size={13} strokeWidth={2.8} aria-hidden/>{short}</span>
  </motion.div>;
}
export function GuessRow({guess,reference,index}:{guess:Guess;reference:BibleReference;index:number}) {
  const result=compareGuess(reference,guess);
  const book=BOOK_BY_ID.get(guess.bookId);
  return <div className="guess-row">
    <Cell label="Livro" isBook value={book?.name??guess.bookId} direction={result.book} delay={0}/>
    <Cell label="Capítulo" value={guess.chapter} direction={result.chapter} delay={.14}/>
    <Cell label="Versículo" value={guess.verse} direction={result.verse} delay={.28}/>
  </div>;
}
