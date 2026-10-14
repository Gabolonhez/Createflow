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
  Globe,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { XLogo, LinkedInLogo, InstagramLogo, TikTokLogo } from './BrandIcons';
import { PostPreviewCard } from './PostPreviewCard';
import { MediaLibraryView } from './MediaLibraryView';
import { AiImageModal } from './AiImageModal';
import { generateXIntentUrl } from '@/lib/twitter';
import { generateLinkedInIntentUrl } from '@/lib/linkedin';
import { uploadPostImageAction, translatePostAction } from '@/app/actions';
import { detectAiMarkers, humanizeText } from '@/lib/humanizer';
import type { CreatorPost, Platform, ThreadStyle, DmCampaign, DmAutomationPlatform } from '@/types';

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
  onSaveAutoDm?: (campaign: Partial<DmCampaign>) => Promise<void>;
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
  onSaveAutoDm,
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
  const [activeEditorTab, setActiveEditorTab] = useState<Platform>(
    initialPost?.platforms?.[0] || 'x'
  );
  const [threadStyle, setThreadStyle] = useState<ThreadStyle>(
    initialPost?.threadStyle || 'single'
  );
  const [pillar, setPillar] = useState(initialPost?.pillar || 'tech-insights');
  const [mediaUrl, setMediaUrl] = useState(initialPost?.mediaUrls?.[0] || '');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isAiImageModalOpen, setIsAiImageModalOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [autoDmEnabled, setAutoDmEnabled] = useState(false);
  const [autoDmKeyword, setAutoDmKeyword] = useState('GUIA');
  const [autoDmLink, setAutoDmLink] = useState('https://createflow.ai');
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
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslatedToEn, setIsTranslatedToEn] = useState(false);
  const [originalPtState, setOriginalPtState] = useState<{
    text: string;
    thread: string[];
    linkedinText: string;
  } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleTranslate = async (targetLang: 'en-US' | 'pt-BR') => {
    if (targetLang === 'pt-BR' && originalPtState) {
      setText(originalPtState.text);
      setThread(originalPtState.thread);
      setLinkedinText(originalPtState.linkedinText);
      setIsTranslatedToEn(false);
      return;
    }

    setIsTranslating(true);
    try {
      setOriginalPtState({
        text,
        thread: [...thread],
        linkedinText,
      });

      const res = await translatePostAction({
        text,
        thread: thread.length > 0 ? thread : undefined,
        linkedinText: linkedinText.trim() ? linkedinText : undefined,
        targetLanguage: targetLang,
      });

      if (res.translated) {
        setText(res.translated.text);
        if (res.translated.thread && res.translated.thread.length > 0) {
          setThread(res.translated.thread);
        }
        if (res.translated.linkedinText) {
          setLinkedinText(res.translated.linkedinText);
        }
        setIsTranslatedToEn(true);
      }
    } catch (err: any) {
      console.error('Erro na tradução:', err);
    } finally {
      setIsTranslating(false);
    }
  };

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

  const currentActiveText = activeEditorTab === 'x' ? text : (linkedinText || text);
  const aiDetection = detectAiMarkers(currentActiveText);

  const handleCleanAiWatermarks = () => {
    if (activeEditorTab === 'x') {
      const res = humanizeText(text);
      setText(res.text);
      if (thread.length > 0) {
        setThread(thread.map((t) => humanizeText(t).text));
      }
    } else {
      const res = humanizeText(linkedinText || text);
      setLinkedinText(res.text);
    }
  };

  const syncAutoDmIfEnabled = async (postId?: string) => {
    if (autoDmEnabled && onSaveAutoDm) {
      try {
        const targetPlatform: DmAutomationPlatform = 'instagram';

        await onSaveAutoDm({
          name: `Funil [${autoDmKeyword.toUpperCase()}] - ${(text || 'Post').slice(0, 30)}`,
          platform: targetPlatform,
          accountId: authorHandle,
          accountUsername: authorHandle.replace('@', ''),
          postId: postId || initialPost?.id || undefined,
          keywords: [autoDmKeyword.trim() || 'GUIA'],
          matchType: 'contains',
          scope: postId ? 'specific' : 'any',
          dmTriggerEnabled: true,
          dmMessage: `Olá! Aqui está o conteúdo exclusivo solicitado: ${autoDmLink}`,
          dmMessages: [`Olá! Aqui está o conteúdo exclusivo solicitado: ${autoDmLink}`],
          targetUrl: autoDmLink,
          linkButtonLabel: 'Acessar Conteúdo',
          requireFollow: true,
          followPromptMessage: 'Notei que você ainda não me segue! Siga o perfil para liberar o link exclusivo imediatamente.',
          followPromptButtonLabel: 'Já estou seguindo',
          publicReplyEnabled: true,
          publicReplyMessages: [
            'Acabei de enviar no seu Direct! Confere lá 🚀',
            'Enviado no privado com sucesso! 📥',
            'Link enviado na DM, aproveite o conteúdo! ✨',
          ],
          isActive: true,
        });
      } catch (err) {
        console.error('Erro ao sincronizar Auto-DM:', err);
      }
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
      await syncAutoDmIfEnabled(initialPost?.id);
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
      await syncAutoDmIfEnabled(initialPost.id);
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
      await syncAutoDmIfEnabled(initialPost.id);
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
          <div className="flex flex-col gap-4 min-w-0">
            {/* Platform Selection & Pillar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
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
                  <span>X</span>
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

                <button
                  type="button"
                  onClick={() => togglePlatform('instagram')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    platforms.includes('instagram')
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold shadow-sm'
                      : 'bg-white/[0.05] text-white/40 hover:text-white'
                  }`}
                >
                  <InstagramLogo className="size-3" />
                  <span>Instagram</span>
                </button>

                <button
                  type="button"
                  onClick={() => togglePlatform('tiktok')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    platforms.includes('tiktok')
                      ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold shadow-sm'
                      : 'bg-white/[0.05] text-white/40 hover:text-white'
                  }`}
                >
                  <TikTokLogo className="size-3" />
                  <span>TikTok</span>
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

            {/* Quick Auto-DM Activation for Instagram */}
            {platforms.includes('instagram') && (
              <div className="p-3 rounded-xl bg-violet-600/10 border border-violet-500/25 flex flex-col gap-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-violet-400" />
                    <span className="text-xs font-semibold text-white">
                      ⚡ Ativar Funil Auto-DM (Comentário → Direct)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoDmEnabled(!autoDmEnabled)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${
                      autoDmEnabled ? 'bg-violet-600' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform ${
                        autoDmEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {autoDmEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-violet-500/20">
                    <div>
                      <label className="text-[10px] font-mono text-violet-300 block mb-1">
                        Palavra-chave Gatilho:
                      </label>
                      <input
                        type="text"
                        value={autoDmKeyword}
                        onChange={(e) => setAutoDmKeyword(e.target.value.toUpperCase())}
                        placeholder="Ex: GUIA"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-violet-500/30 text-xs text-white font-mono uppercase focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-violet-300 block mb-1">
                        Link entregue na DM:
                      </label>
                      <input
                        type="url"
                        value={autoDmLink}
                        onChange={(e) => setAutoDmLink(e.target.value)}
                        placeholder="https://createflow.ai/..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-violet-500/30 text-xs text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

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

                  {isTranslatedToEn ? (
                    <button
                      type="button"
                      disabled={isTranslating}
                      onClick={() => handleTranslate('pt-BR')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/35 transition-all whitespace-nowrap active:scale-[0.98]"
                      title="Restaurar versão original em Português"
                    >
                      {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                      <span>↩ Voltar p/ Português</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isTranslating || !text.trim()}
                      onClick={() => handleTranslate('en-US')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 transition-all whitespace-nowrap active:scale-[0.98]"
                      title="Transcriar para inglês de operador (< 280c no X mantendo gancho)"
                    >
                      {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
                      <span>🌐 Traduzir p/ Inglês</span>
                    </button>
                  )}

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

                  {/* AI Watermark & Humanizer Badge/Action for X */}
                  {aiDetection.isFlagged ? (
                    <button
                      type="button"
                      onClick={handleCleanAiWatermarks}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all whitespace-nowrap active:scale-[0.98]"
                      title={aiDetection.summary}
                    >
                      <ShieldAlert size={12} className="text-amber-400" />
                      <span>🛡️ Limpar Marcas de IA ({aiDetection.watermarksCount > 0 ? `${aiDetection.watermarksCount} invisíveis` : 'Humanizar'})</span>
                    </button>
                  ) : (
                    <div
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 whitespace-nowrap"
                      title="Zero marcas d'água invisíveis e zero travessões de IA detectados"
                    >
                      <ShieldCheck size={11} className="text-emerald-400" />
                      <span>100% Humano</span>
                    </div>
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

                  {isTranslatedToEn ? (
                    <button
                      type="button"
                      disabled={isTranslating}
                      onClick={() => handleTranslate('pt-BR')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/35 transition-all whitespace-nowrap active:scale-[0.98]"
                      title="Restaurar versão original em Português"
                    >
                      {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                      <span>↩ Voltar p/ Português</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isTranslating || (!linkedinText.trim() && !text.trim())}
                      onClick={() => handleTranslate('en-US')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 transition-all whitespace-nowrap active:scale-[0.98]"
                      title="Transcriar para inglês de operador do Vale do Silício"
                    >
                      {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
                      <span>🌐 Traduzir p/ Inglês</span>
                    </button>
                  )}

                  {/* AI Watermark & Humanizer Badge/Action for LinkedIn */}
                  {aiDetection.isFlagged ? (
                    <button
                      type="button"
                      onClick={handleCleanAiWatermarks}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all whitespace-nowrap active:scale-[0.98]"
                      title={aiDetection.summary}
                    >
                      <ShieldAlert size={12} className="text-amber-400" />
                      <span>🛡️ Limpar Marcas de IA ({aiDetection.watermarksCount > 0 ? `${aiDetection.watermarksCount} invisíveis` : 'Humanizar'})</span>
                    </button>
                  ) : (
                    <div
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 whitespace-nowrap"
                      title="Zero marcas d'água invisíveis e zero travessões de IA detectados"
                    >
                      <ShieldCheck size={11} className="text-emerald-400" />
                      <span>100% Humano</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Schedule Date & Media Controls */}
            <div className="flex flex-col gap-3 pt-3 border-t border-white/[0.08]">
              {/* Schedule Date Box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white flex items-center gap-1.5">
                      <CalendarClock size={13} className="text-violet-400" /> Agendar Data e Hora
                    </span>
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
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {scheduledFor
                      ? 'Horário agendado manualmente'
                      : '⚡ Automático: ocupará o próximo Smart Slot livre'}
                  </span>
                </div>

                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50 font-mono self-start sm:self-auto"
                />
              </div>

              {/* Media Controls Box */}
              <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] relative z-20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white flex items-center gap-1.5">
                    <ImageIcon size={13} className="text-violet-400" /> Mídia Anexa (Imagem ou Vídeo)
                  </span>
                  {mediaUrl && (
                    <button
                      type="button"
                      onClick={() => setMediaUrl('')}
                      className="text-[11px] font-mono text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      Remover mídia
                    </button>
                  )}
                </div>

                {/* 3 Prominent Action Buttons */}
                <div className="flex items-center flex-wrap gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={isUploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 active:scale-[0.98]"
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-violet-400" />
                        <span>Enviando…</span>
                      </>
                    ) : (
                      <>
                        <Upload size={13} className="text-violet-400" />
                        <span>Upload Arquivo</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLibraryOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
                    title="Escolher mídia salva no acervo"
                  >
                    <FolderOpen size={13} className="text-violet-400" />
                    <span>Do Acervo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAiImageModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-600/25 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
                    title="Gerar visual técnico com IA (FLUX) ideal para este post"
                  >
                    <Sparkles size={13} className="text-violet-200" />
                    <span>✨ Gerar com IA</span>
                  </button>
                </div>

                {/* URL Input */}
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="Ou cole a URL direta de uma imagem ou vídeo..."
                  className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/[0.08] text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 font-mono"
                />

                {/* Media Preview thumbnail if attached */}
                {mediaUrl && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-black/40 border border-white/[0.06]">
                    <img
                      src={mediaUrl}
                      alt="Anexo"
                      className="size-10 rounded object-cover border border-white/[0.1] bg-black"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                        <Check size={11} /> Mídia pronta e anexada
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono truncate">
                        {mediaUrl}
                      </span>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <span className="text-[10px] text-amber-400 font-mono">{uploadError}</span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="flex flex-col gap-3 min-w-0">
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

      {/* AI Image Generator Modal Overlay */}
      <AiImageModal
        isOpen={isAiImageModalOpen}
        onClose={() => setIsAiImageModalOpen(false)}
        initialContext={activeEditorTab === 'linkedin' && linkedinText ? linkedinText : text}
        onSelectImage={(url) => {
          setMediaUrl(url);
          setIsAiImageModalOpen(false);
        }}
      />
    </div>
  );
}
