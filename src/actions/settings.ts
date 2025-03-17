"use server";

import * as z from "zod";
import bcrypt from "bcryptjs"; // ✅ Correct bcrypt import
import { db } from "@/lib/db";
import { Settingschema } from "../schemas";
import { getUserByEmail, getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { generateVerificationToken } from "@/lib/tokens";
import { unstable_update } from "@/auth";
import { sendVerificationEmail } from "@/lib/mail"; // ✅ Ensure this function exists

export const settings = async (values: z.infer<typeof Settingschema>) => {
    const user = await currentUser();

    if (!user) {
        return { error: "User not authorized!" };
    }

    if (user.isOAuth) {
        values.email = undefined;
        values.password = undefined;
        values.newPassword = undefined;
        values.isTwoFactorEnabled = undefined;
    }

    // Handle email change
    if (values.email && values.email !== user.email) {
        const existingUser = await getUserByEmail(values.email);

        if (existingUser && existingUser.id !== user.id) {
            return { error: "Email already exists!" };
        }

        const verificationToken = await generateVerificationToken(values.email);
        await sendVerificationEmail(verificationToken.email, verificationToken.token);

        return { success: "Verification email sent!" };
    }

    // Fetch the user from the database
    const dbUser = await getUserById(user.id);
    if (!dbUser) {
        return { error: "User not found!" };
    }

    // Handle password change
    if (values.password && values.newPassword) {
        if (!dbUser.password) {
            return { error: "No password set for this user!" };
        }

        const passwordsMatch = await bcrypt.compare(values.password, dbUser.password);
        if (!passwordsMatch) {
            return { error: "Incorrect password!" };
        }

        const hashedPassword = await bcrypt.hash(values.newPassword, 10);
        values.password = hashedPassword;
        values.newPassword = undefined; 
    }

    // Update user settings
    const updateUser = await db.user.update({
        where: { id: dbUser.id },
        data: { ...values },
    });

    unstable_update({ user: { name: updateUser.name, email: updateUser.email, isTwoFactorEnabled: updateUser.isTwoFactorEnabled, role: updateUser.role}});

    return { success: "Settings updated!" };
};
