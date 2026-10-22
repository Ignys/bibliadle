import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Check, ChevronDown, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { BOOKS, BOOK_BY_ID, normalizeText, type BibleBook } from '../data/books';
interface Props {value:string;onChange:(id:string)=>void;disabled?:boolean}
export function BookPicker({value,onChange,disabled}:Props){
  const [query,setQuery]=useState(BOOK_BY_ID.get(value)?.name??'');
  const [open,setOpen]=useState(false);
  const [active,setActive]=useState(0);
  const root=useRef<HTMLDivElement>(null);
  const input=useRef<HTMLInputElement>(null);
  const menu=useRef<HTMLDivElement>(null);
  const control=useRef<HTMLDivElement>(null);
  const [rect,setRect]=useState<{top:number;left:number;width:number}|null>(null);
  useLayoutEffect(()=>{if(!open)return;const update=()=>{const r=control.current?.getBoundingClientRect();if(r)setRect({top:r.bottom+7,left:r.left,width:r.width});};update();window.addEventListener('resize',update);window.addEventListener('scroll',update,true);return()=>{window.removeEventListener('resize',update);window.removeEventListener('scroll',update,true);};},[open]);
  useEffect(()=>{if(value)setQuery(BOOK_BY_ID.get(value)?.name??'');},[value]);
  useEffect(()=>{const close=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node)&&!menu.current?.contains(event.target as Node)){setOpen(false);setQuery(BOOK_BY_ID.get(value)?.name??'');}};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[value]);
  const filtered=useMemo(()=>{const q=normalizeText(query);return !q||BOOK_BY_ID.get(value)?.name===query?BOOKS:BOOKS.filter(book=>normalizeText(book.name).includes(q));},[value,query]);
  function choose(book:BibleBook){onChange(book.id);setQuery(book.name);setOpen(false);setActive(0);}
  return <div className="relative min-w-0" ref={root}>
    <label htmlFor="book-picker" className="field-label">Livro</label>
    <div ref={control} className={`field-control ${open?'field-control-focus':''}`}><BookOpen size={17} className="text-amber-700/80 [[data-theme=dark]_&]:text-amber-300/70 shrink-0"/>
      <input ref={input} id="book-picker" role="combobox" aria-label="Escolha o livro da Bíblia" aria-expanded={open} aria-controls="book-options" aria-autocomplete="list" autoComplete="off" spellCheck={false} disabled={disabled} placeholder="Selecione o livro..." value={query} className="field-input"
        onFocus={()=>{setOpen(true);setActive(0);}}
        onChange={event=>{setQuery(event.target.value);onChange('');setActive(0);setOpen(true);}}
        onKeyDown={event=>{if(event.key==='Escape')setOpen(false);if(event.key==='ArrowDown'){event.preventDefault();setOpen(true);setActive(n=>Math.min(n+1,filtered.length-1));}if(event.key==='ArrowUp'){event.preventDefault();setActive(n=>Math.max(n-1,0));}if(event.key==='Enter'&&open&&filtered[active]){event.preventDefault();choose(filtered[active]);}}}/>
      <button type="button" className="icon-in-field" aria-label="Abrir lista de livros" disabled={disabled} onClick={()=>{setOpen(!open);input.current?.focus();}}>{open?<Search size={16}/>:<ChevronDown size={17}/>}</button>
    </div>
    {createPortal(<AnimatePresence>{open&&!disabled&&rect&&<motion.div ref={menu} style={{position:'fixed',top:rect.top,left:rect.left,width:rect.width,right:'auto',zIndex:1000}} id="book-options" role="listbox" className="book-menu" initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:.15}}>
      {filtered.length===0?<div className="px-4 py-5 text-sm text-center text-[#5a6b5f] [[data-theme=dark]_&]:text-[#9daea2]">Nenhum livro encontrado.</div>:
        filtered.map((book,i)=><div key={book.id}>{(i===0||filtered[i-1].testament!==book.testament)&&<div className="book-menu-heading">{book.testament}</div>}
          <button type="button" role="option" aria-selected={value===book.id} className={`book-option ${active===i?'book-option-active':''}`} onMouseEnter={()=>setActive(i)} onMouseDown={event=>event.preventDefault()} onClick={()=>choose(book)}><span>{book.name}</span>{value===book.id&&<Check size={16}/>}</button>
        </div>)}
    </motion.div>}</AnimatePresence>,document.body)}
  </div>;
}
