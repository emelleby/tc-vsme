# Memory System Implementation Guide

Pass this entire file to an AI coding agent as a prompt. It will set up a complete memory system combining curated MEMORY.md snapshots with MemSearch (hybrid vector + keyword search for recall).

**What you get:**
- **Store**: auto daily logs + curated fact scratchpad + transcript capture
- **Inject**: frozen snapshot at session start (~3,000 tokens)
- **Recall**: tiered retrieval from zero-cost to semantic vector search
- **Agent-agnostic**: works with Claude Code, GitHub Copilot, Cursor, Codex, and others

**Assumes nothing.** Every step checks what exists before creating or modifying. Works on a fresh project or an existing setup.

---

## Step 1: Install MemSearch

Check if memsearch is already installed:

```bash
pip show memsearch 2>/dev/null
```

If not installed:

```bash
pip install memsearch
```

If you get a system packages error (common on Ubuntu/WSL), use:

```bash
pip install memsearch --break-system-packages
```

> **Note:** memsearch 0.4.3+ uses OpenAI embeddings (`text-embedding-3-small`) by default, not a local ONNX model. You will need an `OPENAI_API_KEY` for the vector search features. Store it via `memsearch config set embedding.api_key sk-...`. The curated MEMORY.md snapshot system works without this — memsearch is only needed for L1+ retrieval.

## Step 2: Create the folder structure

Check which folders exist, then create only the missing ones:

```bash
test -d context/memory || mkdir -p context/memory
test -d context/transcripts || mkdir -p context/transcripts
test -d .claude/hooks || mkdir -p .claude/hooks
```

These folders will hold:
- `context/memory/{YYYY-MM-DD}.md` — daily session logs
- `context/transcripts/{YYYY-MM-DD}.md` — transcript summaries from the Stop hook (Claude Code only)
- `context/MEMORY.md` — curated fact scratchpad (created next)

## Step 3: Create context/MEMORY.md

Check if `context/MEMORY.md` already exists. If it does, read it and leave it alone — it may contain curated facts from previous sessions. Only create if missing:

```markdown
<!-- Cap: 2,500 chars. Agent maintains via memory-write instructions. -->
# Working Memory

## Active Threads

## Environment Notes

## Pending Decisions
```

## Step 4: Create context/USER.md

Check if `context/USER.md` already exists. If it does, read it and leave it alone. Only create if missing:

```markdown
<!-- Cap: 1,375 chars. Updated by the agent when it learns preferences. -->
# User Profile

## About

## Preferences

## Working Style
```

## Step 5: Audit existing memory instructions

Before adding anything, read these files end to end (whichever exist) and search for any existing memory-related instructions:

1. **`CLAUDE.md`** — look for memory sections, `MEMORY.md` references, auto-memory rules, recall/retrieval instructions, memory budget rules, session startup memory loading
2. **`AGENTS.md`** (if it exists) — look for memory-related skill entries, memory tool references, memory conventions
3. **`.github/copilot-instructions.md`** (if it exists) — look for memory sections
4. **`~/.claude/CLAUDE.md`** (if it exists) — look for global memory rules

For each existing memory instruction you find:
1. List what you found (file, section name, what it does)
2. Determine if it conflicts with this guide's memory system
3. **Remove or update** conflicting instructions — this guide defines the single memory system
4. **Keep** instructions that are complementary

The goal: after this step, there is exactly one set of memory instructions across all files, not a mix of old and new.

## Step 6: Define the shared memory block

The following block must appear **identically** in every agent instruction file in your project. This ensures any agent — Claude Code, Copilot, Codex — gets the same memory behaviour regardless of which file it reads.

**Copy this block exactly as-is. Do not paraphrase.**

