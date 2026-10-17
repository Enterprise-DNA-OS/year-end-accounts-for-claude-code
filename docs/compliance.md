# Record checks for year-end files

Checked 17 October 2026. The compliance command finds gaps in the records. It does not read the statements for meaning, decide whether an entity is exempt, or certify a practice or a file. The partner remains responsible for the accounts and the professional standards that apply to the engagement.

| Check | Source | Implementation and limit |
|---|---|---|
| Terms of engagement recorded (AU) | [APES 305 Terms of Engagement](https://www.apesb.org.au/terms-of-engagement) | AU files without a recorded terms date and reference are listed, and sign-off is refused until both are recorded. The reference points to the engagement document; the software does not read it or check its contents, including the outsourcing and cloud disclosures APES 305 asks for. |
| Terms of engagement recorded (NZ) | Practice policy | NZ files use the same gate as a local control. No NZ rule is cited for it here; set it to your professional body's requirements. |
| NZ minimum requirements: tax reconciliation and associated persons | [Tax Administration (Financial Statements) Order 2014](https://legislation.govt.nz/regulation/public/2014/0069/latest/whole.html), [Inland Revenue commentary](https://www.taxtechnical.ird.govt.nz/new-legislation/order-in-council-articles/tax-administration-financial-statements-order-2014) | NZ companies and look-through companies are treated as in scope unless the client record carries an exemption and its reason (for example the small or non-active company exemptions in the Order). Sign-off needs a reference to the tax reconciliation and to the associated persons disclosure. The check confirms a reference exists, not that the disclosure is complete. Domestic trusts fall under a separate 2022 order that this build does not encode. |
| Double-entry accounts | Practice control | A trial balance whose final balances do not net to zero is listed, and the file cannot be marked prepared. |
| Record retention | [Inland Revenue: keeping records](https://www.ird.govt.nz/managing-my-tax/record-keeping/records-of-income-and-expenses) (Tax Administration Act 1994 s22, 7 years), [ATO record keeping](https://www.ato.gov.au/forms-and-instructions/fund-income-tax-return-2026-instructions/general-administration-for-funds) (ITAA 1936 s262A, 5 years) | Each file shows a retain-until date: period end plus 7 years for NZ, plus 5 years for AU. A file past that date is listed for a retention review. These are the client's tax record periods, used as a prompt; your own professional and insurance obligations may be longer. Inland Revenue can ask for records to be kept up to 3 more years during an audit. Nothing is deleted automatically. |

Preparer and reviewer separation, materiality, and the requirement that every movement over materiality has a prepared workpaper are practice quality controls, not statutory rules. The demo materiality figures are examples.

Filing dates are entered per file from the practice's own tax agent lodgement records; the build does not calculate Inland Revenue or ATO due dates.

Do not store tax file numbers, IRD numbers, bank credentials or identity documents here. Imported source rows, exports and local drafts hold client information and need the same access and retention controls as the database.
