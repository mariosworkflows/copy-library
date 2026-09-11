import type { NextAuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const USERS_TABLE = "tblBiH6GFPPrMWP4m";

async function findUserByEmail(email: string) {
  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USERS_TABLE}`);
  url.searchParams.set("filterByFormula", `{Email}="${email.toLowerCase()}"`);
  url.searchParams.set("maxRecords", "1");
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
    cache: "no-store",
  });
  const data = await res.json();
  return data.records?.[0] ?? null;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const record = await findUserByEmail(credentials.email);
        if (!record) return null;
        const hash: string = record.fields.PasswordHash ?? "";
        const valid = await bcrypt.compare(credentials.password, hash);
        if (!valid) return null;
        return {
          id: record.id,
          name: record.fields.Name,
          email: record.fields.Email,
          role: record.fields.Role ?? "user",
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Fresh login — role comes from authorize()
        token.role = (user as { role?: string }).role ?? "user";
        token.id = user.id;
      } else if (token.email) {
        // Token refresh — re-fetch role from Airtable so changes take effect without re-login
        const record = await findUserByEmail(token.email as string);
        if (record) token.role = (record.fields.Role as string) ?? "user";
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as { role?: string; id?: string }).role = (token.role as string) ?? "user";
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};
