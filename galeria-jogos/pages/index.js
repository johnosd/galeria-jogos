import Image from 'next/image';
import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import Header from '../components/Header';

export default function Home({ jogosIniciais }) {
  const [busca, setBusca] = useState('');
  const jogos = jogosIniciais;
  const [modalAberto, setModalAberto] = useState(false);
  const [jogoSelecionado, setJogoSelecionado] = useState(null);

  const jogosFiltrados = jogos.filter((jogo) =>
    jogo.nome.toLowerCase().includes(busca.toLowerCase())
  );

  function abrirModal(jogo) {
    setJogoSelecionado(jogo);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setJogoSelecionado(null);
  }

  return (
    <>
      <Header />

      <div className="max-w-md mx-auto mt-[110px] mb-10 px-4">
        <input
          type="text"
          placeholder="Buscar jogo..."
          value={busca}
          autoFocus
          onChange={(e) => setBusca(e.target.value)}
          className="w-full px-5 py-3 rounded-lg border border-gray-300 shadow focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      <main className="min-h-screen bg-gray-100 text-gray-900 px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">CCPLAY GAMES</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {jogosFiltrados.map((jogo) => (
            <div
              key={jogo._id || jogo.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition flex flex-col"
            >
              <div className="relative w-full h-[400px]">
                <Image
                  src={jogo.capa}
                  alt={jogo.nome}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <div className="p-4 flex flex-col gap-2">
                <h2 className="text-lg font-semibold">{jogo.nome}</h2>

                <p className="mb-2 font-semibold">R$ {Number(jogo.preco).toFixed(2)}</p>

                <button
                  onClick={() => abrirModal(jogo)}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  Comprar agora
                </button>

                <a
                  href={`https://wa.me/5511997383948?text=Olá! Gostaria de comprar o jogo: ${encodeURIComponent(
                    jogo.nome
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="w-full border border-green-600 text-green-600 py-2 rounded hover:bg-green-100 flex items-center justify-center gap-2 transition">
                    <FaWhatsapp /> Comprar pelo WhatsApp
                  </button>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {modalAberto && jogoSelecionado && (
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
              <h2 className="text-xl font-bold mb-4">Pagamento - {jogoSelecionado.nome}</h2>
              <p className="mb-4">
                Valor: <strong>R$ {Number(jogoSelecionado.preco).toFixed(2)}</strong>
              </p>
              <p className="mb-6">
                Para finalizar a compra, envie o comprovante de pagamento pelo WhatsApp clicando no botão abaixo.
              </p>
              <a
                href={`https://wa.me/5511997383948?text=Olá! Já realizei o pagamento do jogo: ${encodeURIComponent(
                  jogoSelecionado.nome
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <FaWhatsapp /> Enviar comprovante pelo WhatsApp
              </a>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

// Busca os jogos do backend
export async function getServerSideProps() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/jogos`);
  const jogosIniciais = await res.json();

  return {
    props: {
      jogosIniciais,
    },
  };
}
