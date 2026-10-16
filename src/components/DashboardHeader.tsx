'use client';

import React from 'react';
import { Sparkles, Plus, Globe, Zap } from 'lucide-react';
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
}: DashboardHeaderProps) {
  const isContentSection = currentSection === 'plan' || currentSection === 'ideas';

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3 bg-[#09090d]/90 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-20 min-h-[54px]">
      <div className="flex flex-col min-w-0">
        <h1 className="text-base font-semibold text-white tracking-tight truncate">
          {title}
        </h1>
        <p className="text-xs text-zinc-400 truncate">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Context: Content Creation (Plan & Ideas) */}
        {isContentSection && (
          <>
            {/* Platform Selector Filter */}
            <div className="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <button
                type="button"
                onClick={() => onSelectPlatform('all')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedPlatform === 'all'
                    ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Globe size={13} />
                <span>Todas</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectPlatform('x')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedPlatform === 'x'
                    ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <XLogo className="size-3" />
                <span>X</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectPlatform('linkedin')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedPlatform === 'linkedin'
                    ? 'bg-[#0A66C2]/20 text-[#70b5f9] border border-[#0A66C2]/40 shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LinkedInLogo className="size-3 text-[#0A66C2]" />
                <span>LinkedIn</span>
              </button>
            </div>

            {/* Atomizar Ideia Button */}
            {onOpenSpray && (
              <button
                type="button"
                onClick={onOpenSpray}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all shadow-sm active:scale-[0.98]"
                title="Atomizar 1 ideia em 3 formatos para X e LinkedIn"
              >
                <Zap size={13} className="text-amber-400" />
                <span>Atomizar Ideia</span>
              </button>
            )}

            {/* AI Generate Button */}
            <button
              type="button"
              onClick={onOpenGenerate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 transition-all shadow-sm active:scale-[0.98]"
            >
              <Sparkles size={13} className="text-violet-400" />
              <span>Gerar com IA</span>
            </button>

            {/* Primary New Post Button */}
            <button
              type="button"
              onClick={onOpenComposer}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition-all shadow-sm active:scale-[0.98]"
            >
              <Plus size={14} />
              <span>Novo Post</span>
            </button>
          </>
        )}

        {/* Context: DM Campaigns */}
        {currentSubView === 'dm-campaigns' && onOpenCreateCampaign && (
          <button
            type="button"
            onClick={onOpenCreateCampaign}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition-all shadow-sm active:scale-[0.98]"
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition-all shadow-sm active:scale-[0.98]"
          >
            <Plus size={14} />
            <span>Novo Link</span>
          </button>
        )}
      </div>
    </header>
  );
}

