'use client';

import React, { useState } from 'react';
import {
  Lightbulb,
  Plus,
  Sparkles,
  Trash2,
  ArrowRight,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { XLogo, LinkedInLogo } from './BrandIcons';
import type { PostIdea, Platform } from '@/types';

interface MyIdeasViewProps {
  ideas: PostIdea[];
  onSaveIdea: (idea: Partial<PostIdea>) => Promise<void>;
  onDeleteIdea: (id: string) => Promise<void>;
  onGenerateFromIdea: (idea: PostIdea) => void;
  onGenerateIdeasWithAi?: () => Promise<void>;
  onOpenSprayFromIdea?: (idea: PostIdea) => void;
  onOpenSprayNew?: () => void;
}

export function MyIdeasView({
  ideas,
  onSaveIdea,
  onDeleteIdea,
  onGenerateFromIdea,
  onGenerateIdeasWithAi,
  onOpenSprayFromIdea,
  onOpenSprayNew,
}: MyIdeasViewProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newNote, setNewNote] = useState('');
  const [platforms, setPlatforms] = useState<Platform[]>(['x', 'linkedin']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

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

  const handleTriggerAiIdeas = async () => {
    if (!onGenerateIdeasWithAi || isGeneratingAi) return;
    setIsGeneratingAi(true);
    try {
      await onGenerateIdeasWithAi();
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Action Header with AI Generator */}
      <div className="flex items-center justify-between p-4 sm:p-5 rounded-[22px] bg-[#141414] border border-[#242424] flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-[#212121] border border-[#2c2c2c] flex items-center justify-center text-[#ececec]">
            <Lightbulb size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold tracking-tight text-[#ececec]">
              Banco de Ideias ({ideas.length})
            </span>
            <span className="text-[11px] text-[#7a7a7a]">
              Pautas autênticas prontas para virar posts no X e LinkedIn
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenSprayNew && (
            <button
              type="button"
              onClick={onOpenSprayNew}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2e2e2e] transition-all active:scale-[0.97] cursor-pointer"
            >
              <Zap size={13} className="text-[#a0a0a0]" />
              <span>Atomizar Ideia</span>
            </button>
          )}

          {onGenerateIdeasWithAi && (
            <button
              type="button"
              onClick={handleTriggerAiIdeas}
              disabled={isGeneratingAi}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] transition-all active:scale-[0.97] disabled:opacity-50 cursor-pointer"
            >
              <Sparkles size={13} className={isGeneratingAi ? 'animate-spin' : ''} />
              <span>{isGeneratingAi ? 'Consultando IA & referências…' : 'Sugerir Ideias com IA (+5)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Capture Panel */}
      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 p-5 rounded-[22px] bg-[#141414] border border-[#242424]"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-[#ececec]">
          <Plus size={14} className="text-[#8a8a8a]" />
          <span>Captura Manual Rápida</span>
        </div>

        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Ideia ou gancho central (ex: Por que parei de usar micro-serviços no início)..."
          className="w-full px-3.5 py-2.5 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4a4a4a] transition-colors"
        />

        <textarea
          rows={2}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Notas livres, detalhes do caso ou link de referência (opcional)..."
          className="w-full px-3.5 py-2.5 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4a4a4a] resize-none transition-colors"
        />

        <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
          {/* Platforms toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-[#6f6f6f]">Destino:</span>
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#0e0e0e] border border-[#262626]">
              <button
                type="button"
                onClick={() => togglePlatform('x')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                  platforms.includes('x')
                    ? 'bg-[#f2f2f2] text-[#0a0a0a]'
                    : 'text-[#8a8a8a] hover:text-[#ececec]'
                }`}
              >
                <XLogo className="size-2.5" />
                <span>X</span>
              </button>
              <button
                type="button"
                onClick={() => togglePlatform('linkedin')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                  platforms.includes('linkedin')
                    ? 'bg-[#0A66C2] text-white'
                    : 'text-[#8a8a8a] hover:text-[#ececec]'
                }`}
              >
                <LinkedInLogo className="size-2.5" />
                <span>LinkedIn</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!newTitle.trim() || isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] disabled:opacity-40 transition-all active:scale-[0.97] cursor-pointer"
          >
            <Plus size={14} />
            <span>Salvar ideia</span>
          </button>
        </div>
      </form>

      {/* Grid of Saved Ideas */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-mono text-[#6f6f6f] uppercase tracking-wider">
            IDEIAS SALVAS ({ideas.length})
          </h3>
        </div>

        {ideas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="flex flex-col justify-between p-5 rounded-[20px] bg-[#161616] border border-[#222222] hover:border-[#323232] transition-all group"
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {idea.platforms.includes('x') && <XLogo className="size-3 text-[#ececec]" />}
                      {idea.platforms.includes('linkedin') && (
                        <LinkedInLogo className="size-3 text-[#0A66C2]" />
                      )}
                    </div>
                    {idea.status === 'DRAFTED' ? (
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#7ae6a0]/10 text-[#7ae6a0] border border-[#7ae6a0]/25">
                        Post criado
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#212121] text-[#8a8a8a] border border-[#2c2c2c]">
                        Nova
                      </span>
                    )}
                  </div>

                  <h4 className="text-[13px] font-semibold text-[#ececec] leading-snug">
                    {idea.title}
                  </h4>

                  {idea.note && (
                    <p className="text-xs text-[#8a8a8a] line-clamp-3 leading-relaxed">
                      {idea.note}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3.5 mt-4 border-t border-[#222222]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => onGenerateFromIdea(idea)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2e2e2e] transition-all active:scale-[0.97] cursor-pointer"
                    >
                      <Sparkles size={12} className="text-[#a0a0a0]" />
                      <span>Gerar post</span>
                      <ArrowRight size={11} />
                    </button>

                    {onOpenSprayFromIdea && (
                      <button
                        type="button"
                        onClick={() => onOpenSprayFromIdea(idea)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium text-[#a0a0a0] hover:text-[#ececec] bg-[#1c1c1c] hover:bg-[#242424] border border-[#2a2a2a] transition-all active:scale-[0.97] cursor-pointer"
                        title="Atomizar em 3 formatos (Contrarian, Thread e LinkedIn Deep Dive)"
                      >
                        <Zap size={11} />
                        <span>Atomizar</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteIdea(idea.id)}
                    className="p-1.5 rounded-full text-[#7a7a7a] hover:text-[#ff5f56] hover:bg-[#ff5f56]/10 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center rounded-[22px] bg-[#141414] border border-[#242424]">
            <p className="text-xs text-[#7a7a7a]">
              Nenhuma ideia cadastrada. Adicione pensamentos rápidos acima para virar posts depois.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
