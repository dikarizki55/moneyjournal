import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import bcrypt from "bcryptjs";
import { SupabaseAdapter } from "@auth/supabase-adapter";

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("no credentials");
        }

        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("email", credentials.email)
          .single();

        if (error || !user) throw new Error("user not found");

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashed_password
        );

        if (!isValid) throw new Error("invalid password");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET!,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
