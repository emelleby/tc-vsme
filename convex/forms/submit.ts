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
    
    // Move draftData to strict data field and update status
    // This will trigger schema validation in Convex
    const rawData = existing.draftData || existing.data || {}
    const dataToSubmit = { ...rawData }

    // Explicit coercion for financial fields to ensure they match v.number()
    const numericFields = ['revenue', 'balanceSheetTotal', 'employees']
    for (const key of numericFields) {
      if (typeof dataToSubmit[key] === 'string' && dataToSubmit[key] !== '') {
        dataToSubmit[key] = Number(dataToSubmit[key])
      }
    }

    await ctx.db.patch(existing._id, {
        data: dataToSubmit,
        status: "submitted",
        lastModifiedBy: userId,
        lastModifiedAt: Date.now(),
    })
    
    return { success: true }
  }
})
