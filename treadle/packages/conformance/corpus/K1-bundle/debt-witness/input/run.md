---
title: Run
type: Attested Computation
runtime: dbt
parameters:
  - {name: p1, type: string, required: true}
executor: {resource: runs/dbt.sh, receipt: [job_id]}
attester: {resource: checks/job.js}
stale_after: "2999-01-01T00:00:00Z"
---

# Computation

```sql
select 1
```
