# Memory System Implementation Plan

## Context

This implements a Hermes Agent + MemSearch memory system for the tc-vsme project. The goal is persistent, searchable memory across Claude Code sessions: a curated scratchpad (MEMORY.md), session daily logs, transcript capture, and vector search via memsearch.

The project currently has no memory infrastructure — no `context/` dir, no hooks, no memory instructions in CLAUDE.md. Clean slate.

---

## Current State (verified)

| Item | Status |
|------|--------|
| `context/` directory | Missing |
| `.claude/hooks/` | Missing |
| `.claude/settings.json` | Missing (only `settings.local.json` exists) |
| memsearch | Not installed |
| CLAUDE.md memory sections | None |
| AGENTS.md memory-write entry | None |
| `cron/jobs/` | Missing — skip cron steps |
| `~/.claude/hooks/pre-tool-memory.py` | Missing — skip step 8d |
| `.claude/skills/meta-wrap-up/SKILL.md` | Missing — skip step 8e |
| `context/learnings.md` | Missing — skip step 8c |
| `~/.claude/CLAUDE.md` | Missing — nothing to audit |

No conflicting memory instructions exist anywhere. Step 5 audit is clean.

---

## Implementation Steps

### 1. Install memsearch
```bash
pip install memsearch
```
First run downloads ONNX bge-m3 model (~558 MB, cached at `~/.cache/memsearch/`).

### 2. Create directory structure
```bash
mkdir -p context/memory context/transcripts
mkdir -p .claude/hooks
```

### 3. Create `context/MEMORY.md`
```markdown
<!-- Cap: 2,500 chars. Agent maintains via memory-write instructions. -->
# Working Memory

## Active Threads

## Environment Notes

## Pending Decisions
```

### 4. Create `context/USER.md`
```markdown
<!-- Cap: 1,375 chars. Updated by the agent when it learns preferences. -->
# User Profile

## About

## Preferences

## Working Style
```

### 5. Add memory sections to `CLAUDE.md`

Append the following block at the end of the existing `CLAUDE.md` (after the engineering principles). No existing content to remove or modify.

```markdown
## Session Startup (silent — do not output anything)

On every session start, read these files silently:
1. Read `context/USER.md` (~1.4 KB max)
2. Read `context/MEMORY.md` (~2.5 KB max, curated working scratchpad)
3. Read `context/memory/{today's date in YYYY-MM-DD}.md` if it exists
4. If today's memory file has no prior sessions, also read yesterday's

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

### 6. Create `.claude/hooks/transcript-capture.js`
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
    // Fire and forget
  }
}
```

### 7. Create `.claude/settings.json`
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
Note: This is a new file — `.claude/settings.local.json` already exists with permission rules and is untouched.

### 8. Create `.claude/skills/memory-write/SKILL.md`
Full content per the guide — memory-write skill with 2,500 char cap, dedup guard, add/replace/remove actions.

### 9. Update `AGENTS.md`

Add to the Agent Skills Index table (new row):
- `memory-write` | "remember this", "note that", "update memory", "forget about"

### 10. Update `.gitignore`

Append two lines:
```
context/transcripts/
.memsearch/
```

### 11. Configure memsearch
```bash
memsearch config set paths context/memory,context/transcripts
memsearch index
```

---

## Files Modified/Created

| Action | File |
|--------|------|
| Install | memsearch (pip) |
| Create | `context/MEMORY.md` |
| Create | `context/USER.md` |
| Create | `context/memory/` (directory) |
| Create | `context/transcripts/` (directory) |
| Create | `.claude/hooks/transcript-capture.js` |
| Create | `.claude/hooks/` (directory) |
| Create | `.claude/settings.json` |
| Create | `.claude/skills/memory-write/SKILL.md` |
| Modify | `CLAUDE.md` (append memory sections) |
| Modify | `AGENTS.md` (add memory-write row to skills index) |
| Modify | `.gitignore` (append 2 lines) |

**Skipped** (not applicable): cron jobs, `~/.claude/hooks/pre-tool-memory.py`, `.claude/skills/meta-wrap-up/SKILL.md`, `context/learnings.md`, `~/.claude/CLAUDE.md`

---

## Verification

1. Start a new Claude Code session — confirm it silently reads MEMORY.md and USER.md at startup
2. Say "remember that our staging URL is staging.example.com" — verify it writes to `context/MEMORY.md`
3. Check `context/transcripts/{today}.md` has an entry after a session ends
4. Run `memsearch index` then `memsearch search "staging"` — confirm it finds the entry
5. In a new session, ask "what's our staging URL?" — confirm Tier 0 finds it in MEMORY.md
