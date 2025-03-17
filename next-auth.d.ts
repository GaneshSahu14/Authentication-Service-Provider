// next-auth.d.ts (root)
import { UserRole } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role?: UserRole;
            isTwoFactorEnabled: boolean;
            isOAuth: boolean;
        } & DefaultSession["user"];
    }
    
    interface User {  
        id: string;
        email?: string;
        password?: string;
        role?: UserRole;
        isTwoFactorEnabled: boolean; 
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: UserRole;
        sub?: string;
        isTwoFactorEnabled?: boolean; 
    }
}

declare module "@auth/core/adapters" {
    interface AdapterUser extends DefaultSession["user"] {
        role?: UserRole;
        isTwoFactorEnabled?: boolean; 
    }
}
