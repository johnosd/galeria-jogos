// pages/cadastro.js
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Cadastro() {
  const { data: session } = useSession();
  const router = useRouter();

  const [nome, setNome] = useState(session?.user?.name || "");
  const [sobrenome, setSobrenome] = useState("");
  const [email] = useState(session?.user?.email || "");
  const [image] = useState(session?.user?.image || "");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome || !sobrenome || !email) {
      setErro("Todos os campos são obrigatórios!");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/cadastro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nome, sobrenome, email, image }),
    });

    if (response.ok) {
      router.push("/verificacao");
    } else {
      const data = await response.json();
      setErro(data.message || "Erro ao cadastrar");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Cadastro de Usuário</h2>
        <img src={image} alt="Imagem do usuário" className="w-20 h-20 rounded-full mx-auto mb-4" />

        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
        />

        <input
          type="text"
          placeholder="Sobrenome"
          value={sobrenome}
          onChange={(e) => setSobrenome(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          disabled
          className="w-full p-3 mb-4 border rounded"
        />

        {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
    </div>
  );
}
