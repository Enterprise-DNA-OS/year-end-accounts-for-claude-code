import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {parseCsv} from './csv.mjs';
import {add,audit,text,date,choice} from './domain.mjs';
// One row per trial balance account. Client and engagement columns repeat on every row.
export const mappingFields=['client_code','client_name','entity_type','jurisdiction','engagement_code','period_start','period_end','account_code','account_name','line','current','prior'];
const optional=['line','prior'];
// Plain decimal dollars with an optional leading minus or accounting brackets. Debits positive, credits negative.
export function cents(v){
 let s=String(v).trim(),neg=false;
 if(/^\(.*\)$/.test(s)){neg=true;s=s.slice(1,-1).trim();}
 if(s.startsWith('-')){if(neg)throw Error('Money has two signs');neg=true;s=s.slice(1);}
 if(!/^\d+(\.\d{1,2})?$/.test(s))throw Error('Money must be a plain decimal with at most two places, no symbols or separators');
 const [a,b='']=s.split('.');const n=Number(a)*100+Number(b.padEnd(2,'0'));if(!Number.isSafeInteger(n))throw Error('Money exceeds safe range');
 return neg?-n:n;
}
export async function importCaseware(db,file,mapFile,actor,{preparer,reviewer,due,materiality}={}){
 text(actor,'actor');const mapping=JSON.parse(fs.readFileSync(text(mapFile,'map'),'utf8'));
 const {line_codes={},...columns}=mapping;
 for(const k of mappingFields.filter(k=>!optional.includes(k)))text(columns[k],'mapping.'+k);
 if(Object.keys(columns).some(k=>!mappingFields.includes(k)))throw Error('Unknown mapping field');
 const used=Object.values(columns).filter(Boolean);if(new Set(used).size!==used.length)throw Error('Map each field to a distinct column');
 if(typeof line_codes!=='object'||Array.isArray(line_codes))throw Error('line_codes must map source values to statement line codes');
 const lines=new Set((await db.query('select code from report_lines')).map(r=>r.code));
 for(const [k,v] of Object.entries(line_codes))if(!lines.has(v))throw Error(`line_codes.${k}: unknown statement line ${v}`);
 const rows=parseCsv(fs.readFileSync(text(file,'file'),'utf8'));if(!rows.length)throw Error('CSV has no data rows');
 const seen=new Set(),totals=new Map();let imported=0,unchanged=0,unmapped=0;
 for(const [i,raw] of rows.entries()){
  for(const col of used)if(!(col in raw))throw Error('Missing mapped column '+col);
  const d=Object.fromEntries(mappingFields.map(k=>[k,columns[k]?raw[columns[k]].trim():'']));
  for(const k of mappingFields.filter(k=>!optional.includes(k)))text(d[k],`row ${i+2} ${k}`);
  date(d.period_start,'period_start');date(d.period_end,'period_end');choice(d.jurisdiction,['NZ','AU'],'jurisdiction');
  const current=cents(d.current),prior=d.prior?cents(d.prior):0;
  const source=d.line,mapped=source?(line_codes[source]||(lines.has(source.toUpperCase())?source.toUpperCase():null)):null;
  if(source&&!mapped)throw Error(`row ${i+2}: no statement line for "${source}"; add it to line_codes`);
  const key=d.engagement_code+'|'+d.account_code;if(seen.has(key))throw Error('Duplicate account in file: '+key);seen.add(key);
  const t=totals.get(d.engagement_code)||{current:0,prior:0};t.current+=current;t.prior+=prior;totals.set(d.engagement_code,t);
  let c=(await db.query('select * from clients where code=$1',[d.client_code]))[0];
  if(c){for(const k of ['name','entity_type','jurisdiction'])if(c[k]!==d[k==='name'?'client_name':k])throw Error('Client details conflict for '+d.client_code+': '+k);}
  else c=await add(db,'client',{code:d.client_code,name:d.client_name,entity_type:d.entity_type,jurisdiction:d.jurisdiction,manager:text(preparer,'--preparer'),partner:text(reviewer,'--reviewer')},actor);
  let e=(await db.query('select * from engagements where code=$1',[d.engagement_code]))[0];
  if(e){if(e.client_id!==c.id||e.period_start!==d.period_start||e.period_end!==d.period_end)throw Error('Engagement details conflict for '+d.engagement_code);}
  else e=await add(db,'engagement',{code:d.engagement_code,client:c.id,period_start:d.period_start,period_end:d.period_end,due_on:date(due,'--due'),preparer:text(preparer,'--preparer'),reviewer:text(reviewer,'--reviewer'),materiality_cents:cents(text(materiality,'--materiality'))},actor);
  const hash=createHash('sha256').update(JSON.stringify(d)).digest('hex');
  const old=(await db.query('select source_hash from tb_lines where engagement_id=$1 and account_code=$2',[e.id,d.account_code]))[0];
  if(old){if(old.source_hash!==hash)throw Error('Changed source or existing account: '+key+'; reconcile before importing');unchanged++;continue;}
  const row=await add(db,'account',{engagement:e.id,account_code:d.account_code,account_name:d.account_name,report_line:mapped,balance_cents:current,prior_cents:prior},actor);
  await db.query('update tb_lines set source_row=$1,source_hash=$2 where id=$3',[JSON.stringify(raw),hash,row.id]);
  await audit(db,actor,'import caseware',row.id,{source_hash:hash,row:i+2});imported++;if(!mapped)unmapped++;
 }
 for(const [code,t] of totals)if(t.current!==0||t.prior!==0)throw Error(`Trial balance for ${code} does not balance in the file (current ${(t.current/100).toFixed(2)}, prior ${(t.prior/100).toFixed(2)}); export the full trial balance`);
 return {imported,unchanged,unmapped,warning:'Imported balances only. Workpapers, sign-offs, adjustments, notes and attachments are not inferred.'};
}
