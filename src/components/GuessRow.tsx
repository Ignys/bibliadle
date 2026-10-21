import { ArrowDown, ArrowUp, Check } from 'lucide-react';
import { motion } from 'motion/react';
import type { BibleReference } from '../data/dailyVerses';
import type { Direction, Guess } from '../lib/game';
import { compareGuess } from '../lib/game';
import { BOOK_BY_ID } from '../data/books';
function Cell({value,direction,label,delay=0}:{value:string|number;direction:Direction;label:string;delay?:number}) {
  const correct=direction==='correct';
  const Icon=correct?Check:direction==='higher'?ArrowUp:ArrowDown;
  const hint=correct?'Correto':direction==='higher'?'A resposta é maior ou posterior':'A resposta é menor ou anterior';
  return <motion.div className={`feedback-cell ${correct?'feedback-correct':'feedback-wrong'}`} initial={{opacity:0,y:10,scale:.95}} animate={{opacity:1,y:0,scale:1}} transition={{delay,type:'spring',stiffness:280,damping:22}} title={`${label}: ${hint}`} aria-label={`${label}: ${value}. ${hint}`}><span className="feedback-value">{value}</span><Icon size={18} strokeWidth={2.8} className="feedback-icon" aria-hidden/></motion.div>;
}
export function GuessRow({guess,reference,index}:{guess:Guess;reference:BibleReference;index:number}) {
  const result=compareGuess(reference,guess);
  return <div className="guess-row"><div className="guess-number" aria-label={`Tentativa ${index+1}`}>{String(index+1).padStart(2,'0')}</div>
    <Cell label="Livro" value={BOOK_BY_ID.get(guess.bookId)?.name??guess.bookId} direction={result.book} delay={.04}/>
    <Cell label="Capítulo" value={guess.chapter} direction={result.chapter} delay={.12}/>
    <Cell label="Versículo" value={guess.verse} direction={result.verse} delay={.2}/>
  </div>;
}
