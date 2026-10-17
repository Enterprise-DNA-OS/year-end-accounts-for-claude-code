---
description: Draft the Monday review from deadlines, attention, queries and review points.
---

Read CLAUDE.md and docs/cli.md. Confirm the selected DATA_DIR or DATABASE_URL belongs to this practice. For the fictional demo set DATA_DIR=.data/demo and leave DATABASE_URL empty.

The draft goes to drafts/. Read it back, then tell the operator where it is. Nothing is sent.

Run:

```bash
node scripts/year-end.mjs weekly-review --json
```

Report the result and any blockers in plain words. Ambiguous names must be resolved from the candidates printed by the CLI. Drafts stay local; this system never sends, lodges a return or changes another platform.
