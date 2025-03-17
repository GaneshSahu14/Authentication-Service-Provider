// middleware.ts
import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes } from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix); // /api/auth
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname); // ["/", "/auth/login", "/auth/register"]
    const isAuthRoute = authRoutes.includes(nextUrl.pathname); // ["/auth/login", "/auth/register"]

    if (isApiAuthRoute) {
        return; // Allow auth API requests
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl)); // /dashboard
        }
        return; // Allow access to login/register pages
    }

    if (!isLoggedIn && !isPublicRoute) {
        return Response.redirect(new URL("/auth/login", nextUrl)); // Redirect to actual login page
    }

    return; // Proceed for authenticated users or public routes
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};