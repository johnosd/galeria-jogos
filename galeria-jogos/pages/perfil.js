import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Perfil() {
  const { data: session, status } = useSession();
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [imagem, setImagem] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      setNome(session.user.name || "");
      setImagem(session.user.image || "");
    }
  }, [session, status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagem("");
    setLoading(true);

    try {
      const response = await fetch("/api/atualizarPerfil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          nome,
          sobrenome,
          imagem,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem("Perfil atualizado com sucesso!");
        // Atualizar sessão
        await signIn("google", { redirect: false });
      } else {
        setErro(data.message || "Erro ao atualizar o perfil.");
      }
    } catch {
      setErro("Erro ao se comunicar com o servidor.");
    }

    setLoading(false);
  };

  if (status === "loading") return <p>Carregando...</p>;
  if (!session) return <p>Você precisa estar logado para acessar esta página.</p>;

  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-100 p-6">
      <div className="bg-white p-6 rounded shadow max-w-xl w-full space-y-6">
        <h2 className="text-2xl font-bold text-center">Meu Perfil</h2>

        <div className="text-center">
          <img
            src={imagem || session.user.image}
            alt="Foto de perfil"
            className="w-24 h-24 mx-auto rounded-full mb-2"
          />
          <p><strong>Email:</strong> {session.user.email}</p>
          <p><strong>Status:</strong>{" "}
            {session.user.contaValidada ? "Conta verificada ✅" : "Conta não verificada ❌"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mensagem && <p className="text-green-600">{mensagem}</p>}
          {erro && <p className="text-red-600">{erro}</p>}

          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-3 border rounded"
          />
          <input
            type="text"
            placeholder="Sobrenome"
            value={sobrenome}
            onChange={(e) => setSobrenome(e.target.value)}
            className="w-full p-3 border rounded"
          />
          <input
            type="text"
            placeholder="URL da imagem"
            value={imagem}
            onChange={(e) => setImagem(e.target.value)}
            className="w-full p-3 border rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>
    </div>
  );
}
