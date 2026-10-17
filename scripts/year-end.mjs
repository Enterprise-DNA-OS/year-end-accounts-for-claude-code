#!/usr/bin/env node
import {getDb} from './lib/db.mjs';
import {run,reads,fileReads,mutations,human} from './lib/domain.mjs';
import {importCaseware} from './lib/import.mjs';
const args=process.argv.slice(2),flags={},pos=[];
const allowed={
 add:['file','actor'],log:['note','actor'],map:['account','line','workpaper','actor'],'record-terms':['on','reference','actor'],
 'record-references':['tax-reconciliation','associated-persons','actor'],'propose-adjustment':['file','actor'],'post-adjustment':['on','actor'],
 'withdraw-adjustment':['reason','actor'],'prepare-workpaper':['workpaper','on','evidence','conclusion','actor'],'review-workpaper':['workpaper','on','actor'],
 'raise-point':['workpaper','code','point','actor'],'clear-point':['on','response','actor'],'answer-query':['on','answer','actor'],
 'mark-prepared':['on','actor'],'mark-reviewed':['on','actor'],sign:['on','by','actor'],issue:['on','reference','actor'],
 'roll-forward':['code','due','return-due','actor'],import:['file','map','actor','preparer','reviewer','due','materiality','dry-run'],export:['out']
};
let db;
try{
 for(const a of args){if(a.startsWith('--')){const at=a.indexOf('='),k=a.slice(2,at<0?undefined:at);if(k in flags)throw Error('Duplicate flag '+k);flags[k]=at<0?true:a.slice(at+1);}else pos.push(a);}
 if(flags.help||!pos.length){console.log('year-end <command> [record] [--key=value] [--json]\n'+[...Object.keys(reads),...fileReads.map(c=>c+' <engagement>'),'insights',...mutations,'import caseware','export','weekly-review','draft-queries <engagement>'].join('\n'));process.exit(0);}
 const [cmd,term]=pos;if(pos.length>2)throw Error('Too many positional arguments');
 const valid=['json',...(allowed[cmd]||[])];for(const k of Object.keys(flags))if(!valid.includes(k))throw Error('Unknown flag --'+k);
 for(const k of ['json','dry-run'])if(k in flags&&flags[k]!==true)throw Error('--'+k+' takes no value');
 for(const [k,v]of Object.entries(flags))if(!['json','dry-run'].includes(k)&&typeof v!=='string')throw Error('--'+k+' requires =value');
 if(['export','weekly-review'].includes(cmd)&&term)throw Error(cmd+' takes no record');
 db=await getDb();const write=mutations.includes(cmd)||cmd==='import';await db.exec(write?'BEGIN':'BEGIN READ ONLY');
 try{
  let out;
  if(cmd==='import'){if(term!=='caseware')throw Error('import requires caseware');out=await importCaseware(db,flags.file,flags.map,flags.actor,flags);if(flags['dry-run'])out={...out,dry_run:true};}
  else out=await run(db,cmd,term,flags);
  await db.exec(flags['dry-run']?'ROLLBACK':'COMMIT');console.log(flags.json?JSON.stringify(out,null,2):human(out));
 }catch(e){await db.exec('ROLLBACK');throw e;}
}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}
