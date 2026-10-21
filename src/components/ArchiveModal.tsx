import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { Modal } from './Modal';
import { FIRST_CHALLENGE_DAY, getArchiveStatus, getChallengeNumber, getMonthGrid, isAvailableDay, shiftMonth } from '../lib/archive';
import type { Records } from '../lib/game';

interface ArchiveModalProps {
  open: boolean;
  onClose: () => void;
  today: string;
  selectedDay: string;
  records: Records;
  onSelectDay: (day: string) => void;
}

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export function ArchiveModal({ open, onClose, today, selectedDay, records, onSelectDay }: ArchiveModalProps) {
  const [month, setMonth] = useState(selectedDay.slice(0, 7));
  useEffect(() => { if (open) setMonth(selectedDay.slice(0, 7)); }, [open, selectedDay]);

  const cells = useMemo(() => getMonthGrid(month), [month]);
  const monthLabel = new Date(`${month}-01T12:00:00Z`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const canGoBack = shiftMonth(month, -1) >= FIRST_CHALLENGE_DAY.slice(0, 7);
  const canGoForward = shiftMonth(month, 1) <= today.slice(0, 7);
  const played = Object.values(records).filter(record => isAvailableDay(record.date, today) && record.guesses.length > 0).length;
  const solved = Object.values(records).filter(record => isAvailableDay(record.date, today) && record.completed).length;

  return <Modal title="Desafios anteriores" open={open} onClose={onClose}>
    <div className="archive-intro"><CalendarDays size={17} /><span>Viaje pelas edições desde <strong>1º de janeiro de 2026</strong>. Cada data tem seu próprio versículo e suas tentativas ficam salvas.</span></div>
    <div className="archive-progress"><div><strong>{solved}</strong><span>concluídos</span></div><div><strong>{played}</strong><span>jogados</span></div><div><strong>{getChallengeNumber(today)}</strong><span>disponíveis</span></div></div>
    <div className="archive-calendar">
      <div className="archive-month-nav"><button className="archive-month-arrow" type="button" aria-label="Mês anterior" onClick={() => setMonth(value => shiftMonth(value, -1))} disabled={!canGoBack}><ChevronLeft size={20}/></button><h3>{monthLabel}</h3><button className="archive-month-arrow" type="button" aria-label="Próximo mês" onClick={() => setMonth(value => shiftMonth(value, 1))} disabled={!canGoForward}><ChevronRight size={20}/></button></div>
      <div className="archive-day-grid" role="group" aria-label={`Desafios de ${monthLabel}`}>
        {WEEKDAYS.map(day => <span className="archive-weekday" key={day}>{day}</span>)}
        {cells.map((date, index) => {
          if (!date) return <span key={`blank-${index}`} aria-hidden="true"/>;
          const available = isAvailableDay(date, today);
          const status = getArchiveStatus(records, date);
          const isToday = date === today;
          const isSelected = date === selectedDay;
          const label = `${new Date(`${date}T12:00:00Z`).toLocaleDateString('pt-BR', { dateStyle: 'long', timeZone: 'UTC' })}, desafio ${getChallengeNumber(date)}${isToday ? ', hoje' : ''}${available ? status === 'completed' ? ', concluído' : status === 'started' ? ', em andamento' : ', não jogado' : ', indisponível'}`;
          return <motion.button type="button" key={date} whileTap={available ? { scale: .94 } : undefined} disabled={!available} aria-current={isSelected ? 'date' : undefined} aria-label={label} title={label} onClick={() => onSelectDay(date)} className={`archive-day${isSelected ? ' archive-day-selected' : ''}${isToday ? ' archive-day-today' : ''}${status === 'completed' && available ? ' archive-day-complete' : ''}`}>
            <span>{Number(date.slice(-2))}</span>{available && <span className={`archive-day-mark archive-day-mark-${status}`} aria-hidden="true">{status === 'completed' ? <Check size={11} strokeWidth={3}/> : status === 'started' ? <Clock3 size={10}/> : null}</span>}
          </motion.button>;
        })}
      </div>
    </div>
    <div className="archive-key"><span><i className="archive-legend-dot complete"/>Concluído</span><span><i className="archive-legend-dot started"/>Em andamento</span><span><i className="archive-legend-dot pending"/>Não jogado</span></div>
    {selectedDay !== today ? <button type="button" className="primary-button archive-today-button" onClick={() => onSelectDay(today)}><Play size={16}/> Ir para o desafio de hoje <ArrowRight size={17}/></button> : <p className="archive-current-note">Você está no desafio de hoje. Selecione um dia anterior para jogar.</p>}
  </Modal>;
}
