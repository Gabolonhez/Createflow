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
  onOpenVideoStudio?: (mediaUrl: string) => void;
  onSelectMedia?: (mediaUrl: string) => void;
  isModalPicker?: boolean;
}

export function MediaLibraryView({
  onOpenComposerWithMedia,
  onOpenVideoStudio,
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-[22px] bg-[#141414] border border-[#242424]">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-[#212121] border border-[#2c2c2c] text-[#ececec] flex items-center justify-center shrink-0">
            <FolderOpen size={17} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-[#ececec]">
              Acervo de Mídia & Biblioteca
            </span>
            <span className="text-xs text-[#7a7a7a]">
              {assets.length} {assets.length === 1 ? 'arquivo salvo' : 'arquivos salvos'} • {formatFileSize(totalSize)} total
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2e2e2e] transition-all active:scale-[0.97] cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 size={14} className="animate-spin text-[#ececec]" />
                <span>Enviando mídia…</span>
              </>
            ) : (
              <>
                <Upload size={13} className="text-[#a0a0a0]" />
                <span>Upload Arquivo</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] transition-all active:scale-[0.97] cursor-pointer"
          >
            <Sparkles size={13} />
            <span>Gerar com IA</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3.5 rounded-[16px] bg-[#ff5f56]/10 border border-[#ff5f56]/25 text-xs text-[#ff5f56] font-mono">
          {uploadError}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-full bg-[#141414] border border-[#242424] self-start">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#212121] text-[#ececec]'
                : 'text-[#8a8a8a] hover:text-[#ececec]'
            }`}
          >
            Todos ({assets.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('image')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              filter === 'image'
                ? 'bg-[#212121] text-[#ececec]'
                : 'text-[#8a8a8a] hover:text-[#ececec]'
            }`}
          >
            <ImageIcon size={13} />
            Imagens ({assets.filter((a) => a.type === 'image').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('video')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              filter === 'video'
                ? 'bg-[#212121] text-[#ececec]'
                : 'text-[#8a8a8a] hover:text-[#ececec]'
            }`}
          >
            <Film size={13} />
            Vídeos ({assets.filter((a) => a.type === 'video').length})
          </button>
        </div>

        <div className="relative">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6f6f6f]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome do arquivo..."
            className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-full bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] placeholder:text-[#6f6f6f] text-xs focus:outline-none focus:border-[#4a4a4a] font-mono transition-colors"
          />
        </div>
      </div>

      {/* Grid of Media Assets */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 gap-3 text-[#7a7a7a]">
          <Loader2 size={24} className="animate-spin text-[#ececec]" />
          <span className="text-xs font-mono">Carregando acervo de mídia…</span>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-[22px] bg-[#141414] border border-dashed border-[#2c2c2c] gap-3 text-center">
          <div className="size-12 rounded-full bg-[#212121] border border-[#2c2c2c] flex items-center justify-center text-[#8a8a8a]">
            <ImageIcon size={22} />
          </div>
          <span className="text-sm font-semibold text-[#ececec]">
            {searchQuery ? 'Nenhuma mídia encontrada para sua busca.' : 'Seu acervo de mídia está vazio.'}
          </span>
          <span className="text-xs text-[#7a7a7a] max-w-sm">
            Faça upload de fotos profissionais, capturas de tela de código, gráficos e vídeos para reutilizar em qualquer publicação.
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] transition-all active:scale-[0.97] cursor-pointer"
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
                className={`group relative flex flex-col rounded-[20px] bg-[#161616] border border-[#222222] hover:border-[#363636] transition-all overflow-hidden ${
                  onSelectMedia ? 'cursor-pointer hover:scale-[1.01]' : ''
                }`}
              >
                {/* Media Preview Box */}
                <div className="relative w-full h-36 bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
                  {isVideo ? (
                    <>
                      <video
                        src={asset.url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                        <span className="p-2 rounded-full bg-[#161616]/85 text-[#ececec] backdrop-blur-sm border border-[#2c2c2c]">
                          <Film size={15} />
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
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-[#111111]/85 border border-[#2c2c2c] text-[#ececec] uppercase">
                    {isVideo ? 'VÍDEO' : 'IMG'}
                  </span>
                </div>

                {/* Info & Details */}
                <div className="flex flex-col p-3.5 gap-2 bg-[#161616]">
                  <span
                    className="text-xs font-semibold text-[#ececec] truncate"
                    title={asset.name}
                  >
                    {cleanDisplay}
                  </span>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#6f6f6f]">
                    <span>{formatFileSize(asset.size)}</span>
                    <span>{new Date(asset.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex items-center justify-between gap-1 pt-2.5 border-t border-[#222222]">
                    {onSelectMedia ? (
                      <button
                        type="button"
                        onClick={() => onSelectMedia(asset.url)}
                        className="w-full py-1.5 rounded-full bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] text-[11px] font-medium transition-all active:scale-[0.97] cursor-pointer"
                      >
                        Selecionar
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={(e) => copyToClipboard(asset.url, e)}
                          title="Copiar URL pública"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#212121] hover:bg-[#2a2a2a] text-[#a0a0a0] hover:text-[#ececec] border border-[#2c2c2c] transition-colors cursor-pointer"
                        >
                          {copiedUrl === asset.url ? (
                            <>
                              <Check size={11} className="text-[#7ae6a0]" />
                              <span className="text-[#7ae6a0]">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1">
                          {isVideo && onOpenVideoStudio && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenVideoStudio(asset.url);
                              }}
                              title="Editar e gerar legendas com IA no Estúdio"
                              className="p-1.5 rounded-full bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] transition-colors cursor-pointer"
                            >
                              <Sparkles size={12} />
                            </button>
                          )}

                          {onOpenComposerWithMedia && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenComposerWithMedia(asset.url);
                              }}
                              title="Criar post com esta mídia"
                              className="p-1.5 rounded-full bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2e2e2e] transition-colors cursor-pointer"
                            >
                              <Plus size={12} />
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={deletingName === asset.name}
                            onClick={(e) => handleDelete(asset.name, e)}
                            title="Excluir arquivo"
                            className="p-1.5 rounded-full bg-[#1c1c1c] hover:bg-[#ff5f56]/15 text-[#8a8a8a] hover:text-[#ff5f56] border border-[#2a2a2a] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {deletingName === asset.name ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Trash2 size={12} />
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
