'use client';

import React from 'react';
import Image from 'next/image';
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
  Film,
  Bot,
  Radar,
  X,
  Menu,
} from 'lucide-react';
import { XLogo, LinkedInLogo, InstagramLogo, TikTokLogo } from './BrandIcons';
import type { MainSection, ActiveSubView } from '@/types';

interface AppSidebarProps {
  currentSection: MainSection;
  currentSubView: ActiveSubView;
  onNavigate: (section: MainSection, subView: ActiveSubView) => void;
  onOpenComposer: () => void;
  pendingApprovalsCount: number;
  newRadarPostsCount?: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  unreadConversationsCount?: number;
  xConnected?: boolean;
  linkedinConnected?: boolean;
  instagramConnected?: boolean;
  tiktokConnected?: boolean;
  userEmail?: string | null;
  onSignOut?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AppSidebar({
  currentSection,
  currentSubView,
  onNavigate,
  onOpenComposer,
  pendingApprovalsCount,
  newRadarPostsCount = 0,
  isCollapsed,
  onToggleCollapse,
  unreadConversationsCount = 0,
  xConnected = true,
  linkedinConnected = true,
  instagramConnected = true,
  tiktokConnected = true,
  userEmail,
  onSignOut,
  isMobileOpen = false,
  onCloseMobile,
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
          badgeColor: 'bg-[#ffbd2e]/15 text-[#ffbd2e] border border-[#ffbd2e]/25 rounded-[5px]',
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
          badge: unreadConversationsCount > 0 ? String(unreadConversationsCount) : undefined,
          badgeColor: 'bg-[#262626] text-[#ececec] border border-[#333333] rounded-[5px]',
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
          id: 'radar',
          section: 'ideas' as MainSection,
          subView: 'radar' as ActiveSubView,
          label: 'Radar & Salvos',
          icon: <Radar size={17} />,
          badge: newRadarPostsCount > 0 ? String(newRadarPostsCount) : undefined,
          badgeColor: 'bg-[#7ae6a0]/15 text-[#7ae6a0] border border-[#7ae6a0]/25 rounded-[5px]',
        },
        {
          id: 'video-crew',
          section: 'ideas' as MainSection,
          subView: 'video-crew' as ActiveSubView,
          label: 'Video Crew (Pluy)',
          icon: <Bot size={17} />,
          badge: '5 BOTS',
          badgeColor: 'bg-[#262626] text-[#ececec] border border-[#333333] rounded-[5px]',
        },
        {
          id: 'video-studio',
          section: 'ideas' as MainSection,
          subView: 'video-studio' as ActiveSubView,
          label: 'Estúdio de Vídeo',
          icon: <Film size={17} />,
          badge: 'IA',
          badgeColor: 'bg-[#262626] text-[#a0a0a0] rounded-[5px]',
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
          badgeColor: 'bg-[#7ae6a0]/15 text-[#7ae6a0] border border-[#7ae6a0]/25 rounded-[5px]',
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

  const renderSidebarContent = (isMobileDrawer: boolean) => (
    <div className="flex flex-col h-full overflow-hidden select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 min-h-[58px] border-b border-[#1f1f1f]">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-[#212121] border border-[#2c2c2c] flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
            <Image
              src="/createflow-logo.png"
              alt="CreateFlow"
              width={32}
              height={32}
              className="rounded-lg object-cover"
              priority
            />
          </div>
          {(!isCollapsed || isMobileDrawer) && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-sm text-[#ececec] tracking-[-0.02em]">CreateFlow</span>
                <span className="px-1.5 py-0.5 rounded-[5px] text-[10px] font-mono font-normal bg-[#262626] text-[#a0a0a0]">
                  AI OS
                </span>
              </div>
              <span className="text-[11px] text-[#6f6f6f] truncate">Growth Studio &amp; AI OS</span>
            </div>
          )}
        </div>
        {isMobileDrawer && onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Fechar menu lateral"
            className="p-1.5 rounded-full text-[#8a8a8a] hover:text-[#ececec] hover:bg-[#212121] transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Quick "+ Criar Post" CTA (Pluy White Pill) */}
      <div className="p-3">
        <button
          type="button"
          onClick={() => {
            onOpenComposer();
            if (isMobileDrawer) onCloseMobile?.();
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] font-medium text-xs shadow-sm transition-all group active:scale-[0.97]"
        >
          <Plus size={15} className="shrink-0 transition-transform group-hover:rotate-90 duration-200 text-[#0a0a0a]" />
          {(!isCollapsed || isMobileDrawer) && <span className="truncate">Criar novo post</span>}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2.5 space-y-4 py-2 no-scrollbar">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-0.5">
            {(!isCollapsed || isMobileDrawer) ? (
              <p className="px-3 pt-2 pb-1 text-[10px] font-medium font-mono tracking-wider text-[#6f6f6f] uppercase">
                {group.title}
              </p>
            ) : (
              <div className="mx-2 my-1.5 h-px bg-[#1f1f1f]" />
            )}

            {group.items.map((item) => {
              const isActive = currentSubView === item.subView;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigate(item.section, item.subView);
                    if (isMobileDrawer) onCloseMobile?.();
                  }}
                  title={isCollapsed && !isMobileDrawer ? item.label : undefined}
                  className={`relative w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-xs font-medium transition-all active:scale-[0.98] ${
                    isActive
                      ? 'bg-[#212121] text-[#ececec] shadow-sm'
                      : 'text-[#8a8a8a] hover:text-[#ececec] hover:bg-[#191919]'
                  } ${isCollapsed && !isMobileDrawer ? 'justify-center px-2' : ''}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`shrink-0 ${isActive ? 'text-[#ececec]' : 'text-[#6f6f6f]'}`}>
                      {item.icon}
                    </span>
                    {(!isCollapsed || isMobileDrawer) && <span className="truncate">{item.label}</span>}
                  </div>
                  {(!isCollapsed || isMobileDrawer) && item.badge && (
                    <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  {isCollapsed && !isMobileDrawer && item.badge && (
                    <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[#7ae6a0]" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer with Channel Status */}
      <div className="p-3 border-t border-[#1f1f1f] bg-[#0d0d0d]">
        {(!isCollapsed || isMobileDrawer) ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#6f6f6f]">CANAIS ATIVOS</span>
              <span className="text-[10px] text-[#7ae6a0] font-mono flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-[#7ae6a0]" />
                Live
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div
                className={`flex items-center justify-between px-2.5 py-1 rounded-[10px] bg-[#161616] border ${
                  xConnected ? 'border-[#262626] text-[#ececec]' : 'border-[#222222] text-[#6f6f6f]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <XLogo className="size-3" />
                  <span className="text-[10px] font-mono">X</span>
                </div>
                {xConnected ? (
                  <CheckCircle2 size={10} className="text-[#7ae6a0]" />
                ) : (
                  <span className="text-[9px] text-[#6f6f6f]">Off</span>
                )}
              </div>

              <div
                className={`flex items-center justify-between px-2.5 py-1 rounded-[10px] bg-[#161616] border ${
                  linkedinConnected ? 'border-[#262626] text-[#ececec]' : 'border-[#222222] text-[#6f6f6f]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <LinkedInLogo className="size-3 text-[#0A66C2]" />
                  <span className="text-[10px] font-mono">in</span>
                </div>
                {linkedinConnected ? (
                  <CheckCircle2 size={10} className="text-[#7ae6a0]" />
                ) : (
                  <span className="text-[9px] text-[#6f6f6f]">Off</span>
                )}
              </div>

              <div
                className={`flex items-center justify-between px-2.5 py-1 rounded-[10px] bg-[#161616] border ${
                  instagramConnected ? 'border-[#262626] text-[#ececec]' : 'border-[#222222] text-[#6f6f6f]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <InstagramLogo className="size-3 text-pink-400" />
                  <span className="text-[10px] font-mono">IG</span>
                </div>
                {instagramConnected ? (
                  <CheckCircle2 size={10} className="text-[#7ae6a0]" />
                ) : (
                  <span className="text-[9px] text-[#6f6f6f]">Off</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <XLogo className={`size-3.5 ${xConnected ? 'text-[#ececec]' : 'text-[#4a4a4a]'}`} />
            <LinkedInLogo className={`size-3.5 ${linkedinConnected ? 'text-[#0A66C2]' : 'text-[#4a4a4a]'}`} />
            <InstagramLogo className={`size-3.5 ${instagramConnected ? 'text-pink-400' : 'text-[#4a4a4a]'}`} />
          </div>
        )}

        {/* User Account / Sign Out Strip */}
        {userEmail && (
          <div className="pt-2.5 mt-2 border-t border-[#1f1f1f] flex items-center justify-between">
            {(!isCollapsed || isMobileDrawer) ? (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-6 rounded-full bg-[#262626] border border-[#333333] flex items-center justify-center text-[10px] font-medium text-[#ececec] shrink-0 uppercase">
                    {userEmail[0]}
                  </div>
                  <span className="text-[11px] font-mono text-[#9a9a9a] truncate" title={userEmail}>
                    {userEmail}
                  </span>
                </div>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    title="Sair da conta"
                    className="p-1.5 rounded-full text-[#6f6f6f] hover:text-[#ff5f56] hover:bg-[#ff5f56]/10 transition-colors"
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
                  className="mx-auto p-1.5 rounded-full text-[#6f6f6f] hover:text-[#ff5f56] hover:bg-[#ff5f56]/10 transition-colors"
                >
                  <LogOut size={14} />
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-Out Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-[275px] max-w-[85vw] flex flex-col h-[100dvh] z-50 bg-[#111111] border-r border-[#1f1f1f] shadow-2xl transition-transform duration-300 md:hidden select-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebarContent(true)}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside
        className="hidden md:flex relative flex-col h-screen shrink-0 z-30 transition-all duration-300 select-none bg-[#111111] border-r border-[#1f1f1f]"
        style={{ width: sidebarWidth, minWidth: sidebarWidth }}
      >
        {/* Collapse Toggle Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          className="absolute -right-3 top-5 size-6 rounded-full bg-[#1a1a1a] border border-[#2c2c2c] flex items-center justify-center text-[#9a9a9a] hover:text-[#ececec] hover:border-[#3e3e3e] transition-all shadow-md z-40"
        >
          {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        {renderSidebarContent(false)}
      </aside>
    </>
  );
}
