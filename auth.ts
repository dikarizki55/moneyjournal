import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import Google from "next-auth/providers/google";
import Credential from "next-auth/providers/credentials";
import { verifyPassword } from "./lib/scrypt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true, // penting
  providers: [
    Google,
    Credential({
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email@email.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email as string },
        });

        if (!user) {
          throw new Error("No user found");
        }

        const isValid = await verifyPassword(
          credentials.password as string,
          user.password as string
        );

        if (!isValid) {
          throw new Error("Error Auth");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      // token => JWT payload
      if (user) {
        token.id = user.id; // inject user.id ke JWT payload
      }
      return token;
    },
    async session({ session, token }) {
      // session => session.user
      // token => JWT payload
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
