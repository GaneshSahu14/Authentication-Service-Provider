// auth.config.ts
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { LoginSchema } from "@/src/schemas";
import { getUserByEmail } from "@/data/user";
import bcrypt from "bcryptjs";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { User as PrismaUser } from "@prisma/client"; // Import Prisma User
import { User } from "next-auth"; // Import NextAuth User for type assertion

export default {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Github({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
        Credentials({
            async authorize(credentials: Partial<Record<string, unknown>>, request: Request) {
                const validatedFields = LoginSchema.safeParse(credentials);
                if (!validatedFields.success) {
                    return null;
                }

                const { email, password } = validatedFields.data;
                const prismaUser = await getUserByEmail(email);
                if (!prismaUser || !prismaUser.password) {
                    return null;
                }

                const passwordsMatch = await bcrypt.compare(password, prismaUser.password!);
                if (!passwordsMatch) {
                    return null;
                }

                // Transform PrismaUser to match NextAuth User, ensuring password is string | undefined
                const user = {
                    id: prismaUser.id,
                    email: prismaUser.email ?? undefined,
                    password: prismaUser.password ?? undefined, // Convert null to undefined
                    role: prismaUser.role,
                };

                return user as User; // Cast to NextAuth’s User type
            },
        }),
    ],
} satisfies NextAuthConfig;