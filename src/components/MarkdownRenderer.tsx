import { marked } from 'marked'
import { useMemo } from 'react'

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
			if (/^javascript:/i.test(href ?? '')) {
				// Strip javascript: links — render the link text only.
				return text
			}
			const titleAttr = title ? ` title="${title}"` : ''
			return `<a href="${href}"${titleAttr} rel="noopener noreferrer" target="_blank">${text}</a>`
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
