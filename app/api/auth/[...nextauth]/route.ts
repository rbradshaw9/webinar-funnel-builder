import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Enable debug mode in development
const isDebug = process.env.NODE_ENV === 'development' || process.env.NEXTAUTH_DEBUG === 'true';

if (isDebug) {
  console.log('[NextAuth] Debug mode enabled');
  console.log('[NextAuth] Environment check:', {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Missing',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'Not set',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? '✓ Set' : '✗ Missing',
    NODE_ENV: process.env.NODE_ENV,
  });
}

export const authOptions: NextAuthOptions = {
  debug: isDebug,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (isDebug) {
            console.log('[NextAuth] Authorize attempt:', {
              username: credentials?.username,
              hasPassword: !!credentials?.password,
            });
          }

          // Get credentials from environment variables
          const adminUsername = process.env.ADMIN_USERNAME || 'admin';
          const adminPassword = process.env.ADMIN_PASSWORD || 'MiR43Tx2-';

          if (
            credentials?.username === adminUsername &&
            credentials?.password === adminPassword
          ) {
            if (isDebug) {
              console.log('[NextAuth] Authorization successful');
            }
            return {
              id: "1",
              name: "Admin",
              email: "admin@thecashflowacademy.com"
            };
          }

          if (isDebug) {
            console.log('[NextAuth] Authorization failed - invalid credentials');
          }
          return null;
        } catch (error) {
          console.error('[NextAuth] Error in authorize:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = user.id;
          if (isDebug) {
            console.log('[NextAuth] JWT callback - user signed in:', user.id);
          }
        }
        return token;
      } catch (error) {
        console.error('[NextAuth] Error in jwt callback:', error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          session.user.id = token.id as string;
          if (isDebug) {
            console.log('[NextAuth] Session callback:', session.user.id);
          }
        }
        return session;
      } catch (error) {
        console.error('[NextAuth] Error in session callback:', error);
        return session;
      }
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
