# Year-End Accounts for Claude Code: operating instructions

Read current records through the CLI. This is an accounting practice's year-end file system: trial balances, mapping, journals, workpapers, client queries, review points and partner sign-off for small NZ and AU clients. Set the practice name, the operators and their roles here at setup. The sample data is fictional.

## Routing

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

## Working rules

- One CLI: scripts/year-end.mjs. Read docs/cli.md for inputs. Every write needs --actor and runs inside a transaction. Actor text records attribution; it is not authentication.
- Amounts are whole cents. Debits are positive, credits negative. Never add NZD and AUD together.
- Record work already done and evidence already held. Never invent a client answer, workpaper evidence, a review or a sign-off to get a file past a gate.
- The preparer and the reviewer are different people. Act as the person named in --actor; if you are unsure who that is, ask.
- Never send, lodge a return, delete or change a ledger or another platform. Letters and reviews go to drafts/ and a person decides what to send.
- Use an exact code when a name is ambiguous. Dates use YYYY-MM-DD.
- DATABASE_URL selects your controlled PostgreSQL database; otherwise DATA_DIR selects the embedded database. Use only the practice's authorised database. Never commit connection settings or client exports.
- Demo and tests force isolated storage. Production setup is migrate then import, without seed. Shared use needs reviewed access, backups and restore drills.
- An import is a mapped trial balance, not a full Caseware file migration. Changed repeat rows stop for reconciliation.
- Existing migrations are immutable once applied. Customise through a new numbered migration, update commands and reports, then run npm test.
- The checks do not certify compliance or replace professional judgement. Read docs/compliance.md.

## Storage

supabase/migrations holds the schema and the statement lines, views.json and documents.json the read-only reports, brand.json the practice's branding. The database is the source of truth. The database owner can edit records and audit history; this is not tamper-proof evidence.

Built and run as a managed service through Omni by Enterprise DNA. https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=caseware
