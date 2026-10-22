export type Testament = 'Antigo Testamento' | 'Novo Testamento';
export type BookCategory = 'Pentateuco' | 'Histórico' | 'Poético' | 'Profético' | 'Evangelho' | 'Carta';
export interface BibleBook { id: string; name: string; chapters: number; testament: Testament; category: BookCategory }
// Índice (dentro de cada testamento) em que cada categoria começa
const OLD_CATEGORIES: [number,BookCategory][] = [[0,'Pentateuco'],[5,'Histórico'],[17,'Poético'],[22,'Profético']];
const NEW_CATEGORIES: [number,BookCategory][] = [[0,'Evangelho'],[4,'Histórico'],[5,'Carta'],[26,'Profético']];
const categoryAt = (ranges: [number,BookCategory][], index: number) => ranges.filter(([start])=>start<=index).at(-1)![1];
const old: [string,string,number][] = [
['genesis','Gênesis',50],['exodus','Êxodo',40],['leviticus','Levítico',27],['numbers','Números',36],['deuteronomy','Deuteronômio',34],['joshua','Josué',24],['judges','Juízes',21],['ruth','Rute',4],['1-samuel','1 Samuel',31],['2-samuel','2 Samuel',24],['1-kings','1 Reis',22],['2-kings','2 Reis',25],['1-chronicles','1 Crônicas',29],['2-chronicles','2 Crônicas',36],['ezra','Esdras',10],['nehemiah','Neemias',13],['esther','Ester',10],['job','Jó',42],['psalms','Salmos',150],['proverbs','Provérbios',31],['ecclesiastes','Eclesiastes',12],['song-of-solomon','Cânticos',8],['isaiah','Isaías',66],['jeremiah','Jeremias',52],['lamentations','Lamentações',5],['ezekiel','Ezequiel',48],['daniel','Daniel',12],['hosea','Oséias',14],['joel','Joel',3],['amos','Amós',9],['obadiah','Obadias',1],['jonah','Jonas',4],['micah','Miquéias',7],['nahum','Naum',3],['habakkuk','Habacuque',3],['zephaniah','Sofonias',3],['haggai','Ageu',2],['zechariah','Zacarias',14],['malachi','Malaquias',4]
];
const newer: [string,string,number][] = [
['matthew','Mateus',28],['mark','Marcos',16],['luke','Lucas',24],['john','João',21],['acts','Atos',28],['romans','Romanos',16],['1-corinthians','1 Coríntios',16],['2-corinthians','2 Coríntios',13],['galatians','Gálatas',6],['ephesians','Efésios',6],['philippians','Filipenses',4],['colossians','Colossenses',4],['1-thessalonians','1 Tessalonicenses',5],['2-thessalonians','2 Tessalonicenses',3],['1-timothy','1 Timóteo',6],['2-timothy','2 Timóteo',4],['titus','Tito',3],['philemon','Filemom',1],['hebrews','Hebreus',13],['james','Tiago',5],['1-peter','1 Pedro',5],['2-peter','2 Pedro',3],['1-john','1 João',5],['2-john','2 João',1],['3-john','3 João',1],['jude','Judas',1],['revelation','Apocalipse',22]
];
export const BOOKS: BibleBook[] = [...old.map(([id,name,chapters],i)=>({id,name,chapters,testament:'Antigo Testamento' as const,category:categoryAt(OLD_CATEGORIES,i)})),...newer.map(([id,name,chapters],i)=>({id,name,chapters,testament:'Novo Testamento' as const,category:categoryAt(NEW_CATEGORIES,i)}))];
export const BOOK_BY_ID = new Map(BOOKS.map(book=>[book.id,book]));
export const bookOrder = (id: string) => BOOKS.findIndex(book=>book.id===id);
export const normalizeText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
