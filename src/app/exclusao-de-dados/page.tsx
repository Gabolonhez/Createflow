import React from 'react';

export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          Instruções de Exclusão de Dados
        </h1>
        <p className="text-sm text-slate-400 mb-8">Última atualização: Julho de 2026</p>

        <section className="space-y-6 text-slate-300">
          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">Como remover seu acesso e dados</h2>
            <p className="leading-relaxed mb-4">
              Nós valorizamos a sua privacidade e fornecemos uma maneira simples para que você possa
              solicitar a exclusão completa de todos os seus dados armazenados em nossa plataforma
              associados à sua conta do Instagram.
            </p>
            <p className="leading-relaxed">
              De acordo com as regras da Meta para aplicativos de terceiros, você pode solicitar a
              exclusão de suas informações seguindo os passos abaixo:
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">Passo a Passo para Exclusão</h2>
            <ol className="list-decimal list-inside space-y-3 leading-relaxed pl-2">
              <li>
                Acesse o seu perfil do Instagram e vá em <strong>Configurações e Privacidade</strong>.
              </li>
              <li>
                Clique em <strong>Permissões de Sites e Apps</strong> ou <strong>Apps e sites</strong>.
              </li>
              <li>
                Localize este aplicativo de automação na lista e clique em <strong>Remover</strong>.
              </li>
              <li>
                Para remover os registros de conversas/comentários de nosso banco de dados, envie um
                e-mail para o administrador do aplicativo (ou utilize nosso formulário de contato)
                solicitando a exclusão dos dados com o seu <strong>nome de usuário do Instagram</strong>.
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">O que acontece depois?</h2>
            <p className="leading-relaxed">
              Uma vez solicitada a exclusão ou removido o aplicativo nas configurações do seu
              Instagram, nossa integração deixará de receber quaisquer novos eventos seus.
              Dentro do prazo de 48 horas úteis, todos os registros relacionados ao seu ID do
              Instagram nas tabelas de contatos, eventos e fila de envio serão deletados de forma
              permanente do nosso banco de dados.
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
