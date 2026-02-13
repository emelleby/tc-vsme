import { useOrganization } from '@clerk/clerk-react'
import { useConvexAuth } from 'convex/react'

/**
 * Organization Loading Guard Hook
 *
 * Prevents race conditions during organization switching by ensuring both:
 * 1. Clerk's organization context is loaded
 * 2. Convex authentication is ready with updated JWT
 *
 * Usage:
 * ```typescript
 * const { skipQuery } = useOrgGuard()
 * const data = useQuery(api.some.query, skipQuery || { args })
 * ```
 */
export function useOrgGuard() {
	const { organization, isLoaded: isOrgLoaded } = useOrganization()
	const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth()

	// Ready when authenticated, org is loaded, and org exists
	const isReady = isAuthenticated && isOrgLoaded && !!organization

	// Loading during initial auth or org loading
	const isLoading = isAuthLoading || !isOrgLoaded

	return {
		/** True when safe to make queries requiring orgId */
		isReady,
		/** True during initial load or org switching */
		isLoading,
		/** The current organization object (may be null during switching) */
		organization,
		/** Use with useQuery to skip queries when not ready */
		skipQuery: !isReady ? ('skip' as const) : undefined,
	}
}
