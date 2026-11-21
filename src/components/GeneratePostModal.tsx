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
  Target,
} from 'lucide-react';
import { XLogo, LinkedInLogo } from './BrandIcons';
import { HOOK_FORMULAS } from '@/lib/hook-formulas';
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
    language?: 'pt-BR' | 'en-US';
    hookFormulaId?: string;
  }) => Promise<{ success: boolean; post?: CreatorPost; error?: string }>;
  ideas: PostIdea[];
  topics: Topic[];
  facts: Fact[];
  references: Reference[];
  prefilledIdea?: PostIdea | null;
  prefilledTopic?: Topic | null;
  prefilledReference?: Reference | null;
  defaultLanguage?: 'pt-BR' | 'en-US';
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
  defaultLanguage = 'pt-BR',
}: GeneratePostModalProps) {
  if (!isOpen) return null;

  const [sourceType, setSourceType] = useState<'idea' | 'topic' | 'fact' | 'reference' | 'scratch'>(
    prefilledIdea ? 'idea' : prefilledTopic ? 'topic' : prefilledReference ? 'reference' : 'scratch'
  );

  const [language, setLanguage] = useState<'pt-BR' | 'en-US'>(defaultLanguage);
  const [hookFormulaId, setHookFormulaId] = useState<string>('');

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
        language,
        hookFormulaId: hookFormulaId || undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[92dvh] rounded-[24px] bg-[#141414] border border-[#262626] shadow-[0_24px_80px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden">
        {/* Header (macOS Chrome) */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#1f1f1f] bg-[#141414]">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-[#ececec]" />
            <span className="font-medium text-sm text-[#ececec] tracking-[-0.02em]">Gerar Post com IA</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-7 rounded-full flex items-center justify-center text-[#6f6f6f] hover:text-[#ececec] hover:bg-[#212121]"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="p-3 rounded-2xl bg-[#ff5f56]/10 border border-[#ff5f56]/25 text-xs text-[#ff8a84]">
              {error}
            </div>
          )}

          {/* Source Type Selector (Pluy Segmented Pill) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-[#8a8a8a]">Base de Origem do Post:</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 p-1 rounded-2xl sm:rounded-full bg-[#101010] border border-[#242424]">
              {[
                { id: 'scratch' as const, label: 'Do Zero' },
                { id: 'idea' as const, label: 'Ideia' },
                { id: 'topic' as const, label: 'Pauta' },
                { id: 'fact' as const, label: 'Fato Real' },
                { id: 'reference' as const, label: 'Modelo' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSourceType(s.id)}
                  className={`py-1.5 px-2 rounded-full text-[11px] font-medium transition-all active:scale-[0.97] ${
                    sourceType === s.id
                      ? 'bg-[#282828] text-white shadow-sm'
                      : 'text-[#8a8a8a] hover:text-[#ececec]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Picker for Selected Source */}
          {sourceType === 'scratch' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-[#8a8a8a]">Sobre o que você quer falar?</label>
              <input
                type="text"
                value={scratchTopic}
                onChange={(e) => setScratchTopic(e.target.value)}
                placeholder="Ex: Como lidar com dívida técnica em startups iniciantes..."
                className="px-3.5 py-2 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] placeholder-[#6f6f6f] text-xs focus:outline-none focus:border-[#4e4e4e]"
              />
            </div>
          )}

          {sourceType === 'idea' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-[#8a8a8a]">Escolha a Ideia Salva:</label>
              <select
                value={selectedIdeaId}
                onChange={(e) => setSelectedIdeaId(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs focus:outline-none focus:border-[#4e4e4e]"
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
              <label className="text-[11px] font-mono text-[#8a8a8a]">Escolha a Pauta:</label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs focus:outline-none focus:border-[#4e4e4e]"
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
              <label className="text-[11px] font-mono text-[#8a8a8a]">Escolha o Fato Real:</label>
              <select
                value={selectedFactId}
                onChange={(e) => setSelectedFactId(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs focus:outline-none focus:border-[#4e4e4e]"
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
              <label className="text-[11px] font-mono text-[#8a8a8a]">Escolha o Modelo/Referência:</label>
              <select
                value={selectedRefId}
                onChange={(e) => setSelectedRefId(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs focus:outline-none focus:border-[#4e4e4e]"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-[#8a8a8a]">Formato:</label>
              <div className="flex gap-1 p-1 rounded-full bg-[#101010] border border-[#242424]">
                <button
                  type="button"
                  onClick={() => setFormat('single')}
                  className={`flex-1 py-1 rounded-full text-xs font-medium transition-all ${
                    format === 'single' ? 'bg-[#f2f2f2] text-[#0a0a0a]' : 'text-[#8a8a8a]'
                  }`}
                >
                  Post Único
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('thread')}
                  className={`flex-1 py-1 rounded-full text-xs font-medium transition-all ${
                    format === 'thread' ? 'bg-[#282828] text-white' : 'text-[#8a8a8a]'
                  }`}
                >
                  Fio (Thread)
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-[#8a8a8a]">Canais de Destino:</label>
              <div className="flex items-center gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => togglePlatform('x')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    platforms.includes('x')
                      ? 'bg-[#f2f2f2] text-[#0a0a0a] border-transparent'
                      : 'bg-[#1a1a1a] border-[#262626] text-[#8a8a8a]'
                  }`}
                >
                  <XLogo className="size-3" /> X
                </button>
                <button
                  type="button"
                  onClick={() => togglePlatform('linkedin')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    platforms.includes('linkedin')
                      ? 'bg-[#0A66C2] text-white border-transparent'
                      : 'bg-[#1a1a1a] border-[#262626] text-[#8a8a8a]'
                  }`}
                >
                  <LinkedInLogo className="size-3 text-current" /> LinkedIn
                </button>
              </div>
            </div>
          </div>

          {/* 21 Battle-tested Hook Formulas */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-[#8a8a8a] flex items-center gap-1.5">
                <Target size={12} className="text-[#ececec]" />
                <span>Fórmula de Gancho (21 Modelos de Elite):</span>
              </label>
              <span className="text-[10px] text-[#6f6f6f] font-mono">
                {hookFormulaId ? 'Modelo Selecionado' : 'IA escolhe o melhor'}
              </span>
            </div>
            <select
              value={hookFormulaId}
              onChange={(e) => setHookFormulaId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs focus:outline-none focus:border-[#4e4e4e]"
            >
              <option value="">✨ Automático (A IA escolhe o gancho de maior impacto para o tema)</option>
              {HOOK_FORMULAS.map((formula) => (
                <option key={formula.id} value={formula.id}>
                  [{formula.tag}] {formula.name}
                </option>
              ))}
            </select>
            {hookFormulaId && (
              <div className="p-3 rounded-2xl bg-[#1a1a1a] border border-[#262626] text-[11px] text-[#9a9a9a] space-y-1">
                <p className="font-mono text-[10px] text-[#ececec] font-medium">
                  Estrutura: {HOOK_FORMULAS.find((f) => f.id === hookFormulaId)?.blueprint}
                </p>
                <p className="text-[#8a8a8a] text-[11px]">
                  {HOOK_FORMULAS.find((f) => f.id === hookFormulaId)?.description}
                </p>
              </div>
            )}
          </div>

          {/* Optional Direct Instruction */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-[#8a8a8a]">Instruções extras (opcional):</label>
            <input
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Ex: Foque no aprendizado de engenharia e use tom provocativo..."
              className="px-3.5 py-2 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] placeholder-[#6f6f6f] text-xs focus:outline-none focus:border-[#4e4e4e]"
            />
          </div>

          {/* Language Selector */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-[#8a8a8a]">Idioma de Geração:</label>
              <span className="text-[10px] text-[#6f6f6f] font-mono">
                {language === 'pt-BR' ? 'Português Nativo BR (Padrão)' : 'US Tech Operator English'}
              </span>
            </div>
            <div className="grid grid-cols-2 p-1 rounded-full bg-[#101010] border border-[#242424] gap-1">
              <button
                type="button"
                onClick={() => setLanguage('pt-BR')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium transition-all ${
                  language === 'pt-BR'
                    ? 'bg-[#282828] text-white shadow-sm'
                    : 'text-[#8a8a8a] hover:text-[#ececec]'
                }`}
              >
                <span>🇧🇷 Português (padrão)</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en-US')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium transition-all ${
                  language === 'en-US'
                    ? 'bg-[#282828] text-white shadow-sm'
                    : 'text-[#8a8a8a] hover:text-[#ececec]'
                }`}
              >
                <span>🇺🇸 Inglês (US Tech)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between sm:justify-end gap-2 px-4 sm:px-5 py-3 border-t border-[#1f1f1f] bg-[#141414]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2a2a2a] border border-[#2c2c2c] text-[#ececec] transition-all active:scale-[0.97]"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-[0.97]"
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
