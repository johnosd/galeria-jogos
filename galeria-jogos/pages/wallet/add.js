import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Header from '../../components/Header';

export default function WalletAdd() {
  const { status } = useSession();
  const [amount, setAmount] = useState('');
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setPayment(null);
    setLoading(true);
    try {
      const res = await fetch('/api/pix/simulated/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao criar pagamento');
      setPayment(data);
    } catch (err) {
      setError(err.message || 'Erro ao criar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!payment?.paymentId) return;
    setConfirming(true);
    setError('');
    try {
      const res = await fetch('/api/pix/simulated/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: payment.paymentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao confirmar pagamento');
      setPayment((prev) => ({ ...prev, ...data }));
    } catch (err) {
      setError(err.message || 'Erro ao confirmar pagamento');
    } finally {
      setConfirming(false);
    }
  };

  const isAuth = status === 'authenticated';

  return (
    <>
      <Header />
      <main className="pt-28 pb-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Adicionar saldo (PIX simulado)</h1>
            <Link href="/wallet" className="text-sm text-blue-600 hover:underline">
              Voltar para carteira
            </Link>
          </div>

          {!isAuth && <p className="text-red-600">Faça login para adicionar saldo.</p>}

          <form onSubmit={handleCreate} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="100.00"
                required
                disabled={!isAuth || loading}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              disabled={!isAuth || loading}
            >
              {loading ? 'Gerando PIX...' : 'Gerar QR simulado'}
            </button>
          </form>

          {error && <p className="text-red-600 mt-4">{error}</p>}

          {payment && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600">Pagamento gerado</p>
              <p className="text-lg font-semibold text-gray-900">Valor: R$ {Number(payment.amount || 0).toFixed(2)}</p>
              <p className="text-sm text-gray-700 break-all mt-2">QR Simulado: {payment.qrCode}</p>
              <p className="text-sm text-gray-700 mt-1">Payment ID: {payment.paymentId}</p>
              <p className="text-sm text-gray-700 mt-1">Status: {payment.status}</p>

              <button
                type="button"
                onClick={handleConfirm}
                className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={confirming}
              >
                {confirming ? 'Confirmando...' : 'Confirmar pagamento'}
              </button>
              {payment.balance !== undefined && (
                <p className="text-sm text-gray-700 mt-2">
                  Saldo atualizado: R$ {Number(payment.balance || 0).toFixed(2)} (disponível:{' '}
                  {Number(payment.available || 0).toFixed(2)})
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
