import type { Records } from './game';
import { DEFAULT_TRANSLATION, isTranslationId, type TranslationId } from './bibleApi';
const KEY='bibliadle:history:v1';
export function loadRecords():Records {
  try {
    const data: unknown=JSON.parse(localStorage.getItem(KEY)??'{}');
    if(!data||typeof data!=='object'||Array.isArray(data))return {};
    const result:Records={};
    for(const [day,value] of Object.entries(data)) {
      if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!value||typeof value!=='object')continue;
      const v=value as Record<string,unknown>;
      if(!Array.isArray(v.guesses))continue;
      const guesses=v.guesses.filter((g:unknown)=>!!g&&typeof g==='object'&&typeof (g as Record<string,unknown>).bookId==='string'&&typeof (g as Record<string,unknown>).chapter==='number'&&typeof (g as Record<string,unknown>).verse==='number');
      result[day]={date:day,guesses,completed:v.completed===true};
    }
    return result;
  } catch{return {};}
}
export function saveRecords(records:Records){try{localStorage.setItem(KEY,JSON.stringify(records));}catch{/* armazenamento indisponível */}}
const TRANSLATION_KEY='bibliadle:translation';
export function loadTranslation():TranslationId{try{const value=localStorage.getItem(TRANSLATION_KEY);return isTranslationId(value)?value:DEFAULT_TRANSLATION;}catch{return DEFAULT_TRANSLATION;}}
export function saveTranslation(id:TranslationId){try{localStorage.setItem(TRANSLATION_KEY,id);}catch{/* armazenamento indisponível */}}
