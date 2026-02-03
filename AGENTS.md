# TC-VSME Project Overview

## Project Basics

- **Runtime & Package Manager**: Bun
- **Framework**: TanStack Start (React meta-framework)
- **Database**: Convex
- **Authentication**: Clerk (with JWT for backend)
- **Styling**: Shadcn UI + Tailwind CSS
- **i18n**: Parglide.js
- **Testing**: Vitest + React Testing Library (TDD approach)

## Key Technologies

### TanStack Ecosystem
- **TanStack Start**: Full-stack React framework
- **TanStack Router**: File-based routing
- **TanStack Query**: Data fetching and caching
- **TanStack Form**: Form handling

### Backend
- **Convex**: Serverless database with real-time subscriptions
- **Clerk**: Authentication and user management
- **JWT**: Token-based authentication for backend routes

### Frontend
- **React 18**: UI library
- **Shadcn UI**: Component library (installed from registry)
- **Tailwind CSS**: Utility-first styling
- **Paraglide.js**: Type-safe i18n

## Project Structure

### Important Routes
- **_appLayout Routes**: Protected routes requiring authentication
- **Demo Routes**: For reference only (ignore in production)

### Directory Structure
```
tc-vsme/
├── convex/              # Convex backend
├── docs/                # Project documentation
├── messages/            # Parglide i18n messages
├── public/              # Static assets
├── src/
│   ├── components/      # UI components (Shadcn + custom)
│   ├── routes/          # TanStack Router routes
│   └── ...
├── .agent/
│   └── skills/          # Agent skills directory
└── ...
```

## Agent Skills Index

The `.agent/skills` directory contains specialized information for agents:

- **clean-code/**: Clean code principles and patterns
- **convex/**: Convex database patterns and best practices
- **form-system/**: Form handling with TanStack Form
- **frontend-design/**: Frontend design principles
- **i18n-localization-paraglidejs/**: Parglide.js i18n implementation
- **shadcn/**: Shadcn UI component usage
- **skill-creator/**: Skill creation guidelines
- **systematic-debugging/**: Debugging strategies
- **tailwind-patterns/**: Tailwind CSS patterns
- **tdd-workflow/**: Test-Driven Development workflow (RED-GREEN-REFACTOR)
- **web-design-guidelines/**: Web design best practices

## Testing Approach

### TDD Workflow
The project follows a strict TDD approach as documented in `.agent/skills/tdd-workflow`:

1. **RED Phase**: Write failing tests first
2. **GREEN Phase**: Write minimal code to pass tests
3. **REFACTOR Phase**: Improve code quality while keeping tests green

### Testing Setup
- **Vitest**: Test runner and assertion library
- **React Testing Library**: UI testing utilities
- **Convex Testing Helper**: For testing Convex functions

### Test Files
- Component tests: `src/components/__tests__/`
- Convex function tests: `convex/__tests__/`

## Authentication System

### Architecture
1. **Clerk (Identity Layer)**: User registration, login, JWT issuance
2. **TanStack Start Middleware (Access Control)**: Route protection, fast auth checks
3. **Convex (Data Layer Security)**: JWT verification, organization-scoped access

### Key Files
- `src/start.ts`: Global middleware configuration
- `src/routes/_appLayout/route.tsx`: Route-level protection
- `convex/auth.config.ts`: Convex auth configuration
- `convex/_utils/auth.ts`: Auth helper functions

## Database

### Convex Schema
- **Organizations**: Store org records with Clerk org IDs
- **Users**: Store user records with multi-org support
- **Todos**: Example collection for todos
- **Products**: Example collection for products

### External Data Source
- **MongoDB**: External emissions data (connected via Convex actions)

### Key Files
- `convex/schema.ts`: Database schema
- `convex/organizations.ts`: Org mutations/queries
- `convex/users.ts`: User mutations/queries
- `convex/emissions.ts`: MongoDB integration for emissions data

## Styling

### Shadcn UI
- Components installed from npm registry (not custom-written)
- Configuration in `components.json`
- Examples: Button, Card, Dialog, Input, etc.

### Tailwind CSS
- Configuration in `tailwind.config.ts`
- Global styles in `src/styles.css`

## i18n

### Paraglide.js
- Type-safe localization
- Messages in `messages/en.json` and `messages/no.json`
- Uses Inlang for message management

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **Authentication**: `authentication-approach.md`, `authentication-flow.md`, `authentication-implementation-plan.md`
- **Story 5 (Convex Schema)**: `story5-*.md` files
- **Story 7 (JWT Integration)**: `story7-implementation-summary.md`
- **Story 7.1 (MongoDB Integration)**: `story7.1-*.md` files
- **Testing**: `testing/` directory with test guidelines

## Quick Start

```bash
# Install dependencies
bun install

# Start Convex dev server
npx convex dev

# Start React development server
bun run dev

# Run tests
bun run vitest
```

## Key Patterns

### Convex Actions for External APIs
Use Convex actions (not queries/mutations) for external service calls like MongoDB:

```typescript
// convex/emissions.ts
"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId, getOrgId } from "./_utils/auth";
import { fetchCompanyEmissions } from "./mongodb/queries";

export const getEmissionsByOrgId = action({
  args: { orgId: v.string(), year: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const userOrgId = await getOrgId(ctx);
    if (userOrgId !== args.orgId) throw new Error("Unauthorized");
    return await fetchCompanyEmissions(args.orgId, args.year);
  },
});
```

### Route Protection
Protected routes use `beforeLoad` hooks in `_appLayout`:

```typescript
// src/routes/_appLayout/route.tsx
export const Route = createFileRoute("/_appLayout")({
  component: RouteComponent,
  beforeLoad: async () => await authStateFn(),
  loader: async ({ context }) => {
    return { userId: context.userId };
  },
});
```

## Success Criteria

- All tests pass (TDD approach)
- Authentication flow works correctly
- Organization data is properly managed
- Emissions data is fetched from MongoDB
- Dashboard displays data for authenticated users
- Cross-org access is prevented