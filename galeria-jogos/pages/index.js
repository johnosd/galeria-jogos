import Image from 'next/image';
import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import Header from '../components/Header';

export default function Home({ gruposIniciais }) {
  const [busca, setBusca] = useState('');
  const grupos = gruposIniciais;
  const [modalAberto, setModalAberto] = useState(false);
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);

  const gruposFiltrados = grupos.filter((grupo) =>
    grupo.nome.toLowerCase().includes(busca.toLowerCase())
  );

  function abrirModal(grupo) {
    setGrupoSelecionado(grupo);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setGrupoSelecionado(null);
  }

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
          {gruposFiltrados.map((grupo) => (
            <div
              key={grupo._id || grupo.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition flex flex-col"
            >
              <div className="relative w-full h-[400px]">
                <Image
                  src={grupo.capa}
                  alt={grupo.nome}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <div className="p-4 flex flex-col gap-2">
                <h2 className="text-lg font-semibold">{grupo.nome}</h2>

                {grupo.descricao && (
                  <p className="text-sm text-gray-700 leading-relaxed max-h-20 overflow-hidden">
                    {grupo.descricao}
                  </p>
                )}

                {(() => {
                  const { capacidade, membrosAtivos, vagasDisponiveis, vagasFila } = calcularStatusGrupo(grupo);
                  return (
                    <div className="space-y-1 text-sm text-gray-800">
                      <p>
                        Membros: <strong>{membrosAtivos}</strong>
                        {capacidade ? ` / ${capacidade}` : ''}
                      </p>
                      <p className={vagasDisponiveis > 0 ? 'text-green-700 font-semibold' : 'text-gray-700'}>
                        {vagasDisponiveis > 0 ? `${vagasDisponiveis} vaga(s) aberta(s)` : 'Grupo completo'}
                      </p>
                      {vagasFila > 0 && (
                        <p className="text-amber-700">
                          Fila de espera: <strong>{vagasFila}</strong> (aguardando saida agendada)
                        </p>
                      )}
                    </div>
                  );
                })()}

                <p className="mb-2 font-semibold">Mensalidade: R$ {Number(grupo.preco).toFixed(2)}</p>

                <button
                  onClick={() => abrirModal(grupo)}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  Entrar no grupo
                </button>

                <a
                  href={`https://wa.me/5511997383948?text=Ola! Quero entrar no grupo de assinatura: ${encodeURIComponent(
                    grupo.nome
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="w-full border border-green-600 text-green-600 py-2 rounded hover:bg-green-100 flex items-center justify-center gap-2 transition">
                    <FaWhatsapp /> Falar no WhatsApp
                  </button>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {modalAberto && grupoSelecionado && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          >
            <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
              <button
                onClick={fecharModal}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl font-bold"
                aria-label="Fechar modal"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4">Assinatura - {grupoSelecionado.nome}</h2>
              {(() => {
                const { capacidade, membrosAtivos, vagasDisponiveis, vagasFila } = calcularStatusGrupo(grupoSelecionado);
                return (
                  <div className="text-sm text-gray-800 space-y-1 mb-3">
                    <p>
                      Membros: <strong>{membrosAtivos}</strong>
                      {capacidade ? ` / ${capacidade}` : ''}
                    </p>
                    <p className={vagasDisponiveis > 0 ? 'text-green-700 font-semibold' : 'text-gray-700'}>
                      {vagasDisponiveis > 0 ? `${vagasDisponiveis} vaga(s) aberta(s)` : 'Grupo completo'}
                    </p>
                    {vagasFila > 0 && (
                      <p className="text-amber-700">
                        Fila de espera: <strong>{vagasFila}</strong> (aguardando saida agendada)
                      </p>
                    )}
                  </div>
                );
              })()}
              <p className="mb-4">
                Mensalidade: <strong>R$ {Number(grupoSelecionado.preco).toFixed(2)}</strong>
              </p>
              <p className="mb-6">
                Para entrar no grupo, envie o comprovante da primeira mensalidade pelo WhatsApp e aguarde a liberacao
                do administrador.
              </p>
              <a
                href={`https://wa.me/5511997383948?text=Ola! Ja paguei a primeira mensalidade do grupo: ${encodeURIComponent(
                  grupoSelecionado.nome
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <FaWhatsapp /> Enviar comprovante
              </a>
            </div>
          </div>
        )}
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
