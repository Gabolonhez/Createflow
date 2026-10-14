'use client';

import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import { InstagramLogo, TikTokLogo } from './BrandIcons';
import type { SocialConversation, DmAutomationPlatform } from '@/types';

interface DmInboxViewProps {
  conversations: SocialConversation[];
  onSendMessage: (conversationId: string, text: string) => Promise<void>;
}

export function DmInboxView({ conversations, onSendMessage }: DmInboxViewProps) {
  const [platformFilter, setPlatformFilter] = useState<'all' | DmAutomationPlatform>('all');
  const [search, setSearch] = useState('');
  const [activeConvId, setActiveConvId] = useState<string>(
    conversations[0]?.id || ''
  );
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (platformFilter !== 'all' && c.platform !== platformFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchUser = c.participantUsername.toLowerCase().includes(q);
        const matchName = c.participantName.toLowerCase().includes(q);
        const matchMsg = c.lastMessageText.toLowerCase().includes(q);
        if (!matchUser && !matchName && !matchMsg) return false;
      }
      return true;
    });
  }, [conversations, platformFilter, search]);

  const activeConversation = useMemo(() => {
    return (
      conversations.find((c) => c.id === activeConvId) ||
      filteredConversations[0] ||
      null
    );
  }, [conversations, activeConvId, filteredConversations]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !activeConversation) return;
    setIsSending(true);
    try {
      await onSendMessage(activeConversation.id, draft.trim());
      setDraft('');
    } finally {
      setIsSending(false);
    }
  };

  const quickTemplates = [
    'Obrigado pelo contato! Segue o link com acesso liberado:',
    'Qualquer dúvida sobre a configuração, estou à disposição!',
    'Pode testar à vontade e me dar seu feedback!',
  ];

  return (
    <div className="flex-1 flex min-h-0 bg-[#0a0a0c] overflow-hidden">
      {/* Left Column: Conversations List */}
      <div className="w-80 sm:w-96 border-r border-white/[0.07] flex flex-col min-h-0 bg-[#0a0a0d] shrink-0">
        {/* Inbox Header */}
        <div className="p-4 border-b border-white/[0.07] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-indigo-400" />
              <h2 className="text-sm font-bold text-white tracking-tight">
                Inbox Social Unificada
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Janela 24h Meta
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversas..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Platform Filter Tabs */}
          <div className="flex items-center p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.07]">
            <button
              type="button"
              onClick={() => setPlatformFilter('all')}
              className={`flex-1 py-1 rounded text-[11px] font-medium transition-all ${
                platformFilter === 'all'
                  ? 'bg-white/15 text-white'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setPlatformFilter('instagram')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-all ${
                platformFilter === 'instagram'
                  ? 'bg-pink-600/25 text-pink-300'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              <InstagramLogo className="size-3" />
              Instagram
            </button>
            <button
              type="button"
              onClick={() => setPlatformFilter('tiktok')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-all ${
                platformFilter === 'tiktok'
                  ? 'bg-cyan-600/25 text-cyan-300'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              <TikTokLogo className="size-3" />
              TikTok
            </button>
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-white/40 font-mono">
              Nenhuma conversa encontrada.
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = activeConversation?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveConvId(c.id)}
                  className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600/10 border-l-2 border-indigo-500'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="size-9 rounded-full bg-cover bg-center border border-white/[0.1] bg-zinc-800"
                      style={
                        c.participantAvatar
                          ? { backgroundImage: `url(${c.participantAvatar})` }
                          : undefined
                      }
                    />
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 size-4 rounded-full flex items-center justify-center border border-black ${
                        c.platform === 'instagram' ? 'bg-pink-600' : 'bg-cyan-600'
                      }`}
                    >
                      {c.platform === 'instagram' ? (
                        <InstagramLogo className="size-2 text-white" />
                      ) : (
                        <TikTokLogo className="size-2 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-white truncate">
                        {c.participantName}
                      </span>
                      <span className="text-[10px] text-white/40 font-mono shrink-0">
                        {new Date(c.lastMessageTimestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-[11px] text-white/60 truncate">
                      {c.lastMessageText}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-mono text-white/40">
                        @{c.participantUsername}
                      </span>
                      {c.isWindowOpen ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {c.windowExpiresInHours}h restante
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono text-amber-400">
                          Janela fechada
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Chat Viewport */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col min-h-0 bg-[#09090c]">
          {/* Chat Top Bar */}
          <div className="p-4 border-b border-white/[0.07] bg-[#0c0c10]/70 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="size-8 rounded-full bg-cover bg-center border border-white/[0.1] bg-zinc-800"
                style={
                  activeConversation.participantAvatar
                    ? { backgroundImage: `url(${activeConversation.participantAvatar})` }
                    : undefined
                }
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    {activeConversation.participantName}
                  </h3>
                  <span className="text-xs text-white/40 font-mono">
                    @{activeConversation.participantUsername}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/50">
                  <span className="capitalize">{activeConversation.platform} Direct</span>
                  <span>•</span>
                  {activeConversation.isWindowOpen ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={11} />
                      Janela de mensagens ativa ({activeConversation.windowExpiresInHours}h)
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertCircle size={11} />
                      Janela de 24h fechada (aguardando resposta)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages Bubble Thread */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
            {activeConversation.messages.map((m) => {
              const isMe = m.sender === 'me';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-sm shadow-md'
                        : 'bg-[#15151b] border border-white/[0.08] text-white/90 rounded-bl-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] font-mono text-white/30 mt-1 px-1">
                    {new Date(m.timestamp).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Replies Strip */}
          <div className="px-4 py-2 border-t border-white/[0.05] bg-[#0c0c10]/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono text-white/40 shrink-0 flex items-center gap-1">
              <Zap size={11} className="text-indigo-400" />
              Respostas Rápidas:
            </span>
            {quickTemplates.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setDraft(tpl)}
                className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-[11px] text-white/70 hover:text-white transition-colors shrink-0 max-w-xs truncate"
              >
                {tpl}
              </button>
            ))}
          </div>

          {/* Composer Footer */}
          <form
            onSubmit={handleSend}
            className="p-4 border-t border-white/[0.07] bg-[#0c0c10] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Digite sua resposta oficial..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isSending || !draft.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-md"
            >
              <Send size={13} />
              Enviar
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-xs text-white/40 font-mono">
          Selecione uma conversa para visualizar
        </div>
      )}
    </div>
  );
}
