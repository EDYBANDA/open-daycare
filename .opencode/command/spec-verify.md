---
description: Verifies the Acceptance criteria checklist of a spec, fixes minor issues, re-verifies and marks the passing checks (agent spec-verifier).
agent: spec-verifier
---

# /spec-verify — Verify the acceptance criteria of a spec

## Session context

Current repository state:
!`git status --short`

Current branch:
!`git branch --show-current`

Specs available in this folder:
!`ls specs/ 2>/dev/null || echo "The specs/ folder does not exist"`

---

## Task

The received argument is: `$ARGUMENTS`

Run your full acceptance-criteria verification workflow (Phase 1 through Phase 5)
on this argument.

If `$ARGUMENTS` is empty:

- Use the specs listing above to ask the user which spec to verify.
- Do not guess and do not verify anything until the user names one.
