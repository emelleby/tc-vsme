import { v } from "convex/values"

export type FormTable = "formGeneral" | "formEnvironmental" | "formSocial" | "formGovernance"
export type FormSection = "companyInfo" | "sustainabilityInitiatives" | "businessModel" | "energyEmissions" | "pollution" | "biodiversity"

export const formTableValidator = v.union(
  v.literal("formGeneral"),
  v.literal("formEnvironmental"),
  v.literal("formSocial"),
  v.literal("formGovernance")
)

export const formSectionValidator = v.union(
  v.literal("companyInfo"),
  v.literal("sustainabilityInitiatives"),
  v.literal("businessModel"),
  v.literal("energyEmissions"),
  v.literal("pollution"),
  v.literal("biodiversity"),
)

export interface FieldChange {
  field: string
  oldValue: unknown
  newValue: unknown
}

export interface FormVersion {
  version: number
  data: any
  changes: FieldChange[]
  changedBy: string
  changedAt: number
}

export function detectChanges(oldData: Record<string, any>, newData: Record<string, any>): FieldChange[] {
  const changes: FieldChange[] = []
  
  // Check for changed or new keys
  for (const key of Object.keys(newData)) {
    if (!isEqual(oldData?.[key], newData[key])) {
      changes.push({
        field: key,
        oldValue: oldData?.[key],
        newValue: newData[key]
      })
    }
  }

  // Check for deleted keys
  if (oldData) {
      for (const key of Object.keys(oldData)) {
          if (!(key in newData)) {
               changes.push({
                field: key,
                oldValue: oldData[key],
                newValue: undefined
              })
          }
      }
  }
  
  return changes
}

// Simple deep equality check
function isEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * Helper to get the single active form record.
 * Handles potential duplicates by returning the most recently modified one.
 */
export async function getFormRecord(ctx: any, table: FormTable, orgId: string, reportingYear: number) {
  const forms = await ctx.db
    .query(table)
    .withIndex("by_org_year", (q: any) =>
      q.eq("orgId", orgId).eq("reportingYear", reportingYear)
    )
    .collect()

  if (forms.length === 0) return null

  // If duplicates exist, return the one with the latest lastModifiedAt
  // If lastModifiedAt is missing (legacy), fallback to _creationTime
  return forms.sort((a: any, b: any) => {
    const timeA = a.lastModifiedAt ?? a._creationTime
    const timeB = b.lastModifiedAt ?? b._creationTime
    return timeB - timeA
  })[0]
}

/**
 * Helper to get form record by section.
 * Returns the form record for a specific section within a reporting year.
 */
export async function getFormRecordBySection(
  ctx: any,
  table: FormTable,
  orgId: string,
  reportingYear: number,
  section: FormSection
) {
  return await ctx.db
    .query(table)
    .withIndex("by_org_year_section", (q: any) =>
      q.eq("orgId", orgId)
       .eq("reportingYear", reportingYear)
       .eq("section", section)
    )
    .first()
}
