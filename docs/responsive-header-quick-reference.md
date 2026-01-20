# Responsive Header - Quick Reference

## What Changed?

### 1. LanguageSwitcher Component
- **New Prop**: `showIcon?: boolean` (defaults to `false`)
- **Icon Used**: Globe from lucide-react
- **Usage**: `<LanguageSwitcher showIcon={true} />`

### 2. Header Component
- **Made Client-Side**: Added `'use client'` directive
- **Mobile Menu**: Hamburger button + Sheet component
- **Breakpoint**: 1280px (Tailwind `xl:` breakpoint)

## Layout Comparison

### Mobile (< 1280px)
```
┌─────────────────────────────────────┐
│ ☰  [Logo in Sheet]  🌐 🌙 👤       │
└─────────────────────────────────────┘
  ↓ (click hamburger)
┌──────────────────┐
│ Logo/Brand       │
│ Demo             │
│ About            │
│ [Close X]        │
└──────────────────┘
```

### Desktop (≥ 1280px)
```
┌──────────────────────────────────────────────────────┐
│ Logo/Brand  Demo  About        🌐  🌙  👤           │
└──────────────────────────────────────────────────────┘
```

## Key Features

✅ **Mobile-First Design**
- Hamburger menu hides on desktop
- Logo/nav links hide on mobile
- Right controls always visible

✅ **Smooth Animations**
- Sheet slides in from left
- Overlay fades in/out
- Auto-close on navigation

✅ **Accessibility**
- ARIA labels on buttons
- Keyboard navigation
- Screen reader support

✅ **Responsive Spacing**
- Mobile: `gap-2` (compact)
- Desktop: `xl:gap-4` (spacious)

## CSS Classes Used

| Element | Mobile | Desktop |
|---------|--------|---------|
| Hamburger | visible | `xl:hidden` |
| Logo | in Sheet | `hidden xl:flex` |
| Nav Links | in Sheet | `hidden xl:flex` |
| Right Controls | always | always |

## Component Tree

```
Header
├── Sheet (Mobile Menu)
│   ├── SheetTrigger (Hamburger Button)
│   └── SheetContent (side="left")
│       ├── Logo/Brand Link
│       ├── Demo Link
│       └── About Link
├── Logo/Brand (Desktop Only)
├── Navigation (Desktop Only)
│   ├── Demo Link
│   └── About Link
└── Right Controls (Always)
    ├── LanguageSwitcher (showIcon=true)
    ├── ThemeSwitcher
    └── HeaderButtons
```

## Testing Checklist

- [ ] Mobile menu opens/closes
- [ ] Navigation links work in menu
- [ ] Menu closes on link click
- [ ] Overlay click closes menu
- [ ] Desktop layout shows all elements
- [ ] Globe icon displays correctly
- [ ] Responsive at 1280px breakpoint
- [ ] Keyboard navigation works
- [ ] ARIA labels present

## Files Modified

1. `src/components/Header.tsx` (140 lines)
2. `src/components/LanguageSwitcher.tsx` (66 lines)

## No Breaking Changes

- All existing functionality preserved
- Backward compatible with existing code
- LocaleSwitcher component unaffected
- LanguageSwitcher stories still work

