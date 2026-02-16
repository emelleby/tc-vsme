import { mutation } from "../_generated/server"
import { v } from "convex/values"
import { requireOrgId, requireUserId } from "../_utils/auth"
import { formTableValidator, formSectionValidator, getFormRecordBySection } from "./_utils"

export const reopenForm = mutation({
  args: {
    table: formTableValidator,
    reportingYear: v.number(),
    section: formSectionValidator,  // Required
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)
    const orgId = await requireOrgId(ctx)
    
    // Find existing submission by section
    const existing = await getFormRecordBySection(ctx, args.table, orgId, args.reportingYear, args.section)
      
    if (!existing) {
        throw new Error("Form not found")
    }
    
    // Update status to draft
    await ctx.db.patch(existing._id, {
        status: "draft",
        lastModifiedBy: userId,
        lastModifiedAt: Date.now(),
    })
    
    return { success: true }
  }
})
