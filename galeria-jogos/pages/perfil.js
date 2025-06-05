import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "../components/Header";

export default function Perfil() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [imagem, setImagem] = useState("");
  const [telefone, setTelefone] = useState("");
  const [username, setUsername] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setNome(session.user.nome || session.user.name || "");
      setSobrenome(session.user.sobrenome || "");
      setEmail(session.user.email || "");
      setImagem(session.user.image || "");
      setTelefone(session.user.telefone || "");
      setUsername(session.user.username || "");
    }
  }, [status, session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro("");
    setLoading(true);

    try {
      const response = await fetch("/api/atualizarPerfil", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, nome, sobrenome, imagem, telefone, username }),
      });

      if (response.ok) {
        setMensagem("Perfil atualizado com sucesso!");
        await update(); // Atualiza a sessão com os dados do MongoDB
      } else {
        const data = await response.json();
        setErro(data.message || "Erro ao atualizar perfil.");
      }
    } catch (error) {
      setErro("Erro ao atualizar perfil.");
    }

    setLoading(false);
  };

  if (status === "loading") return <p>Carregando...</p>;
  if (!session) return <p>Você precisa estar logado para acessar esta página.</p>;

  return (
    <>
      <Header />
      <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4 pt-32">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Perfil do Usuário</h2>
          <img src={imagem} alt="Imagem do usuário" className="w-20 h-20 rounded-full mx-auto mb-4" />

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

          <input
            type="text"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full p-3 mb-4 border rounded"
          />

          <input
            type="text"
            placeholder="Nome de usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
            className="w-full p-3 mb-4 border rounded"
          />

          {mensagem && <p className="text-green-600 mb-4">{mensagem}</p>}
          {erro && <p className="text-red-600 mb-4">{erro}</p>}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>
    </>
  );
}
