import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

const parseObjectId = (valor) => {
  if (typeof valor === 'string' && ObjectId.isValid(valor)) return new ObjectId(valor);
  return null;
};

const parseNumero = (valor, padrao = NaN) => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : padrao;
};

export default async function handler(req, res) {
  const { id } = req.query;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID invalido' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const grupoId = new ObjectId(id);
    const membrosCollection = db.collection('membrosGrupo');

    if (req.method === 'GET') {
      const userIdParam = Array.isArray(req.query.userId) ? req.query.userId[0] : req.query.userId;
      const userObjectId = parseObjectId(userIdParam);

      if (!userObjectId) {
        return res.status(400).json({ error: 'userId obrigatorio e deve ser um ObjectId valido' });
      }

      const membro = await membrosCollection.findOne({
        grupoId,
        userId: userObjectId,
        status: { $ne: 'banido' },
      });

      return res.status(200).json({
        isMembro: Boolean(membro),
        status: membro?.status || null,
        papel: membro?.papel || null,
      });
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Metodo nao permitido' });
    }

    const grupo = await db
      .collection('grupos')
      .findOne(
        { _id: grupoId },
        { projection: { capacidadeTotal: 1, vagasReservadasAdmin: 1, acesso: 1, status: 1, statusDetalhado: 1, nome: 1 } }
      );

    if (!grupo) {
      return res.status(404).json({ error: 'Grupo nao encontrado' });
    }

    const { userId } = req.body || {};
    const userObjectId = parseObjectId(userId);

    if (!userObjectId) {
      return res.status(400).json({ error: 'userId obrigatorio e deve ser um ObjectId valido' });
    }

    const membros = await membrosCollection.find({ grupoId, status: { $ne: 'banido' } }).toArray();

    const jaMembro = membros.find((m) => m.userId && m.userId.equals(userObjectId));
    if (jaMembro) {
      return res.status(200).json({ message: 'Usuario ja e membro', membro: jaMembro });
    }

    const capacidadeNum = parseNumero(grupo.capacidadeTotal, NaN);
    const capacidade = Number.isFinite(capacidadeNum) && capacidadeNum > 0 ? capacidadeNum : Infinity;
    if (capacidade !== Infinity && membros.length >= capacidade) {
      return res.status(400).json({ error: 'Grupo completo' });
    }

    const agora = new Date();
    const novoMembro = {
      grupoId,
      userId: userObjectId,
      papel: 'membro',
      status: 'ativo',
      temCaucao: false,
      aguardandoEnvioAcesso: false,
      dataEntrada: agora,
      createdAt: agora,
    };

    let vagasDisponiveis = null;
    if (capacidade !== Infinity) {
      const reservadas = Math.max(parseNumero(grupo.vagasReservadasAdmin, 0), 0);
      const membrosNaoAdmin = membros.filter((m) => m.papel !== 'admin').length + 1; // inclui o novo membro
      vagasDisponiveis = Math.max(capacidade - reservadas - membrosNaoAdmin, 0);
    }

    try {
      const insertResult = await membrosCollection.insertOne(novoMembro);

      const totalMembros = membros.length + 1;
      const capacidadeNum = parseNumero(grupo.capacidadeTotal, NaN);
      const atingiuCapacidade = Number.isFinite(capacidadeNum) && capacidadeNum > 0 && totalMembros >= capacidadeNum;

      const updateGrupo = { $set: { updatedAt: agora } };
      if (grupo.acesso === 'apos_completar' && atingiuCapacidade) {
        updateGrupo.$set.statusDetalhado = 'ativo';
        updateGrupo.$set.status = 'ativo';
      }

      await db.collection('grupos').updateOne({ _id: grupoId }, updateGrupo);

      if (grupo.acesso === 'apos_completar' && atingiuCapacidade) {
        const adminMember = await membrosCollection.findOne({ grupoId, papel: 'admin' });
        const adminId = adminMember?.userId;
        if (adminId) {
          await db.collection('notificacoesUsuario').insertOne({
            userId: adminId,
            titulo: 'Grupo formado',
            mensagem: `O grupo ${grupo.nome || ''} atingiu a capacidade e esta pronto para liberar acesso aos membros.`,
            tipo: 'grupo',
            acao: `/admin/grupos/${id}`,
            lido: false,
            data: agora,
            importante: true,
          });
        }
      }

      return res.status(200).json({ message: 'Membro adicionado', membroId: insertResult.insertedId, status: novoMembro.status });
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(200).json({ message: 'Usuario ja e membro' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Erro ao adicionar membro:', error);
    res.status(500).json({ error: 'Erro ao adicionar membro' });
  }
}
