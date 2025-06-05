import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido." });
  }

  const { email, nome, sobrenome, imagem } = req.body;

  if (!email || !nome || !sobrenome) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios." });
  }

  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.MONGODB_DB);

    const result = await db.collection("users").updateOne(
      { email },
      {
        $set: {
          nome,
          sobrenome,
          image: imagem,
        },
      }
    );

    client.close();

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Usuário não encontrado ou dados iguais." });
    }

    return res.status(200).json({ message: "Perfil atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return res.status(500).json({ message: "Erro ao atualizar perfil." });
  }
}
