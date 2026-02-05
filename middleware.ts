import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value;
  const { pathname } = req.nextUrl;
  const isAuthpage = pathname.startsWith("/login");
  if (token && isAuthpage) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/peoples", "/profilePage"],
};
