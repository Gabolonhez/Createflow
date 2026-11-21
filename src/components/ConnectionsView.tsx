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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-[22px] bg-[#141414] border border-[#242424]">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-[#212121] border border-[#2c2c2c] flex items-center justify-center text-[#ececec]">
            <Link2 size={14} />
          </div>
          <span className="text-xs font-semibold text-[#ececec]">
            Conexões das Redes & Modos de Publicação
          </span>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] transition-all active:scale-[0.97] disabled:opacity-50 cursor-pointer"
        >
          {savedSuccess ? (
            <>
              <Check size={14} className="text-[#16a34a]" />
              <span>Salvo!</span>
            </>
          ) : (
            <span>{isSaving ? 'Salvando…' : 'Salvar configurações'}</span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* X (Twitter) Connection Card */}
        <div className="flex flex-col justify-between p-5 sm:p-6 rounded-[22px] bg-[#161616] border border-[#222222] gap-4">
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="size-9 rounded-full bg-[#212121] border border-[#2c2c2c] text-[#ececec] flex items-center justify-center">
                  <XLogo className="size-4" />
                </span>
                <span className="text-sm font-semibold text-[#ececec]">X (Twitter)</span>
              </div>

              <span className="flex items-center gap-1.5 text-xs text-[#7ae6a0] font-mono px-2.5 py-0.5 rounded-full bg-[#212121] border border-[#2c2c2c]">
                <CheckCircle2 size={12} />
                Pronto para postar
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-[#7a7a7a]">Seu @ no X</label>
              <input
                type="text"
                value={xUsername}
                onChange={(e) => setXUsername(e.target.value)}
                placeholder="gabolonhez"
                className="px-3.5 py-2.5 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] placeholder:text-[#6f6f6f] text-xs focus:outline-none focus:border-[#4a4a4a] transition-colors"
              />
            </div>

            {/* Publish Mode Toggle */}
            <div className="flex flex-col gap-2 pt-3 border-t border-[#222222]">
              <label className="text-[11px] font-mono text-[#7a7a7a]">Modo de Publicação no X:</label>

              <div className="flex flex-col gap-2">
                <label className="flex items-start gap-2.5 p-3 rounded-[14px] bg-[#1c1c1c] border border-[#262626] cursor-pointer hover:border-[#363636] transition-colors">
                  <input
                    type="radio"
                    name="xMode"
                    value="manual"
                    checked={xMode === 'manual'}
                    onChange={() => setXMode('manual')}
                    className="mt-0.5 accent-[#0c8ce9]"
                  />
                  <div className="flex flex-col text-xs">
                    <span className="font-semibold text-[#ececec]">
                      Modo Manual com 1 clique (Recomendado)
                    </span>
                    <span className="text-[#7a7a7a] text-[11px] mt-0.5">
                      Abre o composer do X diretamente com seu post pré-formatado (threads, quebras e imagens). Não exige plano pago de API do Twitter!
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-[14px] bg-[#1c1c1c] border border-[#262626] cursor-pointer hover:border-[#363636] transition-colors">
                  <input
                    type="radio"
                    name="xMode"
                    value="automatic"
                    checked={xMode === 'automatic'}
                    onChange={() => setXMode('automatic')}
                    className="mt-0.5 accent-[#0c8ce9]"
                  />
                  <div className="flex flex-col text-xs">
                    <span className="font-semibold text-[#ececec]">
                      Modo 100% Automático (API v2)
                    </span>
                    <span className="text-[#7a7a7a] text-[11px] mt-0.5">
                      Publica direto no X em segundo plano no horário agendado. Exige chave/token do portal de desenvolvedor do X.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {xMode === 'automatic' && (
              <div className="flex flex-col gap-1.5 mt-1">
                <label className="text-[11px] font-mono text-[#7a7a7a] flex items-center gap-1">
                  <Key size={11} /> Bearer Token do X
                </label>
                <input
                  type="password"
                  value={xToken}
                  onChange={(e) => setXToken(e.target.value)}
                  placeholder="Cole seu Bearer Token do developer.x.com..."
                  className="px-3.5 py-2.5 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] placeholder:text-[#6f6f6f] text-xs focus:outline-none focus:border-[#4a4a4a] transition-colors"
                />
              </div>
            )}
          </div>
        </div>

        {/* LinkedIn Connection Card */}
        <div className="flex flex-col justify-between p-5 sm:p-6 rounded-[22px] bg-[#161616] border border-[#222222] gap-4">
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="size-9 rounded-full bg-[#212121] border border-[#2c2c2c] flex items-center justify-center">
                  <LinkedInLogo className="size-4 text-[#0A66C2]" />
                </span>
                <span className="text-sm font-semibold text-[#ececec]">LinkedIn</span>
              </div>

              <span className="flex items-center gap-1.5 text-xs text-[#7ae6a0] font-mono px-2.5 py-0.5 rounded-full bg-[#212121] border border-[#2c2c2c]">
                <CheckCircle2 size={12} />
                {connections.linkedin_connected ? 'Conectado' : 'Pronto'}
              </span>
            </div>

            <div className="p-3.5 rounded-[16px] bg-[#1c1c1c] border border-[#262626] flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#ececec]">
                  {connections.linkedin_name || 'Perfil LinkedIn'}
                </span>
                <span className="text-[11px] text-[#7a7a7a]">
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
                  className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] transition-all active:scale-[0.97] cursor-pointer disabled:opacity-50"
                >
                  {isConnectingOAuth
                    ? 'Redirecionando…'
                    : connections.linkedin_connected
                    ? 'Reconectar OAuth'
                    : 'Conectar OAuth'}
                </button>
                {connectError && (
                  <span className="text-[10px] text-[#ffbd2e] font-mono text-right max-w-[200px]">
                    {connectError}
                  </span>
                )}
              </div>
            </div>

            {/* LinkedIn Developer Credentials Setup */}
            <div className="flex flex-col gap-2.5 pt-3 border-t border-[#222222]">
              <span className="text-[11px] font-mono text-[#8a8a8a] uppercase tracking-wider flex items-center gap-1.5">
                <Key size={12} className="text-[#a0a0a0]" />
                Credenciais do App (LinkedIn Developers)
              </span>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-[#7a7a7a]">Client ID (aba Auth)</label>
                <input
                  type="text"
                  value={liClientId}
                  onChange={(e) => setLiClientId(e.target.value)}
                  placeholder="Cole o Client ID gerado no LinkedIn..."
                  className="px-3.5 py-2 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] placeholder:text-[#6f6f6f] text-xs font-mono focus:outline-none focus:border-[#4a4a4a] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-[#7a7a7a]">Primary Client Secret (aba Auth)</label>
                <input
                  type="password"
                  value={liClientSecret}
                  onChange={(e) => setLiClientSecret(e.target.value)}
                  placeholder="Cole o Client Secret gerado no LinkedIn..."
                  className="px-3.5 py-2 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] placeholder:text-[#6f6f6f] text-xs font-mono focus:outline-none focus:border-[#4a4a4a] transition-colors"
                />
              </div>

              {/* Redirect URI helper box */}
              <div className="p-3.5 rounded-[16px] bg-[#1c1c1c] border border-[#262626] flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-[#8a8a8a]">
                    URL de Redirecionamento (Cole na aba Auth do LinkedIn):
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('https://createfloww.vercel.app/api/oauth/linkedin')}
                    className="flex items-center gap-1 text-[10px] font-mono text-[#ececec] hover:underline cursor-pointer shrink-0"
                  >
                    <Copy size={11} />
                    <span>{copiedUrl === 'https://createfloww.vercel.app/api/oauth/linkedin' ? 'Copiado!' : 'Copiar URL'}</span>
                  </button>
                </div>
                <code className="text-[10px] font-mono text-[#d0d0d0] bg-[#111111] p-2 rounded-[10px] border border-[#242424] break-all select-all">
                  https://createfloww.vercel.app/api/oauth/linkedin
                </code>
                <div className="flex items-center justify-between pt-1.5 border-t border-[#242424]">
                  <span className="text-[10px] font-mono text-[#6f6f6f]">Para testes locais (localhost):</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('http://localhost:3000/api/oauth/linkedin')}
                    className="flex items-center gap-1 text-[10px] font-mono text-[#8a8a8a] hover:text-[#ececec] cursor-pointer"
                  >
                    <Copy size={10} />
                    <span>{copiedUrl === 'http://localhost:3000/api/oauth/linkedin' ? 'Copiado!' : 'Copiar Local'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* LinkedIn Publish Mode */}
            <div className="flex flex-col gap-2 pt-3 border-t border-[#222222]">
              <label className="text-[11px] font-mono text-[#7a7a7a]">Modo de Publicação no LinkedIn:</label>

              <div className="flex flex-col gap-2">
                <label className="flex items-start gap-2.5 p-3 rounded-[14px] bg-[#1c1c1c] border border-[#262626] cursor-pointer hover:border-[#363636] transition-colors">
                  <input
                    type="radio"
                    name="liMode"
                    value="manual"
                    checked={liMode === 'manual'}
                    onChange={() => setLiMode('manual')}
                    className="mt-0.5 accent-[#0c8ce9]"
                  />
                  <div className="flex flex-col text-xs">
                    <span className="font-semibold text-[#ececec]">
                      Modo Manual com 1 clique (Recomendado)
                    </span>
                    <span className="text-[#7a7a7a] text-[11px] mt-0.5">
                      Abre a tela de compartilhamento do LinkedIn pré-carregada para você fazer a revisão final antes de disparar.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-[14px] bg-[#1c1c1c] border border-[#262626] cursor-pointer hover:border-[#363636] transition-colors">
                  <input
                    type="radio"
                    name="liMode"
                    value="automatic"
                    checked={liMode === 'automatic'}
                    onChange={() => setLiMode('automatic')}
                    className="mt-0.5 accent-[#0c8ce9]"
                  />
                  <div className="flex flex-col text-xs">
                    <span className="font-semibold text-[#ececec]">
                      Modo 100% Automático (API LinkedIn v2)
                    </span>
                    <span className="text-[#7a7a7a] text-[11px] mt-0.5">
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
        <div className="p-5 sm:p-6 rounded-[22px] bg-[#161616] border border-[#222222] flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-[#212121] border border-[#2c2c2c] flex items-center justify-center shrink-0">
                <InstagramLogo className="size-4 text-[#ececec]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-[#ececec] text-sm">Instagram Professional</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#212121] text-[#9a9a9a] border border-[#2c2c2c]">
                    Meta Graph API v25
                  </span>
                </div>
                <span className="text-[#7a7a7a] text-xs mt-0.5">
                  Automação oficial de comentários, DMs e respostas públicas.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium ${
                igConnected ? 'bg-[#212121] text-[#7ae6a0] border border-[#7ae6a0]/30' : 'bg-[#212121] text-[#8a8a8a] border border-[#2c2c2c]'
              }`}>
                <span className={`size-1.5 rounded-full ${igConnected ? 'bg-[#7ae6a0] animate-pulse' : 'bg-[#6f6f6f]'}`} />
                {igConnected ? 'Conectado' : 'Não conectado'}
              </span>
            </div>
          </div>

          {/* Instagram OAuth Action Bar */}
          <div className="p-3.5 rounded-[16px] bg-[#1c1c1c] border border-[#262626] flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#ececec]">
                @{igUsername || 'gabolonhez'}
              </span>
              <span className="text-[11px] text-[#7a7a7a]">
                {igConnected
                  ? 'Autorizado via OAuth da Meta (Pronto para disparar DMs)'
                  : 'Ainda não autenticado via OAuth da Meta (Necessário para disparar DMs)'}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleConnectInstagramOAuth}
                disabled={isConnectingInstagram}
                className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] transition-all active:scale-[0.97] cursor-pointer disabled:opacity-50"
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
              <label className="text-[11px] font-mono text-[#7a7a7a]">Username do Instagram (@):</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={igUsername}
                  onChange={(e) => setIgUsername(e.target.value)}
                  placeholder="gabolonhez"
                  className="flex-1 px-3.5 py-2.5 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] placeholder:text-[#6f6f6f] text-xs font-mono focus:outline-none focus:border-[#4a4a4a] transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-[#7a7a7a]">Webhook Endpoint URL (Meta Developer App):</label>
              <div className="flex items-center gap-1.5">
                <code className="flex-1 px-3 py-2.5 rounded-[14px] bg-[#111111] border border-[#242424] text-[10px] font-mono text-[#d0d0d0] truncate">
                  https://createfloww.vercel.app/api/webhook
                </code>
                <button
                  type="button"
                  onClick={() => copyToClipboard('https://createfloww.vercel.app/api/webhook')}
                  className="p-2.5 rounded-[14px] bg-[#212121] hover:bg-[#2a2a2a] border border-[#2c2c2c] text-[#ececec] font-mono shrink-0 cursor-pointer"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* OAuth Redirect URI Helper */}
          <div className="p-3.5 rounded-[16px] bg-[#1c1c1c] border border-[#262626] flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-[#8a8a8a]">
                URL de Redirecionamento (Cole na aba Business Login do Instagram na Meta):
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard('https://createfloww.vercel.app/api/oauth/callback')}
                className="flex items-center gap-1 text-[10px] font-mono text-[#ececec] hover:underline cursor-pointer shrink-0"
              >
                <Copy size={11} />
                <span>{copiedUrl === 'https://createfloww.vercel.app/api/oauth/callback' ? 'Copiado!' : 'Copiar URL'}</span>
              </button>
            </div>
            <code className="text-[10px] font-mono text-[#d0d0d0] bg-[#111111] p-2 rounded-[10px] border border-[#242424] break-all select-all">
              https://createfloww.vercel.app/api/oauth/callback
            </code>
            <span className="text-[10px] text-[#7a7a7a] leading-relaxed">
              <strong>Passo obrigatório na Meta:</strong> Adicione seu <code className="text-[#ececec]">@{igUsername || 'username'}</code> em <em>Roles → Instagram Testers</em> e aceite o convite no app do celular (<em>Apps e Sites → Convites de testador</em>). Em seguida, clique em <strong>Conectar com Instagram</strong> acima.
            </span>
          </div>
        </div>

        {/* ========================================= */}
        {/* 4. TIKTOK FOR BUSINESS & CREATOR API      */}
        {/* ========================================= */}
        <div className="p-5 sm:p-6 rounded-[22px] bg-[#161616] border border-[#222222] flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-[#212121] border border-[#2c2c2c] flex items-center justify-center shrink-0">
                <TikTokLogo className="size-4 text-[#ececec]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-[#ececec] text-sm">TikTok Creator & Business</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#212121] text-[#9a9a9a] border border-[#2c2c2c]">
                    Content & Messaging API
                  </span>
                </div>
                <span className="text-[#7a7a7a] text-xs mt-0.5">
                  Publicação direta de vídeos e resposta automática por Direct Message.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium ${
                ttConnected ? 'bg-[#212121] text-[#7ae6a0] border border-[#7ae6a0]/30' : 'bg-[#212121] text-[#8a8a8a] border border-[#2c2c2c]'
              }`}>
                <span className={`size-1.5 rounded-full ${ttConnected ? 'bg-[#7ae6a0] animate-pulse' : 'bg-[#6f6f6f]'}`} />
                {ttConnected ? 'Conectado' : 'Não conectado'}
              </span>
            </div>
          </div>

          {/* TikTok OAuth Action Bar */}
          <div className="p-3.5 rounded-[16px] bg-[#1c1c1c] border border-[#262626] flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#ececec]">
                @{ttUsername || 'gabolonhez'}
              </span>
              <span className="text-[11px] text-[#7a7a7a]">
                {ttConnected
                  ? 'Autorizado via TikTok Login Kit'
                  : 'Aguardando autorização via TikTok Login Kit'}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleConnectTikTokOAuth}
                disabled={isConnectingTikTok}
                className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] transition-all active:scale-[0.97] cursor-pointer disabled:opacity-50"
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
              <label className="text-[11px] font-mono text-[#7a7a7a]">Username do TikTok (@):</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={ttUsername}
                  onChange={(e) => setTtUsername(e.target.value)}
                  placeholder="gabolonhez"
                  className="flex-1 px-3.5 py-2.5 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] placeholder:text-[#6f6f6f] text-xs font-mono focus:outline-none focus:border-[#4a4a4a] transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-[#7a7a7a]">Webhook Endpoint URL (TikTok Developer Portal):</label>
              <div className="flex items-center gap-1.5">
                <code className="flex-1 px-3 py-2.5 rounded-[14px] bg-[#111111] border border-[#242424] text-[10px] font-mono text-[#d0d0d0] truncate">
                  https://createfloww.vercel.app/api/webhook/tiktok
                </code>
                <button
                  type="button"
                  onClick={() => copyToClipboard('https://createfloww.vercel.app/api/webhook/tiktok')}
                  className="p-2.5 rounded-[14px] bg-[#212121] hover:bg-[#2a2a2a] border border-[#2c2c2c] text-[#ececec] font-mono shrink-0 cursor-pointer"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* TikTok Credentials (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-[#7a7a7a]">TikTok Client Key (aba App Details)</label>
              <input
                type="text"
                value={ttClientKey}
                onChange={(e) => setTtClientKey(e.target.value)}
                placeholder="Cole o Client Key do TikTok Developers..."
                className="px-3.5 py-2 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] placeholder:text-[#6f6f6f] text-xs font-mono focus:outline-none focus:border-[#4a4a4a] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-[#7a7a7a]">TikTok Client Secret</label>
              <input
                type="password"
                value={ttClientSecret}
                onChange={(e) => setTtClientSecret(e.target.value)}
                placeholder="Cole o Client Secret do TikTok Developers..."
                className="px-3.5 py-2 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] placeholder:text-[#6f6f6f] text-xs font-mono focus:outline-none focus:border-[#4a4a4a] transition-colors"
              />
            </div>
          </div>

          {/* TikTok Redirect URI Helper */}
          <div className="p-3.5 rounded-[16px] bg-[#1c1c1c] border border-[#262626] flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-[#8a8a8a]">
                URL de Redirecionamento (Cole na aba Login Kit do TikTok Developer Portal):
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard('https://createfloww.vercel.app/api/oauth/tiktok')}
                className="flex items-center gap-1 text-[10px] font-mono text-[#ececec] hover:underline cursor-pointer shrink-0"
              >
                <Copy size={11} />
                <span>{copiedUrl === 'https://createfloww.vercel.app/api/oauth/tiktok' ? 'Copiado!' : 'Copiar URL'}</span>
              </button>
            </div>
            <code className="text-[10px] font-mono text-[#d0d0d0] bg-[#111111] p-2 rounded-[10px] border border-[#242424] break-all select-all">
              https://createfloww.vercel.app/api/oauth/tiktok
            </code>
            <span className="text-[10px] text-[#7a7a7a] leading-relaxed">
              <strong>No TikTok Developer Portal:</strong> Na aba <em>Login Kit</em>, adicione a URL acima em <em>Redirect URI</em> para habilitar o login e permissões.
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
