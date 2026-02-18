import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

// Section enum validator
const formSectionValidator = v.union(
  v.literal("companyInfo"),
  v.literal("sustainabilityInitiatives"),
  v.literal("businessModel"),
  v.literal("energyEmissions"),
  v.literal("pollution"),
  v.literal("biodiversity"),
  v.literal("waterManagement"),
  v.literal("resourceUseCircularEconomy"),
  v.literal("scope3Emissions"),
  v.literal("climateRiskAnalysis"),
)

// Form data validators for each section
const companyInfoDataValidator = v.object({
  reportingYear: v.string(),
  organizationName: v.string(),
  organizationNumber: v.string(),
  naceCode: v.string(),
  revenue: v.number(),
  balanceSheetTotal: v.number(),
  employees: v.number(),
  country: v.string(),
  reportType: v.boolean(),
  subsidiaries: v.optional(
    v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        address: v.string(),
      }),
    ),
  ),
  contactPersonName: v.string(),
  contactPersonEmail: v.string(),
})

const sustainabilityInitiativesDataValidator = v.object({
  reportingYear: v.string(),
  initiatives: v.array(
    v.object({
      id: v.string(),
      title: v.string(),
      description: v.string(),
      goals: v.string(),
      responsiblePerson: v.string(),
      status: v.string(),
    })
  ),
})

const businessModelDataValidator = v.object({
  reportingYear: v.string(),
  businessModel: v.optional(v.string()),
})

// Union validator for all general form sections
const formGeneralDataValidator = v.union(
  companyInfoDataValidator,
  sustainabilityInitiativesDataValidator,
  businessModelDataValidator,
)

// Environmental form data validators
const energyEmissionsDataValidator = v.object({
  reportingYear: v.string(),
  renewableElectricity: v.number(),
  nonRenewableElectricity: v.number(),
  emissionsIntensity: v.number(),
  scope1Emissions: v.number(),
  scope2EmissionsLocationBased: v.number(),
  scope2EmissionsMarketBased: v.number(),
  climateDataCollectionMethod: v.string(),
  dataUncertainty: v.string(),
})

const pollutionDataValidator = v.object({
  reportingYear: v.string(),
  pollutants: v.array(
    v.object({
      id: v.string(),
      pollutionType: v.string(),
      emissionType: v.union(v.literal('Air'), v.literal('Water'), v.literal('Soil')),
      amount: v.number(),
      unit: v.string(),
    })
  ),
})

const biodiversityDataValidator = v.object({
  reportingYear: v.string(),
  hasSensitiveBiodiversityAreas: v.boolean(),
  totalAreaHectares: v.optional(v.number()),
  protectedAreaHectares: v.optional(v.number()),
  nonProtectedAreaHectares: v.optional(v.number()),
  protectedSpeciesCount: v.optional(v.string()),
  redListedSpeciesCount: v.optional(v.string()),
})

const waterManagementDataValidator = v.object({
  reportingYear: v.string(),
  waterConsumption: v.optional(v.number()),
  waterStress: v.optional(v.number()),
})

const resourceUseCircularEconomyDataValidator = v.object({
  reportingYear: v.string(),
  totalWaste: v.number(),
  recyclingRate: v.number(),
  energyRecovery: v.number(),
  landfill: v.number(),
  hazardousWaste: v.number(),
  recycledMaterials: v.array(
    v.object({
      id: v.string(),
      materialType: v.string(),
      amount: v.number(),
      unit: v.union(v.literal('tonn'), v.literal('kg')),
    })
  ),
})

const scope3EmissionsDataValidator = v.object({
  reportingYear: v.string(),
  totalScope3Emissions: v.number(),
  category1: v.number(),
  category2: v.number(),
  category3: v.number(),
  category4: v.number(),
  category5: v.number(),
  category6: v.number(),
  category7: v.number(),
  category8: v.number(),
  category9: v.number(),
  category10: v.number(),
  category11: v.number(),
  category12: v.number(),
  category13: v.number(),
  category14: v.number(),
  category15: v.number(),
})

const climateRiskAnalysisDataValidator = v.object({
  reportingYear: v.string(),
  climateRiskDescription: v.string(),
})

// Union validator for all environmental form sections
const formEnvironmentalDataValidator = v.union(
  energyEmissionsDataValidator,
  pollutionDataValidator,
  biodiversityDataValidator,
  waterManagementDataValidator,
  resourceUseCircularEconomyDataValidator,
  scope3EmissionsDataValidator,
  climateRiskAnalysisDataValidator,
  // Add more environmental sections here as they are created
)

// Placeholder validators for social and governance forms
// These will be expanded as new forms are added
const formSocialDataValidator = v.any()
const formGovernanceDataValidator = v.any()

