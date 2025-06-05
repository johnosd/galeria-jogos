import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    if (req.method === 'GET') {
      const jogos = await db.collection('jogos').find({}).toArray();
      res.status(200).json(jogos);
    } else if (req.method === 'POST') {
      const { nome, capa, preco } = req.body;
      if (!nome || !capa || preco === undefined) {
        return res.status(400).json({ error: 'Nome, capa e preço são obrigatórios' });
      }
      const resultado = await db.collection('jogos').insertOne({ nome, capa, preco });
      res.status(201).json({ _id: resultado.insertedId, nome, capa, preco });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Método ${req.method} não permitido`);
    }
  } catch (error) {
    console.error('Erro na API /api/jogos:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
