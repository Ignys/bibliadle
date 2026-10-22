import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, BookOpenText, CalendarDays, Check, ChevronLeft, ChevronRight, CircleHelp, Copy, Flame, History, Info, LoaderCircle, RotateCcw, Send, Share2, Sparkles, Trophy } from 'lucide-react';
import { ArchiveModal } from './components/ArchiveModal';
import { BookPicker } from './components/BookPicker';
import { GuessRow } from './components/GuessRow';
import { Modal } from './components/Modal';
import { BOOK_BY_ID } from './data/books';
import { TRANSLATIONS, fetchVerse, type TranslationId } from './lib/bibleApi';
import { compareGuess, formatCountdown, formatReference, getBrazilDay, getDailyReference, getStatistics, isWinningGuess, msToNextBrazilMidnight, type Guess, type Records } from './lib/game';
import { loadRecords, loadTranslation, saveRecords, saveTranslation } from './lib/storage';
import { getChallengeNumber, getDayFromUrl, isAvailableDay, shiftDay, FIRST_CHALLENGE_DAY } from './lib/archive';

function NumberField({label,value,onChange,placeholder,max,disabled}:{label:string;value:string;onChange:(value:string)=>void;placeholder:string;max:number;disabled?:boolean}){
  return <div className="min-w-0"><label className="field-label" htmlFor={`field-${label}`}>{label}</label><div className="field-control"><input id={`field-${label}`} className="field-input number-input" type="number" inputMode="numeric" min={1} max={max} step={1} placeholder={placeholder} value={value} disabled={disabled} onChange={event=>onChange(event.target.value)}/></div></div>;
}
function IntroRule({emoji,title,text}:{emoji:string;title:string;text:string}){
  return <div className="intro-rule"><div className="intro-rule-symbol">{emoji}</div><div><b>{title}</b><p>{text}</p></div></div>;
}
export default function App(){
  const [day,setDay]=useState(()=>getDayFromUrl(getBrazilDay(),window.location.search));
  const [now,setNow]=useState(()=>new Date());
  const [records,setRecords]=useState<Records>(loadRecords);
  const [translation,setTranslation]=useState<TranslationId>(loadTranslation);
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
  const [archiveOpen,setArchiveOpen]=useState(false);
  const [copied,setCopied]=useState(false);
  const today=getBrazilDay(now);
  const previousToday=useRef(today);
  const reference=useMemo(()=>getDailyReference(day),[day]);
  const record=records[day]??{date:day,guesses:[],completed:false};
  const {guesses,completed}=record;
  const stats=useMemo(()=>getStatistics(records),[records]);
  const challengeNo=getChallengeNumber(day);
  const isToday=day===today;
  const previousDay=shiftDay(day,-1);
  const followingDay=shiftDay(day,1);
  const friendlyDate=new Date(`${day}T12:00:00Z`).toLocaleDateString('pt-BR',{day:'numeric',month:'long',timeZone:'UTC'});
  const selectedBook=BOOK_BY_ID.get(bookId);
  const disabled=completed||loading||!!verseError;
  const solvedReference=formatReference(reference);

  useEffect(()=>{saveRecords(records);},[records]);
  useEffect(()=>{saveTranslation(translation);},[translation]);
  useEffect(()=>{const id=window.setInterval(()=>setNow(new Date()),1000);return()=>window.clearInterval(id);},[]);
  useEffect(()=>{
    const previous=previousToday.current;
    if(today!==previous){
      previousToday.current=today;
      if(day===previous){setDay(today);window.history.replaceState(null,'',window.location.pathname+window.location.hash);}
    }
  },[day,today]);
  useEffect(()=>{
    const onPopState=()=>setDay(getDayFromUrl(getBrazilDay(),window.location.search));
    window.addEventListener('popstate',onPopState);
    return()=>window.removeEventListener('popstate',onPopState);
  },[]);
  function navigateToDay(date:string){
    if(!isAvailableDay(date,today))return;
    const url=new URL(window.location.href);
    if(date===today)url.searchParams.delete('data');else url.searchParams.set('data',date);
    window.history.pushState(null,'',url.pathname+url.search+url.hash);
    setDay(date);
    setArchiveOpen(false);
  }
  useEffect(()=>{
    setLoading(true);setVerseText('');setVerseError('');
    const controller=new AbortController();
    fetchVerse(reference,translation,controller.signal).then(text=>{setVerseText(text);setLoading(false);}).catch((error:unknown)=>{if(controller.signal.aborted)return;setVerseError(error instanceof Error?error.message:'Falha ao buscar o versículo.');setLoading(false);});
    return()=>controller.abort();
  },[reference,translation,retry]);
  useEffect(()=>{setBookId('');setChapter('');setVerse('');setFormError('');setCopied(false);},[reference]);

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
    const shareUrl=new URL(window.location.href);
    if(isToday)shareUrl.searchParams.delete('data');else shareUrl.searchParams.set('data',day);
    const message=`Bibliadle #${challengeNo} 📖\n${completed?`Resolvido em ${guesses.length} tentativa${guesses.length===1?'':'s'}!`:`${guesses.length} tentativas até agora`}\n\n${grid}\n\n${shareUrl.toString()}`;
    try{if(navigator.share&&/Android|iPhone|iPad/i.test(navigator.userAgent)){await navigator.share({text:message,title:'Bibliadle'});}else{await navigator.clipboard.writeText(message);setCopied(true);}}catch{/* cancelamento não é sucesso */}
  }
  return <div className="app-shell">
    <div className="ambient ambient-one" aria-hidden/><div className="ambient ambient-two" aria-hidden/>
    <header className="site-header page-container"><div className="brand" aria-label="Bibliadle"><div className="brand-mark"><BookOpenText size={23}/></div><div className="brand-name">bibl<span>iadle</span><i>.</i></div></div><nav className="nav-actions" aria-label="Menu principal"><button type="button" className="header-action" onClick={()=>setArchiveOpen(true)}><History size={18}/><span>Arquivo</span></button><button type="button" className="header-action" onClick={()=>setHelpOpen(true)}><CircleHelp size={18}/><span>Como jogar</span></button><button type="button" className="header-action" onClick={()=>setStatsOpen(true)}><Trophy size={18}/><span>Estatísticas</span></button></nav></header>
    <main className="page-container main-content">
      <section className="day-navigation" aria-label="Navegação entre desafios"><button type="button" className="day-nav-button" onClick={()=>navigateToDay(previousDay)} disabled={day===FIRST_CHALLENGE_DAY}><ChevronLeft size={17}/> Anterior</button><button type="button" className="day-nav-calendar" onClick={()=>setArchiveOpen(true)}><CalendarDays size={17}/> #{challengeNo} · {friendlyDate}</button><button type="button" className="day-nav-button" onClick={()=>navigateToDay(followingDay)} disabled={isToday}>Próximo <ChevronRight size={17}/></button></section>
      {!isToday&&<button type="button" className="today-shortcut" onClick={()=>navigateToDay(today)}>Voltar ao desafio de hoje <ArrowRight size={14}/></button>}
      <motion.section className="verse-plain" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.12,duration:.55}} aria-label="Versículo do dia">
        <div className="verse-text-container" aria-live="polite">{loading?<div className="loading-verse"><LoaderCircle size={24} className="animate-spin"/> Abrindo as Escrituras...</div>:verseError?<div className="verse-error"><Info size={21}/><span>{verseError}</span><button type="button" onClick={()=>setRetry(n=>n+1)}><RotateCcw size={15}/> Tentar novamente</button></div>:<motion.blockquote key={day} className="verse-quote" initial={{opacity:0}} animate={{opacity:1}}>{verseText}</motion.blockquote>}</div>
        <div className="verse-translation"><label htmlFor="translation-select">Tradução</label><select id="translation-select" value={translation} onChange={event=>setTranslation(event.target.value as TranslationId)}>{TRANSLATIONS.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
      </motion.section>
      <div className="game-layout">
        <section className="guess-section" aria-label="Sua tentativa">
          {completed?<motion.div className="winner-panel" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}><div className="winner-icon"><Trophy size={28}/></div><h3>Resposta certa!</h3><p>Você encontrou <strong>{solvedReference}</strong> em {guesses.length} tentativa{guesses.length===1?'':'s'}.</p><button type="button" className="primary-button share-winner" onClick={shareResult}>{copied?<Check size={18}/>:<Share2 size={18}/>} {copied?'Copiado!':'Compartilhar resultado'}</button><span>{isToday?'Volte amanhã para um novo versículo.':'Você pode continuar jogando outras edições no arquivo.'}</span></motion.div>
          :<form onSubmit={submitGuess} className="guess-form" noValidate><div className="guess-inputs"><BookPicker key={guesses.length} value={bookId} onChange={setBookId} disabled={disabled}/><NumberField label="Capítulo" value={chapter} onChange={setChapter} placeholder="Ex.: 3" max={selectedBook?.chapters??150} disabled={disabled}/><NumberField label="Versículo" value={verse} onChange={setVerse} placeholder="Ex.: 16" max={176} disabled={disabled}/><button type="submit" className="primary-button submit-icon" disabled={disabled} aria-label="Enviar tentativa"><Send size={19}/></button></div>
            <AnimatePresence>{formError&&<motion.p role="alert" className="form-error" initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}} exit={{opacity:0}}>{formError}</motion.p>}</AnimatePresence>
          </form>}
        </section>
      </div>
      <section className="history-section" aria-label="Suas tentativas">
        <div className="guess-history" aria-live="polite">{[...guesses].reverse().map((guess,reverseIndex)=><GuessRow key={guess.id} guess={guess} reference={reference} index={guesses.length-reverseIndex-1}/>)}</div>
        {guesses.length>0&&!completed&&<button className="secondary-share" type="button" onClick={shareResult}><Share2 size={15}/> {copied?'Copiado!':'Compartilhar progresso'}</button>}
      </section>
      <section className="daily-closer" aria-label="Mensagem de rodapé"><div className="closer-line"/><span><Sparkles size={14}/> A SUA PALAVRA É LÂMPADA PARA OS MEUS PÉS <Sparkles size={14}/></span><div className="closer-line"/></section>
    </main>
    <footer className="site-footer page-container"><span>© {new Date().getFullYear()} Bibliadle · Feito para quem ama as Escrituras.</span><span>Texto bíblico: <a href="https://github.com/midvash/bible-data" target="_blank" rel="noreferrer">{TRANSLATIONS.find(t=>t.id===translation)?.credit}</a></span></footer>
    <ArchiveModal open={archiveOpen} onClose={()=>setArchiveOpen(false)} today={today} selectedDay={day} records={records} onSelectDay={navigateToDay}/>
    <Modal title="Como jogar" open={helpOpen} onClose={()=>setHelpOpen(false)}><div className="modal-body"><p className="modal-intro">Encontre a referência do versículo exibido. Você tem quantas tentativas precisar.</p><IntroRule emoji="📖" title="Escolha o livro" text="Selecione um dos 66 livros da Bíblia, na ordem do cânon protestante."/><IntroRule emoji="🔢" title="Informe capítulo e versículo" text="Cada parte da referência recebe uma indicação separada."/><IntroRule emoji="🎯" title="Siga as pistas" text="Verde significa acerto. Vermelho com ↑ aponta para valores maiores ou livros posteriores; ↓ aponta para menores ou anteriores."/><IntroRule emoji="🗓️" title="Jogue edições anteriores" text="Abra o arquivo para escolher qualquer desafio de uma data passada. Cada dia mantém seu próprio histórico de tentativas."/><div className="modal-tip"><Info size={17}/> Um novo desafio aparece todos os dias à meia-noite, no horário de Brasília. Seu progresso fica salvo neste navegador.</div></div><button className="primary-button modal-button" type="button" onClick={()=>setHelpOpen(false)}>Entendi, vamos jogar <ArrowRight size={17}/></button></Modal>
    <Modal title="Suas estatísticas" open={statsOpen} onClose={()=>setStatsOpen(false)}><div className="stats-grid"><div className="stat-box"><strong>{stats.played}</strong><span>Jogados</span></div><div className="stat-box"><strong>{stats.winRate}%</strong><span>Vitórias</span></div><div className="stat-box"><strong><Flame size={20}/> {stats.currentStreak}</strong><span>Sequência</span></div><div className="stat-box"><strong>{stats.bestStreak}</strong><span>Recorde</span></div></div><div className="stats-extra"><span>Média de tentativas nas vitórias</span><b>{stats.averageGuesses}</b></div><div className="stats-daily"><CalendarDays size={17}/><span>Próximo desafio em <b>{formatCountdown(msToNextBrazilMidnight(now))}</b></span></div><p className="stats-note">As estatísticas são armazenadas apenas neste dispositivo. Não é necessário criar conta.</p>{guesses.length>0&&<button type="button" className="primary-button modal-button" onClick={shareResult}><Copy size={17}/> {copied?'Resultado copiado!':'Compartilhar resultado'}</button>}</Modal>
  </div>;
}