export default defineSchema({
  products: defineTable({
    title: v.string(),
    imageId: v.string(),
    price: v.number(),
  }),
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),

  // Organizations table
  organizations: defineTable({
    clerkOrgId: v.string(),
    name: v.string(),
    slug: v.string(),
    orgNumber: v.optional(v.string()),
    address: v.optional(
      v.object({
        street: v.optional(v.array(v.string())),
        postalCode: v.optional(v.string()),
        city: v.optional(v.string()),
        country: v.optional(v.string()),
        countryCode: v.optional(v.string()),
      }),
    ),
    orgForm: v.optional(v.string()),
    website: v.optional(v.string()),
    naceCode: v.optional(v.string()),
    industry: v.optional(v.string()),
    numberEmployees: v.optional(v.number()),
    businessModel: v.optional(v.string()),
  })
    .index('by_clerkOrgId', ['clerkOrgId'])
    .index('by_slug', ['slug'])
    .index('by_orgNumber', ['orgNumber']),

  // Users table
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
    organizationIds: v.array(v.string()), // Array of Clerk org IDs
    updatedAt: v.number(), // Manual timestamp for updates
  })
    .index('by_clerkId', ['clerkId'])
    .index('by_email', ['email']),

  // Form tables
  formGeneral: defineTable({
    orgId: v.string(),
    orgNumber: v.string(),
    reportingYear: v.number(),
    section: formSectionValidator,  // NEW: Identifies which FormCard
    draftData: v.any(), // Flexible storage for drafts
    data: v.optional(formGeneralDataValidator), // Strict storage for submitted data
    status: v.string(),          // "draft" | "submitted"
    versions: v.array(v.any()),  // Version history
    createdBy: v.string(),
    createdAt: v.number(),
    lastModifiedBy: v.string(),
    lastModifiedAt: v.number(),
  })
    .index("by_org_year", ["orgId", "reportingYear"])
    .index("by_org_year_section", ["orgId", "reportingYear", "section"])  // NEW
    .index("by_orgNumber_year", ["orgNumber", "reportingYear"])
    .index("by_orgId", ["orgId"]),

  formEnvironmental: defineTable({
    orgId: v.string(),
    orgNumber: v.string(),
    reportingYear: v.number(),
    section: formSectionValidator,  // Identifies which FormCard (e.g., energyEmissions)
    draftData: v.any(), // Flexible storage for drafts
    data: v.optional(formEnvironmentalDataValidator), // Strict storage for submitted data
    status: v.string(),          // "draft" | "submitted"
    versions: v.array(v.any()),  // Version history
    createdBy: v.string(),
    createdAt: v.number(),
    lastModifiedBy: v.string(),
    lastModifiedAt: v.number(),
  })
    .index("by_org_year", ["orgId", "reportingYear"])
    .index("by_org_year_section", ["orgId", "reportingYear", "section"])
    .index("by_orgNumber_year", ["orgNumber", "reportingYear"])
    .index("by_orgId", ["orgId"]),

  formSocial: defineTable({
    orgId: v.string(),
    orgNumber: v.string(),
    reportingYear: v.number(),
    section: formSectionValidator,  // Identifies which FormCard
    draftData: v.any(), // Flexible storage for drafts
    data: v.optional(formSocialDataValidator), // Strict storage for submitted data
    status: v.string(),          // "draft" | "submitted"
    versions: v.array(v.any()),  // Version history
    createdBy: v.string(),
    createdAt: v.number(),
    lastModifiedBy: v.string(),
    lastModifiedAt: v.number(),
  })
    .index("by_org_year", ["orgId", "reportingYear"])
    .index("by_org_year_section", ["orgId", "reportingYear", "section"])
    .index("by_orgNumber_year", ["orgNumber", "reportingYear"])
    .index("by_orgId", ["orgId"]),

  formGovernance: defineTable({
    orgId: v.string(),
    orgNumber: v.string(),
    reportingYear: v.number(),
    section: formSectionValidator,  // Identifies which FormCard
    draftData: v.any(), // Flexible storage for drafts
    data: v.optional(formGovernanceDataValidator), // Strict storage for submitted data
    status: v.string(),          // "draft" | "submitted"
    versions: v.array(v.any()),  // Version history
    createdBy: v.string(),
    createdAt: v.number(),
    lastModifiedBy: v.string(),
    lastModifiedAt: v.number(),
  })
    .index("by_org_year", ["orgId", "reportingYear"])
    .index("by_org_year_section", ["orgId", "reportingYear", "section"])
    .index("by_orgNumber_year", ["orgNumber", "reportingYear"])
    .index("by_orgId", ["orgId"]),
})
