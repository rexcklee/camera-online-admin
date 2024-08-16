import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // List of paths that be protected
  const protectedPaths = ["/dashboard/user", "/dashboard/category"];

  // Check if the requested path is protected
  if (protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
  return NextResponse.next(); // Continue to the requested page
}

export const config = {
  matcher: ["/dashboard/user/:path*", "/dashboard/category/:path*"], // Define paths you want to protect
};
