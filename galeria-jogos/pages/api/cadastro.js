// pages/api/cadastro.js
import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { nome, sobrenome, email, image, telefone, username } = req.body;

    if (!nome || !sobrenome || !email || !username) {
      return res.status(400).json({ message: "Nome, sobrenome, e-mail e nome de usuário são obrigatórios." });
    }

    try {
      const client = await MongoClient.connect(process.env.MONGODB_URI);
      const db = client.db(process.env.MONGODB_DB);

      const existingUser = await db.collection("users").findOne({ email });
      if (existingUser) {
        client.close();
        return res.status(400).json({ message: "Usuário já existe." });
      }

      const existingUsername = await db.collection("users").findOne({ username });
      if (existingUsername) {
        client.close();
        return res.status(400).json({ message: "Nome de usuário já está em uso." });
      }

      await db.collection("users").insertOne({
        nome,
        sobrenome,
        email,
        image,
        telefone,
        username,
        contaValidada: false,
        createdAt: new Date(),
      });

      client.close();
      return res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao cadastrar usuário. Tente novamente." });
    }
  } else {
    res.status(405).json({ message: "Método não permitido." });
  }
}
