# Plan: Remove `streamdown` Dependency

## Status: Pending

## Context

The Cloudflare Worker bundle is **22.54 MiB**, far exceeding the **3 MiB** limit. Investigation revealed that `streamdown` is the single largest contributor to bundle bloat.

### What `streamdown` does

`streamdown` is a full-featured markdown rendering component with syntax highlighting (Shiki), diagram support (Mermaid), math rendering (KaTeX), and sanitization. It is used to render AI chat responses as rich markdown.

### Why it must be removed

| Dependency | Disk size | Bundle contribution |
|---|---|---|
| `streamdown` (full tree) | 44 MiB | ~13 MiB in Worker |
| `shiki` (pulled by streamdown) | 3.8 MiB | ~10 MiB (200+ language grammars + WASM oniguruma) |
| `mermaid` (pulled by streamdown) | 67 MiB | ~3.4 MiB |
| `katex` (pulled by streamdown) | — | ~1 MiB (50+ font files) |

`streamdown` transitively depends on 24 packages including `shiki`, `mermaid`, and `katex`. Even with tree-shaking, Shiki bundles all language grammars and the WASM oniguruma engine, and Mermaid includes the entire diagram rendering pipeline including Cytoscape.

The `marked` package (already a project dependency) can handle markdown rendering at ~38 KiB instead of ~13 MiB.

### Import locations

| File | Line | Usage |
|---|---|---|
| `src/components/RemyAssistant.tsx` | 4, 61 | Main app AI chat — renders assistant messages |
| `src/components/demo-AIAssistant.tsx` | 6, 58 | Demo AI chat — renders assistant messages |
| `src/routes/_demoLayout/demo/ai-chat.tsx` | 12, 121 | Demo route — renders chat messages |
| `src/routes/_demoLayout/demo/ai-structured.tsx` | 4, 290 | Demo route — renders structured results |

All four usages follow the same pattern:

```tsx
import { Streamdown } from 'streamdown'
// ...
<Streamdown>{part.content}</Streamdown>
```

The `<Streamdown>` component receives a markdown string as `children` and renders it as rich HTML.

---

## Implementation Checklist

### Phase 1: Create a lightweight replacement component

- [ ] **1.1** Create `src/components/MarkdownRenderer.tsx` — a thin wrapper around `marked` (already in `package.json`)
  - Configure `marked` with GFM support (`marked` supports GFM by default since v4)
  - Use `dangerouslySetInnerHTML` to render the parsed HTML
  - Apply the same `prose dark:prose-invert` Tailwind classes currently wrapping `<Streamdown>`
  - Keep the component interface simple: `<MarkdownRenderer>{markdownString}</MarkdownRenderer>`

  Suggested implementation:

  ```tsx
  import { marked } from 'marked'
  import { useMemo } from 'react'

  marked.use({ gfm: true, breaks: true })

  export function MarkdownRenderer({ children }: { children: string }) {
    const html = useMemo(() => marked.parse(children), [children])
    return (
      <div
        className="prose dark:prose-invert max-w-none prose-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }
  ```

- [ ] **1.2** If syntax highlighting is needed in the future, add `prism-react-renderer` (~40 KiB) as a targeted replacement — do NOT use Shiki or any WASM-based highlighter

### Phase 2: Replace all Streamdown imports

- [ ] **2.1** `src/components/RemyAssistant.tsx`
  - Remove `import { Streamdown } from 'streamdown'`
  - Add `import { MarkdownRenderer } from '@/components/MarkdownRenderer'`
  - Replace `<Streamdown>{part.content}</Streamdown>` with `<MarkdownRenderer>{part.content}</MarkdownRenderer>`

- [ ] **2.2** `src/components/demo-AIAssistant.tsx`
  - Remove `import { Streamdown } from 'streamdown'`
  - Add `import { MarkdownRenderer } from '@/components/MarkdownRenderer'`
  - Replace `<Streamdown>{part.content}</Streamdown>` with `<MarkdownRenderer>{part.content}</MarkdownRenderer>`

- [ ] **2.3** `src/routes/_demoLayout/demo/ai-chat.tsx`
  - Remove `import { Streamdown } from 'streamdown'`
  - Add `import { MarkdownRenderer } from '@/components/MarkdownRenderer'`
  - Replace `<Streamdown>{part.content}</Streamdown>` with `<MarkdownRenderer>{part.content}</MarkdownRenderer>`

- [ ] **2.4** `src/routes/_demoLayout/demo/ai-structured.tsx`
  - Remove `import { Streamdown } from 'streamdown'`
  - Add `import { MarkdownRenderer } from '@/components/MarkdownRenderer'`
  - Replace `<Streamdown>{result.markdown}</Streamdown>` with `<MarkdownRenderer>{result.markdown}</MarkdownRenderer>`

### Phase 3: Remove the package

- [ ] **3.1** Remove from `package.json` dependencies:
  ```bash
  bun remove streamdown
  ```

- [ ] **3.2** Verify no remaining imports:
  ```bash
  grep -rn 'streamdown\|Streamdown' src/ --include='*.tsx' --include='*.ts'
  # Should return nothing
  ```

### Phase 4: Verify build stability

- [ ] **4.1** Clean build:
  ```bash
  rm -rf dist/ bundled/ && bun run --bun build
  ```

- [ ] **4.2** Measure Worker bundle:
  ```bash
  bun wrangler deploy --outdir bundled/ --dry-run
  # Check "Total Upload" — should be significantly reduced
  ```

- [ ] **4.3** Target: expect ~9-10 MiB reduction (from 22.54 MiB → ~12 MiB)
  - Note: Shiki language grammars alone account for ~10 MiB of chunks
  - Mermaid + Cytoscape account for ~3.4 MiB
  - KaTeX fonts account for ~1 MiB in client assets

- [ ] **4.4** Run tests:
  ```bash
  bun run test
  ```

- [ ] **4.5** Run linter:
  ```bash
  bun run check
  ```

### Phase 5: Visual verification

- [ ] **5.1** Start dev server: `bun run dev`
- [ ] **5.2** Open the Remy Assistant chat and send a message with markdown formatting
- [ ] **5.3** Verify markdown renders correctly (bold, italic, lists, code blocks, links)
- [ ] **5.4** Note any visual regressions compared to the previous Streamdown rendering
  - Expected differences: no syntax highlighting in code blocks, no diagram rendering, no math rendering
  - These are acceptable tradeoffs for the bundle size reduction

---

## Future Improvements (optional, post-removal)

- Add `prism-react-renderer` (~40 KiB) for code syntax highlighting in chat if needed
- Add a client-side-only lazy-loaded markdown renderer for rich features (diagrams, math) that only loads on demand
- Consider `react-markdown` + `rehype-highlight` as a middle-ground alternative (~200 KiB total)

---

## Related

- `vite.config.ts` contains an `excludeDemoRoutes` plugin (added 2026-04-06) that stubs out `_demoLayout` routes in production. It does not reduce bundle size because the heavy deps come from shared components like `RemyAssistant.tsx`, not demo routes.
- Run 'bun wrangler deploy --outdir bundled/ --dry-run' to verify bundle size
- `bundle-stats.html` can be regenerated with `ANALYZE=1 bun run --bun build` for visual analysis
