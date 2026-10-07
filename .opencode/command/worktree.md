---
description: Create a new git worktree with an auto-generated name based on context
---

Convert the user's input into a valid worktree name by:
- Converting spaces to hyphens
- Converting to lowercase
- Removing special characters (keep only alphanumeric and hyphens)

Then execute this command exactly:
git worktree add .worktrees/<generated-name>

Use "$ARGUMENTS" as the input to generate the name. Do not change directories. Do not do anything else.
