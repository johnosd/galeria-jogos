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
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const { id } = req.query;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID invalido' });
  }

  if (req.method === 'GET') {
    try {
      const grupo = await db.collection('grupos').findOne({ _id: new ObjectId(id) });
      if (!grupo) return res.status(404).json({ error: 'Grupo nao encontrado' });
      return res.status(200).json(grupo);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar grupo' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const resultado = await db.collection('grupos').deleteOne({ _id: new ObjectId(id) });
      if (resultado.deletedCount === 0) return res.status(404).json({ error: 'Grupo nao encontrado' });

      // Remove participantes associados ao grupo
      await db.collection('membrosGrupo').deleteMany({ grupoId: new ObjectId(id) });

      return res.status(200).json({ message: 'Grupo excluido com sucesso' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir grupo' });
    }
  }

  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
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
    tipoGrupo = 'publico',
    status = 'ativo',
    statusDetalhado = 'em_formacao',
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
  if (!adminId) {
    return res.status(400).json({ error: 'Administrador e obrigatorio para atualizar o grupo' });
  }

  const imagemFinal = imageUrl || capa || '';
  const vagasDisponiveisNumero =
    typeof vagasDisponiveis === 'number'
      ? Math.trunc(parseNumero(vagasDisponiveis))
      : Math.max(capacidadeNumero - vagasReservadasNumero, 0);

  try {
    const resultado = await db.collection('grupos').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
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
          subtitulo,
          acesso,
          tempoEntrega,
          confiabilidade,
          tipoGrupo,
          status,
          statusDetalhado,
          servicoPreAssinado: Boolean(servicoPreAssinado),
          envioAutomaticoAcesso: Boolean(envioAutomaticoAcesso),
          filaEsperaAtiva: Boolean(filaEsperaAtiva),
          necessitaAnalise: Boolean(necessitaAnalise),
          observacoesInternas: observacoesInternas || '',
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
          updatedAt: new Date(),
        },
      }
    );

    if (resultado.matchedCount === 0) {
      return res.status(404).json({ error: 'Grupo nao encontrado' });
    }

    return res.status(200).json({ message: 'Grupo atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar grupo:', error?.errInfo || error);
    if (error?.code === 121) {
      return res.status(400).json({ error: 'Validacao do documento falhou', details: error.errInfo || null });
    }
    return res.status(500).json({ error: 'Erro ao atualizar grupo' });
  }
}
