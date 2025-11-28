import clientPromise from '../../../lib/mongodb';
import { ObjectId, Int32, Double } from 'mongodb';

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
      valorTotal,
      valorPorVaga,
      descricao = '',
      subtitulo = '',
      acesso = 'imediato',
      tempoEntrega = '',
      confiabilidade = '',
      capacidadeTotal,
      vagasReservadasAdmin = 0,
      vagasDisponiveis,
      servicoPreAssinado = false,
      envioAutomaticoAcesso = false,
      filaEsperaAtiva = false,
      necessitaAnalise = false,
      observacoesInternas = '',
      status = 'ativo',
      statusDetalhado = 'em_formacao',
      tipoGrupo = 'publico',
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
    } = req.body || {};

    const valorTotalNumero = normalizarPreco(valorTotal);
    const valorPorVagaNumero = normalizarPreco(valorPorVaga);
    const capacidadeNumero = Math.trunc(parseNumero(capacidadeTotal));
    const vagasReservadasNumero = Math.trunc(parseNumero(vagasReservadasAdmin));
    const adminId = typeof adminIdBody === 'string' && ObjectId.isValid(adminIdBody) ? new ObjectId(adminIdBody) : null;
    const adminIdString = typeof adminIdBody === 'string' ? adminIdBody : '';
    const participantesIdsParsed = parseObjectIds(participantesIds);

    if (!nome) {
      return res.status(400).json({ error: 'Nome e obrigatorio' });
    }
    if (!Number.isFinite(valorTotalNumero) || !Number.isFinite(valorPorVagaNumero)) {
      return res.status(400).json({ error: 'Valor total e valor por vaga sao obrigatorios' });
    }
    if (!Number.isFinite(capacidadeNumero) || capacidadeNumero <= 0) {
      return res.status(400).json({ error: 'Capacidade total deve ser maior que zero' });
    }
    if (!Number.isFinite(vagasReservadasNumero) || vagasReservadasNumero < 0) {
      return res.status(400).json({ error: 'Vagas reservadas do admin deve ser zero ou mais' });
    }
    if (vagasReservadasNumero > capacidadeNumero) {
      return res.status(400).json({ error: 'Vagas reservadas nao podem exceder a capacidade' });
    }

    const imagemFinal = imageUrl || capa || '';
    const vagasDisponiveisNumero =
      typeof vagasDisponiveis === 'number'
        ? Math.trunc(parseNumero(vagasDisponiveis))
        : Math.max(capacidadeNumero - vagasReservadasNumero, 0);

    const novoGrupo = {
      nome,
      slug: slugify(nome),
      capa: imagemFinal,
      imageUrl: imageUrl || imagemFinal,
      imageKey,
      valorTotal: new Double(valorTotalNumero),
      valorPorVaga: new Double(valorPorVagaNumero),
      descricao,
      capacidadeTotal: new Int32(capacidadeNumero),
      vagasReservadasAdmin: new Int32(vagasReservadasNumero),
      vagasDisponiveis: new Int32(vagasDisponiveisNumero),
      servicoPreAssinado: Boolean(servicoPreAssinado),
      envioAutomaticoAcesso: Boolean(envioAutomaticoAcesso),
      filaEsperaAtiva: Boolean(filaEsperaAtiva),
      necessitaAnalise: Boolean(necessitaAnalise),
      observacoesInternas: observacoesInternas || '',
      subtitulo,
      acesso,
      tempoEntrega,
      confiabilidade,
      tipoGrupo,
      status,
      statusDetalhado,
      beneficios: parseLista(beneficios),
      fidelidade: parseFidelidade({ fidelidadePeriodo, fidelidadeRenovacao, fidelidadeObservacoes }),
      regras: parseLista(regras),
      faq: parseFaq(faq),
      linkOficial: (linkOficial || '').trim(),
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

    // Evita slug duplicado (retorna 409 ao inves de 500)
    const slugExistente = await db.collection('grupos').findOne({ slug: novoGrupo.slug });
    if (slugExistente) {
      return res.status(409).json({ error: 'Ja existe um grupo com este nome/slug' });
    }

    const resultado = await db.collection('grupos').insertOne(novoGrupo);

    // Insere o administrador como membro do grupo
    const fidelidadeAdmin = parseFidelidade({ fidelidadePeriodo, fidelidadeRenovacao, fidelidadeObservacoes });
    const fidelidadeMembro =
      fidelidadeAdmin && fidelidadeAdmin.periodoMeses
        ? {
            periodoMeses: new Int32(fidelidadeAdmin.periodoMeses),
            renovacaoAutomatica: Boolean(fidelidadeAdmin.renovacaoAutomatica),
            observacoes: fidelidadeAdmin.observacoes || '',
            proximaRenovacao: fidelidadeAdmin.proximaRenovacao || null,
          }
        : undefined;

    const membroAdmin = {
      grupoId: resultado.insertedId,
      userId: adminId,
      papel: 'admin',
      status: 'ativo',
      temCaucao: false,
      aguardandoEnvioAcesso: false,
      ...(fidelidadeMembro ? { fidelidade: fidelidadeMembro } : {}),
      dataEntrada: new Date(),
      createdAt: new Date(),
    };
    await db.collection('membrosGrupo').insertOne(membroAdmin);

    return res.status(201).json({ _id: resultado.insertedId, ...novoGrupo });
  } catch (error) {
    console.error('Erro na API /api/grupos:', error?.errInfo || error);
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'Slug ou chave duplicada no cadastro do grupo' });
    }
    if (!adminId) {
      return res.status(400).json({ error: 'Administrador e obrigatorio para criar o grupo' });
    }
    if (error?.code === 121) {
      const detalhes = error?.errInfo || null;
      console.error('Detalhes schema grupos:', JSON.stringify(detalhes, null, 2));
      return res.status(400).json({ error: 'Validacao do documento falhou', details: detalhes });
    }
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
