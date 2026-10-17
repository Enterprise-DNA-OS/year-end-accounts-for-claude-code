# CLI reference

Run node scripts/year-end.mjs --help. Output is an aligned table by default or JSON with --json. Options use --key=value; --json and --dry-run take no value. Unknown options fail. Ambiguous record names list ids and exit 1. Exact codes, case-insensitive client names and partial ids work. A file is resolved by its code (YE26-101) or its client's name.

All writes require --actor. Every CLI call is one database transaction. Failed writes and dry-run imports roll back. There is no implicit migration or seeding.

Amounts are whole cents. Debits are positive and credits negative. Dates are YYYY-MM-DD.

## Add records

node scripts/year-end.mjs add <kind> --file=<file.json> --actor="Operator" --json

JSON fields:

- client: code, name, entity_type (company, ltc, trust, partnership, sole_trader or society), jurisdiction (NZ or AU), manager, partner, minimum_requirements_exempt (optional, true or false), exemption_reason (required when exempt). Currency follows the jurisdiction.
- engagement: code, client, period_start, period_end, due_on, return_due_on (optional), preparer, reviewer (a different person), materiality_cents, kind (optional: annual_accounts or compilation).
- account: engagement, account_code, account_name, balance_cents, prior_cents (optional), report_line (optional), workpaper (optional). Open files only.
- workpaper: engagement, code, title, report_line (optional; the statement line it explains). Open files only.
- query: code, engagement, question, owner, due_on. Asked today.

Journal file for propose-adjustment: {"code":"ADJ-102","description":"...","kind":"adjusting","lines":[{"account":"6300","amount_cents":"250000"},{"account":"2000","amount_cents":"-250000"}]}. At least two lines, each account once, netting to zero.

Statement lines: REV, OTH, COS, EXP, DEP, TAX (performance); CASH, REC, INV, PPE, PAY, GST, CUR, LOAN, EQ (position).

## File stages

open, prepared, reviewed, signed, issued. Mapping, accounts, journals and workpaper preparation need an open file. Review work needs open or prepared. Issued files are locked except for roll-forward.

## Reads

### adjustments

`node scripts/year-end.mjs adjustments --json`

List proposed, posted and withdrawn journals with their effect on profit.

### attention

`node scripts/year-end.mjs attention --json`

Find overdue files and queries, stale review points, unmapped accounts and unexplained movements.

### clients

`node scripts/year-end.mjs clients --json`

Read the client list with entity type, country, manager and partner.

### compliance

`node scripts/year-end.mjs compliance --json`

Check terms of engagement, NZ minimum requirement references, balance and retention.

### deadlines

`node scripts/year-end.mjs deadlines --json`

List the files not yet issued by due date, with tax return dates.

### draft-queries

`node scripts/year-end.mjs draft-queries <file> --json`

Draft the letter asking a client for the information still needed.

### engagement

`node scripts/year-end.mjs engagement <file> --json`

Read one year-end file: status, workpapers, adjustments, queries, review points and notes.

### engagements

`node scripts/year-end.mjs engagements --json`

See every year-end file and what is still open on it.

### export

`node scripts/year-end.mjs export --out=year-end-backup.json --json`

Export every record and original source row as JSON.

### flux

`node scripts/year-end.mjs flux --json`

Analytical review: movements over materiality that no prepared workpaper explains.

### history

`node scripts/year-end.mjs history --json`

Read the recorded changes.

### insights

`node scripts/year-end.mjs insights --json`

Answer the ten questions across the practice's year-end files.

### queries

`node scripts/year-end.mjs queries --json`

Chase list of open client queries, oldest due first.

### review-points

`node scripts/year-end.mjs review-points --json`

List open review points and how long each has been open.

### statements

`node scripts/year-end.mjs statements <file> --json`

Read the statements of financial performance and position with the equity check.

### tb

`node scripts/year-end.mjs tb <file> --json`

Read a file's trial balance with posted and proposed adjustments and comparatives.

### weekly-review

`node scripts/year-end.mjs weekly-review --json`

Draft the Monday review from deadlines, attention, queries and review points.

