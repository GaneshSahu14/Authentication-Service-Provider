// src/schemas/index.ts
import { UserRole } from "@prisma/client";
import * as z from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

export const Settingschema = z.object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.enum([UserRole.ADMIN, UserRole.USER]),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(12)),
    newPassword: z.optional(z.string().min(12)),
})

.refine((data) =>{
    if (data.password && !data.newPassword) {
        return false;
    }

    return true;
},{
    message: "Password is required!",
    path: ["Password"]
})

export const NewPasswordSchema = z.object({
    password: z.string().min(12,{ message: "Password must be at least 12 characters and include uppercase and lowercase letters, numbers, and symbols,Not a word or phrase,Not a name, birthday, or pet's name." }),
});

export const ResetSchema = z.object({
    email: z.string().email({ message: "Email is required" }),
});

export const LoginSchema = z.object({
    email: z.string().email({ message: "Email is required" }),
    password: z.string().min(1, { message: "Password is required" }),
    code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
    email: z.string().email({ message: "Email is required" }),
    password: z.string().refine(
        (val) => passwordRegex.test(val),
        {
            message:
                "Password must be at least 12 characters and include uppercase and lowercase letters, numbers, and symbols,Not a word or phrase,Not a name, birthday, or pet's name.",
        }
    ),
    name: z.string().min(1, { message: "Name is required" }),
});