import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {REPO_ROOT} from './db.mjs';
import {table} from './format.mjs';
export const tables=['clients','engagements','report_lines','tb_lines','adjustments','adjustment_lines','workpapers','queries','review_points','notes','audit_events'];
export const reads={
 clients:'select code,name,entity_type,jurisdiction,currency,manager,partner,minimum_requirements_exempt from clients order by code',
 engagements:'select code,client,jurisdiction,status,preparer,reviewer,period_end,due_on,unmapped_lines,unprepared_workpapers,open_queries,open_review_points from engagement_status order by due_on,code',
 deadlines:"select code,client,status,preparer,partner,due_on,days_to_due,return_due_on from engagement_status where status<>'issued' order by due_on,code",
 workpapers:`select e.code engagement,w.code workpaper,w.title,w.report_line line,case when w.prepared_on is null then 'to prepare' else 'to review' end stage,
  coalesce(nullif(w.prepared_by,''),e.preparer) owner,w.prepared_on from workpapers w join engagements e on e.id=w.engagement_id
  where w.reviewed_on is null and e.status in ('open','prepared') order by e.code,w.code`,
 queries:"select q.code,e.code engagement,c.name client,q.owner,q.asked_on,q.due_on,greatest(0,current_date-q.due_on) days_overdue,q.question from queries q join engagements e on e.id=q.engagement_id join clients c on c.id=e.client_id where q.status='open' order by q.due_on,q.code",
 'review-points':"select r.code,e.code engagement,r.workpaper,r.raised_by,r.raised_on,(current_date-r.raised_on) days_open,r.point from review_points r join engagements e on e.id=r.engagement_id where r.status='open' order by r.raised_on,r.code",
 adjustments:`select j.code,e.code engagement,j.kind,j.status,j.description,(-coalesce(sum(l.amount_cents) filter(where r.statement='performance'),0))::bigint profit_change_cents
  from adjustments j join engagements e on e.id=j.engagement_id join adjustment_lines l on l.adjustment_id=j.id join tb_lines t on t.id=l.tb_line_id left join report_lines r on r.code=t.report_line
  group by j.id,e.code order by e.code,j.code`,
 flux:'select engagement,line,label,currency,prior_cents,current_cents,movement_cents,materiality_cents from movements where not explained order by engagement,line',
 attention:`select 'Accounts overdue' issue,code record,preparer owner,due_on due from engagement_status where status<>'issued' and due_on<current_date
 union all select 'Client query overdue',q.code,q.owner,q.due_on from queries q where q.status='open' and q.due_on<current_date
 union all select 'Review point open over 7 days',r.code,e.preparer,r.raised_on from review_points r join engagements e on e.id=r.engagement_id where r.status='open' and r.raised_on<current_date-7
 union all select 'Trial balance out of balance',code,preparer,due_on from engagement_status where tb_difference_cents<>0 and status<>'issued'
 union all select 'Unmapped accounts',code,preparer,due_on from engagement_status where unmapped_lines>0 and status<>'issued'
 union all select 'Movement over materiality unexplained',code,preparer,due_on from engagement_status where unexplained_movements>0 and status<>'issued'
 union all select 'Tax return due within 14 days',code,partner,return_due_on from engagement_status where status<>'issued' and return_due_on<=current_date+14
 order by due,record,issue`,
 compliance:`select 'Terms of engagement not recorded' issue,code record,case when jurisdiction='AU' then 'APES 305 Terms of Engagement' else 'Firm policy: written terms' end rule from engagement_status where terms_missing and status<>'issued'
 union all select 'Tax reconciliation reference missing',s.code,'NZ Tax Administration (Financial Statements) Order 2014' from engagement_status s join engagements e on e.id=s.id where s.minimum_requirements_apply and trim(e.tax_reconciliation_reference)='' and s.status<>'issued'
 union all select 'Associated persons disclosure reference missing',s.code,'NZ Tax Administration (Financial Statements) Order 2014' from engagement_status s join engagements e on e.id=s.id where s.minimum_requirements_apply and trim(e.associated_persons_reference)='' and s.status<>'issued'
 union all select 'Accounts do not balance',code,'Double-entry accounts' from engagement_status where tb_difference_cents<>0
 union all select 'Retention review due',code,case when jurisdiction='NZ' then 'NZ Tax Administration Act 1994 s22: 7 years' else 'ITAA 1936 s262A: 5 years' end from engagement_status where retain_until<current_date
 order by record,issue`,
 history:'select actor,event,record_id,detail,created_at from audit_events order by created_at,id'
};
export const fileReads=['engagement','tb','statements'];
export const questions=[
 ['Which year-end files are past their due date and not yet issued?',"select code,client,status,preparer,due_on,days_to_due from engagement_status where status<>'issued' and due_on<current_date order by due_on"],
 ['Which trial balances do not balance after posted adjustments?',"select code,client,currency,tb_difference_cents from engagement_status where tb_difference_cents<>0 order by code"],
 ['Which accounts are still not mapped to a statement line?',"select engagement,account_code,account_name,currency,final_cents from tb_final where report_line is null order by engagement,account_code"],
 ['Which movements over materiality have no prepared workpaper?','select engagement,line,label,currency,movement_cents,materiality_cents from movements where not explained order by engagement,line'],
 ['Which client queries are overdue and who owns the chase?',"select q.code,e.code engagement,q.owner,q.due_on,(current_date-q.due_on) days_overdue from queries q join engagements e on e.id=q.engagement_id where q.status='open' and q.due_on<current_date order by q.due_on"],
 ['Which review points have been open longer than seven days?',"select r.code,e.code engagement,r.workpaper,r.raised_by,(current_date-r.raised_on) days_open from review_points r join engagements e on e.id=r.engagement_id where r.status='open' and r.raised_on<current_date-7 order by r.raised_on"],
 ['Which files are held from sign-off only by missing references?',`select s.code,s.client,s.terms_missing,(s.minimum_requirements_apply and (trim(e.tax_reconciliation_reference)='' or trim(e.associated_persons_reference)='')) nz_references_missing from engagement_status s join engagements e on e.id=s.id
  where s.status='reviewed' and (s.terms_missing or (s.minimum_requirements_apply and (trim(e.tax_reconciliation_reference)='' or trim(e.associated_persons_reference)=''))) order by s.code`],
 ['What profit does each file report against last year?','select engagement,currency,prior_profit_cents,profit_cents,(profit_cents-prior_profit_cents)::bigint change_cents from performance_summary order by engagement'],
 ['Which preparers carry the most workpapers still to prepare?',"select e.preparer,count(*)::integer to_prepare from workpapers w join engagements e on e.id=w.engagement_id where w.prepared_on is null and e.status='open' group by e.preparer order by count(*) desc,e.preparer"],
 ['Which proposed adjustments are waiting, and what do they do to profit?',`select j.code,e.code engagement,j.description,(-coalesce(sum(l.amount_cents) filter(where r.statement='performance'),0))::bigint profit_change_cents
  from adjustments j join engagements e on e.id=j.engagement_id join adjustment_lines l on l.adjustment_id=j.id join tb_lines t on t.id=l.tb_line_id left join report_lines r on r.code=t.report_line where j.status='proposed' group by j.id,e.code order by j.code`]
];
export function text(v,label){if(typeof v!=='string'||!v.trim())throw Error(label+' is required');return v.trim();}
export function integer(v,label,{positive=false}={}){if(!/^\d+$/.test(String(v))||!Number.isSafeInteger(Number(v))||(positive&&Number(v)===0))throw Error(label+' must be a '+(positive?'positive':'nonnegative')+' safe integer');return Number(v);}
export function signed(v,label,{nonzero=false}={}){if(!/^-?\d+$/.test(String(v))||!Number.isSafeInteger(Number(v))||(nonzero&&Number(v)===0))throw Error(label+' must be '+(nonzero?'a nonzero':'a')+' whole number of cents');return Number(v);}
export function date(v,label){text(v,label);if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error(label+' must be a valid YYYY-MM-DD');return v;}
export const today=()=>new Date().toISOString().slice(0,10);
export function past(v,label){date(v,label);if(v>today())throw Error(label+' cannot be in the future');return v;}
export function keys(obj,allowed){if(!obj||Array.isArray(obj)||typeof obj!=='object')throw Error('Expected an object');for(const k of Object.keys(obj))if(!allowed.includes(k))throw Error('Unknown field '+k);}
export function choice(v,allowed,label){if(!allowed.includes(v))throw Error(label+' must be '+allowed.join(', '));return v;}
export function human(v){if(Array.isArray(v)){if(!v.length)return '(none)';return table(v,Object.keys(v[0]).map(key=>({key,label:key.replace(/_cents$/,'').replaceAll('_',' '),align:key.endsWith('_cents')?'right':'left',format:x=>x==null?'':key.endsWith('_cents')?(Number(x)/100).toFixed(2):typeof x==='object'?JSON.stringify(x):x})));}if(v&&typeof v==='object')return Object.entries(v).map(([k,x])=>k+'\n'+(typeof x==='object'?human(x):x)).join('\n\n');return String(v);}
const labels={clients:'select id,code,name from clients',engagements:'select e.id,e.code,c.name from engagements e join clients c on c.id=e.client_id',adjustments:'select id,code,description name from adjustments',queries:'select id,code,question name from queries',review_points:'select id,code,point name from review_points'};
export async function resolve(db,kind,term,{lock=false}={}){
 if(!labels[kind])throw Error('Unsupported record type');text(term,'record');
 const all=await db.query(labels[kind]+' order by code'),q=term.toLowerCase();
 let found=all.filter(r=>r.id===q||r.code.toLowerCase()===q||r.name?.toLowerCase()===q);
 if(!found.length)found=all.filter(r=>r.id.startsWith(q)||r.code.toLowerCase().includes(q)||r.name?.toLowerCase().includes(q));
 if(found.length!==1)throw Error((found.length?'Ambiguous record. Choose an id or code:':'No matching record. Available records:')+'\n'+human((found.length?found:all).map(r=>({id:r.id,code:r.code,name:r.name}))));
 return (await db.query(`select * from ${kind} where id=$1${lock?' for update':''}`,[found[0].id]))[0];
}
export async function insert(db,kind,obj){if(!tables.includes(kind))throw Error('Unknown entity');const cols=Object.keys(obj);return (await db.query(`insert into ${kind}(${cols.join(',')}) values(${cols.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,Object.values(obj)))[0];}
export async function audit(db,actor,event,id,detail){await insert(db,'audit_events',{actor:text(actor,'actor'),event,record_id:id,detail:JSON.stringify(detail)});}
const status=async(db,id)=>(await db.query('select * from engagement_status where id=$1',[id]))[0];
const line=async(db,v)=>{if(v==null||v==='')return null;const r=await db.query('select code from report_lines where code=$1',[String(v).toUpperCase()]);if(!r.length)throw Error('Unknown statement line '+v+'. Lines: '+(await db.query('select code from report_lines order by sort')).map(x=>x.code).join(', '));return r[0].code;};
const need=(cond,msg)=>{if(cond)throw Error(msg);};
const stage=(e,allowed,what)=>need(!allowed.includes(e.status),`${what} needs the file to be ${allowed.join(' or ')}; ${e.code} is ${e.status}`);
async function account(db,e,code){const r=(await db.query('select * from tb_lines where engagement_id=$1 and account_code=$2 for update',[e.id,text(String(code??''),'account')]))[0];if(!r)throw Error(`No account ${code} on ${e.code}`);return r;}
async function workpaper(db,e,code){const r=(await db.query('select * from workpapers where engagement_id=$1 and lower(code)=lower($2) for update',[e.id,text(code,'workpaper')]))[0];if(!r)throw Error(`No workpaper ${code} on ${e.code}`);return r;}
export async function add(db,kind,d,actor){
 text(actor,'actor');let row;
 if(kind==='client'){
  keys(d,['code','name','entity_type','jurisdiction','manager','partner','minimum_requirements_exempt','exemption_reason']);
  const j=choice(d.jurisdiction,['NZ','AU'],'jurisdiction'),exempt=d.minimum_requirements_exempt===true;
  if(d.minimum_requirements_exempt!==undefined&&typeof d.minimum_requirements_exempt!=='boolean')throw Error('minimum_requirements_exempt must be true or false');
  row=await insert(db,'clients',{code:text(d.code,'code'),name:text(d.name,'name'),entity_type:choice(d.entity_type,['company','ltc','trust','partnership','sole_trader','society'],'entity_type'),jurisdiction:j,currency:j==='NZ'?'NZD':'AUD',manager:text(d.manager,'manager'),partner:text(d.partner,'partner'),minimum_requirements_exempt:exempt,exemption_reason:exempt?text(d.exemption_reason,'exemption_reason'):''});
 }else if(kind==='engagement'){
  keys(d,['code','client','kind','period_start','period_end','due_on','return_due_on','preparer','reviewer','materiality_cents']);
  const c=await resolve(db,'clients',d.client),s=date(d.period_start,'period_start'),e=date(d.period_end,'period_end');need(e<=s,'period_end must follow period_start');
  need(String(d.preparer||'').trim().toLowerCase()===String(d.reviewer||'').trim().toLowerCase(),'Reviewer must be a different person from the preparer');
  row=await insert(db,'engagements',{code:text(d.code,'code'),client_id:c.id,kind:choice(d.kind||'annual_accounts',['annual_accounts','compilation'],'kind'),period_start:s,period_end:e,due_on:date(d.due_on,'due_on'),return_due_on:d.return_due_on?date(d.return_due_on,'return_due_on'):null,preparer:text(d.preparer,'preparer'),reviewer:text(d.reviewer,'reviewer'),materiality_cents:integer(d.materiality_cents,'materiality_cents',{positive:true})});
 }else if(kind==='account'){
  keys(d,['engagement','account_code','account_name','report_line','workpaper','balance_cents','prior_cents']);
  const e=await resolve(db,'engagements',d.engagement);stage(e,['open'],'Adding an account');
  row=await insert(db,'tb_lines',{engagement_id:e.id,account_code:text(String(d.account_code??''),'account_code'),account_name:text(d.account_name,'account_name'),report_line:await line(db,d.report_line),workpaper:d.workpaper?text(d.workpaper,'workpaper'):'',balance_cents:signed(d.balance_cents,'balance_cents'),prior_cents:signed(d.prior_cents??0,'prior_cents')});
 }else if(kind==='workpaper'){
  keys(d,['engagement','code','title','report_line']);const e=await resolve(db,'engagements',d.engagement);stage(e,['open'],'Adding a workpaper');
  row=await insert(db,'workpapers',{engagement_id:e.id,code:text(d.code,'code'),title:text(d.title,'title'),report_line:await line(db,d.report_line)});
 }else if(kind==='query'){
  keys(d,['code','engagement','question','owner','due_on']);const e=await resolve(db,'engagements',d.engagement);stage(e,['open','prepared'],'Raising a client query');
  const due=date(d.due_on,'due_on');need(due<today(),'due_on cannot be before today');
  row=await insert(db,'queries',{code:text(d.code,'code'),engagement_id:e.id,question:text(d.question,'question'),owner:text(d.owner,'owner'),asked_on:today(),due_on:due});
 }else throw Error('add requires client, engagement, account, workpaper or query');
 await audit(db,actor,'add '+kind,row.id,d);return row;
}
export const mutations=['add','log','map','record-terms','record-references','propose-adjustment','post-adjustment','withdraw-adjustment','prepare-workpaper','review-workpaper','raise-point','clear-point','answer-query','mark-prepared','mark-reviewed','sign','issue','roll-forward'];
const target={'post-adjustment':'adjustments','withdraw-adjustment':'adjustments','clear-point':'review_points','answer-query':'queries'};
export async function engagementFile(db,e){
 return {engagement:await db.query('select code,client,status,preparer,reviewer,partner,period_end,due_on,return_due_on,tb_difference_cents,unmapped_lines,unprepared_workpapers,unreviewed_workpapers,open_queries,open_review_points,proposed_adjustments,unexplained_movements,terms_missing,retain_until from engagement_status where id=$1',[e.id]),workpapers:await db.query('select code,title,report_line,prepared_by,prepared_on,reviewed_by,reviewed_on,conclusion from workpapers where engagement_id=$1 order by code',[e.id]),
  adjustments:await db.query("select j.code,j.description,j.status,l.amount_cents,t.account_code from adjustments j join adjustment_lines l on l.adjustment_id=j.id join tb_lines t on t.id=l.tb_line_id where j.engagement_id=$1 order by j.code,t.account_code",[e.id]),
  queries:await db.query('select code,status,owner,due_on,question,answer from queries where engagement_id=$1 order by code',[e.id]),
  review_points:await db.query('select code,status,workpaper,raised_by,raised_on,point,response from review_points where engagement_id=$1 order by code',[e.id]),
  notes:await db.query('select actor,body,created_at from notes where engagement_id=$1 order by created_at',[e.id])};
}
export async function run(db,cmd,term,f={}){
 if(reads[cmd]){if(term)throw Error('This read takes no record');return db.query(reads[cmd]);}
 if(cmd==='insights'){if(term)throw Error('insights takes no record');const out={};for(const [q,sql] of questions)out[q]=await db.query(sql);return out;}
 if(fileReads.includes(cmd)){
  const e=await resolve(db,'engagements',term);
  if(cmd==='engagement')return engagementFile(db,e);
  if(cmd==='tb')return db.query('select account_code,account_name,report_line,workpaper,balance_cents,adjustments_cents,final_cents,proposed_cents,prior_cents from tb_final where engagement_id=$1 order by account_code',[e.id]);
  return {performance:await db.query("select section,label,prior_cents,current_cents from statement_lines where engagement_id=$1 and statement='performance' order by sort",[e.id]),
   profit:await db.query('select income_cents,expenses_cents,profit_cents,prior_profit_cents from performance_summary where engagement_id=$1',[e.id]),
   position:await db.query("select section,label,prior_cents,current_cents from statement_lines where engagement_id=$1 and statement='position' order by sort",[e.id]),
   check:await db.query('select assets_cents,liabilities_cents,net_assets_cents,opening_equity_cents,current_year_profit_cents,closing_equity_cents,(net_assets_cents-closing_equity_cents)::bigint difference_cents from position_summary where engagement_id=$1',[e.id])};
 }
 if(cmd==='add')return add(db,term,JSON.parse(fs.readFileSync(text(f.file,'file'),'utf8')),f.actor);
 if(mutations.includes(cmd)){
  const actor=text(f.actor,'actor');let result;const kind=target[cmd]||'engagements';
  const r=await resolve(db,kind,term,{lock:true});
  const e=kind==='engagements'?r:(await db.query('select * from engagements where id=$1 for update',[r.engagement_id]))[0];
  if(cmd!=='roll-forward')need(e.status==='issued',`${e.code} is issued and locked`);
  if(cmd==='log')result=await insert(db,'notes',{engagement_id:e.id,actor,body:text(f.note,'note')});
  if(cmd==='map'){
   stage(e,['open'],'Mapping');const a=await account(db,e,f.account);
   result=(await db.query('update tb_lines set report_line=$1,workpaper=$2 where id=$3 returning *',[await line(db,text(f.line,'line')),f.workpaper?text(f.workpaper,'workpaper'):a.workpaper,a.id]))[0];
  }
  if(cmd==='record-terms'){
   const on=past(f.on,'on');
   result=(await db.query('update engagements set terms_signed_on=$1,terms_reference=$2 where id=$3 returning *',[on,text(f.reference,'reference'),e.id]))[0];
  }
  if(cmd==='record-references'){
   stage(e,['open','prepared','reviewed'],'Recording references');need(!f['tax-reconciliation']&&!f['associated-persons'],'Give --tax-reconciliation, --associated-persons or both');
   result=(await db.query('update engagements set tax_reconciliation_reference=coalesce($1,tax_reconciliation_reference),associated_persons_reference=coalesce($2,associated_persons_reference) where id=$3 returning *',[f['tax-reconciliation']?text(f['tax-reconciliation'],'tax-reconciliation'):null,f['associated-persons']?text(f['associated-persons'],'associated-persons'):null,e.id]))[0];
  }
  if(cmd==='propose-adjustment'){
   stage(e,['open'],'Proposing an adjustment');const d=JSON.parse(fs.readFileSync(text(f.file,'file'),'utf8'));keys(d,['code','description','kind','lines']);
   need(!Array.isArray(d.lines)||d.lines.length<2,'A journal needs at least two lines');
   const lines=[];for(const l of d.lines){keys(l,['account','amount_cents']);lines.push({a:await account(db,e,l.account),amount:signed(l.amount_cents,'amount_cents',{nonzero:true})});}
   need(lines.reduce((s,l)=>s+l.amount,0)!==0,'Journal does not balance: debits and credits must net to zero');
   need(new Set(lines.map(l=>l.a.id)).size!==lines.length,'Use each account once per journal');
   result=await insert(db,'adjustments',{code:text(d.code,'code'),engagement_id:e.id,description:text(d.description,'description'),kind:choice(d.kind||'adjusting',['adjusting','reclassification'],'kind'),proposed_by:actor});
   for(const l of lines)await insert(db,'adjustment_lines',{adjustment_id:result.id,tb_line_id:l.a.id,amount_cents:l.amount});
  }
  if(cmd==='post-adjustment'){
   stage(e,['open'],'Posting an adjustment');need(r.status!=='proposed','Only proposed adjustments can be posted');
   result=(await db.query("update adjustments set status='posted',posted_on=$1,posted_by=$2 where id=$3 returning *",[past(f.on,'on'),actor,r.id]))[0];
  }
  if(cmd==='withdraw-adjustment'){
   stage(e,['open'],'Withdrawing an adjustment');need(r.status!=='proposed','Only proposed adjustments can be withdrawn');
   result=(await db.query("update adjustments set status='withdrawn',withdrawn_reason=$1 where id=$2 returning *",[text(f.reason,'reason'),r.id]))[0];
  }
  if(cmd==='prepare-workpaper'){
   stage(e,['open'],'Preparing a workpaper');const w=await workpaper(db,e,f.workpaper);need(w.reviewed_on,'Workpaper already reviewed');
   result=(await db.query('update workpapers set prepared_by=$1,prepared_on=$2,evidence_reference=$3,conclusion=$4 where id=$5 returning *',[actor,past(f.on,'on'),text(f.evidence,'evidence'),text(f.conclusion,'conclusion'),w.id]))[0];
  }
  if(cmd==='review-workpaper'){
   stage(e,['open','prepared'],'Reviewing a workpaper');const w=await workpaper(db,e,f.workpaper);need(!w.prepared_on,'Prepare the workpaper before review');need(w.reviewed_on,'Workpaper already reviewed');
   need(w.prepared_by.trim().toLowerCase()===actor.toLowerCase(),'The reviewer must be a different person from the preparer');
   const on=past(f.on,'on');need(on<w.prepared_on,'Review cannot predate preparation');
   const open=await db.query("select code from review_points where engagement_id=$1 and lower(workpaper)=lower($2) and status='open'",[e.id,w.code]);need(open.length,'Clear review points first: '+open.map(x=>x.code).join(', '));
   result=(await db.query('update workpapers set reviewed_by=$1,reviewed_on=$2 where id=$3 returning *',[actor,on,w.id]))[0];
  }
  if(cmd==='raise-point'){
   stage(e,['open','prepared'],'Raising a review point');const w=await workpaper(db,e,f.workpaper);need(w.reviewed_on,'Workpaper already reviewed');
   result=await insert(db,'review_points',{code:text(f.code,'code'),engagement_id:e.id,workpaper:w.code,point:text(f.point,'point'),raised_by:actor,raised_on:today()});
  }
  if(cmd==='clear-point'){
   need(r.status!=='open','Review point already cleared');const on=past(f.on,'on');need(on<r.raised_on,'Clearance cannot predate the point');
   result=(await db.query("update review_points set status='cleared',response=$1,cleared_by=$2,cleared_on=$3 where id=$4 returning *",[text(f.response,'response'),actor,on,r.id]))[0];
  }
  if(cmd==='answer-query'){
   need(r.status!=='open','Query already answered');const on=past(f.on,'on');need(on<r.asked_on,'Answer cannot predate the question');
   result=(await db.query("update queries set status='answered',answered_on=$1,answer=$2 where id=$3 returning *",[on,text(f.answer,'answer'),r.id]))[0];
  }
  if(cmd==='mark-prepared'){
   stage(e,['open'],'Marking prepared');const s=await status(db,e.id),on=past(f.on,'on');
   const ws=await db.query('select count(*)::integer n,max(prepared_on) last from workpapers where engagement_id=$1',[e.id]);
   const blockers=[[Number(s.tb_difference_cents)!==0,'trial balance out by '+(Number(s.tb_difference_cents)/100).toFixed(2)],[s.unmapped_lines>0,s.unmapped_lines+' unmapped account(s)'],[ws[0].n===0,'no workpapers'],[s.unprepared_workpapers>0,s.unprepared_workpapers+' workpaper(s) to prepare'],[s.proposed_adjustments>0,s.proposed_adjustments+' proposed adjustment(s) to post or withdraw'],[s.open_queries>0,s.open_queries+' open client quer(ies)'],[s.unexplained_movements>0,s.unexplained_movements+' movement(s) over materiality without a workpaper']].filter(x=>x[0]).map(x=>x[1]);
   need(blockers.length,'Not ready to mark prepared: '+blockers.join('; '));need(ws[0].last&&on<ws[0].last,'Preparation date cannot predate the last workpaper');
   result=(await db.query("update engagements set status='prepared',prepared_on=$1 where id=$2 returning *",[on,e.id]))[0];
  }
  if(cmd==='mark-reviewed'){
   stage(e,['prepared'],'Marking reviewed');need(actor.toLowerCase()===e.preparer.trim().toLowerCase(),'The preparer cannot mark their own file reviewed');
   const s=await status(db,e.id),on=past(f.on,'on');
   need(s.unreviewed_workpapers>0,s.unreviewed_workpapers+' workpaper(s) still to review');need(s.open_review_points>0,s.open_review_points+' open review point(s)');need(on<e.prepared_on,'Review cannot predate preparation');
   result=(await db.query("update engagements set status='reviewed',reviewed_on=$1 where id=$2 returning *",[on,e.id]))[0];
  }
  if(cmd==='sign'){
   stage(e,['reviewed'],'Partner sign-off');const s=await status(db,e.id),on=past(f.on,'on'),by=text(f.by,'by');
   need(s.terms_missing,'Record the terms of engagement before sign-off');
   need(s.minimum_requirements_apply&&(!e.tax_reconciliation_reference.trim()||!e.associated_persons_reference.trim()),'NZ minimum requirements apply: record the tax reconciliation and associated persons references first');
   need(on<e.reviewed_on,'Sign-off cannot predate review');
   result=(await db.query("update engagements set status='signed',signed_on=$1,signed_by=$2 where id=$3 returning *",[on,by,e.id]))[0];
  }
  if(cmd==='issue'){
   stage(e,['signed'],'Issuing');const on=past(f.on,'on');need(on<e.signed_on,'Issue cannot predate sign-off');
   result=(await db.query("update engagements set status='issued',issued_on=$1,issue_reference=$2 where id=$3 returning *",[on,text(f.reference,'reference'),e.id]))[0];
  }
  if(cmd==='roll-forward'){
   stage(e,['issued'],'Rolling forward');need((await db.query('select 1 from engagements where rolled_from=$1',[e.id])).length,`${e.code} has already been rolled forward`);
   result=(await db.query(`insert into engagements(code,client_id,kind,period_start,period_end,due_on,return_due_on,preparer,reviewer,materiality_cents,rolled_from)
    select $1,client_id,kind,(period_start+interval '1 year')::date,(period_end+interval '1 year')::date,$2,$3,preparer,reviewer,materiality_cents,id from engagements where id=$4 returning *`,[text(f.code,'code'),date(f.due,'due'),f['return-due']?date(f['return-due'],'return-due'):null,e.id]))[0];
   await db.query('insert into tb_lines(engagement_id,account_code,account_name,report_line,workpaper,balance_cents,prior_cents) select $1,account_code,account_name,report_line,workpaper,0,final_cents from tb_final where engagement_id=$2',[result.id,e.id]);
   await db.query('insert into workpapers(engagement_id,code,title,report_line) select $1,code,title,report_line from workpapers where engagement_id=$2',[result.id,e.id]);
  }
  await audit(db,actor,cmd,r.id,f);return result;
 }
 if(cmd==='export'){
  const out={format:'year-end-accounts-v1',exported_at:new Date().toISOString()};for(const t of tables)out[t]=await db.query(`select * from ${t} order by ${t==='report_lines'?'sort':'id'}`);
  if(f.out){fs.writeFileSync(f.out,JSON.stringify(out,null,2)+'\n',{flag:'wx'});return {file:path.resolve(f.out),records:tables.reduce((n,t)=>n+out[t].length,0)};}return out;
 }
 if(cmd==='weekly-review'||cmd==='draft-queries'){
  let body;
  if(cmd==='weekly-review'){const sections={};for(const c of ['deadlines','attention','queries','review-points'])sections[c]=await run(db,c);body='# Internal draft: weekly review\n\nGenerated '+today()+'. Review before sharing. No message sent.\n\n'+human(sections);}
  else{
   const e=await resolve(db,'engagements',term),c=(await db.query('select * from clients where id=$1',[e.client_id]))[0];
   const qs=await db.query("select code,question,due_on from queries where engagement_id=$1 and status='open' order by due_on,code",[e.id]);need(!qs.length,'No open queries on '+e.code);
   body=`# Draft: information still needed for ${c.name}\n\nGenerated ${today()}. Draft only. Check before sending. No message sent.\n\nTo finish the accounts for the year ended ${e.period_end}, we still need the following:\n\n`+qs.map((q,i)=>`${i+1}. ${q.question} (${q.code}, needed by ${q.due_on})`).join('\n')+`\n\nOnce these arrive we can complete the accounts by ${e.due_on}.\n`;
  }
  const dir=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,'drafts');fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,`${cmd}-${randomUUID()}.md`);
  fs.writeFileSync(file,body+'\n',{flag:'wx'});return {file};
 }
 throw Error('Unknown command: '+cmd);
}
