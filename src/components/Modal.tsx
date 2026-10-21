import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
export function Modal({title,open,onClose,children}:{title:string;open:boolean;onClose:()=>void;children:ReactNode}){
  useEffect(()=>{if(!open)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose();};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close);},[open,onClose]);
  return <AnimatePresence>{open&&<motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}>
    <motion.div className="modal-panel" role="dialog" aria-modal="true" aria-label={title} initial={{opacity:0,y:25,scale:.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:15,scale:.97}} transition={{type:'spring',stiffness:360,damping:33}}>
      <div className="modal-top"><h2>{title}</h2><button className="modal-close" type="button" onClick={onClose} aria-label="Fechar janela"><X size={20}/></button></div>{children}
    </motion.div>
  </motion.div>}</AnimatePresence>;
}
