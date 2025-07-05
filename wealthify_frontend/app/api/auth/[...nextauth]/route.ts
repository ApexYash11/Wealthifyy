import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Optionally, send user info to FastAPI backend here
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // Optionally, add custom JWT logic here
      return token;
    },
    async session({ session, token, user }) {
      // Optionally, add custom session logic here
      return session;
    },
  },
});

export { handler as GET, handler as POST }; 