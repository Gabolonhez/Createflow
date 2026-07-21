'use client';

import React, { useState } from 'react';
import {
  Settings,
  Power,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  Link,
  MessageSquare,
  AlertTriangle,
  LogOut,
  RefreshCw,
  Search,
  Image,
  FileText,
  Check,
  X,
} from 'lucide-react';

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
import {
  disconnectInstagramAction,
  getInstagramOAuthUrlAction,
  saveAutomationAction,
  deleteAutomationAction,
  toggleAutomationAction,
} from './actions';

interface Automation {
  id?: string;
  name: string;
  active: boolean;
  trigger_comment: boolean;
  trigger_story: boolean;
  trigger_dm: boolean;
  keywords: string[];
  match_type: 'contains' | 'exact' | 'any';
  post_id: string | null;
  post_permalink: string | null;
  post_media_url: string | null;
  public_replies: string[];
  welcome_dm: string;
  quick_reply_button: string | null;
  link_text: string | null;
  link_button_label: string | null;
  link_url: string | null;
  reminder_text: string | null;
  reminder_delay_minutes: number | null;
}

interface DashboardProps {
  config: any;
  automations: Automation[];
  mediaList: any[];
  stats: {
    totalContacts: number;
    pendingQueue: number;
    sentMessages: number;
    failedMessages: number;
  };
  connectedParam?: boolean;
  errorParam?: string;
}

