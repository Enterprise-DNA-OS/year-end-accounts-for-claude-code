# The year-end file without another application

The team talks to a coding agent, which reads the database through one CLI. Dashboards and documents are static read-only HTML. There is no background service.

A screen gives a practice drag-and-drop lead sheets, side-by-side document review, tick marks on scanned evidence, a client portal and e-signature. This free version does not provide those. The preparer records evidence references and conclusions; the evidence itself stays in the practice's document store.

Use this for a staffed practice that can work from records and files. Do not use it for audits, general purpose reporting or anything that needs a regulator's format. Enterprise DNA scopes those screens and connections around the practice as paid work.

Database access is the security boundary. The embedded database is a single-process local store. PostgreSQL supports shared storage, but a shared service needs reviewed identities, permissions, backups and retention. Actor labels are not authenticated identities and an owner can change the history.
