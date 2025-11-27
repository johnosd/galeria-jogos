import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

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

    if (req.method === 'GET') {
      const grupos = await db.collection('grupos').find({}).toArray();
      res.status(200).json(grupos);
    } else if (req.method === 'POST') {
      const {
        nome,
        capa,
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

      if (!nome || !capa || preco === undefined || !Number.isFinite(precoNumero)) {
        return res.status(400).json({ error: 'Nome, capa e preco validos sao obrigatorios' });
      }

      const novoGrupo = {
        nome,
        capa,
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
      };

      const resultado = await db.collection('grupos').insertOne(novoGrupo);
      res.status(201).json({ _id: resultado.insertedId, ...novoGrupo });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Metodo ${req.method} nao permitido`);
    }
  } catch (error) {
    console.error('Erro na API /api/grupos:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
