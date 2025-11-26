import { useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../../../components/Header';

export default function EditarGrupo({ grupo }) {
  const router = useRouter();
  const [nome, setNome] = useState(grupo.nome);
  const [capa, setCapa] = useState(grupo.capa);
  const [preco, setPreco] = useState(grupo.preco);
  const [msg, setMsg] = useState('');

  const handleAtualizar = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/grupos/${grupo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, capa, preco: parseFloat(preco) }),
      });

      if (!res.ok) throw new Error('Erro ao atualizar grupo');

      setMsg('Grupo atualizado com sucesso!');
      setTimeout(() => router.push('/admin/grupos'), 1500);
    } catch (error) {
      setMsg('Erro ao atualizar grupo');
    }
  };

  return (
    <>
      <Header admin />
      <main className="pt-[100px] min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
        <form onSubmit={handleAtualizar} className="bg-white p-6 rounded shadow max-w-sm w-full">
          <h2 className="text-xl font-bold mb-4">Editar Grupo</h2>
          <input
            type="text"
            placeholder="Nome do grupo"
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
            placeholder="Mensalidade (ex: 120.00)"
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

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/grupos/${id}`);
  if (!res.ok) {
    return {
      notFound: true,
    };
  }

  const grupo = await res.json();

  return {
    props: { grupo },
  };
}
