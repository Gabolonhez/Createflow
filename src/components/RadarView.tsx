'use client';

import React, { useMemo, useState } from 'react';
import {
  Radar,
  Bookmark,
  Sparkles,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  Lightbulb,
  Zap,
  BookOpen,
  Search,
  Copy,
  Check,
  ImagePlus,
  Puzzle,
  Flame,
  Eye,
  Heart,
  MessageCircle,
  Loader2,
  Key,
  CheckCircle2,
} from 'lucide-react';
import { XLogo, LinkedInLogo, InstagramLogo, TikTokLogo } from './BrandIcons';
import type {
  CapturedMediaType,
  CapturedPost,
  CapturedPostStatus,
  MonitoredProfile,
  Platform,
} from '@/types';

interface RadarViewProps {
  profiles: MonitoredProfile[];
  capturedPosts: CapturedPost[];
  radarIngestToken?: string;
  apifyApiToken?: string;
  dmSaveCaptureEnabled?: boolean;
  onSaveProfile: (profile: {
    platform: Platform;
    handle: string;
    profileUrl?: string;
    nicheTag?: string;
  }) => Promise<void>;
  onDeleteProfile: (id: string) => Promise<void>;
  onSyncProfiles: (profileId?: string) => Promise<void>;
  onSaveManualCapture: (data: {
    platform: Platform;
    postUrl?: string;
    authorHandle?: string;
    captionText?: string;
    mediaType?: CapturedMediaType;
    screenshotDataUrl?: string;
  }) => Promise<void>;
  onUpdatePostStatus: (id: string, status: CapturedPostStatus) => Promise<void>;
  onDeleteCapturedPost: (id: string) => Promise<void>;
  onCreateInMyVoice: (post: CapturedPost) => void;
  onDeconstructHook: (post: CapturedPost) => Promise<void>;
  onSendToIdea: (post: CapturedPost) => Promise<void>;
  onAtomizePost: (post: CapturedPost) => void;
  onRegenerateToken: () => Promise<void>;
  onNavigateToConnections: () => void;
}

type RadarSubTab = 'radar' | 'saved' | 'setup';
type SortMode = 'outlier' | 'recent' | 'likes';

function renderPlatformIcon(platform: Platform, sizeClass = 'size-3.5') {
  switch (platform) {
    case 'instagram':
      return <InstagramLogo className={sizeClass} />;
    case 'linkedin':
      return <LinkedInLogo className={`${sizeClass} text-[#0A66C2]`} />;
    case 'x':
      return <XLogo className={`${sizeClass} text-[#ececec]`} />;
    case 'tiktok':
      return <TikTokLogo className={sizeClass} />;
  }
}

function getPlatformLabel(platform: Platform): string {
  switch (platform) {
    case 'instagram':
      return 'Instagram';
    case 'linkedin':
      return 'LinkedIn';
    case 'x':
      return 'X';
    case 'tiktok':
      return 'TikTok';
  }
}

function normalizeHandleInput(raw: string, platform: Platform): {
  handle: string;
  profileUrl?: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) return { handle: '' };

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const u = new URL(trimmed);
      const parts = u.pathname.split('/').filter(Boolean);
      let handle = parts[parts.length - 1] || '';
      if (platform === 'linkedin' && (parts[0] === 'in' || parts[0] === 'company')) {
        handle = parts[1] || handle;
      }
      if (platform === 'instagram' && parts[0]) {
        handle = parts[0];
      }
      if (platform === 'x' && parts[0]) {
        handle = parts[0];
      }
      if (platform === 'tiktok' && parts[0]) {
        handle = parts[0];
      }
      return {
        handle: handle.replace(/^@/, ''),
        profileUrl: trimmed,
      };
    } catch {
      return { handle: trimmed.replace(/^@/, '') };
    }
  }

  return { handle: trimmed.replace(/^@/, '') };
}

