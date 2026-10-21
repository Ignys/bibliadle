import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDown, ArrowRight, ArrowUp, BookOpenText, CalendarDays, Check, CircleHelp, Clock3, Copy, Flame, Info, LoaderCircle, RotateCcw, Send, Share2, Sparkles, Trophy } from 'lucide-react';
import { BookPicker } from './components/BookPicker';
import { GuessRow } from './components/GuessRow';
import { Modal } from './components/Modal';
import { BOOK_BY_ID } from './data/books';
import { fetchVerse } from './lib/bibleApi';
import { compareGuess, dayNumber, formatCountdown, formatReference, getBrazilDay, getDailyReference, getStatistics, isWinningGuess, msToNextBrazilMidnight, type Guess, type Records } from './lib/game';
import { loadRecords, saveRecords } from './lib/storage';

function NumberField({label,value,onChange,placeholder,max,disabled}:{label:string;value:string;onChange:(value:string)=>void;placeholder:string;max:number;disabled?:boolean}){
  return <div className="min-w-0"><label className="field-label" htmlFor={`field-${label}`}>{label}</label><div className="field-control"><input id={`field-${label}`} className="field-input number-input" type="number" inputMode="numeric" min={1} max={max} step={1} placeholder={placeholder} value={value} disabled={disabled} onChange={event=>onChange(event.target.value)}/></div></div>;
}
function IntroRule({emoji,title,text}:{emoji:string;title:string;text:string}){
  return <div className="intro-rule"><div className="intro-rule-symbol">{emoji}</div><div><b>{title}</b><p>{text}</p></div></div>;
}
export default function App(){
  const [day,setDay]=useState(getBrazilDay);
  const [now,setNow]=useState(()=>new Date());
  const [records,setRecords]=useState<Records>(loadRecords);
  const [bookId,setBookId]=useState('');
  const [chapter,setChapter]=useState('');
  const [verse,setVerse]=useState('');
  const [verseText,setVerseText]=useState('');
  const [loading,setLoading]=useState(true);
  const [verseError,setVerseError]=useState('');
  const [retry,setRetry]=useState(0);
  const [formError,setFormError]=useState('');
  const [helpOpen,setHelpOpen]=useState(false);
  const [statsOpen,setStatsOpen]=useState(false);
  const [copied,setCopied]=useState(false);
  const reference=useMemo(()=>getDailyReference(day),[day]);
  const record=records[day]??{date:day,guesses:[],completed:false};
  const {guesses,completed}=record;
  const stats=useMemo(()=>getStatistics(records),[records]);
  const challengeNo=dayNumber(day)-dayNumber('2026-01-01')+1;
  const friendlyDate=new Date(`${day}T12:00:00Z`).toLocaleDateString('pt-BR',{day:'numeric',month:'long',timeZone:'UTC'});
  const selectedBook=BOOK_BY_ID.get(bookId);
  const disabled=completed||loading||!!verseError;
  const solvedReference=formatReference(reference);

  useEffect(()=>{saveRecords(records);},[records]);
  useEffect(()=>{const id=window.setInterval(()=>{const date=new Date();setNow(date);setDay(old=>{const next=getBrazilDay(date);return old===next?old:next;});},1000);return()=>window.clearInterval(id);},[]);
  useEffect(()=>{
    setBookId('');setChapter('');setVerse('');setFormError('');setCopied(false);
    setLoading(true);setVerseText('');setVerseError('');
    const controller=new AbortController();
    fetchVerse(reference,controller.signal).then(text=>{setVerseText(text);setLoading(false);}).catch((error:unknown)=>{if(controller.signal.aborted)return;setVerseError(error instanceof Error?error.message:'Falha ao buscar o versículo.');setLoading(false);});
    return()=>controller.abort();
  },[reference,retry]);

  function submitGuess(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setFormError('');
    if(disabled)return;
    const book=BOOK_BY_ID.get(bookId),c=Number(chapter),v=Number(verse);
    if(!book)return setFormError('Selecione um livro da Bíblia para continuar.');
    if(!Number.isInteger(c)||c<1||c>book.chapters)return setFormError(`O livro de ${book.name} possui ${book.chapters} capítulo(s).`);
    if(!Number.isInteger(v)||v<1||v>176)return setFormError('Informe um número de versículo entre 1 e 176.');
    if(guesses.some(g=>g.bookId===bookId&&g.chapter===c&&g.verse===v))return setFormError('Você já tentou essa referência. Escolha outra!');
    const guess:Guess={id:`${Date.now()}-${guesses.length}`,bookId,chapter:c,verse:v};
    const winner=isWinningGuess(reference,guess);
    setRecords(current=>{const before=current[day]??{date:day,guesses:[],completed:false};if(before.completed)return current;return {...current,[day]:{...before,guesses:[...before.guesses,guess],completed:winner}};});
    setBookId('');setChapter('');setVerse('');
  }
  async function shareResult(){
    if(!guesses.length)return;
    const grid=guesses.map(g=>{const result=compareGuess(reference,g);return [result.book,result.chapter,result.verse].map(x=>x==='correct'?'🟩':'🟥').join('');}).join('\n');
    const message=`Bibliadle #${challengeNo} 📖\n${completed?`Resolvido em ${guesses.length} tentativa${guesses.length===1?'':'s'}!`:`${guesses.length} tentativas até agora`}\n\n${grid}\n\n${window.location.origin}`;
    try{if(navigator.share&&/Android|iPhone|iPad/i.test(navigator.userAgent)){await navigator.share({text:message,title:'Bibliadle'});}else{await navigator.clipboard.writeText(message);setCopied(true);}}catch{/* cancelamento não é sucesso */}
  }
  return <div className="app-shell">
    <div className="ambient ambient-one" aria-hidden/><div className="ambient ambient-two" aria-hidden/>
    <header className="site-header page-container"><div className="brand" aria-label="Bibliadle"><div className="brand-mark"><BookOpenText size={23}/></div><div className="brand-name">bibl<span>iadle</span><i>.</i></div></div><nav className="nav-actions" aria-label="Menu principal"><button type="button" className="header-action" onClick={()=>setHelpOpen(true)}><CircleHelp size={18}/><span>Como jogar</span></button><button type="button" className="header-action" onClick={()=>setStatsOpen(true)}><Trophy size={18}/><span>Estatísticas</span></button></nav></header>
    <main className="page-container main-content">
      <motion.section className="hero-section" initial={{opacity:0,y:13}} animate={{opacity:1,y:0}} transition={{duration:.55}}>
        <div className="eyebrow"><span className="live-dot"/> UM NOVO DESAFIO TODOS OS DIAS <span className="eyebrow-line"/></div>
        <h1>Conhece a Palavra?<br/><em>Prove que sim.</em></h1>
        <p className="hero-description">Um versículo. Três respostas. Descubra onde está escrito e coloque seu conhecimento bíblico à prova.</p>
        <div className="hero-meta"><span className="meta-pill"><CalendarDays size={15}/>{friendlyDate}</span><span className="meta-pill">Desafio <strong>#{challengeNo}</strong></span><span className="meta-pill subdued"><Clock3 size={15}/>{formatCountdown(msToNextBrazilMidnight(now))} para o próximo</span></div>
      </motion.section>
      <motion.section className="verse-card" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.12,duration:.55}} aria-label="Versículo do dia">
        <div className="card-watermark" aria-hidden>“</div><div className="verse-card-top"><span className="card-kicker"><Sparkles size={14}/> VERSÍCULO DO DIA</span><span className="card-edition">ALMEIDA 1819</span></div>
        <div className="verse-text-container" aria-live="polite">{loading?<div className="loading-verse"><LoaderCircle size={24} className="animate-spin"/> Abrindo as Escrituras...</div>:verseError?<div className="verse-error"><Info size={21}/><span>{verseError}</span><button type="button" onClick={()=>setRetry(n=>n+1)}><RotateCcw size={15}/> Tentar novamente</button></div>:<motion.blockquote key={day} className="verse-quote" initial={{opacity:0}} animate={{opacity:1}}>{verseText}</motion.blockquote>}</div>
        <div className="verse-card-bottom"><div className="verse-bottom-line"/><span>{completed?solvedReference:'QUAL É A REFERÊNCIA?'}</span><div className="verse-bottom-line"/></div>
      </motion.section>
      <div className="game-layout">
        <section className="guess-section" aria-labelledby="guess-heading"><div className="section-header"><div className="section-symbol"><BookOpenText size={19}/></div><div><h2 id="guess-heading">Sua tentativa</h2><p>Preencha a referência que corresponde ao texto acima.</p></div></div>
          {completed?<motion.div className="winner-panel" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}><div className="winner-icon"><Trophy size={28}/></div><h3>Resposta certa!</h3><p>Você encontrou <strong>{solvedReference}</strong> em {guesses.length} tentativa{guesses.length===1?'':'s'}.</p><button type="button" className="primary-button share-winner" onClick={shareResult}>{copied?<Check size={18}/>:<Share2 size={18}/>} {copied?'Copiado!':'Compartilhar resultado'}</button><span>Volte amanhã para um novo versículo.</span></motion.div>
          :<form onSubmit={submitGuess} className="guess-form" noValidate><div className="guess-inputs"><BookPicker key={guesses.length} value={bookId} onChange={setBookId} disabled={disabled}/><NumberField label="Capítulo" value={chapter} onChange={setChapter} placeholder="Ex.: 3" max={selectedBook?.chapters??150} disabled={disabled}/><NumberField label="Versículo" value={verse} onChange={setVerse} placeholder="Ex.: 16" max={176} disabled={disabled}/></div>
            <AnimatePresence>{formError&&<motion.p role="alert" className="form-error" initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}} exit={{opacity:0}}>{formError}</motion.p>}</AnimatePresence>
            <button type="submit" className="primary-button" disabled={disabled}>Enviar tentativa <ArrowRight size={19}/></button><p className="form-tip"><Info size={14}/> Não sabe? Use as setas nas tentativas para se aproximar.</p>
          </form>}
        </section>
        <aside className="how-panel" aria-labelledby="how-heading"><div className="how-top"><h2 id="how-heading">Como funciona</h2><CircleHelp size={18}/></div><p>As cores e as setas vão te guiar até a resposta certa.</p><div className="how-legend">
          <div className="legend-row"><span className="legend-square right"><Check size={17}/></span><span><strong>Verde</strong><small>Você acertou!</small></span></div>
          <div className="legend-row"><span className="legend-square wrong"><ArrowUp size={18}/></span><span><strong>Seta para cima</strong><small>É maior ou vem depois.</small></span></div>
          <div className="legend-row"><span className="legend-square wrong"><ArrowDown size={18}/></span><span><strong>Seta para baixo</strong><small>É menor ou vem antes.</small></span></div></div>
          <div className="how-note"><Sparkles size={15}/>Livro, capítulo e versículo são avaliados separadamente.</div>
        </aside>
      </div>
      <section className="history-section" aria-labelledby="history-heading"><div className="history-title-row"><div className="section-header compact"><div className="section-symbol"><Send size={18}/></div><div><h2 id="history-heading">Suas tentativas</h2><p>Continue até encontrar a referência.</p></div></div><div className="guess-count">{guesses.length} tentativa{guesses.length===1?'':'s'}</div></div>
        <div className="history-table-head"><span>#</span><span>LIVRO</span><span>CAPÍTULO</span><span>VERSÍCULO</span></div>
        <div className="guess-history" aria-live="polite">{guesses.length?[...guesses].reverse().map((guess,reverseIndex)=><GuessRow key={guess.id} guess={guess} reference={reference} index={guesses.length-reverseIndex-1}/>):<div className="history-empty"><div className="empty-illustration"><BookOpenText size={29} strokeWidth={1.3}/></div><strong>Uma página em branco...</strong><p>Envie sua primeira tentativa para começar a desvendar o versículo de hoje.</p></div>}</div>
        {guesses.length>0&&!completed&&<button className="secondary-share" type="button" onClick={shareResult}><Share2 size={15}/> {copied?'Copiado!':'Compartilhar progresso'}</button>}
      </section>
      <section className="daily-closer" aria-label="Mensagem de rodapé"><div className="closer-line"/><span><Sparkles size={14}/> A SUA PALAVRA É LÂMPADA PARA OS MEUS PÉS <Sparkles size={14}/></span><div className="closer-line"/></section>
    </main>
    <footer className="site-footer page-container"><span>© {new Date().getFullYear()} Bibliadle · Feito para quem ama as Escrituras.</span><span>Texto bíblico: <a href="https://github.com/midvash/bible-data" target="_blank" rel="noreferrer">Almeida 1819 (domínio público)</a></span></footer>
    <Modal title="Como jogar" open={helpOpen} onClose={()=>setHelpOpen(false)}><div className="modal-body"><p className="modal-intro">Encontre a referência do versículo exibido. Você tem quantas tentativas precisar.</p><IntroRule emoji="📖" title="Escolha o livro" text="Selecione um dos 66 livros da Bíblia, na ordem do cânon protestante."/><IntroRule emoji="🔢" title="Informe capítulo e versículo" text="Cada parte da referência recebe uma indicação separada."/><IntroRule emoji="🎯" title="Siga as pistas" text="Verde significa acerto. Vermelho com ↑ aponta para valores maiores ou livros posteriores; ↓ aponta para menores ou anteriores."/><div className="modal-tip"><Info size={17}/> Um novo desafio aparece todos os dias à meia-noite, no horário de Brasília. Seu progresso fica salvo neste navegador.</div></div><button className="primary-button modal-button" type="button" onClick={()=>setHelpOpen(false)}>Entendi, vamos jogar <ArrowRight size={17}/></button></Modal>
    <Modal title="Suas estatísticas" open={statsOpen} onClose={()=>setStatsOpen(false)}><div className="stats-grid"><div className="stat-box"><strong>{stats.played}</strong><span>Jogados</span></div><div className="stat-box"><strong>{stats.winRate}%</strong><span>Vitórias</span></div><div className="stat-box"><strong><Flame size={20}/> {stats.currentStreak}</strong><span>Sequência</span></div><div className="stat-box"><strong>{stats.bestStreak}</strong><span>Recorde</span></div></div><div className="stats-extra"><span>Média de tentativas nas vitórias</span><b>{stats.averageGuesses}</b></div><div className="stats-daily"><CalendarDays size={17}/><span>Próximo desafio em <b>{formatCountdown(msToNextBrazilMidnight(now))}</b></span></div><p className="stats-note">As estatísticas são armazenadas apenas neste dispositivo. Não é necessário criar conta.</p>{guesses.length>0&&<button type="button" className="primary-button modal-button" onClick={shareResult}><Copy size={17}/> {copied?'Resultado copiado!':'Compartilhar resultado'}</button>}</Modal>
  </div>;
}
