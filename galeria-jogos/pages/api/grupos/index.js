import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    if (req.method === 'GET') {
      const grupos = await db.collection('grupos').find({}).toArray();
      res.status(200).json(grupos);
    } else if (req.method === 'POST') {
      const { nome, capa, preco } = req.body;
      if (!nome || !capa || preco === undefined) {
        return res.status(400).json({ error: 'Nome, capa e preco sao obrigatorios' });
      }
      const resultado = await db.collection('grupos').insertOne({ nome, capa, preco });
      res.status(201).json({ _id: resultado.insertedId, nome, capa, preco });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Metodo ${req.method} nao permitido`);
    }
  } catch (error) {
    console.error('Erro na API /api/grupos:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
