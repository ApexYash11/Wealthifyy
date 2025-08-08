import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import { authAPI } from '@/lib/auth-api';

const handler = NextAuth({
  providers: [
    // Custom credentials provider for our backend
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const response = await authAPI.login({
            username: credentials.username,
            password: credentials.password,
          });

          if (response.access_token) {
            return {
              id: response.user.id.toString(),
              name: response.user.name || response.user.username,
              email: response.user.email,
              accessToken: response.access_token,
            };
          }
          return null;
        } catch (error) {
          console.error('Login error:', error);
          return null;
        }
      }
    }),

    // Google OAuth provider (disabled for now)
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),

    // GitHub OAuth provider (disabled for now)
    // GithubProvider({
    //   clientId: process.env.GITHUB_ID!,
    //   clientSecret: process.env.GITHUB_SECRET!,
    // }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        if (account.provider === 'credentials') {
          // For credentials login, we already have the access token
          token.accessToken = user.accessToken;
        } else {
          // For OAuth, we need to exchange the code for our backend token
          try {
            const response = await authAPI.handleOAuthCallback(
              account.code!,
              account.state
            );
            token.accessToken = response.access_token;
          } catch (error) {
            console.error('OAuth callback error:', error);
          }
        }
        
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      // For OAuth providers, we need to handle the callback
      if (account?.provider !== 'credentials') {
        // The actual OAuth handling is done in the JWT callback
        return true;
      }
      return true;
    },
  },

  pages: {
    signIn: '/login',
    signUp: '/register',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
