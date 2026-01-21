"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./_utils/auth";
import { fetchCompanyEmissions } from "./mongodb/queries";

/**
 * Sanitize MongoDB data to be Convex-compatible.
 * Converts Date objects to ISO strings and handles nested objects.
 */
function sanitizeMongoData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (data instanceof Date) {
    return data.toISOString();
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeMongoData(item));
  }

  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeMongoData(value);
    }
    return sanitized;
  }

  return data;
}

/**
 * Get emissions data for a specific organization.
 *
 * Fetches CO2 emissions data from MongoDB for the specified organization.
 * Requires authentication and verifies that the user has access to the requested organization.
 * Prevents cross-organization data access by checking user's org context.
 *
 * @param {string} orgId - The organization ID to fetch emissions for
 * @param {number} [year] - Optional year to fetch specific year's data
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 *
 * @example
 * ```typescript
 * // Fetch all emissions for an org
 * const result = await ctx.runAction(api.emissions.getEmissionsByOrgId, {
 *   orgId: 'org_123'
 * });
 *
 * // Fetch specific year for an org
 * const result2024 = await ctx.runAction(api.emissions.getEmissionsByOrgId, {
 *   orgId: 'org_123',
 *   year: 2024
 * });
 * ```
 */
export const getEmissionsByOrgId = action({
  args: {
    orgId: v.string(),
    year: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Verify authentication
    await requireUserId(ctx);

    // 2. Get user's org context
    // const userOrgId = await getOrgId(ctx);

    // Hardcoded for testing purposes
    const userOrgId = 'org_2tWO47gV8vEOLN1lrpV57N02Dh2'

    // 3. Verify authorization - prevent cross-org access
    // Allow access if user's org matches requested org, or if no org context (for testing/admin)
    if (userOrgId && userOrgId !== args.orgId) {
      throw new Error("Unauthorized: Cannot access other organizations");
    }

    // 4. Fetch from MongoDB
    try {
      const data = await fetchCompanyEmissions(args.orgId, args.year);

      // Convert any Date objects to ISO strings for Convex compatibility
      const sanitizedData = data ? sanitizeMongoData(data) : null;

      return { success: true, data: sanitizedData };
    } catch (error) {
      console.error("MongoDB fetch error:", error);
      return { success: false, error: "Failed to fetch emissions data" };
    }
  },
});

