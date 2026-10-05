'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Lightbulb,
  Flame,
  FileText,
  BookOpen,
  Layers,
  Loader2,
} from 'lucide-react';
import { XLogo, LinkedInLogo } from './BrandIcons';
import type {
  Platform,
  ThreadStyle,
  PostIdea,
  Topic,
  Fact,
  Reference,
  CreatorPost,
} from '@/types';

interface GeneratePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: {
    sourceType: 'idea' | 'topic' | 'fact' | 'reference' | 'scratch';
    sourceTitle?: string;
    sourceContent?: string;
    pillar?: string;
    platforms: Platform[];
    threadStyle?: ThreadStyle;
    threadLength?: number;
    instruction?: string;
  }) => Promise<{ success: boolean; post?: CreatorPost; error?: string }>;
  ideas: PostIdea[];
  topics: Topic[];
  facts: Fact[];
  references: Reference[];
  prefilledIdea?: PostIdea | null;
  prefilledTopic?: Topic | null;
  prefilledReference?: Reference | null;
}

export function GeneratePostModal({
  isOpen,
  onClose,
  onGenerate,
  ideas,
  topics,
  facts,
  references,
  prefilledIdea,
  prefilledTopic,
  prefilledReference,
}: GeneratePostModalProps) {
  if (!isOpen) return null;

  const [sourceType, setSourceType] = useState<'idea' | 'topic' | 'fact' | 'reference' | 'scratch'>(
    prefilledIdea ? 'idea' : prefilledTopic ? 'topic' : prefilledReference ? 'reference' : 'scratch'
  );

  const [selectedIdeaId, setSelectedIdeaId] = useState<string>(prefilledIdea?.id || '');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(prefilledTopic?.id || '');
  const [selectedFactId, setSelectedFactId] = useState<string>('');
  const [selectedRefId, setSelectedRefId] = useState<string>(prefilledReference?.id || '');

  const [scratchTopic, setScratchTopic] = useState('');
  const [format, setFormat] = useState<'single' | 'thread'>('single');
  const [threadLength, setThreadLength] = useState(3);
  const [platforms, setPlatforms] = useState<Platform[]>(['x', 'linkedin']);
  const [instruction, setInstruction] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePlatform = (p: Platform) => {
    if (platforms.includes(p)) {
      if (platforms.length > 1) {
        setPlatforms(platforms.filter((x) => x !== p));
      }
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      let sourceTitle = '';
      let sourceContent = '';
      let pillar = 'tech-insights';

      if (sourceType === 'idea') {
        const item = ideas.find((i) => i.id === selectedIdeaId) || prefilledIdea;
        sourceTitle = item?.title || '';
        sourceContent = item?.note || '';
        pillar = item?.pillar || 'tech-insights';
      } else if (sourceType === 'topic') {
        const item = topics.find((t) => t.id === selectedTopicId) || prefilledTopic;
        sourceTitle = item?.title || '';
        sourceContent = item?.hook_angle || '';
        pillar = item?.pillar || 'tech-insights';
      } else if (sourceType === 'fact') {
        const item = facts.find((f) => f.id === selectedFactId);
        sourceTitle = item?.subject || '';
        sourceContent = item?.detail || '';
      } else if (sourceType === 'reference') {
        const item = references.find((r) => r.id === selectedRefId) || prefilledReference;
        sourceTitle = `Modelando estilo de ${item?.author || 'Referência'}`;
        sourceContent = item?.reusable_template || item?.text || '';
      } else {
        sourceTitle = scratchTopic;
      }

      const res = await onGenerate({
        sourceType,
        sourceTitle,
        sourceContent,
        pillar,
        platforms,
        threadStyle: format === 'thread' ? 'thread' : 'single',
        threadLength: format === 'thread' ? threadLength : 0,
        instruction: instruction.trim() || undefined,
      });

      if (res.error) {
        setError(res.error);
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0c0c12] border border-white/[0.1] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-violet-400" />
            <span className="font-semibold text-sm text-white">Gerar Post com IA</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08]"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Source Type Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-white/50">Base de Origem do Post:</label>
            <div className="grid grid-cols-5 gap-1.5 p-1 rounded-lg bg-black/40 border border-white/[0.06]">
              <button
                type="button"
                onClick={() => setSourceType('scratch')}
                className={`py-1.5 px-2 rounded text-[11px] font-medium transition-all ${
                  sourceType === 'scratch'
                    ? 'bg-violet-600 text-white font-semibold shadow-sm'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                Do Zero
              </button>
              <button
                type="button"
                onClick={() => setSourceType('idea')}
                className={`py-1.5 px-2 rounded text-[11px] font-medium transition-all ${
                  sourceType === 'idea'
                    ? 'bg-violet-600 text-white font-semibold shadow-sm'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                Ideia
              </button>
              <button
                type="button"
                onClick={() => setSourceType('topic')}
                className={`py-1.5 px-2 rounded text-[11px] font-medium transition-all ${
                  sourceType === 'topic'
                    ? 'bg-violet-600 text-white font-semibold shadow-sm'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                Pauta
              </button>
              <button
                type="button"
                onClick={() => setSourceType('fact')}
                className={`py-1.5 px-2 rounded text-[11px] font-medium transition-all ${
                  sourceType === 'fact'
                    ? 'bg-violet-600 text-white font-semibold shadow-sm'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                Fato Real
              </button>
              <button
                type="button"
                onClick={() => setSourceType('reference')}
                className={`py-1.5 px-2 rounded text-[11px] font-medium transition-all ${
                  sourceType === 'reference'
                    ? 'bg-violet-600 text-white font-semibold shadow-sm'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                Modelo
              </button>
            </div>
          </div>

          {/* Conditional Picker for Selected Source */}
          {sourceType === 'scratch' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-white/50">Sobre o que você quer falar?</label>
              <input
                type="text"
                value={scratchTopic}
                onChange={(e) => setScratchTopic(e.target.value)}
                placeholder="Ex: Como lidar com dívida técnica em startups iniciantes..."
                className="px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50"
              />
            </div>
          )}

          {sourceType === 'idea' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-white/50">Escolha a Ideia Salva:</label>
              <select
                value={selectedIdeaId}
                onChange={(e) => setSelectedIdeaId(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#14141c] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50"
              >
                <option value="">Selecione uma ideia...</option>
                {ideas.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {sourceType === 'topic' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-white/50">Escolha a Pauta:</label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#14141c] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50"
              >
                <option value="">Selecione uma pauta...</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {sourceType === 'fact' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-white/50">Escolha o Fato Real:</label>
              <select
                value={selectedFactId}
                onChange={(e) => setSelectedFactId(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#14141c] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50"
              >
                <option value="">Selecione um fato cadastrado...</option>
                {facts.map((f) => (
                  <option key={f.id} value={f.id}>
                    [{f.category}] {f.subject}
                  </option>
                ))}
              </select>
            </div>
          )}

          {sourceType === 'reference' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-white/50">Escolha o Modelo/Referência:</label>
              <select
                value={selectedRefId}
                onChange={(e) => setSelectedRefId(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#14141c] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50"
              >
                <option value="">Selecione um template salvo...</option>
                {references.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.author} - {r.hook_analysis?.slice(0, 50)}...
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Formats & Platforms */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-white/50">Formato:</label>
              <div className="flex gap-1 p-1 rounded-lg bg-black/40 border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setFormat('single')}
                  className={`flex-1 py-1 rounded text-xs font-medium transition-all ${
                    format === 'single' ? 'bg-white text-black font-semibold' : 'text-white/40'
                  }`}
                >
                  Post Único
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('thread')}
                  className={`flex-1 py-1 rounded text-xs font-medium transition-all ${
                    format === 'thread' ? 'bg-violet-600 text-white font-semibold' : 'text-white/40'
                  }`}
                >
                  Fio (Thread)
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-white/50">Canais de Destino:</label>
              <div className="flex items-center gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => togglePlatform('x')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    platforms.includes('x')
                      ? 'bg-white text-black font-semibold'
                      : 'bg-white/[0.05] text-white/40'
                  }`}
                >
                  <XLogo className="size-3" /> X
                </button>
                <button
                  type="button"
                  onClick={() => togglePlatform('linkedin')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    platforms.includes('linkedin')
                      ? 'bg-[#0A66C2] text-white font-semibold'
                      : 'bg-white/[0.05] text-white/40'
                  }`}
                >
                  <LinkedInLogo className="size-3 text-white" /> LinkedIn
                </button>
              </div>
            </div>
          </div>

          {/* Optional Direct Instruction */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-white/50">Instruções extras (opcional):</label>
            <input
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Ex: Foque no aprendizado de engenharia e use tom provocativo..."
              className="px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/[0.08] bg-[#0c0c12]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/25 transition-all disabled:opacity-50 cursor-pointer active:scale-[0.98]"
          >
            {isGenerating ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Gerando com Gemini…</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>Gerar post agora</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
