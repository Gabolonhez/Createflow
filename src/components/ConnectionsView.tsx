'use client';

import React, { useState, useEffect } from 'react';
import {
  Link2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Key,
  Check,
  Copy,
  Info,
} from 'lucide-react';
import { XLogo, LinkedInLogo, InstagramLogo, TikTokLogo } from './BrandIcons';
import type { ConnectionsConfig } from '@/types';

interface ConnectionsViewProps {
  connections: ConnectionsConfig;
  onSaveConnections: (cfg: Partial<ConnectionsConfig>) => Promise<void>;
  linkedInOAuthUrl?: string;
}

export function ConnectionsView({
  connections,
  onSaveConnections,
  linkedInOAuthUrl = '/api/oauth/linkedin',
}: ConnectionsViewProps) {
  const [xMode, setXMode] = useState(connections.x_publish_mode || 'manual');
  const [xUsername, setXUsername] = useState(connections.x_username || 'gabolonhez');
  const [xToken, setXToken] = useState(connections.x_bearer_token || '');

  const [liMode, setLiMode] = useState(connections.linkedin_publish_mode || 'manual');
  const [liClientId, setLiClientId] = useState(connections.linkedin_client_id || '');
  const [liClientSecret, setLiClientSecret] = useState(connections.linkedin_client_secret || '');

  const [igConnected, setIgConnected] = useState(Boolean(connections.instagram_connected));
  const [igUsername, setIgUsername] = useState(connections.instagram_username || 'gabolonhez');
  const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);

  const [ttConnected, setTtConnected] = useState(Boolean(connections.tiktok_connected));
  const [ttUsername, setTtUsername] = useState(connections.tiktok_username || 'gabolonhez');
  const [ttClientKey, setTtClientKey] = useState(connections.tiktok_client_key || '');
  const [ttClientSecret, setTtClientSecret] = useState(connections.tiktok_client_secret || '');
  const [isConnectingTikTok, setIsConnectingTikTok] = useState(false);

  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [isConnectingOAuth, setIsConnectingOAuth] = useState(false);

  useEffect(() => {
    if (connections.linkedin_client_id && !liClientId) {
      setLiClientId(connections.linkedin_client_id);
    }
    if (connections.linkedin_client_secret && !liClientSecret) {
      setLiClientSecret(connections.linkedin_client_secret);
    }
    if (connections.linkedin_publish_mode) {
      setLiMode(connections.linkedin_publish_mode);
    }
    if (connections.instagram_username) {
      setIgUsername(connections.instagram_username);
    }
    setIgConnected(Boolean(connections.instagram_connected));
    if (connections.tiktok_username) {
      setTtUsername(connections.tiktok_username);
    }
    setTtConnected(Boolean(connections.tiktok_connected));
    if (connections.tiktok_client_key && !ttClientKey) {
      setTtClientKey(connections.tiktok_client_key);
    }
    if (connections.tiktok_client_secret && !ttClientSecret) {
      setTtClientSecret(connections.tiktok_client_secret);
    }
  }, [
    connections.linkedin_client_id,
    connections.linkedin_client_secret,
    connections.linkedin_publish_mode,
    connections.instagram_connected,
    connections.instagram_username,
    connections.tiktok_connected,
    connections.tiktok_username,
    connections.tiktok_client_key,
    connections.tiktok_client_secret,
  ]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setConnectError(null);
    try {
      await onSaveConnections({
        x_publish_mode: xMode,
        x_username: xUsername.replace('@', '').trim(),
        x_bearer_token: xToken.trim() || undefined,
        linkedin_publish_mode: liMode,
        linkedin_client_id: liClientId.trim() || undefined,
        linkedin_client_secret: liClientSecret.trim() || undefined,
        instagram_connected: igConnected,
        instagram_username: igUsername.replace('@', '').trim(),
        tiktok_connected: ttConnected,
        tiktok_username: ttUsername.replace('@', '').trim(),
        tiktok_client_key: ttClientKey.trim() || undefined,
        tiktok_client_secret: ttClientSecret.trim() || undefined,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectOAuth = async (e: React.MouseEvent) => {
    e.preventDefault();
    setConnectError(null);

    const effectiveClientId = liClientId.trim() || connections.linkedin_client_id?.trim();
    const effectiveClientSecret = liClientSecret.trim() || connections.linkedin_client_secret?.trim();

    if (!effectiveClientId) {
      setConnectError('Preencha o Client ID abaixo antes de conectar.');
      return;
    }

    setIsConnectingOAuth(true);
    try {
      await onSaveConnections({
        linkedin_client_id: effectiveClientId,
        linkedin_client_secret: effectiveClientSecret || undefined,
        linkedin_publish_mode: liMode,
      });
    } catch (err) {
      console.warn('Silent save failed before OAuth redirect:', err);
    }

    const url = new URL(linkedInOAuthUrl, window.location.origin);
    if (effectiveClientId) {
      url.searchParams.set('client_id', effectiveClientId);
    }
    if (effectiveClientSecret) {
      url.searchParams.set('client_secret', effectiveClientSecret);
    }
    window.location.href = url.toString();
  };

  const handleConnectInstagramOAuth = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsConnectingInstagram(true);
    try {
      await onSaveConnections({
        instagram_username: igUsername.replace('@', '').trim(),
      });
    } catch (err) {
      console.warn('Silent save failed before Instagram OAuth redirect:', err);
    }
    window.location.href = '/api/oauth/instagram';
  };

  const handleConnectTikTokOAuth = async (e: React.MouseEvent) => {
    e.preventDefault();
    const effectiveKey = ttClientKey.trim() || connections.tiktok_client_key?.trim();
    const effectiveSecret = ttClientSecret.trim() || connections.tiktok_client_secret?.trim();

    if (!effectiveKey) {
      setConnectError('Preencha o Client Key do TikTok abaixo antes de conectar.');
      return;
    }

    setIsConnectingTikTok(true);
    try {
      await onSaveConnections({
        tiktok_username: ttUsername.replace('@', '').trim(),
        tiktok_client_key: effectiveKey,
        tiktok_client_secret: effectiveSecret || undefined,
      });
    } catch (err) {
      console.warn('Silent save failed before TikTok OAuth redirect:', err);
    }

    const url = new URL('/api/oauth/tiktok', window.location.origin);
    url.searchParams.set('client_key', effectiveKey);
    if (effectiveSecret) url.searchParams.set('client_secret', effectiveSecret);
    window.location.href = url.toString();
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.025] border border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Link2 size={16} className="text-violet-400" />
          <span className="text-xs font-semibold text-white">
            Conexões das Redes & Modos de Publicação
          </span>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md shadow-violet-600/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {savedSuccess ? (
            <>
              <Check size={14} className="text-emerald-300" />
              <span>Salvo!</span>
            </>
          ) : (
            <span>{isSaving ? 'Salvando…' : 'Salvar configurações'}</span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* X (Twitter) Connection Card */}
        <div className="flex flex-col justify-between p-5 rounded-xl bg-[#0f0f15] border border-white/[0.08] gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-black border border-white/[0.1] text-white">
                  <XLogo className="size-4" />
                </span>
                <span className="text-sm font-semibold text-white">X (Twitter)</span>
              </div>

              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 size={12} />
                Pronto para postar
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-white/50">Seu @ no X</label>
              <input
                type="text"
                value={xUsername}
                onChange={(e) => setXUsername(e.target.value)}
                placeholder="gabolonhez"
                className="px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50"
              />
            </div>

            {/* Publish Mode Toggle */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.05]">
              <label className="text-[11px] font-mono text-white/50">Modo de Publicação no X:</label>

              <div className="flex flex-col gap-2">
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-black/30 border border-white/[0.06] cursor-pointer hover:border-white/[0.12] transition-colors">
                  <input
                    type="radio"
                    name="xMode"
                    value="manual"
                    checked={xMode === 'manual'}
                    onChange={() => setXMode('manual')}
                    className="mt-0.5 accent-violet-500"
                  />
                  <div className="flex flex-col text-xs">
                    <span className="font-semibold text-white/90">
                      Modo Manual com 1 clique (Recomendado)
                    </span>
                    <span className="text-white/50 text-[11px] mt-0.5">
                      Abre o composer do X diretamente com seu post pré-formatado (threads, quebras e imagens). Não exige plano pago de API do Twitter!
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-black/30 border border-white/[0.06] cursor-pointer hover:border-white/[0.12] transition-colors">
                  <input
                    type="radio"
                    name="xMode"
                    value="automatic"
                    checked={xMode === 'automatic'}
                    onChange={() => setXMode('automatic')}
                    className="mt-0.5 accent-violet-500"
                  />
                  <div className="flex flex-col text-xs">
                    <span className="font-semibold text-white/90">
                      Modo 100% Automático (API v2)
                    </span>
                    <span className="text-white/50 text-[11px] mt-0.5">
                      Publica direto no X em segundo plano no horário agendado. Exige chave/token do portal de desenvolvedor do X.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {xMode === 'automatic' && (
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[11px] font-mono text-white/50 flex items-center gap-1">
                  <Key size={11} /> Bearer Token do X
                </label>
                <input
                  type="password"
                  value={xToken}
                  onChange={(e) => setXToken(e.target.value)}
                  placeholder="Cole seu Bearer Token do developer.x.com..."
                  className="px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50"
                />
              </div>
            )}
          </div>
        </div>

        {/* LinkedIn Connection Card */}
        <div className="flex flex-col justify-between p-5 rounded-xl bg-[#0f0f15] border border-white/[0.08] gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#0A66C2]/20 border border-[#0A66C2]/40 text-[#70b5f9]">
                  <LinkedInLogo className="size-4 text-[#0A66C2]" />
                </span>
                <span className="text-sm font-semibold text-white">LinkedIn</span>
              </div>

              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 size={12} />
                {connections.linkedin_connected ? 'Conectado' : 'Pronto'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-black/30 border border-white/[0.06] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white/90">
                  {connections.linkedin_name || 'Perfil LinkedIn'}
                </span>
                <span className="text-[11px] text-white/45">
                  {connections.linkedin_connected
                    ? `ID: ${connections.linkedin_profile_id || 'Conectado via OAuth'}`
                    : 'Ainda não autenticado via OAuth'}
                </span>
              </div>

              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={handleConnectOAuth}
                  disabled={isConnectingOAuth}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0A66C2] hover:bg-[#084e96] text-white transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {isConnectingOAuth
                    ? 'Redirecionando…'
                    : connections.linkedin_connected
                    ? 'Reconectar OAuth'
                    : 'Conectar OAuth'}
                </button>
                {connectError && (
                  <span className="text-[10px] text-amber-400 font-mono text-right max-w-[200px]">
                    {connectError}
                  </span>
                )}
              </div>
            </div>

            {/* LinkedIn Developer Credentials Setup */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-white/[0.05]">
              <span className="text-[11px] font-mono text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                <Key size={12} className="text-[#70b5f9]" />
                Credenciais do App (LinkedIn Developers)
              </span>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-white/40">Client ID (aba Auth)</label>
                <input
                  type="text"
                  value={liClientId}
                  onChange={(e) => setLiClientId(e.target.value)}
                  placeholder="Cole o Client ID gerado no LinkedIn..."
                  className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-[#0A66C2]/60"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-white/40">Primary Client Secret (aba Auth)</label>
                <input
                  type="password"
                  value={liClientSecret}
                  onChange={(e) => setLiClientSecret(e.target.value)}
                  placeholder="Cole o Client Secret gerado no LinkedIn..."
                  className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-[#0A66C2]/60"
                />
              </div>

              {/* Redirect URI helper box */}
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-white/60">
                    URL de Redirecionamento (Cole na aba Auth do LinkedIn):
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('https://createfloww.vercel.app/api/oauth/linkedin')}
                    className="flex items-center gap-1 text-[10px] font-mono text-[#70b5f9] hover:underline"
                  >
                    <Copy size={11} />
                    <span>{copiedUrl === 'https://createfloww.vercel.app/api/oauth/linkedin' ? 'Copiado!' : 'Copiar URL'}</span>
                  </button>
                </div>
                <code className="text-[10px] font-mono text-white/80 bg-black/50 p-1.5 rounded border border-white/[0.04] break-all select-all">
                  https://createfloww.vercel.app/api/oauth/linkedin
                </code>
                <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                  <span className="text-[10px] font-mono text-white/40">Para testes locais (localhost):</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('http://localhost:3000/api/oauth/linkedin')}
                    className="flex items-center gap-1 text-[10px] font-mono text-white/50 hover:text-white"
                  >
                    <Copy size={10} />
                    <span>{copiedUrl === 'http://localhost:3000/api/oauth/linkedin' ? 'Copiado!' : 'Copiar Local'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* LinkedIn Publish Mode */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.05]">
              <label className="text-[11px] font-mono text-white/50">Modo de Publicação no LinkedIn:</label>

              <div className="flex flex-col gap-2">
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-black/30 border border-white/[0.06] cursor-pointer hover:border-white/[0.12] transition-colors">
                  <input
                    type="radio"
                    name="liMode"
                    value="manual"
                    checked={liMode === 'manual'}
                    onChange={() => setLiMode('manual')}
                    className="mt-0.5 accent-violet-500"
                  />
                  <div className="flex flex-col text-xs">
                    <span className="font-semibold text-white/90">
                      Modo Manual com 1 clique (Recomendado)
                    </span>
                    <span className="text-white/50 text-[11px] mt-0.5">
                      Abre a tela de compartilhamento do LinkedIn pré-carregada para você fazer a revisão final antes de disparar.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-black/30 border border-white/[0.06] cursor-pointer hover:border-white/[0.12] transition-colors">
                  <input
                    type="radio"
                    name="liMode"
                    value="automatic"
                    checked={liMode === 'automatic'}
                    onChange={() => setLiMode('automatic')}
                    className="mt-0.5 accent-violet-500"
                  />
                  <div className="flex flex-col text-xs">
                    <span className="font-semibold text-white/90">
                      Modo 100% Automático (API LinkedIn v2)
                    </span>
                    <span className="text-white/50 text-[11px] mt-0.5">
                      Publica automaticamente no seu feed do LinkedIn assim que o post atinge o horário programado.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* 3. INSTAGRAM PROFESSIONAL & META GRAPH API */}
        {/* ========================================= */}
        <div className="p-5 rounded-2xl bg-[#111116] border border-white/[0.08] flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-pink-600/20">
                <InstagramLogo className="size-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">Instagram Professional</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-pink-500/15 text-pink-300 border border-pink-500/30">
                    Meta Graph API v25
                  </span>
                </div>
                <span className="text-white/40 text-xs">
                  Automação oficial de comentários, DMs e respostas públicas.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium ${
                igConnected ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}>
                <span className={`size-1.5 rounded-full ${igConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                {igConnected ? 'Conectado' : 'Não conectado'}
              </span>
            </div>
          </div>

          {/* Instagram OAuth Action Bar */}
          <div className="p-3 rounded-lg bg-black/30 border border-white/[0.06] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white/90">
                @{igUsername || 'gabolonhez'}
              </span>
              <span className="text-[11px] text-white/45">
                {igConnected
                  ? 'Autorizado via OAuth da Meta (Pronto para disparar DMs)'
                  : 'Ainda não autenticado via OAuth da Meta (Necessário para disparar DMs)'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConnectInstagramOAuth}
                disabled={isConnectingInstagram}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white transition-all shadow-md shadow-pink-600/20 active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {isConnectingInstagram
                  ? 'Abrindo Meta…'
                  : igConnected
                  ? 'Reconectar OAuth'
                  : 'Conectar com Instagram'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-white/50">Username do Instagram (@):</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={igUsername}
                  onChange={(e) => setIgUsername(e.target.value)}
                  placeholder="gabolonhez"
                  className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-pink-500/60"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-white/50">Webhook Endpoint URL (Meta Developer App):</label>
              <div className="flex items-center gap-1.5">
                <code className="flex-1 px-2.5 py-2 rounded-lg bg-black/50 border border-white/[0.04] text-[10px] font-mono text-white/80 truncate">
                  https://createfloww.vercel.app/api/webhook
                </code>
                <button
                  type="button"
                  onClick={() => copyToClipboard('https://createfloww.vercel.app/api/webhook')}
                  className="px-2 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] text-white font-mono shrink-0"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* OAuth Redirect URI Helper */}
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-white/60">
                URL de Redirecionamento (Cole na aba Business Login do Instagram na Meta):
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard('https://createfloww.vercel.app/api/oauth/callback')}
                className="flex items-center gap-1 text-[10px] font-mono text-pink-300 hover:underline"
              >
                <Copy size={11} />
                <span>{copiedUrl === 'https://createfloww.vercel.app/api/oauth/callback' ? 'Copiado!' : 'Copiar URL'}</span>
              </button>
            </div>
            <code className="text-[10px] font-mono text-white/80 bg-black/50 p-1.5 rounded border border-white/[0.04] break-all select-all">
              https://createfloww.vercel.app/api/oauth/callback
            </code>
            <span className="text-[10px] text-white/40 leading-relaxed">
              💡 <strong>Passo obrigatório na Meta:</strong> Adicione seu <code className="text-white/70">@{igUsername || 'username'}</code> em <em>Roles → Instagram Testers</em> e aceite o convite no app do celular (<em>Apps e Sites → Convites de testador</em>). Em seguida, clique em <strong>Conectar com Instagram</strong> acima.
            </span>
          </div>
        </div>

        {/* ========================================= */}
        {/* 4. TIKTOK FOR BUSINESS & CREATOR API      */}
        {/* ========================================= */}
        <div className="p-5 rounded-2xl bg-[#111116] border border-white/[0.08] flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-rose-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <TikTokLogo className="size-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">TikTok Creator & Business</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    Content & Messaging API
                  </span>
                </div>
                <span className="text-white/40 text-xs">
                  Publicação direta de vídeos e resposta automática por Direct Message.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium ${
                ttConnected ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}>
                <span className={`size-1.5 rounded-full ${ttConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                {ttConnected ? 'Conectado' : 'Não conectado'}
              </span>
            </div>
          </div>

          {/* TikTok OAuth Action Bar */}
          <div className="p-3 rounded-lg bg-black/30 border border-white/[0.06] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white/90">
                @{ttUsername || 'gabolonhez'}
              </span>
              <span className="text-[11px] text-white/45">
                {ttConnected
                  ? 'Autorizado via TikTok Login Kit'
                  : 'Aguardando autorização via TikTok Login Kit'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConnectTikTokOAuth}
                disabled={isConnectingTikTok}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white transition-all shadow-md shadow-cyan-600/20 active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {isConnectingTikTok
                  ? 'Abrindo TikTok…'
                  : ttConnected
                  ? 'Reconectar OAuth'
                  : 'Conectar com TikTok'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-white/50">Username do TikTok (@):</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={ttUsername}
                  onChange={(e) => setTtUsername(e.target.value)}
                  placeholder="gabolonhez"
                  className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-cyan-500/60"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-white/50">Webhook Endpoint URL (TikTok Developer Portal):</label>
              <div className="flex items-center gap-1.5">
                <code className="flex-1 px-2.5 py-2 rounded-lg bg-black/50 border border-white/[0.04] text-[10px] font-mono text-white/80 truncate">
                  https://createfloww.vercel.app/api/webhook/tiktok
                </code>
                <button
                  type="button"
                  onClick={() => copyToClipboard('https://createfloww.vercel.app/api/webhook/tiktok')}
                  className="px-2 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] text-white font-mono shrink-0"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* TikTok Credentials (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-white/40">TikTok Client Key (aba App Details)</label>
              <input
                type="text"
                value={ttClientKey}
                onChange={(e) => setTtClientKey(e.target.value)}
                placeholder="Cole o Client Key do TikTok Developers..."
                className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-white/40">TikTok Client Secret</label>
              <input
                type="password"
                value={ttClientSecret}
                onChange={(e) => setTtClientSecret(e.target.value)}
                placeholder="Cole o Client Secret do TikTok Developers..."
                className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>

          {/* TikTok Redirect URI Helper */}
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-white/60">
                URL de Redirecionamento (Cole na aba Login Kit do TikTok Developer Portal):
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard('https://createfloww.vercel.app/api/oauth/tiktok')}
                className="flex items-center gap-1 text-[10px] font-mono text-cyan-300 hover:underline"
              >
                <Copy size={11} />
                <span>{copiedUrl === 'https://createfloww.vercel.app/api/oauth/tiktok' ? 'Copiado!' : 'Copiar URL'}</span>
              </button>
            </div>
            <code className="text-[10px] font-mono text-white/80 bg-black/50 p-1.5 rounded border border-white/[0.04] break-all select-all">
              https://createfloww.vercel.app/api/oauth/tiktok
            </code>
            <span className="text-[10px] text-white/40 leading-relaxed">
              💡 <strong>No TikTok Developer Portal:</strong> Na aba <em>Login Kit</em>, adicione a URL acima em <em>Redirect URI</em> para habilitar o login e permissões.
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