export function RadarView({
  profiles,
  capturedPosts,
  radarIngestToken = '',
  apifyApiToken = '',
  dmSaveCaptureEnabled = true,
  onSaveProfile,
  onDeleteProfile,
  onSyncProfiles,
  onSaveManualCapture,
  onUpdatePostStatus,
  onDeleteCapturedPost,
  onCreateInMyVoice,
  onDeconstructHook,
  onSendToIdea,
  onAtomizePost,
  onRegenerateToken,
  onNavigateToConnections,
}: RadarViewProps) {
  const [activeTab, setActiveTab] = useState<RadarSubTab>('radar');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [mediaFilter, setMediaFilter] = useState<CapturedMediaType | 'all'>('all');
  const [sortMode, setSortMode] = useState<SortMode>('outlier');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Monitored Profile Form
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [newProfilePlatform, setNewProfilePlatform] = useState<Platform>('instagram');
  const [newProfileInput, setNewProfileInput] = useState('');
  const [newProfileNiche, setNewProfileNiche] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [syncingTarget, setSyncingTarget] = useState<string | null>(null);

  // Quick Manual / Print Capture Form (Meus Salvos)
  const [savePlatform, setSavePlatform] = useState<Platform>('instagram');
  const [saveUrl, setSaveUrl] = useState('');
  const [saveAuthor, setSaveAuthor] = useState('');
  const [saveText, setSaveText] = useState('');
  const [saveScreenshot, setSaveScreenshot] = useState<string | null>(null);
  const [isSavingCapture, setIsSavingCapture] = useState(false);

  // Row-level loading & copy feedback
  const [busyPostId, setBusyPostId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRegeneratingToken, setIsRegeneratingToken] = useState(false);

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://createfloww.vercel.app';
  const ingestEndpoint = `${origin}/api/radar/ingest`;

  const copyText = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const radarCount = useMemo(
    () => capturedPosts.filter((p) => p.source === 'radar' && p.status !== 'archived').length,
    [capturedPosts]
  );

  const savedCount = useMemo(
    () =>
      capturedPosts.filter(
        (p) => (p.source === 'saved' || p.source === 'dm_share') && p.status !== 'archived'
      ).length,
    [capturedPosts]
  );

  const visiblePosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = capturedPosts.filter((post) => {
      if (post.status === 'archived') return false;
      if (activeTab === 'radar' && post.source !== 'radar') return false;
      if (activeTab === 'saved' && post.source !== 'saved' && post.source !== 'dm_share') {
        return false;
      }
      if (platformFilter !== 'all' && post.platform !== platformFilter) return false;
      if (mediaFilter !== 'all' && post.mediaType !== mediaFilter) return false;
      if (query) {
        const hay = `${post.captionText} ${post.authorHandle || ''} ${post.authorName || ''} ${post.aiHookSummary || ''}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortMode === 'outlier') {
        if (b.outlierScore !== a.outlierScore) return b.outlierScore - a.outlierScore;
        return b.engagementScore - a.engagementScore;
      }
      if (sortMode === 'likes') {
        return b.likesCount - a.likesCount;
      }
      return String(b.capturedAt).localeCompare(String(a.capturedAt));
    });
  }, [capturedPosts, activeTab, platformFilter, mediaFilter, searchQuery, sortMode]);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const { handle, profileUrl } = normalizeHandleInput(newProfileInput, newProfilePlatform);
    if (!handle) return;

    setIsSavingProfile(true);
    try {
      await onSaveProfile({
        platform: newProfilePlatform,
        handle,
        profileUrl,
        nicheTag: newProfileNiche.trim() || undefined,
      });
      setNewProfileInput('');
      setNewProfileNiche('');
      setShowAddProfile(false);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSync = async (profileId?: string) => {
    setSyncingTarget(profileId || 'all');
    try {
      await onSyncProfiles(profileId);
    } finally {
      setSyncingTarget(null);
    }
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSaveScreenshot(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveText.trim() && !saveUrl.trim() && !saveScreenshot) return;

    setIsSavingCapture(true);
    try {
      await onSaveManualCapture({
        platform: savePlatform,
        postUrl: saveUrl.trim() || undefined,
        authorHandle: saveAuthor.replace(/^@/, '').trim() || undefined,
        captionText: saveText.trim() || undefined,
        screenshotDataUrl: saveScreenshot || undefined,
      });
      setSaveUrl('');
      setSaveAuthor('');
      setSaveText('');
      setSaveScreenshot(null);
    } finally {
      setIsSavingCapture(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Hero Strip + Sub-Navigation Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[22px] bg-[#141414] border border-[#242424]">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-[#212121] border border-[#2c2c2c] flex items-center justify-center text-[#ececec] shrink-0">
            <Radar size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-[#ececec]">
              Radar Viral de Perfis &amp; Meus Salvos
            </span>
            <span className="text-xs text-[#7a7a7a]">
              Monitore criadores, destaque outliers acima da média e centralize posts salvos do Instagram &amp; LinkedIn.
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#0e0e0e] border border-[#242424] self-start md:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'radar'
                ? 'bg-[#212121] text-[#ececec]'
                : 'text-[#8a8a8a] hover:text-[#ececec]'
            }`}
          >
            <Flame size={13} className={activeTab === 'radar' ? 'text-[#7ae6a0]' : ''} />
            <span>Radar Viral ({radarCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'saved'
                ? 'bg-[#212121] text-[#ececec]'
                : 'text-[#8a8a8a] hover:text-[#ececec]'
            }`}
          >
            <Bookmark size={13} />
            <span>Meus Salvos ({savedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('setup')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'setup'
                ? 'bg-[#212121] text-[#ececec]'
                : 'text-[#8a8a8a] hover:text-[#ececec]'
            }`}
          >
            <Puzzle size={13} />
            <span>Extensão &amp; Setup</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MONITORED PROFILES SECTION */}
      {activeTab === 'radar' && (
        <div className="flex flex-col gap-4 p-5 rounded-[22px] bg-[#141414] border border-[#242424]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col">
              <h3 className="text-xs font-semibold text-[#ececec] uppercase font-mono tracking-wider">
                Perfis Monitorados ({profiles.length})
              </h3>
              <p className="text-xs text-[#7a7a7a] mt-0.5">
                Cadastre perfis para abrir no navegador (Extensão Chrome gratuita) ou sincronizar via Apify.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowAddProfile((prev) => !prev)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] transition-all active:scale-[0.97] cursor-pointer"
              >
                <Plus size={13} />
                <span>Monitorar Perfil</span>
              </button>

              <button
                type="button"
                disabled={syncingTarget !== null || profiles.length === 0}
                onClick={() => handleSync()}
                title={
                  apifyApiToken
                    ? 'Sincronizar todos os perfis via Apify'
                    : 'Configure seu token Apify em Conexões ou use a Extensão Chrome'
                }
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2e2e2e] transition-all disabled:opacity-45 active:scale-[0.97] cursor-pointer"
              >
                <RefreshCw size={13} className={syncingTarget === 'all' ? 'animate-spin' : ''} />
                <span>
                  {syncingTarget === 'all' ? 'Sincronizando…' : 'Sincronizar Todos (Apify)'}
                </span>
              </button>
            </div>
          </div>

          {/* Inline Add Profile Form */}
          {showAddProfile && (
            <form
              onSubmit={handleCreateProfile}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-[18px] bg-[#161616] border border-[#2a2a2a]"
            >
              <div className="md:col-span-3 flex items-center gap-1 p-1 rounded-full bg-[#0e0e0e] border border-[#262626]">
                {(['instagram', 'linkedin', 'x', 'tiktok'] as Platform[]).map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setNewProfilePlatform(plat)}
                    className={`flex-1 flex items-center justify-center py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      newProfilePlatform === plat
                        ? 'bg-[#f2f2f2] text-[#0a0a0a]'
                        : 'text-[#8a8a8a] hover:text-[#ececec]'
                    }`}
                    title={getPlatformLabel(plat)}
                  >
                    {renderPlatformIcon(plat, 'size-3.5')}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={newProfileInput}
                onChange={(e) => setNewProfileInput(e.target.value)}
                placeholder="@handle ou URL completa do perfil..."
                required
                className="md:col-span-5 px-3.5 py-2 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4a4a4a]"
              />

              <input
                type="text"
                value={newProfileNiche}
                onChange={(e) => setNewProfileNiche(e.target.value)}
                placeholder="Tag de nicho (ex: SaaS, AI)..."
                className="md:col-span-2 px-3.5 py-2 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4a4a4a]"
              />

              <button
                type="submit"
                disabled={isSavingProfile || !newProfileInput.trim()}
                className="md:col-span-2 flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] disabled:opacity-45 transition-all cursor-pointer"
              >
                {isSavingProfile ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                <span>Adicionar</span>
              </button>
            </form>
          )}

          {/* Profiles Cards Strip */}
          {profiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex flex-col justify-between p-4 rounded-[20px] bg-[#161616] border border-[#222222] hover:border-[#323232] transition-all gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8 rounded-full bg-[#212121] border border-[#2c2c2c] flex items-center justify-center shrink-0">
                        {renderPlatformIcon(profile.platform, 'size-3.5')}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-[#ececec] truncate">
                          @{profile.handle}
                        </span>
                        <span className="text-[10px] font-mono text-[#7a7a7a] truncate">
                          {profile.nicheTag || getPlatformLabel(profile.platform)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteProfile(profile.id)}
                      className="p-1.5 rounded-full text-[#7a7a7a] hover:text-[#ff5f56] hover:bg-[#ff5f56]/10 transition-colors cursor-pointer"
                      title="Remover perfil"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-[12px] bg-[#1c1c1c] border border-[#242424]">
                      <span className="block text-[9px] font-mono text-[#6f6f6f] uppercase">Média Score</span>
                      <span className="text-xs font-mono font-semibold text-[#ececec]">
                        {Math.round(profile.avgEngagement || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2 rounded-[12px] bg-[#1c1c1c] border border-[#242424]">
                      <span className="block text-[9px] font-mono text-[#6f6f6f] uppercase">Posts</span>
                      <span className="text-xs font-mono font-semibold text-[#7ae6a0]">
                        {profile.postsCapturedCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#222222]">
                    {profile.profileUrl ? (
                      <a
                        href={profile.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2e2e2e] transition-colors"
                      >
                        <span>Abrir perfil</span>
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span />
                    )}

                    <button
                      type="button"
                      disabled={syncingTarget !== null}
                      onClick={() => handleSync(profile.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#212121] hover:bg-[#2a2a2a] text-[#a0a0a0] hover:text-[#ececec] border border-[#2c2c2c] transition-colors disabled:opacity-45 cursor-pointer"
                      title="Sincronizar via Apify"
                    >
                      <RefreshCw
                        size={11}
                        className={syncingTarget === profile.id ? 'animate-spin' : ''}
                      />
                      <span>Sync</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-[18px] bg-[#161616] border border-dashed border-[#2c2c2c] text-center">
              <p className="text-xs text-[#7a7a7a]">
                Nenhum perfil cadastrado ainda. Clique em <strong className="text-[#ececec]">Monitorar Perfil</strong> acima ou envie direto de qualquer perfil no Instagram/LinkedIn usando a Extensão Chrome.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: QUICK CAPTURE FOR MEUS SALVOS (MANUAL / PRINT OCR) */}
      {activeTab === 'saved' && (
        <form
          onSubmit={handleSaveManualSubmit}
          className="flex flex-col gap-3.5 p-5 rounded-[22px] bg-[#141414] border border-[#242424]"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#ececec]">
              <Bookmark size={14} className="text-[#7ae6a0]" />
              <span>Captura Rápida para Salvos (Link, Texto ou Print de Carrossel/Post)</span>
            </div>
            <span className="text-[11px] font-mono text-[#7a7a7a]">
              Dica: encaminhe Reels para sua DM conectada no Instagram para salvar sem abrir o computador.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-3 flex items-center gap-1 p-1 rounded-full bg-[#0e0e0e] border border-[#262626]">
              {(['instagram', 'linkedin', 'x', 'tiktok'] as Platform[]).map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setSavePlatform(plat)}
                  className={`flex-1 flex items-center justify-center py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    savePlatform === plat
                      ? 'bg-[#f2f2f2] text-[#0a0a0a]'
                      : 'text-[#8a8a8a] hover:text-[#ececec]'
                  }`}
                >
                  {renderPlatformIcon(plat, 'size-3.5')}
                </button>
              ))}
            </div>

            <input
              type="url"
              value={saveUrl}
              onChange={(e) => setSaveUrl(e.target.value)}
              placeholder="Link do post salvo (opcional)..."
              className="md:col-span-5 px-3.5 py-2.5 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4a4a4a]"
            />

            <input
              type="text"
              value={saveAuthor}
              onChange={(e) => setSaveAuthor(e.target.value)}
              placeholder="@autor (opcional)..."
              className="md:col-span-4 px-3.5 py-2.5 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4a4a4a]"
            />
          </div>

          <textarea
            rows={2}
            value={saveText}
            onChange={(e) => setSaveText(e.target.value)}
            placeholder="Cole o texto/legenda do post salvo (ou deixe em branco e envie um print abaixo para a IA ler automaticamente)..."
            className="w-full px-3.5 py-2.5 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4a4a4a] resize-none"
          />

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <label className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2e2e2e] cursor-pointer transition-colors">
              <ImagePlus size={13} className="text-[#7ae6a0]" />
              <span>{saveScreenshot ? 'Print anexado (IA extrairá o texto)' : 'Anexar Print / Carrossel (OCR IA)'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleScreenshotUpload}
                className="hidden"
              />
            </label>

            <button
              type="submit"
              disabled={isSavingCapture || (!saveText.trim() && !saveUrl.trim() && !saveScreenshot)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] disabled:opacity-45 transition-all active:scale-[0.97] cursor-pointer"
            >
              {isSavingCapture ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              <span>{isSavingCapture ? 'Analisando e salvando…' : 'Salvar nos Capturados'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: CHROME EXTENSION, DM CAPTURE & APIFY SETUP */}
      {activeTab === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="p-5 rounded-[22px] bg-[#161616] border border-[#222222] flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-full bg-[#212121] border border-[#2c2c2c] flex items-center justify-center text-[#ececec]">
                <Puzzle size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#ececec]">
                  Extensão Chrome CreateFlow (Salvos &amp; Radar Gratuito)
                </h3>
                <p className="text-xs text-[#7a7a7a]">
                  Captura seus Salvos e posts de qualquer perfil aberto no LinkedIn ou Instagram Web.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-[#7a7a7a] uppercase">URL de Ingestão (Endpoint)</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 rounded-[12px] bg-[#1c1c1c] border border-[#2a2a2a] text-[11px] font-mono text-[#ececec] truncate">
                    {ingestEndpoint}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyText('endpoint', ingestEndpoint)}
                    className="px-3 py-2 rounded-full bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2c2c2c] text-xs cursor-pointer"
                  >
                    {copiedKey === 'endpoint' ? <Check size={13} className="text-[#7ae6a0]" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-[#7a7a7a] uppercase">
                  Token Pessoal da Extensão
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 rounded-[12px] bg-[#1c1c1c] border border-[#2a2a2a] text-[11px] font-mono text-[#7ae6a0] truncate">
                    {radarIngestToken || 'Gerado ao carregar configurações'}
                  </code>
                  <button
                    type="button"
                    disabled={!radarIngestToken}
                    onClick={() => copyText('token', radarIngestToken)}
                    className="px-3 py-2 rounded-full bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2c2c2c] text-xs cursor-pointer"
                  >
                    {copiedKey === 'token' ? <Check size={13} className="text-[#7ae6a0]" /> : <Copy size={13} />}
                  </button>
                  <button
                    type="button"
                    disabled={isRegeneratingToken}
                    onClick={async () => {
                      setIsRegeneratingToken(true);
                      try {
                        await onRegenerateToken();
                      } finally {
                        setIsRegeneratingToken(false);
                      }
                    }}
                    className="px-3 py-2 rounded-full bg-[#212121] hover:bg-[#2a2a2a] text-[#a0a0a0] hover:text-[#ececec] border border-[#2c2c2c] text-[11px] font-mono cursor-pointer"
                    title="Gerar novo token"
                  >
                    <Key size={12} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-[16px] bg-[#1c1c1c] border border-[#262626] flex flex-col gap-2 text-xs text-[#9a9a9a]">
              <span className="font-semibold text-[#ececec]">Como instalar em 30 segundos:</span>
              <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                <li>
                  Abra <code className="text-[#ececec]">chrome://extensions</code> e ative o <strong>Modo do desenvolvedor</strong>.
                </li>
                <li>
                  Clique em <strong>Carregar sem compactação</strong> e selecione a pasta{' '}
                  <code className="text-[#ececec]">chrome-extension/</code> do projeto.
                </li>
                <li>
                  Cole a <strong>URL</strong> e o <strong>Token</strong> acima no popup da extensão, abra seus Salvos ou um perfil e clique em capturar.
                </li>
              </ol>
            </div>
          </div>

          <div className="p-5 rounded-[22px] bg-[#161616] border border-[#222222] flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#ececec]">
                  Automações em Segundo Plano (DM &amp; Apify)
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
                    dmSaveCaptureEnabled
                      ? 'bg-[#212121] text-[#7ae6a0] border-[#7ae6a0]/30'
                      : 'bg-[#212121] text-[#8a8a8a] border-[#2c2c2c]'
                  }`}
                >
                  DM Save: {dmSaveCaptureEnabled ? 'Ativo' : 'Pausado'}
                </span>
              </div>

              <div className="p-3.5 rounded-[16px] bg-[#1c1c1c] border border-[#262626] flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-[#ececec] flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[#7ae6a0]" />
                  Captura por DM no Instagram (Celular)
                </span>
                <p className="text-[11px] text-[#8a8a8a] leading-relaxed">
                  Ao navegar no Instagram no celular, toque no aviãozinho do Reel/Post e envie por DM para sua própria conta conectada (ou envie o link com <code className="text-[#ececec]">#salvar</code>). O webhook salva direto na aba Meus Salvos.
                </p>
              </div>

              <div className="p-3.5 rounded-[16px] bg-[#1c1c1c] border border-[#262626] flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-[#ececec]">
                  Sync Automático Diário via Apify
                </span>
                <p className="text-[11px] text-[#8a8a8a] leading-relaxed">
                  Status atual:{' '}
                  <strong className="text-[#ececec]">
                    {apifyApiToken ? 'Token Apify configurado (Cron diário ativo às 09h UTC)' : 'Não configurado (opcional — use a Extensão Chrome de graça)'}
                  </strong>
                  .
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateToConnections}
              className="w-full py-2.5 px-4 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] transition-all active:scale-[0.97] cursor-pointer"
            >
              Configurar Apify &amp; Preferências em Conexões
            </button>
          </div>
        </div>
      )}

      {/* POSTS FEED (VISIBLE ON RADAR & SAVED TABS) */}
      {activeTab !== 'setup' && (
        <div className="flex flex-col gap-4">
          {/* Filter Strip */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Platform Filter */}
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#141414] border border-[#242424]">
                {(['all', 'instagram', 'linkedin', 'x', 'tiktok'] as const).map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setPlatformFilter(plat)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      platformFilter === plat
                        ? 'bg-[#212121] text-[#ececec]'
                        : 'text-[#7a7a7a] hover:text-[#ececec]'
                    }`}
                  >
                    {plat !== 'all' && renderPlatformIcon(plat, 'size-3')}
                    <span>{plat === 'all' ? 'Todas' : getPlatformLabel(plat)}</span>
                  </button>
                ))}
              </div>

              {/* Media Type Filter */}
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#141414] border border-[#242424]">
                {(
                  [
                    { id: 'all', label: 'Todos' },
                    { id: 'reel', label: 'Reels' },
                    { id: 'carousel', label: 'Carrossel' },
                    { id: 'text', label: 'Texto' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMediaFilter(item.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      mediaFilter === item.id
                        ? 'bg-[#212121] text-[#ececec]'
                        : 'text-[#7a7a7a] hover:text-[#ececec]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#141414] border border-[#242424]">
                {(
                  [
                    { id: 'outlier', label: 'Outlier Viral' },
                    { id: 'recent', label: 'Mais Recentes' },
                    { id: 'likes', label: 'Mais Curtidos' },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSortMode(mode.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
                      sortMode === mode.id
                        ? 'bg-[#212121] text-[#ececec]'
                        : 'text-[#7a7a7a] hover:text-[#ececec]'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 sm:flex-initial">
                <Search
                  size={13}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6f6f6f]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar gancho ou @autor..."
                  className="w-full sm:w-52 pl-9 pr-3.5 py-1.5 rounded-full bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] placeholder:text-[#6f6f6f] text-xs font-mono focus:outline-none focus:border-[#4a4a4a]"
                />
              </div>
            </div>
          </div>

          {/* Captured Posts 3-Column Grid */}
          {visiblePosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visiblePosts.map((post) => {
                const isHighOutlier = post.outlierScore >= 2.0;
                const isBusy = busyPostId === post.id;

                return (
                  <div
                    key={post.id}
                    className="flex flex-col justify-between p-5 rounded-[20px] bg-[#161616] border border-[#222222] hover:border-[#343434] transition-all gap-3.5"
                  >
                    <div className="flex flex-col gap-3">
                      {/* Card Top Meta */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="size-7 rounded-full bg-[#212121] border border-[#2c2c2c] flex items-center justify-center shrink-0">
                            {renderPlatformIcon(post.platform, 'size-3.5')}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-[#ececec] truncate">
                              @{post.authorHandle || post.authorName || getPlatformLabel(post.platform)}
                            </span>
                            <span className="text-[10px] font-mono text-[#6f6f6f] uppercase">
                              {post.mediaType}
                              {post.source === 'dm_share'
                                ? ' · Via DM'
                                : post.source === 'saved'
                                ? ' · Salvo'
                                : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {post.source === 'radar' && (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                                isHighOutlier
                                  ? 'bg-[#7ae6a0]/15 text-[#7ae6a0] border-[#7ae6a0]/30'
                                  : 'bg-[#212121] text-[#9a9a9a] border-[#2c2c2c]'
                              }`}
                              title="Multiplicador em relação à mediana do perfil"
                            >
                              {post.outlierScore.toFixed(1)}x média
                            </span>
                          )}

                          {post.postUrl && (
                            <a
                              href={post.postUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-full text-[#7a7a7a] hover:text-[#ececec] hover:bg-[#212121] transition-colors"
                              title="Abrir post original"
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => onDeleteCapturedPost(post.id)}
                            className="p-1.5 rounded-full text-[#7a7a7a] hover:text-[#ff5f56] hover:bg-[#ff5f56]/10 transition-colors cursor-pointer"
                            title="Excluir post"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Caption / Hook */}
                      <div className="p-3.5 rounded-[14px] bg-[#1c1c1c] border border-[#262626] flex flex-col gap-1.5">
                        <p className="text-xs text-[#d8d8d8] leading-relaxed whitespace-pre-line line-clamp-5">
                          {post.captionText}
                        </p>
                        {post.aiHookSummary && (
                          <span className="text-[10px] font-mono text-[#7ae6a0] pt-1 border-t border-[#262626]">
                            Gancho IA: {post.aiHookSummary}
                          </span>
                        )}
                      </div>

                      {/* Metrics Row */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#7a7a7a] px-1">
                        <span className="flex items-center gap-1">
                          <Heart size={11} />
                          {post.likesCount.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={11} />
                          {post.commentsCount.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={11} />
                          {post.viewsCount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#6f6f6f]">
                          {post.status === 'used'
                            ? 'Usado'
                            : post.status === 'saved_idea'
                            ? 'Em Ideias'
                            : 'Novo'}
                        </span>
                      </div>
                    </div>

                    {/* 1-Click Actions */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-[#222222]">
                      <button
                        type="button"
                        onClick={() => {
                          onUpdatePostStatus(post.id, 'used');
                          onCreateInMyVoice(post);
                        }}
                        className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] transition-all active:scale-[0.97] cursor-pointer"
                      >
                        <Sparkles size={11} />
                        <span>Criar no Meu Tom</span>
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={async () => {
                          setBusyPostId(post.id);
                          try {
                            await onDeconstructHook(post);
                            await onUpdatePostStatus(post.id, 'used');
                          } finally {
                            setBusyPostId(null);
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2e2e2e] transition-all cursor-pointer disabled:opacity-50"
                      >
                        <BookOpen size={11} />
                        <span>Desconstruir</span>
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={async () => {
                          setBusyPostId(post.id);
                          try {
                            await onSendToIdea(post);
                            await onUpdatePostStatus(post.id, 'saved_idea');
                          } finally {
                            setBusyPostId(null);
                          }
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium bg-[#1c1c1c] hover:bg-[#242424] text-[#9a9a9a] hover:text-[#ececec] border border-[#2a2a2a] transition-all cursor-pointer"
                        title="Enviar para Banco de Ideias"
                      >
                        <Lightbulb size={11} />
                        <span>Ideia</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onAtomizePost(post)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium bg-[#1c1c1c] hover:bg-[#242424] text-[#9a9a9a] hover:text-[#ececec] border border-[#2a2a2a] transition-all cursor-pointer"
                        title="Atomizar em 3 formatos"
                      >
                        <Zap size={11} />
                        <span>Atomizar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 rounded-[22px] bg-[#141414] border border-[#242424] text-center flex flex-col items-center gap-2.5">
              <div className="size-11 rounded-full bg-[#212121] border border-[#2c2c2c] flex items-center justify-center text-[#8a8a8a]">
                {activeTab === 'radar' ? <Radar size={18} /> : <Bookmark size={18} />}
              </div>
              <span className="text-sm font-semibold text-[#ececec]">
                {activeTab === 'radar'
                  ? 'Nenhum post no Radar ainda'
                  : 'Nenhum post salvo importado ainda'}
              </span>
              <p className="text-xs text-[#7a7a7a] max-w-md">
                {activeTab === 'radar'
                  ? 'Adicione perfis acima e sincronize com a Extensão Chrome ou via Apify para ranquear automaticamente os posts que mais viralizaram.'
                  : 'Cole um link/legenda acima, envie um print do post ou use a Extensão Chrome na aba de Salvos do LinkedIn/Instagram.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
