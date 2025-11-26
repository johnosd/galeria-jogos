import Header from '../../../components/Header';
import Link from 'next/link';
import useSWR from 'swr';
import { useState } from 'react';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function GruposAdmin() {
  const { data: grupos, error, mutate } = useSWR('/api/grupos', fetcher);
  const [excluindoId, setExcluindoId] = useState(null);

  if (error) return <div className="pt-[100px] p-6">Falha ao carregar grupos.</div>;
  if (!grupos) return <div className="pt-[100px] p-6">Carregando...</div>;

  async function handleExcluir(id) {
    const confirmar = confirm('Tem certeza que deseja excluir este grupo?');
    if (!confirmar) return;

    setExcluindoId(id);

    try {
      const res = await fetch(`/api/grupos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir grupo.');

      // Atualiza lista de grupos puxando novamente da API
      await mutate();
    } catch (err) {
      alert('Erro ao excluir grupo.');
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <>
      <Header admin />
      <main className="pt-[100px] min-h-screen p-6 bg-gray-100">
        <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">Administracao dos Grupos</h1>
          <Link href="/admin/grupos/novo" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            + Novo Grupo
          </Link>
        </div>

        <table className="w-full table-auto bg-white rounded shadow max-w-6xl mx-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Nome</th>
              <th className="border px-4 py-2">Mensalidade</th>
              <th className="border px-4 py-2">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {grupos.map((grupo) => (
              <tr key={grupo._id}>
                <td className="border px-4 py-2">{grupo.nome}</td>
                <td className="border px-4 py-2">R$ {Number(grupo.preco).toFixed(2)}</td>
                <td className="border px-4 py-2 text-center space-x-2">
                  <Link href={`/admin/grupos/${grupo._id}`} className="text-blue-600 hover:underline">
                    Editar
                  </Link>
                  <button
                    onClick={() => handleExcluir(grupo._id)}
                    disabled={excluindoId === grupo._id}
                    className="text-red-600 hover:underline disabled:text-red-300"
                  >
                    {excluindoId === grupo._id ? 'Excluindo...' : 'Excluir'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
}
