import { mutation } from "../_generated/server"
import { v } from "convex/values"
import { requireUserId, requireOrgId } from "../_utils/auth"
import { formTableValidator, formSectionValidator, detectChanges, type FormVersion, getFormRecordBySection } from "./_utils"

export const saveForm = mutation({
  args: {
    table: formTableValidator,
    reportingYear: v.number(),
    section: formSectionValidator,  // Required
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)
    const orgId = await requireOrgId(ctx)
    
    // Get org for orgNumber
    const org = await ctx.db
      .query("organizations")
      .withIndex("by_clerkOrgId", q => q.eq("clerkOrgId", orgId))
      .first()
    
    if (!org) throw new Error("Organization not found")
    
    // Find existing submission by section
    const existing = await getFormRecordBySection(ctx, args.table, orgId, args.reportingYear, args.section)
    
    if (existing) {
      // Calculate changes - check against draftData
      const changes = detectChanges(existing.draftData || existing.data, args.data)
      
      // If no changes, return early
      if (changes.length === 0) {
        return { _id: existing._id, version: existing.versions[existing.versions.length - 1].version }
      }

      // Create new version
      const currentVersion = existing.versions.length > 0 ? existing.versions[existing.versions.length - 1].version : 0
      const newVersion: FormVersion = {
        version: currentVersion + 1,
        data: args.data, // This is the draft data being saved
        changes,
        changedBy: userId,
        changedAt: Date.now(),
      }
      
      // Keep only last 4 versions
      const versions = [...existing.versions, newVersion].slice(-4)
      
      // Update document
      await ctx.db.patch(existing._id, {
        draftData: args.data,
        versions,
        lastModifiedBy: userId,
        lastModifiedAt: Date.now(),
      })
      
      return { _id: existing._id, version: newVersion.version }
    } else {
      // Create new submission
      const initialVersion: FormVersion = {
        version: 1,
        data: args.data,
        changes: [],
        changedBy: userId,
        changedAt: Date.now(),
      }
      
      const id = await ctx.db.insert(args.table, {
        orgId,
        orgNumber: org.orgNumber ?? "",
        reportingYear: args.reportingYear,
        section: args.section,  // NEW
        draftData: args.data,
        status: "draft",
        versions: [initialVersion],
        createdBy: userId,
        createdAt: Date.now(),
        lastModifiedBy: userId,
        lastModifiedAt: Date.now(),
      })
      
      return { _id: id, version: 1 }
    }
  }
})
