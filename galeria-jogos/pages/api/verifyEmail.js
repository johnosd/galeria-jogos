// pages/api/verifyEmail.js
import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { email, codigo } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({ message: "E-mail e código são obrigatórios." });
  }

  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.MONGODB_DB);

    // Busca o código de verificação mais recente
    const record = await db
      .collection("verificationCodes")
      .findOne({ email }, { sort: { expirationTime: -1 } });

    if (!record) {
      await client.close();
      return res.status(400).json({ message: "Código não encontrado." });
    }

    const now = Date.now();

    if (record.codigo !== codigo) {
      await client.close();
      return res.status(400).json({ message: "Código incorreto." });
    }

    if (now > record.expirationTime) {
      await client.close();
      return res.status(400).json({ message: "Código expirado." });
    }

    // Atualiza a conta como validada
    await db.collection("users").updateOne(
      { email },
      { $set: { contaValidada: true } }
    );

    // Remove o código utilizado
    await db.collection("verificationCodes").deleteMany({ email });

    await client.close();
    return res.status(200).json({ message: "Conta validada com sucesso." });
  } catch (error) {
    console.error("Erro ao validar e-mail:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}
