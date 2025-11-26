import { useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../../../components/Header';

export default function NovoGrupo() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [capa, setCapa] = useState('/imagens/');
  const [preco, setPreco] = useState('');
  const [msg, setMsg] = useState('');

  const handleCriar = async (e) => {
    e.preventDefault();

    if (!nome || !capa || !preco) {
      setMsg('Todos os campos sao obrigatorios.');
      return;
    }

    try {
      const res = await fetch('/api/grupos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, capa, preco: parseFloat(preco) }),
      });

      if (!res.ok) throw new Error('Erro ao criar grupo.');

      setMsg('Grupo criado com sucesso!');
      setTimeout(() => router.push('/admin/grupos'), 1500);
    } catch (error) {
      setMsg('Erro ao criar grupo.');
    }
  };

  return (
    <>
      <Header admin />

      <main className="pt-[100px] min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
        <form onSubmit={handleCriar} className="bg-white p-6 rounded shadow max-w-sm w-full">
          <h2 className="text-xl font-bold mb-4">Novo Grupo</h2>
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
            placeholder="Mensalidade (ex: 29.90)"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            className="w-full p-3 border rounded mb-4"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
          >
            Criar
          </button>
          {msg && <p className="mt-4 text-red-600">{msg}</p>}
        </form>
      </main>
    </>
  );
}
