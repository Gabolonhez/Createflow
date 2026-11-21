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
  Eye,
  Edit3,
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
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl h-full sm:h-auto sm:max-h-[92vh] rounded-none sm:rounded-[24px] bg-[#111111] border-0 sm:border border-[#262626] shadow-[0_24px_80px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden">
        {/* Modal Header (macOS Window Chrome) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#1f1f1f] bg-[#141414] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 mr-1">
              <span className="size-2.5 rounded-full bg-[#ff5f56]" />
              <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="size-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <span className="font-medium text-sm text-[#ececec] tracking-[-0.02em]">
              {initialPost?.id ? 'Editar Post' : 'Criar Novo Post'}
            </span>
            {initialPost?.status && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-[5px] bg-[#212121] text-[#8a8a8a]">
                {initialPost.status}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-7 rounded-full flex items-center justify-center text-[#6f6f6f] hover:text-[#ececec] hover:bg-[#212121] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Mobile Tab Switcher (Pluy Segmented Pill) */}
        <div className="lg:hidden flex items-center justify-center p-2 bg-[#141414] border-b border-[#1f1f1f] shrink-0">
          <div className="grid grid-cols-2 w-full max-w-xs p-1 rounded-full bg-[#161616] border border-[#242424]">
            <button
              type="button"
              onClick={() => setMobileTab('editor')}
              className={`py-1.5 text-xs font-medium rounded-full transition-all flex items-center justify-center gap-1.5 active:scale-[0.97] ${
                mobileTab === 'editor'
                  ? 'bg-[#282828] text-white shadow-sm'
                  : 'text-[#8a8a8a] hover:text-[#ececec]'
              }`}
            >
              <Edit3 size={12} />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className={`py-1.5 text-xs font-medium rounded-full transition-all flex items-center justify-center gap-1.5 active:scale-[0.97] ${
                mobileTab === 'preview'
                  ? 'bg-[#282828] text-white shadow-sm'
                  : 'text-[#8a8a8a] hover:text-[#ececec]'
              }`}
            >
              <Eye size={13} />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
          {/* LEFT: Composer Controls */}
          <div className={`flex-col gap-4 min-w-0 ${mobileTab === 'editor' ? 'flex' : 'hidden lg:flex'}`}>
            {/* Platform Selection & Pillar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono text-[#6f6f6f]">Canais:</span>
                <button
                  type="button"
                  onClick={() => togglePlatform('x')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all active:scale-[0.97] border ${
                    platforms.includes('x')
                      ? 'bg-[#f2f2f2] text-[#0a0a0a] border-transparent'
                      : 'bg-[#1a1a1a] border-[#262626] text-[#8a8a8a] hover:text-[#ececec]'
                  }`}
                >
                  <XLogo className="size-3" />
                  <span>X</span>
                </button>

                <button
                  type="button"
                  onClick={() => togglePlatform('linkedin')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all active:scale-[0.97] border ${
                    platforms.includes('linkedin')
                      ? 'bg-[#0A66C2] text-white border-transparent'
                      : 'bg-[#1a1a1a] border-[#262626] text-[#8a8a8a] hover:text-[#ececec]'
                  }`}
                >
                  <LinkedInLogo className="size-3 text-current" />
                  <span>LinkedIn</span>
                </button>

                <button
                  type="button"
                  onClick={() => togglePlatform('instagram')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all active:scale-[0.97] border ${
                    platforms.includes('instagram')
                      ? 'bg-[#282828] border-[#ececec]/50 text-white'
                      : 'bg-[#1a1a1a] border-[#262626] text-[#8a8a8a] hover:text-[#ececec]'
                  }`}
                >
                  <InstagramLogo className="size-3 text-pink-400" />
                  <span>Instagram</span>
                </button>

                <button
                  type="button"
                  onClick={() => togglePlatform('tiktok')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all active:scale-[0.97] border ${
                    platforms.includes('tiktok')
                      ? 'bg-[#282828] border-[#ececec]/50 text-white'
                      : 'bg-[#1a1a1a] border-[#262626] text-[#8a8a8a] hover:text-[#ececec]'
                  }`}
                >
                  <TikTokLogo className="size-3 text-cyan-400" />
                  <span>TikTok</span>
                </button>
              </div>

              {/* Pillar selection */}
              <select
                value={pillar}
                onChange={(e) => setPillar(e.target.value)}
                className="px-3 py-1.5 rounded-full bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs focus:outline-none focus:border-[#4e4e4e]"
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
              <div className="p-3.5 rounded-[18px] bg-[#161616] border border-[#242424] flex flex-col gap-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[#ececec]" />
                    <span className="text-xs font-medium text-[#ececec]">
                      Ativar Funil Auto-DM (Comentário → Direct)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoDmEnabled(!autoDmEnabled)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${
                      autoDmEnabled ? 'bg-[#0c8ce9]' : 'bg-[#333333]'
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2.5 border-t border-[#222222]">
                    <div>
                      <label className="text-[10px] font-mono text-[#8a8a8a] block mb-1">
                        Palavra-chave Gatilho:
                      </label>
                      <input
                        type="text"
                        value={autoDmKeyword}
                        onChange={(e) => setAutoDmKeyword(e.target.value.toUpperCase())}
                        placeholder="Ex: GUIA"
                        className="w-full px-3 py-1.5 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-xs text-[#ececec] font-mono uppercase focus:outline-none focus:border-[#4e4e4e]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-[#8a8a8a] block mb-1">
                        Link entregue na DM:
                      </label>
                      <input
                        type="url"
                        value={autoDmLink}
                        onChange={(e) => setAutoDmLink(e.target.value)}
                        placeholder="https://createflow.ai/..."
                        className="w-full px-3 py-1.5 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-xs text-[#ececec] font-mono focus:outline-none focus:border-[#4e4e4e]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Platform Sub-Tabs when Cross-posting to both */}
            {isX && isLinkedIn && (
              <div className="flex items-center gap-1 p-1 bg-[#161616] rounded-full border border-[#242424]">
                <button
                  type="button"
                  onClick={() => setActiveEditorTab('x')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-medium transition-all active:scale-[0.97] ${
                    activeEditorTab === 'x'
                      ? 'bg-[#282828] text-white shadow-sm'
                      : 'text-[#8a8a8a] hover:text-[#ececec]'
                  }`}
                >
                  <XLogo className="size-3" />
                  <span>Editar Versão X</span>
                  <span className={`text-[10px] font-mono px-1.5 rounded-[5px] ${charCount > 280 ? 'bg-[#ff5f56]/20 text-[#ff8a84]' : 'bg-[#1a1a1a] text-[#9a9a9a]'}`}>
                    {charCount}/280
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveEditorTab('linkedin')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-medium transition-all active:scale-[0.97] ${
                    activeEditorTab === 'linkedin'
                      ? 'bg-[#282828] text-white shadow-sm'
                      : 'text-[#8a8a8a] hover:text-[#ececec]'
                  }`}
                >
                  <LinkedInLogo className="size-3 text-[#0A66C2]" />
                  <span>Editar Versão LinkedIn</span>
                  <span className={`text-[10px] font-mono px-1.5 rounded-[5px] ${linkedinCharCount >= 800 && linkedinCharCount <= 1800 ? 'bg-[#7ae6a0]/15 text-[#7ae6a0]' : 'bg-[#1a1a1a] text-[#9a9a9a]'}`}>
                    {linkedinCharCount > 0 ? `${linkedinCharCount}c` : '0c'}
                  </span>
                </button>
              </div>
            )}

            {/* AI Voice Check Notification if any */}
            {voiceCheck?.level === 'warn' && (
              <div className="flex items-start justify-between gap-2 p-3 rounded-2xl bg-[#ffbd2e]/10 border border-[#ffbd2e]/25 text-[#ffd27d]">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={15} className="text-[#ffbd2e] shrink-0 mt-0.5" />
                  <div className="flex flex-col text-xs">
                    <span className="font-medium text-[#ffbd2e]">Atenção ao Tom de Voz</span>
                    <span className="text-[11px] text-[#ffd27d]/80 mt-0.5">
                      {voiceCheck.items[0]?.message || 'Ajuste para soar mais direto e autêntico.'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isRewriting}
                  onClick={() => handleRewrite('Remova o clichê e deixe 100% autêntico no meu tom')}
                  className="px-3 py-1 rounded-full bg-[#ffbd2e]/20 hover:bg-[#ffbd2e]/30 text-[#ffbd2e] font-medium text-[11px] flex items-center gap-1 shrink-0"
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
                    <span className="text-[#8a8a8a]">1º Tweet (Gancho curto & seco)</span>
                    <span
                      className={`${
                        xOverLimit ? 'text-[#ff5f56] font-bold' : 'text-[#6f6f6f]'
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
                    className="w-full p-3.5 rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-[13px] leading-relaxed placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4e4e4e] resize-none font-sans"
                  />
                </div>

                {/* AI Quick Helpers Bar for X */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                  <button
                    type="button"
                    disabled={isRewriting || !text.trim()}
                    onClick={() => handleRewrite()}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2c2c2c] transition-all whitespace-nowrap active:scale-[0.97]"
                  >
                    {isRewriting ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                    <span>Reescrever tom</span>
                  </button>

                  <button
                    type="button"
                    disabled={isRewriting || !text.trim()}
                    onClick={() => handleRewrite('Encurte para caber em exatamente 280 caracteres mantendo o soco.')}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-[#1a1a1a] hover:bg-[#242424] text-[#9a9a9a] hover:text-[#ececec] border border-[#262626] transition-all whitespace-nowrap active:scale-[0.97]"
                  >
                    <span>Encurtar (&lt;280)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isRewriting || !text.trim()}
                    onClick={() => handleRewrite('Crie um gancho mais forte e seco na primeira linha.')}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-[#1a1a1a] hover:bg-[#242424] text-[#9a9a9a] hover:text-[#ececec] border border-[#262626] transition-all whitespace-nowrap active:scale-[0.97]"
                  >
                    <span>Gancho afiado</span>
                  </button>

                  {isTranslatedToEn ? (
                    <button
                      type="button"
                      disabled={isTranslating}
                      onClick={() => handleTranslate('pt-BR')}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-[#7ae6a0]/12 hover:bg-[#7ae6a0]/20 text-[#7ae6a0] border border-[#7ae6a0]/25 transition-all whitespace-nowrap active:scale-[0.97]"
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
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-[#1a1a1a] hover:bg-[#242424] text-[#9a9a9a] hover:text-[#ececec] border border-[#262626] transition-all whitespace-nowrap active:scale-[0.97]"
                      title="Transcriar para inglês de operador (< 280c no X mantendo gancho)"
                    >
                      {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
                      <span>Traduzir p/ Inglês</span>
                    </button>
                  )}

                  {isLinkedIn && (
                    <button
                      type="button"
                      disabled={isExpandingForLinkedIn || !text.trim()}
                      onClick={handleExpandFromXToLinkedIn}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2c2c2c] transition-all whitespace-nowrap active:scale-[0.97]"
                    >
                      {isExpandingForLinkedIn ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      <span>Expandir p/ LinkedIn</span>
                    </button>
                  )}

                  {/* AI Watermark & Humanizer Badge/Action for X */}
                  {aiDetection.isFlagged ? (
                    <button
                      type="button"
                      onClick={handleCleanAiWatermarks}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-[#ffbd2e]/15 hover:bg-[#ffbd2e]/25 text-[#ffbd2e] border border-[#ffbd2e]/30 transition-all whitespace-nowrap active:scale-[0.97]"
                      title={aiDetection.summary}
                    >
                      <ShieldAlert size={12} className="text-[#ffbd2e]" />
                      <span>Limpar Marcas IA ({aiDetection.watermarksCount > 0 ? `${aiDetection.watermarksCount} invisíveis` : 'Humanizar'})</span>
                    </button>
                  ) : (
                    <div
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono text-[#7ae6a0] bg-[#7ae6a0]/10 border border-[#7ae6a0]/20 whitespace-nowrap"
                      title="Zero marcas d'água invisíveis e zero travessões de IA detectados"
                    >
                      <ShieldCheck size={11} className="text-[#7ae6a0]" />
                      <span>100% Humano</span>
                    </div>
                  )}
                </div>

                {/* Thread Tweets Section */}
                {thread.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-[#1f1f1f]">
                    <span className="text-[11px] font-mono text-[#9a9a9a]">
                      Fio / Continuação ({thread.length} adicionais):
                    </span>
                    {thread.map((t, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <span className="text-[11px] font-mono text-[#6f6f6f] pt-2 shrink-0">
                          #{idx + 2}
                        </span>
                        <textarea
                          rows={3}
                          value={t}
                          onChange={(e) => updateThreadTweet(idx, e.target.value)}
                          placeholder={`Tweet #${idx + 2}...`}
                          className="flex-1 p-2.5 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs leading-relaxed focus:outline-none focus:border-[#4e4e4e] resize-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeThreadTweet(idx)}
                          className="p-1.5 rounded-full text-[#6f6f6f] hover:text-[#ff5f56] transition-colors shrink-0 mt-1"
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
                  className="flex items-center gap-1.5 text-xs font-mono text-[#9a9a9a] hover:text-[#ececec] transition-colors w-fit pt-1"
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
                    <span className="text-[#ececec] font-medium">Post Completo para LinkedIn (Narrativo &amp; Aprofundado)</span>
                    <div className="flex items-center gap-1.5">
                      {linkedinCharCount === 0 && (
                        <span className="text-[#ffbd2e] text-[10px]">Vazio (clique em Expandir do X)</span>
                      )}
                      {linkedinCharCount > 0 && linkedinCharCount < 600 && (
                        <span className="text-[#ffbd2e] text-[10px]">Curto ({linkedinCharCount}c · ideal: 800-1.800)</span>
                      )}
                      {linkedinCharCount >= 600 && linkedinCharCount <= 2200 && (
                        <span className="text-[#7ae6a0] text-[10px]">✓ Excelente extensão ({linkedinCharCount}c)</span>
                      )}
                      {linkedinCharCount > 2200 && (
                        <span className="text-[#8a8a8a] text-[10px]">{linkedinCharCount} caracteres</span>
                      )}
                    </div>
                  </div>

                  <textarea
                    rows={9}
                    value={linkedinText}
                    onChange={(e) => setLinkedinText(e.target.value)}
                    placeholder="Escreva seu post do LinkedIn aqui (800 a 1.800 caracteres com gancho nas primeiras 2 linhas para '...ver mais', parágrafos curtos de 1 a 2 linhas com espaçamento visual e lições práticas)..."
                    className="w-full p-3.5 rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-[13px] leading-relaxed placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4e4e4e] resize-none font-sans"
                  />
                </div>

                {/* AI Quick Helpers Bar for LinkedIn */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                  <button
                    type="button"
                    disabled={isExpandingForLinkedIn || !text.trim()}
                    onClick={handleExpandFromXToLinkedIn}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2c2c2c] transition-all whitespace-nowrap active:scale-[0.97]"
                  >
                    {isExpandingForLinkedIn ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    <span>Expandir do Tweet</span>
                  </button>

                  <button
                    type="button"
                    disabled={isRewriting || (!linkedinText.trim() && !text.trim())}
                    onClick={() => handleRewrite('Reescreva no tom autoral de operador para LinkedIn: 800 a 1.500 caracteres, gancho forte nas primeiras 2 linhas, respiro visual de 1 a 2 linhas por bloco, métricas reais e zero clichês corporativos.')}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-[#1a1a1a] hover:bg-[#242424] text-[#9a9a9a] hover:text-[#ececec] border border-[#262626] transition-all whitespace-nowrap active:scale-[0.97]"
                  >
                    <Wand2 size={11} />
                    <span>Reescrever tom</span>
                  </button>

                  <button
                    type="button"
                    disabled={isRewriting || (!linkedinText.trim() && !text.trim())}
                    onClick={() => handleRewrite('Ajuste as primeiras 2 linhas para criar um gancho irresistível antes do botão ...ver mais, mantendo a profundidade do restante.')}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-[#1a1a1a] hover:bg-[#242424] text-[#9a9a9a] hover:text-[#ececec] border border-[#262626] transition-all whitespace-nowrap active:scale-[0.97]"
                  >
                    <span>Gancho &quot;...ver mais&quot;</span>
                  </button>

                  {isTranslatedToEn ? (
                    <button
                      type="button"
                      disabled={isTranslating}
                      onClick={() => handleTranslate('pt-BR')}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-[#7ae6a0]/12 hover:bg-[#7ae6a0]/20 text-[#7ae6a0] border border-[#7ae6a0]/25 transition-all whitespace-nowrap active:scale-[0.97]"
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
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-[#1a1a1a] hover:bg-[#242424] text-[#9a9a9a] hover:text-[#ececec] border border-[#262626] transition-all whitespace-nowrap active:scale-[0.97]"
                      title="Transcriar para inglês de operador do Vale do Silício"
                    >
                      {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
                      <span>Traduzir p/ Inglês</span>
                    </button>
                  )}

                  {/* AI Watermark & Humanizer Badge/Action for LinkedIn */}
                  {aiDetection.isFlagged ? (
                    <button
                      type="button"
                      onClick={handleCleanAiWatermarks}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-[#ffbd2e]/15 hover:bg-[#ffbd2e]/25 text-[#ffbd2e] border border-[#ffbd2e]/30 transition-all whitespace-nowrap active:scale-[0.97]"
                      title={aiDetection.summary}
                    >
                      <ShieldAlert size={12} className="text-[#ffbd2e]" />
                      <span>Limpar Marcas IA ({aiDetection.watermarksCount > 0 ? `${aiDetection.watermarksCount} invisíveis` : 'Humanizar'})</span>
                    </button>
                  ) : (
                    <div
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono text-[#7ae6a0] bg-[#7ae6a0]/10 border border-[#7ae6a0]/20 whitespace-nowrap"
                      title="Zero marcas d'água invisíveis e zero travessões de IA detectados"
                    >
                      <ShieldCheck size={11} className="text-[#7ae6a0]" />
                      <span>100% Humano</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Schedule Date & Media Controls */}
            <div className="flex flex-col gap-3 pt-3 border-t border-[#1f1f1f]">
              {/* Schedule Date Box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-[18px] bg-[#161616] border border-[#242424]">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#ececec] flex items-center gap-1.5">
                      <CalendarClock size={13} className="text-[#9a9a9a]" /> Agendar Data e Hora
                    </span>
                    {scheduledFor && (
                      <button
                        type="button"
                        onClick={() => setScheduledFor('')}
                        className="text-[10px] font-mono text-[#ececec] hover:underline"
                      >
                        Usar Smart Slot
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-[#6f6f6f] font-mono">
                    {scheduledFor
                      ? 'Horário agendado manualmente'
                      : 'Automático: ocupará o próximo Smart Slot livre'}
                  </span>
                </div>

                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs focus:outline-none focus:border-[#4e4e4e] font-mono self-start sm:self-auto"
                />
              </div>

              {/* Media Controls Box */}
              <div className="flex flex-col gap-2.5 p-3.5 rounded-[18px] bg-[#161616] border border-[#242424] relative z-20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#ececec] flex items-center gap-1.5">
                    <ImageIcon size={13} className="text-[#9a9a9a]" /> Mídia Anexa (Imagem ou Vídeo)
                  </span>
                  {mediaUrl && (
                    <button
                      type="button"
                      onClick={() => setMediaUrl('')}
                      className="text-[11px] font-mono text-[#ff8a84] hover:text-[#ff5f56] transition-colors"
                    >
                      Remover mídia
                    </button>
                  )}
                </div>

                {/* 3 Action Buttons (Pluy Pills) */}
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
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2c2c2c] transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 active:scale-[0.97]"
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-[#ececec]" />
                        <span>Enviando…</span>
                      </>
                    ) : (
                      <>
                        <Upload size={13} className="text-[#9a9a9a]" />
                        <span>Upload Arquivo</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLibraryOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2c2c2c] transition-all cursor-pointer whitespace-nowrap active:scale-[0.97]"
                    title="Escolher mídia salva no acervo"
                  >
                    <FolderOpen size={13} className="text-[#9a9a9a]" />
                    <span>Do Acervo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAiImageModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-[0.97]"
                    title="Gerar visual técnico com IA (FLUX) ideal para este post"
                  >
                    <Sparkles size={13} className="text-[#0a0a0a]" />
                    <span>Gerar com IA</span>
                  </button>
                </div>

                {/* URL Input */}
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="Ou cole a URL direta de uma imagem ou vídeo..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4e4e4e] font-mono"
                />

                {/* Media Preview thumbnail if attached */}
                {mediaUrl && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-[#111111] border border-[#242424]">
                    <img
                      src={mediaUrl}
                      alt="Anexo"
                      className="size-10 rounded-lg object-cover border border-[#2c2c2c] bg-black"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[11px] font-mono text-[#7ae6a0] flex items-center gap-1">
                        <Check size={11} /> Mídia pronta e anexada
                      </span>
                      <span className="text-[10px] text-[#6f6f6f] font-mono truncate">
                        {mediaUrl}
                      </span>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <span className="text-[10px] text-[#ffbd2e] font-mono">{uploadError}</span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Live Preview */}
          <div className={`${mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'} flex-col gap-3 min-w-0`}>
            <span className="text-[11px] font-mono text-[#6f6f6f] uppercase">
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3.5 rounded-[18px] bg-[#161616] border border-[#242424] mt-auto">
              <span className="text-[11px] text-[#8a8a8a]">Postagem direta sem API paga:</span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleOpenXIntent}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#212121] border border-[#2c2c2c] text-[#ececec] text-[11px] font-medium hover:bg-[#2a2a2a] transition-colors active:scale-[0.97]"
                >
                  <ExternalLink size={11} /> Abrir no X
                </button>
                <button
                  type="button"
                  onClick={handleOpenLinkedInIntent}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#212121] border border-[#2c2c2c] text-[#ececec] text-[11px] font-medium hover:bg-[#2a2a2a] transition-colors active:scale-[0.97]"
                >
                  <ExternalLink size={11} /> Abrir no LinkedIn
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-t border-[#1f1f1f] bg-[#141414] gap-2.5 sm:gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2a2a2a] border border-[#2c2c2c] text-[#ececec] transition-all active:scale-[0.97] text-center"
          >
            Cancelar
          </button>

          <div className="flex items-center justify-end gap-2 flex-wrap">
            <button
              type="button"
              disabled={isSaving || !text.trim()}
              onClick={handleSaveDraft}
              className="flex-1 sm:flex-none px-4 py-1.5 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2a2a2a] border border-[#2c2c2c] text-[#ececec] transition-all active:scale-[0.97] disabled:opacity-40 cursor-pointer text-center"
            >
              Salvar rascunho
            </button>

            {initialPost?.status === 'AWAITING_APPROVAL' && onApprove && (
              <button
                type="button"
                disabled={isSaving || !text.trim()}
                onClick={handleApproveAndSchedule}
                className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-[#2a2a2a] hover:bg-[#333333] border border-[#3e3e3e] text-white transition-all active:scale-[0.97] disabled:opacity-40 cursor-pointer"
              >
                <CheckCircle2 size={14} />
                <span>Aprovar &amp; Agendar</span>
              </button>
            )}

            <button
              type="button"
              disabled={isPublishing || !text.trim()}
              onClick={handlePublishDirect}
              className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-[#f2f2f2] text-[#0a0a0a] hover:bg-white transition-all active:scale-[0.97] disabled:opacity-40 cursor-pointer shadow-sm"
            >
              <Send size={13} />
              <span>{isPublishing ? 'Publicando…' : 'Publicar agora'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Media Library Picker Modal Overlay */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto p-5 sm:p-6 rounded-[24px] bg-[#141414] border border-[#262626] shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f1f1f]">
              <div className="flex items-center gap-2">
                <FolderOpen size={18} className="text-[#ececec]" />
                <span className="text-sm font-medium text-[#ececec]">Selecionar Mídia do Acervo</span>
              </div>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="p-1.5 rounded-full text-[#6f6f6f] hover:text-[#ececec] hover:bg-[#212121] transition-colors cursor-pointer"
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
