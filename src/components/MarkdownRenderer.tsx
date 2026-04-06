import { marked } from 'marked'
import { useMemo } from 'react'

marked.use({ gfm: true, breaks: true })

export function MarkdownRenderer({ children }: { children: string }) {
	const html = useMemo(() => marked.parse(children) as string, [children])
	return (
		<div
			className="prose dark:prose-invert max-w-none prose-sm"
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	)
}
