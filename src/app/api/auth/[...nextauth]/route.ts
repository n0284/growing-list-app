import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";
import type { User, Session } from "next-auth";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        console.log("jwt callback - user.id:", user.id);
        token.id = user.id; // ここで JWT に user.id を入れる
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      console.log("session callback - token.id:", token.id);
      if (token && session.user) {
        session.user.id = token.id as string; // JWT から session.user.id を復元
      }
      console.log(token);
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
