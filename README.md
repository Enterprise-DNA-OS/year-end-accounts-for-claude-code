# Year-End Accounts for Claude Code

Trial balances, workpapers, adjustments, client queries, review points and partner sign-off in a database the practice owns. MIT code from Enterprise DNA. Works with Claude Code, Codex, OpenCode or Cursor.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free code. Install, run the demo and map your trial balance export. Database hosting and coding-agent costs are yours. | Your statement lines, workpaper index, sign-off rules and Caseware mapping. [Get your version built](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=caseware&utm_medium=readme). | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. [Book a call](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=caseware&utm_medium=readme). |

## From a client's trial balance to signed accounts

An accounting practice takes each client's ledger at balance date, maps every account to a line in the statements, explains the movements, asks the client for what is missing, has a second person review the file and gets the partner to sign. This build keeps that file in one database and tells the team which files are late, which queries are overdue and what still holds sign-off.

Caseware does not publish prices. Caseware Cloud is licensed by active user and bought through its sales team. Ask for your own renewal figure before you compare. [Caseware licence notes](https://www.caseware.com/docs/en/cloud/caseware-cloud/explore/licenses-and-mycaseware/before-buying-a-caseware-cloud-license), checked 17 October 2026.

The free version covers special purpose year-end accounts for small NZ and AU clients: the trial balance, mapping, journals, workpapers, queries, review and sign-off. It does not audit, draft general purpose disclosures, produce XBRL, prepare or lodge tax returns, or connect to a ledger live. This is not a full Caseware replacement out of the box.

## Quick start

Node 20 or newer. No server is needed for the embedded demo.

```bash
git clone https://github.com/Enterprise-DNA-OS/year-end-accounts-for-claude-code.git
cd year-end-accounts-for-claude-code
npm install
npm test
npm run demo
```

The demo ignores DATABASE_URL and uses .data/demo. Read it on Linux or macOS:

```bash
DATA_DIR=.data/demo node scripts/year-end.mjs deadlines
DATA_DIR=.data/demo node scripts/year-end.mjs statements YE26-103
DATA_DIR=.data/demo npm run view
DATA_DIR=.data/demo npm run docs
```

In PowerShell set $env:DATA_DIR='.data/demo' and run without the DATA_DIR prefix. Then open the folder in Claude Code and type /attention. For real records choose a fresh DATA_DIR, run npm run migrate, then import without seeding. DATABASE_URL selects your controlled PostgreSQL database. Never commit connection settings.

## Recurring work

| Job | Command |
|---|---|
| Read the client list with entity type, country, manager and partner | /clients |
| See every year-end file and what is still open on it | /engagements |
| List the files not yet issued by due date, with tax return dates | /deadlines |
| Read one year-end file: status, workpapers, adjustments, queries, review points and notes | /engagement |
| Read a file's trial balance with posted and proposed adjustments and comparatives | /tb |
| Read the statements of financial performance and position with the equity check | /statements |
| Analytical review: movements over materiality that no prepared workpaper explains | /flux |
| List workpapers still to prepare or review, by file | /workpapers |
| Chase list of open client queries, oldest due first | /queries |
| List open review points and how long each has been open | /review-points |
| List proposed, posted and withdrawn journals with their effect on profit | /adjustments |
| Find overdue files and queries, stale review points, unmapped accounts and unexplained movements | /attention |
| Check terms of engagement, NZ minimum requirement references, balance and retention | /compliance |
| Read the recorded changes | /history |
| Answer the ten questions across the practice's year-end files | /insights |
| Add a client, file, trial balance account, workpaper or client query from a JSON file | /add |
| Record an internal note on a file | /log |
| Map an account to a statement line and workpaper | /map |
| Record the signed terms of engagement for a file | /record-terms |
| Record where the tax reconciliation and associated persons disclosure sit (NZ companies) | /record-references |
| Propose a balanced journal from a JSON file. It does not touch the balances until posted | /propose-adjustment |
| Post a proposed journal into the final balances | /post-adjustment |
| Withdraw a proposed journal with a reason | /withdraw-adjustment |
| Record a prepared workpaper with its evidence and conclusion | /prepare-workpaper |
| Record a workpaper review by someone other than the preparer | /review-workpaper |
| Raise a review point on a workpaper | /raise-point |
| Clear a review point with the response | /clear-point |
| Record a client's answer to a query | /answer-query |
| Mark a file prepared once it balances, is mapped, explained and has no open queries | /mark-prepared |
| Mark a file reviewed once every workpaper is reviewed and every point cleared | /mark-reviewed |
| Record partner sign-off once terms and required references are in place | /sign |
| Record that the signed accounts went to the client | /issue |
| Open next year's file from an issued one: accounts, comparatives and workpaper index carried across | /roll-forward |
| Import a mapped Caseware trial balance export. Test with --dry-run first | /import |
| Export every record and original source row as JSON | /export |
| Draft the Monday review from deadlines, attention, queries and review points | /weekly-review |
| Draft the letter asking a client for the information still needed | /draft-queries |
| Render the branded read-only dashboards | /view |
| Render statements, query letters and sign-off sheets | /documents |
| Change fields, lines and rules to fit the practice | /customise |
| Add a read-only report from a question | /new-view |

## Ten questions across the year-end files

The insights command runs these ten queries today. They are examples for the free version, not a claim that a configured Caseware file cannot answer them one client at a time.

1. Which year-end files are past their due date and not yet issued?
2. Which trial balances do not balance after posted adjustments?
3. Which accounts are still not mapped to a statement line?
4. Which movements over materiality have no prepared workpaper?
5. Which client queries are overdue and who owns the chase?
6. Which review points have been open longer than seven days?
7. Which files are held from sign-off only by missing references?
8. What profit does each file report against last year?
9. Which preparers carry the most workpapers still to prepare?
10. Which proposed adjustments are waiting, and what do they do to profit?

## Your first hour: ten things to ask for

1. Show every file not yet issued, soonest due first.
2. What needs attention across the practice today?
3. Show the statements for Swan Valley with last year beside them.
4. Which movements over materiality has nobody explained?
5. Draft the letter asking Harbour Joinery for the loan statement.
6. Which review points have been open more than a week?
7. Post the depreciation journal on YE26-101 once I confirm it.
8. Put our practice name and logo on the statements.
9. Test our Caseware trial balance export without saving anything.
10. Add a statement line for donations and map account 6800 to it.

## Import and export

```bash
node scripts/year-end.mjs import caseware --file=examples/caseware/trial-balance.csv --map=examples/caseware/mapping.json --preparer="Aroha" --reviewer="Grant" --due=2026-12-15 --materiality=1000 --actor="Operator" --dry-run --json
node scripts/year-end.mjs import caseware --file=examples/caseware/trial-balance.csv --map=examples/caseware/mapping.json --preparer="Aroha" --reviewer="Grant" --due=2026-12-15 --materiality=1000 --actor="Operator" --json
node scripts/year-end.mjs export --out=year-end-backup.json --json
```

Export the trial balance from Caseware, add the client and period columns, map your columns and map numbers once, then import with one command. Balances are plain decimals, debits positive and credits negative or in brackets. Each file in the export must balance or nothing is saved. Original rows are kept. Unchanged repeat rows are skipped; changed rows stop for reconciliation. Clients, files, accounts, balances, comparatives and mapping come across. Workpapers, sign-offs, journals, notes and attachments do not. Read the [switch guide](docs/replace-caseware.md).

## Views, documents and controls

Set the practice name, logo and colours in brand.json. npm run view renders the year-end week, the state of every file, and client queries with review points. npm run docs renders financial statements with comparatives, the client query letter and a workpaper index with sign-offs for each file. Statements for a file that is not signed are drafts.

A file moves open, prepared, reviewed, signed, issued, and each step checks its own conditions. Prepared needs a balanced, fully mapped trial balance, every workpaper prepared, no proposed journals, no open queries and a workpaper behind every movement over materiality. Reviewed needs every workpaper reviewed by someone other than its preparer and every review point cleared. Signed needs the terms of engagement and, for NZ companies under the minimum requirements, the tax reconciliation and associated persons references. Issued files are locked; roll forward opens next year with the accounts, comparatives and workpaper index carried across.

The [record checks](docs/compliance.md) are prompts, not professional sign-off. An owner can change records and audit history. Shared use needs reviewed access and backups. There is no client portal, ledger feed, document upload, e-signature or tax lodgement. [Why no front end](docs/why-no-front-end.md) explains the scope.

## Verification

npm test uses a temporary database and runs every read and write, each sign-off gate, unbalanced journals, preparer and reviewer separation, roll-forward, import conflicts and rollback, dry runs, exports, drafts and escaped HTML. CI runs on Windows and Linux with Node 20 and 22, plus PostgreSQL 17. TEST_DATABASE_URL must point to a disposable test database; the suite creates and drops its own schema.

## Licence

MIT. Copyright (c) 2026 Enterprise DNA. Caseware is a trademark of Caseware International Inc. This independent project is not affiliated with or endorsed by Caseware.
