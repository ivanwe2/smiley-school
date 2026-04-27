# Smiley School — Claude Code Instructions

## Project Overview
This is a Next.js 16 website for Smiley School, a Cambridge-certified English language center.
Primary stack: Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS v4 · Prisma v7 · Neon · Cloudinary · NextAuth.js v5

## Coding Standards

### TypeScript
- Always use `strict: true` — no `any`, no `!` non-null assertions without comment
- Prefer `type` over `interface` for component props
- Use Zod for all runtime validation, derive TypeScript types from Zod schemas with `z.infer<>`
- Use the `satisfies` operator for config objects

### Next.js App Router Patterns
- **Server Components by default.** Add `"use client"` only when necessary (event handlers, hooks, browser APIs)
- **Server Actions for all mutations** — never POST to an API route from the client when a Server Action works
- **Route Handlers (`/api/...`)** only for: webhooks, third-party callbacks, signed upload URLs
- Use `loading.tsx` for Suspense boundaries; use `error.tsx` for error boundaries
- Wrap data fetching in React `cache()` for deduplication within a request
- Use `revalidatePath()` and `revalidateTag()` after mutations, never `router.refresh()`
- **Never use `useEffect` for data fetching** — use async Server Components
- Export `unstable_instant` from routes that should navigate instantly (new in Next.js 16)

### Prisma v7
- Generator: `provider = "prisma-client-js"` with `output = "../src/generated/prisma"`
- Import from `@/generated/prisma` — resolves to the generated `index.js`
- **Prisma v7 removed `datasourceUrl` from the constructor.** The connection URL must be passed via a driver adapter: `new PrismaPg({ connectionString: process.env.DATABASE_URL })`
- Driver adapter packages: `@prisma/adapter-pg` + `pg` (works for both local Postgres and Neon TCP)
- See `src/lib/db.ts` for the canonical client setup

### Component Organization
- Feature code lives in `src/features/[feature]/`
- Shared UI lives in `src/components/ui/` (shadcn base-nova) or `src/components/shared/`
- Admin components prefix with `Admin` (e.g. `AdminPostEditor`)
- Always co-locate types in `types.ts` within the feature folder

### Styling
- Use Tailwind CSS v4 utilities exclusively — no inline styles
- Follow design tokens in `src/app/globals.css`
- Use `cn()` from `src/lib/utils.ts` for conditional classes
- Responsive design: mobile-first
- Brand colors: use CSS variables `--yellow-primary`, `--navy-deep`, etc.

### Database
- Always use Prisma client from `src/lib/db.ts`
- Import from `@/generated/prisma`
- Use `db.$transaction()` for atomic operations
- Never expose raw Prisma types to the client

### Security
- All admin routes protected by NextAuth middleware
- All Server Actions start with `await requireAdmin()`
- Never trust client-sent data — always validate with Zod

### Animations
- Package is `framer-motion` — import from `"framer-motion"`

### Naming Conventions
- Files: `kebab-case.tsx`
- Components: `PascalCase`
- Server Actions: `verbNoun()` — e.g. `cancelClass()`, `createPost()`
- Queries: `getNoun()` / `getManyNouns()`

## Design System Quick Reference
- **Brand yellow**: `var(--yellow-primary)` (#F4B942)
- **Navy deep**: `var(--navy-deep)` (#0F1F3D) — headings, navbar
- **Font headings**: Fraunces — CSS var `--font-fraunces`
- **Font body**: Plus Jakarta Sans — CSS var `--font-jakarta`
- **Border radius**: `rounded-xl` (12px) for cards, `rounded-lg` (8px) for inputs/buttons

## Important File Locations
- Design tokens: `src/app/globals.css`
- DB client: `src/lib/db.ts`
- Prisma generated: `src/generated/prisma`
- Auth config: `src/features/auth/config.ts`
- Cloudinary helpers: `src/lib/cloudinary.ts`
- School constants: `src/lib/constants.ts`

## Commands
```
npm run dev
npx prisma migrate dev
npx prisma db seed
npx tsc --noEmit
```
