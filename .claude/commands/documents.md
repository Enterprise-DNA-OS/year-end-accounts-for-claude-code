---
description: Render financial statements, client query letters and workpaper sign-off sheets in the practice brand.
---

Read CLAUDE.md and docs/cli.md. Confirm the selected DATA_DIR or DATABASE_URL belongs to this practice. For the fictional demo set DATA_DIR=.data/demo and leave DATABASE_URL empty.

Run:

```bash
npm run docs
```

Files land in docs-out/. Statements for a file that is not signed are drafts; say so. Check brand.json carries the practice name and logo. Nothing is sent.
