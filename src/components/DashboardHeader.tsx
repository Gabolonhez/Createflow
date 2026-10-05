'use client';

import React from 'react';
import { Sparkles, Plus, Globe } from 'lucide-react';
import { XLogo, LinkedInLogo } from './BrandIcons';
import type { Platform } from '@/types';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  selectedPlatform: Platform | 'all';
  onSelectPlatform: (platform: Platform | 'all') => void;
  onOpenComposer: () => void;
  onOpenGenerate: () => void;
  authorHandle?: string;
}

export function DashboardHeader({
  title,
  subtitle,
  selectedPlatform,
  onSelectPlatform,
  onOpenComposer,
  onOpenGenerate,
  authorHandle = '@gabolonhez',
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 bg-[#09090d]/80 backdrop-blur-md border-b border-white/[0.06] sticky top-0 z-20">
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
          {title}
        </h1>
        <p className="text-xs text-white/50">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Platform Selector Filter */}
        <div className="flex items-center p-1 rounded-lg bg-white/[0.04] border border-white/[0.08]">
          <button
            type="button"
            onClick={() => onSelectPlatform('all')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              selectedPlatform === 'all'
                ? 'bg-white/[0.12] text-white shadow-sm'
                : 'text-white/50 hover:text-white/80'
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
                ? 'bg-white/[0.12] text-white shadow-sm'
                : 'text-white/50 hover:text-white/80'
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
                ? 'bg-[#0A66C2]/20 text-[#70b5f9] border border-[#0A66C2]/40 shadow-sm'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <LinkedInLogo className="size-3 text-[#0A66C2]" />
            <span>LinkedIn</span>
          </button>
        </div>

        {/* AI Generate Button */}
        <button
          type="button"
          onClick={onOpenGenerate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 transition-all shadow-sm group active:scale-[0.98]"
        >
          <Sparkles size={14} className="text-violet-400 group-hover:rotate-12 transition-transform" />
          <span>Gerar com IA</span>
        </button>

        {/* Direct New Post Button */}
        <button
          type="button"
          onClick={onOpenComposer}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-white/90 transition-all shadow-sm active:scale-[0.98]"
        >
          <Plus size={14} />
          <span>Novo Post</span>
        </button>
      </div>
    </header>
  );
}
