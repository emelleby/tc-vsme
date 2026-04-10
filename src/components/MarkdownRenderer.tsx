import { marked } from 'marked'
import { useMemo } from 'react'

// Escape characters that are special inside HTML attribute values.
function escapeAttr(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
}

// Allowlist of safe URL schemes; everything else is stripped.
const SAFE_URL = /^(?:https?|mailto):/i

// Strip raw HTML blocks and unsafe link protocols to prevent XSS.
// marked has no built-in sanitizer since v2; we override the renderer instead.
marked.use({
	gfm: true,
	breaks: true,
	renderer: {
		html() {
			// Drop raw HTML blocks rather than passing them through.
			return ''
		},
		link({ href, title, text }) {
			const url = href ?? ''
			if (!SAFE_URL.test(url)) {
				// Unsafe protocol (e.g. javascript:, data:, vbscript:) — render text only.
				return text
			}
			const safeHref = escapeAttr(url)
			const titleAttr = title ? ` title="${escapeAttr(title)}"` : ''
			return `<a href="${safeHref}"${titleAttr} rel="noopener noreferrer" target="_blank">${text}</a>`
		},
	},
})

export function MarkdownRenderer({ children }: { children: string }) {
	const html = useMemo(() => marked.parse(children) as string, [children])
	return (
		<div
			className="prose dark:prose-invert max-w-none prose-sm"
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	)
}
