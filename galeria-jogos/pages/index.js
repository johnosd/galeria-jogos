import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import Header from '../components/Header';

export default function Home({ gruposIniciais }) {
  const [busca, setBusca] = useState('');
  const grupos = gruposIniciais;

  const gruposFiltrados = grupos.filter((grupo) =>
    grupo.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const calcularStatusGrupo = (grupo) => {
    const capacidadeBase = grupo.capacidadeTotal ?? grupo.membrosAtivos ?? 0;
    const capacidadeNum = Number(capacidadeBase);
    const membrosAtivos = Number(grupo.membrosAtivos ?? 0);
    const capacidade = Number.isFinite(capacidadeNum) && capacidadeNum > 0 ? capacidadeNum : membrosAtivos;
    const pedidosSaida = Number(grupo.pedidosSaida ?? 0);
    const vagasDisponiveis = Math.max(capacidade - membrosAtivos, 0);
    const vagasFila = Math.max(pedidosSaida - vagasDisponiveis, 0);

    return { capacidade, membrosAtivos, vagasDisponiveis, vagasFila };
  };

  return (
    <>
      <Header />

      <div className="max-w-md mx-auto mt-[110px] mb-10 px-4">
        <input
          type="text"
          placeholder="Buscar grupo..."
          value={busca}
          autoFocus
          onChange={(e) => setBusca(e.target.value)}
          className="w-full px-5 py-3 rounded-lg border border-gray-300 shadow focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      <main className="min-h-screen bg-gray-100 text-gray-900 px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">CCPLAY GRUPOS</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {gruposFiltrados.map((grupo) => {
            const grupoId = grupo._id || grupo.id;
            const { capacidade, membrosAtivos, vagasDisponiveis, vagasFila } = calcularStatusGrupo(grupo);
            const imageSrc = grupo.imageUrl || grupo.capa;

            return (
              <div
                key={grupoId}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition flex flex-col gap-4 p-5 h-full"
              >
                <div className="flex items-start gap-4">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={grupo.nome}
                      width={64}
                      height={64}
                      className="rounded-full object-cover w-16 h-16 ring-2 ring-blue-50 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-xl shadow-sm">
                      <i className="fa fa-users" aria-hidden="true"></i>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">{grupo.nome}</h2>
                    {grupo.descricao && (
                      <p className="text-sm text-gray-600 leading-relaxed mt-1">
                        {grupo.descricao}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-800 space-y-1">
                  <p className={vagasDisponiveis > 0 ? 'text-green-700 font-semibold' : 'text-gray-700'}>
                    {vagasDisponiveis > 0 ? `${vagasDisponiveis} vaga(s) aberta(s)` : 'Grupo completo'}
                  </p>
                  {vagasFila > 0 && (
                    <p className="text-amber-700">
                      Fila de espera: <strong>{vagasFila}</strong> (aguardando saida agendada)
                    </p>
                  )}
                  <p className="font-semibold text-gray-900">
                    Mensalidade: R$ {Number(grupo.preco).toFixed(2)}
                  </p>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <i className="fa fa-users text-blue-600" aria-hidden="true"></i>
                    <span>
                      <strong>{membrosAtivos}</strong>
                      {capacidade ? ` / ${capacidade}` : ''} membros
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/grupos/${grupoId}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:bg-blue-700 transition"
                    >
                      Ver grupo
                    </Link>
                    <a
                      href={`https://wa.me/5511997383948?text=Ola! Quero entrar no grupo de assinatura: ${encodeURIComponent(
                        grupo.nome
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-600 text-green-700 hover:bg-green-50 transition text-sm font-semibold"
                    >
                      <FaWhatsapp /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}

// Busca os grupos do backend
export async function getServerSideProps() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/grupos`);
  const gruposIniciais = await res.json();

  return {
    props: {
      gruposIniciais,
    },
  };
}
