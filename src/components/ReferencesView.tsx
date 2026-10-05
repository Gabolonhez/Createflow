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
import { XLogo, LinkedInLogo } from './BrandIcons';
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
        className="flex flex-col gap-3 p-4 rounded-xl bg-white/[0.025] border border-white/[0.08]"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-white/90">
          <BookOpen size={15} className="text-violet-400" />
          <span>Engenharia Reversa de Post Viral (Referência)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Link do post original (opcional)..."
            className="px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs placeholder:text-white/35 focus:outline-none focus:border-violet-500/50"
          />

          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Nome / @ do Autor..."
            className="px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs placeholder:text-white/35 focus:outline-none focus:border-violet-500/50"
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPlatform('x')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                platform === 'x'
                  ? 'bg-white text-black font-semibold'
                  : 'bg-white/[0.05] text-white/50 hover:text-white'
              }`}
            >
              <XLogo className="size-3" />
              <span>X (Twitter)</span>
            </button>

            <button
              type="button"
              onClick={() => setPlatform('linkedin')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                platform === 'linkedin'
                  ? 'bg-[#0A66C2] text-white font-semibold'
                  : 'bg-white/[0.05] text-white/50 hover:text-white'
              }`}
            >
              <LinkedInLogo className="size-3 text-white" />
              <span>LinkedIn</span>
            </button>
          </div>
        </div>

        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Cole aqui o texto completo do post que você quer desconstruir e modelar..."
          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs placeholder:text-white/35 focus:outline-none focus:border-violet-500/50 resize-none"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!text.trim() || isAnalyzing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-violet-600/20 active:scale-[0.98]"
          >
            <Sparkles size={14} className={isAnalyzing ? 'animate-spin' : ''} />
            <span>{isAnalyzing ? 'Desconstruindo com IA…' : 'Desconstruir & Gerar Template'}</span>
          </button>
        </div>
      </form>

      {/* References Grid */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-mono text-white/50 uppercase tracking-wider">
          REFERÊNCIAS & TEMPLATES SALVOS ({references.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {references.map((ref) => (
            <div
              key={ref.id}
              className="flex flex-col justify-between p-4 rounded-xl bg-[#0f0f15] border border-white/[0.07] hover:border-violet-500/30 transition-all group"
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {ref.platform === 'x' ? (
                      <XLogo className="size-3 text-white/80" />
                    ) : (
                      <LinkedInLogo className="size-3 text-[#0A66C2]" />
                    )}
                    <span className="text-xs font-semibold text-white/90">{ref.author}</span>
                  </div>

                  {ref.url && (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>

                {/* Original Snippet */}
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.05] text-xs text-white/70 italic line-clamp-3">
                  "{ref.text}"
                </div>

                {/* AI Breakdown */}
                {ref.hook_analysis && (
                  <div className="flex flex-col gap-1 text-[11px] text-white/75 bg-violet-500/[0.06] border border-violet-500/20 p-2.5 rounded-lg">
                    <div>
                      <strong className="text-violet-300 font-medium">Gancho: </strong>
                      {ref.hook_analysis}
                    </div>
                    {ref.structure && (
                      <div className="mt-1">
                        <strong className="text-violet-300 font-medium">Estrutura: </strong>
                        {ref.structure}
                      </div>
                    )}
                  </div>
                )}

                {/* Reusable Template */}
                {ref.reusable_template && (
                  <div className="flex flex-col gap-1 text-[11px] font-mono text-emerald-300 bg-emerald-500/[0.06] border border-emerald-500/20 p-2.5 rounded-lg">
                    <div className="flex items-center justify-between text-[10px] text-emerald-400 font-semibold mb-0.5">
                      <span>TEMPLATE REUTILIZÁVEL:</span>
                      <button
                        type="button"
                        onClick={() => copyTemplate(ref.id, ref.reusable_template)}
                        className="flex items-center gap-1 text-white/50 hover:text-white transition-colors"
                      >
                        {copiedId === ref.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        <span>{copiedId === ref.id ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                    <span className="whitespace-pre-line leading-relaxed">{ref.reusable_template}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.05]">
                <button
                  type="button"
                  onClick={() => onUseTemplate(ref)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-violet-300 hover:text-violet-200 transition-colors"
                >
                  <Sparkles size={13} className="text-violet-400" />
                  <span>Gerar post usando este modelo</span>
                  <ArrowRight size={12} />
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteReference(ref.id)}
                  className="p-1 rounded text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
