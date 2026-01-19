/**
 * Authentication module public API
 *
 * This module provides authentication utilities for the TC-VSME application.
 *
 * Note: Route protection is handled via route-level beforeLoad hooks,
 * not request middleware. See src/routes/_appLayout/route.tsx for the
 * authentication pattern.
 */

// Server functions
export { getAuthContext } from './context'
// Types
export type {
	AuthContext,
	ClerkOrgMetadata,
	ClerkUserMetadata,
	SessionContext,
} from './types'
