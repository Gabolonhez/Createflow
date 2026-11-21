'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Sparkles,
  CalendarCheck,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { XLogo, LinkedInLogo } from './BrandIcons';
import type { SprayResult, SprayVariant, Platform } from '@/types';

interface SprayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateSpray: (theme: string, note?: string) => Promise<{ success?: boolean; spray?: SprayResult; error?: string }>;
  onSaveSprayVariants: (
    variants: SprayVariant[],
    theme: string,
    autoSchedule: boolean
  ) => Promise<{ success?: boolean; count?: number; error?: string }>;
  prefilledTheme?: string;
  prefilledNote?: string;
}

export function SprayModal({
  isOpen,
  onClose,
  onGenerateSpray,
  onSaveSprayVariants,
  prefilledTheme = '',
  prefilledNote = '',
}: SprayModalProps) {
  const [theme, setTheme] = useState(prefilledTheme);
  const [note, setNote] = useState(prefilledNote);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result state with local editable variants
  const [sprayResult, setSprayResult] = useState<SprayResult | null>(null);
  const [contrarianText, setContrarianText] = useState('');
  const [threadTweets, setThreadTweets] = useState<string[]>([]);
  const [linkedInText, setLinkedInText] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (prefilledTheme) setTheme(prefilledTheme);
      if (prefilledNote) setNote(prefilledNote);
      setError(null);
    }
  }, [isOpen, prefilledTheme, prefilledNote]);

  // Synchronize local editable fields when sprayResult changes
  useEffect(() => {
    if (sprayResult) {
      const contrarian = sprayResult.variants.find((v) => v.type === 'x_contrarian');
      const thread = sprayResult.variants.find((v) => v.type === 'x_thread');
      const deepDive = sprayResult.variants.find((v) => v.type === 'linkedin_deep_dive');

      setContrarianText(contrarian ? contrarian.text : '');
      if (thread) {
        setThreadTweets([thread.text, ...(thread.thread || [])]);
      } else {
        setThreadTweets([]);
      }
      setLinkedInText(deepDive ? (deepDive.linkedinText || deepDive.text) : '');
    }
  }, [sprayResult]);

  if (!isOpen) return null;

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!theme.trim()) {
      setError('Informe ao menos uma pauta ou tese central para atomizar.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await onGenerateSpray(theme.trim(), note.trim());
      if (res.error) {
        setError(res.error);
      } else if (res.spray) {
        setSprayResult(res.spray);
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao atomizar conteúdo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getEditedVariants = (): SprayVariant[] => {
    const list: SprayVariant[] = [];

    // 1. Contrarian
    list.push({
      type: 'x_contrarian',
      title: 'Hot Take Provocativo',
      badge: 'X (Tweet Único)',
      platform: 'x',
      text: contrarianText.trim(),
    });

    // 2. Thread
    const firstTweet = threadTweets[0] || '';
    const otherTweets = threadTweets.slice(1).filter((t) => t.trim().length > 0);
    list.push({
      type: 'x_thread',
      title: 'Thread Técnica de Bastidores',
      badge: `X (Fio • ${threadTweets.length} tweets)`,
      platform: 'x',
      text: firstTweet.trim(),
      thread: otherTweets,
    });

    // 3. LinkedIn
    list.push({
      type: 'linkedin_deep_dive',
      title: 'Deep Dive & Estudo de Caso',
      badge: 'LinkedIn (Narrativo)',
      platform: 'linkedin',
      text: linkedInText.trim(),
      linkedinText: linkedInText.trim(),
    });

    return list;
  };

  const handleSaveAll = async (autoSchedule: boolean) => {
    setIsSaving(true);
    setError(null);
    try {
      const variants = getEditedVariants();
      const res = await onSaveSprayVariants(variants, theme, autoSchedule);
      if (res.error) {
        setError(res.error);
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar variantes.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateThreadTweet = (index: number, val: string) => {
    const next = [...threadTweets];
    next[index] = val;
    setThreadTweets(next);
  };

  const addThreadTweet = () => {
    setThreadTweets([...threadTweets, '']);
  };

  const removeThreadTweet = (index: number) => {
    if (threadTweets.length <= 1) return;
    setThreadTweets(threadTweets.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl my-auto rounded-[24px] bg-[#141414] border border-[#262626] shadow-[0_24px_80px_rgba(0,0,0,0.85)] flex flex-col max-h-[92dvh] sm:max-h-[92vh] overflow-hidden text-[#ececec] font-sans animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header (macOS Window Chrome) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#1f1f1f] bg-[#111111]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 mr-1 shrink-0">
              <span className="size-2.5 rounded-full bg-[#ff5f56]" />
              <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="size-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <div className="size-8 sm:size-9 rounded-xl bg-[#212121] border border-[#2c2c2c] flex items-center justify-center text-[#ffbd2e] shrink-0">
              <Zap size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-medium text-[#ececec] tracking-[-0.02em]">
                  Atomizador de Ideias
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-[5px] bg-[#262626] text-[#a0a0a0] uppercase tracking-wider">
                  1 Ideia → 3 Formatos
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#8a8a8a] mt-0.5 line-clamp-1 sm:line-clamp-none">
                Transforme um insight único em 3 publicações autorais complementares para X e LinkedIn.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full flex items-center justify-center text-[#6f6f6f] hover:text-[#ececec] hover:bg-[#212121] transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#ff5f56]/10 border border-[#ff5f56]/25 text-[#ff8a84] text-xs">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Input Controls */}
          <div className="p-4 rounded-[20px] bg-[#161616] border border-[#242424] space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-mono text-[#8a8a8a] uppercase tracking-wider">
                  Pauta / Tese Central
                </label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Ex: Por que micro-serviços quebram founders antes da escala real"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4e4e4e]"
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-[#8a8a8a] uppercase tracking-wider">
                  Bastidores / Anotação Crua (Opcional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ex: Tivemos 3 outages mês passado por latência de rede entre 12 lambdas..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4e4e4e]"
                  disabled={isGenerating}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#6f6f6f]">
                <Clock size={13} className="text-[#8a8a8a] shrink-0" />
                <span>Distribui os posts automaticamente nos próximos horários nobres de Brasília (09:00, 14:30, 18:30)</span>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !theme.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] shadow-sm active:scale-[0.97] disabled:opacity-40 transition-all cursor-pointer shrink-0"
              >
                <Sparkles size={14} className={isGenerating ? 'animate-spin' : ''} />
                <span>{isGenerating ? 'Atomizando conteúdo com IA…' : 'Atomizar em 3 Formatos'}</span>
              </button>
            </div>
          </div>

          {/* 3-Column Generated Variants Area */}
          {isGenerating ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <div className="size-10 rounded-full border-2 border-[#2a2a2a] border-t-[#ececec] animate-spin" />
              <p className="text-xs font-mono text-[#8a8a8a]">
                Calibrando voz de operador, extraindo fatos reais e gerando 3 formatos complementares...
              </p>
            </div>
          ) : sprayResult ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-xs font-medium text-[#ececec]">
                  <Layers size={14} className="text-[#9a9a9a]" />
                  <span>Resultado da Atomização: 3 Formatos Estratégicos</span>
                </div>
                <span className="text-[11px] font-mono text-[#6f6f6f]">
                  Edite qualquer texto antes de aprovar
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* 1. X Contrarian Card */}
                <div className="flex flex-col rounded-[20px] bg-[#161616] border border-[#242424] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-md bg-[#212121] border border-[#2c2c2c] flex items-center justify-center text-white">
                        <XLogo className="size-3.5" />
                      </div>
                      <span className="text-xs font-medium text-[#ececec]">X • Hot Take Contrarian</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-[5px] ${
                        contrarianText.length > 280
                          ? 'bg-[#ff5f56]/15 text-[#ff8a84]'
                          : 'bg-[#212121] text-[#8a8a8a]'
                      }`}
                    >
                      {contrarianText.length}/280 chars
                    </span>
                  </div>

                  <p className="text-[11px] text-[#6f6f6f] italic">
                    Gancho rápido e opinativo que ataca o senso comum e gera réplicas imediatas.
                  </p>

                  <textarea
                    rows={8}
                    value={contrarianText}
                    onChange={(e) => setContrarianText(e.target.value)}
                    className="flex-1 w-full p-3 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-xs text-[#ececec] leading-relaxed focus:outline-none focus:border-[#4e4e4e] resize-none font-sans"
                    placeholder="Tweet curto e provocativo..."
                  />
                </div>

                {/* 2. X Thread Card */}
                <div className="flex flex-col rounded-[20px] bg-[#161616] border border-[#242424] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-md bg-[#212121] border border-[#2c2c2c] flex items-center justify-center text-white">
                        <XLogo className="size-3.5" />
                      </div>
                      <span className="text-xs font-medium text-[#ececec]">
                        X • Fio Técnico ({threadTweets.length} tweets)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={addThreadTweet}
                      className="size-6 rounded-full bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] flex items-center justify-center transition-colors"
                      title="Adicionar tweet ao fio"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <p className="text-[11px] text-[#6f6f6f] italic">
                    Passo a passo com bastidores práticos e lições técnicas desmembradas.
                  </p>

                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                    {threadTweets.map((t, idx) => (
                      <div key={idx} className="space-y-1 relative group">
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#6f6f6f] px-1">
                          <span>Tweet {idx + 1}/{threadTweets.length} {idx === 0 ? '(Gancho)' : ''}</span>
                          <div className="flex items-center gap-2">
                            <span className={t.length > 280 ? 'text-[#ff5f56]' : 'text-[#6f6f6f]'}>
                              {t.length}/280
                            </span>
                            {threadTweets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeThreadTweet(idx)}
                                className="text-[#6f6f6f] hover:text-[#ff5f56] transition-colors"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                        <textarea
                          rows={3}
                          value={t}
                          onChange={(e) => updateThreadTweet(idx, e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-xs text-[#ececec] leading-relaxed focus:outline-none focus:border-[#4e4e4e] resize-none font-sans"
                          placeholder={`Tweet ${idx + 1}...`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. LinkedIn Deep Dive Card */}
                <div className="flex flex-col rounded-[20px] bg-[#161616] border border-[#242424] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-md bg-[#212121] border border-[#2c2c2c] flex items-center justify-center text-[#0A66C2]">
                        <LinkedInLogo className="size-3.5" />
                      </div>
                      <span className="text-xs font-medium text-[#ececec]">LinkedIn • Deep Dive</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-[5px] bg-[#212121] text-[#9a9a9a]">
                      {linkedInText.length} chars
                    </span>
                  </div>

                  <p className="text-[11px] text-[#6f6f6f] italic">
                    Gancho de 2 linhas (...ver mais), parágrafos espaçados e marcadores limpos.
                  </p>

                  <textarea
                    rows={8}
                    value={linkedInText}
                    onChange={(e) => setLinkedInText(e.target.value)}
                    className="flex-1 w-full p-3 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-xs text-[#ececec] leading-relaxed focus:outline-none focus:border-[#4e4e4e] resize-none font-sans"
                    placeholder="Post narrativo e estruturado do LinkedIn..."
                  />
                </div>

              </div>
            </div>
          ) : (
            <div className="py-14 flex flex-col items-center justify-center text-center p-8 rounded-[20px] bg-[#161616] border border-[#222222]">
              <div className="size-12 rounded-2xl bg-[#212121] border border-[#2c2c2c] flex items-center justify-center text-[#ffbd2e] mb-3">
                <Zap size={20} />
              </div>
              <h4 className="text-sm font-medium text-[#ececec] mb-1">
                Pronto para atomizar seu insight
              </h4>
              <p className="text-xs text-[#8a8a8a] max-w-md">
                Digite um tema ou insight no campo acima e clique em <strong>Atomizar em 3 Formatos</strong>. A inteligência criará 3 versões complementares ajustadas para cada plataforma.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-t border-[#1f1f1f] bg-[#111111] gap-3">
          <div className="flex items-center gap-2 text-xs text-[#8a8a8a]">
            <CalendarCheck size={14} className="text-[#7ae6a0] shrink-0" />
            <span className="hidden sm:inline">
              Aprovação em lote distribui as publicações em horários separados automaticamente.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 flex-wrap">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-4 py-1.5 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2a2a2a] border border-[#2c2c2c] text-[#ececec] transition-all active:scale-[0.97] text-center"
            >
              Cancelar
            </button>

            {sprayResult && (
              <>
                <button
                  type="button"
                  onClick={() => handleSaveAll(false)}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2c2c2c] transition-all active:scale-[0.97] cursor-pointer disabled:opacity-50"
                >
                  <FileText size={13} />
                  <span>Salvar Rascunhos</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveAll(true)}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] shadow-sm transition-all active:scale-[0.97] cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 size={13} />
                  <span>{isSaving ? 'Agendando...' : 'Aprovar Fila'}</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
