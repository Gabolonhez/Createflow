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
  ArrowLeft,
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
  const [mobileShowingChat, setMobileShowingChat] = useState<boolean>(false);
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
    <div className="flex-1 flex min-h-0 rounded-[22px] bg-[#111111] border border-[#222222] overflow-hidden shadow-2xl">
      {/* Left Column: Conversations List */}
      <div className={`${mobileShowingChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 border-r border-[#1f1f1f] flex-col min-h-0 bg-[#141414] shrink-0`}>
        {/* Inbox Header */}
        <div className="p-4 border-b border-[#1f1f1f] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={15} className="text-[#ececec]" />
              <h2 className="text-sm font-medium text-[#ececec] tracking-[-0.02em]">
                Inbox Social Unificada
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-[5px] bg-[#7ae6a0]/12 text-[#7ae6a0] border border-[#7ae6a0]/25">
              Janela 24h Meta
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6f6f6f]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversas..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-full bg-[#1c1c1c] border border-[#2a2a2a] text-xs text-[#ececec] placeholder-[#6f6f6f] focus:outline-none focus:border-[#4e4e4e]"
            />
          </div>

          {/* Platform Filter Tabs (Pluy Segmented Pill) */}
          <div className="flex items-center p-1 rounded-full bg-[#101010] border border-[#242424]">
            <button
              type="button"
              onClick={() => setPlatformFilter('all')}
              className={`flex-1 py-1 rounded-full text-[11px] font-medium transition-all active:scale-[0.97] ${
                platformFilter === 'all'
                  ? 'bg-[#262626] text-white'
                  : 'text-[#8a8a8a] hover:text-[#ececec]'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setPlatformFilter('instagram')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-full text-[11px] font-medium transition-all active:scale-[0.97] ${
                platformFilter === 'instagram'
                  ? 'bg-[#262626] text-white'
                  : 'text-[#8a8a8a] hover:text-[#ececec]'
              }`}
            >
              <InstagramLogo className="size-3 text-pink-400" />
              Instagram
            </button>
            <button
              type="button"
              onClick={() => setPlatformFilter('tiktok')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-full text-[11px] font-medium transition-all active:scale-[0.97] ${
                platformFilter === 'tiktok'
                  ? 'bg-[#262626] text-white'
                  : 'text-[#8a8a8a] hover:text-[#ececec]'
              }`}
            >
              <TikTokLogo className="size-3 text-cyan-400" />
              TikTok
            </button>
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6f6f6f] font-mono">
              Nenhuma conversa encontrada.
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = activeConversation?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setActiveConvId(c.id);
                    setMobileShowingChat(true);
                  }}
                  className={`w-full p-3 text-left flex items-start gap-3 rounded-[14px] transition-all active:scale-[0.99] ${
                    isSelected
                      ? 'bg-[#212121]'
                      : 'hover:bg-[#191919]'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="size-9 rounded-full bg-cover bg-center border border-[#2c2c2c] bg-[#1c1c1c]"
                      style={
                        c.participantAvatar
                          ? { backgroundImage: `url(${c.participantAvatar})` }
                          : undefined
                      }
                    />
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 size-4 rounded-full flex items-center justify-center border border-[#141414] ${
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
                      <span className="text-xs font-medium text-[#ececec] truncate">
                        {c.participantName}
                      </span>
                      <span className="text-[10px] text-[#6f6f6f] font-mono shrink-0">
                        {new Date(c.lastMessageTimestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#9a9a9a] truncate">
                      {c.lastMessageText}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-mono text-[#6f6f6f]">
                        @{c.participantUsername}
                      </span>
                      {c.isWindowOpen ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[#7ae6a0]">
                          <span className="size-1.5 rounded-full bg-[#7ae6a0]" />
                          {c.windowExpiresInHours}h restante
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[#ffbd2e]">
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
        <div className={`${!mobileShowingChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col min-h-0 bg-[#0e0e0e]`}>
          {/* Chat Top Bar */}
          <div className="p-3.5 sm:p-4 border-b border-[#1f1f1f] bg-[#121212] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setMobileShowingChat(false)}
                className="md:hidden size-8 rounded-full flex items-center justify-center text-[#9a9a9a] hover:text-[#ececec] bg-[#212121] shrink-0"
                title="Voltar para a lista"
              >
                <ArrowLeft size={16} />
              </button>
              <div
                className="size-8 rounded-full bg-cover bg-center border border-[#2c2c2c] bg-[#1c1c1c] shrink-0"
                style={
                  activeConversation.participantAvatar
                    ? { backgroundImage: `url(${activeConversation.participantAvatar})` }
                    : undefined
                }
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-[#ececec]">
                    {activeConversation.participantName}
                  </h3>
                  <span className="text-xs text-[#6f6f6f] font-mono">
                    @{activeConversation.participantUsername}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#8a8a8a]">
                  <span className="capitalize">{activeConversation.platform} Direct</span>
                  <span>•</span>
                  {activeConversation.isWindowOpen ? (
                    <span className="text-[#7ae6a0] flex items-center gap-1">
                      <CheckCircle2 size={11} />
                      Janela de mensagens ativa ({activeConversation.windowExpiresInHours}h)
                    </span>
                  ) : (
                    <span className="text-[#ffbd2e] flex items-center gap-1">
                      <AlertCircle size={11} />
                      Janela de 24h fechada (aguardando resposta)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages Bubble Thread (Pluy Style Bubbles) */}
          <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar">
            {activeConversation.messages.map((m) => {
              const isMe = m.sender === 'me';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] px-3.5 py-2.5 rounded-[18px] text-xs leading-relaxed ${
                      isMe
                        ? 'bg-[#262626] text-[#ececec] rounded-br-[4px]'
                        : 'bg-[#161616] border border-[#242424] text-[#ececec] rounded-bl-[4px]'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] font-mono text-[#6f6f6f] mt-1 px-1">
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
          <div className="px-4 py-2 border-t border-[#1f1f1f] bg-[#121212] flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono text-[#6f6f6f] shrink-0 flex items-center gap-1">
              <Zap size={11} className="text-[#9a9a9a]" />
              Respostas Rápidas:
            </span>
            {quickTemplates.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setDraft(tpl)}
                className="px-3 py-1 rounded-full bg-[#1c1c1c] hover:bg-[#262626] border border-[#2a2a2a] text-[11px] text-[#9a9a9a] hover:text-[#ececec] transition-all active:scale-[0.97] shrink-0 max-w-xs truncate"
              >
                {tpl}
              </button>
            ))}
          </div>

          {/* Composer Footer (Pluy Circular White Send Button) */}
          <form
            onSubmit={handleSend}
            className="p-3 sm:p-4 border-t border-[#1f1f1f] bg-[#111111] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Digite sua resposta oficial..."
              className="flex-1 px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-xs text-[#ececec] placeholder-[#6f6f6f] focus:outline-none focus:border-[#4e4e4e]"
            />
            <button
              type="submit"
              disabled={isSending || !draft.trim()}
              className="px-4 py-2 rounded-full bg-[#f2f2f2] hover:bg-white disabled:opacity-40 text-xs font-medium text-[#0a0a0a] flex items-center gap-1.5 transition-all active:scale-[0.95] shadow-sm"
            >
              <Send size={13} />
              <span>Enviar</span>
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0e0e0e]">
          <div className="size-12 rounded-2xl bg-[#161616] border border-[#242424] flex items-center justify-center text-[#9a9a9a] mb-3 shadow-sm">
            <MessageSquare size={20} />
          </div>
          <h3 className="text-sm font-medium text-[#ececec] mb-1">
            {conversations.length === 0 ? 'Nenhuma conversa na Inbox Social' : 'Selecione uma conversa'}
          </h3>
          <p className="text-xs text-[#8a8a8a] max-w-sm">
            {conversations.length === 0
              ? 'As mensagens diretas de seguidores no Instagram e TikTok acionadas por campanhas de Auto-DM aparecerão aqui para atendimento oficial dentro da janela de 24h.'
              : 'Escolha uma conversa na lista ao lado para responder e gerenciar o histórico.'}
          </p>
        </div>
      )}
    </div>
  );
}
