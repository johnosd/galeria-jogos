import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { insertLedgerEntry, insertWithdrawal } from '../../../lib/mongodb';
import { calculateBalances, ensureWallet, getSessionUserId, normalizeAmount } from '../../../lib/wallet';

const CPF_REGEX = /^\d{11}$/;

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

    const amount = normalizeAmount(req.body?.amount);
    const cpfPixKey = String(req.body?.cpfPixKey || '').replace(/\D/g, '');
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Valor invalido' });
    }
    if (!CPF_REGEX.test(cpfPixKey)) {
      return res.status(400).json({ error: 'PIX apenas CPF com 11 digitos' });
    }

    const wallet = await ensureWallet(userId);
    const balances = await calculateBalances(wallet._id);
    if (amount > balances.available) {
      return res.status(400).json({ error: 'Saldo insuficiente para saque' });
    }

    const withdrawal = await insertWithdrawal({
      userId,
      walletId: wallet._id,
      pixKeyCpf: cpfPixKey,
      amount,
      status: 'requested',
    });

    const ledgerEntry = await insertLedgerEntry({
      walletId: wallet._id,
      type: 'debit',
      amount,
      source: 'saque',
      referenceId: withdrawal._id,
      status: 'blocked',
    });

    const updatedBalances = await calculateBalances(wallet._id);

    return res.status(201).json({
      withdrawalId: withdrawal._id,
      status: withdrawal.status,
      ledgerId: ledgerEntry._id,
      walletId: wallet._id,
      balance: updatedBalances.balance,
      available: updatedBalances.available,
    });
  } catch (error) {
    console.error('Erro ao solicitar saque:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
