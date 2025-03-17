import NextAuth, { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import authConfig from "./auth.config";
import { getUserById } from "./data/user";
import { getAccountByUserId } from "./data/account"; // ✅ Importing getAccountByUserId
import { UserRole } from "@prisma/client";
import { getTwoFactorConfirmationByUserId } from "./data/two-factor-confirmation";

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
    unstable_update,
} = NextAuth({
    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    },
    events: {
        async linkAccount({ user }) {
            if (!user.id) throw new Error("User ID is undefined");

            await db.user.update({
                where: { id: user.id },
                data: { emailVerified: new Date() },
            });
        },
    },
    callbacks: {
        async signIn({ user, account }) {
            console.log({ user, account });

            if (account?.provider !== "credentials") {
                return true;
            }

            if (!user.id) {
                throw new Error("User ID is undefined");
            }

            const existingUser = await getUserById(user.id);
            if (!existingUser || !existingUser.emailVerified) return false;

            if (existingUser.isTwoFactorEnabled) {
                const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

                if (!twoFactorConfirmation) return false;

                // Delete 2FA confirmation after successful verification
                await db.twoFactorConfirmation.delete({
                    where: { id: twoFactorConfirmation.id },
                });
            }

            return true;
        },

        async session({ token, session }) {
            if (session.user) {
                session.user.id = token.sub ?? session.user.id;
                session.user.role = (token.role as UserRole) ?? session.user.role;
                session.user.isTwoFactorEnabled = Boolean(token.isTwoFactorEnabled);
                session.user.name = token.name ?? ""; 
                session.user.email = token.email ?? "";
                session.user.isOAuth = token.isOAuth as boolean;
            }
            return session;
        },

        async jwt({ token }) {
            if (!token.sub) return token;

            const existingUser = await getUserById(token.sub);
            if (!existingUser) return token;

            const existingAccount = await getAccountByUserId(existingUser.id);

            return {
                ...token,
                isOAuth: !!existingAccount, // ✅ Fixed issue (changed '=' to ':')
                name: existingUser.name ?? "", // Ensure name is always a string
                email: existingUser.email ?? "",
                role: existingUser.role,
                isTwoFactorEnabled: Boolean(existingUser.isTwoFactorEnabled),
            };
        },
    },
    adapter: PrismaAdapter(db) as any, // Temporary type override to fix TypeScript issues
    session: { strategy: "jwt" },
    ...authConfig,
});
