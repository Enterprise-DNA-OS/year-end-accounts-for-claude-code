---
description: Find overdue files and queries, stale review points, unmapped accounts and unexplained movements.
---

Read CLAUDE.md and docs/cli.md. Confirm the selected DATA_DIR or DATABASE_URL belongs to this practice. For the fictional demo set DATA_DIR=.data/demo and leave DATABASE_URL empty.

Read current records before stating a result. Keep NZD and AUD figures apart; every amount is in cents with debits positive.

Run:

```bash
node scripts/year-end.mjs attention --json
```

Report the result and any blockers in plain words. Ambiguous names must be resolved from the candidates printed by the CLI. Drafts stay local; this system never sends, lodges a return or changes another platform.
