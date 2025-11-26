import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const { id } = req.query;

  const parseNumero = (valor, padrao = 0) => {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return padrao;
    return numero < 0 ? 0 : numero;
  };

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID invalido' });
  }

  if (req.method === 'GET') {
    try {
      const grupo = await db.collection('grupos').findOne({ _id: new ObjectId(id) });
      if (!grupo) {
        return res.status(404).json({ error: 'Grupo nao encontrado' });
      }
      res.status(200).json(grupo);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar grupo' });
    }
  } else if (req.method === 'PUT') {
    const { nome, capa, preco, descricao = '', capacidadeTotal, membrosAtivos, pedidosSaida } = req.body;
    const precoNumero = Number(preco);
    const capacidadeNumero = parseNumero(capacidadeTotal);
    const membrosNumero = parseNumero(membrosAtivos);
    const pedidosNumero = parseNumero(pedidosSaida);

    if (!nome || !capa || preco === undefined || !Number.isFinite(precoNumero)) {
      return res.status(400).json({ error: 'Nome, capa e preco validos sao obrigatorios' });
    }

    try {
      const resultado = await db.collection('grupos').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            nome,
            capa,
            preco: precoNumero,
            descricao,
            capacidadeTotal: capacidadeNumero,
            membrosAtivos: membrosNumero,
            pedidosSaida: pedidosNumero,
          },
        }
      );

      if (resultado.matchedCount === 0) {
        return res.status(404).json({ error: 'Grupo nao encontrado' });
      }

      res.status(200).json({ message: 'Grupo atualizado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar grupo' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const resultado = await db.collection('grupos').deleteOne({ _id: new ObjectId(id) });
      if (resultado.deletedCount === 0) {
        return res.status(404).json({ error: 'Grupo nao encontrado' });
      }
      res.status(200).json({ message: 'Grupo excluido com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir grupo' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Metodo ${req.method} nao permitido`);
  }
}
