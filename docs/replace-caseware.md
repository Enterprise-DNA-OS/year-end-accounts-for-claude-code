# Bring the trial balances across from Caseware

## Export from Caseware

In Caseware Cloud, open the engagement, go to the Data page, select Accounts and use Export to CSV. [Caseware's export guide](https://www.caseware.com/docs/en/cloud/caseware-cloud/engagement-management/accounts-and-analysis/export-adjustments-and-trial-balance-data) documents that path, and the same page exports adjustments. In Working Papers on the desktop, open the trial balance, select all and paste into a spreadsheet, or save a trial balance automatic document as an Excel file and save that as CSV ([Working Papers guide](https://documentation.caseware.com/2016/WorkingPapers/en/Content/Accounting_and_Assurance/Working_Trial_Balance/t_Exporting_Working_Trial_Balance.htm)). Menus differ between versions; check the help for yours.

Keep the account number, account name, map number, closing balance and prior year balance. Add columns for the client code, client name, entity type (company, ltc, trust, partnership, sole_trader or society), country (NZ or AU), file code, year start and year end. Several clients can sit in one CSV. Remove subtotal and total rows. Use dates in YYYY-MM-DD and balances as plain decimals without currency symbols or thousands separators. Debits are positive; credits are negative or in brackets.

## Map once, import with one command

Copy examples/caseware/mapping.json to imports/mapping.json and set each value to the exact header in your export. Keep real files under imports/ (ignored by git). The line and prior columns are optional. line_codes turns your Caseware map numbers into the statement lines in this build (REV, OTH, COS, EXP, DEP, TAX, CASH, REC, INV, PPE, PAY, GST, CUR, LOAN, EQ). A map number with no entry stops the import, so nothing is guessed. An empty map number imports the account unmapped, ready for /map.

```bash
node scripts/year-end.mjs import caseware --file=imports/trial-balance.csv --map=imports/mapping.json --preparer="Aroha" --reviewer="Grant" --due=2026-12-15 --materiality=5000 --actor="Operator" --dry-run --json
node scripts/year-end.mjs import caseware --file=imports/trial-balance.csv --map=imports/mapping.json --preparer="Aroha" --reviewer="Grant" --due=2026-12-15 --materiality=5000 --actor="Operator" --json
```

The preparer, reviewer, due date and materiality apply to files the import creates. One transaction takes the whole CSV. Each file's current and prior balances must net to zero, or nothing is saved. A repeated unchanged row is skipped. A changed row, or a client or file whose details differ from what is already recorded, stops for reconciliation instead of overwriting work. Accounts can only be added to an open file.

## What maps

Client code, name, entity type and country; file code and period; account code and name; current and prior balances; the statement line through your map numbers. Original rows and their fingerprints are kept. New files start open, with no workpapers, no sign-offs and terms of engagement still to record.

## What stays in Caseware until you reconcile it

Workpapers and their attachments, sign-off history, adjusting and reclassification journals, review notes, financial statement wording and disclosure notes, lead sheet layouts, prior year files and any audit work are not reconstructed. Export the adjustments separately if you need them, then propose and post each one here so it is recorded. Keep the Caseware files read-only for the retention period.

Compare the file count, account count and totals per file before you switch. Run /flux and /statements on two or three files you know well. The export command writes every record as JSON including original rows; it is a logical export, not a backup and restore tool.

No full Caseware migration in a day is promised. Once the mapping is checked, bringing the trial balances across is one command. Enterprise DNA can map your map numbers, bring prior years and adjustments across and shape your statement layout as scoped work.
