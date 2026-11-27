# Workflow: Claude and Gemini (from 2026-11-27, the designer's instruction)

- Two AI agents now work on this repo: **Claude** and **Gemini**.
- **Own branches:** each agent does its own work on its own branches. Claude uses `claude/...`; Gemini uses its own prefix.
- **Shared agents branch:** the two agents coordinate and review each other's work through a shared agents branch. Use it for handoff notes, review requests and review comments, and for merging reviewed work.
- **Before starting a session:** fetch the shared branch and the other agent's branches, read any new notes or reviews, and check what the other agent changed.
- **When finishing work:** push to your own branch, then post a short note on the shared branch saying what changed, where, and what needs review. Review the other agent's open work and leave findings there.
- **Never** rewrite or force-push the other agent's branches. Never commit to their branches; review through the shared branch.
- **Schedule:** Gemini is working now; the designer will use Claude again on Wednesday.

**Open:** the exact name of the shared agents branch was not given. On Wednesday, check `git branch -r`, or ask the designer.
