'use client';

import React, { useState } from 'react';
import {
  Link2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Key,
  Check,
} from 'lucide-react';
import { XLogo, LinkedInLogo } from './BrandIcons';
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

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveConnections({
        x_publish_mode: xMode,
        x_username: xUsername.replace('@', '').trim(),
        x_bearer_token: xToken.trim() || undefined,
        linkedin_publish_mode: liMode,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
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
                  {connections.linkedin_name || 'Gabriel Bolonhez'}
                </span>
                <span className="text-[11px] text-white/45">Perfil Pessoal LinkedIn</span>
              </div>

              <a
                href={linkedInOAuthUrl}
                className="px-2.5 py-1 rounded text-xs font-medium bg-[#0A66C2] hover:bg-[#084e96] text-white transition-colors"
              >
                Conectar OAuth
              </a>
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
      </div>
    </form>
  );
}
