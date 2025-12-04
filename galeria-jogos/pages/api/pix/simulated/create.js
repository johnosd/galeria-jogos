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
    const cpfRaw = String(req.body?.cpf || '').replace(/\D/g, '');
    const validarCpf = (cpf) => {
      if (!cpf || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
      const calc = (base) => {
        let sum = 0;
        for (let i = 0; i < base.length; i += 1) {
          sum += Number(cpf[i]) * (base.length + 1 - i);
        }
        const mod = (sum * 10) % 11;
        return mod === 10 ? 0 : mod;
      };
      return calc('123456789') === Number(cpf[9]) && calc('1234567890') === Number(cpf[10]);
    };

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Valor invalido' });
    }
    if (!validarCpf(cpfRaw)) {
      return res.status(400).json({ error: 'CPF invalido para pagamento Pix' });
    }

    const wallet = await ensureWallet(userId);
    const payment = await insertPayment({
      userId,
      gateway: 'simulated',
      pixCpf: cpfRaw,
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
