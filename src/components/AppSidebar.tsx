'use client';

import React from 'react';
import {
  Calendar,
  Layers,
  Lightbulb,
  BookOpen,
  Sparkles,
  Sliders,
  BarChart3,
  Link2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Flame,
  FileText,
  Brain,
  CheckCircle2,
  LogOut,
  Image as ImageIcon,
  Send,
  MessageSquare,
  Link as LinkIcon,
  ScrollText,
} from 'lucide-react';
import { XLogo, LinkedInLogo, InstagramLogo, TikTokLogo } from './BrandIcons';
import type { MainSection, ActiveSubView } from '@/types';

interface AppSidebarProps {
  currentSection: MainSection;
  currentSubView: ActiveSubView;
  onNavigate: (section: MainSection, subView: ActiveSubView) => void;
  onOpenComposer: () => void;
  pendingApprovalsCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  xConnected?: boolean;
  linkedinConnected?: boolean;
  instagramConnected?: boolean;
  tiktokConnected?: boolean;
  userEmail?: string | null;
  onSignOut?: () => void;
}

export function AppSidebar({
  currentSection,
  currentSubView,
  onNavigate,
  onOpenComposer,
  pendingApprovalsCount,
  isCollapsed,
  onToggleCollapse,
  xConnected = true,
  linkedinConnected = true,
  instagramConnected = true,
  tiktokConnected = true,
  userEmail,
  onSignOut,
}: AppSidebarProps) {
  const sidebarWidth = isCollapsed ? '70px' : '250px';

  const navGroups = [
    {
      title: 'PLANEJAMENTO',
      items: [
        {
          id: 'posts',
          section: 'plan' as MainSection,
          subView: 'posts' as ActiveSubView,
          label: 'Fila de Posts',
          icon: <Layers size={17} />,
          badge: pendingApprovalsCount > 0 ? String(pendingApprovalsCount) : undefined,
          badgeColor: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
        },
        {
          id: 'calendar',
          section: 'plan' as MainSection,
          subView: 'calendar' as ActiveSubView,
          label: 'Calendário',
          icon: <Calendar size={17} />,
        },
      ],
    },
    {
      title: 'FUNIS & AUTO-DM',
      items: [
        {
          id: 'dm-campaigns',
          section: 'automations' as MainSection,
          subView: 'dm-campaigns' as ActiveSubView,
          label: 'Campanhas de DM',
          icon: <Send size={17} />,
        },
        {
          id: 'dm-inbox',
          section: 'automations' as MainSection,
          subView: 'dm-inbox' as ActiveSubView,
          label: 'Inbox Social',
          icon: <MessageSquare size={17} />,
          badge: '3',
          badgeColor: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
        },
        {
          id: 'tracked-links',
          section: 'automations' as MainSection,
          subView: 'tracked-links' as ActiveSubView,
          label: 'Links & Cliques',
          icon: <LinkIcon size={17} />,
        },
        {
          id: 'dm-logs',
          section: 'automations' as MainSection,
          subView: 'dm-logs' as ActiveSubView,
          label: 'Logs de Disparos',
          icon: <ScrollText size={17} />,
        },
      ],
    },
    {
      title: 'CRIAÇÃO & IDEIAS',
      items: [
        {
          id: 'my-ideas',
          section: 'ideas' as MainSection,
          subView: 'my-ideas' as ActiveSubView,
          label: 'Minhas Ideias',
          icon: <Lightbulb size={17} />,
        },
        {
          id: 'topics',
          section: 'ideas' as MainSection,
          subView: 'topics' as ActiveSubView,
          label: 'Pautas & Ângulos',
          icon: <Flame size={17} />,
        },
        {
          id: 'facts',
          section: 'ideas' as MainSection,
          subView: 'facts' as ActiveSubView,
          label: 'Fatos Reais',
          icon: <FileText size={17} />,
        },
        {
          id: 'references',
          section: 'ideas' as MainSection,
          subView: 'references' as ActiveSubView,
          label: 'Referências Virais',
          icon: <BookOpen size={17} />,
        },
        {
          id: 'media-library',
          section: 'ideas' as MainSection,
          subView: 'media-library' as ActiveSubView,
          label: 'Acervo de Mídia',
          icon: <ImageIcon size={17} />,
        },
      ],
    },
    {
      title: 'VOZ & AJUSTES',
      items: [
        {
          id: 'manual',
          section: 'voice' as MainSection,
          subView: 'manual' as ActiveSubView,
          label: 'Meu Estilo & Regras',
          icon: <Sliders size={17} />,
        },
        {
          id: 'learnings',
          section: 'voice' as MainSection,
          subView: 'learnings' as ActiveSubView,
          label: 'Aprendizados da IA',
          icon: <Brain size={17} />,
        },
      ],
    },
    {
      title: 'DESEMPENHO',
      items: [
        {
          id: 'instagram-analytics',
          section: 'results' as MainSection,
          subView: 'instagram-analytics' as ActiveSubView,
          label: 'Analytics Instagram',
          icon: <InstagramLogo className="size-4 text-pink-400" />,
          badge: 'Live',
          badgeColor: 'bg-pink-500/15 text-pink-400 border border-pink-500/30',
        },
        {
          id: 'performance',
          section: 'results' as MainSection,
          subView: 'performance' as ActiveSubView,
          label: 'Fila & Posts',
          icon: <BarChart3 size={17} />,
        },
      ],
    },
    {
      title: 'CONFIGURAÇÕES',
      items: [
        {
          id: 'connection',
          section: 'settings' as MainSection,
          subView: 'connection' as ActiveSubView,
          label: 'Conexões & Contas',
          icon: <Link2 size={17} />,
        },
      ],
    },
  ];

  return (
    <aside
      className="relative flex flex-col h-screen shrink-0 z-30 transition-all duration-300 select-none bg-[#09090d] border-r border-white/[0.07]"
      style={{ width: sidebarWidth, minWidth: sidebarWidth }}
    >
      {/* Collapse Toggle Button */}
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
        className="absolute -right-3 top-5 size-6 rounded-full bg-[#16161e] border border-white/[0.12] flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all shadow-md z-40"
      >
        {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 min-h-[64px] border-b border-white/[0.05]">
        <div className="size-8 rounded-lg bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-500 flex items-center justify-center shrink-0 shadow-lg shadow-violet-600/20">
          <Sparkles size={16} className="text-white" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-white tracking-tight">CreateFlow</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-white/40 truncate">X & LinkedIn Studio</span>
          </div>
        )}
      </div>

      {/* Quick "+ Criar Post" CTA */}
      <div className="p-3">
        <button
          type="button"
          onClick={onOpenComposer}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-violet-600/25 transition-all group active:scale-[0.98]"
        >
          <Plus size={16} className="shrink-0 transition-transform group-hover:rotate-90 duration-200" />
          {!isCollapsed && <span className="truncate">Criar novo post</span>}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-4 py-2 scrollbar-none">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!isCollapsed ? (
              <p className="px-3 pt-2 pb-1 text-[10px] font-semibold font-mono tracking-wider text-white/30 uppercase">
                {group.title}
              </p>
            ) : (
              <div className="mx-2 my-1.5 h-px bg-white/[0.06]" />
            )}

            {group.items.map((item) => {
              const isActive = currentSubView === item.subView;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.section, item.subView)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-white/[0.09] text-white shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`shrink-0 ${isActive ? 'text-violet-400' : 'text-white/50'}`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  {isCollapsed && item.badge && (
                    <span className="absolute top-1 right-1 size-2 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer with Channel Status */}
      <div className="p-3 border-t border-white/[0.06] bg-[#07070a]/60">
        {!isCollapsed ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-white/40">CANAIS ATIVOS</span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div
                className={`flex items-center justify-between px-2 py-1 rounded bg-white/[0.03] border ${
                  xConnected ? 'border-white/[0.12] text-white' : 'border-red-500/20 text-white/40'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <XLogo className="size-3" />
                  <span className="text-[10px] font-mono">X</span>
                </div>
                {xConnected ? (
                  <CheckCircle2 size={10} className="text-emerald-400" />
                ) : (
                  <span className="text-[9px] text-amber-400">Off</span>
                )}
              </div>

              <div
                className={`flex items-center justify-between px-2 py-1 rounded bg-white/[0.03] border ${
                  linkedinConnected ? 'border-sky-500/30 text-white' : 'border-red-500/20 text-white/40'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <LinkedInLogo className="size-3 text-[#0A66C2]" />
                  <span className="text-[10px] font-mono">in</span>
                </div>
                {linkedinConnected ? (
                  <CheckCircle2 size={10} className="text-emerald-400" />
                ) : (
                  <span className="text-[9px] text-amber-400">Off</span>
                )}
              </div>

              <div
                className={`flex items-center justify-between px-2 py-1 rounded bg-white/[0.03] border ${
                  instagramConnected ? 'border-pink-500/30 text-white' : 'border-red-500/20 text-white/40'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <InstagramLogo className="size-3 text-pink-400" />
                  <span className="text-[10px] font-mono">IG</span>
                </div>
                {instagramConnected ? (
                  <CheckCircle2 size={10} className="text-emerald-400" />
                ) : (
                  <span className="text-[9px] text-amber-400">Off</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <XLogo className={`size-3.5 ${xConnected ? 'text-white' : 'text-white/30'}`} />
            <LinkedInLogo className={`size-3.5 ${linkedinConnected ? 'text-[#0A66C2]' : 'text-white/30'}`} />
            <InstagramLogo className={`size-3.5 ${instagramConnected ? 'text-pink-400' : 'text-white/30'}`} />
          </div>
        )}

        {/* User Account / Sign Out Strip */}
        {userEmail && (
          <div className="pt-2.5 mt-2 border-t border-white/[0.05] flex items-center justify-between">
            {!isCollapsed ? (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-6 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-[10px] font-bold text-violet-200 shrink-0 uppercase">
                    {userEmail[0]}
                  </div>
                  <span className="text-[11px] font-mono text-white/60 truncate" title={userEmail}>
                    {userEmail}
                  </span>
                </div>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    title="Sair da conta"
                    className="p-1 rounded text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut size={13} />
                  </button>
                )}
              </>
            ) : (
              onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  title={`Sair (${userEmail})`}
                  className="mx-auto p-1.5 rounded text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut size={14} />
                </button>
              )
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
