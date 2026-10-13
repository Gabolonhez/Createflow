'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Film,
  Trash2,
  Copy,
  Check,
  Search,
  Plus,
  Loader2,
  FolderOpen,
  Sparkles,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { listMediaAssetsAction, deleteMediaAssetAction, uploadPostImageAction } from '@/app/actions';
import { AiImageModal } from './AiImageModal';
import type { MediaAsset } from '@/types';

interface MediaLibraryViewProps {
  onOpenComposerWithMedia?: (mediaUrl: string) => void;
  onSelectMedia?: (mediaUrl: string) => void;
  isModalPicker?: boolean;
}

export function MediaLibraryView({
  onOpenComposerWithMedia,
  onSelectMedia,
  isModalPicker = false,
}: MediaLibraryViewProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      const res = await listMediaAssetsAction();
      if (res.assets) {
        setAssets(res.assets);
      }
    } catch (err) {
      console.error('Falha ao carregar mídias:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadPostImageAction(formData);
      if (res.error) {
        setUploadError(res.error);
      } else {
        await loadAssets();
      }
    } catch (err: any) {
      setUploadError(err.message || 'Falha ao enviar arquivo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Deseja realmente excluir este arquivo do acervo?')) return;

    setDeletingName(name);
    try {
      const res = await deleteMediaAssetAction(name);
      if (res.success) {
        setAssets((prev) => prev.filter((a) => a.name !== name));
      }
    } catch (err) {
      console.error('Erro ao excluir mídia:', err);
    } finally {
      setDeletingName(null);
    }
  };

  const copyToClipboard = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'image'
        ? asset.type === 'image'
        : asset.type === 'video';

    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalSize = assets.reduce((acc, curr) => acc + (curr.size || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header / Upload Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-violet-600/15 border border-violet-500/25 text-violet-400">
            <FolderOpen size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">Acervo de Mídia & Biblioteca</span>
            <span className="text-xs text-white/50">
              {assets.length} {assets.length === 1 ? 'arquivo salvo' : 'arquivos salvos'} • {formatFileSize(totalSize)} total
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] transition-all cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 size={14} className="animate-spin text-white" />
                <span>Enviando mídia…</span>
              </>
            ) : (
              <>
                <Upload size={14} className="text-violet-400" />
                <span>Upload Arquivo</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition-all shadow-md shadow-violet-600/20 active:scale-[0.98] cursor-pointer"
          >
            <Sparkles size={14} className="text-violet-200" />
            <span>Gerar com IA</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-mono">
          {uploadError}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/40 border border-white/[0.06] self-start">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-white/[0.1] text-white'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            Todos ({assets.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('image')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === 'image'
                ? 'bg-white/[0.1] text-white'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <ImageIcon size={13} />
            Imagens ({assets.filter((a) => a.type === 'image').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('video')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === 'video'
                ? 'bg-white/[0.1] text-white'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <Film size={13} />
            Vídeos ({assets.filter((a) => a.type === 'video').length})
          </button>
        </div>

        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome do arquivo..."
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50 font-mono"
          />
        </div>
      </div>

      {/* Grid of Media Assets */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 gap-3 text-white/40">
          <Loader2 size={24} className="animate-spin text-violet-400" />
          <span className="text-xs font-mono">Carregando acervo de mídia…</span>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-xl bg-white/[0.015] border border-dashed border-white/[0.08] gap-3 text-center">
          <div className="p-3 rounded-full bg-white/[0.03] text-white/40">
            <ImageIcon size={28} />
          </div>
          <span className="text-sm font-semibold text-white/80">
            {searchQuery ? 'Nenhuma mídia encontrada para sua busca.' : 'Seu acervo de mídia está vazio.'}
          </span>
          <span className="text-xs text-white/45 max-w-sm">
            Faça upload de fotos profissionais, capturas de tela de código, gráficos e vídeos para reutilizar em qualquer publicação.
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            <Upload size={13} />
            <span>Enviar Primeiro Arquivo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredAssets.map((asset) => {
            const isVideo = asset.type === 'video';
            const cleanDisplay = asset.name.replace(/^\d+_/, '').replace(/[_-]/g, ' ');

            return (
              <div
                key={asset.name}
                onClick={() => {
                  if (onSelectMedia) {
                    onSelectMedia(asset.url);
                  }
                }}
                className={`group relative flex flex-col rounded-xl bg-[#0f0f15] border border-white/[0.08] hover:border-violet-500/50 transition-all overflow-hidden shadow-sm ${
                  onSelectMedia ? 'cursor-pointer hover:scale-[1.02]' : ''
                }`}
              >
                {/* Media Preview Box */}
                <div className="relative w-full h-36 bg-black/60 overflow-hidden flex items-center justify-center">
                  {isVideo ? (
                    <>
                      <video
                        src={asset.url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                        <span className="p-2 rounded-full bg-black/60 text-white backdrop-blur-sm border border-white/20">
                          <Film size={16} />
                        </span>
                      </div>
                    </>
                  ) : (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  )}

                  {/* Badge */}
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-black/75 border border-white/10 text-white/80 uppercase">
                    {isVideo ? 'VÍDEO' : 'IMG'}
                  </span>
                </div>

                {/* Info & Details */}
                <div className="flex flex-col p-3 gap-2 bg-[#0d0d12]">
                  <span
                    className="text-xs font-semibold text-white/90 truncate"
                    title={asset.name}
                  >
                    {cleanDisplay}
                  </span>

                  <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                    <span>{formatFileSize(asset.size)}</span>
                    <span>{new Date(asset.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex items-center justify-between gap-1 pt-2 border-t border-white/[0.04]">
                    {onSelectMedia ? (
                      <button
                        type="button"
                        onClick={() => onSelectMedia(asset.url)}
                        className="w-full py-1 rounded bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 text-[11px] font-semibold border border-violet-500/30 transition-colors"
                      >
                        Selecionar
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={(e) => copyToClipboard(asset.url, e)}
                          title="Copiar URL pública"
                          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono bg-white/[0.04] hover:bg-white/[0.08] text-white/70 border border-white/[0.06] transition-colors"
                        >
                          {copiedUrl === asset.url ? (
                            <>
                              <Check size={11} className="text-emerald-400" />
                              <span className="text-emerald-400">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1">
                          {onOpenComposerWithMedia && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenComposerWithMedia(asset.url);
                              }}
                              title="Criar post com esta mídia"
                              className="p-1 rounded bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 border border-violet-500/30 transition-colors cursor-pointer"
                            >
                              <Plus size={13} />
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={deletingName === asset.name}
                            onClick={(e) => handleDelete(asset.name, e)}
                            title="Excluir arquivo"
                            className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {deletingName === asset.name ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Image Generation Modal */}
      <AiImageModal
        isOpen={isAiModalOpen}
        onClose={() => {
          setIsAiModalOpen(false);
          loadAssets();
        }}
        onSelectImage={(url) => {
          setIsAiModalOpen(false);
          loadAssets();
          if (onSelectMedia) {
            onSelectMedia(url);
          } else if (onOpenComposerWithMedia) {
            onOpenComposerWithMedia(url);
          }
        }}
      />
    </div>
  );
}
