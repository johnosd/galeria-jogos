import { createContext, useState, useContext } from 'react';

const JogosContext = createContext();

export function JogosProvider({ children }) {
  const [jogos, setJogos] = useState([
    { id: 1, nome: 'The Last of Us', capa: '/imagens/lastofus.jpg' },
    { id: 2, nome: 'God of War', capa: '/imagens/godofwar.jpg' },
    { id: 3, nome: 'Minecraft', capa: '/imagens/minecraft.jpg' },
    { id: 4, nome: 'FIFA 23', capa: '/imagens/fifa23.jpg' },
    { id: 5, nome: 'Call of Duty', capa: '/imagens/cod.jpg' },
    { id: 6, nome: 'Cyberpunk 2077', capa: '/imagens/cyberpunk2077.jpg' },
  ]);

  const adicionarJogo = (jogo) => {
    setJogos((oldJogos) => [...oldJogos, { ...jogo, id: oldJogos.length + 1 }]);
  };

  return (
    <JogosContext.Provider value={{ jogos, adicionarJogo }}>
      {children}
    </JogosContext.Provider>
  );
}

export function useJogos() {
  return useContext(JogosContext);
}
