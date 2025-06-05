import Header from '../../../components/Header';
import Link from 'next/link';
import useSWR from 'swr';
import { useState } from 'react';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function JogosAdmin() {
  const { data: jogos, error, mutate } = useSWR('/api/jogos', fetcher);
  const [excluindoId, setExcluindoId] = useState(null);

  if (error) return <div className="pt-[100px] p-6">Falha ao carregar jogos.</div>;
  if (!jogos) return <div className="pt-[100px] p-6">Carregando...</div>;

  async function handleExcluir(id) {
    const confirmar = confirm('Tem certeza que deseja excluir este jogo?');
    if (!confirmar) return;

    setExcluindoId(id);

    try {
      const res = await fetch(`/api/jogos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir jogo.');

      // Atualiza lista de jogos puxando novamente da API
      await mutate();
    } catch (err) {
      alert('Erro ao excluir jogo.');
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <>
      <Header admin />
      <main className="pt-[100px] min-h-screen p-6 bg-gray-100">
        <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">Administração dos Jogos</h1>
          <Link href="/admin/jogos/novo" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            + Novo Jogo
          </Link>
        </div>

        <table className="w-full table-auto bg-white rounded shadow max-w-6xl mx-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Nome</th>
              <th className="border px-4 py-2">Preço</th>
              <th className="border px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {jogos.map((jogo) => (
              <tr key={jogo._id}>
                <td className="border px-4 py-2">{jogo.nome}</td>
                <td className="border px-4 py-2">R$ {Number(jogo.preco).toFixed(2)}</td>
                <td className="border px-4 py-2 text-center space-x-2">
                  <Link href={`/admin/jogos/${jogo._id}`} className="text-blue-600 hover:underline">
                    Editar
                  </Link>
                  <button
                    onClick={() => handleExcluir(jogo._id)}
                    disabled={excluindoId === jogo._id}
                    className="text-red-600 hover:underline disabled:text-red-300"
                  >
                    {excluindoId === jogo._id ? 'Excluindo...' : 'Excluir'}
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
