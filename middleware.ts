import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // Exclude: auth pages, public API endpoints (api/copy uses its own key auth),
  // register/login flows, and Next.js internals
  matcher: [
    "/((?!login|register|api/auth|api/register|api/copy|api/sessions/end|api/v1|_next/static|_next/image|favicon.ico).*)",
  ],
};
