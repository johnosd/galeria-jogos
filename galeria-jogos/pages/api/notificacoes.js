import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Metodo nao permitido" });
  }

  const { userId, lido } = req.query;
  if (!userId || !ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "userId invalido" });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const filtro = { userId: new ObjectId(userId) };
    if (lido !== undefined) {
      filtro.lido = lido === "true";
    }
    const notificacoes = await db
      .collection("notificacoesUsuario")
      .find(filtro)
      .sort({ data: -1 })
      .limit(20)
      .toArray();
    return res.status(200).json(notificacoes);
  } catch (error) {
    console.error("Erro ao listar notificacoes:", error);
    return res.status(500).json({ message: "Erro ao listar notificacoes" });
  }
}
