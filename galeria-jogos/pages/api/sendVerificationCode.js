import nodemailer from "nodemailer";
import crypto from "crypto";
import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "E-mail é obrigatório" });
  }

  try {
    console.log("Recebido e-mail para envio do código:", email);

    // Gerar código de verificação
    const codigo = crypto.randomBytes(3).toString("hex");
    const expirationTime = Date.now() + 60000; // 1 minuto

    console.log("Código gerado:", codigo);

    // Configuração do Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // ⚠️ Apenas para desenvolvimento
      },
    });

    // Verificar transporte
    await transporter.verify();

    // Enviar o e-mail
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Código de Verificação",
      text: `Seu código de verificação é: ${codigo}`,
    });

    console.log("E-mail enviado:", info.messageId);

    // Salvar no banco
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.MONGODB_DB);

    await db.collection("verificationCodes").insertOne({
      email,
      codigo,
      expirationTime,
    });

    client.close();

    return res.status(200).json({ message: "Código enviado com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar o código:", error);
    return res.status(500).json({ message: "Erro ao enviar o código." });
  }
}
