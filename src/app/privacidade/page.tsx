import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          Política de Privacidade
        </h1>
        <p className="text-sm text-slate-400 mb-8">Última atualização: Julho de 2026</p>

        <section className="space-y-6 text-slate-300">
          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">1. Coleta de Informações</h2>
            <p className="leading-relaxed">
              Nosso aplicativo coleta temporariamente dados públicos disponibilizados pela API do
              Instagram, tais como comentários em suas publicações, mensagens diretas (DMs) e
              respostas a Stories. Essas informações são processadas estritamente para executar as
              automações de respostas que você configurou.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">2. Uso dos Dados</h2>
            <p className="leading-relaxed">
              Os dados coletados são usados única e exclusivamente para verificar a presença de
              palavras-chave e acionar respostas automáticas via direct message (DM). Nós não
              compartilhamos, vendemos ou utilizamos seus dados ou dados dos seus clientes para fins
              publicitários ou com terceiros.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">3. Retenção de Dados</h2>
            <p className="leading-relaxed">
              Os eventos brutos recebidos via webhook do Instagram são mantidos de forma segura no
              nosso banco de dados para fins de depuração e auditoria por um período curto e são
              periodicamente removidos. Não armazenamos informações de perfil detalhadas além do
              ID do Instagram e do nome de usuário dos contatos envolvidos na interação.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">4. Seus Direitos</h2>
            <p className="leading-relaxed">
              Você ou seus usuários finais podem solicitar a remoção ou exclusão completa de todos os
              registros vinculados ao seu ID do Instagram a qualquer momento. Para isso, siga as
              instruções contidas na nossa página de Exclusão de Dados.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">5. Contato</h2>
            <p className="leading-relaxed">
              Se você tiver dúvidas sobre como tratamos as suas informações, entre em contato direto
              com o administrador do seu sistema de automações.
            </p>
          </div>
        </section>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <a
            href="/"
            className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm transition"
          >
            Voltar ao Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