export default function Dashboard({
  config,
  automations,
  mediaList,
  stats,
  connectedParam,
  errorParam,
}: DashboardProps) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [currentMediaList, setCurrentMediaList] = useState<any[]>(mediaList);
  
  // Estado do formulário de automação
  const [formState, setFormState] = useState<Automation>({
    name: '',
    active: true,
    trigger_comment: true,
    trigger_story: false,
    trigger_dm: false,
    keywords: [],
    match_type: 'contains',
    post_id: null,
    post_permalink: null,
    post_media_url: null,
    public_replies: [],
    welcome_dm: '',
    quick_reply_button: '',
    link_text: '',
    link_button_label: '',
    link_url: '',
    reminder_text: '',
    reminder_delay_minutes: null,
  });

  const [rawKeywords, setRawKeywords] = useState('');
  const [rawPublicReplies, setRawPublicReplies] = useState('');

  const handleConnect = async () => {
    setLoading(true);
    try {
      const url = await getInstagramOAuthUrlAction();
      window.location.href = url;
    } catch (e: any) {
      alert(`Erro ao obter URL de autenticação: ${e.message}`);
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (confirm('Tem certeza de que deseja desconectar sua conta do Instagram? As automações pararão de funcionar.')) {
      setLoading(true);
      try {
        await disconnectInstagramAction();
      } catch (e: any) {
        alert(e.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await toggleAutomationAction(id, active);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir esta automação permanentemente?')) {
      try {
        await deleteAutomationAction(id);
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  const handleOpenNew = () => {
    setFormState({
      name: '',
      active: true,
      trigger_comment: true,
      trigger_story: false,
      trigger_dm: false,
      keywords: [],
      match_type: 'contains',
      post_id: null,
      post_permalink: null,
      post_media_url: null,
      public_replies: [],
      welcome_dm: '',
      quick_reply_button: '',
      link_text: '',
      link_button_label: '',
      link_url: '',
      reminder_text: '',
      reminder_delay_minutes: null,
    });
    setRawKeywords('');
    setRawPublicReplies('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (auto: Automation) => {
    setFormState({ ...auto });
    setRawKeywords(auto.keywords.join(', '));
    setRawPublicReplies(auto.public_replies.join('\n'));
    setIsModalOpen(true);
  };

  const handleSelectMedia = (media: any) => {
    setFormState((prev) => ({
      ...prev,
      post_id: media.id,
      post_permalink: media.permalink,
      post_media_url: media.media_url || media.thumbnail_url,
    }));
    setIsMediaSelectorOpen(false);
  };

  const handleClearMedia = () => {
    setFormState((prev) => ({
      ...prev,
      post_id: null,
      post_permalink: null,
      post_media_url: null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formState,
        keywords: rawKeywords,
        public_replies: rawPublicReplies,
      };
      await saveAutomationAction(payload);
      setIsModalOpen(false);
    } catch (e: any) {
      alert(`Erro ao salvar: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* HEADER */}
      <header className="border-b border-slate-900 bg-slate-950/80 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-2 rounded-xl text-white shadow-lg">
              <Instagram className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                InstaFlow
              </span>
              <span className="text-xs block text-slate-500 font-medium">Automação Própria</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {config ? (
              <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-full py-1.5 pl-3 pr-4 shadow-inner">
                {config.profile_picture_url ? (
                  <img
                    src={config.profile_picture_url}
                    alt={config.instagram_username}
                    className="h-7 w-7 rounded-full object-cover border border-indigo-500"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                    {config.instagram_username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-semibold text-slate-300">
                  @{config.instagram_username}
                </span>
                <button
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="text-slate-500 hover:text-red-400 transition"
                  title="Desconectar Instagram"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={loading}
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/10 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
              >
                <Instagram className="h-4 w-4" />
                Conectar Instagram
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* PARAMS NOTIFICATIONS */}
        {connectedParam && (
          <div className="bg-emerald-950/30 border border-emerald-800/50 text-emerald-400 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">InstaFlow conectado com sucesso ao seu Instagram!</p>
          </div>
        )}
        {errorParam && (
          <div className="bg-red-950/30 border border-red-800/50 text-red-400 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">Ocorreu um erro: {decodeURIComponent(errorParam)}</p>
          </div>
        )}

        {/* STATUS CARD */}
        {config && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Janela de 24h</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{stats.totalContacts}</span>
                <span className="text-slate-500 text-xs">Contatos ativos</span>
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Fila Pendente</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-indigo-400">{stats.pendingQueue}</span>
                <span className="text-slate-500 text-xs">Aguardando envio</span>
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Mensagens Enviadas</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-400">{stats.sentMessages}</span>
                <span className="text-slate-500 text-xs">DMs processadas</span>
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Falhas</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-rose-400">{stats.failedMessages}</span>
                <span className="text-slate-500 text-xs">Erros registrados</span>
              </div>
            </div>
          </div>
        )}

        {/* MAIN AUTOMATIONS PANEL */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Minhas Automações</h2>
              <p className="text-slate-400 text-sm">Gerencie os gatilhos e fluxos do seu assistente do Instagram.</p>
            </div>
            
            {config && (
              <button
                onClick={handleOpenNew}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95 self-start"
              >
                <Plus className="h-4 w-4" />
                Nova Automação
              </button>
            )}
          </div>

          {!config ? (
            <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="bg-slate-900 p-4 rounded-full text-indigo-500">
                <Instagram className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">Instagram Não Conectado</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Para começar a automatizar seus comentários, Stories e DMs, você precisa conectar sua conta do Instagram Profissional.
              </p>
              <button
                onClick={handleConnect}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition shadow-lg active:scale-95"
              >
                Conectar agora
              </button>
            </div>
          ) : automations.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="bg-slate-900 p-4 rounded-full text-slate-500">
                <Settings className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">Nenhuma Automação Criada</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Crie sua primeira automação para que as pessoas possam receber seu link ao comentar palavras-chave.
              </p>
              <button
                onClick={handleOpenNew}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition active:scale-95"
              >
                Criar Automação
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {automations.map((auto) => (
                <div
                  key={auto.id}
                  className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-white text-base leading-none">{auto.name}</h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          auto.active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {auto.active ? 'Ativo' : 'Pausado'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {auto.trigger_comment && (
                        <span className="bg-slate-800/80 text-slate-400 px-2.5 py-1 rounded-md border border-slate-700">
                          💬 Comentários
                        </span>
                      )}
                      {auto.trigger_story && (
                        <span className="bg-slate-800/80 text-slate-400 px-2.5 py-1 rounded-md border border-slate-700">
                          📸 Stories
                        </span>
                      )}
                      {auto.trigger_dm && (
                        <span className="bg-slate-800/80 text-slate-400 px-2.5 py-1 rounded-md border border-slate-700">
                          ✉️ DMs diretas
                        </span>
                      )}
                    </div>

                    <div className="text-slate-300 text-sm font-medium">
                      Palavras-chave:{' '}
                      <span className="text-indigo-400">
                        {auto.match_type === 'any' ? 'Qualquer mensagem' : auto.keywords.join(', ')}
                      </span>{' '}
                      <span className="text-slate-500 text-xs">({auto.match_type})</span>
                    </div>

                    {auto.post_id && auto.post_permalink && (
                      <a
                        href={auto.post_permalink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-400 hover:underline flex items-center gap-1.5 mt-1"
                      >
                        <Link className="h-3 w-3" />
                        Publicação específica vinculada
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-3 border-t md:border-t-0 border-slate-800/80 pt-4 md:pt-0 self-stretch md:self-auto justify-end">
                    <button
                      onClick={() => handleToggle(auto.id!, !auto.active)}
                      className={`p-2 rounded-xl transition ${
                        auto.active
                          ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                          : 'text-slate-500 bg-slate-800 hover:bg-slate-700'
                      }`}
                      title={auto.active ? 'Pausar' : 'Ativar'}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleOpenEdit(auto)}
                      className="p-2 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl transition"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(auto.id!)}
                      className="p-2 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* FORM DRAWER/MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 md:p-8 flex flex-col justify-between shadow-2xl space-y-6">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {formState.id ? 'Editar Automação' : 'Criar Automação'}
                  </h3>
                  <p className="text-xs text-slate-400">Configure os gatilhos e a resposta da sua campanha.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white transition p-1 bg-slate-800 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Nome */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Nome da Automação *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="Ex: Campanha de Lançamento Ebook"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* 2. Gatilhos */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Gatilhos de Disparo
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <label
                      className={`flex flex-col items-center gap-2 p-3 border rounded-xl cursor-pointer select-none transition ${
                        formState.trigger_comment
                          ? 'border-indigo-500 bg-indigo-500/5 text-indigo-400'
                          : 'border-slate-800 bg-slate-950/40 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formState.trigger_comment}
                        onChange={(e) =>
                          setFormState({ ...formState, trigger_comment: e.target.checked })
                        }
                        className="hidden"
                      />
                      <MessageSquare className="h-5 w-5" />
                      <span className="text-xs font-medium">Comentário</span>
                    </label>

                    <label
                      className={`flex flex-col items-center gap-2 p-3 border rounded-xl cursor-pointer select-none transition ${
                        formState.trigger_story
                          ? 'border-indigo-500 bg-indigo-500/5 text-indigo-400'
                          : 'border-slate-800 bg-slate-950/40 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formState.trigger_story}
                        onChange={(e) =>
                          setFormState({ ...formState, trigger_story: e.target.checked })
                        }
                        className="hidden"
                      />
                      <Image className="h-5 w-5" />
                      <span className="text-xs font-medium">Stories</span>
                    </label>

                    <label
                      className={`flex flex-col items-center gap-2 p-3 border rounded-xl cursor-pointer select-none transition ${
                        formState.trigger_dm
                          ? 'border-indigo-500 bg-indigo-500/5 text-indigo-400'
                          : 'border-slate-800 bg-slate-950/40 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formState.trigger_dm}
                        onChange={(e) =>
                          setFormState({ ...formState, trigger_dm: e.target.checked })
                        }
                        className="hidden"
                      />
                      <Instagram className="h-5 w-5" />
                      <span className="text-xs font-medium">Mensagem</span>
                    </label>
                  </div>
                </div>

                {/* 3. Seletor de post específico se Comentário ativo */}
                {formState.trigger_comment && (
                  <div className="space-y-2 p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Restringir a um Post específico?
                      </span>
                      {formState.post_id ? (
                        <button
                          type="button"
                          onClick={handleClearMedia}
                          className="text-xs text-rose-400 hover:underline"
                        >
                          Limpar seleção
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsMediaSelectorOpen(true)}
                          className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <Search className="h-3 w-3" />
                          Selecionar Post
                        </button>
                      )}
                    </div>

                    {formState.post_id ? (
                      <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-lg border border-slate-800 mt-2">
                        {formState.post_media_url ? (
                          <img
                            src={formState.post_media_url}
                            alt="Post selecionado"
                            className="h-12 w-12 rounded object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-slate-800 flex items-center justify-center rounded">
                            <Image className="h-5 w-5 text-slate-500" />
                          </div>
                        )}
                        <div className="flex-1 overflow-hidden">
                          <span className="text-xs text-slate-400 block font-semibold">Post Selecionado</span>
                          <span className="text-xs text-slate-500 truncate block">
                            ID: {formState.post_id}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1">
                        Deixe vazio para acionar em qualquer publicação da sua conta.
                      </p>
                    )}
                  </div>
                )}

                {/* 4. Palavras-chave */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Palavras-chave *
                    </label>
                    <select
                      value={formState.match_type}
                      onChange={(e: any) =>
                        setFormState({ ...formState, match_type: e.target.value })
                      }
                      className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2 py-1 text-slate-300"
                    >
                      <option value="contains">Contém</option>
                      <option value="exact">Exato</option>
                      <option value="any">Qualquer mensagem</option>
                    </select>
                  </div>
                  {formState.match_type !== 'any' && (
                    <input
                      type="text"
                      required
                      value={rawKeywords}
                      onChange={(e) => setRawKeywords(e.target.value)}
                      placeholder="Ex: ebook, quero, link (separadas por vírgula)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                    />
                  )}
                </div>

                {/* 5. Mensagem de boas-vindas */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Mensagem de Boas-vindas (DM) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formState.welcome_dm}
                    onChange={(e) => setFormState({ ...formState, welcome_dm: e.target.value })}
                    placeholder="Olá! Obrigado pelo interesse. Toque no botão abaixo para receber o material."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition resize-none"
                  />
                </div>

                {/* 6. Botão de resposta rápida */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Rótulo do Botão de Resposta Rápida (Abre a janela de 24h)
                  </label>
                  <input
                    type="text"
                    value={formState.quick_reply_button || ''}
                    onChange={(e) =>
                      setFormState({ ...formState, quick_reply_button: e.target.value })
                    }
                    placeholder="Ex: Enviar link!"
                    maxLength={20}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <p className="text-xs text-slate-500">
                    Importante: A Meta exige que o usuário responda/interaja para podermos enviar links. O clique neste botão conta como resposta.
                  </p>
                </div>

                {/* 7. Link de Destino (Texto + Rótulo + URL) */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-4">
                  <h4 className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
                    <Link className="h-4 w-4 text-indigo-400" />
                    Mensagem subsequente com Link
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Texto da mensagem
                      </label>
                      <input
                        type="text"
                        value={formState.link_text || ''}
                        onChange={(e) => setFormState({ ...formState, link_text: e.target.value })}
                        placeholder="Ex: Aqui está seu link especial de acesso!"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Rótulo do botão
                      </label>
                      <input
                        type="text"
                        value={formState.link_button_label || ''}
                        onChange={(e) =>
                          setFormState({ ...formState, link_button_label: e.target.value })
                        }
                        placeholder="Ex: Baixar Ebook"
                        maxLength={20}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        URL do link
                      </label>
                      <input
                        type="url"
                        value={formState.link_url || ''}
                        onChange={(e) => setFormState({ ...formState, link_url: e.target.value })}
                        placeholder="https://meusite.com/download"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* 8. Lembrete (Reminder) */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-4">
                  <h4 className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-indigo-400" />
                    Lembrete de Acompanhamento (Opcional)
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Mensagem do lembrete
                      </label>
                      <textarea
                        rows={2}
                        value={formState.reminder_text || ''}
                        onChange={(e) => setFormState({ ...formState, reminder_text: e.target.value })}
                        placeholder="Ex: Vi que você ainda não baixou o ebook. Caso tenha dúvidas, me mande uma mensagem!"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition resize-none"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Atraso para envio (minutos)
                      </label>
                      <input
                        type="number"
                        value={formState.reminder_delay_minutes || ''}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            reminder_delay_minutes: e.target.value ? parseInt(e.target.value, 10) : null,
                          })
                        }
                        placeholder="Ex: 15"
                        min={1}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* 9. Respostas Públicas de Comentários */}
                {formState.trigger_comment && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Variações de Resposta Pública (Uma por linha)
                    </label>
                    <textarea
                      rows={3}
                      value={rawPublicReplies}
                      onChange={(e) => setRawPublicReplies(e.target.value)}
                      placeholder="Te enviei o link no direct!&#10;Dá uma olhada nas suas DMs!&#10;Acabei de enviar, confere o direct!"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition resize-none"
                    />
                    <p className="text-xs text-slate-500">
                      O sistema sorteará uma dessas respostas de forma aleatória para responder ao comentário de forma natural no seu post.
                    </p>
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <div className="border-t border-slate-800 pt-6 flex items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition text-sm font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition text-sm active:scale-95 disabled:opacity-50"
                  >
                    {loading ? 'Salvando...' : 'Salvar Automação'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* INSTAGRAM MEDIA SELECTOR MODAL */}
      {isMediaSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-white">Selecionar Publicação</h4>
                <p className="text-xs text-slate-500">Escolha o post ou reels em que deseja ativar o gatilho.</p>
              </div>
              <button
                onClick={() => setIsMediaSelectorOpen(false)}
                className="text-slate-400 hover:text-white transition p-1 bg-slate-800 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              {currentMediaList.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Instagram className="h-8 w-8 text-slate-600 mx-auto" />
                  <p className="text-sm text-slate-400">Nenhum post recente encontrado ou conta desconectada.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {currentMediaList.map((media) => (
                    <div
                      key={media.id}
                      onClick={() => handleSelectMedia(media)}
                      className="group aspect-square relative rounded-xl overflow-hidden border border-slate-800 cursor-pointer bg-slate-950 hover:border-indigo-500 transition"
                    >
                      {media.thumbnail_url || media.media_url ? (
                        <img
                          src={media.thumbnail_url || media.media_url}
                          alt={media.caption || 'Instagram Post'}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-500">
                          <Image className="h-6 w-6" />
                        </div>
                      )}
                      
                      {/* CAPTION HOVER */}
                      <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-2 transition duration-200">
                        <p className="text-[10px] text-white line-clamp-3 leading-tight font-medium">
                          {media.caption || '(Sem legenda)'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950/50 border-t border-slate-800 text-right">
              <button
                onClick={() => setIsMediaSelectorOpen(false)}
                className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white transition rounded-lg text-xs font-semibold"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
