import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';

// Header fixo com logo (igual ao da home e login)
function Header() {
  return (
    <header className="bg-black text-white px-6 flex items-center h-[100px] fixed top-0 left-0 right-0 z-50 shadow-md">
      <div className="flex items-center h-full w-full max-w-7xl mx-auto justify-between">
        <Link href="/">
          <Image
            src="/imagens/logo.png"
            alt="Logo do Site"
            width={354}
            height={99}
            className="object-cover cursor-pointer"
          />
        </Link>
      </div>
    </header>
  );
}

export default function EditarJogo({ jogo }) {
  const router = useRouter();
  const [nome, setNome] = useState(jogo.nome);
  const [capa, setCapa] = useState(jogo.capa);
  const [preco, setPreco] = useState(jogo.preco);
  const [msg, setMsg] = useState('');

  const handleAtualizar = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/jogos/${jogo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, capa, preco: parseFloat(preco) }),
      });

      if (!res.ok) throw new Error('Erro ao atualizar jogo');

      setMsg('Jogo atualizado com sucesso!');
      setTimeout(() => router.push('/admin/jogos'), 1500);
    } catch (error) {
      setMsg('Erro ao atualizar jogo');
    }
  };

  return (
    <>
      <Header />
      <main className="pt-[100px] min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
        <form onSubmit={handleAtualizar} className="bg-white p-6 rounded shadow max-w-sm w-full">
          <h2 className="text-xl font-bold mb-4">Editar Jogo</h2>
          <input
            type="text"
            placeholder="Nome do Jogo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-3 border rounded mb-4"
          />
          <input
            type="text"
            placeholder="URL da imagem (ex: /imagens/novo.jpg)"
            value={capa}
            onChange={(e) => setCapa(e.target.value)}
            className="w-full p-3 border rounded mb-4"
          />
          <input
            type="text"
            placeholder="Valor do Jogo (ex: 120.00)"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            className="w-full p-3 border rounded mb-4"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
          >
            Atualizar
          </button>
          {msg && <p className="mt-4 text-green-600">{msg}</p>}
        </form>
      </main>
    </>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/jogos/${id}`);
  if (!res.ok) {
    return {
      notFound: true,
    };
  }

  const jogo = await res.json();

  return {
    props: { jogo },
  };
}
