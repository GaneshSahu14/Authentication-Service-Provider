"use server";
import { getTwoFactorConfirmationByUserId } from './../../data/two-factor-confirmation';
import { LoginSchema } from "../schemas";
import * as z from "zod";
import { signIn } from "../../auth";
import { DEFAULT_LOGIN_REDIRECT } from "../../routes";
import { AuthError } from "next-auth";
import { generateVerificationToken, generateTwoFactorToken } from "../../lib/tokens";
import { getUserByEmail } from "../../data/user"; 
import { sendVerificationEmail, sendTwoFactorTokenEmail } from "../../lib/mail";
import { getTwoFactorTokenByEmail } from "../../data/two-factor-token";
import { error } from "console";
import { db } from "../../lib/db";

export const login = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password, code } = validatedFields.data;

    const existingUser = await getUserByEmail(email);

    if (!existingUser || !existingUser.email || !existingUser.password) {
        return { error: "Email does not exist " };
    }

    if (!existingUser.emailVerified) {
        const verificationToken = await generateVerificationToken(existingUser.email);
        await sendVerificationEmail(verificationToken.email, verificationToken.token);
        return { success: "Confirmation email sent! " };
    }

    if (!existingUser.isTwoFactorEnabled && existingUser.email) {
        if (code) {
            const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);
            if (!twoFactorToken) {
                return { error: "Invalid code!"}
            }
            if (twoFactorToken.token !== code) {
                return {error: "Invalid code!"}
            }

            const hashExpired = new Date(twoFactorToken.expiresAt) < new Date();
            if (hashExpired) {
                return { error: "Code has expired!" };
            }
            await db.twoFactorToken.delete({
                where: { id: twoFactorToken.id },
            });

            const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id!);
            if (existingConfirmation) {
                await db.twoFactorConfirmation.delete({
                    where: { id: existingConfirmation.id },
                });
            }

            await db.twoFactorConfirmation.create({
                data: {
                    userId: existingUser.id!,
                },
            });
        }else{
        const twoFactorToken = await generateTwoFactorToken(existingUser.email);
        await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);
        return { twoFactor: true };
    }
    }
    try {
        await signIn("credentials", {
            email,
            password,
            redirect: false,
            redirectTo: DEFAULT_LOGIN_REDIRECT,
        });

        return { success: "Login successful!" };
    } catch (error) {
        console.error("Login Error:", error);

        if (error instanceof TypeError && error.message.includes("fetch failed")) {
            return { error: "Network error. Check your connection." };
        }

        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Wrong email or password." };
                default:
                    return { error: "Something went wrong. Try again." };
            }
        }

        return { error: "Unexpected error. Please try again." };
    }
};