```markdown
## Session Startup (silent — do not output anything)

On every session start, read these files silently:
1. Read `context/USER.md` (~1.4 KB max)
2. Read `context/MEMORY.md` (~2.5 KB max, curated working scratchpad)
3. Read `context/memory/{today's date in YYYY-MM-DD}.md` if it exists
4. If today's memory file has no prior sessions, also read yesterday's
5. Check `.memsearch/last-indexed` — if missing or doesn't contain today's date (YYYY-MM-DD), run `memsearch index context/memory context/transcripts` then write today's date to `.memsearch/last-indexed`

These files are your "frozen snapshot" — loaded once at session start. Mid-session writes persist to disk but take effect next session. This preserves the prefix cache.

Total injected: ~3,000 tokens. Do not load more than this at startup.

### Memory Budget

- `context/MEMORY.md`: 2,500 character cap. Before writing, check `wc -c`. If over cap, consolidate existing entries before adding.
- `context/USER.md`: 1,375 character cap. Same rule.
- Mid-session writes to these files persist to disk but only appear in context next session (frozen snapshot pattern — preserves prefix cache).

### Memory Write

When the user says "remember this", "note that", "update memory", or "forget about":
1. Read `context/MEMORY.md` in full
2. Check for duplicates (scan for substring match)
3. Check character count: `wc -c < context/MEMORY.md`
4. If under 2,500 chars: append the new fact under the appropriate section
5. If over cap: consolidate — merge similar entries, remove stale ones, then add
6. Actions: add (append), replace (find substring + swap), remove (confirm with user first)
7. After writing: "Saved — will be active from next session."

### Memory Retrieval

When the user asks about past context, conversations, or decisions:

1. **Tier 0**: Check `context/MEMORY.md` and today's daily log — already in context, zero cost
2. **L1**: Run `memsearch search "query" --top-k 5` — hybrid vector + keyword search
3. **L2**: Run `memsearch expand <chunk_hash>` — returns full markdown section around the match
4. **L3**: Run `memsearch transcript <session_id>` — raw dialogue, last resort
5. **Fallback**: "I don't have a record of that."

Only escalate if the previous tier didn't find the answer.

### Daily Log

Track session activity in `context/memory/{YYYY-MM-DD}.md`. One file per day, numbered session blocks:

#### Session N
**Goal**: [one line, filled when user states their goal]
**Deliverables**: [files created/modified]
**Decisions**: [key decisions and rationale]
**Open threads**: [anything unfinished]

Log these silently as they happen. Never announce "I've logged that."
```

## Step 7: Add the memory block to all agent instruction files

Add the block from Step 6 to each of the following files. Check each file exists before acting — skip files that don't exist. If a file already contains a Session Startup section that conflicts with Step 6, replace it.

### 7a: CLAUDE.md (Claude Code)

If `CLAUDE.md` exists at the project root, read it first. Append the memory block at the end. If it already has a `## Session Startup` section, update it to match Step 6 exactly.

If `CLAUDE.md` doesn't exist, create it with just the memory block.

### 7b: AGENTS.md (Codex / OpenAI agents)

If `AGENTS.md` exists, read it first. Append the memory block at the end. If it already has a `## Session Startup` section, update it to match Step 6 exactly.

### 7c: .github/copilot-instructions.md (GitHub Copilot)

If `.github/` directory exists, check for `.github/copilot-instructions.md`.

- If the file exists: read it, append the memory block (or update the Session Startup section if one is present)
- If the file doesn't exist but `.github/` does: create `.github/copilot-instructions.md` containing only the memory block
- If `.github/` doesn't exist: skip this step

### 7d: Cursor / Windsurf (optional)

If `.cursor/rules/` exists, create `.cursor/rules/memory.mdc` with the memory block.

If `.windsurfrules` exists, append the memory block to it.

**Critical:** After completing 7a–7d, verify that every agent instruction file you modified contains the *identical* text from Step 6. These files must stay in sync — if you update one, update all.

## Step 8: Create the transcript capture hook (Claude Code only)

This hook captures the first 500 characters of each Claude Code response into a daily transcript file, giving memsearch something to search over.

Check if `.claude/hooks/` directory exists — create it if missing. Check if `transcript-capture.js` already exists — skip if it does.

Create `.claude/hooks/transcript-capture.js`:

```javascript
const fs = require('fs');
const path = require('path');

const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));

if (input.stop_reason === 'end_turn' && input.response) {
  const today = new Date().toISOString().slice(0, 10);
  const dir = path.join(process.env.CLAUDE_PROJECT_DIR || '.', 'context', 'transcripts');
  const file = path.join(dir, `${today}.md`);

  try {
    fs.mkdirSync(dir, { recursive: true });
    const summary = input.response.slice(0, 500).replace(/\n{3,}/g, '\n\n');
    const timestamp = new Date().toISOString().slice(11, 19);
    const entry = `\n## ${timestamp}\n${summary}\n`;
    fs.appendFileSync(file, entry);
  } catch (e) {
    // Fire and forget — don't break the session
  }
}
```

Register it in `.claude/settings.json`. Read the file first:
- If it doesn't exist, create it with the hook config below
- If it exists, check whether a `Stop` hook array already contains `transcript-capture.js` — skip if already registered
- If it exists but has no `Stop` hooks, merge the entry into the existing structure

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/transcript-capture.js"
          }
        ]
      }
    ]
  }
}
```

## Step 9: Create the memory-write skill

Check if `.claude/skills/memory-write/SKILL.md` already exists — skip if it does.

Create `.claude/skills/memory-write/SKILL.md`:

