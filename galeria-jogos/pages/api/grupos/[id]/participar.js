import { ObjectId } from 'mongodb';
import clientPromise from '../../../../lib/mongodb';

const parseObjectId = (value) => {
  if (typeof value === 'string' && ObjectId.isValid(value)) return new ObjectId(value);
  return null;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Metodo nao permitido' });
  }

  const { id } = req.query;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID do grupo invalido' });
  }

  const { userId, nome, avatar } = req.body || {};
  if (!userId && !nome) {
    return res.status(400).json({ error: 'userId ou nome sao obrigatorios' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const grupo = await db.collection('grupos').findOne({ _id: new ObjectId(id) });

    if (!grupo) {
      return res.status(404).json({ error: 'Grupo nao encontrado' });
    }

    const capacidade = Number(grupo.capacidadeTotal) || 0;
    const membrosAtivos = Number(grupo.membrosAtivos) || 0;
    if (capacidade && membrosAtivos >= capacidade) {
      return res.status(409).json({ error: 'Grupo sem vagas disponiveis' });
    }

    const userIdObj = parseObjectId(userId);
    const filter = { _id: new ObjectId(id) };
    if (userIdObj) {
      filter.participantesIds = { $ne: userIdObj };
    }

    const update = {
      $set: { updatedAt: new Date() },
    };

    const addToSet = {};
    if (userIdObj) addToSet.participantesIds = userIdObj;
    if (Object.keys(addToSet).length) {
      update.$addToSet = addToSet;
    }

    const push = {
      participantesHistorico: {
        userIdString: userId || '',
        nome: nome || 'Participante',
        avatar: avatar || '',
        dataAssinatura: new Date(),
      },
    };
    update.$push = push;

    update.$inc = { membrosAtivos: 1 };

    const resultado = await db.collection('grupos').updateOne(filter, update);

    if (resultado.matchedCount === 0) {
      return res.status(409).json({ error: 'Usuario ja e membro ou grupo indisponivel' });
    }

    return res.status(200).json({ message: 'Participante adicionado', membrosAtivos: membrosAtivos + 1 });
  } catch (error) {
    console.error('Erro ao adicionar participante:', error);
    return res.status(500).json({ error: 'Erro interno ao adicionar participante' });
  }
}
