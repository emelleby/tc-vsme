import { useCallback, useState } from 'react'

export function useExpandable(initialState = false) {
	const [isExpanded, setIsExpanded] = useState(initialState)

	const toggleExpand = useCallback(() => {
		setIsExpanded((prev) => !prev)
	}, [])

	return { isExpanded, toggleExpand }
}
