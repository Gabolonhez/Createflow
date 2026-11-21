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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92dvh] sm:max-h-[92vh] flex flex-col rounded-[24px] bg-[#141414] border border-[#262626] shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden text-[#ececec] font-sans">
        
        {/* Header (macOS Window Chrome) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#1f1f1f] bg-[#111111]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 mr-1 shrink-0">
              <span className="size-2.5 rounded-full bg-[#ff5f56]" />
              <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="size-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <div className="size-8 sm:size-9 rounded-xl bg-[#212121] border border-[#2c2c2c] flex items-center justify-center text-[#ececec] shrink-0">
              <Sparkles size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-medium text-[#ececec] tracking-[-0.02em]">
                  Gerador Visual com IA
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-[5px] bg-[#262626] text-[#a0a0a0] font-medium">
                  FLUX Pro Engine
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#8a8a8a] mt-0.5 line-clamp-1 sm:line-clamp-none">
                Gere visuais de alta densidade técnica ideais para atrair engenheiros e fundadores no LinkedIn &amp; X.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="size-8 rounded-full flex items-center justify-center text-[#6f6f6f] hover:text-[#ececec] hover:bg-[#212121] transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar">
          {error && (
            <div className="p-3.5 rounded-2xl bg-[#ff5f56]/10 border border-[#ff5f56]/25 text-[#ff8a84] text-xs flex items-center gap-2">
              <span className="font-semibold">Erro:</span> {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form & Style Controls */}
            <div className="lg:col-span-7 space-y-5">
              {/* Context / Topic Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-medium text-[#ececec] flex items-center gap-1.5">
                    <span>Tema do Post ou Insight</span>
                    <span className="text-[10px] text-[#6f6f6f] font-mono">(A IA converterá em arte técnica)</span>
                  </label>
                  {initialContext && (
                    <button
                      type="button"
                      onClick={() => setTopicOrText(initialContext)}
                      className="text-[11px] font-mono text-[#ececec] hover:underline"
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
                  className="w-full p-3.5 rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs leading-relaxed placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4e4e4e] resize-none font-sans"
                />
              </div>

              {/* Visual Archetype Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#9a9a9a] block">
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
                        className={`text-left p-3 rounded-[16px] border transition-all flex flex-col justify-between gap-1.5 active:scale-[0.98] ${
                          isSelected
                            ? 'bg-[#212121] border-[#ececec]/50 shadow-sm'
                            : 'bg-[#161616] border-[#242424] hover:border-[#333333]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon
                              size={15}
                              className={isSelected ? 'text-[#ececec]' : 'text-[#8a8a8a]'}
                            />
                            <span className="text-xs font-medium text-[#ececec]">
                              {arch.label}
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded-[5px] ${
                              isSelected
                                ? 'bg-[#303030] text-[#ececec]'
                                : 'bg-[#212121] text-[#6f6f6f]'
                            }`}
                          >
                            {arch.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8a8a8a] leading-tight">
                          {arch.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#1f1f1f]">
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-[#ececec] block">
                    Formato da Imagem:
                  </span>
                  <span className="text-[11px] text-[#6f6f6f]">
                    Otimizado para feeds sociais sem corte acidental.
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#101010] border border-[#242424]">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      aspectRatio === '16:9'
                        ? 'bg-[#282828] text-white shadow'
                        : 'text-[#8a8a8a] hover:text-[#ececec]'
                    }`}
                  >
                    16:9 (X)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('1:1')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      aspectRatio === '1:1'
                        ? 'bg-[#282828] text-white shadow'
                        : 'text-[#8a8a8a] hover:text-[#ececec]'
                    }`}
                  >
                    1:1 (LinkedIn)
                  </button>
                </div>
              </div>

              {/* Advanced Prompt Mode Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvancedPrompt(!showAdvancedPrompt)}
                  className="text-[11px] font-mono text-[#6f6f6f] hover:text-[#ececec] flex items-center gap-1"
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
                      className="w-full p-3 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs font-mono placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4e4e4e]"
                    />
                  </div>
                )}
              </div>

              {/* Action Button (Pluy White Pill) */}
              <button
                type="button"
                disabled={isGenerating || (!topicOrText.trim() && !customPrompt.trim())}
                onClick={handleGenerate}
                className="w-full py-2.5 px-5 rounded-full font-medium text-xs text-[#0a0a0a] bg-[#f2f2f2] hover:bg-white disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.97] cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-[#0a0a0a]" />
                    <span>Renderizando visual com FLUX Pro (~3s)...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={15} />
                    <span>Gerar Visual com IA</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Column: Preview & Action Box */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-[20px] bg-[#161616] border border-[#242424] p-4 min-h-[380px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#ececec] flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-[#9a9a9a]" />
                    Preview em Alta Resolução
                  </span>
                  {generatedUrl && (
                    <span className="text-[10px] font-mono text-[#7ae6a0] flex items-center gap-1">
                      <Check size={11} /> Salvo no Acervo
                    </span>
                  )}
                </div>

                {/* Image Canvas / Placeholder */}
                <div
                  className={`w-full rounded-2xl overflow-hidden border border-[#262626] bg-[#0a0a0a] flex items-center justify-center relative ${
                    aspectRatio === '16:9' ? 'aspect-video' : 'aspect-square'
                  }`}
                >
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-3 p-6 text-center">
                      <div className="size-10 rounded-full border-2 border-[#2a2a2a] border-t-[#ececec] animate-spin flex items-center justify-center" />
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-[#ececec] block">
                          Compondo estética obsidian...
                        </span>
                        <span className="text-[10px] text-[#6f6f6f]">
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
                    <div className="flex flex-col items-center gap-2 p-6 text-center text-[#6f6f6f]">
                      <ImageIcon size={32} className="stroke-[1.2] text-[#4a4a4a]" />
                      <span className="text-xs text-[#8a8a8a]">
                        Nenhum visual gerado ainda.
                      </span>
                      <span className="text-[10px] text-[#6f6f6f] max-w-[200px]">
                        Digite seu tema e clique no botão para renderizar a arte.
                      </span>
                    </div>
                  )}
                </div>

                {/* Prompt Info */}
                {generatedPrompt && (
                  <div className="p-2.5 rounded-xl bg-[#111111] border border-[#222222] space-y-1">
                    <span className="text-[10px] font-mono text-[#6f6f6f] uppercase tracking-wider block">
                      Prompt Otimizado (FLUX):
                    </span>
                    <p className="text-[11px] text-[#8a8a8a] leading-snug line-clamp-3 font-mono">
                      {generatedPrompt}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Buttons if image generated */}
              {generatedUrl && (
                <div className="pt-3 border-t border-[#222222] flex flex-col gap-2">
                  {onSelectImage && (
                    <button
                      type="button"
                      onClick={handleApply}
                      className="w-full py-2 px-4 rounded-full text-xs font-medium text-[#0a0a0a] bg-[#f2f2f2] hover:bg-white transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Check size={14} />
                      <span>Anexar ao Post Agora</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="flex-1 py-1.5 px-3 rounded-full text-[11px] font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2c2c2c] transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-[0.97]"
                    >
                      {copiedUrl ? <Check size={12} className="text-[#7ae6a0]" /> : <Copy size={12} />}
                      <span>{copiedUrl ? 'Copiado!' : 'Copiar Link'}</span>
                    </button>

                    <a
                      href={generatedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-3 rounded-full text-[11px] font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#9a9a9a] hover:text-white border border-[#2c2c2c] transition-all flex items-center justify-center gap-1"
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
