import type { BibleReference } from '../data/dailyVerses';
const API='https://api.midvash.com/v1/almeida-livre';
export async function fetchVerse(ref:BibleReference,signal?:AbortSignal):Promise<string> {
  const response=await fetch(`${API}/${encodeURIComponent(ref.bookId)}/${ref.chapter}/${ref.verse}`,{signal,headers:{Accept:'application/json'}});
  if(!response.ok)throw new Error(`Não foi possível carregar o versículo (HTTP ${response.status}).`);
  const payload:unknown=await response.json();
  if(!payload||typeof payload!=='object')throw new Error('Resposta bíblica inválida.');
  const body=payload as Record<string,unknown>;
  const data=(body.data&&typeof body.data==='object'?body.data:body) as Record<string,unknown>;
  const text=data.text??(data.verse&&typeof data.verse==='object'?(data.verse as Record<string,unknown>).text:null);
  if(typeof text!=='string'||!text.trim())throw new Error('O texto do versículo não veio na resposta.');
  return text.trim();
}
