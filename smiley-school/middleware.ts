export { auth as middleware } from "@/features/auth/config";

export const config = {
  matcher: [
    // Run middleware on admin routes only (not login, not static assets)
    "/admin/:path*",
  ],
};
