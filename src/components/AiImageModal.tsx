'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Loader2,
  Check,
  Copy,
  ExternalLink,
  Layers,
  Terminal,
  Activity,
  Box,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { generateAiImageAction } from '@/app/actions';
import type { AiVisualArchetype } from '@/types';

interface AiImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: string;
  onSelectImage?: (url: string) => void;
}

const ARCHETYPES: Array<{
  id: AiVisualArchetype;
  label: string;
  badge: string;
  desc: string;
  icon: React.ElementType;
}> = [
  {
    id: 'diagram',
    label: 'Diagrama de Arquitetura',
    badge: 'Infra & Nós',
    desc: 'Fluxo de microsserviços, nós de dados e laser vectors no estilo Linear/Vercel.',
    icon: Layers,
  },
  {
    id: 'minimal',
    label: 'Minimalista Tech (Linear)',
    badge: 'Obsidian Glow',
    desc: 'Cartão dark obsidian flutuante com bordas sutis e iluminação neon refinada.',
    icon: Box,
  },
  {
    id: 'metrics',
    label: 'Gráficos & Benchmarks',
    badge: 'Performance',
    desc: 'Curva de latência, telemetria e dados comparativos de alto desempenho.',
    icon: Activity,
  },
  {
    id: 'terminal',
    label: 'Terminal & Código Dev',
    badge: 'Dev Experience',
    desc: 'Mockup moderno de terminal / IDE com syntax highlighting e foco técnico.',
    icon: Terminal,
  },
  {
    id: 'concept',
    label: 'Conceito 3D Abstrato',
    badge: 'Hardware & Física',
    desc: 'Prismas geométricos reflexivos, feixes de luz e silício de alta precisão.',
    icon: Compass,
  },
];

