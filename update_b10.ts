import fs from 'fs'

const path = './src/components/forms/social/B10Form.tsx'
let content = fs.readFileSync(path, 'utf8')

const target = `const displayValue =
		totalEmployees > 0 && collectiveBargainingAgreement !== undefined
			? Math.round((collectiveBargainingAgreement / totalEmployees) * 100 * 10) / 10
			: 0

	// Sync the calculated display percentage back to the form state for purely visual 
	// feedback. transformBeforeSave will correct it back to a 0-1 ratio when saving.
	useEffect(() => {
		form.setFieldValue('collectiveBargainingShare', displayValue)
	}, [displayValue, form])`

const replacement = `const displayValue =
		totalEmployees > 0 && collectiveBargainingAgreement !== undefined
			? Math.round((collectiveBargainingAgreement / totalEmployees) * 100 * 10) / 10
			: 0

	const collectiveBargainingShare = useStore(
form.store,
(state) => state.values.collectiveBargainingShare,
	)

	// Sync the calculated display percentage back to the form state for purely visual 
	// feedback. transformBeforeSave correct it back to a 0-1 ratio when saving.
	// We monitor the form's state to prevent Convex syncs (which push the 0-1 ratio) 
// from overriding the UI's 0-100 percentage layout.
	useEffect(() => {
		if (collectiveBargainingShare !== displayValue) {
			form.setFieldValue('collectiveBargainingShare', displayValue)
		}
	}, [displayValue, collectiveBargainingShare, form])`

if (content.includes(target)) {
    content = content.replace(target, replacement)
    fs.writeFileSync(path, content)
    console.log('updated')
} else {
    console.log('not found')
}
