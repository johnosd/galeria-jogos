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

  const parseLista = (valor) => {
    if (Array.isArray(valor)) return valor.filter(Boolean).map((item) => (typeof item === 'string' ? item.trim() : item));
    if (typeof valor === 'string') {
      return valor
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  };

  const parseFaq = (valor) => {
    if (Array.isArray(valor)) {
      return valor
        .map((item) => {
          if (!item) return null;
          if (typeof item === 'object' && item.pergunta && item.resposta) return { pergunta: String(item.pergunta), resposta: String(item.resposta) };
          if (typeof item === 'string') {
            const [pergunta, resposta] = item.split('|').map((s) => s?.trim());
            if (pergunta && resposta) return { pergunta, resposta };
          }
          return null;
        })
        .filter(Boolean);
    }

    if (typeof valor === 'string') {
      return valor
        .split(/\r?\n/)
        .map((linha) => {
          const [pergunta, resposta] = linha.split('|').map((s) => s?.trim());
          if (pergunta && resposta) return { pergunta, resposta };
          return null;
        })
        .filter(Boolean);
    }

    return [];
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
    const {
      nome,
      capa,
      imageUrl = '',
      imageKey = '',
      preco,
      descricao = '',
      subtitulo = '',
      acesso = '',
      tempoEntrega = '',
      confiabilidade = '',
      capacidadeTotal,
      membrosAtivos,
      pedidosSaida,
      beneficios,
      fidelidade,
      regras,
      faq,
      linkOficial = '',
      adminNome = '',
      adminAvatar = '',
      adminSelos,
      participantes,
    } = req.body;
    const precoNumero = Number(preco);
    const capacidadeNumero = parseNumero(capacidadeTotal);
    const membrosNumero = parseNumero(membrosAtivos);
    const pedidosNumero = parseNumero(pedidosSaida);

    if (!nome || preco === undefined || !Number.isFinite(precoNumero)) {
      return res.status(400).json({ error: 'Nome e preco validos sao obrigatorios' });
    }

    const imagemFinal = imageUrl || capa || '';

    try {
      const resultado = await db.collection('grupos').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            nome,
            capa: imagemFinal,
            imageUrl: imageUrl || imagemFinal,
            imageKey,
            preco: precoNumero,
            descricao,
            capacidadeTotal: capacidadeNumero,
            membrosAtivos: membrosNumero,
            pedidosSaida: pedidosNumero,
            subtitulo,
            acesso,
            tempoEntrega,
            confiabilidade,
            beneficios: parseLista(beneficios),
            fidelidade: parseLista(fidelidade),
            regras: parseLista(regras),
            faq: parseFaq(faq),
            linkOficial,
            admin: {
              nome: adminNome,
              avatar: adminAvatar,
              selos: parseLista(adminSelos),
            },
            participantes: parseLista(participantes),
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
