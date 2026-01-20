# Responsive Header - Code Examples

## LanguageSwitcher Enhancement

### Before
```tsx
<Button variant={variant} size="sm" className={cn('gap-2', className)}>
  {displayLabel}
  <ChevronDown className="size-4" />
</Button>
```

### After
```tsx
<Button variant={variant} size="sm" className={cn('gap-2', className)}>
  {showIcon ? <Globe className="size-4" /> : displayLabel}
  {!showIcon && <ChevronDown className="size-4" />}
</Button>
```

### Usage in Header
```tsx
<LanguageSwitcher
  languages={languages}
  value={currentLocale}
  onChange={(code) => setLocale(code as typeof currentLocale)}
  variant="outline"
  showIcon={true}  // Shows globe icon only
/>
```

## Header Mobile Menu Implementation

### Hamburger Button
```tsx
<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetTrigger asChild>
    <Button
      variant="ghost"
      size="sm"
      className="xl:hidden"  // Hidden on desktop
      aria-label="Open navigation menu"
    >
      <Menu className="size-5" />
    </Button>
  </SheetTrigger>
  
  <SheetContent side="left" className="w-64">
    {/* Mobile menu content */}
  </SheetContent>
</Sheet>
```

### Desktop Navigation
```tsx
{/* Logo - Desktop Only */}
<Link
  to="/"
  className="hidden xl:flex items-center gap-2"
>
  {/* Logo content */}
</Link>

{/* Nav Links - Desktop Only */}
<nav className="hidden xl:flex items-center gap-6">
  <Link to="/demo">{m.nav_demo()}</Link>
  <Link to="/about">{m.nav_about()}</Link>
</nav>
```

### Right Controls - Always Visible
```tsx
<div className="flex items-center gap-2 xl:gap-4">
  <LanguageSwitcher showIcon={true} />
  <ThemeSwitcher />
  <HeaderButtons />
</div>
```

## Responsive Breakpoints

### Tailwind Classes Used
```
xl:hidden      - Hide on desktop (< 1280px)
hidden xl:flex - Show only on desktop (≥ 1280px)
gap-2 xl:gap-4 - Compact mobile, spacious desktop
```

## State Management

```tsx
const [isOpen, setIsOpen] = useState(false)

// Auto-close on navigation
<Link
  to="/demo"
  onClick={() => setIsOpen(false)}
>
  {m.nav_demo()}
</Link>
```

## Accessibility Features

```tsx
{/* ARIA label on hamburger */}
<Button aria-label="Open navigation menu">
  <Menu className="size-5" />
</Button>

{/* Semantic HTML */}
<nav className="flex flex-col gap-4">
  {/* Navigation items */}
</nav>

{/* Keyboard navigation */}
{/* Built into Sheet component from Radix UI */}
```

## Animation Classes

```tsx
{/* Sheet animations (built-in) */}
<SheetContent
  className="
    data-[state=open]:animate-in
    data-[state=closed]:animate-out
    data-[state=closed]:slide-out-to-left
    data-[state=open]:slide-in-from-left
  "
>
```

## Complete Header Structure

```
Header (sticky, z-50)
├── Mobile Menu (< 1280px)
│   ├── Hamburger Button (xl:hidden)
│   └── Sheet Overlay
│       ├── Logo/Brand
│       ├── Demo Link
│       └── About Link
├── Desktop Logo (hidden xl:flex)
├── Desktop Nav (hidden xl:flex)
│   ├── Demo Link
│   └── About Link
└── Right Controls (always visible)
    ├── LanguageSwitcher (Globe icon)
    ├── ThemeSwitcher
    └── HeaderButtons
```

## Key Props

### LanguageSwitcher
- `showIcon?: boolean` - Show globe icon instead of label
- `variant?: 'outline' | 'ghost'` - Button style
- `align?: 'start' | 'center' | 'end'` - Dropdown alignment
- `onChange?: (code: string) => void` - Selection handler

### Header
- Uses `useState` for mobile menu state
- Uses `'use client'` directive for client-side rendering
- Responsive classes for conditional rendering

## Performance Considerations

✅ **Optimized**
- Minimal re-renders (only menu state changes)
- CSS-based responsive design (no JS media queries)
- Sheet component uses Radix UI (performant)
- No unnecessary DOM elements

## Browser Compatibility

✅ **All Modern Browsers**
- CSS Grid/Flexbox support
- CSS Media Queries
- Radix UI Dialog (Sheet)
- ES6+ JavaScript

