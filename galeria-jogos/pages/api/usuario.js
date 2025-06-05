// pages/api/usuario.js
import { getSession } from "next-auth/react";
import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: "Não autorizado" });
  }

  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.MONGODB_DB);

    const usuario = await db
      .collection("users")
      .findOne({ email: session.user.email });

    client.close();

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}
