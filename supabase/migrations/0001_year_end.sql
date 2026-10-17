create function touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create table clients (
 id uuid primary key default gen_random_uuid(), code text not null unique, name text not null,
 entity_type text not null check(entity_type in ('company','ltc','trust','partnership','sole_trader','society')),
 jurisdiction text not null check(jurisdiction in ('NZ','AU')), currency text not null check(currency in ('NZD','AUD')),
 manager text not null, partner text not null, minimum_requirements_exempt boolean not null default false,
 exemption_reason text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(not minimum_requirements_exempt or length(trim(exemption_reason))>0)
);
create table engagements (
 id uuid primary key default gen_random_uuid(), code text not null unique, client_id uuid not null references clients(id),
 kind text not null default 'annual_accounts' check(kind in ('annual_accounts','compilation')),
 period_start date not null, period_end date not null, due_on date not null, return_due_on date,
 preparer text not null, reviewer text not null, materiality_cents bigint not null check(materiality_cents>0 and materiality_cents<=9007199254740991),
 status text not null default 'open' check(status in ('open','prepared','reviewed','signed','issued')),
 terms_signed_on date, terms_reference text not null default '',
 tax_reconciliation_reference text not null default '', associated_persons_reference text not null default '',
 prepared_on date, reviewed_on date, signed_on date, signed_by text not null default '', issued_on date, issue_reference text not null default '',
 rolled_from uuid references engagements(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(period_end>period_start), check(lower(trim(preparer))<>lower(trim(reviewer))),
 check(terms_signed_on is null or length(trim(terms_reference))>0),
 check(status='open' or prepared_on is not null),
 check(status not in ('reviewed','signed','issued') or reviewed_on>=prepared_on),
 check(status not in ('signed','issued') or (signed_on>=reviewed_on and length(trim(signed_by))>0)),
 check(status<>'issued' or (issued_on>=signed_on and length(trim(issue_reference))>0))
);
create table report_lines (
 code text primary key, label text not null, statement text not null check(statement in ('performance','position')),
 section text not null, sort integer not null, sign integer not null check(sign in (1,-1)),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table tb_lines (
 id uuid primary key default gen_random_uuid(), engagement_id uuid not null references engagements(id),
 account_code text not null, account_name text not null, report_line text references report_lines(code),
 workpaper text not null default '', balance_cents bigint not null check(abs(balance_cents)<=9007199254740991),
 prior_cents bigint not null default 0 check(abs(prior_cents)<=9007199254740991),
 source_row jsonb, source_hash text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(engagement_id,account_code)
);
create table adjustments (
 id uuid primary key default gen_random_uuid(), code text not null unique, engagement_id uuid not null references engagements(id),
 description text not null, kind text not null check(kind in ('adjusting','reclassification')),
 status text not null default 'proposed' check(status in ('proposed','posted','withdrawn')),
 proposed_by text not null, posted_on date, posted_by text not null default '', withdrawn_reason text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(status<>'posted' or (posted_on is not null and length(trim(posted_by))>0)),
 check(status<>'withdrawn' or length(trim(withdrawn_reason))>0)
);
create table adjustment_lines (
 id uuid primary key default gen_random_uuid(), adjustment_id uuid not null references adjustments(id),
 tb_line_id uuid not null references tb_lines(id), amount_cents bigint not null check(amount_cents<>0 and abs(amount_cents)<=9007199254740991),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table workpapers (
 id uuid primary key default gen_random_uuid(), engagement_id uuid not null references engagements(id),
 code text not null, title text not null, report_line text references report_lines(code),
 prepared_by text not null default '', prepared_on date, evidence_reference text not null default '', conclusion text not null default '',
 reviewed_by text not null default '', reviewed_on date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(engagement_id,code),
 check(prepared_on is null or (length(trim(prepared_by))>0 and length(trim(evidence_reference))>0 and length(trim(conclusion))>0)),
 check(reviewed_on is null or (prepared_on is not null and reviewed_on>=prepared_on and length(trim(reviewed_by))>0 and lower(trim(reviewed_by))<>lower(trim(prepared_by))))
);
create table queries (
 id uuid primary key default gen_random_uuid(), code text not null unique, engagement_id uuid not null references engagements(id),
 question text not null, owner text not null, asked_on date not null, due_on date not null,
 status text not null default 'open' check(status in ('open','answered')), answered_on date, answer text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(due_on>=asked_on), check(status<>'answered' or (answered_on>=asked_on and length(trim(answer))>0))
);
create table review_points (
 id uuid primary key default gen_random_uuid(), code text not null unique, engagement_id uuid not null references engagements(id),
 workpaper text not null, point text not null, raised_by text not null, raised_on date not null,
 status text not null default 'open' check(status in ('open','cleared')), response text not null default '', cleared_by text not null default '', cleared_on date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(status<>'cleared' or (cleared_on>=raised_on and length(trim(response))>0 and length(trim(cleared_by))>0))
);
create table notes (
 id uuid primary key default gen_random_uuid(), engagement_id uuid not null references engagements(id), actor text not null, body text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table audit_events (
 id uuid primary key default gen_random_uuid(), actor text not null, event text not null, record_id uuid not null, detail jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index engagements_client on engagements(client_id);
create index tb_lines_engagement on tb_lines(engagement_id);
create index adjustment_lines_adjustment on adjustment_lines(adjustment_id);
create index workpapers_engagement on workpapers(engagement_id);
create index queries_engagement on queries(engagement_id);
create index review_points_engagement on review_points(engagement_id);
do $$ declare t text; begin
 foreach t in array array['clients','engagements','report_lines','tb_lines','adjustments','adjustment_lines','workpapers','queries','review_points','notes','audit_events'] loop
 execute format('create trigger touch before update on %I for each row execute function touch_updated_at()',t);
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
 end loop;
end $$;
-- Statement lines are reference data: every trial balance account maps to one. Debits are positive in the
-- trial balance; sign turns a credit balance into a positive figure on the statement.
insert into report_lines(code,label,statement,section,sort,sign) values
 ('REV','Revenue','performance','Income',10,-1),
 ('OTH','Other income','performance','Income',20,-1),
 ('COS','Cost of sales','performance','Expenses',30,1),
 ('EXP','Operating expenses','performance','Expenses',40,1),
 ('DEP','Depreciation','performance','Expenses',50,1),
 ('TAX','Income tax expense','performance','Expenses',60,1),
 ('CASH','Cash and bank','position','Current assets',110,1),
 ('REC','Trade receivables','position','Current assets',120,1),
 ('INV','Inventory','position','Current assets',130,1),
 ('PPE','Property, plant and equipment','position','Non-current assets',140,1),
 ('PAY','Trade payables and accruals','position','Current liabilities',210,-1),
 ('GST','GST and tax payable','position','Current liabilities',220,-1),
 ('CUR','Shareholder and beneficiary current accounts','position','Current liabilities',225,-1),
 ('LOAN','Term loans','position','Non-current liabilities',230,-1),
 ('EQ','Capital and retained earnings','position','Equity',310,-1);
create view tb_final as
select t.id,t.engagement_id,e.code engagement,c.currency,t.account_code,t.account_name,t.report_line,t.workpaper,t.balance_cents,
 coalesce(a.adjusted,0)::bigint adjustments_cents,(t.balance_cents+coalesce(a.adjusted,0))::bigint final_cents,
 coalesce(p.proposed,0)::bigint proposed_cents,t.prior_cents
from tb_lines t join engagements e on e.id=t.engagement_id join clients c on c.id=e.client_id
left join (select l.tb_line_id,sum(l.amount_cents) adjusted from adjustment_lines l join adjustments j on j.id=l.adjustment_id where j.status='posted' group by l.tb_line_id) a on a.tb_line_id=t.id
left join (select l.tb_line_id,sum(l.amount_cents) proposed from adjustment_lines l join adjustments j on j.id=l.adjustment_id where j.status='proposed' group by l.tb_line_id) p on p.tb_line_id=t.id;
create view statement_lines as
select f.engagement_id,f.engagement,f.currency,r.code,r.label,r.statement,r.section,r.sort,
 (r.sign*sum(f.final_cents))::bigint current_cents,(r.sign*sum(f.prior_cents))::bigint prior_cents,
 (r.sign*(sum(f.final_cents)-sum(f.prior_cents)))::bigint movement_cents
from tb_final f join report_lines r on r.code=f.report_line group by f.engagement_id,f.engagement,f.currency,r.code,r.label,r.statement,r.section,r.sort,r.sign;
create view performance_summary as
select e.id engagement_id,e.code engagement,c.currency,
 coalesce(sum(s.current_cents) filter(where s.section='Income'),0)::bigint income_cents,
 coalesce(sum(s.current_cents) filter(where s.section='Expenses'),0)::bigint expenses_cents,
 (coalesce(sum(s.current_cents) filter(where s.section='Income'),0)-coalesce(sum(s.current_cents) filter(where s.section='Expenses'),0))::bigint profit_cents,
 (coalesce(sum(s.prior_cents) filter(where s.section='Income'),0)-coalesce(sum(s.prior_cents) filter(where s.section='Expenses'),0))::bigint prior_profit_cents
from engagements e join clients c on c.id=e.client_id left join statement_lines s on s.engagement_id=e.id and s.statement='performance' group by e.id,e.code,c.currency;
create view position_summary as
select e.id engagement_id,e.code engagement,c.currency,
 coalesce(sum(s.current_cents) filter(where s.section in ('Current assets','Non-current assets')),0)::bigint assets_cents,
 coalesce(sum(s.current_cents) filter(where s.section in ('Current liabilities','Non-current liabilities')),0)::bigint liabilities_cents,
 (coalesce(sum(s.current_cents) filter(where s.section in ('Current assets','Non-current assets')),0)-coalesce(sum(s.current_cents) filter(where s.section in ('Current liabilities','Non-current liabilities')),0))::bigint net_assets_cents,
 coalesce(sum(s.current_cents) filter(where s.section='Equity'),0)::bigint opening_equity_cents,
 p.profit_cents current_year_profit_cents,
 (coalesce(sum(s.current_cents) filter(where s.section='Equity'),0)+p.profit_cents)::bigint closing_equity_cents
from engagements e join clients c on c.id=e.client_id join performance_summary p on p.engagement_id=e.id
left join statement_lines s on s.engagement_id=e.id and s.statement='position' group by e.id,e.code,c.currency,p.profit_cents;
create view movements as
select s.engagement_id,s.engagement,s.currency,s.code line,s.label,s.current_cents,s.prior_cents,s.movement_cents,e.materiality_cents,
 exists(select 1 from workpapers w where w.engagement_id=s.engagement_id and w.report_line=s.code and w.prepared_on is not null) explained
from statement_lines s join engagements e on e.id=s.engagement_id where abs(s.movement_cents)>=e.materiality_cents;
create view engagement_status as
select e.id,e.code,c.code client_code,c.name client,c.jurisdiction,c.entity_type,c.currency,e.status,e.preparer,e.reviewer,c.partner,
 e.period_end,e.due_on,e.return_due_on,(e.due_on-current_date) days_to_due,
 coalesce(tb.difference,0)::bigint tb_difference_cents,coalesce(tb.unmapped,0)::integer unmapped_lines,
 coalesce(w.unprepared,0)::integer unprepared_workpapers,coalesce(w.unreviewed,0)::integer unreviewed_workpapers,
 coalesce(q.open_queries,0)::integer open_queries,coalesce(q.overdue_queries,0)::integer overdue_queries,
 coalesce(r.open_points,0)::integer open_review_points,coalesce(j.proposed,0)::integer proposed_adjustments,
 coalesce(m.unexplained,0)::integer unexplained_movements,
 (e.terms_signed_on is null) terms_missing,
 (c.jurisdiction='NZ' and c.entity_type in ('company','ltc') and not c.minimum_requirements_exempt) minimum_requirements_apply,
 (e.period_end+make_interval(years=>case when c.jurisdiction='NZ' then 7 else 5 end))::date retain_until
from engagements e join clients c on c.id=e.client_id
left join (select engagement_id,sum(final_cents) difference,count(*) filter(where report_line is null) unmapped from tb_final group by engagement_id) tb on tb.engagement_id=e.id
left join (select engagement_id,count(*) filter(where prepared_on is null) unprepared,count(*) filter(where reviewed_on is null) unreviewed from workpapers group by engagement_id) w on w.engagement_id=e.id
left join (select engagement_id,count(*) filter(where status='open') open_queries,count(*) filter(where status='open' and due_on<current_date) overdue_queries from queries group by engagement_id) q on q.engagement_id=e.id
left join (select engagement_id,count(*) filter(where status='open') open_points from review_points group by engagement_id) r on r.engagement_id=e.id
left join (select engagement_id,count(*) filter(where status='proposed') proposed from adjustments group by engagement_id) j on j.engagement_id=e.id
left join (select engagement_id,count(*) filter(where not explained) unexplained from movements group by engagement_id) m on m.engagement_id=e.id;
