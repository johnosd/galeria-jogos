import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import FlowStepper from '../../components/FlowStepper';

const METODOS = [
  { id: 'saldo', titulo: 'Saldo disponivel', valor: 'R$ 1.064,73', badge: 'Sem taxas', taxa: 0 },
  { id: 'pix', titulo: 'Pix - rapido e sem complicacoes', valor: 'R$ 35,68', badge: '+ R$ 0,68 (taxa)', taxa: 0.68, icon: 'fa-bolt' },
];

export default function Pagamento() {
  const router = useRouter();
  const { grupoId, nome, preco, userId } = router.query;
  const [metodo, setMetodo] = useState('saldo');
  const [mostrarMetodosExtras, setMostrarMetodosExtras] = useState(false);
  const [mostrarCupom, setMostrarCupom] = useState(false);
  const grupoNome = nome || 'Grupo';
  const precoNumero = useMemo(() => {
    const n = Number(preco);
    return Number.isFinite(n) && n > 0 ? n : 35;
  }, [preco]);
  const hrefSucesso = useMemo(() => {
    const query = new URLSearchParams();
    if (grupoId) query.append('grupoId', grupoId);
    if (nome) query.append('nome', nome);
    if (precoNumero) query.append('preco', String(precoNumero));
    if (userId) query.append('userId', userId);
    const qs = query.toString();
    return `/assinatura/sucesso${qs ? `?${qs}` : ''}`;
  }, [grupoId, nome, precoNumero, userId]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 text-gray-900 px-4 pb-24 pt-[110px]">
        <div className="max-w-4xl mx-auto space-y-6">
          <FlowStepper currentStep={2} steps={['Relacionamento', 'Pagamento', 'Sucesso']} />

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold">Pagamento</h1>
            <p className="text-gray-600 text-sm">Escolha a forma de pagamento e finalize sua entrada no grupo.</p>
          </div>

          <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-2">
                <p className="text-xs uppercase tracking-wide text-gray-500">Resumo</p>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{grupoNome}</p>
                    <p className="text-sm text-gray-600">Inclui mensalidade + caucao. Sem taxas extras.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Valor hoje</p>
                    <p className="text-xl font-bold">R$ {precoNumero.toFixed(2)}</p>
                  </div>
                </div>
              </section>

          <section className="space-y-4">
            {METODOS.map((item) => (
              <label
                key={item.id}
                className={`flex items-center gap-4 bg-white border rounded-2xl p-5 shadow-sm cursor-pointer transition ${
                  metodo === item.id ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100 hover:border-blue-200'
                }`}
              >
                <input
                  type="radio"
                  name="metodo"
                  value={item.id}
                  checked={metodo === item.id}
                  onChange={() => setMetodo(item.id)}
                  className="w-5 h-5 accent-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {item.icon && <i className={`fa ${item.icon} text-blue-600`} aria-hidden="true"></i>}
                    <p className="font-semibold">{item.titulo}</p>
                  </div>
                  <p className="text-sm text-gray-600">Pagamento confirmado em instantes.</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{item.valor}</p>
                  <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                    {item.badge}
                  </span>
                </div>
              </label>
            ))}

            <details
              className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
              open={mostrarMetodosExtras}
              onClick={() => setMostrarMetodosExtras((v) => !v)}
            >
              <summary className="cursor-pointer px-5 py-4 font-semibold text-gray-900 flex items-center justify-between">
                Ver mais metodos
                <span className="text-blue-600 text-lg">+</span>
              </summary>
              <div className="divide-y divide-gray-100">
                {[
                  { id: 'credito', titulo: 'Cartao de credito', taxa: 'Taxa: R$ 1,20' },
                  { id: 'boleto', titulo: 'Boleto', taxa: 'Taxa: R$ 1,90' },
                  { id: 'debito', titulo: 'Debito', taxa: 'Taxa: R$ 0,90' },
                ].map((extra) => (
                  <label
                    key={extra.id}
                    className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition ${
                      metodo === extra.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="metodo"
                      value={extra.id}
                      checked={metodo === extra.id}
                      onChange={() => setMetodo(extra.id)}
                      className="w-5 h-5 accent-blue-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{extra.titulo}</p>
                      <p className="text-xs text-gray-600">{extra.taxa}</p>
                    </div>
                  </label>
                ))}
              </div>
            </details>
          </section>

          <section className="bg-white border border-gray-100 rounded-2xl shadow-sm">
            <button
              type="button"
              onClick={() => setMostrarCupom((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-gray-900"
            >
              Tem um cupom?
              <span className="text-blue-600 text-lg">{mostrarCupom ? '-' : '+'}</span>
            </button>
            {mostrarCupom && (
              <div className="px-5 pb-5 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Digite seu cupom"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow hover:bg-blue-700 transition">
                  Aplicar
                </button>
              </div>
            )}
          </section>
        </div>

        <div className="fixed bottom-0 left-0 right-0 md:static md:max-w-4xl md:mx-auto md:mt-8">
          <div className="bg-white border-t md:border border-gray-200 shadow-2xl md:shadow-sm px-4 py-4 md:rounded-2xl flex flex-col md:flex-row items-center md:items-stretch gap-3">
            <div className="flex-1 w-full">
              <p className="text-xs text-gray-500">Pagamento</p>
              <p className="text-lg font-bold text-gray-900">R$ {precoNumero.toFixed(2)}</p>
              <p className="text-xs text-gray-600">Transacao segura criptografada.</p>
            </div>
            <Link
              href={hrefSucesso}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition"
            >
              <i className="fa fa-lock" aria-hidden="true"></i>
              Finalizar pagamento
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
