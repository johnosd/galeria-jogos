import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { FaWhatsapp, FaUsers, FaClock, FaShieldAlt, FaCrown, FaCheckCircle, FaExternalLinkAlt } from 'react-icons/fa';
import Header from '../../components/Header';

const DEFAULT_CONTENT = {
  nome: 'Google One',
  subtitulo: 'Premium Anual - 2 TB',
  descricao: 'Armazenamento compartilhado com contas individuais preservando privacidade e espaco garantido.',
  preco: 10.44,
  confiabilidade: 'Selo ouro',
  tempoEntrega: 'Ate 5 dias (geralmente mais rapido)',
  acesso: 'Convite',
  vagas: { total: 6, ocupadas: 5 },
  admin: {
    nome: 'Isabela',
    avatar: 'https://i.pravatar.cc/160?img=47',
    selos: ['Mais de 1 grupo ativo', '+1 ano de plataforma', 'Envio rapido'],
  },
  participantes: [
    { nome: 'Deyves', avatar: 'https://i.pravatar.cc/120?img=15' },
    { nome: 'Luciene', avatar: 'https://i.pravatar.cc/120?img=32' },
    { nome: 'Rafael', avatar: 'https://i.pravatar.cc/120?img=3' },
    { nome: 'Nicholas', avatar: 'https://i.pravatar.cc/120?img=8' },
  ],
  beneficios: [
    'Armazenamento 2 TB compartilhado',
    'Contas individuais preservam privacidade',
    'Pagamento mensal',
    'Grupo ja esta ativo',
    'Administrador confiavel',
    'Envio de acesso rapido',
  ],
  fidelidade: [
    'Compromisso de 12 meses',
    'Cancelamento nao permitido durante fidelidade',
    'Renovacao automatica',
    'Proxima renovacao: 22/05/2026',
  ],
  regras: ['Nao compartilhar senha', 'Nao postar em nome do administrador', 'Nao alterar senha'],
  faq: [
    { pergunta: 'Quando terei acesso ao servico?', resposta: 'O acesso e enviado em ate 5 dias, normalmente no mesmo dia.' },
    { pergunta: 'Quais formas de pagamento?', resposta: 'Pix ou cartao pelos metodos do administrador do grupo.' },
    { pergunta: 'O que e caucao?', resposta: 'Valor de seguranca em casos especificos; avisaremos antes se for necessario.' },
    { pergunta: 'Com quem posso dividir assinaturas?', resposta: 'Apenas com membros aprovados pelo administrador do grupo.' },
  ],
  linkOficial: 'https://one.google.com/',
};

function calcularStatusGrupo(grupo) {
  const capacidadeBase = grupo.capacidadeTotal ?? grupo.membrosAtivos ?? DEFAULT_CONTENT.vagas.total;
  const capacidadeNum = Number(capacidadeBase);
  const membrosAtivos = Number(grupo.membrosAtivos ?? DEFAULT_CONTENT.vagas.ocupadas);
  const capacidade = Number.isFinite(capacidadeNum) && capacidadeNum > 0 ? capacidadeNum : membrosAtivos;
  const vagasDisponiveis = Math.max(capacidade - membrosAtivos, 0);
  return { capacidade, membrosAtivos, vagasDisponiveis };
}

