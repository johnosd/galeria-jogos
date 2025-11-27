
import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../../../components/Header';

const locked = true; // campos nao editaveis apos criacao

const DEFAULT_BENEFICIOS = [
  'Armazenamento 2 TB compartilhado',
  'Contas individuais preservam privacidade',
  'Pagamento mensal',
  'Grupo ja esta ativo',
  'Administrador confiavel',
  'Envio de acesso rapido',
];

const DEFAULT_REGRAS = ['Nao compartilhar senha', 'Nao postar em nome do administrador', 'Nao alterar senha'];
const DEFAULT_FAQ = [
  { pergunta: 'Quando terei acesso ao servico?', resposta: 'O acesso e enviado em ate 5 dias, normalmente no mesmo dia.' },
  { pergunta: 'Quais formas de pagamento?', resposta: 'Pix ou cartao pelos metodos do administrador do grupo.' },
  { pergunta: 'O que e caucao?', resposta: 'Valor de seguranca em casos especificos; avisaremos antes se for necessario.' },
  { pergunta: 'Com quem posso dividir assinaturas?', resposta: 'Apenas com membros aprovados pelo administrador do grupo.' },
];
const DEFAULT_SELOS = ['Mais de 1 grupo ativo', '+1 ano de plataforma', 'Envio rapido'];
const DEFAULT_PARTICIPANTES = ['Deyves', 'Luciene', 'Rafael', 'Nicholas'];

const parseList = (value, fallback = []) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split('\n').map((i) => i.trim()).filter(Boolean);
  return fallback;
};

const parseFaq = (value) => {
  if (Array.isArray(value)) return value.map((i) => ({ pergunta: i.pergunta || '', resposta: i.resposta || '' }));
  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((line) => line.split('|'))
      .filter((parts) => parts[0])
      .map(([pergunta, resposta]) => ({ pergunta: (pergunta || '').trim(), resposta: (resposta || '').trim() }));
  }
  return DEFAULT_FAQ;
};

const parseFidelidade = (value) => {
  const text = Array.isArray(value) ? value.join('\n') : value || '';
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  let periodo = '';
  let renovacao = true;
  let observacoes = '';
  lines.forEach((line) => {
    const lower = line.toLowerCase();
    if (lower.includes('periodo')) {
      const parts = line.split(':');
      periodo = parts.slice(1).join(':').trim() || line.replace(/periodo/i, '').trim();
    } else if (lower.includes('sem renovacao')) {
      renovacao = false;
    } else if (lower.includes('renovacao')) {
      renovacao = true;
    } else {
      observacoes = observacoes ? `${observacoes}\n${line}` : line;
    }
  });
  if (!periodo) periodo = '12 meses';
  return { periodo, renovacao, observacoes };
};

