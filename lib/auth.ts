import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { timingSafeEqual } from "node:crypto";
import { isAdminEmail, isStaffEmail } from "@/lib/access";
import { analyticsTypes, recordAnalyticsEvent } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

const classroomScopes = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
  "https://www.googleapis.com/auth/classroom.student-submissions.me.readonly"
];

const baseScopes = ["openid", "email", "profile"];

export const googleAuthConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const localAdminConfigured = Boolean(
  process.env.ADMIN_LOCAL_USERNAME && process.env.ADMIN_LOCAL_PASSWORD
);

function safeCompare(left?: string, right?: string) {
  if (!left || !right) return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

const enabledScopes = [
  ...baseScopes,
  ...(process.env.ENABLE_CLASSROOM_API === "true" ? classroomScopes : []),
  ...(process.env.ENABLE_GMAIL_API === "true"
    ? ["https://www.googleapis.com/auth/gmail.metadata"]
    : []),
  ...(process.env.ENABLE_CALENDAR_API === "true"
    ? ["https://www.googleapis.com/auth/calendar.readonly"]
    : [])
];

async function refreshAccessToken(token: {
  refreshToken?: string;
  accessToken?: string;
  accessTokenExpires?: number;
}) {
  if (!token.refreshToken) {
    return { ...token, authError: "RefreshAccessTokenMissing" };
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID ?? "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        grant_type: "refresh_token",
        refresh_token: token.refreshToken
      })
    });

    const refreshed = (await response.json()) as {
      access_token?: string;
      expires_in?: number;
      refresh_token?: string;
      error?: string;
    };

    if (!response.ok || !refreshed.access_token) {
      throw new Error(refreshed.error ?? "Unable to refresh Google access token");
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + (refreshed.expires_in ?? 3600) * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      authError: undefined
    };
  } catch {
    return { ...token, authError: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    ...(googleAuthConfigured
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
              params: {
                scope: enabledScopes.join(" "),
                access_type: "offline",
                prompt: "consent"
              }
            }
          })
        ]
      : []),
    CredentialsProvider({
      id: "admin-credentials",
      name: "Dixie Hub administrator",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!localAdminConfigured) return null;

        const validUsername = safeCompare(
          credentials?.username,
          process.env.ADMIN_LOCAL_USERNAME
        );
        const validPassword = safeCompare(
          credentials?.password,
          process.env.ADMIN_LOCAL_PASSWORD
        );

        if (!validUsername || !validPassword) return null;

        const username = process.env.ADMIN_LOCAL_USERNAME!;
        return {
          id: "local-admin",
          name: "Dixie Hub Administrator",
          email: `${username}@dixie-hub.local`
        };
      }
    })
  ],
  callbacks: {
    async signIn({ profile, account }) {
      if (account?.provider === "admin-credentials") {
        return localAdminConfigured;
      }

      const googleProfile = profile as
        | { email?: string; email_verified?: boolean }
        | undefined;

      if (googleProfile?.email_verified === false) {
        return false;
      }

      const allowedEmail = process.env.ALLOWED_GOOGLE_EMAIL?.trim().toLowerCase();
      const allowedDomain = process.env.ALLOWED_GOOGLE_DOMAIN
        ?.trim()
        .toLowerCase()
        .replace(/^@/, "");
      const email = googleProfile?.email?.toLowerCase();
      const isAllowedAdmin = isAdminEmail(email);
      const matchesSingleStudent = Boolean(allowedEmail && email === allowedEmail);
      const matchesDomain = Boolean(
        allowedDomain && email?.endsWith(`@${allowedDomain}`)
      );
      const hasRestriction = Boolean(allowedEmail || allowedDomain);

      if (
        hasRestriction &&
        !isAllowedAdmin &&
        !matchesSingleStudent &&
        !matchesDomain
      ) {
        return false;
      }

      return true;
    },
    async jwt({ token, account, user, profile }) {
      if (account?.provider === "admin-credentials") {
        return {
          ...token,
          sub: user?.id ?? "local-admin",
          name: user?.name ?? "Dixie Hub Administrator",
          email: user?.email,
          isAdmin: true,
          isStaff: true
        };
      }

      if (account) {
        const googleProfile = profile as
          | { email?: string; name?: string; picture?: string }
          | undefined;
        const email = googleProfile?.email ?? token.email;
        let databaseUserId = user?.id ?? token.sub;

        if (email) {
          try {
            const databaseUser = await prisma.user.upsert({
              where: { email: email.toLowerCase() },
              update: {
                name: googleProfile?.name ?? token.name ?? undefined,
                image: googleProfile?.picture ?? token.picture ?? undefined,
                isDemo: false,
                loginCount: { increment: 1 },
                lastLoginAt: new Date()
              },
              create: {
                email: email.toLowerCase(),
                name: googleProfile?.name ?? token.name ?? undefined,
                image: googleProfile?.picture ?? token.picture ?? undefined,
                loginCount: 1,
                lastLoginAt: new Date()
              }
            });
            databaseUserId = databaseUser.id;

            await prisma.oAuthAccount.upsert({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId
                }
              },
              update: {
                userId: databaseUser.id,
                scopes: account.scope,
                tokenExpiresAt: account.expires_at
                  ? new Date(account.expires_at * 1000)
                  : null
              },
              create: {
                userId: databaseUser.id,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                scopes: account.scope,
                tokenExpiresAt: account.expires_at
                  ? new Date(account.expires_at * 1000)
                  : null
              }
            });

            await recordAnalyticsEvent({
              userId: databaseUser.id,
              eventType: analyticsTypes.login
            });
          } catch {
            // Authentication remains available if analytics storage is unavailable.
          }
        }

        return {
          ...token,
          sub: databaseUserId,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 3600 * 1000,
          isAdmin: isAdminEmail(email),
          isStaff: isStaffEmail(email)
        };
      }

      if (token.isAdmin) {
        return token;
      }

      if (
        token.accessToken &&
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - 60_000
      ) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
      }
      session.authError = token.authError;
      session.isAdmin = Boolean(token.isAdmin);
      session.isStaff = Boolean(token.isStaff) || isStaffEmail(token.email);
      return session;
    }
  },
  pages: { signIn: "/admin/login" }
};
