import { mutation } from "../_generated/server"
import { v } from "convex/values"
import { requireOrgId, requireUserId } from "../_utils/auth"
import { formTableValidator, getFormRecord } from "./_utils"

export const submitForm = mutation({
  args: {
    table: formTableValidator,
    reportingYear: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)
    const orgId = await requireOrgId(ctx)
    
    // Find existing submission
    const existing = await getFormRecord(ctx, args.table, orgId, args.reportingYear)
      
    if (!existing) {
        throw new Error("Form not found")
    }
    
    // Update status to submitted
    await ctx.db.patch(existing._id, {
        status: "submitted",
        lastModifiedBy: userId,
        lastModifiedAt: Date.now(),
    })
    
    return { success: true }
  }
})
