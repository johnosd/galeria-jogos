import { useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../../../components/Header';

export default function NovoGrupo() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [capa, setCapa] = useState('');
  const [imagemPreview, setImagemPreview] = useState('');
  const [imagemFile, setImagemFile] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [imageKey, setImageKey] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [capacidadeTotal, setCapacidadeTotal] = useState('');
  const [membrosAtivos, setMembrosAtivos] = useState('');
  const [pedidosSaida, setPedidosSaida] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [acesso, setAcesso] = useState('Convite');
  const [tempoEntrega, setTempoEntrega] = useState('Ate 5 dias (geralmente mais rapido)');
  const [confiabilidade, setConfiabilidade] = useState('Selo ouro');
  const [beneficios, setBeneficios] = useState(
    'Armazenamento 2 TB compartilhado\nContas individuais preservam privacidade\nPagamento mensal\nGrupo ja esta ativo\nAdministrador confiavel\nEnvio de acesso rapido'
  );
  const [fidelidade, setFidelidade] = useState(
    'Compromisso de 12 meses\nCancelamento nao permitido durante fidelidade\nRenovacao automatica\nProxima renovacao: 22/05/2026'
  );
  const [regras, setRegras] = useState('Nao compartilhar senha\nNao postar em nome do administrador\nNao alterar senha');
  const [faq, setFaq] = useState(
    'Quando terei acesso ao servico?|O acesso e enviado em ate 5 dias, normalmente no mesmo dia.\nQuais formas de pagamento?|Pix ou cartao pelos metodos do administrador do grupo.\nO que e caucao?|Valor de seguranca em casos especificos; avisaremos antes se for necessario.\nCom quem posso dividir assinaturas?|Apenas com membros aprovados pelo administrador do grupo.'
  );
  const [linkOficial, setLinkOficial] = useState('https://one.google.com/');
  const [adminNome, setAdminNome] = useState('Isabela');
  const [adminAvatar, setAdminAvatar] = useState('https://i.pravatar.cc/160?img=47');
  const [adminSelos, setAdminSelos] = useState('Mais de 1 grupo ativo\n+1 ano de plataforma\nEnvio rapido');
  const [participantes, setParticipantes] = useState('Deyves\nLuciene\nRafael\nNicholas');
  const [msg, setMsg] = useState('');
  const [criando, setCriando] = useState(false);

  const handleCriar = async (e) => {
    e.preventDefault();

    if (!nome || !preco) {
      setMsg('Nome e mensalidade sao obrigatorios.');
      return;
    }

    setCriando(true);
    setMsg('');

    const payload = {
      nome,
      capa,
      imageUrl: capa,
      imageKey,
      preco: parseFloat(preco),
      descricao,
      capacidadeTotal: Number(capacidadeTotal) || 0,
      membrosAtivos: Number(membrosAtivos) || 0,
      pedidosSaida: Number(pedidosSaida) || 0,
      subtitulo,
      acesso,
      tempoEntrega,
      confiabilidade,
      beneficios,
      fidelidade,
      regras,
      faq,
      linkOficial,
      adminNome,
      adminAvatar,
      adminSelos,
      participantes,
    };

    try {
      const res = await fetch('/api/grupos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Erro ao criar grupo.');

      const data = await res.json();

      if (imagemFile && data?._id) {
        setUploadingImg(true);
        const formData = new FormData();
        formData.append('groupId', data._id);
        formData.append('file', imagemFile);
        const uploadRes = await fetch('/api/upload/group-image', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData?.error || 'Erro ao enviar imagem');
        setCapa(uploadData.url);
        setImagemPreview(uploadData.url);
        if (uploadData.key) setImageKey(uploadData.key);
      }

      setMsg('Grupo criado com sucesso!');
      setTimeout(() => router.push('/admin/grupos'), 1500);
    } catch (error) {
      setMsg(error.message || 'Erro ao criar grupo.');
    }
    setCriando(false);
    setUploadingImg(false);
  };

  return (
    <>
      <Header admin />

      <main className="pt-[100px] min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
        <form onSubmit={handleCriar} className="bg-white p-6 rounded shadow max-w-2xl w-full space-y-4">
          <h2 className="text-xl font-bold mb-4">Novo Grupo</h2>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border">
              {imagemPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagemPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <i className="fa fa-users text-gray-500 text-xl" aria-hidden="true"></i>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImagemFile(file);
                    setImagemPreview(URL.createObjectURL(file));
                  }
                }}
                className="text-sm"
              />
              <p className="text-xs text-gray-500">Formatos: jpg, png, webp. Max 5MB.</p>
              {uploadingImg && <p className="text-xs text-blue-600">Enviando imagem...</p>}
            </div>
          </div>
          <input
            type="text"
            placeholder="Nome do grupo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-3 border rounded mb-4"
          />
          <input
            type="text"
            placeholder="Subtitulo (ex: Premium Anual - 2 TB)"
            value={subtitulo}
            onChange={(e) => setSubtitulo(e.target.value)}
            className="w-full p-3 border rounded mb-4"
          />
          <input
            type="text"
            placeholder="Mensalidade (ex: 29.90)"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            className="w-full p-3 border rounded mb-4"
          />
          <textarea
            placeholder="Descricao do grupo (beneficios, regras, etc.)"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full p-3 border rounded mb-4"
            rows={3}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              type="number"
              min="0"
              placeholder="Capacidade total (ex: 5)"
              value={capacidadeTotal}
              onChange={(e) => setCapacidadeTotal(e.target.value)}
              className="w-full p-3 border rounded"
            />
            <input
              type="number"
              min="0"
              placeholder="Membros ativos (ex: 4)"
              value={membrosAtivos}
              onChange={(e) => setMembrosAtivos(e.target.value)}
              className="w-full p-3 border rounded"
            />
            <input
              type="number"
              min="0"
              placeholder="Saidas agendadas"
              value={pedidosSaida}
              onChange={(e) => setPedidosSaida(e.target.value)}
              className="w-full p-3 border rounded"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Tipo de acesso (ex: Convite)"
              value={acesso}
              onChange={(e) => setAcesso(e.target.value)}
              className="w-full p-3 border rounded"
            />
            <input
              type="text"
              placeholder="Tempo estimado (ex: Ate 5 dias)"
              value={tempoEntrega}
              onChange={(e) => setTempoEntrega(e.target.value)}
              className="w-full p-3 border rounded"
            />
            <input
              type="text"
              placeholder="Confiabilidade (ex: Selo ouro)"
              value={confiabilidade}
              onChange={(e) => setConfiabilidade(e.target.value)}
              className="w-full p-3 border rounded"
            />
          </div>
          <textarea
            placeholder="Beneficios (1 por linha)"
            value={beneficios}
            onChange={(e) => setBeneficios(e.target.value)}
            className="w-full p-3 border rounded"
            rows={4}
          />
          <textarea
            placeholder="Fidelidade (1 por linha)"
            value={fidelidade}
            onChange={(e) => setFidelidade(e.target.value)}
            className="w-full p-3 border rounded"
            rows={3}
          />
          <textarea
            placeholder="Regras (1 por linha)"
            value={regras}
            onChange={(e) => setRegras(e.target.value)}
            className="w-full p-3 border rounded"
            rows={3}
          />
          <textarea
            placeholder="FAQ (Pergunta|Resposta em cada linha)"
            value={faq}
            onChange={(e) => setFaq(e.target.value)}
            className="w-full p-3 border rounded"
            rows={4}
          />
          <input
            type="text"
            placeholder="Link oficial do servico"
            value={linkOficial}
            onChange={(e) => setLinkOficial(e.target.value)}
            className="w-full p-3 border rounded"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome do administrador"
              value={adminNome}
              onChange={(e) => setAdminNome(e.target.value)}
              className="w-full p-3 border rounded"
            />
            <input
              type="text"
              placeholder="Avatar do admin (URL)"
              value={adminAvatar}
              onChange={(e) => setAdminAvatar(e.target.value)}
              className="w-full p-3 border rounded"
            />
          </div>
          <textarea
            placeholder="Selos do admin (1 por linha)"
            value={adminSelos}
            onChange={(e) => setAdminSelos(e.target.value)}
            className="w-full p-3 border rounded"
            rows={3}
          />
          <textarea
            placeholder="Participantes (1 nome por linha)"
            value={participantes}
            onChange={(e) => setParticipantes(e.target.value)}
            className="w-full p-3 border rounded"
            rows={3}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition disabled:bg-blue-300"
            disabled={criando}
          >
            {criando ? 'Criando...' : 'Criar'}
          </button>
          {msg && <p className="mt-4 text-red-600">{msg}</p>}
        </form>
      </main>
    </>
  );
}
