// pages/api/cadastro.js
import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metodo nao permitido." });
  }

  const { nome, sobrenome, email, image, telefone = "", username } = req.body || {};

  const nomeLimpo = (nome || "").trim();
  const sobrenomeLimpo = (sobrenome || "").trim();
  const emailLimpo = (email || "").trim().toLowerCase();
  const usernameLimpo = (username || "").trim().toLowerCase();
  const telefoneLimpo = String(telefone || "").replace(/\D/g, "");

  if (!nomeLimpo || !sobrenomeLimpo || !emailLimpo || !usernameLimpo) {
    return res.status(400).json({ message: "Nome, sobrenome, email e usuario sao obrigatorios." });
  }

  if (!/^[a-z0-9_.-]{3,20}$/i.test(usernameLimpo)) {
    return res.status(400).json({ message: "Usuario deve ter 3-20 caracteres (letras, numeros, . _ -)." });
  }

  if (telefoneLimpo && telefoneLimpo.length < 10) {
    return res.status(400).json({ message: "Telefone invalido. Informe DDD + numero." });
  }

  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.MONGODB_DB);

    const existingUser = await db.collection("users").findOne({ email: emailLimpo });
    if (existingUser) {
      client.close();
      return res.status(409).json({ message: "Usuario ja existe." });
    }

    const existingUsername = await db.collection("users").findOne({ username: usernameLimpo });
    if (existingUsername) {
      client.close();
      return res.status(409).json({ message: "Nome de usuario ja esta em uso." });
    }

    await db.collection("users").insertOne({
      nome: nomeLimpo,
      sobrenome: sobrenomeLimpo,
      email: emailLimpo,
      image,
      telefone: telefoneLimpo,
      username: usernameLimpo,
      contaValidada: false,
      createdAt: new Date(),
    });

    client.close();
    return res.status(201).json({ message: "Usuario cadastrado com sucesso!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao cadastrar usuario. Tente novamente." });
  }
}
