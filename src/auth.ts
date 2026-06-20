import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db"; // <-- Using Absolute Alias
import { accounts, sessions, users, verificationTokens } from "@/db/schema"; // <-- Using Absolute Alias

export const { handlers, signIn, signOut, auth } = NextAuth({
  // We connect Auth.js directly to our Supabase database using Drizzle
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      
      /* 
       * TIER-1 FEATURE: The Domain Lock.
       * Uncomment this later to ban anyone who isn't a student!
       */
      // profile(profile) {
      //   if (!profile.email.endsWith("@iert.ac.in")) {
      //     throw new Error("Unauthorized: Only IERT students can access the OS.");
      //   }
      //   return { 
      //     id: profile.sub, 
      //     name: profile.name, 
      //     email: profile.email, 
      //     image: profile.picture 
      //   };
      // }
    }),
  ],
  session: {
    strategy: "database", // Store sessions securely in Postgres, not in JWTs
  },
});