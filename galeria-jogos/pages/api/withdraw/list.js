import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getDb } from '../../../lib/mongodb';
import { getSessionUserId } from '../../../lib/wallet';

const isAdmin = (session) => {
  const allowed = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length === 0) return true;
  const email = (session?.user?.email || '').toLowerCase();
  return allowed.includes(email);
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Metodo nao permitido' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const adminId = getSessionUserId(session);
    if (!session || !adminId) {
      return res.status(401).json({ error: 'Nao autenticado' });
    }
    if (!isAdmin(session)) {
      return res.status(403).json({ error: 'Apenas administradores podem listar saques' });
    }

    const db = await getDb();
    const items = await db
      .collection('withdrawals')
      .find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    return res.status(200).json(items);
  } catch (error) {
    console.error('Erro ao listar saques:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
