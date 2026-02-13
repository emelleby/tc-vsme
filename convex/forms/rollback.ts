import { mutation } from "../_generated/server"
import { v } from "convex/values"
import { requireOrgId, requireUserId } from "../_utils/auth"
import { formTableValidator, formSectionValidator, getFormRecordBySection, type FormVersion } from "./_utils"

export const rollbackToVersion = mutation({
  args: {
    table: formTableValidator,
    reportingYear: v.number(),
    section: formSectionValidator,  // Required
    targetVersion: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)
    const orgId = await requireOrgId(ctx)
    
    // Find existing submission by section
    const existing = await getFormRecordBySection(ctx, args.table, orgId, args.reportingYear, args.section)
      
    if (!existing) {
        throw new Error("Form not found")
    }

    // Find the target version data
    const targetVersion = existing.versions.find((v: FormVersion) => v.version === args.targetVersion)
    
    if (!targetVersion) {
        throw new Error(`Version ${args.targetVersion} not found`)
    }

    // Create new version for the rollback
    const currentVersion = existing.versions[existing.versions.length - 1].version
    const newVersion: FormVersion = {
        version: currentVersion + 1,
        data: targetVersion.data,
        changes: [{
            field: "_rollback",
            oldValue: currentVersion,
            newValue: args.targetVersion
        }],
        changedBy: userId,
        changedAt: Date.now()
    }

    // Keep only last 4 versions
    const versions = [...existing.versions, newVersion].slice(-4)

    // Update document
    await ctx.db.patch(existing._id, {
        draftData: targetVersion.data, // Update the draft to reflect the rollback
        data: existing.status === 'submitted' ? targetVersion.data : existing.data, // If submitted, update the strict data too
        versions,
        lastModifiedBy: userId,
        lastModifiedAt: Date.now(),
    })
    
    return { success: true, version: newVersion.version }
  }
})
