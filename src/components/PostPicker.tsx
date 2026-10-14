'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  Video,
  Check,
  AlertCircle,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';

export interface InstagramPost {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp: string;
}

interface PostPickerProps {
  selectedPostId: string | null;
  onSelect: (post: {
    id: string;
    permalink?: string;
    thumbnail_url?: string;
    caption?: string;
  }) => void;
}

export function PostPicker({ selectedPostId, onSelect }: PostPickerProps) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/instagram/posts?limit=60');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPosts(data.data);
      } else {
        setError(data.error || 'Não foi possível carregar os posts.');
      }
    } catch {
      setError('Erro de conexão ao buscar os posts do Instagram.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = searchQuery.trim()
    ? posts.filter((p) =>
        (p.caption || '').toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : posts;

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-8 rounded-lg bg-white/[0.04] animate-pulse" />
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-white/[0.04] border border-white/[0.06] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-xs text-red-300 font-medium">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
        <p className="text-[11px] text-white/50">
          Certifique-se de que sua conta do Instagram está conectada em Conexões.
        </p>
        <button
          type="button"
          onClick={fetchPosts}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs text-white transition-colors"
        >
          <RefreshCw size={12} />
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center space-y-2">
        <p className="text-xs text-white/60">
          Nenhum post ou Reels encontrado na sua conta do Instagram.
        </p>
        <button
          type="button"
          onClick={fetchPosts}
          className="inline-flex items-center gap-1 px-3 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-xs text-white/80 transition-colors"
        >
          <RefreshCw size={12} /> Atualizar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* Search Bar + Post Count & Refresh */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por legenda..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/60"
          />
        </div>
        <button
          type="button"
          onClick={fetchPosts}
          title="Recarregar posts"
          className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <RefreshCw size={13} />
        </button>
        <span className="text-[11px] font-mono text-white/40 shrink-0">
          {filteredPosts.length} posts
        </span>
      </div>

      {/* Post Thumbnails Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1 custom-scrollbar">
        {filteredPosts.map((post) => {
          const isSelected = selectedPostId === post.id;
          const thumb = post.thumbnail_url || post.media_url;
          const isVideo = post.media_type === 'VIDEO';

          return (
            <button
              key={post.id}
              type="button"
              onClick={() =>
                onSelect({
                  id: post.id,
                  permalink: post.permalink,
                  thumbnail_url: thumb,
                  caption: post.caption,
                })
              }
              onMouseEnter={() => setHoveredId(post.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`group relative aspect-square rounded-lg overflow-hidden border-2 text-left transition-all ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/20'
                  : 'border-white/[0.08] hover:border-white/30'
              }`}
            >
              {thumb ? (
                <img
                  src={thumb}
                  alt={post.caption?.slice(0, 40) || 'Instagram post'}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full bg-[#121217] flex items-center justify-center">
                  <ImageIcon size={18} className="text-white/20" />
                </div>
              )}

              {/* Video/Reel Indicator */}
              {isVideo && (
                <span className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 backdrop-blur-sm text-white/80">
                  <Video size={10} />
                </span>
              )}

              {/* Caption Overlay on Hover */}
              {hoveredId === post.id && post.caption && (
                <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                  <p className="text-[9px] text-white/90 line-clamp-2 leading-tight">
                    {post.caption}
                  </p>
                </div>
              )}

              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute inset-x-0 bottom-0 py-1 bg-indigo-600 text-white flex items-center justify-center gap-1 text-[10px] font-semibold">
                  <Check size={11} />
                  <span>Selecionado</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
