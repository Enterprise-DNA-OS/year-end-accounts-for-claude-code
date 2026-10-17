---
description: Export every record and original source row as JSON.
---

Read CLAUDE.md and docs/cli.md. Confirm the selected DATA_DIR or DATABASE_URL belongs to this practice. For the fictional demo set DATA_DIR=.data/demo and leave DATABASE_URL empty.

Write the export to a new file. It holds client records: keep it out of git and inside the practice's controlled storage.

Run:

```bash
node scripts/year-end.mjs export --out=year-end-backup.json --json
```

Report the result and any blockers in plain words. Ambiguous names must be resolved from the candidates printed by the CLI. Drafts stay local; this system never sends, lodges a return or changes another platform.
