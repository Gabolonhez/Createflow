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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl my-auto rounded-2xl bg-[#0d0d12] border border-white/[0.08] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white font-sans animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Zap size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Atomizador de Ideias
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase tracking-wider font-semibold">
                  1 Ideia → 3 Formatos
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Transforme um insight único em 3 publicações autorais complementares para X e LinkedIn.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Input Controls */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">
                  Pauta / Tese Central
                </label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Ex: Por que micro-serviços quebram founders antes da escala real"
                  className="w-full px-3.5 py-2 rounded-lg bg-zinc-900/80 border border-white/[0.08] text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">
                  Bastidores / Anotação Crua (Opcional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ex: Tivemos 3 outages mês passado por latência de rede entre 12 lambdas..."
                  className="w-full px-3.5 py-2 rounded-lg bg-zinc-900/80 border border-white/[0.08] text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
                  disabled={isGenerating}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
                <Clock size={13} className="text-zinc-400" />
                <span>Distribui os posts automaticamente nos próximos horários nobres de Brasília (09:00, 14:30, 18:30)</span>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !theme.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-lg shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles size={14} className={isGenerating ? 'animate-spin' : ''} />
                <span>{isGenerating ? 'Atomizando conteúdo com IA…' : 'Atomizar em 3 Formatos'}</span>
              </button>
            </div>
          </div>

          {/* 3-Column Generated Variants Area */}
          {isGenerating ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <div className="size-10 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
              <p className="text-xs font-mono text-zinc-400">
                Calibrando voz de operador, extraindo fatos reais e gerando 3 formatos complementares...
              </p>
            </div>
          ) : sprayResult ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                  <Layers size={14} className="text-amber-400" />
                  <span>Resultado da Atomização: 3 Formatos Estratégicos</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">
                  Edite qualquer texto antes de aprovar
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* 1. X Contrarian Card */}
                <div className="flex flex-col rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-md bg-white/[0.08] flex items-center justify-center text-white">
                        <XLogo className="size-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-zinc-200">X • Hot Take Contrarian</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        contrarianText.length > 280
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/60'
                      }`}
                    >
                      {contrarianText.length}/280 chars
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-500 italic">
                    Gancho rápido e opinativo que ataca o senso comum e gera réplicas imediatas.
                  </p>

                  <textarea
                    rows={8}
                    value={contrarianText}
                    onChange={(e) => setContrarianText(e.target.value)}
                    className="flex-1 w-full p-3 rounded-lg bg-black/60 border border-white/[0.06] text-xs text-white leading-relaxed focus:outline-none focus:border-amber-500/40 resize-none font-sans"
                    placeholder="Tweet curto e provocativo..."
                  />
                </div>

                {/* 2. X Thread Card */}
                <div className="flex flex-col rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-md bg-white/[0.08] flex items-center justify-center text-white">
                        <XLogo className="size-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-zinc-200">
                        X • Fio Técnico ({threadTweets.length} tweets)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={addThreadTweet}
                      className="size-6 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 flex items-center justify-center transition-colors"
                      title="Adicionar tweet ao fio"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <p className="text-[11px] text-zinc-500 italic">
                    Passo a passo com bastidores práticos e lições técnicas desmembradas.
                  </p>

                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {threadTweets.map((t, idx) => (
                      <div key={idx} className="space-y-1 relative group">
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 px-1">
                          <span>Tweet {idx + 1}/{threadTweets.length} {idx === 0 ? '(Gancho)' : ''}</span>
                          <div className="flex items-center gap-2">
                            <span className={t.length > 280 ? 'text-rose-400' : 'text-zinc-500'}>
                              {t.length}/280
                            </span>
                            {threadTweets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeThreadTweet(idx)}
                                className="text-zinc-600 hover:text-rose-400 transition-colors"
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
                          className="w-full p-2.5 rounded-lg bg-black/60 border border-white/[0.06] text-xs text-white leading-relaxed focus:outline-none focus:border-amber-500/40 resize-none font-sans"
                          placeholder={`Tweet ${idx + 1}...`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. LinkedIn Deep Dive Card */}
                <div className="flex flex-col rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-md bg-[#0A66C2]/20 flex items-center justify-center text-[#0A66C2]">
                        <LinkedInLogo className="size-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-zinc-200">LinkedIn • Deep Dive</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {linkedInText.length} chars
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-500 italic">
                    Gancho de 2 linhas (...ver mais), parágrafos espaçados e marcadores limpos.
                  </p>

                  <textarea
                    rows={8}
                    value={linkedInText}
                    onChange={(e) => setLinkedInText(e.target.value)}
                    className="flex-1 w-full p-3 rounded-lg bg-black/60 border border-white/[0.06] text-xs text-white leading-relaxed focus:outline-none focus:border-blue-500/40 resize-none font-sans"
                    placeholder="Post narrativo e estruturado do LinkedIn..."
                  />
                </div>

              </div>
            </div>
          ) : (
            <div className="py-14 flex flex-col items-center justify-center text-center p-8 rounded-xl bg-white/[0.015] border border-white/[0.04]">
              <div className="size-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
                <Zap size={22} />
              </div>
              <h4 className="text-sm font-semibold text-white/80 mb-1">
                Pronto para atomizar seu insight
              </h4>
              <p className="text-xs text-zinc-500 max-w-md">
                Digite um tema ou insight no campo acima e clique em <strong>Disparar Atomizador</strong>. A inteligência criará 3 versões complementares ajustadas para cada plataforma.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <CalendarCheck size={14} className="text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">
              Aprovação em lote distribui as publicações em horários separados automaticamente.
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Cancelar
            </button>

            {sprayResult && (
              <>
                <button
                  type="button"
                  onClick={() => handleSaveAll(false)}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  <FileText size={13} />
                  <span>Salvar 3 como Rascunhos</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveAll(true)}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 size={13} />
                  <span>{isSaving ? 'Agendando...' : '⚡ Aprovar Todos na Fila Inteligente'}</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
