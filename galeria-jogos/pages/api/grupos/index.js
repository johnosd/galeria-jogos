import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

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

const parseFidelidade = (body = {}) => {
  const { fidelidadePeriodo, fidelidadeRenovacao, fidelidadeObservacoes, fidelidadeProximaRenovacao } = body;
  const periodoMatch = String(fidelidadePeriodo || '').match(/\d+/);
  const periodoMeses = periodoMatch ? Number(periodoMatch[0]) : null;
  const renovacaoAutomatica = fidelidadeRenovacao !== undefined ? Boolean(fidelidadeRenovacao) : true;
  const observacoes = (fidelidadeObservacoes || '').trim();
  const proxima = fidelidadeProximaRenovacao ? new Date(fidelidadeProximaRenovacao) : null;
  const proximaRenovacao = proxima && !Number.isNaN(proxima.getTime()) ? proxima : null;
  return { periodoMeses, renovacaoAutomatica, observacoes, proximaRenovacao };
};

const parseObjectIds = (valor) => {
  if (!Array.isArray(valor)) return [];
  return valor
    .map((v) => {
      if (typeof v === 'string' && ObjectId.isValid(v)) return new ObjectId(v);
      if (v?._id && ObjectId.isValid(v._id)) return new ObjectId(v._id);
      return null;
    })
    .filter(Boolean);
};

const normalizarPreco = (valor) => {
  if (valor === undefined || valor === null) return NaN;
  const str = String(valor).replace(',', '.').trim();
  const num = Number(str);
  return Number.isFinite(num) ? num : NaN;
};

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    if (req.method === 'GET') {
      const grupos = await db.collection('grupos').find({}).toArray();
      return res.status(200).json(grupos);
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Metodo ${req.method} nao permitido`);
    }

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
      fidelidadePeriodo,
      fidelidadeRenovacao,
      fidelidadeObservacoes,
      regras,
      faq,
      linkOficial = '',
      adminId: adminIdBody = '',
      adminEmail = '',
      adminNome = '',
      adminAvatar = '',
      participantesIds = [],
      status = 'ativo',
    } = req.body || {};

    const precoNumero = normalizarPreco(preco);
    const capacidadeNumero = parseNumero(capacidadeTotal);
    const membrosNumero = Math.max(1, parseNumero(membrosAtivos, 1));
    const pedidosNumero = parseNumero(pedidosSaida);
    const adminId = typeof adminIdBody === 'string' && ObjectId.isValid(adminIdBody) ? new ObjectId(adminIdBody) : null;
    const adminIdString = typeof adminIdBody === 'string' ? adminIdBody : '';
    const participantesIdsParsed = parseObjectIds(participantesIds);

    if (!nome || preco === undefined || !Number.isFinite(precoNumero)) {
      return res.status(400).json({ error: 'Nome e preco validos sao obrigatorios' });
    }

    const imagemFinal = imageUrl || capa || '';

    const novoGrupo = {
      nome,
      slug: slugify(nome),
      capa: imagemFinal,
      imageUrl: imageUrl || imagemFinal,
      imageKey,
      preco: precoNumero,
      precoCentavos: Math.round(precoNumero * 100),
      descricao,
      capacidadeTotal: capacidadeNumero,
      membrosAtivos: membrosNumero,
      pedidosSaida: pedidosNumero,
      subtitulo,
      acesso,
      tempoEntrega,
      confiabilidade,
      beneficios: parseLista(beneficios),
      fidelidade: parseFidelidade({ fidelidadePeriodo, fidelidadeRenovacao, fidelidadeObservacoes }),
      regras: parseLista(regras),
      faq: parseFaq(faq),
      linkOficial: linkOficial?.trim() || null,
      adminId,
      adminIdString,
      adminEmail,
      adminNome,
      adminAvatar,
      participantesIds: participantesIdsParsed,
      status: status || 'ativo',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const resultado = await db.collection('grupos').insertOne(novoGrupo);
    return res.status(201).json({ _id: resultado.insertedId, ...novoGrupo });
  } catch (error) {
    console.error('Erro na API /api/grupos:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
