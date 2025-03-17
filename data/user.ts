// src/data/user.ts
import { db } from "../lib/db";
import { UserRole } from "@prisma/client";

interface AuthUser {
    id: string;
    name?: string | null;  // ✅ Added name field
    email?: string | null;
    password?: string | null;
    role: UserRole;
    emailVerified?: Date | null;
    isTwoFactorEnabled: boolean;  
}

export const getUserByEmail = async (email: string | null | undefined): Promise<AuthUser | null> => {
    if (!email) {
        console.log("Email is null or undefined, returning null");
        return null;
    }

    try {
        const user = await db.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,  // ✅ Added name field
                email: true,
                password: true,
                role: true,
                emailVerified: true,
                isTwoFactorEnabled: true
            },
        });
        return user;
    } catch (error) {
        console.error("Failed to fetch user by email:", error);
        return null;
    }
};

export const getUserById = async (id: string): Promise<AuthUser | null> => {
    try {
        const user = await db.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,  // ✅ Added name field
                role: true,
                emailVerified: true,
                isTwoFactorEnabled: true
            },
        });
        return user;
    } catch (error) {
        console.error("Failed to fetch user by ID:", error);
        return null;
    }
};
