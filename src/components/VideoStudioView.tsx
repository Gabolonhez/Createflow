'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Upload,
  Sparkles,
  Scissors,
  Download,
  Copy,
  Check,
  Play,
  Pause,
  RotateCcw,
  Film,
  Send,
  CalendarClock,
  Layers,
  FileText,
  Loader2,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { InstagramLogo, TikTokLogo, LinkedInLogo, XLogo } from './BrandIcons';
import { processRecordedVideoAction, createPostFromVideoAction, publishPostNowAction } from '@/app/actions';
import { MediaLibraryView } from './MediaLibraryView';
import type { VideoAnalysisResult, VideoSubtitleCue, VideoCutSegment, Platform } from '@/types';

interface VideoStudioViewProps {
  onOpenComposerWithMedia?: (mediaUrl: string) => void;
  onNavigateToPosts?: () => void;
}

export function VideoStudioView({
  onOpenComposerWithMedia,
  onNavigateToPosts,
}: VideoStudioViewProps) {
  // Video source state
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [scriptContext, setScriptContext] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<VideoAnalysisResult | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Playback & Subtitle preview state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [activeCue, setActiveCue] = useState<VideoSubtitleCue | null>(null);
  const [showSubtitlesOnVideo, setShowSubtitlesOnVideo] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Copy feedbacks
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Export / Scheduling state
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    'instagram',
    'tiktok',
    'linkedin',
    'x',
  ]);
  const [isPublishingNow, setIsPublishingNow] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [activeCaptionTab, setActiveCaptionTab] = useState<'instagram' | 'tiktok' | 'linkedin' | 'x'>('instagram');

  const showCopy = (key: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoUrl(objectUrl);
    setAnalysis(null);
    setProcessingError(null);
  };

  const handleSelectFromLibrary = (url: string) => {
    setVideoUrl(url);
    setVideoFile(null);
    setAnalysis(null);
    setProcessingError(null);
    setIsLibraryOpen(false);
  };

  // Video time update and active cue sync
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    if (analysis?.cues) {
      const match = analysis.cues.find(
        (c) => time >= c.startSeconds && time <= c.endSeconds
      );
      setActiveCue(match || null);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const jumpToTime = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    if (!isPlaying) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // AI Video Processing Trigger
  const handleProcessVideo = async () => {
    if (!videoFile && !videoUrl) return;

    setIsProcessing(true);
    setProcessingError(null);
    try {
      const formData = new FormData();
      if (videoFile) {
        formData.append('file', videoFile);
      } else {
        formData.append('mediaUrl', videoUrl);
      }
      formData.append('scriptContext', scriptContext);

      const res = await processRecordedVideoAction(formData);

      if (res.error) {
        setProcessingError(res.error);
      } else if (res.result) {
        setAnalysis(res.result);
        if (res.mediaUrl) {
          setVideoUrl(res.mediaUrl);
        }
      }
    } catch (err: any) {
      setProcessingError(err.message || 'Falha ao processar vídeo com IA.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Direct 1-Click Publishing or Scheduling
  const handleCreateAndSchedulePost = async (autoSchedule: boolean) => {
    if (!videoUrl || !analysis) return;

    setIsScheduling(true);
    try {
      const res = await createPostFromVideoAction({
        videoUrl,
        analysis,
        targetPlatforms: selectedPlatforms,
        autoSchedule,
      });

      if (res.success && res.post) {
        setSuccessBanner(
          autoSchedule
            ? '✓ Vídeo agendado no próximo horário livre com legendas e Auto-DM configurado!'
            : '✓ Rascunho criado com sucesso na Fila de Posts!'
        );
        if (onNavigateToPosts) {
          setTimeout(() => onNavigateToPosts(), 1800);
        }
      } else {
        setProcessingError(res.error || 'Erro ao agendar publicação.');
      }
    } catch (err: any) {
      setProcessingError(err.message || 'Erro ao agendar.');
    } finally {
      setIsScheduling(false);
    }
  };

  const handlePublishReelsNow = async () => {
    if (!videoUrl || !analysis) return;

    setIsPublishingNow(true);
    try {
      // 1. Cria o post
      const createRes = await createPostFromVideoAction({
        videoUrl,
        analysis,
        targetPlatforms: ['instagram'],
        autoSchedule: false,
      });

      if (!createRes.post) {
        throw new Error(createRes.error || 'Falha ao criar registro do post.');
      }

      // 2. Dispara publicação direta no Instagram Reels
      const publishRes = await publishPostNowAction(createRes.post.id);

      if (publishRes.success) {
        setSuccessBanner('🚀 Vídeo publicado como Reels no Instagram com sucesso!');
      } else {
        setProcessingError(
          publishRes.results?.[0]?.error || 'Erro na publicação do Reels via API da Meta.'
        );
      }
    } catch (err: any) {
      setProcessingError(err.message || 'Falha ao publicar Reels.');
    } finally {
      setIsPublishingNow(false);
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-[22px] bg-[#141414] border border-[#242424]">
        <div className="flex items-center gap-3.5">
          <div className="size-10 rounded-full bg-[#212121] border border-[#2c2c2c] text-[#ececec] flex items-center justify-center shrink-0">
            <Film size={18} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-semibold text-[#ececec] tracking-tight">
                Estúdio de Vídeo &amp; Legendas com IA
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#212121] text-[#9a9a9a] border border-[#2e2e2e]">
                REELS &amp; TIKTOK OS
              </span>
            </div>
            <span className="text-xs text-[#7a7a7a] mt-0.5">
              Grave seu vídeo ou tela. A IA transcreve com timestamps, corta pausas, gera legendas virais e programa os posts.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] transition-all cursor-pointer active:scale-[0.97]"
          >
            <Upload size={13} />
            <span>Upload do Vídeo</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLibraryOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2e2e2e] transition-all cursor-pointer active:scale-[0.97]"
          >
            <FolderOpen size={13} className="text-[#a0a0a0]" />
            <span>Do Acervo</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div className="p-4 rounded-[18px] bg-[#7ae6a0]/10 border border-[#7ae6a0]/25 text-[#7ae6a0] text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#7ae6a0] shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="text-[#7ae6a0]/70 hover:text-[#7ae6a0] font-bold cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Error Notification */}
      {processingError && (
        <div className="p-4 rounded-[18px] bg-[#ff5f56]/10 border border-[#ff5f56]/25 text-[#ff5f56] text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-[#ff5f56] shrink-0" />
            <span>{processingError}</span>
          </div>
          <button
            type="button"
            onClick={() => setProcessingError(null)}
            className="text-[#ff5f56]/70 hover:text-[#ff5f56] font-bold cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Studio Grid: Player & Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: 9:16 Video Player with Subtitle Overlay */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="w-full max-w-[340px] mx-auto rounded-[24px] bg-[#0a0a0a] border border-[#262626] overflow-hidden flex flex-col">
            {/* macOS Simulator Chrome Bar */}
            <div className="flex items-center justify-between px-4 h-9 bg-[#141414] border-b border-[#222222] shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#ff5f56]" />
                <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="size-2.5 rounded-full bg-[#27c93f]" />
              </div>
              <span className="text-[10px] font-mono text-[#6f6f6f]">preview 9:16</span>
              <span className="w-8" />
            </div>

            <div className="relative aspect-[9/16] max-h-[540px] w-full bg-[#0a0a0a] overflow-hidden flex items-center justify-center group">
              {videoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-cover"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
                    onEnded={() => setIsPlaying(false)}
                    playsInline
                  />

                  {/* Subtitle Overlay in Viral Style */}
                  {showSubtitlesOnVideo && activeCue && (
                    <div className="absolute bottom-16 inset-x-4 pointer-events-none flex justify-center z-20">
                      <div className="px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-center shadow-2xl">
                        <span className="text-sm font-extrabold uppercase tracking-tight text-white font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                          {activeCue.text.split(' ').map((word, i) => {
                            const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
                            const isHighlighted = activeCue.highlightWords?.some((h) =>
                              h.toLowerCase().includes(cleanWord)
                            );
                            return (
                              <span
                                key={i}
                                className={
                                  isHighlighted
                                    ? 'text-yellow-400 mx-0.5'
                                    : 'text-white mx-0.5'
                                }
                              >
                                {word}
                              </span>
                            );
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Viral Hook Overlay (first 3 seconds) */}
                  {analysis?.hooks?.hook1 && currentTime <= 3.2 && (
                    <div className="absolute top-12 inset-x-4 pointer-events-none flex justify-center z-20 animate-bounce">
                      <div className="px-4 py-2 rounded-xl bg-[#f2f2f2] text-[#0a0a0a] font-black text-xs uppercase tracking-tight shadow-2xl border border-white text-center">
                        ⚡ {analysis.hooks.hook1}
                      </div>
                    </div>
                  )}

                  {/* Play / Pause Center Click Overlay */}
                  <div
                    onClick={togglePlay}
                    className="absolute inset-0 bg-transparent flex items-center justify-center cursor-pointer"
                  >
                    {!isPlaying && (
                      <div className="size-14 rounded-full bg-[#f2f2f2]/95 text-[#0a0a0a] flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform">
                        <Play size={22} className="ml-0.5" />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-[#7a7a7a]">
                  <div className="size-14 rounded-full bg-[#161616] border border-[#262626] text-[#ececec] flex items-center justify-center">
                    <Video size={24} />
                  </div>
                  <span className="text-sm font-semibold text-[#ececec]">
                    Nenhum vídeo carregado
                  </span>
                  <span className="text-xs text-[#7a7a7a] max-w-xs">
                    Faça upload do seu arquivo gravado ou selecione um vídeo salvo no seu acervo de mídia.
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 px-4 py-2 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] transition-all active:scale-[0.97] cursor-pointer"
                  >
                    Escolher Vídeo (.mp4)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Player Controls Bar */}
          {videoUrl && (
            <div className="flex flex-col gap-2.5 p-4 rounded-[20px] bg-[#161616] border border-[#222222] max-w-[340px] w-full mx-auto">
              <div className="flex items-center justify-between text-xs font-mono text-[#7a7a7a]">
                <span>{currentTime.toFixed(1)}s</span>
                <button
                  type="button"
                  onClick={() => setShowSubtitlesOnVideo(!showSubtitlesOnVideo)}
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-medium transition-colors cursor-pointer ${
                    showSubtitlesOnVideo
                      ? 'bg-[#f2f2f2] text-[#0a0a0a]'
                      : 'bg-[#212121] text-[#8a8a8a] border border-[#2c2c2c]'
                  }`}
                >
                  Legenda: {showSubtitlesOnVideo ? 'ON' : 'OFF'}
                </button>
                <span>{videoDuration.toFixed(1)}s</span>
              </div>

              {/* Seek Bar */}
              <input
                type="range"
                min={0}
                max={videoDuration || 100}
                step={0.1}
                value={currentTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (videoRef.current) {
                    videoRef.current.currentTime = val;
                  }
                  setCurrentTime(val);
                }}
                className="w-full accent-[#ececec] cursor-pointer h-1.5 bg-[#2a2a2a] rounded-full appearance-none"
              />

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => jumpToTime(0)}
                  className="p-2 rounded-full text-[#8a8a8a] hover:text-[#ececec] hover:bg-[#212121] transition-colors cursor-pointer"
                  title="Reiniciar vídeo"
                >
                  <RotateCcw size={14} />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="px-4 py-1.5 rounded-full bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.97]"
                >
                  {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
                </button>

                <span className="text-[11px] font-mono text-[#6f6f6f]">
                  9:16
                </span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: AI Processing, Jump-cuts, Subtitles & Multiplatform Copies */}
        <div className="lg:col-span-7 flex flex-col gap-5 min-w-0">
          {/* Action Trigger Card */}
          <div className="p-5 rounded-[22px] bg-[#161616] border border-[#222222] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#ececec] flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#a0a0a0]" />
                Motor Gemini Multimodal (Transcrição &amp; Cortes)
              </span>
              <span className="text-[10px] font-mono text-[#7ae6a0] flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#212121] border border-[#2c2c2c]">
                <span className="size-1.5 rounded-full bg-[#7ae6a0]" />
                Gemini 2.5 Flash
              </span>
            </div>

            <textarea
              rows={2}
              value={scriptContext}
              onChange={(e) => setScriptContext(e.target.value)}
              placeholder="Instrução ou tema (opcional): Ex: Mostrando como automatizar vídeos com Remotion e terminal..."
              className="w-full p-3 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4a4a4a] resize-none font-sans transition-colors"
            />

            <button
              type="button"
              disabled={isProcessing || (!videoFile && !videoUrl)}
              onClick={handleProcessVideo}
              className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] transition-all cursor-pointer disabled:opacity-45 active:scale-[0.97]"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Processando Áudio e Vídeo com Gemini…</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>{analysis ? 'Reprocessar com IA' : 'Processar Vídeo com IA'}</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Results View */}
          {analysis ? (
            <div className="flex flex-col gap-5 animate-in fade-in">
              {/* 3 Viral Hook Title Options */}
              <div className="p-5 rounded-[20px] bg-[#161616] border border-[#222222] flex flex-col gap-3">
                <span className="text-xs font-semibold text-[#ececec] flex items-center gap-1.5">
                  Ganchos Recomendados para os Primeiros 3 Segundos
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3.5 rounded-[14px] bg-[#1c1c1c] border border-[#262626] flex flex-col justify-between gap-2">
                    <span className="text-[10px] font-mono text-[#a0a0a0] font-semibold">1. Contraintuitivo</span>
                    <span className="text-xs text-[#ececec] font-medium leading-relaxed">{analysis.hooks.hook1}</span>
                    <button
                      type="button"
                      onClick={() => showCopy('hook1', analysis.hooks.hook1)}
                      className="text-[10px] text-[#8a8a8a] hover:text-[#ececec] font-mono flex items-center gap-1 self-end mt-1 cursor-pointer"
                    >
                      {copiedKey === 'hook1' ? <Check size={11} className="text-[#7ae6a0]" /> : <Copy size={11} />}
                      Copiar
                    </button>
                  </div>

                  <div className="p-3.5 rounded-[14px] bg-[#1c1c1c] border border-[#262626] flex flex-col justify-between gap-2">
                    <span className="text-[10px] font-mono text-[#7ae6a0] font-semibold">2. Métrica / Resultado</span>
                    <span className="text-xs text-[#ececec] font-medium leading-relaxed">{analysis.hooks.hook2}</span>
                    <button
                      type="button"
                      onClick={() => showCopy('hook2', analysis.hooks.hook2)}
                      className="text-[10px] text-[#8a8a8a] hover:text-[#ececec] font-mono flex items-center gap-1 self-end mt-1 cursor-pointer"
                    >
                      {copiedKey === 'hook2' ? <Check size={11} className="text-[#7ae6a0]" /> : <Copy size={11} />}
                      Copiar
                    </button>
                  </div>

                  <div className="p-3.5 rounded-[14px] bg-[#1c1c1c] border border-[#262626] flex flex-col justify-between gap-2">
                    <span className="text-[10px] font-mono text-[#0c8ce9] font-semibold">3. Quebra de Padrão</span>
                    <span className="text-xs text-[#ececec] font-medium leading-relaxed">{analysis.hooks.hook3}</span>
                    <button
                      type="button"
                      onClick={() => showCopy('hook3', analysis.hooks.hook3)}
                      className="text-[10px] text-[#8a8a8a] hover:text-[#ececec] font-mono flex items-center gap-1 self-end mt-1 cursor-pointer"
                    >
                      {copiedKey === 'hook3' ? <Check size={11} className="text-[#7ae6a0]" /> : <Copy size={11} />}
                      Copiar
                    </button>
                  </div>
                </div>
              </div>

              {/* Subtitles & Jump-Cuts Timeline */}
              <div className="p-5 rounded-[20px] bg-[#161616] border border-[#222222] flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Scissors size={14} className="text-[#a0a0a0]" />
                    <span className="text-xs font-semibold text-[#ececec]">
                      Legendas Sincronizadas &amp; Cortes ({analysis.cues.length} falas, {analysis.cuts.length} pausas)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => downloadFile(analysis.srtContent, 'legendas.srt', 'text/plain')}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-mono bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2c2c2c] transition-colors cursor-pointer"
                      title="Baixar arquivo SRT de legendas"
                    >
                      <Download size={11} />
                      .SRT
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadFile(analysis.vttContent, 'legendas.vtt', 'text/plain')}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-mono bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2c2c2c] transition-colors cursor-pointer"
                      title="Baixar arquivo VTT de legendas"
                    >
                      <Download size={11} />
                      .VTT
                    </button>
                  </div>
                </div>

                {/* Subtitle Cues Scrollable List */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {analysis.cues.map((cue) => {
                    const isCurrent = activeCue?.id === cue.id;
                    return (
                      <div
                        key={cue.id}
                        onClick={() => jumpToTime(cue.startSeconds)}
                        className={`flex items-center justify-between p-2.5 rounded-[12px] border text-xs cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-[#212121] border-[#ececec] text-[#ececec] font-medium'
                            : 'bg-[#1c1c1c] border-[#242424] text-[#9a9a9a] hover:bg-[#212121] hover:text-[#ececec]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono text-[10px] text-[#7ae6a0] shrink-0">
                            {cue.start}
                          </span>
                          <span className="truncate">{cue.text}</span>
                        </div>
                        {cue.highlightWords && cue.highlightWords.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-[#2a2a2a] text-[#ececec] border border-[#363636] shrink-0">
                            {cue.highlightWords.join(', ')}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Jump-cut / FFmpeg Recommendation */}
                {analysis.cuts.length > 0 && analysis.ffmpegCutCommand && (
                  <div className="p-3.5 rounded-[14px] bg-[#1c1c1c] border border-[#ffbd2e]/30 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#ffbd2e] flex items-center gap-1.5">
                        <Scissors size={13} /> {analysis.cuts.length} Pausas Detectadas para Jump-Cut
                      </span>
                      <button
                        type="button"
                        onClick={() => showCopy('ffmpeg', analysis.ffmpegCutCommand || '')}
                        className="flex items-center gap-1 text-[10px] font-mono text-[#ececec] hover:underline cursor-pointer"
                      >
                        {copiedKey === 'ffmpeg' ? <Check size={11} className="text-[#7ae6a0]" /> : <Copy size={11} />}
                        <span>Copiar Comando FFmpeg</span>
                      </button>
                    </div>
                    <code className="text-[10px] font-mono text-[#9a9a9a] truncate bg-[#111111] p-2 rounded-[10px] border border-[#262626]">
                      {analysis.ffmpegCutCommand}
                    </code>
                  </div>
                )}
              </div>

              {/* Multi-Platform Captions Tab View */}
              <div className="p-5 rounded-[20px] bg-[#161616] border border-[#222222] flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#222222] pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-1 p-1 rounded-full bg-[#111111] border border-[#242424] overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setActiveCaptionTab('instagram')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                        activeCaptionTab === 'instagram'
                          ? 'bg-[#212121] text-[#ececec]'
                          : 'text-[#8a8a8a] hover:text-[#ececec]'
                      }`}
                    >
                      <InstagramLogo className="size-3.5" />
                      <span>Instagram Reels</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveCaptionTab('tiktok')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                        activeCaptionTab === 'tiktok'
                          ? 'bg-[#212121] text-[#ececec]'
                          : 'text-[#8a8a8a] hover:text-[#ececec]'
                      }`}
                    >
                      <TikTokLogo className="size-3.5" />
                      <span>TikTok</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveCaptionTab('linkedin')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                        activeCaptionTab === 'linkedin'
                          ? 'bg-[#212121] text-[#ececec]'
                          : 'text-[#8a8a8a] hover:text-[#ececec]'
                      }`}
                    >
                      <LinkedInLogo className="size-3.5" />
                      <span>LinkedIn</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveCaptionTab('x')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                        activeCaptionTab === 'x'
                          ? 'bg-[#212121] text-[#ececec]'
                          : 'text-[#8a8a8a] hover:text-[#ececec]'
                      }`}
                    >
                      <XLogo className="size-3.5" />
                      <span>X</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const text =
                        activeCaptionTab === 'instagram'
                          ? analysis.captions.instagram.caption
                          : activeCaptionTab === 'tiktok'
                          ? analysis.captions.tiktok.caption
                          : activeCaptionTab === 'linkedin'
                          ? analysis.captions.linkedin.articleText
                          : analysis.captions.x.tweetText;
                      showCopy(activeCaptionTab, text);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-mono bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2c2c2c] cursor-pointer transition-colors"
                  >
                    {copiedKey === activeCaptionTab ? <Check size={12} className="text-[#7ae6a0]" /> : <Copy size={12} />}
                    <span>Copiar Legenda</span>
                  </button>
                </div>

                {/* Active Caption Details */}
                {activeCaptionTab === 'instagram' && (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                      <span className="font-semibold text-[#7ae6a0]">
                        Gatilho Auto-DM Recomendado: &quot;{analysis.captions.instagram.dmTriggerKeyword}&quot;
                      </span>
                      <span className="text-[10px] font-mono text-[#6f6f6f]">
                        {analysis.captions.instagram.caption.length} caracteres
                      </span>
                    </div>
                    <p className="text-xs text-[#d8d8d8] whitespace-pre-line leading-relaxed bg-[#1c1c1c] p-3.5 rounded-[14px] border border-[#262626]">
                      {analysis.captions.instagram.caption}
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {analysis.captions.instagram.hashtags.map((h, i) => (
                        <span key={i} className="text-[10px] font-mono text-[#a0a0a0] bg-[#212121] border border-[#2c2c2c] px-2.5 py-0.5 rounded-full">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeCaptionTab === 'tiktok' && (
                  <div className="flex flex-col gap-2.5">
                    <p className="text-xs text-[#d8d8d8] whitespace-pre-line leading-relaxed bg-[#1c1c1c] p-3.5 rounded-[14px] border border-[#262626]">
                      {analysis.captions.tiktok.caption}
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {analysis.captions.tiktok.hashtags.map((h, i) => (
                        <span key={i} className="text-[10px] font-mono text-[#a0a0a0] bg-[#212121] border border-[#2c2c2c] px-2.5 py-0.5 rounded-full">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeCaptionTab === 'linkedin' && (
                  <div className="flex flex-col gap-2.5">
                    <span className="text-xs font-semibold text-[#ececec]">
                      {analysis.captions.linkedin.headline}
                    </span>
                    <p className="text-xs text-[#d8d8d8] whitespace-pre-line leading-relaxed bg-[#1c1c1c] p-3.5 rounded-[14px] border border-[#262626]">
                      {analysis.captions.linkedin.articleText}
                    </p>
                  </div>
                )}

                {activeCaptionTab === 'x' && (
                  <div className="flex flex-col gap-2.5">
                    <p className="text-xs text-[#d8d8d8] whitespace-pre-line leading-relaxed bg-[#1c1c1c] p-3.5 rounded-[14px] border border-[#262626]">
                      {analysis.captions.x.tweetText}
                    </p>
                    {analysis.captions.x.threadFollowUp && (
                      <div className="p-3 rounded-[14px] bg-[#1c1c1c] border border-[#262626] text-xs text-[#9a9a9a]">
                        <span className="text-[10px] font-mono text-[#ececec] block mb-0.5">Tweet 2 (Fio):</span>
                        {analysis.captions.x.threadFollowUp}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Final Publishing CTA Box */}
              <div className="p-5 rounded-[22px] bg-[#141414] border border-[#262626] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#ececec] flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-[#7ae6a0]" />
                    Pacote Pronto para Distribuição
                  </span>
                  <span className="text-[11px] text-[#7a7a7a]">
                    Gere o post na fila ou dispare como Reels imediatamente via API da Meta.
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled={isScheduling}
                    onClick={() => handleCreateAndSchedulePost(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2e2e2e] transition-all cursor-pointer disabled:opacity-50 active:scale-[0.97]"
                  >
                    <CalendarClock size={13} className="text-[#a0a0a0]" />
                    <span>Agendar no Próximo Slot</span>
                  </button>

                  <button
                    type="button"
                    disabled={isPublishingNow}
                    onClick={handlePublishReelsNow}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] transition-all cursor-pointer disabled:opacity-50 active:scale-[0.97]"
                  >
                    {isPublishingNow ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Publicando Reels…</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>Publicar Reels Agora</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 rounded-[22px] bg-[#141414] border border-dashed border-[#2c2c2c] text-center gap-3">
              <div className="size-12 rounded-full bg-[#212121] border border-[#2c2c2c] text-[#ececec] flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <span className="text-sm font-semibold text-[#ececec]">
                Aguardando processamento com IA
              </span>
              <span className="text-xs text-[#7a7a7a] max-w-sm">
                Carregue o vídeo ao lado e clique em &quot;Processar Vídeo com IA&quot;. O Gemini extrairá o áudio, gerará as legendas, identificará silêncios e criará as copies de todas as redes.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Media Library Picker Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-[24px] bg-[#111111] border border-[#262626] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-[#141414] border-b border-[#222222] shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-full bg-[#ff5f56]" />
                  <span className="size-3 rounded-full bg-[#ffbd2e]" />
                  <span className="size-3 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-xs font-mono text-[#8a8a8a] ml-1">Escolher Vídeo do Acervo</span>
              </div>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="size-7 rounded-full flex items-center justify-center bg-[#212121] hover:bg-[#2c2c2c] text-[#9a9a9a] hover:text-[#ececec] transition-colors cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <MediaLibraryView
                isModalPicker={true}
                onSelectMedia={(url) => handleSelectFromLibrary(url)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
