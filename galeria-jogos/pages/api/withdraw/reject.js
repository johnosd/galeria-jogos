import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getDb } from '../../../lib/mongodb';
import { calculateBalances, getSessionUserId } from '../../../lib/wallet';

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
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Metodo nao permitido' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const adminId = getSessionUserId(session);
    if (!session || !adminId) {
      return res.status(401).json({ error: 'Nao autenticado' });
    }
    if (!isAdmin(session)) {
      return res.status(403).json({ error: 'Apenas administradores podem rejeitar saques' });
    }

    const withdrawalId = String(req.body?.withdrawalId || '').trim();
    if (!withdrawalId) {
      return res.status(400).json({ error: 'withdrawalId obrigatorio' });
    }

    const db = await getDb();
    const withdrawal = await db.collection('withdrawals').findOne({ _id: withdrawalId });
    if (!withdrawal) {
      return res.status(404).json({ error: 'Saque nao encontrado' });
    }
    if (['paid', 'rejected'].includes(withdrawal.status)) {
      return res.status(400).json({ error: 'Saque ja finalizado' });
    }

    const ledger = await db
      .collection('walletTransactions')
      .findOne({ referenceId: withdrawalId, walletId: withdrawal.walletId, source: 'saque' });
    if (!ledger) {
      return res.status(404).json({ error: 'Lancamento do saque nao encontrado' });
    }

    const ledgerUpdated = await db.collection('walletTransactions').findOneAndUpdate(
      { _id: ledger._id, status: { $in: ['blocked', 'pending'] } },
      { $set: { status: 'cancelled' } },
      { returnDocument: 'after' }
    );

    if (!ledgerUpdated.value && ledger.status !== 'cancelled') {
      return res.status(400).json({ error: 'Nao foi possivel cancelar o lancamento' });
    }

    const withdrawalUpdate = await db.collection('withdrawals').findOneAndUpdate(
      { _id: withdrawalId },
      { $set: { status: 'rejected', adminId } },
      { returnDocument: 'after' }
    );

    const balances = await calculateBalances(withdrawal.walletId);
    return res.status(200).json({
      withdrawalId,
      status: withdrawalUpdate.value?.status || 'rejected',
      walletId: withdrawal.walletId,
      ledgerId: ledger._id,
      balance: balances.balance,
      available: balances.available,
    });
  } catch (error) {
    console.error('Erro ao rejeitar saque:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
