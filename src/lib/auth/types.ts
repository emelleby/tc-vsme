/**
 * Authentication context types for the TC-VSME application.
 * 
 * These types define the structure of authentication data used throughout
 * the application, including user permissions and organization metadata.
 */

/**
 * Full authentication context available to routes and components.
 * This is typically fetched in route beforeLoad hooks where API calls are acceptable.
 */
export interface AuthContext {
	/** Whether the user is authenticated */
	isAuthenticated: boolean
	/** Clerk user ID */
	userId: string
	/** Clerk organization ID (null if no org selected) */
	orgId: string | null

	// Permission flags from Clerk metadata
	/** User has permission to create VSME organizations */
	hasVsme: boolean
	/** Organization has VSME access */
	orgHasVsme: boolean
	/** Organization record exists in Convex database */
	vsmeDb: boolean

	// Computed properties
	/** User can access the dashboard (has both orgHasVsme and vsmeDb) */
	canAccessDashboard: boolean
	/** User needs to complete organization setup */
	needsOrgSetup: boolean
}

/**
 * User metadata stored in Clerk's publicMetadata.
 * This is attached to the user object in Clerk.
 */
export interface ClerkUserMetadata {
	/** User has permission to create VSME organizations */
	hasVsme?: boolean
}

/**
 * Organization metadata stored in Clerk's publicMetadata.
 * This is attached to the organization object in Clerk.
 */
export interface ClerkOrgMetadata {
	/** Organization has VSME access */
	hasVsme?: boolean
	/** Organization record exists in Convex database */
	vsmeDb?: boolean
}

/**
 * Basic session information available from Clerk's auth() function.
 * This is used in the global middleware for fast authentication checks.
 */
export interface SessionContext {
	/** Clerk user ID */
	userId: string
	/** Clerk organization ID (null if no org selected) */
	orgId: string | null
}

