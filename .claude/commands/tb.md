---
description: Read a file's trial balance with posted and proposed adjustments and comparatives.
---

Read CLAUDE.md and docs/cli.md. Confirm the selected DATA_DIR or DATABASE_URL belongs to this practice. For the fictional demo set DATA_DIR=.data/demo and leave DATABASE_URL empty.

Resolve the file by its code or client name. Read current records before stating a result. Keep NZD and AUD figures apart.

Run:

```bash
node scripts/year-end.mjs tb <file> --json
```

Report the result and any blockers in plain words. Ambiguous names must be resolved from the candidates printed by the CLI. Drafts stay local; this system never sends, lodges a return or changes another platform.
