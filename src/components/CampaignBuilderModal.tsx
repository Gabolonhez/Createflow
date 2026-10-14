'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Check,
  Smartphone,
  Eye,
  MessageCircle,
  Clock,
  Layers,
  ChevronRight,
  RefreshCw,
  Image as ImageIcon,
  Copy,
  BookOpen,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { InstagramLogo, TikTokLogo } from './BrandIcons';
import { PostPicker } from './PostPicker';
import { CAMPAIGN_PRESET_TEMPLATES, type DmPresetTemplate } from '@/lib/campaign-templates';
import type { DmCampaign, DmAutomationPlatform, DmScope, DmMatchMode } from '@/types';

interface CampaignBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignToEdit?: DmCampaign | null;
  onSave: (campaign: Partial<DmCampaign>) => Promise<void>;
  existingCampaigns?: DmCampaign[];
}

export function CampaignBuilderModal({
  isOpen,
  onClose,
  campaignToEdit,
  onSave,
  existingCampaigns = [],
}: CampaignBuilderModalProps) {
  const isEditing = Boolean(campaignToEdit);

  // Form State
  const [platform, setPlatform] = useState<DmAutomationPlatform>(
    campaignToEdit?.platform || 'instagram'
  );
  const [name, setName] = useState(campaignToEdit?.name || '');
  const [scope, setScope] = useState<DmScope>(campaignToEdit?.scope || 'any');
  const [postId, setPostId] = useState(campaignToEdit?.postId || '');
  const [postUrl, setPostUrl] = useState(campaignToEdit?.postUrl || '');
  const [postThumbnail, setPostThumbnail] = useState(campaignToEdit?.postThumbnail || '');
  const [manualPostInput, setManualPostInput] = useState(false);
  const [keywords, setKeywords] = useState<string[]>(
    campaignToEdit?.keywords || ['GUIA', 'FLUXO']
  );
  const [keywordInput, setKeywordInput] = useState('');
  const [matchType, setMatchType] = useState<DmMatchMode>(
    campaignToEdit?.matchType || 'exact'
  );
  const [dmTriggerEnabled, setDmTriggerEnabled] = useState(
    campaignToEdit?.dmTriggerEnabled ?? true
  );

  // Opening DM / Welcome
  const [openingDmEnabled, setOpeningDmEnabled] = useState(
    campaignToEdit?.openingDmEnabled ?? false
  );
  const [openingDmMessage, setOpeningDmMessage] = useState(
    campaignToEdit?.openingDmMessage || 'Oi {username}! Quer que eu te envie o link direto no direct?'
  );
  const [openingDmButtonLabel, setOpeningDmButtonLabel] = useState(
    campaignToEdit?.openingDmButtonLabel || 'Sim, me manda! 🚀'
  );

  // Main Deliverable DM & Links
  const [dmMessage, setDmMessage] = useState(
    campaignToEdit?.dmMessage || 'O link {link}'
  );
  const [targetUrl, setTargetUrl] = useState(
    campaignToEdit?.targetUrl || ''
  );
  const [linkButtonLabel, setLinkButtonLabel] = useState(
    campaignToEdit?.linkButtonLabel || 'Abrir link'
  );

  // Optional Second Link
  const [secondLinkOpen, setSecondLinkOpen] = useState(
    Boolean(campaignToEdit?.secondaryTargetUrl)
  );
  const [secondaryTargetUrl, setSecondaryTargetUrl] = useState(
    campaignToEdit?.secondaryTargetUrl || ''
  );
  const [secondaryButtonLabel, setSecondaryButtonLabel] = useState(
    campaignToEdit?.secondaryButtonLabel || ''
  );

  // Optional Card with Image (Default OFF)
  const [cardOpen, setCardOpen] = useState(
    Boolean(campaignToEdit?.cardImageUrl)
  );
  const [cardImageUrl, setCardImageUrl] = useState(
    campaignToEdit?.cardImageUrl || ''
  );
  const [cardTitle, setCardTitle] = useState(
    campaignToEdit?.cardTitle || ''
  );
  const [cardSubtitle, setCardSubtitle] = useState(
    campaignToEdit?.cardSubtitle || ''
  );

  // Follow-gate
  const [requireFollow, setRequireFollow] = useState(
    campaignToEdit?.requireFollow ?? false
  );
  const [followPromptMessage, setFollowPromptMessage] = useState(
    campaignToEdit?.followPromptMessage ||
      'Ei {username}! Para liberar o link, basta seguir o nosso perfil e tocar em "Já segui" abaixo:'
  );
  const [followPromptButtonLabel, setFollowPromptButtonLabel] = useState(
    campaignToEdit?.followPromptButtonLabel || 'Já segui ✅'
  );

  // Follow-up
  const [followUpEnabled, setFollowUpEnabled] = useState(
    campaignToEdit?.followUpEnabled ?? false
  );
  const [followUpMessage, setFollowUpMessage] = useState(
    campaignToEdit?.followUpMessage ||
      'E aí {username}, conseguiu abrir o material? Qualquer dúvida me dá um toque aqui!'
  );
  const [followUpDelayMinutes, setFollowUpDelayMinutes] = useState(
    campaignToEdit?.followUpDelayMinutes || 15
  );

  // Public Reply
  const [publicReplyEnabled, setPublicReplyEnabled] = useState(
    campaignToEdit?.publicReplyEnabled ?? true
  );
  const [publicReplyMessages, setPublicReplyMessages] = useState<string[]>(
    campaignToEdit?.publicReplyMessages || [
      'Te mandei no direct! 🚀',
      'Acabei de enviar, confere suas mensagens! ✨',
      'Enviado com sucesso! Dá uma olhada na DM 📩',
    ]
  );
  const [newReplyInput, setNewReplyInput] = useState('');

  // Modals for Templates and Clone
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isCloneOpen, setIsCloneOpen] = useState(false);
  const [templateFilterCategory, setTemplateFilterCategory] = useState<string>('all');

  // Synchronize state when editing campaign or opening
  useEffect(() => {
    if (campaignToEdit) {
      setPlatform(campaignToEdit.platform || 'instagram');
      setName(campaignToEdit.name || '');
      setScope(campaignToEdit.scope || 'any');
      setPostId(campaignToEdit.postId || '');
      setPostUrl(campaignToEdit.postUrl || '');
      setPostThumbnail(campaignToEdit.postThumbnail || '');
      setKeywords(campaignToEdit.keywords || ['GUIA', 'FLUXO']);
      setMatchType(campaignToEdit.matchType || 'exact');
      setDmTriggerEnabled(campaignToEdit.dmTriggerEnabled ?? true);
      setOpeningDmEnabled(campaignToEdit.openingDmEnabled ?? false);
      setOpeningDmMessage(
        campaignToEdit.openingDmMessage ||
          'Oi {username}! Quer que eu te envie o link direto no direct?'
      );
      setOpeningDmButtonLabel(
        campaignToEdit.openingDmButtonLabel || 'Sim, me manda! 🚀'
      );
      setDmMessage(
        campaignToEdit.dmMessage || 'O link {link}'
      );
      setTargetUrl(campaignToEdit.targetUrl || '');
      setLinkButtonLabel(campaignToEdit.linkButtonLabel || 'Abrir link');
      setSecondLinkOpen(Boolean(campaignToEdit.secondaryTargetUrl));
      setSecondaryTargetUrl(campaignToEdit.secondaryTargetUrl || '');
      setSecondaryButtonLabel(campaignToEdit.secondaryButtonLabel || '');
      setCardOpen(Boolean(campaignToEdit.cardImageUrl));
      setCardImageUrl(campaignToEdit.cardImageUrl || '');
      setCardTitle(campaignToEdit.cardTitle || '');
      setCardSubtitle(campaignToEdit.cardSubtitle || '');
      setRequireFollow(campaignToEdit.requireFollow ?? false);
      setFollowPromptMessage(
        campaignToEdit.followPromptMessage ||
          'Ei {username}! Para liberar o link, basta seguir o nosso perfil e tocar em "Já segui" abaixo:'
      );
      setFollowPromptButtonLabel(
        campaignToEdit.followPromptButtonLabel || 'Já segui ✅'
      );
      setFollowUpEnabled(campaignToEdit.followUpEnabled ?? false);
      setFollowUpMessage(
        campaignToEdit.followUpMessage ||
          'E aí {username}, conseguiu abrir o material? Qualquer dúvida me dá um toque aqui!'
      );
      setFollowUpDelayMinutes(campaignToEdit.followUpDelayMinutes || 15);
      setPublicReplyEnabled(campaignToEdit.publicReplyEnabled ?? true);
      setPublicReplyMessages(
        campaignToEdit.publicReplyMessages || [
          'Te mandei no direct! 🚀',
          'Acabei de enviar, confere suas mensagens! ✨',
          'Enviado com sucesso! Dá uma olhada na DM 📩',
        ]
      );
    } else {
      // Clean new campaign defaults
      setName('');
      setPostId('');
      setPostUrl('');
      setPostThumbnail('');
      setDmMessage('O link {link}');
      setTargetUrl('');
      setLinkButtonLabel('Abrir link');
      setSecondLinkOpen(false);
      setSecondaryTargetUrl('');
      setSecondaryButtonLabel('');
      setCardOpen(false);
      setCardImageUrl('');
      setCardTitle('');
      setCardSubtitle('');
      setOpeningDmEnabled(false);
      setRequireFollow(false);
      setFollowUpEnabled(false);
    }
  }, [campaignToEdit, isOpen]);

  const applyPreset = (tpl: DmPresetTemplate) => {
    setName(`${tpl.title} (${platform === 'instagram' ? 'Reels' : 'TikTok'})`);
    setKeywords(tpl.keywords);
    setMatchType(tpl.matchType);
    setOpeningDmEnabled(tpl.openingDmEnabled);
    setOpeningDmMessage(tpl.openingDmMessage);
    setOpeningDmButtonLabel(tpl.openingDmButtonLabel);
    setDmMessage(tpl.dmMessage);
    setTargetUrl(tpl.targetUrl || '');
    setLinkButtonLabel(tpl.linkButtonLabel || 'Abrir link');
    setSecondLinkOpen(Boolean(tpl.secondaryTargetUrl));
    setSecondaryTargetUrl(tpl.secondaryTargetUrl || '');
    setSecondaryButtonLabel(tpl.secondaryButtonLabel || '');
    setCardOpen(Boolean(tpl.cardImageUrl));
    setCardImageUrl(tpl.cardImageUrl || '');
    setCardTitle(tpl.cardTitle || '');
    setCardSubtitle(tpl.cardSubtitle || '');
    setRequireFollow(tpl.requireFollow);
    setFollowPromptMessage(tpl.followPromptMessage);
    setFollowPromptButtonLabel(tpl.followPromptButtonLabel);
    setFollowUpEnabled(tpl.followUpEnabled);
    setFollowUpMessage(tpl.followUpMessage);
    setFollowUpDelayMinutes(tpl.followUpDelayMinutes);
    setPublicReplyEnabled(tpl.publicReplyEnabled);
    setPublicReplyMessages(tpl.publicReplyMessages);
    setIsTemplatesOpen(false);
  };

  const applyClone = (camp: DmCampaign) => {
    setName(`${camp.name} (Cópia)`);
    setPlatform(camp.platform);
    setScope(camp.scope);
    setPostId('');
    setPostUrl('');
    setPostThumbnail('');
    setKeywords([...camp.keywords]);
    setMatchType(camp.matchType);
    setDmTriggerEnabled(camp.dmTriggerEnabled ?? true);
    setOpeningDmEnabled(camp.openingDmEnabled ?? false);
    setOpeningDmMessage(camp.openingDmMessage || '');
    setOpeningDmButtonLabel(camp.openingDmButtonLabel || '');
    setDmMessage(camp.dmMessage);
    setTargetUrl(camp.targetUrl || '');
    setLinkButtonLabel(camp.linkButtonLabel || 'Abrir link');
    setSecondLinkOpen(Boolean(camp.secondaryTargetUrl));
    setSecondaryTargetUrl(camp.secondaryTargetUrl || '');
    setSecondaryButtonLabel(camp.secondaryButtonLabel || '');
    setCardOpen(Boolean(camp.cardImageUrl));
    setCardImageUrl(camp.cardImageUrl || '');
    setCardTitle(camp.cardTitle || '');
    setCardSubtitle(camp.cardSubtitle || '');
    setRequireFollow(camp.requireFollow ?? false);
    setFollowPromptMessage(camp.followPromptMessage || '');
    setFollowPromptButtonLabel(camp.followPromptButtonLabel || '');
    setFollowUpEnabled(camp.followUpEnabled ?? false);
    setFollowUpMessage(camp.followUpMessage || '');
    setFollowUpDelayMinutes(camp.followUpDelayMinutes || 15);
    setPublicReplyEnabled(camp.publicReplyEnabled ?? true);
    setPublicReplyMessages([...(camp.publicReplyMessages || [])]);
    setIsCloneOpen(false);
  };

  // UI state
  const [previewTab, setPreviewTab] = useState<'comment' | 'dm_card' | 'follow_gate'>(
    'dm_card'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim().toUpperCase();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const handleAddPublicReply = () => {
    const trimmed = newReplyInput.trim();
    if (trimmed) {
      setPublicReplyMessages([...publicReplyMessages, trimmed]);
      setNewReplyInput('');
    }
  };

  const handleRemovePublicReply = (index: number) => {
    setPublicReplyMessages(publicReplyMessages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave({
        id: campaignToEdit?.id,
        name,
        platform,
        accountId: platform === 'instagram' ? 'ig_gabolonhez' : 'tt_gabolonhez',
        accountUsername: 'gabolonhez',
        scope,
        postId: scope === 'specific' ? postId : null,
        postUrl: scope === 'specific' ? postUrl : null,
        postThumbnail: scope === 'specific' ? postThumbnail : null,
        keywords,
        matchType,
        dmTriggerEnabled,
        dmMessage,
        dmMessages: [dmMessage],
        openingDmEnabled,
        openingDmMessage,
        openingDmButtonLabel,
        cardImageUrl: cardOpen && cardImageUrl.trim() ? cardImageUrl.trim() : null,
        cardTitle: cardOpen && cardTitle.trim() ? cardTitle.trim() : null,
        cardSubtitle: cardOpen && cardSubtitle.trim() ? cardSubtitle.trim() : null,
        linkButtonLabel: targetUrl.trim() ? (linkButtonLabel.trim() || 'Abrir link') : null,
        targetUrl: targetUrl.trim() || null,
        secondaryButtonLabel: secondLinkOpen && secondaryTargetUrl.trim() ? (secondaryButtonLabel.trim() || 'Abrir link') : null,
        secondaryTargetUrl: secondLinkOpen && secondaryTargetUrl.trim() ? secondaryTargetUrl.trim() : null,
        requireFollow,
        followPromptMessage,
        followPromptButtonLabel,
        followUpEnabled,
        followUpMessage,
        followUpDelayMinutes,
        publicReplyEnabled,
        publicReplyMessages,
        isActive: campaignToEdit?.isActive ?? true,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0c0c10] border border-white/[0.1] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#09090d]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-500 flex items-center justify-center shadow-md shadow-violet-600/30">
              <Send size={18} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white tracking-tight">
                  {isEditing ? 'Editar Campanha Auto-DM' : 'Criar Nova Campanha Auto-DM'}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {platform}
                </span>
              </div>
              <p className="text-xs text-white/50">
                Responda automaticamente comentários com DMs e entregue links em segundos.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTemplatesOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600/20 to-indigo-600/20 hover:from-violet-600/30 hover:to-indigo-600/30 border border-violet-500/30 text-violet-300 text-xs font-medium transition-all shadow-sm"
              title="Explorar e aplicar modelos validados de campanha"
            >
              <Sparkles size={13} className="text-violet-400" />
              <span>Modelos Prontos</span>
            </button>

            {existingCampaigns.length > 0 && (
              <button
                type="button"
                onClick={() => setIsCloneOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-white/70 hover:text-white text-xs font-medium transition-all"
                title="Clonar copywriting e configurações de uma campanha anterior"
              >
                <Copy size={13} />
                <span>Clonar Campanha</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Two-Pane Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left: Configuration Form */}
          <div className="lg:col-span-7 p-6 overflow-y-auto space-y-6 border-b lg:border-b-0 lg:border-r border-white/[0.08] custom-scrollbar">
            {/* Step 1: Basic Info & Platform */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wider">
                  01 // Canal & Identificação
                </span>
                <div className="flex items-center gap-1.5 p-1 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => {
                      setPlatform('instagram');
                      if (
                        publicReplyMessages.length === 3 &&
                        publicReplyMessages[0]?.startsWith('Me manda ')
                      ) {
                        setPublicReplyMessages([
                          'Te mandei no direct! 🚀',
                          'Acabei de enviar, confere suas mensagens! ✨',
                          'Enviado com sucesso! Dá uma olhada na DM 📩',
                        ]);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      platform === 'instagram'
                        ? 'bg-pink-600/25 text-pink-300 border border-pink-500/40 shadow-sm'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <InstagramLogo className="size-3.5" />
                    Instagram
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPlatform('tiktok');
                      if (
                        publicReplyMessages.length === 3 &&
                        publicReplyMessages[0] === 'Te mandei no direct! 🚀'
                      ) {
                        const kw = (keywords[0] || 'REA').replace(/^#/, '');
                        setPublicReplyMessages([
                          `Me manda "${kw}" no direct que o link chega na hora! 🚀`,
                          `Clica no meu perfil e me manda "${kw}" na DM pra receber! ✨`,
                          `Manda "${kw}" no chat aqui do perfil que te envio o link 📥`,
                        ]);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      platform === 'tiktok'
                        ? 'bg-cyan-600/25 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <TikTokLogo className="size-3.5" />
                    TikTok
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Nome da Campanha
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Guia de IA 2026 - Reels #42"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.1] text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Step 2: Post Trigger Scope */}
            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
              <span className="text-xs font-mono text-white/40 uppercase tracking-wider">
                02 // Onde Disparar
              </span>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'any' as DmScope,
                    title: 'Qualquer Post',
                    desc: 'Funciona em todos os posts e reels',
                  },
                  {
                    id: 'specific' as DmScope,
                    title: 'Post Específico',
                    desc: 'Vincular a um reels específico',
                  },
                  {
                    id: 'next' as DmScope,
                    title: 'Próximo Post',
                    desc: 'Ativa no próximo post que você publicar',
                  },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScope(s.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      scope === s.id
                        ? 'bg-indigo-600/15 border-indigo-500/50 text-white shadow-sm'
                        : 'bg-white/[0.02] border-white/[0.06] text-white/60 hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold">{s.title}</span>
                      {scope === s.id && <Check size={13} className="text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-white/40 leading-tight">{s.desc}</p>
                  </button>
                ))}
              </div>

              {scope === 'specific' && (
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white/90">
                      {platform === 'instagram' ? 'Selecione o Post ou Reels' : 'Vincular Vídeo do TikTok'}
                    </label>
                    {platform === 'instagram' && (
                      <button
                        type="button"
                        onClick={() => setManualPostInput(!manualPostInput)}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        {manualPostInput ? 'Escolher da grade' : 'Colar link manualmente'}
                      </button>
                    )}
                  </div>

                  {platform === 'instagram' && !manualPostInput ? (
                    <PostPicker
                      selectedPostId={postId}
                      onSelect={(p) => {
                        setPostId(p.id);
                        if (p.permalink) setPostUrl(p.permalink);
                        if (p.thumbnail_url) setPostThumbnail(p.thumbnail_url);
                        if (!name && p.caption) {
                          setName(p.caption.slice(0, 35) + '...');
                        }
                      }}
                    />
                  ) : (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={postUrl}
                        onChange={(e) => {
                          setPostUrl(e.target.value);
                          setPostId(e.target.value);
                        }}
                        placeholder={
                          platform === 'instagram'
                            ? 'https://instagram.com/p/... ou ID da mídia'
                            : 'https://tiktok.com/@usuario/video/... ou ID'
                        }
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500"
                      />
                      <p className="text-[11px] text-white/40">
                        {platform === 'instagram'
                          ? 'Cole o link direto da publicação ou Reels.'
                          : 'Cole o link do vídeo do TikTok.'}
                      </p>
                    </div>
                  )}

                  {/* Card do Post Selecionado */}
                  {postId && (
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                      {postThumbnail ? (
                        <img
                          src={postThumbnail}
                          alt="Post selecionado"
                          className="size-11 rounded-md object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="size-11 rounded-md bg-white/10 flex items-center justify-center shrink-0">
                          <ImageIcon size={18} className="text-white/40" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono text-indigo-400 block uppercase">
                          Post Selecionado
                        </span>
                        <p className="text-xs text-white font-medium truncate">
                          {postUrl || postId}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPostId('');
                          setPostUrl('');
                          setPostThumbnail('');
                        }}
                        className="p-1 rounded text-white/40 hover:text-white transition-colors"
                        title="Desvincular post"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 3: Keywords Trigger */}
            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wider">
                  03 // Palavras-Chave de Ativação
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-white/50">Tipo:</span>
                  <select
                    value={matchType}
                    onChange={(e) => setMatchType(e.target.value as DmMatchMode)}
                    className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.1] text-xs text-white/80 focus:outline-none"
                  >
                    <option value="exact">Palavra Exata</option>
                    <option value="contains">Contém no Comentário</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  placeholder="Ex: QUERO, GUIA, TEMPLATE..."
                  className="flex-1 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                >
                  Adicionar
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.1] text-xs font-mono text-indigo-300"
                  >
                    #{kw}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw)}
                      className="text-white/40 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Step 4: Follow-Gate Option */}
            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-white/40 uppercase tracking-wider block">
                    04 // Follow-Gate (Exigir Seguir)
                  </span>
                  <p className="text-xs text-white/60">
                    O seguidor só recebe o link final se seguir o seu perfil.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRequireFollow(!requireFollow)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    requireFollow ? 'bg-emerald-600' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 size-4 rounded-full bg-white transition-transform ${
                      requireFollow ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {requireFollow && (
                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-emerald-300 mb-1">
                      Mensagem de Solicitação do Follow
                    </label>
                    <textarea
                      rows={2}
                      value={followPromptMessage}
                      onChange={(e) => setFollowPromptMessage(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-emerald-500/30 text-xs text-white placeholder-white/30 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-emerald-300 mb-1">
                      Texto do Botão de Confirmação
                    </label>
                    <input
                      type="text"
                      value={followPromptButtonLabel}
                      onChange={(e) => setFollowPromptButtonLabel(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-emerald-500/30 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 5: Deliverable DM & Links */}
            <div className="space-y-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wider block">
                  05 // Mensagem da DM & Links
                </span>
                <span className="text-[11px] text-white/40 font-mono">
                  {'{link}'} insere o link; {'{username}'} personaliza
                </span>
              </div>

              {/* Text of DM */}
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Texto da DM
                </label>
                <textarea
                  rows={3}
                  value={dmMessage}
                  onChange={(e) => setDmMessage(e.target.value)}
                  placeholder="O link {link}"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Primary Link & Optional Expansions */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-white/80">
                    Link de Destino (Opcional)
                  </label>
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://seusite.com/pagina"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {targetUrl.trim() && (
                  <div>
                    <label className="block text-[11px] text-white/60 mb-1">
                      Texto do Botão
                    </label>
                    <input
                      type="text"
                      value={linkButtonLabel}
                      onChange={(e) => setLinkButtonLabel(e.target.value)}
                      placeholder="Abrir link"
                      maxLength={20}
                      className="w-full px-3 py-1.5 rounded bg-black/40 border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                {/* Optional Second Link */}
                {secondLinkOpen ? (
                  <div className="pt-3 border-t border-white/[0.06] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-indigo-300">
                        Segundo Link (Opcional)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSecondLinkOpen(false);
                          setSecondaryTargetUrl('');
                          setSecondaryButtonLabel('');
                        }}
                        className="text-[10px] text-white/40 hover:text-rose-400 transition-colors"
                      >
                        ✕ Remover
                      </button>
                    </div>
                    <input
                      type="text"
                      value={secondaryTargetUrl}
                      onChange={(e) => setSecondaryTargetUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 rounded bg-black/40 border border-white/[0.1] text-xs text-white placeholder-white/30 font-mono focus:outline-none"
                    />
                    <input
                      type="text"
                      value={secondaryButtonLabel}
                      onChange={(e) => setSecondaryButtonLabel(e.target.value)}
                      placeholder="Texto do segundo botão"
                      maxLength={20}
                      className="w-full px-3 py-1.5 rounded bg-black/40 border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSecondLinkOpen(true)}
                    className="w-full py-2 rounded-lg border border-dashed border-white/[0.1] hover:border-white/[0.2] text-xs text-white/50 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus size={13} />
                    <span>Adicionar um segundo link</span>
                  </button>
                )}

                {/* Optional Card with Image */}
                {cardOpen ? (
                  <div className="pt-3 border-t border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                        <ImageIcon size={13} className="text-indigo-400" />
                        <span>Card com Imagem (Meta Generic Template)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCardOpen(false);
                          setCardImageUrl('');
                          setCardTitle('');
                          setCardSubtitle('');
                        }}
                        className="text-[10px] text-white/40 hover:text-rose-400 transition-colors"
                      >
                        ✕ Remover imagem do card
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] text-white/60 mb-1">
                        URL da Imagem de Capa do Card
                      </label>
                      <input
                        type="text"
                        value={cardImageUrl}
                        onChange={(e) => setCardImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-1.5 rounded bg-black/40 border border-white/[0.1] text-xs text-white font-mono placeholder-white/30 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-white/60 mb-1">
                          Título do Card (Opcional)
                        </label>
                        <input
                          type="text"
                          value={cardTitle}
                          onChange={(e) => setCardTitle(e.target.value)}
                          placeholder="Ex: Acesso Exclusivo"
                          className="w-full px-3 py-1.5 rounded bg-black/40 border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/60 mb-1">
                          Subtítulo do Card (Opcional)
                        </label>
                        <input
                          type="text"
                          value={cardSubtitle}
                          onChange={(e) => setCardSubtitle(e.target.value)}
                          placeholder="Ex: Toque abaixo para abrir"
                          className="w-full px-3 py-1.5 rounded bg-black/40 border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCardOpen(true)}
                    className="w-full py-2 rounded-lg border border-dashed border-white/[0.1] hover:border-white/[0.2] text-xs text-white/50 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ImageIcon size={13} />
                    <span>Deixar a DM com uma imagem (card)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Step 6: Public Comment Replies (Anti-Spam) */}
            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-white/40 uppercase tracking-wider block">
                    06 // Respostas Públicas em Comentários (Anti-Spam)
                  </span>
                  <p className="text-xs text-white/60">
                    O sistema sorteia uma variação diferente por comentário para não cair em spam.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPublicReplyEnabled(!publicReplyEnabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    publicReplyEnabled ? 'bg-indigo-600' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 size-4 rounded-full bg-white transition-transform ${
                      publicReplyEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {publicReplyEnabled && (
                <div className="space-y-2">
                  {platform === 'tiktok' && (
                    <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 space-y-2 mb-1">
                      <div className="flex items-start gap-2.5">
                        <Sparkles size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                        <div className="text-[11px] text-cyan-200/90 leading-relaxed">
                          <span className="font-semibold text-cyan-300">Regra do TikTok:</span> A API do TikTok não permite enviar DM direta para quem apenas comentou no vídeo. O seguidor precisa abrir seu perfil e te mandar uma mensagem no chat para receber o link.
                          <span className="block text-white/50 text-[10px] mt-0.5">
                            Use as respostas públicas abaixo para orientá-lo a mandar a palavra-chave no seu Direct!
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            const kw = (keywords[0] || 'REA').replace(/^#/, '');
                            setPublicReplyMessages([
                              `Me manda "${kw}" no direct que o link chega na hora! 🚀`,
                              `Clica no meu perfil e me manda "${kw}" na DM pra receber! ✨`,
                              `Manda "${kw}" no chat aqui do perfil que te envio o link 📥`,
                            ]);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-medium transition-colors flex items-center gap-1.5"
                        >
                          <Sparkles size={11} />
                          <span>Preencher Respostas Recomendadas para TikTok</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newReplyInput}
                      onChange={(e) => setNewReplyInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddPublicReply();
                        }
                      }}
                      placeholder="Nova variação de resposta..."
                      className="flex-1 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddPublicReply}
                      className="px-3 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-medium"
                    >
                      Adicionar
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {publicReplyMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs text-white/80"
                      >
                        <span className="truncate pr-2">💬 &quot;{msg}&quot;</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePublicReply(idx)}
                          className="text-white/30 hover:text-rose-400 shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Interactive Live Phone Preview */}
          <div className="lg:col-span-5 bg-[#08080b] p-6 flex flex-col items-center justify-center border-t lg:border-t-0 select-none overflow-hidden">
            <div className="w-full max-w-[340px] flex flex-col items-center">
              {/* Preview Mode Switcher */}
              <div className="w-full flex items-center justify-between mb-3 px-1">
                <span className="text-[11px] font-mono text-white/50 flex items-center gap-1.5">
                  <Smartphone size={13} className="text-indigo-400" />
                  Live Preview:
                </span>
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('comment')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                      previewTab === 'comment'
                        ? 'bg-white/20 text-white'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    Comentário
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('dm_card')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                      previewTab === 'dm_card'
                        ? 'bg-white/20 text-white'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    Direct / Card
                  </button>
                </div>
              </div>

              {/* iPhone Mockup Frame */}
              <div className="w-[300px] h-[540px] rounded-[36px] bg-black border-[5px] border-[#22222a] shadow-2xl flex flex-col overflow-hidden relative">
                {/* Notch */}
                <div className="absolute top-0 inset-x-0 h-5 flex justify-center z-20">
                  <div className="w-24 h-4 bg-[#22222a] rounded-b-xl" />
                </div>

                {/* Status Bar */}
                <div className="h-8 pt-1 px-5 flex items-center justify-between text-[10px] text-white/70 shrink-0 z-10">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-white/70" />
                    <span className="text-[9px]">5G</span>
                  </div>
                </div>

                {/* App Bar */}
                <div className="px-4 py-2 border-b border-white/[0.08] flex items-center gap-2.5 bg-zinc-950/90 shrink-0">
                  <div className="size-6 rounded-full bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white">
                    G
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-semibold text-white truncate">
                      gabolonhez
                    </span>
                    <span className="text-[9px] text-white/40 font-mono">
                      {platform === 'instagram' ? 'Instagram Direct' : 'TikTok Chat'}
                    </span>
                  </div>
                </div>

                {/* Chat / Comment Viewport */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#0a0a0d] custom-scrollbar">
                  {previewTab === 'comment' ? (
                    /* Comment Preview */
                    <div className="space-y-2 pt-1">
                      {postThumbnail && (
                        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] mb-2">
                          <img
                            src={postThumbnail}
                            alt="Post Capa"
                            className="size-8 rounded-md object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-mono text-indigo-400 block uppercase">
                              Post Selecionado
                            </span>
                            <span className="text-[10px] text-white/70 truncate block">
                              {postUrl || 'Reels vinculado'}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="font-bold text-white">seguidor_tech</span>
                          <span className="text-white/40 text-[9px]">2m atrás</span>
                        </div>
                        <p className="text-[11px] text-white/90">
                          {keywords[0] ? keywords[0] : 'GUIA'}
                        </p>
                      </div>

                      {/* Bot Public Reply */}
                      <div className="ml-4 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="font-bold text-indigo-300">gabolonhez</span>
                          <span className="px-1 py-0.2 rounded text-[8px] bg-indigo-500/20 text-indigo-300">
                            Autor
                          </span>
                        </div>
                        <p className="text-[11px] text-white/90">
                          {publicReplyMessages[0] || 'Te mandei no direct! 🚀'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Direct Message + Card Preview */
                    <div className="space-y-3 pt-1">
                      {/* Incoming comment acknowledgment / DM message bubble */}
                      <div className="max-w-[85%] p-2.5 rounded-2xl rounded-bl-sm bg-white/[0.07] text-[11px] text-white/90 leading-snug">
                        {dmMessage
                          .replace('{username}', 'Lucas')
                          .replace('{link}', targetUrl || 'https://link.com')}
                      </div>

                      {/* Rich Generic Card Template - ONLY IF cardOpen */}
                      {cardOpen && (cardImageUrl.trim() || cardTitle.trim()) ? (
                        <div className="rounded-2xl bg-zinc-900 border border-white/[0.1] overflow-hidden shadow-lg animate-in fade-in">
                          {cardImageUrl.trim() && (
                            <div
                              className="h-28 w-full bg-cover bg-center bg-zinc-800"
                              style={{ backgroundImage: `url(${cardImageUrl.trim()})` }}
                            />
                          )}
                          <div className="p-3 space-y-1">
                            <h4 className="text-xs font-bold text-white line-clamp-1">
                              {cardTitle || 'Acesso'}
                            </h4>
                            {cardSubtitle.trim() && (
                              <p className="text-[10px] text-white/60 line-clamp-2 leading-tight">
                                {cardSubtitle}
                              </p>
                            )}
                          </div>

                          {/* Card Buttons */}
                          {targetUrl.trim() && (
                            <div className="border-t border-white/[0.08] divide-y divide-white/[0.08]">
                              <button
                                type="button"
                                className="w-full py-2 px-3 text-[11px] font-semibold text-indigo-400 hover:bg-white/[0.04] transition-colors flex items-center justify-center gap-1"
                              >
                                <span>{linkButtonLabel || 'Abrir link'}</span>
                                <ExternalLink size={10} />
                              </button>
                              {secondLinkOpen && secondaryTargetUrl.trim() && (
                                <button
                                  type="button"
                                  className="w-full py-2 px-3 text-[11px] font-semibold text-white/70 hover:bg-white/[0.04] transition-colors flex items-center justify-center gap-1"
                                >
                                  <span>{secondaryButtonLabel || 'Abrir link'}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ) : targetUrl.trim() ? (
                        /* Simple link button preview when card is not used */
                        <div className="max-w-[85%] rounded-xl overflow-hidden border border-white/[0.1] bg-white/[0.04]">
                          <button
                            type="button"
                            className="w-full py-2 px-3 text-[11px] font-semibold text-indigo-400 hover:bg-white/[0.04] transition-colors flex items-center justify-center gap-1"
                          >
                            <span>{linkButtonLabel || 'Abrir link'}</span>
                            <ExternalLink size={10} />
                          </button>
                          {secondLinkOpen && secondaryTargetUrl.trim() && (
                            <button
                              type="button"
                              className="w-full py-2 px-3 text-[11px] font-semibold text-white/70 border-t border-white/[0.08] hover:bg-white/[0.04] transition-colors flex items-center justify-center gap-1"
                            >
                              <span>{secondaryButtonLabel || 'Abrir link'}</span>
                            </button>
                          )}
                        </div>
                      ) : null}

                      {/* Follow-gate prompt simulated badge if enabled */}
                      {requireFollow && (
                        <div className="flex items-center justify-center gap-1 py-1 px-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-400">
                          <ShieldCheck size={10} />
                          Follow-Gate Ativo
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Fake Reply Bar */}
                <div className="p-2 border-t border-white/[0.08] bg-zinc-950 flex items-center gap-2 shrink-0">
                  <div className="flex-1 py-1.5 px-3 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] text-white/30">
                    Mensagem...
                  </div>
                  <div className="size-6 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                    <Send size={10} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-[#09090d]/90 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            Cancelar
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !name.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-xs font-semibold text-white shadow-md shadow-violet-600/30 transition-all"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check size={14} />
                  {isEditing ? 'Atualizar Campanha' : 'Ativar Campanha'}
                </>
              )}
            </button>
          </div>
        </div>
        {/* Modelos Prontos Overlay Modal */}
        {isTemplatesOpen && (
          <div className="absolute inset-0 z-50 bg-[#09090d]/95 backdrop-blur-md p-6 flex flex-col overflow-hidden animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Modelos Prontos de Automação
                  </h3>
                  <p className="text-xs text-white/50">
                    Selecione um playbook validado para preencher mensagens, cartões e gatilhos instantaneamente.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplatesOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="py-3 flex items-center gap-1.5 overflow-x-auto shrink-0 custom-scrollbar">
              {[
                { id: 'all', label: 'Todos os Modelos' },
                { id: 'Geração de Leads', label: 'Leads & E-books' },
                { id: 'E-commerce & Vendas', label: 'Produtos & Vendas' },
                { id: 'Lançamentos & Eventos', label: 'Lançamentos' },
                { id: 'Campanhas Promocionais', label: 'Cupons' },
                { id: 'Serviços & Consultoria', label: 'WhatsApp & Serviços' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setTemplateFilterCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    templateFilterCategory === cat.id
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/30'
                      : 'bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Templates Grid */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-3.5 custom-scrollbar pb-2">
              {CAMPAIGN_PRESET_TEMPLATES.filter(
                (tpl) => templateFilterCategory === 'all' || tpl.category === templateFilterCategory
              ).map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-violet-500/40 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase bg-white/[0.05] text-white/70 border border-white/[0.08]">
                        {tpl.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {tpl.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                        {tpl.title}
                      </h4>
                      <p className="text-xs text-white/60 mt-1 leading-relaxed">
                        {tpl.summary}
                      </p>
                    </div>

                    {/* Keywords preview */}
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {tpl.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 rounded bg-white/[0.04] text-[10px] font-mono text-indigo-300 border border-white/[0.06]"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono">
                      {tpl.requireFollow && <span>• Follow-Gate</span>}
                      {tpl.openingDmEnabled && <span>• DM Boas-Vindas</span>}
                      {tpl.followUpEnabled && <span>• Follow-Up</span>}
                    </div>

                    <button
                      type="button"
                      onClick={() => applyPreset(tpl)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white shadow-sm transition-all"
                    >
                      <span>Usar Modelo</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clonar Campanha Existente Overlay Modal */}
        {isCloneOpen && (
          <div className="absolute inset-0 z-50 bg-[#09090d]/95 backdrop-blur-md p-6 flex flex-col overflow-hidden animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Copy size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Clonar de Campanha Anterior
                  </h3>
                  <p className="text-xs text-white/50">
                    Selecione uma campanha existente para copiar todas as mensagens e botões. O post específico será limpo para você selecionar o novo Reels.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCloneOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Campaign List */}
            <div className="flex-1 overflow-y-auto pr-1 divide-y divide-white/[0.06] custom-scrollbar py-2">
              {existingCampaigns.length === 0 ? (
                <div className="text-center py-12 text-white/40 text-xs">
                  Você ainda não possui campanhas anteriores para clonar.
                </div>
              ) : (
                existingCampaigns.map((camp) => (
                  <div
                    key={camp.id}
                    className="py-3 px-2 flex items-center justify-between hover:bg-white/[0.02] rounded-lg transition-colors group"
                  >
                    <div className="space-y-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                          {camp.name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-white/[0.05] text-white/60">
                          {camp.platform}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {camp.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="text-[10px] font-mono text-indigo-300/80"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => applyClone(camp)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 hover:border-transparent text-indigo-300 hover:text-white text-xs font-medium transition-all shrink-0"
                    >
                      <Copy size={12} />
                      <span>Clonar Campos</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
