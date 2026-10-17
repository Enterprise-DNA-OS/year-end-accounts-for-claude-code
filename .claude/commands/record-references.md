---
description: Record where the tax reconciliation and associated persons disclosure sit (NZ companies).
---

Read CLAUDE.md and docs/cli.md. Confirm the selected DATA_DIR or DATABASE_URL belongs to this practice. For the fictional demo set DATA_DIR=.data/demo and leave DATABASE_URL empty.

Record only what has already happened or what the operator has decided. Never invent evidence, answers, dates or sign-offs. Say back the change in one line before running it. Every write needs --actor; the CLI refuses a step the file is not ready for and says why.

Run:

```bash
node scripts/year-end.mjs record-references <file> --tax-reconciliation="..." --associated-persons="..." --actor="<you>" --json
```

Report the result and any blockers in plain words. Ambiguous names must be resolved from the candidates printed by the CLI. Drafts stay local; this system never sends, lodges a return or changes another platform.
