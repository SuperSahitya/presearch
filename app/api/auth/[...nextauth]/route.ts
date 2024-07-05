import nextAuth from "next-auth";
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
};

const handler = nextAuth(authOptions);

export { handler as GET, handler as POST };
