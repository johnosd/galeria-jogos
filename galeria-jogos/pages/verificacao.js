import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Verificacao() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.contaValidada) {
      router.push("/"); // Redireciona se já validado
    }
  }, [status, session, router]);

  const enviarCodigo = async () => {
    setMensagem("");
    setErro("");
    setLoading(true);

    try {
      const response = await fetch("/api/sendVerificationCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });

      if (response.ok) {
        setMensagem("Codigo enviado com sucesso!");
        setEnviado(true);
      } else {
        const data = await response.json().catch(() => ({}));
        setErro(data.message || "Erro ao enviar o codigo.");
      }
    } catch {
      setErro("Erro ao comunicar com o servidor.");
    }

    setLoading(false);
  };

  const verificarCodigo = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagem("");

    try {
      const response = await fetch("/api/verifyEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: codigo.trim(), email: session.user.email }),
      });

      if (response.ok) {
        setMensagem("Conta verificada com sucesso!");
        await signIn("google", { redirect: false }); // Atualiza a sessão
        router.push("/");
      } else {
        const data = await response.json().catch(() => ({}));
        setErro(data.message || "Codigo invalido ou expirado.");
      }
    } catch {
      setErro("Erro ao verificar o codigo.");
    }
  };

  const validarDepois = () => {
    router.push("/");
  };

  if (status === "loading") return <p>Carregando...</p>;
  if (!session) return <p>Você precisa estar logado para acessar esta página.</p>;

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded shadow max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Verifique seu E-mail</h2>

        {mensagem && <p className="text-green-600 mb-4">{mensagem}</p>}
        {erro && <p className="text-red-600 mb-4">{erro}</p>}

        {!enviado ? (
          <button
            onClick={enviarCodigo}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mb-4"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar codigo"}
          </button>
        ) : (
          <form onSubmit={verificarCodigo}>
            <input
              type="text"
              placeholder="Digite o codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full p-3 mb-4 border rounded"
            />
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
              >
                Verificar codigo
              </button>
              <button
                type="button"
                onClick={validarDepois}
                className="w-full bg-gray-400 text-white py-2 rounded hover:bg-gray-500 transition"
              >
                Validar Depois
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
