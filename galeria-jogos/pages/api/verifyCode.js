// pages/api/verifyCode.js
import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metodo nao permitido" });
  }

  const { email, codigo } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({ message: "Email e codigo sao obrigatorios" });
  }

  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.MONGODB_DB);

    // Buscar o codigo mais recente
    const registro = await db
      .collection("verificationCodes")
      .findOne({ email }, { sort: { expirationTime: -1 } });

    if (!registro) {
      client.close();
      return res.status(400).json({ message: "Codigo nao encontrado" });
    }

    // Verificar validade do codigo
    if (Date.now() > registro.expirationTime) {
      client.close();
      return res.status(400).json({ message: "Codigo expirado" });
    }

    if (registro.codigo !== codigo) {
      client.close();
      return res.status(400).json({ message: "Codigo incorreto" });
    }

    // Marcar usuario como verificado
    await db.collection("users").updateOne({ email }, { $set: { verificado: true } });

    client.close();
    return res.status(200).json({ message: "E-mail verificado com sucesso!" });
  } catch (error) {
    console.error("Erro na verificacao:", error);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
}