```markdown
---
name: memory-write
description: >
  Saves durable facts to context/MEMORY.md. Triggers on "remember this",
  "note that", "update memory", "save this", "forget about". Three actions:
  add (append under correct section), replace (substring match + swap),
  remove (confirm with user first). Enforces 2,500 char cap with dedup guard.
---

# Memory Write

## Outcome
- Fact added to, updated in, or removed from `context/MEMORY.md`
- Character cap enforced (2,500 chars)
- Confirmation message: "Saved — will be active from next session."

## Steps

1. Read `context/MEMORY.md` in full
2. Determine action: add, replace, or remove
3. **Dedup check**: scan for substring match — if the fact already exists, skip or update
4. **Cap check**: run `wc -c < context/MEMORY.md` — if over 2,500, consolidate before adding
5. Write the change
6. Confirm: "Saved — will be active from next session."

For **remove**: always confirm with the user before deleting.

## Sections in MEMORY.md
- `## Active Threads` — current work, open questions
- `## Environment Notes` — URLs, API keys (names only), tool versions, project structure
- `## Pending Decisions` — decisions that need to be made

## Rules
- Never exceed 2,500 characters
- Always check for duplicates before adding
- Replace is preferred over add when updating existing facts
```
Copy `.claude/skills/memory-write/SKILL.md` to `.agents/skills/memory-write/SKILL.md` and to `.kilocode/skills/memory-write/SKILL.md`

## Step 10: Update .gitignore

Check if `.gitignore` exists — create it if missing. Read it first, then only add lines that aren't already present:

```
context/transcripts/
.memsearch/
```

`context/transcripts/` is local-only (agent-generated, noisy). `.memsearch/` contains the vector database and the `last-indexed` sentinel file — both are local state that should not be committed.

`context/memory/` and `context/MEMORY.md` **should be committed** — they are the durable memory that travels with the repo.

## Step 11: Verify

Run through this checklist after setup:

1. **Startup**: Start a new agent session — confirm it reads `MEMORY.md` and `USER.md` silently at startup without announcing it
2. **Index check**: Confirm the agent checks `.memsearch/last-indexed` and runs `memsearch index context/memory context/transcripts` on first run of the day
3. **Memory write**: Say "remember that our staging URL is staging.example.com" — confirm it writes to `context/MEMORY.md` under `## Environment Notes`
4. **Transcript capture** (Claude Code): Have a short conversation, then check `context/transcripts/{today}.md` has entries
5. **Search** (requires OPENAI_API_KEY): Run `memsearch search "staging"` — confirm it finds the entry
6. **Tier 0 recall**: In a new session, ask "what's our staging URL?" — confirm it finds it in `MEMORY.md` without running memsearch
7. **Sync check**: Confirm `## Session Startup` block is identical in all agent instruction files (CLAUDE.md, AGENTS.md, .github/copilot-instructions.md)

---

## Architecture Summary

### Why not a cron job for memsearch indexing?

Cron jobs are system-dependent and don't travel with the repo. Instead, the agent checks a sentinel file (`.memsearch/last-indexed`) at session startup and self-indexes if it hasn't run today. This is:
- **Project-portable**: cloning the repo is enough, no system setup
- **Agent-agnostic**: any agent following the startup instructions will do it
- **Once-per-day**: the sentinel prevents redundant indexing within a session

### Why keep MEMORY.md files under version control?

`context/memory/` daily logs and `context/MEMORY.md` represent durable project knowledge — decisions made, environment details, open threads. Committing them means teammates inherit your context when they clone the repo, and the history is preserved in git. Transcripts are excluded because they're noisy and agent-specific.

### Why identical blocks across agent instruction files?

Different agents read different files: Claude Code reads `CLAUDE.md`, Copilot reads `.github/copilot-instructions.md`, Codex reads `AGENTS.md`. Keeping the memory block identical across all of them ensures consistent behaviour regardless of which agent is active, without maintaining separate logic per tool.

---

## Files Created/Modified

| Action | File | Notes |
|--------|------|-------|
| Install | `memsearch` (pip) | Requires Python |
| Create (if missing) | `context/MEMORY.md` | Curated scratchpad, committed to git |
| Create (if missing) | `context/USER.md` | User profile, committed to git |
| Create | `context/memory/` | Daily logs directory, committed to git |
| Create | `context/transcripts/` | Transcript directory, gitignored |
| Create (if missing) | `.claude/hooks/transcript-capture.js` | Claude Code only |
| Create or modify | `.claude/settings.json` | Registers Stop hook |
| Create (if missing) | `.claude/skills/memory-write/SKILL.md` | Claude Code only |
| Modify | `CLAUDE.md` | Append memory block |
| Modify (if exists) | `AGENTS.md` | Append memory block (identical to CLAUDE.md) |
| Create or modify | `.github/copilot-instructions.md` | Memory block only |
| Modify | `.gitignore` | Add `context/transcripts/` and `.memsearch/` |
