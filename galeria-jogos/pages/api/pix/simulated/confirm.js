import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { getDb, insertLedgerEntry } from '../../../../lib/mongodb';
import { calculateBalances, ensureWallet, getSessionUserId } from '../../../../lib/wallet';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Metodo nao permitido' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const userId = getSessionUserId(session);
    if (!session || !userId) {
      return res.status(401).json({ error: 'Nao autenticado' });
    }

    const paymentId = String(req.body?.paymentId || '').trim();
    if (!paymentId) {
      return res.status(400).json({ error: 'paymentId obrigatorio' });
    }

    const db = await getDb();
    const payment = await db.collection('payments').findOne({ _id: paymentId, userId });
    if (!payment) {
      return res.status(404).json({ error: 'Pagamento nao encontrado' });
    }
    if (payment.status === 'failed') {
      return res.status(400).json({ error: 'Pagamento falhou' });
    }

    const wallet = await ensureWallet(userId);

    if (payment.status === 'confirmed') {
      let ledgerExisting = await db
        .collection('walletTransactions')
        .findOne({ referenceId: paymentId, type: 'credit', source: 'pix' });
      if (!ledgerExisting) {
        try {
          ledgerExisting = await insertLedgerEntry({
            walletId: wallet._id,
            type: 'credit',
            amount: payment.amount,
            source: 'pix',
            referenceId: paymentId,
            status: 'confirmed',
          });
        } catch (error) {
          if (error?.code === 11000) {
            ledgerExisting = await db
              .collection('walletTransactions')
              .findOne({ referenceId: paymentId, type: 'credit', source: 'pix' });
          } else {
            throw error;
          }
        }
      }
      const balances = await calculateBalances(wallet._id);
      return res.status(200).json({
        paymentId,
        status: 'confirmed',
        ledgerId: ledgerExisting?._id || null,
        walletId: wallet._id,
        balance: balances.balance,
        available: balances.available,
      });
    }

    const updatedPayment = await db.collection('payments').findOneAndUpdate(
      { _id: paymentId, userId, status: 'pending' },
      { $set: { status: 'confirmed' } },
      { returnDocument: 'after' }
    );

    if (!updatedPayment.value) {
      const latest = await db.collection('payments').findOne({ _id: paymentId, userId });
      if (latest?.status === 'confirmed') {
        const balances = await calculateBalances(wallet._id);
        return res.status(200).json({
          paymentId,
          status: 'confirmed',
          walletId: wallet._id,
          balance: balances.balance,
          available: balances.available,
        });
      }
      return res.status(400).json({ error: 'Pagamento nao esta pendente' });
    }

    let ledgerEntry = null;
    try {
      ledgerEntry = await insertLedgerEntry({
        walletId: wallet._id,
        type: 'credit',
        amount: payment.amount,
        source: 'pix',
        referenceId: paymentId,
        status: 'confirmed',
      });
    } catch (error) {
      if (error?.code === 11000) {
        ledgerEntry = await db
          .collection('walletTransactions')
          .findOne({ referenceId: paymentId, type: 'credit', source: 'pix' });
      } else {
        throw error;
      }
    }

    const balances = await calculateBalances(wallet._id);
    return res.status(200).json({
      paymentId,
      status: 'confirmed',
      ledgerId: ledgerEntry?._id || null,
      walletId: wallet._id,
      balance: balances.balance,
      available: balances.available,
    });
  } catch (error) {
    console.error('Erro ao confirmar PIX simulado:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
