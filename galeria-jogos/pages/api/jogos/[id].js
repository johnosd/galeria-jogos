// pages/api/jogos/[id].js

import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const { id } = req.query;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  if (req.method === 'GET') {
    // Buscar um jogo pelo ID
    try {
      const jogo = await db.collection('jogos').findOne({ _id: new ObjectId(id) });
      if (!jogo) {
        return res.status(404).json({ error: 'Jogo não encontrado' });
      }
      res.status(200).json(jogo);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar jogo' });
    }
  } else if (req.method === 'PUT') {
    // Atualizar um jogo
    const { nome, capa, preco } = req.body;
    if (!nome || !capa || preco === undefined) {
      return res.status(400).json({ error: 'Nome, capa e preço são obrigatórios' });
    }

    try {
      const resultado = await db.collection('jogos').updateOne(
        { _id: new ObjectId(id) },
        { $set: { nome, capa, preco: parseFloat(preco) } }
      );

      if (resultado.matchedCount === 0) {
        return res.status(404).json({ error: 'Jogo não encontrado' });
      }

      res.status(200).json({ message: 'Jogo atualizado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar jogo' });
    }
  } else if (req.method === 'DELETE') {
    // Excluir um jogo
    try {
      const resultado = await db.collection('jogos').deleteOne({ _id: new ObjectId(id) });
      if (resultado.deletedCount === 0) {
        return res.status(404).json({ error: 'Jogo não encontrado' });
      }
      res.status(200).json({ message: 'Jogo excluído com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir jogo' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}
