import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // exchange user google to backend jsonwebtoken
    async signIn({ user, account }) {
      if (account.provider !== "google") return false;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
              googleId: account.providerAccountId,
            }),
          },
        );

        if(!res.ok) return false;

        const data = await res.json();

        user.backendToken = data.token

        return true;
      } catch (error) {
        return false;
      }
      
    },

    // store backend jwt to the nextauth jwt
    async jwt({token, user}){
      if (user?.backendToken){
        token.backendToken = user.backendToken
      }
      return token
    },


    // Give backend jwt to the session
    async session({session, token}){
      session.backendToken = token.backendToken
      return session
    }
  },
});

export { handler as GET, handler as POST };
