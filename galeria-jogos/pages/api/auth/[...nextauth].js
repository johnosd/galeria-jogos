// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "../../../lib/mongodb";

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

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const usuario = await db.collection("users").findOne({ email: user.email });

        if (usuario) {
          token.id = usuario._id;
          token.contaValidada = usuario.contaValidada || false;
          token.sobrenome = usuario.sobrenome || "";
          token.telefone = usuario.telefone || "";
          token.username = usuario.username || "";

          // Cria notificacao de validacao se estiver pendente
          if (!usuario.contaValidada) {
            const jaNotificado = await db.collection("notificacoesUsuario").findOne({
              userId: usuario._id,
              acao: "validar_conta",
              lido: { $in: [false, null] },
            });
            if (!jaNotificado) {
              await db.collection("notificacoesUsuario").insertOne({
                userId: usuario._id,
                titulo: "Confirme seu e-mail",
                mensagem: "Sua conta ainda não está validada. Clique para finalizar a verificação.",
                tipo: "sistema",
                acao: "validar_conta",
                lido: false,
                importante: true,
                data: new Date(),
                dataLido: null,
                expiraEm: null,
              });
            }
          }
        } else {
          token.newUser = true;
          token.contaValidada = false;
        }
      }
      return token;
    },

    async session({ session, token }) {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB);
      const usuario = await db.collection("users").findOne({ email: token.email });

      session.user.id = usuario?._id || token.id;
      session.user.name = usuario?.nome || token.name;
      session.user.email = usuario?.email || token.email;
      session.user.image = usuario?.image || token.image;
      session.user.sobrenome = usuario?.sobrenome || "";
      session.user.telefone = usuario?.telefone || "";
      session.user.username = usuario?.username || "";
      session.user.newUser = token.newUser || false;
      session.user.contaValidada = usuario?.contaValidada || false;

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
