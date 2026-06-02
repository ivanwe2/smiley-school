<!-- BEGIN:nextjs-agent-rules -->
# Smiley School — AI Agent Guide

> Read this before writing any code. This file captures the exact stack versions and project-specific
> conventions that deviate from common Next.js training data.

---

## Stack (exact versions — do not assume older APIs)

| Technology | Version | Key difference from older docs |
|------------|---------|-------------------------------|
| Next.js | 16.x | App Router only; `unstable_instant` export for instant nav; `params`/`searchParams` are **Promises** — always `await` them |
| React | 19.x | `useActionState` (not `useFormState`); `use()` hook available |
| Prisma | 7.x | **No `datasourceUrl` in constructor** — connection URL goes via driver adapter only |
| NextAuth | 5.x (beta) | `auth()` returns session; `handlers` export; no `getServerSession` |
| Tailwind CSS | 4.x | Entry: `@import "tailwindcss"` — NOT `@tailwind base/components/utilities` |
| next-intl | 4.x | `getTranslations()` / `getLocale()` in server; `useTranslations()` / `useLocale()` in client |

---

## Critical Prisma v7 pattern

```ts
// ✅ CORRECT
import { PrismaPg } from "@prisma/adapter-pg";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

// ❌ WRONG — removed in v7
new PrismaClient({ datasourceUrl: process.env.DATABASE_URL })
```

Import from `@/generated/prisma` — never from `@prisma/client`.

---

## Critical NextAuth v5 pattern

```ts
// ✅ Server component / Server Action
import { auth } from "@/features/auth/config";
const session = await auth();

// ✅ Protect a Server Action
import { requireAdmin } from "@/lib/auth";
export async function myAction() {
  await requireAdmin(); // throws redirect on failure
  // ...
}

// ❌ WRONG — v4 API, does not exist in v5
import { getServerSession } from "next-auth";
```

---

## Where things live

| Need | File |
|------|------|
| Prisma client | `src/lib/db.ts` |
| Auth helpers (`requireAdmin`, `getAdminSession`) | `src/lib/auth.ts` |
| School constants (name, email, address) | `src/lib/constants.ts` |
| Zod schemas | `src/lib/validations/*.schema.ts` |
| HTML sanitizer (for `dangerouslySetInnerHTML`) | `src/lib/sanitize.ts` — `sanitizeHtml()` |
| HTML escaper (for email templates) | `src/lib/html-escape.ts` — `escapeHtml()`, `escapeHtmlWithBreaks()` |
| Rate limiters | `src/lib/rate-limit.ts` |
| Cloudinary helpers | `src/lib/cloudinary.ts` |
| Email sending (Resend) | `src/lib/email.ts` |
| Feature code | `src/features/[feature]/` |
| Public pages | `src/app/(public)/` |
| Admin pages | `src/app/(admin)/admin/` |
| Translations | `messages/en.json`, `messages/bg.json` |
| Privacy policy page | `src/app/(public)/privacy/page.tsx` |
| Cookie notice component | `src/components/shared/CookieNotice.tsx` |

---

## Security non-negotiables

1. **Every admin Server Action must start with `await requireAdmin()`** — no exceptions.
2. **Always validate with Zod before touching the DB** — use `.safeParse()`, return `{ success: false, error }` on failure.
3. **Never render HTML from the DB with `dangerouslySetInnerHTML` without `sanitizeHtml()`** — the utility is in `src/lib/sanitize.ts`.
4. **Never interpolate user input into email HTML** — use `escapeHtml()` / `escapeHtmlWithBreaks()` from `src/lib/html-escape.ts`.
5. **Rate limiting is in-memory** (in-process, single-instance). Works for Docker deployment. Do NOT switch to Upstash/Redis without explicit instruction.

---

## i18n rules

- Default locale is **Bulgarian (`bg`)**.
- Supported locales: `bg`, `en`.
- **Always add keys to BOTH `messages/en.json` and `messages/bg.json`** when adding user-visible text.
- Use `getTranslations("section")` in Server Components; `useTranslations("section")` in Client Components.
- Locale is cookie-based (`NEXT_LOCALE`). Switched via `setLocale()` in `src/features/i18n/actions/locale.actions.ts`.

---

## Patterns & conventions

### Server Components by default
Add `"use client"` only when you need event handlers, hooks, or browser APIs.

### Server Actions for all mutations
Never POST to an API route from the client when a Server Action works. API routes are only for webhooks, third-party callbacks, and signed upload URLs.

### `params` and `searchParams` are Promises (Next.js 15+)
```ts
// ✅ Next.js 16
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

### Styling
- Tailwind v4 utilities only — no inline styles in production code.
- Use `cn()` from `src/lib/utils.ts` for conditional classes.
- CSS variables for brand colours: `var(--yellow-primary)`, `var(--navy-deep)`, etc.
- See `src/app/globals.css` for all tokens.

### Animations
Import from `"framer-motion"` — not `"motion/react"` or other aliases.

---

## CSP constraints

`next.config.ts` sets `frame-src 'none'`. **Do not add `<iframe>` elements** (e.g. Google Maps embeds) without also updating the CSP. The contact page uses a link to Google Maps — this is intentional.

---

## Known limitations (by design, do not "fix")

- **Blog post editor** — plain HTML `<textarea>`. No Tiptap/rich-text editor yet.
- **Team/testimonials** — hardcoded in `about/page.tsx` and `home/page.tsx`; not DB-driven.
- **Rate limiter** — in-memory; fine for single Docker instance.
- **No audit log** — admin actions are not logged to the DB.
<!-- END:nextjs-agent-rules -->