const toParticipantes = (value) => {
  const nomes = parseList(value, DEFAULT_PARTICIPANTES);
  return nomes.map((nome) => ({
    nome,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}`,
  }));
};
export default function EditarGrupo({ grupo }) {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [nome, setNome] = useState(grupo.nome || '');
  const [capa, setCapa] = useState(grupo.imageUrl || grupo.capa || '');
  const [imagemPreview, setImagemPreview] = useState(grupo.imageUrl || grupo.capa || '');
  const [imagemFile, setImagemFile] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [imageKey, setImageKey] = useState(grupo.imageKey || '');
  const [preco, setPreco] = useState(grupo.preco || '');
  const [descricao, setDescricao] = useState(grupo.descricao || '');
  const [capacidadeTotal, setCapacidadeTotal] = useState(grupo.capacidadeTotal ?? '');
  const [membrosAtivos, setMembrosAtivos] = useState(grupo.membrosAtivos ?? '');
  const [pedidosSaida, setPedidosSaida] = useState(grupo.pedidosSaida ?? '');
  const [subtitulo, setSubtitulo] = useState(grupo.subtitulo || '');
  const [acesso, setAcesso] = useState(grupo.acesso || 'Convite');
  const [tempoEntrega, setTempoEntrega] = useState(grupo.tempoEntrega || 'Ate 5 dias (geralmente mais rapido)');
  const [confiabilidade, setConfiabilidade] = useState(grupo.confiabilidade || 'Selo ouro');
  const [beneficios, setBeneficios] = useState(parseList(grupo.beneficios, DEFAULT_BENEFICIOS));
  const fidelidadeParsed = parseFidelidade(grupo.fidelidade);
  const [fidelidadePeriodo, setFidelidadePeriodo] = useState(fidelidadeParsed.periodo);
  const [fidelidadeRenovacao, setFidelidadeRenovacao] = useState(fidelidadeParsed.renovacao);
  const [fidelidadeObservacoes, setFidelidadeObservacoes] = useState(fidelidadeParsed.observacoes);
  const [regras, setRegras] = useState(parseList(grupo.regras, DEFAULT_REGRAS));
  const [faq, setFaq] = useState(parseFaq(grupo.faq));
  const [linkOficial, setLinkOficial] = useState(grupo.linkOficial || 'https://one.google.com/');
  const [adminNome, setAdminNome] = useState(grupo.admin?.nome || 'Isabela');
  const [adminAvatar, setAdminAvatar] = useState(grupo.admin?.avatar || 'https://i.pravatar.cc/160?img=47');
  const [adminSelos, setAdminSelos] = useState(parseList(grupo.admin?.selos, DEFAULT_SELOS));
  const [participantes, setParticipantes] = useState(toParticipantes(grupo.participantes));
  const [msg, setMsg] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [errors, setErrors] = useState({});

  const vagasDisponiveis = useMemo(() => {
    const cap = Number(capacidadeTotal) || 0;
    const ativos = Number(membrosAtivos) || 0;
    return Math.max(cap - ativos, 0);
  }, [capacidadeTotal, membrosAtivos]);

  const validarUrl = (url) => /^https?:\/\/[\w.-]+(\/[\w\-./?%&=]*)?$/.test((url || '').trim());

  const validateForm = () => {
    const novoErrors = {};
    if (!nome.trim()) novoErrors.nome = 'Nome e obrigatorio.';
    if (preco === '' || Number.isNaN(Number(preco))) novoErrors.preco = 'Informe apenas numeros.';
    const cap = Number(capacidadeTotal);
    const ativos = Number(membrosAtivos);
    if (Number.isNaN(cap)) novoErrors.capacidadeTotal = 'Capacidade deve ser numero.';
    if (Number.isNaN(ativos)) novoErrors.membrosAtivos = 'Membros ativos deve ser numero.';
    if (!Number.isNaN(cap) && !Number.isNaN(ativos) && cap < ativos) novoErrors.membrosAtivos = 'Ativos nao podem exceder a capacidade.';
    if (!linkOficial || !validarUrl(linkOficial)) novoErrors.linkOficial = 'Informe uma URL valida (http/https).';
    const beneficiosValidos = beneficios.some((b) => b.trim());
    if (!beneficiosValidos) novoErrors.beneficios = 'Adicione pelo menos 1 beneficio.';
    const regrasValidas = regras.some((r) => r.trim());
    if (!regrasValidas) novoErrors.regras = 'Adicione pelo menos 1 regra.';
    const adminSelosValidos = adminSelos.some((s) => s.trim());
    if (!adminSelosValidos) novoErrors.adminSelos = 'Adicione pelo menos 1 selo.';
    const participantesValidos = participantes.some((p) => p.nome.trim());
    if (!participantesValidos) novoErrors.participantes = 'Adicione pelo menos 1 participante.';
    if (!faq.length || faq.some((item) => !item.pergunta.trim() || !item.resposta.trim())) novoErrors.faq = 'Preencha pergunta e resposta.';
    if (imagemFile && imagemFile.size > 5 * 1024 * 1024) novoErrors.imagem = 'Imagem deve ter ate 5MB.';
    if (imagemFile && !['image/png', 'image/jpeg', 'image/webp'].includes(imagemFile.type)) novoErrors.imagem = 'Use JPG, PNG ou WebP.';
    if (!adminNome.trim()) novoErrors.adminNome = 'Nome do admin e obrigatorio.';
    if (adminAvatar && !validarUrl(adminAvatar)) novoErrors.adminAvatar = 'Avatar deve ser URL valida.';
    if (!descricao.trim()) novoErrors.descricao = 'Descricao e obrigatoria.';
    if (!subtitulo.trim()) novoErrors.subtitulo = 'Subtitulo e obrigatorio.';
    setErrors(novoErrors);
    return Object.keys(novoErrors).length === 0;
  };
  const handleUploadImagem = async (file) => {
    const selecionado = file || imagemFile;
    if (!selecionado) {
      setMsg('Selecione uma imagem antes de enviar.');
      return;
    }
    setUploadingImg(true);
    setMsg('');
    const formData = new FormData();
    formData.append('groupId', grupo._id);
    formData.append('file', selecionado);
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
      setSucesso('Imagem atualizada com sucesso!');
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
      setSucesso('Imagem removida.');
    } catch (error) {
      setMsg(error.message || 'Erro ao remover imagem');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, imagem: 'Imagem deve ter ate 5MB.' }));
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setErrors((prev) => ({ ...prev, imagem: 'Use JPG, PNG ou WebP.' }));
      return;
    }
    setErrors((prev) => ({ ...prev, imagem: undefined }));
    setImagemFile(file);
    setImagemPreview(URL.createObjectURL(file));
    handleUploadImagem(file);
  };

  const handleAtualizar = async (e) => {
    e.preventDefault();
    setMsg('');
    setSucesso('');
    const valido = validateForm();
    if (!valido) return;
    setSalvando(true);

    const beneficiosText = beneficios.map((b) => b.trim()).filter(Boolean).join('\n');
    const fidelidadeText = [
      fidelidadePeriodo ? `Periodo: ${fidelidadePeriodo}` : '',
      fidelidadeRenovacao ? 'Renovacao automatica' : 'Sem renovacao automatica',
      fidelidadeObservacoes.trim(),
    ]
      .filter(Boolean)
      .join('\n');
    const regrasText = regras.map((r) => r.trim()).filter(Boolean).join('\n');
    const faqText = faq
      .filter((f) => f.pergunta.trim() && f.resposta.trim())
      .map((f) => `${f.pergunta.trim()}|${f.resposta.trim()}`)
      .join('\n');
    const participantesText = participantes.map((p) => p.nome.trim()).filter(Boolean).join('\n');
    const adminSelosText = adminSelos.map((s) => s.trim()).filter(Boolean).join('\n');

    const payload = {
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
      beneficios: beneficiosText,
      fidelidade: fidelidadeText,
      regras: regrasText,
      faq: faqText,
      linkOficial,
      adminNome,
      adminAvatar,
      adminSelos: adminSelosText,
      participantes: participantesText,
    };

    try {
      const res = await fetch(`/api/grupos/${grupo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Erro ao atualizar grupo');

      setSucesso('Grupo atualizado com sucesso!');
      setTimeout(() => router.push('/admin/grupos'), 1500);
    } catch (error) {
      setMsg(error.message || 'Erro ao atualizar grupo');
    } finally {
      setSalvando(false);
      setUploadingImg(false);
    }
  };

  const adicionarItem = (setter, lista, valor) => {
    if (valor === '') {
      setter([...lista, '']);
      return;
    }
    if (!valor.trim()) return;
    setter([...lista, valor.trim()]);
  };

  const removerItem = (setter, lista, index) => {
    setter(lista.filter((_, i) => i !== index));
  };

  const atualizarFaq = (index, campo, valor) => {
    setFaq((prev) => prev.map((item, i) => (i === index ? { ...item, [campo]: valor } : item)));
  };

  const adicionarFaq = () => setFaq([...faq, { pergunta: '', resposta: '' }]);
  const removerFaq = (index) => setFaq(faq.filter((_, i) => i !== index));

  const adicionarParticipante = (nomeNovo) => {
    if (!nomeNovo.trim()) return;
    setParticipantes([
      ...participantes,
      { nome: nomeNovo.trim(), avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nomeNovo.trim())}` },
    ]);
  };

  const removerParticipante = (index) => setParticipantes(participantes.filter((_, i) => i !== index));

  const inputBaseClass = 'w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition';
  const labelClass = 'text-sm font-semibold text-gray-800 flex items-center gap-2';
  const sectionClass = 'bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100 space-y-4';
  const errorClass = 'text-xs text-red-600 mt-1';
  const helperClass = 'text-xs text-gray-500 mt-1';
  return (
    <>
      <Header admin />

      <main className="pt-[100px] min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Editar grupo</h1>
            <p className="text-gray-600">Atualize os dados do grupo. Campos com * sao obrigatorios.</p>
          </header>

          <form onSubmit={handleAtualizar} className="space-y-6" aria-label="Formulario de edicao de grupo">
            <section className={sectionClass} aria-labelledby="identidade-heading">
              <div className="flex items-center gap-2">
                <span role="img" aria-hidden="true">
                  ??
                </span>
                <h2 id="identidade-heading" className="text-lg font-semibold text-gray-900">
                  Identidade do grupo
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
                    {imagemPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imagemPreview} alt="Preview da imagem do grupo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-sm">Preview</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                      aria-label="Selecionar imagem do grupo"
                      disabled={uploadingImg}
                    >
                      {uploadingImg ? 'Enviando...' : 'Alterar imagem'}
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoverImagem}
                      className="px-4 py-2 rounded bg-gray-200 text-gray-800 text-sm font-semibold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white"
                      disabled={uploadingImg}
                    >
                      Remover
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  />
                  <p className={helperClass}>JPG/PNG/WebP, ate 5MB.</p>
                  {errors.imagem && <p className={errorClass}>{errors.imagem}</p>}
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="nome" className={labelClass}>
                      Nome do grupo *
                    </label>
                    <input
                      id="nome"
                      aria-required="true"
                      aria-invalid={!!errors.nome}
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className={`${inputBaseClass} ${errors.nome ? 'border-red-500' : 'border-gray-200'}`}
                      maxLength={80}
                      disabled={locked}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Nome visivel na listagem. (nao editavel)</span>
                      <span>{nome.length}/80</span>
                    </div>
                    {errors.nome && <p className={errorClass}>{errors.nome}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="subtitulo" className={labelClass}>
                        Subtitulo *
                      </label>
                      <input
                        id="subtitulo"
                        aria-required="true"
                        aria-invalid={!!errors.subtitulo}
                        value={subtitulo}
                        onChange={(e) => setSubtitulo(e.target.value)}
                        className={`${inputBaseClass} ${errors.subtitulo ? 'border-red-500' : 'border-gray-200'}`}
                        maxLength={120}
                        disabled={locked}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Ex.: Premium Anual - 2 TB. (nao editavel)</span>
                        <span>{subtitulo.length}/120</span>
                      </div>
                      {errors.subtitulo && <p className={errorClass}>{errors.subtitulo}</p>}
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="descricao" className={labelClass}>
                        Descricao *
                      </label>
                      <textarea
                        id="descricao"
                        aria-required="true"
                        aria-invalid={!!errors.descricao}
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        className={`${inputBaseClass} ${errors.descricao ? 'border-red-500' : 'border-gray-200'}`}
                        rows={3}
                        maxLength={240}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Resumo curto do que o grupo oferece.</span>
                        <span>{descricao.length}/240</span>
                      </div>
                      {errors.descricao && <p className={errorClass}>{errors.descricao}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className={sectionClass} aria-labelledby="assinatura-heading">
              <div className="flex items-center gap-2">
                <span role="img" aria-hidden="true">💳</span>
                <h2 id="assinatura-heading" className="text-lg font-semibold text-gray-900">
                  Informacoes da assinatura
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className={labelClass}>Mensalidade (R$)</p>
                  <p className="text-2xl font-bold text-green-700">R$ {preco}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className={labelClass}>Tempo estimado de entrega</p>
                  <p className="text-gray-800 font-semibold">{tempoEntrega}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className={labelClass}>Tipo de acesso</p>
                  <p className="text-gray-800 font-semibold">{acesso}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className={labelClass}>Capacidade total</p>
                  <p className="text-gray-800 font-semibold">{capacidadeTotal}</p>
                  <p className={helperClass}>Nao editavel apos criacao.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className={labelClass}>Membros ativos</p>
                  <p className="text-gray-800 font-semibold">{membrosAtivos}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className={labelClass}>Vagas disponiveis</p>
                  <p className="text-gray-800 font-semibold">{vagasDisponiveis}</p>
                  <p className={helperClass}>Calculado automaticamente (capacidade - ativos).</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className={labelClass}>Confiabilidade / selo</p>
                  <p className="text-gray-800 font-semibold">{confiabilidade}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className={labelClass}>Saidas agendadas</p>
                  <p className="text-gray-800 font-semibold">{pedidosSaida}</p>
                </div>
              </div>
            </section>
            <section className={sectionClass} aria-labelledby="conteudos-heading">
              <div className="flex items-center gap-2">
                <span role="img" aria-hidden="true">📦</span>
                <h2 id="conteudos-heading" className="text-lg font-semibold text-gray-900">
                  Conteudos do grupo
                </h2>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Beneficios *</label>
                  <button
                    type="button"
                    onClick={() => adicionarItem(setBeneficios, beneficios, '')}
                    className="text-sm text-blue-600 hover:underline"
                    aria-label="Adicionar beneficio"
                    disabled={locked}
                  >
                    + adicionar
                  </button>
                </div>
                <div className="space-y-2">
                  {beneficios.map((b, idx) => (
                    <div key={`beneficio-${idx}`} className="flex items-center gap-2">
                      <input
                        aria-label={`Beneficio ${idx + 1}`}
                        value={b}
                        onChange={(e) => setBeneficios(beneficios.map((item, i) => (i === idx ? e.target.value : item)))}
                        className={`${inputBaseClass} ${errors.beneficios ? 'border-red-500' : 'border-gray-200'}`}
                        disabled={locked}
                      />
                      <button
                        type="button"
                        onClick={() => removerItem(setBeneficios, beneficios, idx)}
                        className="px-3 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200"
                        aria-label="Remover beneficio"
                        disabled={locked}
                      >
                        ?
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => adicionarItem(setBeneficios, beneficios, 'Novo beneficio')}
                    className="text-sm text-blue-600 hover:underline"
                    disabled={locked}
                  >
                    + adicionar beneficio
                  </button>
                  {errors.beneficios && <p className={errorClass}>{errors.beneficios}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label htmlFor="fidelidade-periodo" className={labelClass}>
                    Fidelidade - periodo
                  </label>
                  <input
                    id="fidelidade-periodo"
                    value={fidelidadePeriodo}
                    onChange={(e) => setFidelidadePeriodo(e.target.value)}
                    className={`${inputBaseClass} border-gray-200`}
                    maxLength={60}
                    disabled={locked}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Renovacao automatica</label>
                  <div className="flex items-center gap-2">
                    <input
                      id="renovacao"
                      type="checkbox"
                      checked={fidelidadeRenovacao}
                      onChange={(e) => setFidelidadeRenovacao(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <label htmlFor="renovacao" className="text-sm text-gray-700">
                      Ativar
                    </label>
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="fidelidade-observacoes" className={labelClass}>
                    Observacoes
                  </label>
                  <input
                    id="fidelidade-observacoes"
                    value={fidelidadeObservacoes}
                    onChange={(e) => setFidelidadeObservacoes(e.target.value)}
                    className={`${inputBaseClass} border-gray-200`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Regras *</label>
                  <button
                    type="button"
                    onClick={() => adicionarItem(setRegras, regras, '')}
                    className="text-sm text-blue-600 hover:underline"
                    aria-label="Adicionar regra"
                    disabled={locked}
                  >
                    + adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {regras.map((regra, idx) => (
                    <div key={`regra-${idx}`} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full">
                      <input
                        aria-label={`Regra ${idx + 1}`}
                        value={regra}
                        onChange={(e) => setRegras(regras.map((item, i) => (i === idx ? e.target.value : item)))}
                        className="bg-transparent focus:outline-none text-sm w-40"
                        disabled={locked}
                      />
                      <button
                        type="button"
                        onClick={() => removerItem(setRegras, regras, idx)}
                        className="text-gray-600 hover:text-gray-900"
                        aria-label="Remover regra"
                        disabled={locked}
                      >
                        ?
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => adicionarItem(setRegras, regras, 'Nova regra')}
                  className="text-sm text-blue-600 hover:underline"
                  disabled={locked}
                >
                  + adicionar regra
                </button>
                {errors.regras && <p className={errorClass}>{errors.regras}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="linkOficial" className={labelClass}>
                  Link oficial do servico *
                </label>
                <input
                  id="linkOficial"
                  aria-required="true"
                  aria-invalid={!!errors.linkOficial}
                  value={linkOficial}
                  onChange={(e) => setLinkOficial(e.target.value)}
                  className={`${inputBaseClass} ${errors.linkOficial ? 'border-red-500' : 'border-gray-200'}`}
                  disabled={locked}
                />
                <p className={helperClass}>URL completa (http/https).</p>
                {errors.linkOficial && <p className={errorClass}>{errors.linkOficial}</p>}
              </div>
            </section>

            <section className={sectionClass} aria-labelledby="admin-heading">
              <div className="flex items-center gap-2">
                <span role="img" aria-hidden="true">👑</span>
                <h2 id="admin-heading" className="text-lg font-semibold text-gray-900">
                  Administrador
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={adminAvatar || 'https://ui-avatars.com/api/?name=Admin'} alt="Avatar admin" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm text-gray-600">Pre-visualizacao do avatar.</p>
                  <p className="text-base font-semibold text-gray-900 text-center break-words">{adminNome}</p>
                  <p className="text-xs text-gray-500 break-all text-center">{adminAvatar}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2 lg:col-span-2">
                  <p className={labelClass}>Selos do administrador</p>
                  <div className="flex flex-wrap gap-2">
                    {adminSelos.map((selo, idx) => (
                      <span
                        key={`selo-${idx}`}
                        className="bg-white border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-800"
                      >
                        {selo}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            <section className={sectionClass} aria-labelledby="participantes-heading">
              <div className="flex items-center gap-2">
                <span role="img" aria-hidden="true">🧑‍🤝‍🧑</span>
                <h2 id="participantes-heading" className="text-lg font-semibold text-gray-900">
                  Participantes
                </h2>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className={labelClass}>Lista de participantes</p>
                <div className="flex flex-wrap gap-3">
                  {participantes.map((p, idx) => (
                    <div key={`participante-${idx}`} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.avatar} alt={`Avatar de ${p.nome}`} className="w-8 h-8 rounded-full" />
                      <span className="text-sm">{p.nome}</span>
                      <button
                        type="button"
                        onClick={() => removerParticipante(idx)}
                        className="text-gray-600 hover:text-gray-900"
                        aria-label={`Remover ${p.nome}`}
                      >
                        ?
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {errors.participantes && <p className={errorClass}>{errors.participantes}</p>}
            </section>

            <section className={sectionClass} aria-labelledby="faq-heading">
              <div className="flex items-center gap-2">
                <span role="img" aria-hidden="true">❓</span>
                <h2 id="faq-heading" className="text-lg font-semibold text-gray-900">
                  FAQ
                </h2>
              </div>
              <div className="space-y-4">
                {faq.map((item, idx) => (
                  <div key={`faq-${idx}`} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="space-y-1">
                      <label className={labelClass}>Pergunta *</label>
                      <input
                        aria-required="true"
                        value={item.pergunta}
                        onChange={(e) => atualizarFaq(idx, 'pergunta', e.target.value)}
                        className={`${inputBaseClass} ${errors.faq ? 'border-red-500' : 'border-gray-200'}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Resposta *</label>
                      <input
                        aria-required="true"
                        value={item.resposta}
                        onChange={(e) => atualizarFaq(idx, 'resposta', e.target.value)}
                        className={`${inputBaseClass} ${errors.faq ? 'border-red-500' : 'border-gray-200'}`}
                      />
                    </div>
                    <div className="sm:col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removerFaq(idx)}
                        className="text-sm text-red-600 hover:underline"
                        aria-label="Remover pergunta"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={adicionarFaq} className="text-sm text-blue-600 hover:underline">
                  + adicionar pergunta
                </button>
                {errors.faq && <p className={errorClass}>{errors.faq}</p>}
              </div>
            </section>

            <div className="sticky bottom-0 bg-gray-50 py-4 border-t border-gray-200">
              <div className="max-w-5xl mx-auto">
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition disabled:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  disabled={salvando}
                  aria-busy={salvando}
                >
                  {salvando ? 'Salvando...' : 'Atualizar grupo'}
                </button>
                {sucesso && <p className="mt-3 text-green-700 text-sm">{sucesso}</p>}
                {msg && !sucesso && <p className="mt-3 text-red-600 text-sm">{msg}</p>}
              </div>
            </div>
          </form>
        </div>
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