### workpapers

`node scripts/year-end.mjs workpapers --json`

List workpapers still to prepare or review, by file.

## Writes

### add

`node scripts/year-end.mjs add <client|engagement|account|workpaper|query> --file=<file.json> --actor="<you>" --json`

Add a client, file, trial balance account, workpaper or client query from a JSON file.

### answer-query

`node scripts/year-end.mjs answer-query <Q code> --on=YYYY-MM-DD --answer="..." --actor="<you>" --json`

Record a client's answer to a query.

### clear-point

`node scripts/year-end.mjs clear-point <RP code> --on=YYYY-MM-DD --response="..." --actor="<you>" --json`

Clear a review point with the response.

### import

`node scripts/year-end.mjs import caseware --file=imports/trial-balance.csv --map=imports/mapping.json --preparer="..." --reviewer="..." --due=YYYY-MM-DD --materiality=5000 --actor="<you>" --dry-run --json`

Import a mapped Caseware trial balance export. Test with --dry-run first.

### issue

`node scripts/year-end.mjs issue <file> --on=YYYY-MM-DD --reference="..." --actor="<you>" --json`

Record that the signed accounts went to the client.

### log

`node scripts/year-end.mjs log <file> --note="..." --actor="<you>" --json`

Record an internal note on a file.

### map

`node scripts/year-end.mjs map <file> --account=<code> --line=<REV|EXP|...> [--workpaper=<code>] --actor="<you>" --json`

Map an account to a statement line and workpaper.

### mark-prepared

`node scripts/year-end.mjs mark-prepared <file> --on=YYYY-MM-DD --actor="<preparer>" --json`

Mark a file prepared once it balances, is mapped, explained and has no open queries.

### mark-reviewed

`node scripts/year-end.mjs mark-reviewed <file> --on=YYYY-MM-DD --actor="<reviewer>" --json`

Mark a file reviewed once every workpaper is reviewed and every point cleared.

### post-adjustment

`node scripts/year-end.mjs post-adjustment <ADJ code> --on=YYYY-MM-DD --actor="<you>" --json`

Post a proposed journal into the final balances.

### prepare-workpaper

`node scripts/year-end.mjs prepare-workpaper <file> --workpaper=<code> --on=YYYY-MM-DD --evidence="..." --conclusion="..." --actor="<preparer>" --json`

Record a prepared workpaper with its evidence and conclusion.

### propose-adjustment

`node scripts/year-end.mjs propose-adjustment <file> --file=<journal.json> --actor="<you>" --json`

Propose a balanced journal from a JSON file. It does not touch the balances until posted.

### raise-point

`node scripts/year-end.mjs raise-point <file> --workpaper=<code> --code=<RP code> --point="..." --actor="<reviewer>" --json`

Raise a review point on a workpaper.

### record-references

`node scripts/year-end.mjs record-references <file> --tax-reconciliation="..." --associated-persons="..." --actor="<you>" --json`

Record where the tax reconciliation and associated persons disclosure sit (NZ companies).

### record-terms

`node scripts/year-end.mjs record-terms <file> --on=YYYY-MM-DD --reference="..." --actor="<you>" --json`

Record the signed terms of engagement for a file.

### review-workpaper

`node scripts/year-end.mjs review-workpaper <file> --workpaper=<code> --on=YYYY-MM-DD --actor="<reviewer>" --json`

Record a workpaper review by someone other than the preparer.

### roll-forward

`node scripts/year-end.mjs roll-forward <file> --code=<new code> --due=YYYY-MM-DD [--return-due=YYYY-MM-DD] --actor="<you>" --json`

Open next year's file from an issued one: accounts, comparatives and workpaper index carried across.

### sign

`node scripts/year-end.mjs sign <file> --on=YYYY-MM-DD --by="<partner>" --actor="<you>" --json`

Record partner sign-off once terms and required references are in place.

### withdraw-adjustment

`node scripts/year-end.mjs withdraw-adjustment <ADJ code> --reason="..." --actor="<you>" --json`

Withdraw a proposed journal with a reason.
