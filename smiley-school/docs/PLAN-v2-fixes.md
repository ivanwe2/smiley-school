# Implementation Plan — PR #3 Fixes (Review Feedback)

**Date:** 2026-06-01  
**PR:** #3 (feature/v2-issues-security-dark-theme)  
**Reviewer:** Qwopus 3.6-27B  
**Architect:** Qwen 3.7 Max (self-correction)  

---

## Acknowledgment of Mistakes

As the architect, I accept responsibility for these failures in my original plan execution:

1. **Shallow Cloudinary validation** — I specified embedding `allowed_formats` and `max_file_size` into signed parameters but the implementation only validated client-provided data. This is a textbook case of trusting the client.
2. **CSP `unsafe-eval`** — I allowed this slip. `unsafe-eval` negates much of CSP's XSS protection. There is no legitimate need for it in this app.
3. **Regex bug in cloudinary.ts** — `\.+` strips ALL consecutive dots, destroying valid filenames. I specified "sanitize publicId" but didn't provide the exact regex.
4. **Rate limiting keyed on email only** — My plan explicitly said "IP-based limiting" and the implementation chose email-only. This allows an attacker cycling through email addresses to bypass limits.
5. **Missing dark mode on admin login** — The plan section 4.6 explicitly listed fixing `bg-white` on the card and inputs. This was missed.
6. **Missing system theme listener** — The plan section 4.4 included a `matchMedia` change event listener. The implementation declared `"system"` in the type union but never connected it.
7. **Missing `getUserRole()` helper** — Explicitly specified in plan section 2.7 but not implemented.
8. **No tests written** — Plan section 6 specified a testing strategy. Zero tests were produced.

Going forward: minimal comments, production-depth code, every edge case handled.

---

## Table of Contents

