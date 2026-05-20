# Engineering Principles

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative. Brevity is KING**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code or comments unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

Do not overtest. Only run tests that you have written yourself for this specific TDD cycle.

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

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
