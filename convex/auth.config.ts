import { AuthConfig } from "convex/server";

/**
 * Convex authentication configuration for Clerk JWT integration.
 *
 * This configuration enables Convex to verify JWT tokens issued by Clerk,
 * providing database-layer authorization for all Convex functions.
 *
 * JWT Template Setup (Manual Step - Clerk Dashboard):
 * 1. Navigate to: https://dashboard.clerk.com/apps/[APP_ID]/jwt-templates
 * 2. Click "New Template"
 * 3. Configure:
 *    - Name: convex
 *    - Short-lived: Yes (recommended)
 *    - Claims to include:
 *      * Standard: sub, iss, email, name, given_name, family_name
 *      * Custom: org_id, org_role
 *    - Audience: Must match CONVEX_JWT_AUDIENCE environment variable
 *    - Algorithm: RS256
 *    - Lifetime: 5 minutes
 * 4. Save template
 *
 * Environment Variables Required:
 * - CLERK_ISSUER_URL: Your Clerk instance URL (e.g., https://your-instance.clerk.accounts.dev)
 * - CONVEX_JWT_AUDIENCE: Must match the "Audience" field in your Clerk JWT template
 */
export default {
  providers: [
    {
      // Clerk's OIDC issuer URL
      // Replaceed with the actual Clerk instance URL
      domain: process.env.CLERK_ISSUER_URL || "https://clerk.gentle.cod-4.lcl.dev",

      // The audience configured in Clerk JWT template
      // This must match the "Audience" field in your Clerk JWT template
      applicationID: process.env.CONVEX_JWT_AUDIENCE || "convex-tc-vsme",
    },
  ],
} satisfies AuthConfig;
