// pages/api/atualizarPerfil.js
import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { email, nome, sobrenome, imagem, telefone, username } = req.body;

  if (!email || !username) {
    return res.status(400).json({ message: "E-mail e nome de usuário são obrigatórios." });
  }

  const usernameLimpo = username.trim().replace(/\s/g, "");

  let client;
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.MONGODB_DB);

    const usuarioComMesmoUsername = await db.collection("users").findOne({
      username: usernameLimpo,
      email: { $ne: email },
    });

    if (usuarioComMesmoUsername) {
      return res.status(400).json({ message: "Nome de usuário já está em uso por outro usuário." });
    }

    await db.collection("users").updateOne(
      { email },
      {
        $set: {
          nome,
          sobrenome,
          image: imagem,
          telefone,
          username: usernameLimpo,
        },
      }
    );

    return res.status(200).json({ message: "Perfil atualizado com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  } finally {
    if (client) await client.close();
  }
}
