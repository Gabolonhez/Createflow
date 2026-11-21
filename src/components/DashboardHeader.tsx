'use client';

import React from 'react';
import { Sparkles, Plus, Globe, Zap, Menu } from 'lucide-react';
import { XLogo, LinkedInLogo } from './BrandIcons';
import type { Platform, MainSection, ActiveSubView } from '@/types';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  currentSection?: MainSection;
  currentSubView?: ActiveSubView;
  selectedPlatform: Platform | 'all';
  onSelectPlatform: (platform: Platform | 'all') => void;
  onOpenComposer: () => void;
  onOpenGenerate: () => void;
  onOpenSpray?: () => void;
  onOpenCreateCampaign?: () => void;
  onOpenCreateTrackedLink?: () => void;
  authorHandle?: string;
  onToggleMobileMenu?: () => void;
}

export function DashboardHeader({
  title,
  subtitle,
  currentSection = 'plan',
  currentSubView = 'posts',
  selectedPlatform,
  onSelectPlatform,
  onOpenComposer,
  onOpenGenerate,
  onOpenSpray,
  onOpenCreateCampaign,
  onOpenCreateTrackedLink,
  onToggleMobileMenu,
}: DashboardHeaderProps) {
  const isContentSection = currentSection === 'plan' || currentSection === 'ideas';

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 sm:px-6 py-2.5 sm:py-3 bg-[#0a0a0a]/85 backdrop-blur-[14px] border-b border-[#1a1a1a] sticky top-0 z-20 min-h-[58px]">
      <div className="flex items-center gap-2.5 min-w-0">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="Abrir menu"
            className="md:hidden p-1.5 -ml-1 rounded-full text-[#9a9a9a] hover:text-[#ececec] hover:bg-[#212121] transition-all active:scale-[0.97] shrink-0"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="flex flex-col min-w-0">
          <h1 className="text-sm sm:text-base font-medium text-[#ececec] tracking-[-0.025em] truncate">
            {title}
          </h1>
          <p className="text-[11px] sm:text-xs text-[#8a8a8a] truncate">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {/* Context: Content Creation (Plan & Ideas) */}
        {isContentSection && (
          <>
            {/* Platform Selector Segmented Pill */}
            <div className="inline-flex items-center p-1 rounded-full bg-[#161616] border border-[#242424]">
              <button
                type="button"
                onClick={() => onSelectPlatform('all')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-[0.97] ${
                  selectedPlatform === 'all'
                    ? 'bg-[#282828] text-white shadow-sm'
                    : 'text-[#8a8a8a] hover:text-[#ececec]'
                }`}
              >
                <Globe size={12} />
                <span>Todas</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectPlatform('x')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-[0.97] ${
                  selectedPlatform === 'x'
                    ? 'bg-[#282828] text-white shadow-sm'
                    : 'text-[#8a8a8a] hover:text-[#ececec]'
                }`}
              >
                <XLogo className="size-3" />
                <span>X</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectPlatform('linkedin')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-[0.97] ${
                  selectedPlatform === 'linkedin'
                    ? 'bg-[#282828] text-white shadow-sm'
                    : 'text-[#8a8a8a] hover:text-[#ececec]'
                }`}
              >
                <LinkedInLogo className="size-3 text-[#0A66C2]" />
                <span className="hidden xs:inline">LinkedIn</span>
                <span className="xs:hidden">IN</span>
              </button>
            </div>

            {/* Atomizar Ideia Quiet Pill */}
            {onOpenSpray && (
              <button
                type="button"
                onClick={onOpenSpray}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2b2b2b] text-[#ececec] border border-[#2c2c2c] transition-all active:scale-[0.97]"
                title="Atomizar 1 ideia em 3 formatos para X e LinkedIn"
              >
                <Zap size={12} className="text-[#ffbd2e] shrink-0" />
                <span className="hidden sm:inline">Atomizar Ideia</span>
                <span className="sm:hidden">Atomizar</span>
              </button>
            )}

            {/* AI Generate Quiet Pill */}
            <button
              type="button"
              onClick={onOpenGenerate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2b2b2b] text-[#ececec] border border-[#2c2c2c] transition-all active:scale-[0.97]"
            >
              <Sparkles size={12} className="text-[#ececec] shrink-0" />
              <span className="hidden sm:inline">Gerar com IA</span>
              <span className="sm:hidden">IA</span>
            </button>

            {/* Primary New Post White Pill */}
            <button
              type="button"
              onClick={onOpenComposer}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] transition-all shadow-sm active:scale-[0.97]"
            >
              <Plus size={14} className="shrink-0" />
              <span>Novo Post</span>
            </button>
          </>
        )}

        {/* Context: DM Campaigns */}
        {currentSubView === 'dm-campaigns' && onOpenCreateCampaign && (
          <button
            type="button"
            onClick={onOpenCreateCampaign}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] transition-all shadow-sm active:scale-[0.97]"
          >
            <Plus size={14} />
            <span>Nova Campanha</span>
          </button>
        )}

        {/* Context: Tracked Links */}
        {currentSubView === 'tracked-links' && onOpenCreateTrackedLink && (
          <button
            type="button"
            onClick={onOpenCreateTrackedLink}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] transition-all shadow-sm active:scale-[0.97]"
          >
            <Plus size={14} />
            <span>Novo Link</span>
          </button>
        )}
      </div>
    </header>
  );
}
