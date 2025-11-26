import { createContext, useState, useContext } from 'react';

const GruposContext = createContext();

export function GruposProvider({ children }) {
  const [grupos, setGrupos] = useState([
    { id: 1, nome: 'Netflix Premium', capa: '/imagens/netflix.jpg', preco: 19.9 },
    { id: 2, nome: 'Game Pass Ultimate', capa: '/imagens/gamepass.jpg', preco: 29.9 },
    { id: 3, nome: 'Spotify Duo', capa: '/imagens/spotify.jpg', preco: 16.9 },
  ]);

  const adicionarGrupo = (grupo) => {
    setGrupos((oldGrupos) => [...oldGrupos, { ...grupo, id: oldGrupos.length + 1 }]);
  };

  return (
    <GruposContext.Provider value={{ grupos, adicionarGrupo }}>
      {children}
    </GruposContext.Provider>
  );
}

export function useGrupos() {
  return useContext(GruposContext);
}
