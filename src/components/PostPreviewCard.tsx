'use client';

import React, { useState } from 'react';
import {
  MessageCircle,
  Repeat2,
  Heart,
  Bookmark,
  Share,
  ThumbsUp,
  MessageSquare,
  Send,
  MoreHorizontal,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { XLogo, LinkedInLogo } from './BrandIcons';
import type { Platform, ThreadStyle } from '@/types';

interface PostPreviewCardProps {
  text: string;
  thread?: string[];
  threadStyle?: ThreadStyle;
  authorName?: string;
  authorHandle?: string;
  authorHeadline?: string;
  platforms: Platform[];
  mediaUrls?: string[];
}

export function PostPreviewCard({
  text,
  thread = [],
  threadStyle = 'single',
  authorName = 'Gabriel Bolonhez',
  authorHandle = '@gabolonhez',
  authorHeadline = 'Software Engineer & Tech Founder | Building CreateFlow',
  platforms,
  mediaUrls = [],
}: PostPreviewCardProps) {
  const [activeTab, setActiveTab] = useState<'x' | 'linkedin'>(
    platforms.includes('x') ? 'x' : 'linkedin'
  );

  return (
    <div className="flex flex-col rounded-xl overflow-hidden bg-[#0c0c11] border border-white/[0.08] shadow-xl">
      {/* Network Switcher Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">PREVIEW REAL</span>
          {platforms.length > 1 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
              CROSS-POST
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {platforms.includes('x') && (
            <button
              type="button"
              onClick={() => setActiveTab('x')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activeTab === 'x'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <XLogo className="size-3" />
              <span>X (Twitter)</span>
            </button>
          )}

          {platforms.includes('linkedin') && (
            <button
              type="button"
              onClick={() => setActiveTab('linkedin')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activeTab === 'linkedin'
                  ? 'bg-[#0A66C2] text-white font-semibold shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <LinkedInLogo className="size-3 text-white" />
              <span>LinkedIn</span>
            </button>
          )}
        </div>
      </div>

      {/* Preview Content Body */}
      <div className="p-4 sm:p-5">
        {activeTab === 'x' ? (
          /* X / TWITTER POST PREVIEW */
          <div className="flex flex-col gap-3 font-sans text-[14px] text-white/90">
            {/* Main Tweet */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="size-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
                  GB
                </div>
                {thread.length > 0 && (
                  <div className="w-0.5 flex-1 bg-white/[0.15] my-1 rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-white text-[14px] hover:underline cursor-pointer">
                      {authorName}
                    </span>
                    <span className="text-white/40 text-[13px]">{authorHandle}</span>
                    <span className="text-white/30 text-[12px]">· agora</span>
                  </div>
                  <MoreHorizontal size={14} className="text-white/40" />
                </div>

                <p className="whitespace-pre-line leading-relaxed text-white/95">
                  {text || 'Digite o texto do seu post no editor ao lado...'}
                </p>

                {mediaUrls.length > 0 && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaUrls[0]}
                    alt="Mídia anexada"
                    className="mt-3 rounded-2xl border border-white/[0.1] max-h-72 w-full object-cover"
                  />
                )}

                {/* Tweet Action Icons */}
                <div className="flex items-center justify-between mt-3 pt-2 text-white/45 max-w-md">
                  <span className="flex items-center gap-1.5 hover:text-sky-400 cursor-pointer text-xs">
                    <MessageCircle size={15} /> 12
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-emerald-400 cursor-pointer text-xs">
                    <Repeat2 size={16} /> 5
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-rose-400 cursor-pointer text-xs">
                    <Heart size={15} /> 48
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-sky-400 cursor-pointer text-xs">
                    <Bookmark size={15} />
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-white cursor-pointer text-xs">
                    <Share size={15} />
                  </span>
                </div>
              </div>
            </div>

            {/* Thread Tweets Preview */}
            {thread.map((t, idx) => (
              <div key={idx} className="flex gap-3 pt-1">
                <div className="flex flex-col items-center">
                  <div className="size-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
                    GB
                  </div>
                  {idx < thread.length - 1 && (
                    <div className="w-0.5 flex-1 bg-white/[0.15] my-1 rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-bold text-white text-[14px]">{authorName}</span>
                    <span className="text-white/40 text-[13px]">{authorHandle}</span>
                    <span className="text-white/30 text-[12px]">· {idx + 2}/{thread.length + 1}</span>
                  </div>

                  <p className="whitespace-pre-line leading-relaxed text-white/90">{t}</p>

                  <div className="flex items-center justify-between mt-2 pt-1 text-white/40 max-w-md">
                    <span className="flex items-center gap-1.5 text-xs"><MessageCircle size={14} /></span>
                    <span className="flex items-center gap-1.5 text-xs"><Repeat2 size={15} /></span>
                    <span className="flex items-center gap-1.5 text-xs"><Heart size={14} /></span>
                    <span className="flex items-center gap-1.5 text-xs"><Share size={14} /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* LINKEDIN FEED POST PREVIEW */
          <div className="flex flex-col gap-3 font-sans text-[14px]">
            {/* LinkedIn Header */}
            <div className="flex items-start justify-between">
              <div className="flex gap-2.5">
                <div className="size-11 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center font-bold text-sm text-white shrink-0">
                  GB
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-white text-[14px] hover:underline cursor-pointer">
                      {authorName}
                    </span>
                    <span className="text-white/40 text-xs">· 1º</span>
                  </div>
                  <span className="text-[12px] text-white/55 line-clamp-1 leading-snug">
                    {authorHeadline}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-white/40 mt-0.5">
                    <span>Agora</span>
                    <span>·</span>
                    <Globe size={11} />
                  </div>
                </div>
              </div>
              <MoreHorizontal size={16} className="text-white/50" />
            </div>

            {/* LinkedIn Text */}
            <div className="text-[14px] leading-relaxed text-white/90 whitespace-pre-line mt-1">
              {text || 'Digite o texto do seu post no editor ao lado...'}
              {thread.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/[0.08] text-white/80">
                  {thread.join('\n\n')}
                </div>
              )}
            </div>

            {mediaUrls.length > 0 && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrls[0]}
                alt="Mídia anexada"
                className="mt-2 rounded-lg border border-white/[0.08] max-h-80 w-full object-cover"
              />
            )}

            {/* Reactions Count */}
            <div className="flex items-center justify-between text-[11px] text-white/45 pt-2 border-b border-white/[0.06] pb-2">
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1">
                  <span className="size-4 rounded-full bg-[#0A66C2] flex items-center justify-center text-[9px] text-white">
                    👍
                  </span>
                  <span className="size-4 rounded-full bg-rose-600 flex items-center justify-center text-[9px] text-white">
                    ❤️
                  </span>
                </div>
                <span>38 curtidas</span>
              </div>
              <span>14 comentários</span>
            </div>

            {/* LinkedIn Action Buttons */}
            <div className="flex items-center justify-around text-white/60 text-xs font-semibold pt-1">
              <button type="button" className="flex items-center gap-1.5 py-1.5 px-3 rounded hover:bg-white/[0.05] hover:text-white">
                <ThumbsUp size={16} /> Gostei
              </button>
              <button type="button" className="flex items-center gap-1.5 py-1.5 px-3 rounded hover:bg-white/[0.05] hover:text-white">
                <MessageSquare size={16} /> Comentar
              </button>
              <button type="button" className="flex items-center gap-1.5 py-1.5 px-3 rounded hover:bg-white/[0.05] hover:text-white">
                <Repeat2 size={16} /> Compartilhar
              </button>
              <button type="button" className="flex items-center gap-1.5 py-1.5 px-3 rounded hover:bg-white/[0.05] hover:text-white">
                <Send size={16} /> Enviar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
