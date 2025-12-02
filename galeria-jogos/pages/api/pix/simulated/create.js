import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { insertPayment } from '../../../../lib/mongodb';
import { ensureWallet, getSessionUserId, normalizeAmount } from '../../../../lib/wallet';

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
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Valor invalido' });
    }

    const wallet = await ensureWallet(userId);
    const payment = await insertPayment({
      userId,
      gateway: 'simulated',
      amount,
      status: 'pending',
    });

    return res.status(201).json({
      paymentId: payment._id,
      status: payment.status,
      walletId: wallet._id,
      qrCode: `SIMULATED-PIX-${payment._id}`,
      amount: payment.amount,
    });
  } catch (error) {
    console.error('Erro ao criar pagamento PIX simulado:', error);
    const message = error?.message || 'Erro interno no servidor';
    return res.status(500).json({ error: message });
  }
}
