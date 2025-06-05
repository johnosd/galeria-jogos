// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoClient } from "mongodb";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;

        const client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db(process.env.MONGODB_DB);
        const usuario = await db.collection("users").findOne({ email: user.email });

        if (usuario) {
          token.id = usuario._id;
          token.contaValidada = usuario.contaValidada || false;
        } else {
          token.newUser = true;
          token.contaValidada = false;
        }

        await client.close();
      }
      return token;
    },

    async session({ session, token }) {
      const client = await MongoClient.connect(process.env.MONGODB_URI);
      const db = client.db(process.env.MONGODB_DB);

      const usuario = await db.collection("users").findOne({ email: token.email });

      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.image;
      session.user.newUser = token.newUser || false;
      session.user.contaValidada = usuario?.contaValidada || false;

      await client.close();
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.JWT_SECRET,
};

export default NextAuth(authOptions);
