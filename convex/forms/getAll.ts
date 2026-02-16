import { query } from "../_generated/server"
import { v } from "convex/values"
import { requireOrgId } from "../_utils/auth"

export const getAllForms = query({
  args: {
    reportingYear: v.number(),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrgId(ctx)
    
    const [general, environmental, social, governance] = await Promise.all([
      ctx.db.query("formGeneral")
        .withIndex("by_org_year", q => q.eq("orgId", orgId).eq("reportingYear", args.reportingYear))
        .first(),
      ctx.db.query("formEnvironmental")
        .withIndex("by_org_year", q => q.eq("orgId", orgId).eq("reportingYear", args.reportingYear))
        .first(),
      ctx.db.query("formSocial")
        .withIndex("by_org_year", q => q.eq("orgId", orgId).eq("reportingYear", args.reportingYear))
        .first(),
      ctx.db.query("formGovernance")
        .withIndex("by_org_year", q => q.eq("orgId", orgId).eq("reportingYear", args.reportingYear))
        .first(),
    ])
    
    return { general, environmental, social, governance }
  }
})
