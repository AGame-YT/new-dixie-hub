import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/roles";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
    } & DefaultSession["user"];
    authError?: string;
    role?: Role;
    /** Convenience flags derived from `role`. */
    isAdmin?: boolean;
    isStaff?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    authError?: string;
    role?: Role;
    roleCheckedAt?: number;
  }
}
