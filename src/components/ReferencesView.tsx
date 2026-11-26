'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  ExternalLink,
  Trash2,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';
import { XLogo, LinkedInLogo, InstagramLogo, TikTokLogo } from './BrandIcons';
import type { Reference, Platform } from '@/types';

interface ReferencesViewProps {
  references: Reference[];
  onAnalyzeAndSave: (
    text: string,
    platform: Platform,
    url?: string,
    author?: string
  ) => Promise<void>;
  onDeleteReference: (id: string) => Promise<void>;
  onUseTemplate: (reference: Reference) => void;
}

export function ReferencesView({
  references,
  onAnalyzeAndSave,
  onDeleteReference,
  onUseTemplate,
}: ReferencesViewProps) {
  const [url, setUrl] = useState('');
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [platform, setPlatform] = useState<Platform>('x');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsAnalyzing(true);
    try {
      await onAnalyzeAndSave(text.trim(), platform, url.trim() || undefined, author.trim() || undefined);
      setUrl('');
      setAuthor('');
      setText('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyTemplate = (id: string, templateStr?: string) => {
    if (!templateStr) return;
    navigator.clipboard.writeText(templateStr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Reverse Engineering Panel */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 p-5 rounded-[22px] bg-[#141414] border border-[#242424]"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-[#ececec]">
          <BookOpen size={15} className="text-[#8a8a8a]" />
          <span>Engenharia Reversa de Post Viral (Referência)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Link do post original (opcional)..."
            className="px-3.5 py-2.5 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4a4a4a] transition-colors"
          />

          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Nome / @ do Autor..."
            className="px-3.5 py-2.5 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4a4a4a] transition-colors"
          />

          <div className="flex items-center gap-1 p-1 rounded-full bg-[#0e0e0e] border border-[#262626]">
            <button
              type="button"
              onClick={() => setPlatform('x')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                platform === 'x'
                  ? 'bg-[#f2f2f2] text-[#0a0a0a]'
                  : 'text-[#8a8a8a] hover:text-[#ececec]'
              }`}
            >
              <XLogo className="size-3" />
              <span>X (Twitter)</span>
            </button>

            <button
              type="button"
              onClick={() => setPlatform('linkedin')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                platform === 'linkedin'
                  ? 'bg-[#0A66C2] text-white'
                  : 'text-[#8a8a8a] hover:text-[#ececec]'
              }`}
            >
              <LinkedInLogo className="size-3" />
              <span>LinkedIn</span>
            </button>

            <button
              type="button"
              onClick={() => setPlatform('instagram')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                platform === 'instagram'
                  ? 'bg-[#212121] text-[#ececec]'
                  : 'text-[#8a8a8a] hover:text-[#ececec]'
              }`}
            >
              <InstagramLogo className="size-3" />
              <span>IG</span>
            </button>

            <button
              type="button"
              onClick={() => setPlatform('tiktok')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                platform === 'tiktok'
                  ? 'bg-[#212121] text-[#ececec]'
                  : 'text-[#8a8a8a] hover:text-[#ececec]'
              }`}
            >
              <TikTokLogo className="size-3" />
              <span>TikTok</span>
            </button>
          </div>
        </div>

        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Cole aqui o texto completo do post que você quer desconstruir e modelar..."
          className="w-full px-3.5 py-2.5 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4a4a4a] resize-none transition-colors"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!text.trim() || isAnalyzing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] disabled:opacity-40 transition-all cursor-pointer active:scale-[0.97]"
          >
            <Sparkles size={13} className={isAnalyzing ? 'animate-spin' : ''} />
            <span>{isAnalyzing ? 'Desconstruindo com IA…' : 'Desconstruir & Gerar Template'}</span>
          </button>
        </div>
      </form>

      {/* References Grid */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[11px] font-mono text-[#6f6f6f] uppercase tracking-wider">
          REFERÊNCIAS & TEMPLATES SALVOS ({references.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {references.map((ref) => (
            <div
              key={ref.id}
              className="flex flex-col justify-between p-5 rounded-[20px] bg-[#161616] border border-[#222222] hover:border-[#323232] transition-all group"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {ref.platform === 'x' ? (
                      <XLogo className="size-3 text-[#ececec]" />
                    ) : ref.platform === 'linkedin' ? (
                      <LinkedInLogo className="size-3 text-[#0A66C2]" />
                    ) : ref.platform === 'instagram' ? (
                      <InstagramLogo className="size-3 text-[#ececec]" />
                    ) : (
                      <TikTokLogo className="size-3 text-[#ececec]" />
                    )}
                    <span className="text-xs font-semibold text-[#ececec]">{ref.author}</span>
                  </div>

                  {ref.url && (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#7a7a7a] hover:text-[#ececec] transition-colors"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>

                {/* Original Snippet */}
                <div className="p-3 rounded-[14px] bg-[#1c1c1c] border border-[#262626] text-xs text-[#9a9a9a] italic line-clamp-3">
                  "{ref.text}"
                </div>

                {/* AI Breakdown */}
                {ref.hook_analysis && (
                  <div className="flex flex-col gap-1 text-[11px] text-[#9a9a9a] bg-[#212121] border border-[#2c2c2c] p-3 rounded-[14px]">
                    <div>
                      <strong className="text-[#ececec] font-medium">Gancho: </strong>
                      {ref.hook_analysis}
                    </div>
                    {ref.structure && (
                      <div className="mt-1">
                        <strong className="text-[#ececec] font-medium">Estrutura: </strong>
                        {ref.structure}
                      </div>
                    )}
                  </div>
                )}

                {/* Reusable Template */}
                {ref.reusable_template && (
                  <div className="flex flex-col gap-1 text-[11px] font-mono text-[#7ae6a0] bg-[#141414] border border-[#7ae6a0]/25 p-3 rounded-[14px]">
                    <div className="flex items-center justify-between text-[10px] text-[#7ae6a0] font-semibold mb-0.5">
                      <span>TEMPLATE REUTILIZÁVEL:</span>
                      <button
                        type="button"
                        onClick={() => copyTemplate(ref.id, ref.reusable_template)}
                        className="flex items-center gap-1 text-[#8a8a8a] hover:text-[#ececec] transition-colors cursor-pointer"
                      >
                        {copiedId === ref.id ? <Check size={11} className="text-[#7ae6a0]" /> : <Copy size={11} />}
                        <span>{copiedId === ref.id ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                    <span className="whitespace-pre-line leading-relaxed">{ref.reusable_template}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3.5 mt-4 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={() => onUseTemplate(ref)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2e2e2e] transition-all active:scale-[0.97] cursor-pointer"
                >
                  <Sparkles size={12} className="text-[#a0a0a0]" />
                  <span>Gerar post usando este modelo</span>
                  <ArrowRight size={11} />
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteReference(ref.id)}
                  className="p-1.5 rounded-full text-[#7a7a7a] hover:text-[#ff5f56] hover:bg-[#ff5f56]/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