export function AiImageModal({
  isOpen,
  onClose,
  initialContext = '',
  onSelectImage,
}: AiImageModalProps) {
  const [topicOrText, setTopicOrText] = useState(initialContext);
  const [selectedStyle, setSelectedStyle] = useState<AiVisualArchetype>('diagram');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '1:1'>('16:9');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showAdvancedPrompt, setShowAdvancedPrompt] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Sync initial context if opened with new content
  React.useEffect(() => {
    if (initialContext && !topicOrText) {
      setTopicOrText(initialContext);
    }
  }, [initialContext]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topicOrText.trim() && !customPrompt.trim()) {
      setError('Por favor, informe o tema do post ou um prompt.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const res = await generateAiImageAction({
        topicOrText: topicOrText.trim(),
        style: selectedStyle,
        aspectRatio,
        customPrompt: showAdvancedPrompt && customPrompt.trim() ? customPrompt.trim() : undefined,
      });

      if (res.error) {
        setError(res.error);
      } else if (res.url) {
        setGeneratedUrl(res.url);
        setGeneratedPrompt(res.prompt || null);
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado ao gerar imagem.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyUrl = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleApply = () => {
    if (generatedUrl && onSelectImage) {
      onSelectImage(generatedUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0e0e12] border border-white/[0.08] shadow-2xl shadow-black/80 overflow-hidden text-zinc-100 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Gerador Visual com IA
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 font-medium">
                  FLUX Pro Engine
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Gere visuais de alta densidade técnica ideais para atrair engenheiros e fundadores no LinkedIn & X.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="size-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <span className="font-semibold">Erro:</span> {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form & Style Controls */}
            <div className="lg:col-span-7 space-y-5">
              {/* Context / Topic Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-medium text-zinc-300 flex items-center gap-1.5">
                    <span>Tema do Post ou Insight</span>
                    <span className="text-[10px] text-zinc-500 font-mono">(A IA converterá em arte técnica)</span>
                  </label>
                  {initialContext && (
                    <button
                      type="button"
                      onClick={() => setTopicOrText(initialContext)}
                      className="text-[11px] font-mono text-violet-400 hover:text-violet-300"
                    >
                      Puxar do Rascunho
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={topicOrText}
                  onChange={(e) => setTopicOrText(e.target.value)}
                  placeholder="Ex: Como migramos de microsserviços para monólito modular e reduzimos a latência p99 em 60%..."
                  className="w-full p-3 rounded-xl bg-zinc-950/60 border border-white/[0.08] text-zinc-100 text-xs leading-relaxed placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 resize-none font-sans"
                />
              </div>

              {/* Visual Archetype Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300 block">
                  Estilo Visual (Anti-Slop):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ARCHETYPES.map((arch) => {
                    const Icon = arch.icon;
                    const isSelected = selectedStyle === arch.id;
                    return (
                      <button
                        key={arch.id}
                        type="button"
                        onClick={() => setSelectedStyle(arch.id)}
                        className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-violet-600/15 border-violet-500/50 shadow-sm shadow-violet-500/10'
                            : 'bg-zinc-950/40 border-white/[0.05] hover:border-white/[0.12] hover:bg-zinc-900/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon
                              size={15}
                              className={isSelected ? 'text-violet-400' : 'text-zinc-400'}
                            />
                            <span className="text-xs font-semibold text-zinc-200">
                              {arch.label}
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-violet-500/25 text-violet-300'
                                : 'bg-white/[0.04] text-zinc-500'
                            }`}
                          >
                            {arch.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-tight">
                          {arch.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/[0.04]">
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-zinc-300 block">
                    Formato da Imagem:
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Otimizado para feeds sociais sem corte acidental.
                  </span>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      aspectRatio === '16:9'
                        ? 'bg-violet-600 text-white font-semibold shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    16:9 (X / Feed Amplo)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('1:1')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      aspectRatio === '1:1'
                        ? 'bg-[#0A66C2] text-white font-semibold shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    1:1 (LinkedIn Quadrado)
                  </button>
                </div>
              </div>

              {/* Advanced Prompt Mode Toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvancedPrompt(!showAdvancedPrompt)}
                  className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                >
                  <span>{showAdvancedPrompt ? '− Ocultar Prompt Manual' : '+ Modo Prompt Manual (Avançado)'}</span>
                </button>

                {showAdvancedPrompt && (
                  <div className="mt-2 space-y-1">
                    <textarea
                      rows={2}
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Sobrescreva o prompt do FLUX diretamente em inglês se desejar total controle..."
                      className="w-full p-2.5 rounded-lg bg-zinc-950 border border-white/[0.08] text-zinc-200 text-xs font-mono placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
                    />
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={isGenerating || (!topicOrText.trim() && !customPrompt.trim())}
                onClick={handleGenerate}
                className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 active:scale-[0.99] cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span>Renderizando visual com FLUX Pro (~3s)...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={16} />
                    <span>Gerar Visual com IA</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Column: Preview & Action Box */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-xl bg-zinc-950/60 border border-white/[0.06] p-4 min-h-[380px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-violet-400" />
                    Preview em Alta Resolução
                  </span>
                  {generatedUrl && (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <Check size={11} /> Salvo no Acervo
                    </span>
                  )}
                </div>

                {/* Image Canvas / Placeholder */}
                <div
                  className={`w-full rounded-xl overflow-hidden border border-white/[0.08] bg-black/80 flex items-center justify-center relative ${
                    aspectRatio === '16:9' ? 'aspect-video' : 'aspect-square'
                  }`}
                >
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-3 p-6 text-center">
                      <div className="size-12 rounded-full border-2 border-violet-500/20 border-t-violet-400 animate-spin flex items-center justify-center" />
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-violet-300 block">
                          Compondo estética obsidian...
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          Aplicando iluminação laser e eliminando ruídos.
                        </span>
                      </div>
                    </div>
                  ) : generatedUrl ? (
                    <img
                      src={generatedUrl}
                      alt="Visual gerado por IA"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-6 text-center text-zinc-500">
                      <ImageIcon size={32} className="stroke-[1.2] text-zinc-600" />
                      <span className="text-xs">
                        Nenhum visual gerado ainda.
                      </span>
                      <span className="text-[10px] text-zinc-600 max-w-[200px]">
                        Digite seu tema e clique no botão para renderizar a arte.
                      </span>
                    </div>
                  )}
                </div>

                {/* Prompt Info */}
                {generatedPrompt && (
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                      Prompt Otimizado (FLUX):
                    </span>
                    <p className="text-[11px] text-zinc-400 leading-snug line-clamp-3 font-mono">
                      {generatedPrompt}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Buttons if image generated */}
              {generatedUrl && (
                <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2">
                  {onSelectImage && (
                    <button
                      type="button"
                      onClick={handleApply}
                      className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 cursor-pointer"
                    >
                      <Check size={14} />
                      <span>Anexar ao Post Agora</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.06] transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {copiedUrl ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedUrl ? 'Copiado!' : 'Copiar Link'}</span>
                    </button>

                    <a
                      href={generatedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-2.5 rounded-lg text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.06] transition-all flex items-center justify-center gap-1"
                      title="Abrir em nova aba"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
