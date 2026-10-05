'use client';

import React, { useState } from 'react';
import {
  Lightbulb,
  Plus,
  Sparkles,
  Trash2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { XLogo, LinkedInLogo } from './BrandIcons';
import type { PostIdea, Platform } from '@/types';

interface MyIdeasViewProps {
  ideas: PostIdea[];
  onSaveIdea: (idea: Partial<PostIdea>) => Promise<void>;
  onDeleteIdea: (id: string) => Promise<void>;
  onGenerateFromIdea: (idea: PostIdea) => void;
}

export function MyIdeasView({
  ideas,
  onSaveIdea,
  onDeleteIdea,
  onGenerateFromIdea,
}: MyIdeasViewProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newNote, setNewNote] = useState('');
  const [platforms, setPlatforms] = useState<Platform[]>(['x', 'linkedin']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePlatform = (p: Platform) => {
    if (platforms.includes(p)) {
      if (platforms.length > 1) {
        setPlatforms(platforms.filter((x) => x !== p));
      }
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await onSaveIdea({
        title: newTitle.trim(),
        note: newNote.trim(),
        platforms,
        status: 'NEW',
      });
      setNewTitle('');
      setNewNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Quick Capture Panel */}
      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 p-4 rounded-xl bg-white/[0.025] border border-white/[0.08]"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-white/90">
          <Lightbulb size={15} className="text-amber-400" />
          <span>Captura Rápida de Ideia</span>
        </div>

        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Ideia ou gancho central (ex: Por que parei de usar micro-serviços no início)..."
          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs placeholder:text-white/35 focus:outline-none focus:border-violet-500/50"
        />

        <textarea
          rows={2}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Notas livres, detalhes do caso ou link de referência (opcional)..."
          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs placeholder:text-white/35 focus:outline-none focus:border-violet-500/50 resize-none"
        />

        <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
          {/* Platforms toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-white/40">Destino:</span>
            <button
              type="button"
              onClick={() => togglePlatform('x')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all ${
                platforms.includes('x')
                  ? 'bg-white text-black font-semibold'
                  : 'bg-white/[0.05] text-white/40 hover:text-white'
              }`}
            >
              <XLogo className="size-2.5" />
              <span>X</span>
            </button>
            <button
              type="button"
              onClick={() => togglePlatform('linkedin')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all ${
                platforms.includes('linkedin')
                  ? 'bg-[#0A66C2] text-white font-semibold'
                  : 'bg-white/[0.05] text-white/40 hover:text-white'
              }`}
            >
              <LinkedInLogo className="size-2.5 text-white" />
              <span>LinkedIn</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={!newTitle.trim() || isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-white/90 disabled:opacity-40 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Salvar ideia</span>
          </button>
        </div>
      </form>

      {/* Grid of Saved Ideas */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono text-white/50 uppercase tracking-wider">
            IDEIAS SALVAS ({ideas.length})
          </h3>
        </div>

        {ideas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="flex flex-col justify-between p-4 rounded-xl bg-[#0f0f15] border border-white/[0.07] hover:border-white/[0.14] transition-all group shadow-sm"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {idea.platforms.includes('x') && <XLogo className="size-3 text-white/70" />}
                      {idea.platforms.includes('linkedin') && (
                        <LinkedInLogo className="size-3 text-[#0A66C2]" />
                      )}
                    </div>
                    {idea.status === 'DRAFTED' ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Post criado
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-white/40">
                        Nova
                      </span>
                    )}
                  </div>

                  <h4 className="text-[13px] font-semibold text-white/90 leading-snug">
                    {idea.title}
                  </h4>

                  {idea.note && (
                    <p className="text-xs text-white/50 line-clamp-3 leading-relaxed">
                      {idea.note}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.05]">
                  <button
                    type="button"
                    onClick={() => onGenerateFromIdea(idea)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-violet-300 hover:text-violet-200 transition-colors"
                  >
                    <Sparkles size={13} className="text-violet-400" />
                    <span>Gerar post</span>
                    <ArrowRight size={12} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteIdea(idea.id)}
                    className="p-1 rounded text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-white/[0.015] border border-white/[0.05]">
            <p className="text-xs text-white/40">
              Nenhuma ideia cadastrada. Adicione pensamentos rápidos acima para virar posts depois.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
