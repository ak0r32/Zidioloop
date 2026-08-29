export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/feedback/:path*",
    "/themes/:path*",
    "/trends/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/members/:path*",
  ],
};
