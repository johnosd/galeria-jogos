import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Metodo nao permitido' });
  }

  const { id } = req.query;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID invalido' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const grupo = await db.collection('grupos').findOne({ _id: new ObjectId(id) });
    if (!grupo) {
      return res.status(404).json({ error: 'Grupo nao encontrado' });
    }

    const capacidadeBase = grupo.capacidadeTotal ?? grupo.membrosAtivos ?? 0;
    const capacidadeNum = Number(capacidadeBase);
    const capacidade = Number.isFinite(capacidadeNum) && capacidadeNum > 0 ? capacidadeNum : Infinity;
    const membrosAtivos = Number(grupo.membrosAtivos ?? 0);

    if (membrosAtivos >= capacidade) {
      return res.status(400).json({ error: 'Grupo completo' });
    }

    const { nomeParticipante, avatarParticipante, userId } = req.body || {};

    if (!userId) {
      return res.status(400).json({ error: 'userId obrigatorio' });
    }

    const jaMembro =
      Array.isArray(grupo.participantes) &&
      grupo.participantes.some((p) => {
        if (typeof p === 'object' && p?.userId) return p.userId === userId;
        return false;
      });

    if (jaMembro) {
      return res.status(200).json({ message: 'Usuario ja e membro', grupo });
    }
    const participante =
      nomeParticipante || avatarParticipante
        ? {
            nome: nomeParticipante || 'Novo membro',
            avatar: avatarParticipante || '',
            userId,
          }
        : null;

    const update = {
      $inc: { membrosAtivos: 1 },
    };

    if (participante) {
      update.$push = { participantes: participante };
    }

    const resultado = await db.collection('grupos').findOneAndUpdate(
      { _id: new ObjectId(id) },
      update,
      { returnDocument: 'after' }
    );

    res.status(200).json({ message: 'Membro adicionado', grupo: resultado.value });
  } catch (error) {
    console.error('Erro ao adicionar membro:', error);
    res.status(500).json({ error: 'Erro ao adicionar membro' });
  }
}