1. [Critical Fixes (🔴)](#1-critical-fixes)
2. [Warning Fixes (⚠️)](#2-warning-fixes)
3. [Suggestion Fixes (💡)](#3-suggestion-fixes)
4. [Additional Issues Found During Deep Review](#4-additional-issues-found)
5. [Test Infrastructure & Test Files](#5-test-infrastructure)
6. [Implementation Order](#6-implementation-order)
7. [Verification Steps](#7-verification-steps)

---

## 1. Critical Fixes

### 1.1 Cloudinary publicId Regex Bug

**File:** `src/lib/cloudinary.ts` line 30  
**Severity:** 🔴 CRITICAL  
**Root cause:** `publicId.replace(/\.+/g, "")` collapses ALL dots. A publicId like `gallery/photo.profile.jpg` becomes `gallery/photoprofilejpg`.

**Why it matters:** Cloudinary public IDs commonly contain dots (e.g., original filenames). This regex silently corrupts every URL that references a dotted filename. Path traversal protection only needs to prevent `..` sequences (directory traversal) and `//` sequences (path confusion).

**Industry best practice:** Allow legitimate dots, only strip the specific dangerous patterns:
- `..` → path traversal
- Leading/trailing `.` and `/` → relative path confusion

**Exact fix — replace line 30:**

```ts
// BEFORE (line 30):
const sanitizedId = publicId.replace(/\.+/g, "").replace(/\/+/g, "/").replace(/^\/|\/$/g, "");

// AFTER:
const sanitizedId = publicId
  .replace(/\.\./g, "")        // strip consecutive dots (path traversal)
  .replace(/\/+/g, "/")        // collapse multiple slashes
  .replace(/^\/+|\/+$/g, "");  // strip leading/trailing slashes
```

**What changes:**
- `\.+` (one or more dots → empty) → `\.\.` (only double-dots → empty)
- `/\.+/g` was removing ALL dots including legitimate ones like in `profile.photo.jpg`

**Test cases:**
- `"gallery/photo.jpg"` → `"gallery/photo.jpg"` (DASH: dots preserved)
- `"../../etc/passwd"` → `"etcpasswd"` (DASH: traversal blocked)
- `"gallery//sub//file"` → `"gallery/sub/file"` (DASH: slashes collapsed)
- `"/leading/slash"` → `"leading/slash"` (DASH: leading slash stripped)

---

### 1.2 Remove `unsafe-eval` from CSP

**File:** `next.config.ts` line 27  
**Severity:** 🔴 CRITICAL  
**Root cause:** `'unsafe-eval'` was added to `script-src` without justification.

**Why it matters:** `unsafe-eval` allows `eval()`, `new Function()`, `setTimeout(fn-string)`, and similar dynamic code execution. If an XSS vector exists anywhere (e.g., through a compromised admin post), an attacker could execute arbitrary JavaScript via `eval()` injection. The entire point of CSP is to prevent code execution from untrusted sources.

**Industry best practice:**
- Next.js itself does NOT require `unsafe-eval` (it uses `unsafe-inline` for hydration scripts, which is acceptable)
- `unsafe-inline` is already present and sufficient for Next.js 16's inline scripts
- No third-party library in this project (framer-motion, lucide-react, react-hook-form) requires eval

**Exact fix — replace line 27:**

```ts
// BEFORE (line 27):
"script-src 'self' 'unsafe-inline' 'unsafe-eval'",

// AFTER:
"script-src 'self' 'unsafe-inline'",
```

**Risk:** None. Nothing in this codebase uses `eval()` or `new Function()`.

---

### 1.3 Cloudinary Server-Side Upload Validation

**File:** `src/app/api/cloudinary/sign/route.ts` lines 23-47  
**Severity:** 🔴 CRITICAL  
**Root cause:** The route validates `fileSize` and `mimeType` from the request body, but an attacker can simply omit these fields. The validation at lines 24-42 is entirely client-enforced and trivially bypassed. The plan (section 2.6) explicitly specified embedding constraints into the signed upload parameters so Cloudinary enforces them.

**Why it matters:** A compromised admin account (or any attacker with a valid session) can upload:
- PHP/shell scripts that could execute if the CDN is misconfigured
- Multi-gigabyte files that consume storage quota and bandwidth
- Malicious executables disguised as images

**Industry best practice:** Cloudinary supports `allowed_formats` and `max_file_size` as signed parameters. When included in the signature, Cloudinary's servers enforce these constraints regardless of what the client sends.

**Fix — requires changes to TWO files:**

#### File A: `src/lib/cloudinary.ts` — Update `generateUploadSignature`

Add exports and update function signature. Replace lines 58-73:

```ts
// BEFORE (lines 58-73):
export function generateUploadSignature(
  folder: string,
  timestamp: number
): { signature: string; apiKey: string; cloudName: string } {
  const paramsToSign = { folder, timestamp };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  };
}

// AFTER:
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp", "gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function generateUploadSignature(
  folder: string,
  timestamp: number
): {
  signature: string;
  apiKey: string;
  cloudName: string;
  allowedFormats: string[];
  maxFileSize: number;
} {
  const paramsToSign = {
    folder,
    timestamp,
    allowed_formats: ALLOWED_FORMATS.join(","),
    max_file_size: String(MAX_FILE_SIZE),
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    allowedFormats: ALLOWED_FORMATS,
    maxFileSize: MAX_FILE_SIZE,
  };
}
```

Key points:
- `allowed_formats` and `max_file_size` are now part of `paramsToSign`, which means they're included in the cryptographic signature. Cloudinary will reject any upload that doesn't match.
- The constants are module-level (not configurable per-request) preventing parameter tampering.
- Return values include the constraints so the client can show proper UI validation.

#### File B: `src/app/api/cloudinary/sign/route.ts` — Simplify

Replace the entire file content (lines 1-48):

```ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { generateUploadSignature } from "@/lib/cloudinary";

const ALLOWED_FOLDERS = ["smiley-school", "smiley-school/gallery", "smiley-school/posts"];

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const folder = body.folder ?? "smiley-school";

  if (!ALLOWED_FOLDERS.includes(folder)) {
    return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const result = generateUploadSignature(folder, timestamp);

  return NextResponse.json({ ...result, timestamp });
}
```

Key changes:
- Removed all client-provided fileSize/mimeType validation (lines 23-42) — this is now enforced server-side by Cloudinary via the signed parameters.
- Removed `MAX_UPLOAD_BYTES` constant (now in cloudinary.ts).
- The response includes `allowedFormats` and `maxFileSize` so the frontend can validate before upload (UX), but the cryptographic signature is the actual enforcement mechanism.

---

## 2. Warning Fixes

### 2.1 Rate Limiting: Add IP-Based Key (in addition to email)

**File:** `src/features/auth/config.ts` lines 32-34  
**Severity:** ⚠️ WARNING  
**Root cause:** Rate limiting only uses email as the key. An attacker can bypass by trying different emails in rapid succession from the same IP.

**Why it matters:** In a brute-force attack, the attacker doesn't know the target email. They'll try many emails. With email-only limiting, each email gets 5 attempts — if the attacker cycles through 100 emails, they get 500 total attempts with no rate limit hit.

**Industry best practice:** Dual-keyed limiting — check both IP and email independently. If EITHER is over the limit, deny.

**Exact fix — replace lines 32-39 in `src/features/auth/config.ts`:**

```ts
// BEFORE (lines 32-39):
// Rate limit check (keyed by email to prevent distributed brute force)
const rateLimitKey = `login:${email.toLowerCase()}`;
const { success: withinLimit } = loginRateLimiter.test(rateLimitKey);

if (!withinLimit) {
  // Return null to deny login (appears as invalid credentials to the user)
  return null;
}

// AFTER:
const { getIpFromRequest } = await import("@/lib/rate-limit");
const ip = await getIpFromRequest();
const ipLimited = loginRateLimiter.test(`ip:${ip}`);
const emailLimited = loginRateLimiter.test(`email:${email.toLowerCase()}`);

if (!ipLimited.success || !emailLimited.success) {
  return null;
}
```

Also need to add the import at the top of the file. Replace line 6:

```ts
// BEFORE (line 6):
import { loginRateLimiter } from "@/lib/rate-limit";

// AFTER:
import { loginRateLimiter, getIpFromRequest } from "@/lib/rate-limit";
```

Then update line 33 to use the static import:

```ts
// Use static import instead of dynamic:
const ip = await getIpFromRequest();
```

---

### 2.2 Dark Mode for Admin Login Page

**File:** `src/app/(admin)/admin/login/page.tsx` lines 55, 75, 94  
**Severity:** ⚠️ WARNING  
**Root cause:** Hardcoded `bg-white` on the card (line 55) and inputs (lines 75, 94). These won't adapt to dark mode.

**Why it matters:** The dark theme implementation (plan section 4.6) requires all hardcoded colors to use CSS variables. The admin login page has a stark white card on a dark navy background in dark mode, creating a jarring contrast and defeating the purpose of dark mode.

**Exact fixes:**

**Line 55 — Card background:**
```tsx
// BEFORE:
<div className="bg-white rounded-2xl p-8 shadow-2xl">

// AFTER:
<div className="bg-[var(--card)] rounded-2xl p-8 shadow-2xl">
```

**Line 75 — Email input:**
```tsx
// BEFORE:
className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-[var(--text-body)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] focus:border-[var(--yellow-primary)] transition-colors"

// AFTER:
className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text-body)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] focus:border-[var(--yellow-primary)] transition-colors"
```

**Line 94 — Password input (same change):**
```tsx
// BEFORE:
className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-[var(--text-body)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] focus:border-[var(--yellow-primary)] transition-colors"

// AFTER:
className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text-body)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] focus:border-[var(--yellow-primary)] transition-colors"
```

**Line 100 — Error message background:** Also uses hardcoded `bg-red-50`. Replace:
```tsx
// BEFORE:
<p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">

// AFTER:
<p className="text-sm text-red-400 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-3 py-2 rounded-lg">
```

Wait — this project uses class-based dark mode with CSS variables, not Tailwind's `dark:` prefix consistently. Better approach:
```tsx
<p className="text-sm text-red-600 bg-red-50/10 dark:bg-red-900/20 px-3 py-2 rounded-lg">
```

Actually, given this project uses CSS variables and `@custom-variant dark (&:is(.dark *))`, the `dark:` prefix should work. Let me use a cleaner approach with inline style that references variables — actually no, the simplest fix since `bg-red-50` is a utility:

```tsx
<p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
```

This uses the shadcn `destructive` token which is already defined in both light and dark mode.

---

### 2.3 CSP Missing Directives and HSTS preload

**File:** `next.config.ts` lines 24-35 (CSP) and line 21 (HSTS)  
**Severity:** ⚠️ WARNING  
**Root cause:** Missing `Permissions-Policy`, `object-src 'none'`, `frame-src`, and HSTS `; preload`.

**Why it matters:**
- **`object-src 'none'`**: Without this, `<object>`, `<embed>`, and `<applet>` elements are allowed by default in CSP. These are legacy plugin vectors (Flash, Java) that have historically been XSS vectors.
- **`frame-src`**: Without explicit `frame-src`, iframes default to `default-src 'self'`. If the contact page embeds a Google Maps iframe, this would break. If we don't want any frames, explicitly set `frame-src 'none'`.
- **`Permissions-Policy`**: Without this, the browser allows all sites to access camera, microphone, geolocation via JS APIs. A school website has no legitimate need for these APIs.
- **HSTS `preload`**: The `preload` directive tells browsers to include the domain in their built-in HSTS preload list, preventing the first-request HTTP→HTTPS downgrade attack.

**Exact fixes — update `next.config.ts`:**

**Add `Permissions-Policy` header — insert after line 17 (after Referrer-Policy):**

```ts
{
  key: "Permissions-Policy",
  value: "camera=(), microphone=(), geolocation=()",
},
```

**Update CSP (lines 24-35), replace entire CSP value:**

```ts
{
  key: "Content-Security-Policy",
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https://res.cloudinary.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.cloudinary.com https://res.cloudinary.com",
    "media-src 'self' https://res.cloudinary.com",
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
},
```

Changes:
- Removed `'unsafe-eval'` (covered in 1.2 above)
- Added `object-src 'none'` — blocks plugins
- Added `frame-src 'none'` — explicit no-frames
- Added `media-src 'self' https://res.cloudinary.com` — restricts video/audio sources
- Removed `https://fonts.googleapis.com` from `font-src` (it was wrong — fonts come from `fonts.gstatic.com`, not `fonts.googleapis.com`; the original had it correctly but the current code added `fonts.googleapis.com` to font-src which is unnecessary)

**Update HSTS (line 21):**

```ts
// BEFORE:
value: "max-age=31536000; includeSubDomains",

// AFTER:
value: "max-age=31536000; includeSubDomains; preload",
```

**NOTE on `frame-src 'none'`:** Check if the contact page embeds a Google Maps iframe. If it does, change to:
```
"frame-src https://www.google.com https://maps.google.com",
```
Verify by searching for `<iframe` in the contact page component. If no iframe exists, `'none'` is correct.

---

### 2.4 Automated Tests

**Severity:** ⚠️ WARNING  
**Root cause:** Plan section 6 specified unit tests for security-critical code. None were written.

**Why it matters:** Security code without tests provides no regression protection. A future refactor could silently re-introduce XSS vulnerabilities, break the rate limiter, or weaken validation without anyone noticing.

**Industry best practice:** Every security boundary (sanitization, escaping, rate limiting, auth guards) MUST have automated tests. This is non-negotiable in security-sensitive code.

**Fix:** Install Vitest and create test files. See [Section 5: Test Infrastructure](#5-test-infrastructure) for full details.

---

## 3. Suggestion Fixes

### 3.1 ThemeToggle: Implement System Mode with matchMedia Listener

**File:** `src/components/shared/ThemeToggle.tsx` lines 8, 11  
**Severity:** 💡 SUGGESTION  
**Root cause:** `"system"` is declared in the `Theme` union and the default state, but:
- The `toggle()` function (line 38-46) only toggles between `"light"` and `"dark"` — never sets `"system"`.
- No `matchMedia` change listener re-applies theme when OS preference changes.

**Why it matters:** Users who set their OS to dark mode during the day and light mode at night expect the site to follow. Without the listener, the theme is frozen at whatever it was when the page loaded.

**Exact fix — replace the entire ThemeToggle component:**

```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

const THEME_KEY = "smiley-school-theme";
type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((t: Theme) => {
    const isDark =
      t === "dark" ||
      (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    const resolved = stored ?? "system";
    setTheme(resolved);
    applyTheme(resolved);
  }, [applyTheme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") applyTheme("system");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, applyTheme]);

  function cycle() {
    const order: Theme[] = ["system", "light", "dark"];
    const next = order[(order.indexOf(theme) + 1) % 3];
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  if (!mounted) {
    return (
      <button aria-label="Toggle theme" className="flex items-center justify-center rounded-lg p-2 text-[var(--text-muted)] hover:text-[var(--navy-deep)] hover:bg-[var(--navy-light)] transition-colors" disabled>
        <Sun size={18} />
      </button>
    );
  }

  const isDark = document.documentElement.classList.contains("dark");
  const icons = { system: <Monitor size={18} />, light: <Moon size={18} />, dark: <Sun size={18} /> };
  const labels = { system: "Follow system theme", light: "Switch to dark mode", dark: "Switch to system theme" };

  return (
    <button
      onClick={cycle}
      aria-label={labels[theme]}
      title={labels[theme]}
      className="flex items-center justify-center rounded-lg p-2 text-[var(--text-muted)] hover:text-[var(--navy-deep)] hover:bg-[var(--navy-light)] transition-colors"
    >
      {icons[theme]}
    </button>
  );
}
```

Key changes:
- Three-state cycle: system → light → dark → system
- `matchMedia` change listener re-applies when `theme === "system"`
- Cleanup on unmount (prevents memory leak)
- `Monitor` icon for system mode (clear visual feedback)
- `classList.toggle` instead of separate add/remove

---

### 3.2 Add Missing `getUserRole()` Helper

**File:** `src/lib/auth.ts`  
**Severity:** 💡 SUGGESTION  
**Root cause:** Plan section 2.7 specified this helper but it was not implemented.

**Why it matters:** Without this helper, every component/action that needs the user's role must call `auth()` and perform the same type assertion `(session.user as { role?: string }).role`. This is duplicated code and fragile.

**Exact fix — add after line 43 in `src/lib/auth.ts`:**

```ts
export async function getUserRole(): Promise<string | null> {
  const session = await auth();
  return (session?.user as { role?: string } | undefined)?.role ?? null;
}
```

Insert before the `getAdminSession` function (before line 42).

---

## 4. Additional Issues Found During Deep Review

### 4.1 Memory Leak: `setInterval` without `unref()` in RateLimiter

**File:** `src/lib/rate-limit.ts` line 16  
**Severity:** MEDIUM (production reliability)  
**Root cause:** `setInterval(() => this.cleanup(), cleanupIntervalMs)` creates a timer that prevents the Node.js process from exiting. In serverless environments (Vercel) this is less critical, but in Docker deployments it prevents graceful shutdown.

**Why it matters:** When the Node.js process tries to shut down (e.g., `SIGTERM` in Docker), the interval keeps the event loop alive, requiring a `SIGKILL` force-kill after the timeout.

**Industry best practice:** Call `.unref()` on intervals that are not critical to application correctness. The cleanup interval is auxiliary — if it doesn't run, the stale entries will be cleaned on the next `test()` call anyway.

**Exact fix — replace line 16:**

```ts
// BEFORE:
setInterval(() => this.cleanup(), cleanupIntervalMs);

// AFTER:
const timer = setInterval(() => this.cleanup(), cleanupIntervalMs);
if (typeof timer.unref === "function") timer.unref();
```

---

### 4.2 CSP `font-src` Includes Wrong Google Domain

**File:** `next.config.ts` line 30  
**Severity:** LOW  
**Root cause:** The current CSP has `font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com`. Google Fonts serves CSS from `fonts.googleapis.com` but the actual font files (`.woff2`) from `fonts.gstatic.com`. Having `fonts.googleapis.com` in `font-src` is unnecessary and overly permissive.

**Fix:** This is already being addressed in section 2.3 — the corrected CSP only has `https://fonts.gstatic.com` in `font-src`.

---

### 4.3 Admin Login Page Missing Suspense Boundary for `useSearchParams`

**File:** `src/app/(admin)/admin/login/page.tsx` line 10  
**Severity:** MEDIUM (may cause build error in production)  
**Root cause:** `useSearchParams()` in Next.js 16 requires a `<Suspense>` boundary wrapping the component that uses it, or the build will fail.

**Why it matters:** Without Suspense, Next.js cannot statically analyze the page and may fall back to client-side rendering, or the build may throw an error.

**Exact fix — wrap the page in a Suspense boundary:**

Create a wrapper component and a page component. Replace the file:

```tsx
"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--navy-deep)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--yellow-primary)] flex items-center justify-center">
              <span className="text-[var(--navy-deep)] font-bold text-lg font-fraunces">S</span>
            </div>
            <span className="text-white font-fraunces text-2xl font-semibold">
              Smiley School
            </span>
          </div>
          <p className="text-[var(--navy-light)] text-sm">Admin Portal</p>
        </div>

        <div className="bg-[var(--card)] rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-fraunces font-semibold text-[var(--navy-deep)] mb-6">
            Sign in
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-body)] mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text-body)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] focus:border-[var(--yellow-primary)] transition-colors"
                placeholder="admin@smileyschool.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-body)] mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text-body)] text-sm outline-none focus:ring-2 focus:ring-[var(--yellow-primary)] focus:border-[var(--yellow-primary)] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all",
                "bg-[var(--navy-deep)] text-white",
                "hover:bg-[var(--navy-mid)] active:translate-y-px",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--navy-deep)]">
      <div className="w-10 h-10 rounded-xl bg-[var(--yellow-primary)] animate-pulse" />
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
```

---

### 4.4 `requireAdmin()` Should Return Session (DRY + Type Safety)

**File:** `src/lib/auth.ts` lines 15-20  
**Severity:** LOW  
**Root cause:** `requireAdmin()` redirects on failure but returns `void` on success. Every caller that needs user data has to call `auth()` again separately.

**Why it matters:** Duplicated `auth()` calls add latency (though small) and code repetition.

**Exact fix — update `requireAdmin` to return the user:**

```ts
// BEFORE:
export async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
}

// AFTER:
export async function requireAdmin(): Promise<{ id: string; email: string; role: string }> {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  const user = session.user as { id: string; email: string; role?: string };
  return { id: user.id, email: user.email, role: user.role ?? "ADMIN" };
}
```

Similarly update `requireSuperAdmin`:

```ts
// BEFORE:
export async function requireSuperAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "SUPER_ADMIN") {
    redirect("/admin/login");
  }
}

// AFTER:
export async function requireSuperAdmin(): Promise<{ id: string; email: string }> {
  const session = await auth();
  const user = session?.user as { id: string; email: string; role?: string } | undefined;
  if (!user || user.role !== "SUPER_ADMIN") {
    redirect("/admin/login");
  }
  return { id: user.id, email: user.email };
}
```

**Note:** This is a non-breaking change. Existing callers that ignore the return value will still work.

---

### 4.5 `globals.css` color-scheme Should Include `dark`

**File:** `src/app/globals.css` line 176  
**Severity:** LOW  
**Root cause:** `color-scheme: light;` means the browser will never use native dark mode controls (scrollbars, form controls). Plan section 4.3 specified `light dark`.

**Exact fix — replace line 176:**

```css
/* BEFORE: */
color-scheme: light;

/* AFTER: */
color-scheme: light dark;
```

This tells the browser the page supports both modes, enabling native dark scrollbars and form controls when `.dark` is active. This is already covered by `html.dark { color-scheme: dark; }` on line 179-181, but both should be consistent. Actually, looking at it again — line 176 sets the default to `light` and line 180 sets `.dark` to `dark`. This is a valid pattern. Let me leave this as-is since the explicit `.dark` override handles it correctly.

Actually wait — the better pattern is `color-scheme: light` in `:root` and `color-scheme: dark` in `.dark`. The current code already does this (line 176 is inside `html {}` and line 180 is inside `html.dark {}`). This is correct. No change needed.

---

### 4.6 Unused Import in `contact.actions.ts`

**File:** `src/features/contact/actions/contact.actions.ts` line 9  
**Severity:** LOW (cosmetic)  
**Root cause:** `escapeHtml` and `escapeHtmlWithBreaks` are imported but only used in the `replyToContact` function (lines 90-91). The `submitContactForm` function doesn't use them directly — they're used in `email.ts`. This import is valid.

**Re-check:** Actually, looking again, these ARE used in `replyToContact` at lines 90-91 so they're not unused. No issue here.

---

### 4.7 `auth.config.ts` Type Assertion Pattern

**File:** `src/features/auth/auth.config.ts` lines 33, 40  
**Severity:** LOW  
**Root cause:** Uses `(user as { role?: string }).role` and `(session.user as { role?: string }).role` instead of leveraging the augmented types from `next-auth.d.ts`.

**Why it matters:** The `next-auth.d.ts` file already declares `role: string` on `Session.user`, but the callbacks still use type assertions. This means if the type declaration changes, the assertions won't catch it.

**Exact fix — update `auth.config.ts`:**

Line 33:
```ts
// BEFORE:
token.role = (user as { role?: string }).role;

// AFTER:
token.role = (user as { role: string }).role;
```

Wait, the issue is that in the `jwt` callback, the `user` parameter is of type `AdapterUser | User` from next-auth, which doesn't have `role` by default. Our augmentation only adds it to `Session.user`. We'd need to augment the `User` type too. Let me check what the type file looks like...

The `next-auth.d.ts` augments `Session.user` with `role: string` but doesn't augment the base `User` interface from next-auth. So in the jwt callback, `(user as { role?: string }).role` is actually necessary because the `user` object passed to the jwt callback is typed as the base next-auth User.

To fix this properly, add to `src/types/next-auth.d.ts`:

```ts
declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: string;
    };
  }
}
```

Then in `auth.config.ts`, we can use `user.role` directly. This is a minor type cleanup. Not blocking.

---

## 5. Test Infrastructure & Test Files

### 5.1 Install Vitest

```bash
npm install -D vitest @vitest/coverage-v8 jsdom
```

**Why Vitest over Jest:**
- Native ESM/TypeScript support (no babel config needed)
- Compatible with Vite's module resolution (path aliases work out of the box)
- Much faster startup (no transform step for .ts files)
- Built-in coverage with V8

### 5.2 Vitest Configuration

**Create file:** `vitest.config.ts`

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### 5.3 Update `package.json` — Add test scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### 5.4 Test File: `src/lib/__tests__/sanitize.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "../sanitize";

describe("sanitizeHtml", () => {
  it("strips <script> tags", () => {
    expect(sanitizeHtml("<script>alert(1)</script>")).toBe("");
  });

  it("strips event handler attributes", () => {
    const result = sanitizeHtml('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain("onerror");
  });

  it("strips onclick handler", () => {
    const result = sanitizeHtml('<div onclick="alert(1)">text</div>');
    expect(result).not.toContain("onclick");
  });

  it("allows safe formatting tags", () => {
    const input = "<p>Hello <strong>world</strong></p>";
    expect(sanitizeHtml(input)).toBe(input);
  });

  it("allows target attribute on links", () => {
    const input = '<a href="/foo" target="_blank">link</a>';
    expect(sanitizeHtml(input)).toContain('target="_blank"');
  });

  it("strips <iframe> tags", () => {
    const result = sanitizeHtml('<iframe src="https://evil.com"></iframe>');
    expect(result).not.toContain("iframe");
  });

  it("strips <form> tags", () => {
    const result = sanitizeHtml('<form action="/steal"><input></form>');
    expect(result).not.toContain("<form");
  });

  it("strips javascript: protocol in href", () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
    expect(result).not.toContain("javascript:");
  });

  it("handles empty string", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it("preserves nested safe HTML", () => {
    const input = "<div><h1>Title</h1><p>Paragraph with <em>emphasis</em></p></div>";
    expect(sanitizeHtml(input)).toBe(input);
  });
});
```

### 5.5 Test File: `src/lib/__tests__/html-escape.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { escapeHtml, escapeHtmlWithBreaks } from "../html-escape";

describe("escapeHtml", () => {
  it("escapes ampersands", () => {
    expect(escapeHtml("a&b")).toBe("a&amp;b");
  });

  it("escapes angle brackets", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('say "hello"')).toBe("say &quot;hello&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#x27;s");
  });

  it("handles empty string", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("escapes a full XSS payload", () => {
    const result = escapeHtml('<img src=x onerror="alert(1)">');
    expect(result).not.toContain("<");
    expect(result).not.toContain(">");
  });
});

describe("escapeHtmlWithBreaks", () => {
  it("converts newlines to <br>", () => {
    expect(escapeHtmlWithBreaks("line1\nline2")).toBe("line1<br>line2");
  });

  it("escapes HTML before converting breaks", () => {
    expect(escapeHtmlWithBreaks("<script>\nalert")).toBe(
      "&lt;script&gt;<br>alert"
    );
  });

  it("handles multiple consecutive newlines", () => {
    expect(escapeHtmlWithBreaks("a\n\nb")).toBe("a<br><br>b");
  });
});
```

### 5.6 Test File: `src/lib/__tests__/rate-limit.test.ts`

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.useFakeTimers();

// Re-import after fake timers to isolate
let RateLimiter: any;

beforeEach(async () => {
  vi.resetModules();
  const mod = await import("../rate-limit");
  RateLimiter = mod.loginRateLimiter.constructor;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("RateLimiter", () => {
  it("allows requests under the limit", () => {
    const limiter = new RateLimiter(3, 60_000);
    expect(limiter.test("a").success).toBe(true);
    expect(limiter.test("a").success).toBe(true);
    expect(limiter.test("a").success).toBe(true);
  });

  it("blocks requests over the limit", () => {
    const limiter = new RateLimiter(3, 60_000);
    limiter.test("a");
    limiter.test("a");
    limiter.test("a");
    expect(limiter.test("a").success).toBe(false);
  });

  it("respects independent keys", () => {
    const limiter = new RateLimiter(2, 60_000);
    limiter.test("a");
    limiter.test("a");
    expect(limiter.test("a").success).toBe(false);
    expect(limiter.test("b").success).toBe(true);
  });

  it("resets after window expires", () => {
    const limiter = new RateLimiter(1, 1000);
    limiter.test("a");
    expect(limiter.test("a").success).toBe(false);

    vi.advanceTimersByTime(1001);
    expect(limiter.test("a").success).toBe(true);
  });

  it("returns correct remaining count", () => {
    const limiter = new RateLimiter(5, 60_000);
    const r1 = limiter.test("a");
    expect(r1.remaining).toBe(4);
    const r2 = limiter.test("a");
    expect(r2.remaining).toBe(3);
  });

  it("returns resetAt timestamp", () => {
    const limiter = new RateLimiter(1, 60_000);
    const result = limiter.test("a");
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });
});
```

### 5.7 Test File: `src/lib/__tests__/cloudinary.test.ts`

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    utils: {
      api_sign_request: vi.fn().mockReturnValue("mock_signature"),
    },
  },
}));

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "test-cloud");
  vi.stubEnv("CLOUDINARY_API_KEY", "test-key");
  vi.stubEnv("CLOUDINARY_API_SECRET", "test-secret");
});

describe("getCloudinaryUrl", () => {
  it("preserves legitimate dots in publicId", async () => {
    const { getCloudinaryUrl } = await import("../cloudinary");
    const url = getCloudinaryUrl("gallery/photo.profile.jpg");
    expect(url).toContain("gallery/photo.profile.jpg");
  });

  it("strips path traversal sequences", async () => {
    const { getCloudinaryUrl } = await import("../cloudinary");
    const url = getCloudinaryUrl("../../etc/passwd");
    expect(url).not.toContain("..");
    expect(url).not.toContain("etc");
  });

  it("collapses multiple slashes", async () => {
    const { getCloudinaryUrl } = await import("../cloudinary");
    const url = getCloudinaryUrl("gallery//sub///file.jpg");
    expect(url).toContain("gallery/sub/file.jpg");
  });

  it("includes default transforms", async () => {
    const { getCloudinaryUrl } = await import("../cloudinary");
    const url = getCloudinaryUrl("test.jpg");
    expect(url).toContain("f_auto");
    expect(url).toContain("q_auto");
    expect(url).toContain("c_fill");
  });
});

describe("generateUploadSignature", () => {
  it("includes allowed_formats in signature params", async () => {
    const { generateUploadSignature } = await import("../cloudinary");
    const result = generateUploadSignature("smiley-school", 1234567890);
    expect(result.allowedFormats).toBeDefined();
    expect(result.allowedFormats).toContain("jpg");
    expect(result.allowedFormats).toContain("png");
  });

  it("includes maxFileSize in response", async () => {
    const { generateUploadSignature } = await import("../cloudinary");
    const result = generateUploadSignature("smiley-school", 1234567890);
    expect(result.maxFileSize).toBe(10 * 1024 * 1024);
  });
});
```

---

## 6. Implementation Order

| Step | Fix | Files | Estimated Time |
|------|-----|-------|----------------|
| 1 | **Install Vitest + config** | `package.json`, `vitest.config.ts` | 5 min |
| 2 | **Fix Cloudinary regex** (1.1) | `src/lib/cloudinary.ts` | 5 min |
| 3 | **Fix Cloudinary signature** (1.3) | `src/lib/cloudinary.ts`, `src/app/api/cloudinary/sign/route.ts` | 15 min |
| 4 | **Remove unsafe-eval from CSP** (1.2) | `next.config.ts` | 2 min |
| 5 | **Complete CSP + Permissions-Policy** (2.3) | `next.config.ts` | 10 min |
| 6 | **Rate limit dual-key** (2.1) | `src/features/auth/config.ts` | 10 min |
| 7 | **Rate limiter unref()** (4.1) | `src/lib/rate-limit.ts` | 5 min |
| 8 | **Admin login dark mode** (2.2) | `src/app/(admin)/admin/login/page.tsx` | 10 min |
| 9 | **Admin login Suspense** (4.3) | `src/app/(admin)/admin/login/page.tsx` | 10 min |
| 10 | **ThemeToggle system mode** (3.1) | `src/components/shared/ThemeToggle.tsx` | 15 min |
| 11 | **Add getUserRole()** (3.2) | `src/lib/auth.ts` | 5 min |
| 12 | **requireAdmin returns user** (4.4) | `src/lib/auth.ts` | 10 min |
| 13 | **Write tests** (5.4–5.7) | `src/lib/__tests__/*.test.ts` | 30 min |
| 14 | **Run tests + build** | terminal | 10 min |

**Total: ~2.5 hours**

---

## 7. Verification Steps

After all fixes are applied:

### 7.1 Build passes
```bash
npm run build
```
Expected: Exit 0, no TypeScript errors.

### 7.2 Tests pass
```bash
npm run test
```
Expected: All 30+ test cases pass.

### 7.3 CSP headers correct
```bash
# Start dev server and check headers
curl -I http://localhost:3000 | grep -i "content-security-policy"
```
Expected:
- No `unsafe-eval`
- Contains `object-src 'none'`
- Contains `frame-src 'none'`
- Contains `media-src`

### 7.4 Permissions-Policy present
```bash
curl -I http://localhost:3000 | grep -i "permissions-policy"
```
Expected: `camera=(), microphone=(), geolocation=()`

### 7.5 HSTS with preload
```bash
curl -I http://localhost:3000 | grep -i "strict-transport-security"
```
Expected: `max-age=31536000; includeSubDomains; preload`

### 7.6 Admin login dark mode visual check
- Open `/admin/login` in browser
- Toggle to dark mode
- Verify card is dark (not white flash), inputs have dark backgrounds

### 7.7 Theme toggle three-state cycle
- Click theme toggle: should cycle through system → light → dark → system
- When in "system" mode, changing OS preference should update theme immediately
- Refresh page — theme persists

### 7.8 Cloudinary upload validation
- Verify signed upload response includes `allowedFormats` and `maxFileSize`
- Attempt uploading a `.exe` file — should be rejected by Cloudinary

---

## Summary of All File Changes

| File | Action | Section |
|------|--------|---------|
| `src/lib/cloudinary.ts` | Modify (regex + signature) | 1.1, 1.3 |
| `next.config.ts` | Modify (CSP + headers) | 1.2, 2.3 |
| `src/app/api/cloudinary/sign/route.ts` | Rewrite | 1.3 |
| `src/features/auth/config.ts` | Modify (dual rate limit key) | 2.1 |
| `src/lib/rate-limit.ts` | Modify (unref) | 4.1 |
| `src/app/(admin)/admin/login/page.tsx` | Rewrite (dark mode + Suspense) | 2.2, 4.3 |
| `src/components/shared/ThemeToggle.tsx` | Rewrite (system mode) | 3.1 |
| `src/lib/auth.ts` | Modify (getUserRole + return types) | 3.2, 4.4 |
| `src/types/next-auth.d.ts` | Modify (User interface augmentation) | 4.7 |
| `vitest.config.ts` | **NEW** | 5.2 |
| `package.json` | Modify (test scripts + deps) | 5.1, 5.3 |
| `src/lib/__tests__/sanitize.test.ts` | **NEW** | 5.4 |
| `src/lib/__tests__/html-escape.test.ts` | **NEW** | 5.5 |
| `src/lib/__tests__/rate-limit.test.ts` | **NEW** | 5.6 |
| `src/lib/__tests__/cloudinary.test.ts` | **NEW** | 5.7 |
