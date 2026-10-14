import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          Termos de Serviço
        </h1>
        <p className="text-sm text-slate-400 mb-8">Última atualização: 2026</p>

        <section className="space-y-6 text-slate-300">
          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">1. Aceitação dos Termos</h2>
            <p className="leading-relaxed">
              Ao acessar e utilizar o CreateFlow, você concorda em cumprir e estar vinculado a estes Termos de Serviço. O CreateFlow é uma plataforma de gestão de conteúdo e automação de engajamento social em conformidade com as diretrizes oficiais das plataformas integradas.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">2. Uso Autorizado</h2>
            <p className="leading-relaxed">
              O CreateFlow permite o agendamento de posts e o envio de respostas automatizadas a comentários e mensagens diretas em contas sociais autorizadas. O usuário compromete-se a não utilizar a ferramenta para envio de spam, conteúdo abusivo ou violação dos Termos da Meta, TikTok, X e LinkedIn.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">3. Privacidade e Proteção de Dados</h2>
            <p className="leading-relaxed">
              O tratamento de dados pessoais coletados via APIs segue rigorosamente nossa Política de Privacidade, em conformidade com a LGPD e GDPR.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">4. Contato</h2>
            <p className="leading-relaxed">
              Em caso de dúvidas sobre nossos Termos de Serviço, entre em contato pelo email de suporte do CreateFlow.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
