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
import { XLogo, LinkedInLogo, InstagramLogo, TikTokLogo } from './BrandIcons';
import type { Platform, ThreadStyle } from '@/types';

interface PostPreviewCardProps {
  text: string;
  linkedinText?: string | null;
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
  linkedinText,
  thread = [],
  threadStyle = 'single',
  authorName = 'Gabriel Bolonhez',
  authorHandle = '@gabolonhez',
  authorHeadline = 'Software Engineer & Tech Founder | Building CreateFlow',
  platforms,
  mediaUrls = [],
}: PostPreviewCardProps) {
  const [activeTab, setActiveTab] = useState<Platform>(
    platforms.includes('instagram')
      ? 'instagram'
      : platforms.includes('x')
      ? 'x'
      : platforms.includes('linkedin')
      ? 'linkedin'
      : 'tiktok'
  );

  return (
    <div className="flex flex-col rounded-[20px] overflow-hidden bg-[#161616] border border-[#242424] shadow-xl">
      {/* Network Switcher Header (macOS Chrome) */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#121212] border-b border-[#1f1f1f] flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-1">
            <span className="size-2 rounded-full bg-[#ff5f56]" />
            <span className="size-2 rounded-full bg-[#ffbd2e]" />
            <span className="size-2 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-[11px] font-mono text-[#8a8a8a] uppercase tracking-wider">PREVIEW REAL</span>
          {platforms.length > 1 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[5px] bg-[#262626] text-[#a0a0a0]">
              CROSS-POST
            </span>
          )}
        </div>

        <div className="inline-flex items-center p-0.5 rounded-full bg-[#1a1a1a] border border-[#262626] flex-wrap">
          {platforms.includes('x') && (
            <button
              type="button"
              onClick={() => setActiveTab('x')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                activeTab === 'x'
                  ? 'bg-[#f2f2f2] text-[#0a0a0a] shadow-sm'
                  : 'text-[#8a8a8a] hover:text-[#ececec]'
              }`}
            >
              <XLogo className="size-3" />
              <span>X</span>
            </button>
          )}

          {platforms.includes('linkedin') && (
            <button
              type="button"
              onClick={() => setActiveTab('linkedin')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                activeTab === 'linkedin'
                  ? 'bg-[#0A66C2] text-white shadow-sm'
                  : 'text-[#8a8a8a] hover:text-[#ececec]'
              }`}
            >
              <LinkedInLogo className="size-3 text-current" />
              <span>LinkedIn</span>
            </button>
          )}

          {platforms.includes('instagram') && (
            <button
              type="button"
              onClick={() => setActiveTab('instagram')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                activeTab === 'instagram'
                  ? 'bg-[#282828] text-white shadow-sm'
                  : 'text-[#8a8a8a] hover:text-[#ececec]'
              }`}
            >
              <InstagramLogo className="size-3 text-pink-400" />
              <span>Reels / IG</span>
            </button>
          )}

          {platforms.includes('tiktok') && (
            <button
              type="button"
              onClick={() => setActiveTab('tiktok')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                activeTab === 'tiktok'
                  ? 'bg-[#282828] text-white shadow-sm'
                  : 'text-[#8a8a8a] hover:text-[#ececec]'
              }`}
            >
              <TikTokLogo className="size-3 text-cyan-400" />
              <span>TikTok</span>
            </button>
          )}
        </div>
      </div>

      {/* Preview Content Body */}
      <div className="p-4 sm:p-5 bg-[#121212]">
        {activeTab === 'x' ? (
          /* X / TWITTER POST PREVIEW */
          <div className="flex flex-col gap-3 font-sans text-[14px] text-[#ececec]">
            {/* Main Tweet */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="size-10 rounded-full bg-[#262626] border border-[#333333] flex items-center justify-center font-medium text-xs text-[#ececec] shrink-0">
                  GB
                </div>
                {thread.length > 0 && (
                  <div className="w-0.5 flex-1 bg-[#2a2a2a] my-1 rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-white text-[14px] hover:underline cursor-pointer">
                      {authorName}
                    </span>
                    <span className="text-[#6f6f6f] text-[13px]">{authorHandle}</span>
                    <span className="text-[#4a4a4a] text-[12px]">· agora</span>
                  </div>
                  <MoreHorizontal size={14} className="text-[#6f6f6f]" />
                </div>

                <p className="whitespace-pre-line leading-relaxed text-[#ececec]">
                  {text || 'Digite o texto do seu post no editor ao lado...'}
                </p>

                {mediaUrls.length > 0 && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaUrls[0]}
                    alt="Mídia anexada"
                    className="mt-3 rounded-2xl border border-[#2a2a2a] max-h-72 w-full object-cover"
                  />
                )}

                {/* Tweet Action Icons */}
                <div className="flex items-center justify-between mt-3 pt-2 text-[#6f6f6f] max-w-md">
                  <span className="flex items-center gap-1.5 hover:text-[#ececec] cursor-pointer text-xs">
                    <MessageCircle size={15} /> 12
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-[#7ae6a0] cursor-pointer text-xs">
                    <Repeat2 size={16} /> 5
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-[#ff5f56] cursor-pointer text-xs">
                    <Heart size={15} /> 48
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-[#ececec] cursor-pointer text-xs">
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
                  <div className="size-10 rounded-full bg-[#262626] border border-[#333333] flex items-center justify-center font-medium text-xs text-[#ececec] shrink-0">
                    GB
                  </div>
                  {idx < thread.length - 1 && (
                    <div className="w-0.5 flex-1 bg-[#2a2a2a] my-1 rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-semibold text-white text-[14px]">{authorName}</span>
                    <span className="text-[#6f6f6f] text-[13px]">{authorHandle}</span>
                    <span className="text-[#4a4a4a] text-[12px]">· {idx + 2}/{thread.length + 1}</span>
                  </div>

                  <p className="whitespace-pre-line leading-relaxed text-[#ececec]">{t}</p>

                  <div className="flex items-center justify-between mt-2 pt-1 text-[#6f6f6f] max-w-md">
                    <span className="flex items-center gap-1.5 text-xs"><MessageCircle size={14} /></span>
                    <span className="flex items-center gap-1.5 text-xs"><Repeat2 size={15} /></span>
                    <span className="flex items-center gap-1.5 text-xs"><Heart size={14} /></span>
                    <span className="flex items-center gap-1.5 text-xs"><Share size={14} /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'linkedin' ? (
          /* LINKEDIN FEED POST PREVIEW */
          <div className="flex flex-col gap-3 font-sans text-[14px]">
            {/* LinkedIn Header */}
            <div className="flex items-start justify-between">
              <div className="flex gap-2.5">
                <div className="size-11 rounded-full bg-[#0A66C2] flex items-center justify-center font-semibold text-sm text-white shrink-0">
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
              {linkedinText || text || 'Digite o texto do seu post no editor ao lado...'}
              {!linkedinText && thread.length > 0 && (
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
        ) : activeTab === 'instagram' ? (
          /* INSTAGRAM REELS & POST PREVIEW */
          <div className="flex flex-col gap-3 font-sans text-[14px]">
            {/* Instagram Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600 p-[2px]">
                  <div className="size-full rounded-full bg-black flex items-center justify-center font-bold text-[10px] text-white">
                    GB
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white text-xs hover:underline cursor-pointer">
                    {authorHandle.replace('@', '')}
                  </span>
                  <span className="text-[10px] text-white/40">Áudio original · Gabriel Bolonhez</span>
                </div>
              </div>
              <MoreHorizontal size={15} className="text-white/50" />
            </div>

            {/* Media Box (9:16 vertical or video preview) */}
            <div className="relative aspect-[9/14] w-full rounded-xl bg-black border border-white/[0.1] overflow-hidden flex items-center justify-center">
              {mediaUrls.length > 0 ? (
                /\.(mp4|mov|webm|avi)$/i.test(mediaUrls[0]) || mediaUrls[0].includes('video') ? (
                  <video
                    src={mediaUrls[0]}
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaUrls[0]}
                    alt="Mídia Instagram"
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-white/40">
                  <InstagramLogo className="size-10 text-pink-400/60" />
                  <span className="text-xs font-mono">Vídeo ou imagem do Reels</span>
                </div>
              )}

              {/* Instagram Floating Reels Actions */}
              <div className="absolute right-3 bottom-12 flex flex-col items-center gap-3.5 z-10 text-white drop-shadow-md">
                <span className="flex flex-col items-center gap-0.5 text-[10px] font-semibold">
                  <Heart size={20} className="hover:scale-110 transition-transform" /> 2.4k
                </span>
                <span className="flex flex-col items-center gap-0.5 text-[10px] font-semibold">
                  <MessageCircle size={20} className="hover:scale-110 transition-transform" /> 184
                </span>
                <span className="flex flex-col items-center gap-0.5 text-[10px] font-semibold">
                  <Send size={18} className="hover:scale-110 transition-transform" /> 92
                </span>
                <Bookmark size={18} />
              </div>
            </div>

            {/* Caption & Auto-DM badge */}
            <div className="flex flex-col gap-1 text-xs">
              <p className="text-white/90 leading-relaxed whitespace-pre-line">
                <span className="font-semibold text-white mr-1.5">{authorHandle.replace('@', '')}</span>
                {text || 'Legenda do Reels com gancho forte nas primeiras 2 linhas...'}
              </p>
              <span className="text-[11px] text-white/40 font-mono">há 2 horas</span>
            </div>
          </div>
        ) : (
          /* TIKTOK PREVIEW */
          <div className="flex flex-col gap-3 font-sans text-[14px]">
            {/* Media Box 9:16 */}
            <div className="relative aspect-[9/15] w-full rounded-2xl bg-black border border-white/[0.1] overflow-hidden flex items-center justify-center">
              {mediaUrls.length > 0 ? (
                /\.(mp4|mov|webm|avi)$/i.test(mediaUrls[0]) || mediaUrls[0].includes('video') ? (
                  <video
                    src={mediaUrls[0]}
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaUrls[0]}
                    alt="Mídia TikTok"
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-white/40">
                  <TikTokLogo className="size-10 text-cyan-400/60" />
                  <span className="text-xs font-mono">Vídeo Vertical TikTok</span>
                </div>
              )}

              {/* TikTok Bottom Bar info */}
              <div className="absolute left-3 bottom-4 right-14 z-10 flex flex-col gap-1 text-white drop-shadow-md">
                <span className="font-bold text-xs">@{authorHandle.replace('@', '')}</span>
                <p className="text-[11px] line-clamp-2 text-white/90 leading-snug">
                  {text || 'Legenda do TikTok com hashtags...'}
                </p>
                <span className="text-[10px] text-white/70 font-mono">🎵 som original - {authorName}</span>
              </div>

              {/* TikTok Right Actions */}
              <div className="absolute right-3 bottom-6 flex flex-col items-center gap-3 z-10 text-white drop-shadow-md">
                <div className="size-8 rounded-full bg-gradient-to-tr from-cyan-400 to-pink-500 p-[1.5px] mb-1">
                  <div className="size-full rounded-full bg-black flex items-center justify-center font-bold text-[9px]">
                    GB
                  </div>
                </div>
                <span className="flex flex-col items-center text-[10px] font-semibold"><Heart size={20} /> 3.8k</span>
                <span className="flex flex-col items-center text-[10px] font-semibold"><MessageCircle size={20} /> 412</span>
                <span className="flex flex-col items-center text-[10px] font-semibold"><Bookmark size={20} /> 1.2k</span>
                <span className="flex flex-col items-center text-[10px] font-semibold"><Share size={18} /> 254</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
