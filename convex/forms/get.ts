import { query } from "../_generated/server"
import { v } from "convex/values"
import { requireOrgId } from "../_utils/auth"
import { formTableValidator, getFormRecord } from "./_utils"

export const getForm = query({
  args: {
    table: formTableValidator,
    reportingYear: v.number(),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrgId(ctx)
    
    return await getFormRecord(ctx, args.table, orgId, args.reportingYear)
  }
})
