import { query } from "../_generated/server"
import { v } from "convex/values"
import { requireOrgId } from "../_utils/auth"
import { formTableValidator } from "./_utils"

export const checkDuplicates = query({
  args: {
    table: formTableValidator,
    reportingYear: v.number(),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrgId(ctx)
    
    const forms = await ctx.db
      .query(args.table)
      .withIndex("by_org_year", q =>
        q.eq("orgId", orgId).eq("reportingYear", args.reportingYear)
      )
      .collect()
      
    return {
        count: forms.length,
        forms: forms.map(f => ({
            _id: f._id,
            status: f.status,
            createdAt: f.createdAt,
            version: f.versions.length > 0 ? f.versions[f.versions.length - 1].version : 0
        }))
    }
  }
})