export default function GrupoDetalhe({ grupo }) {
  const dados = grupo || {};
  const { capacidade, membrosAtivos, vagasDisponiveis } = useMemo(() => calcularStatusGrupo(dados), [dados]);

  const nome = dados.nome || DEFAULT_CONTENT.nome;
  const preco = Number.isFinite(Number(dados.preco)) ? Number(dados.preco) : DEFAULT_CONTENT.preco;
  const descricao = dados.descricao || DEFAULT_CONTENT.descricao;
  const capa = dados.capa || '';

  const titulo = `${nome} ${dados.subtitulo ? `- ${dados.subtitulo}` : DEFAULT_CONTENT.subtitulo}`;
  const acesso = dados.acesso || DEFAULT_CONTENT.acesso;
  const tempoEntrega = dados.tempoEntrega || DEFAULT_CONTENT.tempoEntrega;
  const confiabilidade = dados.confiabilidade || DEFAULT_CONTENT.confiabilidade;
  const beneficios = Array.isArray(dados.beneficios) && dados.beneficios.length ? dados.beneficios : DEFAULT_CONTENT.beneficios;
  const fidelidade = Array.isArray(dados.fidelidade) && dados.fidelidade.length ? dados.fidelidade : DEFAULT_CONTENT.fidelidade;
  const regras = Array.isArray(dados.regras) && dados.regras.length ? dados.regras : DEFAULT_CONTENT.regras;
  const faq = Array.isArray(dados.faq) && dados.faq.length ? dados.faq : DEFAULT_CONTENT.faq;
  const linkOficial = dados.linkOficial || DEFAULT_CONTENT.linkOficial;
  const adminNome = dados.admin?.nome || DEFAULT_CONTENT.admin.nome;
  const adminAvatar = dados.admin?.avatar || DEFAULT_CONTENT.admin.avatar;
  const adminSelos = Array.isArray(dados.admin?.selos) && dados.admin?.selos.length ? dados.admin.selos : DEFAULT_CONTENT.admin.selos;
  const participantes =
    Array.isArray(dados.participantes) && dados.participantes.length
      ? dados.participantes.map((item, idx) =>
          typeof item === 'string'
            ? { nome: item, avatar: `https://i.pravatar.cc/120?img=${(idx % 70) + 1}` }
            : { nome: item?.nome || `Membro ${idx + 1}`, avatar: item?.avatar || `https://i.pravatar.cc/120?img=${(idx % 70) + 1}` }
        )
      : DEFAULT_CONTENT.participantes;

  const whatsappLink = `https://wa.me/5511997383948?text=${encodeURIComponent(
    `Ola! Quero entrar no grupo de assinatura: ${nome}`
  )}`;
  const flowQuery = `?grupoId=${dados._id || dados.id || ''}&nome=${encodeURIComponent(nome)}&preco=${encodeURIComponent(
    preco
  )}`;

  return (
    <>
      <Header />
      <main className="bg-gray-50 text-gray-900">
        <section className="pt-[110px] pb-10 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-[1.6fr_1fr] gap-6 items-start">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 relative overflow-hidden">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md overflow-hidden">
                    {capa ? (
                      <Image
                        src={capa}
                        alt={nome}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <i className="fa fa-cloud" aria-hidden="true"></i>
                    )}
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-wide text-blue-700 font-semibold">Grupo de assinatura</p>
                    <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">{titulo}</h1>
                  </div>
                </div>

                <p className="text-gray-700 text-sm md:text-base">{descricao}</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <HeroStat icon={<FaCheckCircle />} label="Confiabilidade" value={confiabilidade} />
                  <HeroStat icon={<FaUsers />} label="Vagas restantes" value={`${vagasDisponiveis || 0} de ${capacidade}`} emphasis />
                  <HeroStat icon={<FaClock />} label="Entrega" value={tempoEntrega} />
                  <HeroStat icon={<FaShieldAlt />} label="Acesso" value={acesso} />
                  <HeroStat icon={<FaCrown />} label="Admin" value={adminNome} />
                  <HeroStat icon={<FaExternalLinkAlt />} label="Plano" value={dados.subtitulo || 'Plano anual'} />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-3xl font-extrabold text-gray-900">
                    R$ {preco.toFixed(2)}
                    <span className="text-sm text-gray-600 font-semibold ml-1">/mes</span>
                  </div>
                  <Badge text={vagasDisponiveis > 0 ? 'Vagas disponiveis' : 'Ultimas vagas'} variant={vagasDisponiveis > 0 ? 'success' : 'warning'} />
                  <Badge text="Convite seguro" variant="info" />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-blue-700 transition"
                  >
                    <FaWhatsapp /> Entrar no grupo
                  </Link>
                  <Link href="/" className="text-blue-700 font-semibold hover:underline">
                    Ver outros grupos
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white rounded-2xl shadow-xl p-6 md:p-8 flex flex-col gap-4">
                <p className="text-sm uppercase tracking-wide text-blue-100 font-semibold">Resumo rapido</p>
                <h2 className="text-2xl font-bold leading-snug">Acesso garantido com supervisao de administrador verificado</h2>
                <p className="text-blue-100 text-sm">
                  Confianca e seguranca para entrar no grupo com suporte dedicado e acompanhamento na entrega do acesso.
                </p>
                <div className="bg-white/15 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Vagas restantes</p>
                    <p className="text-3xl font-extrabold">{vagasDisponiveis || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm">Plano</p>
                    <p className="text-lg font-semibold">{dados.subtitulo || 'Google One 2 TB'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Mensalidade</p>
                    <p className="text-2xl font-bold text-gray-900">R$ {preco.toFixed(2)}</p>
                  </div>
                  <Badge text="CTA em destaque" variant="info" />
                </div>
                <p className="text-sm text-gray-700">Pagamento mensal, renovacao automatica e acompanhamento do acesso pelo administrador.</p>
                <Link
                  href={`/assinatura/relacionamento${flowQuery}`}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold shadow hover:bg-green-700 transition"
                >
                  <FaWhatsapp /> Assinar
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-12">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[2fr_1fr] gap-8">
            <div className="space-y-6">
              <CardSection title="Beneficios de participar">
                <div className="grid sm:grid-cols-2 gap-4">
                  {beneficios.map((item) => (
                    <div key={item} className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                      <span className="text-blue-600 mt-1">
                        <FaCheckCircle />
                      </span>
                      <p className="text-gray-800 text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </CardSection>

              <CardSection title="Preco e disponibilidade">
                <div className="grid md:grid-cols-3 gap-4">
                  <InfoCard label="Preco" value={`R$ ${preco.toFixed(2)}/mes`} />
                  <InfoCard label="Vagas restantes" value={`${vagasDisponiveis || 0} de ${capacidade}`} />
                  <InfoCard label="Tipo de acesso" value={acesso} />
                  <InfoCard label="Renovacao" value={dados.subtitulo || 'Anual do plano Google One'} />
                  <InfoCard label="Status" value={vagasDisponiveis > 0 ? 'Aberto' : 'Ultimas vagas'} />
                </div>
              </CardSection>

              <CardSection title="Fidelidade do grupo">
                <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
                  {fidelidade.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardSection>

              <CardSection title="Regras do grupo">
                <ol className="list-decimal pl-5 space-y-2 text-gray-800 text-sm">
                  {regras.map((regra) => (
                    <li key={regra}>{regra}</li>
                  ))}
                </ol>
              </CardSection>

              <CardSection title="FAQ">
                <div className="space-y-3">
                  {faq.map(({ pergunta, resposta }) => (
                    <details
                      key={pergunta}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 group open:shadow-md transition"
                    >
                      <summary className="cursor-pointer font-semibold text-gray-900 flex items-center justify-between">
                        {pergunta}
                        <span className="text-blue-600 group-open:rotate-45 transition-transform">+</span>
                      </summary>
                      <p className="text-gray-700 text-sm mt-2">{resposta}</p>
                    </details>
                  ))}
                </div>
              </CardSection>
            </div>

            <div className="space-y-6">
              <CardSection title="Administrador">
                <div className="flex items-center gap-4">
                  <Image
                    src={adminAvatar}
                    alt={adminNome}
                    width={72}
                    height={72}
                    className="rounded-full object-cover shadow"
                    unoptimized
                  />
                  <div>
                    <p className="text-lg font-bold">{adminNome}</p>
                    <p className="text-sm text-amber-600 font-semibold">{confiabilidade}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {adminSelos.map((selo, idx) => {
                    const label = typeof selo === 'string' ? selo : selo.label;
                    const icon = typeof selo === 'object' && selo.icon ? selo.icon : 'fa-circle-check';
                    return (
                      <span
                        key={`${label}-${idx}`}
                        title={label}
                        className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 text-xs font-semibold px-3 py-2 rounded-full"
                      >
                        <i className={`fa ${icon}`} aria-hidden="true"></i>
                        {label}
                      </span>
                    );
                  })}
                </div>
              </CardSection>

              <CardSection title="Participantes">
                <div className="flex flex-wrap gap-3">
                  {participantes.map((pessoa) => (
                    <div key={pessoa.nome} className="flex items-center gap-2 bg-white rounded-full border border-gray-100 shadow-sm px-3 py-2">
                      <Image
                        src={pessoa.avatar}
                        alt={pessoa.nome}
                        width={36}
                        height={36}
                        className="rounded-full object-cover"
                        unoptimized
                      />
                      <span className="text-sm font-medium text-gray-800">{pessoa.nome}</span>
                    </div>
                  ))}
                </div>
              </CardSection>

              <CardSection title="Outras informacoes">
                <div className="space-y-2 text-sm text-gray-700">
                  <p>Link oficial do servico:</p>
                  <Link href={linkOficial} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-semibold hover:underline break-all">
                    {linkOficial}
                  </Link>
                </div>
              </CardSection>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white shadow-2xl border-t border-gray-200 px-4 py-3 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-600">Entrar no grupo</p>
            <p className="text-lg font-bold text-gray-900">R$ {preco.toFixed(2)}/mes</p>
          </div>
          <Link
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-full font-semibold shadow hover:bg-blue-700 transition"
          >
            <FaWhatsapp /> Entrar
          </Link>
        </div>
      </div>
    </>
  );
}

function HeroStat({ icon, label, value, emphasis = false }) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 flex items-start gap-3">
      <span className={`text-blue-600 mt-1 ${emphasis ? 'text-lg' : ''}`}>{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-base font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function CardSection({ title, children }) {
  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Badge({ text, variant = 'info' }) {
  const variants = {
    info: 'bg-blue-50 text-blue-700 border border-blue-100',
    success: 'bg-green-50 text-green-700 border border-green-100',
    warning: 'bg-amber-50 text-amber-700 border border-amber-100',
  };
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variants[variant] || variants.info}`}>{text}</span>;
}

export async function getServerSideProps({ params }) {
  const { id } = params;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/grupos/${id}`);
    if (!res.ok) {
      return { props: { grupo: null } };
    }
    const grupo = await res.json();
    return { props: { grupo } };
  } catch (error) {
    return { props: { grupo: null } };
  }
}
