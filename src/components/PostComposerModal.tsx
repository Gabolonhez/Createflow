'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CalendarClock,
  Send,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Layers,
  Wand2,
  Loader2,
  Copy,
  Check,
  Image as ImageIcon,
  Upload,
  FolderOpen,
} from 'lucide-react';
import { XLogo, LinkedInLogo } from './BrandIcons';
import { PostPreviewCard } from './PostPreviewCard';
import { MediaLibraryView } from './MediaLibraryView';
import { generateXIntentUrl } from '@/lib/twitter';
import { generateLinkedInIntentUrl } from '@/lib/linkedin';
import { uploadPostImageAction } from '@/app/actions';
import type { CreatorPost, Platform, ThreadStyle } from '@/types';

interface PostComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPost?: CreatorPost | null;
  onSave: (post: Partial<CreatorPost>) => Promise<void>;
  onApprove?: (id: string, scheduledFor?: string) => Promise<void>;
  onPublishNow: (id: string) => Promise<void>;
  onRewrite: (
    text: string,
    instruction?: string,
    platform?: Platform | 'both'
  ) => Promise<{ text: string; voiceCheck: any }>;
  authorHandle?: string;
  authorName?: string;
  authorHeadline?: string;
}

export function PostComposerModal({
  isOpen,
  onClose,
  initialPost,
  onSave,
  onApprove,
  onPublishNow,
  onRewrite,
  authorHandle = '@gabolonhez',
  authorName = 'Gabriel Bolonhez',
  authorHeadline = 'Software Engineer & Tech Founder | Building CreateFlow',
}: PostComposerModalProps) {
  if (!isOpen) return null;

  const [text, setText] = useState(initialPost?.text || '');
  const [linkedinText, setLinkedinText] = useState(
    initialPost?.linkedinText ||
    (initialPost?.platforms.includes('linkedin') && !initialPost?.platforms.includes('x')
      ? initialPost.text
      : '')
  );
  const [thread, setThread] = useState<string[]>(initialPost?.thread || []);
  const [platforms, setPlatforms] = useState<Platform[]>(
    initialPost?.platforms || ['x', 'linkedin']
  );
  const [activeEditorTab, setActiveEditorTab] = useState<'x' | 'linkedin'>(
    initialPost?.platforms?.includes('x') ? 'x' : 'linkedin'
  );
  const [threadStyle, setThreadStyle] = useState<ThreadStyle>(
    initialPost?.threadStyle || 'single'
  );
  const [pillar, setPillar] = useState(initialPost?.pillar || 'tech-insights');
  const [mediaUrl, setMediaUrl] = useState(initialPost?.mediaUrls?.[0] || '');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadPostImageAction(formData);
      if (res.error) {
        setUploadError(res.error);
      } else if (res.url) {
        setMediaUrl(res.url);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Falha ao enviar arquivo.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  const [scheduledFor, setScheduledFor] = useState(
    initialPost?.scheduledFor
      ? new Date(initialPost.scheduledFor).toISOString().slice(0, 16)
      : ''
  );
  const [voiceCheck, setVoiceCheck] = useState(initialPost?.voiceCheck);

  const [isSaving, setIsSaving] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isExpandingForLinkedIn, setIsExpandingForLinkedIn] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const charCount = text.length;
  const linkedinCharCount = linkedinText.length;
  const isX = platforms.includes('x');
  const isLinkedIn = platforms.includes('linkedin');
  const xOverLimit = isX && charCount > 280;

  const togglePlatform = (p: Platform) => {
    if (platforms.includes(p)) {
      if (platforms.length > 1) {
        const next = platforms.filter((x) => x !== p);
        setPlatforms(next);
        if (!next.includes(activeEditorTab)) {
          setActiveEditorTab(next[0] || 'x');
        }
      }
    } else {
      const next = [...platforms, p];
      setPlatforms(next);
      setActiveEditorTab(p);
    }
  };

  const addThreadTweet = () => {
    setThread([...thread, '']);
    setThreadStyle('thread');
  };

  const updateThreadTweet = (index: number, val: string) => {
    const next = [...thread];
    next[index] = val;
    setThread(next);
  };

  const removeThreadTweet = (index: number) => {
    const next = thread.filter((_, i) => i !== index);
    setThread(next);
    if (next.length === 0) setThreadStyle('single');
  };

  const handleRewrite = async (instruction?: string) => {
    if (activeEditorTab === 'linkedin') {
      const target = linkedinText.trim() || text;
      if (!target) return;
      setIsRewriting(true);
      try {
        const res = await onRewrite(target, instruction, 'linkedin');
        if (res.text) {
          setLinkedinText(res.text);
          setVoiceCheck(res.voiceCheck);
        }
      } finally {
        setIsRewriting(false);
      }
    } else {
      if (!text.trim()) return;
      setIsRewriting(true);
      try {
        const res = await onRewrite(text, instruction, 'x');
        if (res.text) {
          setText(res.text);
          setVoiceCheck(res.voiceCheck);
        }
      } finally {
        setIsRewriting(false);
      }
    }
  };

  const handleExpandFromXToLinkedIn = async () => {
    const sourceContent = [text, ...thread.filter((t) => t.trim())].join('\n\n');
    if (!sourceContent.trim()) return;

    setIsExpandingForLinkedIn(true);
    try {
      const res = await onRewrite(
        sourceContent,
        'Expanda este conteúdo para o LinkedIn em formato longo e profundo (800 a 1.500 caracteres). Primeiras 2 linhas com gancho forte para forçar o clique em "...ver mais". Use parágrafos curtos de 1 a 2 linhas com respiro visual, bastidores práticos, lições objetivas com marcadores limpos e encerramento de autoridade. Zero clichês corporativos.',
        'linkedin'
      );
      if (res.text) {
        setLinkedinText(res.text);
        setActiveEditorTab('linkedin');
      }
    } finally {
      setIsExpandingForLinkedIn(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await onSave({
        id: initialPost?.id,
        text,
        thread: thread.filter((t) => t.trim().length > 0),
        linkedinText: linkedinText.trim() || null,
        threadStyle,
        platforms,
        pillar,
        mediaUrls: mediaUrl.trim() ? [mediaUrl.trim()] : [],
        scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null,
        status: initialPost?.status || 'DRAFT',
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveAndSchedule = async () => {
    if (!initialPost?.id || !onApprove) return;
    setIsSaving(true);
    try {
      await onSave({
        id: initialPost.id,
        text,
        thread: thread.filter((t) => t.trim().length > 0),
        linkedinText: linkedinText.trim() || null,
        threadStyle,
        platforms,
        pillar,
        mediaUrls: mediaUrl.trim() ? [mediaUrl.trim()] : [],
        scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null,
      });
      await onApprove(
        initialPost.id,
        scheduledFor ? new Date(scheduledFor).toISOString() : undefined
      );
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishDirect = async () => {
    if (!initialPost?.id) {
      await handleSaveDraft();
      return;
    }
    setIsPublishing(true);
    try {
      await onPublishNow(initialPost.id);
      onClose();
    } finally {
      setIsPublishing(false);
    }
  };

  const handleOpenXIntent = () => {
    window.open(generateXIntentUrl(text), '_blank', 'noopener,noreferrer');
  };

  const handleOpenLinkedInIntent = () => {
    const fullLinkedIn = linkedinText.trim() || (thread.length > 0 ? [text, ...thread].join('\n\n') : text);
    window.open(generateLinkedInIntentUrl(fullLinkedIn), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl bg-[#0a0a0e] border border-white/[0.1] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0c0c12]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-white">
              {initialPost?.id ? 'Editar Post' : 'Criar Novo Post'}
            </span>
            <span className="text-[11px] font-mono text-white/40">
              {initialPost?.status ? `(${initialPost.status})` : ''}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body: 2 Columns (Editor on left, Live Preview on right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto">
          {/* LEFT: Composer Controls */}
          <div className="flex flex-col gap-4">
            {/* Platform Selection & Pillar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-white/40">Canais:</span>
                <button
                  type="button"
                  onClick={() => togglePlatform('x')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    platforms.includes('x')
                      ? 'bg-white text-black font-semibold'
                      : 'bg-white/[0.05] text-white/40 hover:text-white'
                  }`}
                >
                  <XLogo className="size-3" />
                  <span>X (Twitter)</span>
                </button>

                <button
                  type="button"
                  onClick={() => togglePlatform('linkedin')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    platforms.includes('linkedin')
                      ? 'bg-[#0A66C2] text-white font-semibold'
                      : 'bg-white/[0.05] text-white/40 hover:text-white'
                  }`}
                >
                  <LinkedInLogo className="size-3 text-white" />
                  <span>LinkedIn</span>
                </button>
              </div>

              {/* Pillar selection */}
              <select
                value={pillar}
                onChange={(e) => setPillar(e.target.value)}
                className="px-2.5 py-1 rounded bg-[#14141c] border border-white/[0.08] text-white/80 text-xs focus:outline-none focus:border-violet-500/50"
              >
                <option value="tech-insights">Tech & Arquitetura</option>
                <option value="founder-journey">Jornada de Founder</option>
                <option value="lessons">Lições Práticas</option>
                <option value="hot-takes">Opinião & Debate</option>
                <option value="case-study">Estudo de Caso</option>
              </select>
            </div>

            {/* Platform Sub-Tabs when Cross-posting to both */}
            {isX && isLinkedIn && (
              <div className="flex items-center gap-2 p-1 bg-black/40 rounded-xl border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setActiveEditorTab('x')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeEditorTab === 'x'
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <XLogo className="size-3" />
                  <span>Editar Versão X</span>
                  <span className={`text-[10px] font-mono px-1 rounded ${charCount > 280 ? 'bg-rose-500/20 text-rose-300' : 'bg-black/20 text-white/60'}`}>
                    {charCount}/280
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveEditorTab('linkedin')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeEditorTab === 'linkedin'
                      ? 'bg-[#0A66C2] text-white font-semibold shadow-sm'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <LinkedInLogo className="size-3 text-white" />
                  <span>Editar Versão LinkedIn</span>
                  <span className={`text-[10px] font-mono px-1 rounded ${linkedinCharCount >= 800 && linkedinCharCount <= 1800 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/70'}`}>
                    {linkedinCharCount > 0 ? `${linkedinCharCount}c` : '0c'}
                  </span>
                </button>
              </div>
            )}

            {/* AI Voice Check Notification if any */}
            {voiceCheck?.level === 'warn' && (
              <div className="flex items-start justify-between gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col text-xs">
                    <span className="font-semibold text-amber-300">Atenção ao Tom de Voz</span>
                    <span className="text-[11px] text-amber-200/70 mt-0.5">
                      {voiceCheck.items[0]?.message || 'Ajuste para soar mais direto e autêntico.'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isRewriting}
                  onClick={() => handleRewrite('Remova o clichê e deixe 100% autêntico no meu tom')}
                  className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-[11px] flex items-center gap-1 shrink-0"
                >
                  <Wand2 size={11} />
                  <span>Reescrever</span>
                </button>
              </div>
            )}

            {/* MODE 1: X (TWITTER) EDITOR */}
            {activeEditorTab === 'x' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-white/40">1º Tweet (Gancho curto & seco)</span>
                    <span
                      className={`${
                        xOverLimit ? 'text-rose-400 font-bold' : 'text-white/40'
                      }`}
                    >
                      {charCount} / 280
                    </span>
                  </div>

                  <textarea
                    rows={5}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Primeiro tweet (< 280 caracteres)..."
                    className="w-full p-3.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-[13px] leading-relaxed placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 resize-none font-sans"
                  />
                </div>

                {/* AI Quick Helpers Bar for X */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  <button
                    type="button"
                    disabled={isRewriting || !text.trim()}
                    onClick={() => handleRewrite()}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/25 transition-all whitespace-nowrap active:scale-[0.98]"
                  >
                    {isRewriting ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                    <span>Reescrever tom</span>
                  </button>

                  <button
                    type="button"
                    disabled={isRewriting || !text.trim()}
                    onClick={() => handleRewrite('Encurte para caber em exatamente 280 caracteres mantendo o soco.')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.08] text-white/70 border border-white/[0.06] transition-all whitespace-nowrap"
                  >
                    <span>Encurtar (&lt;280)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isRewriting || !text.trim()}
                    onClick={() => handleRewrite('Crie um gancho mais forte e seco na primeira linha.')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.08] text-white/70 border border-white/[0.06] transition-all whitespace-nowrap"
                  >
                    <span>Gancho afiado</span>
                  </button>

                  {isLinkedIn && (
                    <button
                      type="button"
                      disabled={isExpandingForLinkedIn || !text.trim()}
                      onClick={handleExpandFromXToLinkedIn}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#0A66C2]/15 hover:bg-[#0A66C2]/25 text-[#70b5f9] border border-[#0A66C2]/30 transition-all whitespace-nowrap"
                    >
                      {isExpandingForLinkedIn ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      <span>⚡ Expandir para LinkedIn</span>
                    </button>
                  )}
                </div>

                {/* Thread Tweets Section */}
                {thread.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
                    <span className="text-[11px] font-mono text-violet-400">
                      Fio / Continuação ({thread.length} adicionais):
                    </span>
                    {thread.map((t, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <span className="text-[11px] font-mono text-white/30 pt-2 shrink-0">
                          #{idx + 2}
                        </span>
                        <textarea
                          rows={3}
                          value={t}
                          onChange={(e) => updateThreadTweet(idx, e.target.value)}
                          placeholder={`Tweet #${idx + 2}...`}
                          className="flex-1 p-2.5 rounded-lg bg-black/40 border border-white/[0.07] text-white text-xs leading-relaxed focus:outline-none focus:border-violet-500/50 resize-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeThreadTweet(idx)}
                          className="p-1.5 rounded text-white/30 hover:text-rose-400 transition-colors shrink-0 mt-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={addThreadTweet}
                  className="flex items-center gap-1.5 text-xs font-mono text-violet-300 hover:text-violet-200 transition-colors w-fit pt-1"
                >
                  <Plus size={13} />
                  <span>Adicionar tweet ao fio (+1)</span>
                </button>
              </>
            )}

            {/* MODE 2: LINKEDIN EDITOR */}
            {activeEditorTab === 'linkedin' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#70b5f9] font-medium">Post Completo para LinkedIn (Narrativo & Aprofundado)</span>
                    <div className="flex items-center gap-1.5">
                      {linkedinCharCount === 0 && (
                        <span className="text-amber-400 text-[10px]">Vazio (clique em Expandir do X)</span>
                      )}
                      {linkedinCharCount > 0 && linkedinCharCount < 600 && (
                        <span className="text-amber-300 text-[10px]">⚠️ Curto ({linkedinCharCount}c · ideal: 800-1.800)</span>
                      )}
                      {linkedinCharCount >= 600 && linkedinCharCount <= 2200 && (
                        <span className="text-emerald-400 text-[10px]">✓ Excelente extensão ({linkedinCharCount}c)</span>
                      )}
                      {linkedinCharCount > 2200 && (
                        <span className="text-white/50 text-[10px]">{linkedinCharCount} caracteres</span>
                      )}
                    </div>
                  </div>

                  <textarea
                    rows={9}
                    value={linkedinText}
                    onChange={(e) => setLinkedinText(e.target.value)}
                    placeholder="Escreva seu post do LinkedIn aqui (800 a 1.800 caracteres com gancho nas primeiras 2 linhas para '...ver mais', parágrafos curtos de 1 a 2 linhas com espaçamento visual e lições práticas)..."
                    className="w-full p-3.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-[13px] leading-relaxed placeholder:text-white/30 focus:outline-none focus:border-[#0A66C2]/60 resize-none font-sans"
                  />
                </div>

                {/* AI Quick Helpers Bar for LinkedIn */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  <button
                    type="button"
                    disabled={isExpandingForLinkedIn || !text.trim()}
                    onClick={handleExpandFromXToLinkedIn}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 text-[#70b5f9] border border-[#0A66C2]/35 transition-all whitespace-nowrap active:scale-[0.98]"
                  >
                    {isExpandingForLinkedIn ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    <span>⚡ Expandir do Tweet do X</span>
                  </button>

                  <button
                    type="button"
                    disabled={isRewriting || (!linkedinText.trim() && !text.trim())}
                    onClick={() => handleRewrite('Reescreva no tom autoral de operador para LinkedIn: 800 a 1.500 caracteres, gancho forte nas primeiras 2 linhas, respiro visual de 1 a 2 linhas por bloco, métricas reais e zero clichês corporativos.')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.08] text-white/70 border border-white/[0.06] transition-all whitespace-nowrap"
                  >
                    <Wand2 size={11} />
                    <span>Reescrever tom LinkedIn</span>
                  </button>

                  <button
                    type="button"
                    disabled={isRewriting || (!linkedinText.trim() && !text.trim())}
                    onClick={() => handleRewrite('Ajuste as primeiras 2 linhas para criar um gancho irresistível antes do botão ...ver mais, mantendo a profundidade do restante.')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.08] text-white/70 border border-white/[0.06] transition-all whitespace-nowrap"
                  >
                    <span>Gancho para "...ver mais"</span>
                  </button>
                </div>
              </>
            )}

            {/* Schedule Date & Media Url Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/[0.06]">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono text-white/50 flex items-center gap-1">
                    <CalendarClock size={12} /> Agendar Data e Hora:
                  </label>
                  {scheduledFor && (
                    <button
                      type="button"
                      onClick={() => setScheduledFor('')}
                      className="text-[10px] font-mono text-violet-400 hover:text-violet-300"
                    >
                      Usar Smart Slot
                    </button>
                  )}
                </div>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50 font-mono"
                />
                <span className="text-[10px] font-mono text-zinc-500">
                  {scheduledFor
                    ? 'Horário manual customizado'
                    : '⚡ Vazio: ocupará automaticamente o próximo Smart Slot livre (09:00, 14:30 ou 18:30 BRT)'}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono text-white/50 flex items-center gap-1">
                    <ImageIcon size={12} className="text-violet-400" /> Imagem Anexa:
                  </label>
                  {mediaUrl && (
                    <button
                      type="button"
                      onClick={() => setMediaUrl('')}
                      className="text-[10px] font-mono text-red-400 hover:text-red-300"
                    >
                      Remover imagem
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="Cole a URL ou envie um arquivo..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50 font-mono"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-violet-400" />
                        <span>Enviando…</span>
                      </>
                    ) : (
                      <>
                        <Upload size={13} className="text-violet-400" />
                        <span>Upload</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLibraryOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 transition-all cursor-pointer whitespace-nowrap"
                    title="Escolher mídia salva no acervo"
                  >
                    <FolderOpen size={13} className="text-violet-400" />
                    <span>Do Acervo</span>
                  </button>
                </div>
                {uploadError && (
                  <span className="text-[10px] text-amber-400 font-mono">{uploadError}</span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-mono text-white/40 uppercase">
              VISUALIZAÇÃO EM TEMPO REAL
            </span>
            <PostPreviewCard
              text={text}
              linkedinText={linkedinText}
              thread={thread}
              threadStyle={threadStyle}
              platforms={platforms}
              authorName={authorName}
              authorHandle={authorHandle}
              authorHeadline={authorHeadline}
              mediaUrls={mediaUrl ? [mediaUrl] : []}
            />

            {/* Direct Intent Shortcut Helpers */}
            <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] mt-auto">
              <span className="text-[11px] text-white/40">Postagem direta sem API paga:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenXIntent}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-black border border-white/[0.15] text-white text-[11px] font-medium hover:bg-white/[0.08] transition-colors"
                >
                  <ExternalLink size={11} /> Abrir no X
                </button>
                <button
                  type="button"
                  onClick={handleOpenLinkedInIntent}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0A66C2]/20 border border-[#0A66C2]/40 text-[#70b5f9] text-[11px] font-medium hover:bg-[#0A66C2]/30 transition-colors"
                >
                  <ExternalLink size={11} /> Abrir no LinkedIn
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/[0.08] bg-[#0c0c12] flex-wrap gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white transition-colors"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSaving || !text.trim()}
              onClick={handleSaveDraft}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.07] hover:bg-white/[0.12] text-white transition-all disabled:opacity-40 cursor-pointer"
            >
              Salvar como rascunho
            </button>

            {initialPost?.status === 'AWAITING_APPROVAL' && onApprove && (
              <button
                type="button"
                disabled={isSaving || !text.trim()}
                onClick={handleApproveAndSchedule}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md transition-all disabled:opacity-40 cursor-pointer"
              >
                <CheckCircle2 size={14} />
                <span>Aprovar & Agendar</span>
              </button>
            )}

            <button
              type="button"
              disabled={isPublishing || !text.trim()}
              onClick={handlePublishDirect}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-white/90 transition-all disabled:opacity-40 cursor-pointer shadow-sm"
            >
              <Send size={13} />
              <span>{isPublishing ? 'Publicando…' : 'Publicar agora'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Media Library Picker Modal Overlay */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto p-6 rounded-2xl bg-[#0f0f15] border border-white/[0.1] shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <FolderOpen size={18} className="text-violet-400" />
                <span className="text-sm font-semibold text-white">Selecionar Mídia do Acervo</span>
              </div>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <MediaLibraryView
              isModalPicker={true}
              onSelectMedia={(url) => {
                setMediaUrl(url);
                setIsLibraryOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
