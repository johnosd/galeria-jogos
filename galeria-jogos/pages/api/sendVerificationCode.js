import nodemailer from "nodemailer";
import crypto from "crypto";
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metodo nao permitido" });
  }

  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ message: "E-mail e obrigatorio." });
  }

  try {
    const codigo = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 chars
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
    const createdAt = new Date();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        // evita falha em ambientes com certificado self-signed
        rejectUnauthorized: false,
      },
    });

    await transporter.verify();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Codigo de verificacao",
      text: `Seu codigo de verificacao: ${codigo}`,
    });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    await db.collection("verificationCodes").insertOne({
      email,
      codigo,
      tipo: "validacao_cadastro",
      status: "pendente",
      tentativas: 0,
      expiresAt,
      createdAt,
      usedAt: null,
      ipOrigem: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || null,
      userAgent: req.headers["user-agent"] || null,
    });

    return res.status(200).json({ message: "Codigo enviado com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar o codigo:", error);
    return res.status(500).json({ message: "Erro ao enviar o codigo." });
  }
}
