import type { ReactNode } from 'react'

interface MarkdownTextProps {
	children: ReactNode
}

export function MarkdownText({ children }: MarkdownTextProps) {
	return <div className="whitespace-pre-wrap wrap-break-word">{children}</div>
}
