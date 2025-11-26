import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';

const SENHA = '220754'; // Defina sua senha aqui

// Header fixo com logo (igual ao da home)
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

export default function AdminLogin() {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (senha === SENHA) {
      router.push('/admin/grupos');
    } else {
      setErro('Senha incorreta');
    }
  };

  return (
    <>
      <Header />
      <main className="pt-[100px] min-h-screen flex justify-center items-center bg-gray-100 p-4">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-sm w-full">
          <h2 className="text-xl font-bold mb-4">Login Administrativo</h2>
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full p-3 border rounded mb-4"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
          >
            Entrar
          </button>
          {erro && <p className="mt-4 text-red-600">{erro}</p>}
        </form>
      </main>
    </>
  );
}
