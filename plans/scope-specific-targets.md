# Scope Targets Implementation Guide

This guide outlines exactly how the specific scope targets (e.g., Scope 1, Scope 2) are implemented within [targets/index.tsx](file:///home/eivind/scope321/tc-vsme/src/routes/_appLayout/app/targets/index.tsx), so the next agent can replicate the same process for Scope 2.

## 1. Database and Schema Prep
- Provide a `hasScopeSpecificTargets` object flag on the `targets` document to track scoping specific states (already done).
- Allow the `saveTargets` mutator to accept and store this flag object (already done).

## 2. Form Schema
Create a Scope-specific `z.object` inside [targets/index.tsx](file:///home/eivind/scope321/tc-vsme/src/routes/_appLayout/app/targets/index.tsx).
```tsx
const scope2TargetsFormSchema = z.object({
	targetReduction: z.number('Target reduction is required').min(0).max(100),
	targetAbsolute: z.number().min(0),
	longTermTargetReduction: z.number().min(0).max(100).optional(),
	longTermTargetAbsolute: z.number().min(0).optional(),
})

type Scope2TargetsFormValues = z.infer<typeof scope2TargetsFormSchema>
```

## 3. Custom Projection Updater
Copy and adapt [updateScope1Projections](file:///home/eivind/scope321/tc-vsme/src/routes/_appLayout/app/targets/index.tsx#259-326) for `Scope 2`. It should loop over existing rows (modifying `scope2` and the `total`). This relies on calculateCompoundReduction.
Important details: calculate the final target absolute value relative to the base year scope 2 value, then use that to find the compound rate using the standard formulas to accurately construct the `newProjections` array.

## 4. Overall Target Recalculation
Because the specific scope targets modify the trajectory (and thus the totals), the main tab's overall target percentages need to be updated. Use [calculateOverallReductions](file:///home/eivind/scope321/tc-vsme/src/routes/_appLayout/app/targets/index.tsx#327-364) after calling `updateScopeXProjections`.

```tsx
const newProjections = updateScope2Projections(existingTargets.projections, ...)
const { targetReduction, longTermTargetReduction } = calculateOverallReductions(newProjections)
```

## 5. Main Form Considerations
- **Warning Banner:** Already implemented on the Main Tab warning users that setting specific targets will be overridden.
- **Reset Flag:** Submitting the Main Form sets `hasScopeSpecificTargets: false` to normalize behavior.

## 6. Specific Tab TanStack Setup
- Filter default values from `existingTargets.projections` by grabbing `isBaseYear`, `isTargetYear` and optionally `isLongTermTargetYear`.
- Generate Target Reduction `%` explicitly by checking [(1 - targetValue / baseValue) * 100](file:///home/eivind/scope321/tc-vsme/src/routes/_appLayout/app/targets/index.tsx#378-379) so users see their existing targets as percentages even if only absolutes are natively defined in the array.
- In [onSubmit](file:///home/eivind/scope321/tc-vsme/src/routes/_appLayout/app/targets/index.tsx#521-560): Use your `updateScope2Projections` function, resolve global targets with [calculateOverallReductions](file:///home/eivind/scope321/tc-vsme/src/routes/_appLayout/app/targets/index.tsx#327-364), explicitly set the flag for the scope being modified `hasScopeSpecificTargets: { ...existingTargets.hasScopeSpecificTargets, scope2: true }`, and save!

## 7. Real-time Field Syncing (Listeners)
When implementing the fields, we want inputs for Reduction `%` and Target Emissions `tCO₂e` to explicitly and smoothly sync using TanStack `listeners`.
- Only execute if the base value > 0 and input value exists.
- Implement an absolute Math check to break infinite reactivity loops (e.g., > 0.01 tolerance).

```tsx
<scope2Form.AppField 
    name="targetReduction"
    listeners={{
        onChange: ({ value }) => {
            if (value !== undefined && baseScope2Value > 0) {
                const expected = baseScope2Value * (1 - value / 100)
                const current = scope2Form.getFieldValue('targetAbsolute')
                if (Math.abs(expected - (current || 0)) > 0.01) {
                    scope2Form.setFieldValue('targetAbsolute', Number(expected.toFixed(2)))
                }
            }
        }
    }}
>
    {(field) => (
        <field.NumberField label="Target reduction" unit="%" />
    )}
</scope2Form.AppField>
```

```tsx
<scope2Form.AppField 
    name="targetAbsolute"
    listeners={{
        onChange: ({ value }) => {
            if (value !== undefined && baseScope2Value > 0) {
                const expectedPct = (1 - value / baseScope2Value) * 100
                const currentPct = scope2Form.getFieldValue('targetReduction')
                if (Math.abs(expectedPct - (currentPct || 0)) > 0.01) {
                    scope2Form.setFieldValue('targetReduction', Number(expectedPct.toFixed(2)))
                }
            }
        }
    }}
>
    {(field) => (
        <field.NumberField label="Target emissions" unit="tCO₂e" />
    )}
</scope2Form.AppField>
```

> [!NOTE] 
> Remember to wrap the form inner content to check `!existingTargets?.projections || existingTargets.projections.length === 0` to disable/inform the user if a base year has not been initially configured yet before attempting specific targets.
