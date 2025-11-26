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

    if (req.method === 'GET') {
      const grupos = await db.collection('grupos').find({}).toArray();
      res.status(200).json(grupos);
    } else if (req.method === 'POST') {
      const { nome, capa, preco, descricao = '', capacidadeTotal, membrosAtivos, pedidosSaida } = req.body;
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
