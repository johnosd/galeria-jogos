import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { FaWhatsapp, FaUsers, FaClock, FaShieldAlt, FaCrown, FaCheckCircle, FaExternalLinkAlt } from 'react-icons/fa';
import Header from '../../components/Header';

const DEFAULT_CONTENT = {
  nome: 'Google One',
  subtitulo: 'Premium Anual – 2 TB',
  descricao: 'Armazenamento compartilhado com contas individuais preservando sua privacidade e espaço garantido.',
  preco: 10.44,
  confiabilidade: 'Selo ouro',
  tempoEntrega: 'Até 5 dias (geralmente mais rápido)',
  acesso: 'Convite',
  vagas: { total: 6, ocupadas: 5 },
  admin: {
    nome: 'Isabela',
    avatar: 'https://i.pravatar.cc/160?img=47',
    selos: [
      { label: 'Mais de 1 grupo ativo', icon: 'fa-circle-check' },
      { label: '+1 ano de plataforma', icon: 'fa-award' },
      { label: 'Envio rápido', icon: 'fa-bolt' },
    ],
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
    'Grupo já está ativo',
    'Administrador confiável',
    'Envio de acesso rápido',
  ],
  fidelidade: [
    'Compromisso de 12 meses',
    'Cancelamento não permitido durante fidelidade',
    'Renovação automática',
    'Próxima renovação: 22/05/2026',
  ],
  regras: ['Não compartilhar senha', 'Não postar em nome do administrador', 'Não alterar senha'],
  faq: [
    { pergunta: 'Quando terei acesso ao serviço?', resposta: 'O acesso é enviado em até 5 dias, normalmente no mesmo dia.' },
    { pergunta: 'Quais formas de pagamento?', resposta: 'Pix ou cartão pelos métodos do administrador do grupo.' },
    { pergunta: 'O que é caução?', resposta: 'Valor de segurança em casos específicos; avisaremos antes se for necessário.' },
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

  const titulo = `${nome} ${dados.subtitulo ? `– ${dados.subtitulo}` : DEFAULT_CONTENT.subtitulo}`;
  const acesso = DEFAULT_CONTENT.acesso;
  const tempoEntrega = DEFAULT_CONTENT.tempoEntrega;
  const confiabilidade = DEFAULT_CONTENT.confiabilidade;

  const whatsappLink = `https://wa.me/5511997383948?text=${encodeURIComponent(
    `Olá! Quero entrar no grupo de assinatura: ${nome}`
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
                  <HeroStat icon={<FaCrown />} label="Admin" value={DEFAULT_CONTENT.admin.nome} />
                  <HeroStat icon={<FaExternalLinkAlt />} label="Plano" value="Google One Anual" />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-3xl font-extrabold text-gray-900">
                    R$ {preco.toFixed(2)}
                    <span className="text-sm text-gray-600 font-semibold ml-1">/mês</span>
                  </div>
                  <Badge text={vagasDisponiveis > 0 ? 'Vagas disponíveis' : 'Últimas vagas'} variant={vagasDisponiveis > 0 ? 'success' : 'warning'} />
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
                <p className="text-sm uppercase tracking-wide text-blue-100 font-semibold">Resumo rápido</p>
                <h2 className="text-2xl font-bold leading-snug">Acesso garantido com supervisão de administrador verificado</h2>
                <p className="text-blue-100 text-sm">
                  Confiança e segurança para entrar no grupo com suporte dedicado e acompanhamento na entrega do acesso.
                </p>
                <div className="bg-white/15 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Vagas restantes</p>
                    <p className="text-3xl font-extrabold">{vagasDisponiveis || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm">Plano</p>
                    <p className="text-lg font-semibold">Google One 2 TB</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Mensalidade</p>
                    <p className="text-2xl font-bold text-gray-900">R$ {preco.toFixed(2)}</p>
                  </div>
                  <Badge text="Hero CTA" variant="info" />
                </div>
                <p className="text-sm text-gray-700">Pagamento mensal, renovação automática e acompanhamento do acesso pelo administrador.</p>
                <Link
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold shadow hover:bg-green-700 transition"
                >
                  <FaWhatsapp /> Falar no WhatsApp
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-12">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[2fr_1fr] gap-8">
            <div className="space-y-6">
              <CardSection title="Benefícios de participar">
                <div className="grid sm:grid-cols-2 gap-4">
                  {DEFAULT_CONTENT.beneficios.map((item) => (
                    <div key={item} className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                      <span className="text-blue-600 mt-1">
                        <FaCheckCircle />
                      </span>
                      <p className="text-gray-800 text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </CardSection>

              <CardSection title="Preço e disponibilidade">
                <div className="grid md:grid-cols-3 gap-4">
                  <InfoCard label="Preço" value={`R$ ${preco.toFixed(2)}/mês`} />
                  <InfoCard label="Vagas restantes" value={`${vagasDisponiveis || 0} de ${capacidade}`} />
                  <InfoCard label="Tipo de acesso" value="Convite" />
                  <InfoCard label="Renovação" value="Anual do plano Google One" />
                  <InfoCard label="Status" value={vagasDisponiveis > 0 ? 'Aberto' : 'Últimas vagas'} />
                </div>
              </CardSection>

              <CardSection title="Fidelidade do grupo">
                <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
                  {DEFAULT_CONTENT.fidelidade.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardSection>

              <CardSection title="Regras do grupo">
                <ol className="list-decimal pl-5 space-y-2 text-gray-800 text-sm">
                  {DEFAULT_CONTENT.regras.map((regra) => (
                    <li key={regra}>{regra}</li>
                  ))}
                </ol>
              </CardSection>

              <CardSection title="FAQ">
                <div className="space-y-3">
                  {DEFAULT_CONTENT.faq.map(({ pergunta, resposta }) => (
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
                    src={DEFAULT_CONTENT.admin.avatar}
                    alt={DEFAULT_CONTENT.admin.nome}
                    width={72}
                    height={72}
                    className="rounded-full object-cover shadow"
                    unoptimized
                  />
                  <div>
                    <p className="text-lg font-bold">{DEFAULT_CONTENT.admin.nome}</p>
                    <p className="text-sm text-amber-600 font-semibold">Selo ouro</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {DEFAULT_CONTENT.admin.selos.map((selo) => (
                    <span
                      key={selo.label}
                      title={selo.label}
                      className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 text-xs font-semibold px-3 py-2 rounded-full"
                    >
                      <i className={`fa ${selo.icon}`} aria-hidden="true"></i>
                      {selo.label}
                    </span>
                  ))}
                </div>
              </CardSection>

              <CardSection title="Participantes">
                <div className="flex flex-wrap gap-3">
                  {DEFAULT_CONTENT.participantes.map((pessoa) => (
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

              <CardSection title="Outras informações">
                <div className="space-y-2 text-sm text-gray-700">
                  <p>Link oficial do serviço:</p>
                  <Link href={DEFAULT_CONTENT.linkOficial} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-semibold hover:underline break-all">
                    {DEFAULT_CONTENT.linkOficial}
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
            <p className="text-lg font-bold text-gray-900">R$ {preco.toFixed(2)}/mês</p>
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
