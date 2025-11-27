import { useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../../../components/Header';

export default function EditarGrupo({ grupo }) {
  const router = useRouter();
  const [nome, setNome] = useState(grupo.nome);
  const [capa, setCapa] = useState(grupo.imageUrl || grupo.capa);
  const [imagemPreview, setImagemPreview] = useState(grupo.imageUrl || grupo.capa || '');
  const [imagemFile, setImagemFile] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [imageKey, setImageKey] = useState(grupo.imageKey || '');
  const [preco, setPreco] = useState(grupo.preco);
  const [descricao, setDescricao] = useState(grupo.descricao || '');
  const [capacidadeTotal, setCapacidadeTotal] = useState(grupo.capacidadeTotal ?? '');
  const [membrosAtivos, setMembrosAtivos] = useState(grupo.membrosAtivos ?? '');
  const [pedidosSaida, setPedidosSaida] = useState(grupo.pedidosSaida ?? '');
  const [subtitulo, setSubtitulo] = useState(grupo.subtitulo || '');
  const [acesso, setAcesso] = useState(grupo.acesso || 'Convite');
  const [tempoEntrega, setTempoEntrega] = useState(grupo.tempoEntrega || 'Ate 5 dias (geralmente mais rapido)');
  const [confiabilidade, setConfiabilidade] = useState(grupo.confiabilidade || 'Selo ouro');

  const listToText = (lista) => (Array.isArray(lista) ? lista.join('\n') : '');
  const faqToText = (lista) =>
    Array.isArray(lista)
      ? lista
          .map((item) => {
            if (item?.pergunta && item?.resposta) return `${item.pergunta}|${item.resposta}`;
            return '';
          })
          .filter(Boolean)
          .join('\n')
      : '';

  const [beneficios, setBeneficios] = useState(
    listToText(grupo.beneficios) ||
      'Armazenamento 2 TB compartilhado\nContas individuais preservam privacidade\nPagamento mensal\nGrupo ja esta ativo\nAdministrador confiavel\nEnvio de acesso rapido'
  );
  const [fidelidade, setFidelidade] = useState(
    listToText(grupo.fidelidade) ||
      'Compromisso de 12 meses\nCancelamento nao permitido durante fidelidade\nRenovacao automatica\nProxima renovacao: 22/05/2026'
  );
  const [regras, setRegras] = useState(
    listToText(grupo.regras) || 'Nao compartilhar senha\nNao postar em nome do administrador\nNao alterar senha'
  );
  const [faq, setFaq] = useState(
    faqToText(grupo.faq) ||
      'Quando terei acesso ao servico?|O acesso e enviado em ate 5 dias, normalmente no mesmo dia.\nQuais formas de pagamento?|Pix ou cartao pelos metodos do administrador do grupo.\nO que e caucao?|Valor de seguranca em casos especificos; avisaremos antes se for necessario.\nCom quem posso dividir assinaturas?|Apenas com membros aprovados pelo administrador do grupo.'
  );
  const [linkOficial, setLinkOficial] = useState(grupo.linkOficial || 'https://one.google.com/');
  const [adminNome, setAdminNome] = useState(grupo.admin?.nome || 'Isabela');
  const [adminAvatar, setAdminAvatar] = useState(grupo.admin?.avatar || 'https://i.pravatar.cc/160?img=47');
  const [adminSelos, setAdminSelos] = useState(listToText(grupo.admin?.selos) || 'Mais de 1 grupo ativo\n+1 ano de plataforma\nEnvio rapido');
  const [participantes, setParticipantes] = useState(listToText(grupo.participantes) || 'Deyves\nLuciene\nRafael\nNicholas');
  const [msg, setMsg] = useState('');

  const handleUploadImagem = async () => {
    if (!imagemFile) {
      setMsg('Selecione uma imagem antes de enviar.');
      return;
    }
    setUploadingImg(true);
    setMsg('');
    const formData = new FormData();
    formData.append('groupId', grupo._id);
    formData.append('file', imagemFile);
    try {
      const res = await fetch('/api/upload/group-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao enviar imagem');
      setCapa(data.url);
      setImagemPreview(data.url);
      if (data.key) setImageKey(data.key);
      setMsg('Imagem atualizada com sucesso!');
    } catch (error) {
      setMsg(error.message || 'Erro ao enviar imagem');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleRemoverImagem = async () => {
    setUploadingImg(true);
    setMsg('');
    try {
      const res = await fetch('/api/upload/remove-group-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: grupo._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao remover imagem');
      setCapa('');
      setImagemPreview('');
      setImageKey('');
      setMsg('Imagem removida.');
    } catch (error) {
      setMsg(error.message || 'Erro ao remover imagem');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleAtualizar = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/grupos/${grupo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          capa,
          preco: parseFloat(preco),
          descricao,
          capacidadeTotal: Number(capacidadeTotal) || 0,
          membrosAtivos: Number(membrosAtivos) || 0,
          pedidosSaida: Number(pedidosSaida) || 0,
          imageUrl: capa,
          imageKey,
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
        }),
      });

      if (!res.ok) throw new Error('Erro ao atualizar grupo');

      setMsg('Grupo atualizado com sucesso!');
      setTimeout(() => router.push('/admin/grupos'), 1500);
    } catch (error) {
      setMsg('Erro ao atualizar grupo');
    }
  };

  return (
    <>
      <Header admin />
      <main className="pt-[100px] min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
        <form onSubmit={handleAtualizar} className="bg-white p-6 rounded shadow max-w-2xl w-full space-y-4">
          <h2 className="text-xl font-bold mb-4">Editar Grupo</h2>
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
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleUploadImagem}
                  disabled={uploadingImg}
                  className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {uploadingImg ? 'Enviando...' : 'Alterar imagem'}
                </button>
                <button
                  type="button"
                  onClick={handleRemoverImagem}
                  disabled={uploadingImg}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-800 text-sm font-semibold hover:bg-gray-300 disabled:bg-gray-100"
                >
                  Remover
                </button>
              </div>
              <p className="text-xs text-gray-500">Formatos: jpg, png, webp. Max 5MB.</p>
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
            placeholder="Subtitulo"
            value={subtitulo}
            onChange={(e) => setSubtitulo(e.target.value)}
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
            placeholder="Mensalidade (ex: 120.00)"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            className="w-full p-3 border rounded mb-4"
          />
          <textarea
            placeholder="Descricao do grupo"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full p-3 border rounded mb-4"
            rows={3}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              type="number"
              min="0"
              placeholder="Capacidade total"
              value={capacidadeTotal}
              onChange={(e) => setCapacidadeTotal(e.target.value)}
              className="w-full p-3 border rounded"
            />
            <input
              type="number"
              min="0"
              placeholder="Membros ativos"
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
            className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
          >
            Atualizar
          </button>
          {msg && <p className="mt-4 text-green-600">{msg}</p>}
        </form>
      </main>
    </>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/grupos/${id}`);
  if (!res.ok) {
    return {
      notFound: true,
    };
  }

  const grupo = await res.json();

  return {
    props: { grupo },
  };
}
