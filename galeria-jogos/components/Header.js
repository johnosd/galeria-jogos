import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Header({ admin = false }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <header
      className={`${
        admin ? "bg-gray-900" : "bg-black"
      } text-white px-6 flex items-center h-[100px] fixed top-0 left-0 right-0 z-50 shadow-md`}
    >
      <div className="relative w-full max-w-7xl mx-auto flex justify-between items-center h-full">
        <Link href="/">
          <Image
            src="/imagens/logo.png"
            alt="Logo do Site"
            width={354}
            height={99}
            className="object-cover cursor-pointer"
          />
        </Link>

        <div className="absolute right-6">
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded focus:outline-none"
            aria-haspopup="true"
            aria-expanded={menuAberto}
            aria-label="Abrir menu"
          >
            Menu
          </button>

          {menuAberto && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded shadow-lg text-white z-[9999]">
              {session ? (
                <>
                  <Link
                    href="/admin"
                    className="block px-4 py-2 hover:bg-gray-600"
                    onClick={() => setMenuAberto(false)}
                  >
                    Administração
                  </Link>
                  <Link
                    href="/perfil"
                    className="block px-4 py-2 hover:bg-gray-600"
                    onClick={() => setMenuAberto(false)}
                  >
                    Editar Perfil
                  </Link>
                  {!session.user?.contaValidada && (
                    <Link
                      href="/verificacao"
                      className="block px-4 py-2 hover:bg-gray-600"
                      onClick={() => setMenuAberto(false)}
                    >
                      Verificar Conta
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block px-4 py-2 w-full text-left hover:bg-gray-600"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="block px-4 py-2 hover:bg-gray-600"
                  onClick={() => setMenuAberto(false)}
                >
                  Entrar
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
