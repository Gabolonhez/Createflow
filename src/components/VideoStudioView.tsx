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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-violet-950/30 via-[#0e0e18] to-[#12121e] border border-violet-500/20 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 flex items-center justify-center shadow-inner">
            <Film size={22} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-white tracking-tight">
                Estúdio de Vídeo &amp; Legendas com IA
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                REELS &amp; TIKTOK OS
              </span>
            </div>
            <span className="text-xs text-white/50 mt-0.5">
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
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Upload size={14} className="text-violet-400" />
            <span>Upload do Vídeo</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLibraryOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-white/80 border border-white/[0.08] transition-all cursor-pointer"
          >
            <FolderOpen size={14} className="text-violet-400" />
            <span>Do Acervo</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-400/60 hover:text-emerald-300 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Error Notification */}
      {processingError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400 shrink-0" />
            <span>{processingError}</span>
          </div>
          <button
            type="button"
            onClick={() => setProcessingError(null)}
            className="text-red-400/60 hover:text-red-300 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Studio Grid: Player & Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: 9:16 Video Player with Subtitle Overlay (4 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="relative aspect-[9/16] max-h-[580px] w-full rounded-2xl bg-black border border-white/[0.1] overflow-hidden flex items-center justify-center shadow-2xl mx-auto group">
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

                {/* Subtitle Overlay in Viral Style (Yellow/White font on center-bottom) */}
                {showSubtitlesOnVideo && activeCue && (
                  <div className="absolute bottom-16 inset-x-4 pointer-events-none flex justify-center z-20">
                    <div className="px-3.5 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-center shadow-2xl">
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
                    <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black text-xs uppercase tracking-tight shadow-2xl border-2 border-white text-center">
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
                    <div className="size-16 rounded-full bg-violet-600/80 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play size={24} className="ml-1" />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-white/40">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-violet-400">
                  <Video size={36} />
                </div>
                <span className="text-sm font-semibold text-white/80">
                  Nenhum vídeo carregado
                </span>
                <span className="text-xs text-white/40 max-w-xs">
                  Faça upload do seu arquivo gravado ou selecione um vídeo salvo no seu acervo de mídia.
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md active:scale-[0.98] cursor-pointer"
                >
                  Escolher Vídeo (.mp4)
                </button>
              </div>
            )}
          </div>

          {/* Player Controls Bar */}
          {videoUrl && (
            <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
              <div className="flex items-center justify-between text-xs font-mono text-white/50">
                <span>{currentTime.toFixed(1)}s</span>
                <button
                  type="button"
                  onClick={() => setShowSubtitlesOnVideo(!showSubtitlesOnVideo)}
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold transition-colors ${
                    showSubtitlesOnVideo
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      : 'bg-white/[0.05] text-white/40'
                  }`}
                >
                  Legenda na Tela: {showSubtitlesOnVideo ? 'ON' : 'OFF'}
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
                className="w-full accent-violet-500 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
              />

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => jumpToTime(0)}
                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
                  title="Reiniciar vídeo"
                >
                  <RotateCcw size={14} />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
                </button>

                <span className="text-[11px] font-mono text-white/30">
                  9:16 Vertical
                </span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: AI Processing, Jump-cuts, Subtitles & Multiplatform Copies (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5 min-w-0">
          {/* Action Trigger Card */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-violet-400" />
                Motor Gemini Multimodal (Transcrição &amp; Cortes)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Gemini 2.5 Flash
              </span>
            </div>

            <textarea
              rows={2}
              value={scriptContext}
              onChange={(e) => setScriptContext(e.target.value)}
              placeholder="Instrução ou tema (opcional): Ex: Mostrando como automatizar vídeos com Remotion e terminal..."
              className="w-full p-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 resize-none font-sans"
            />

            <button
              type="button"
              disabled={isProcessing || (!videoFile && !videoUrl)}
              onClick={handleProcessVideo}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/25 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={15} className="animate-spin text-violet-200" />
                  <span>Processando Áudio e Vídeo com Gemini…</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} className="text-violet-200" />
                  <span>{analysis ? 'Reprocessar com IA' : 'Processar Vídeo com IA'}</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Results View */}
          {analysis ? (
            <div className="flex flex-col gap-5 animate-in fade-in">
              {/* 3 Viral Hook Title Options */}
              <div className="p-4 rounded-2xl bg-[#0f0f15] border border-white/[0.08] flex flex-col gap-2.5">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  🔥 Ganchos Recomendados para os Primeiros 3 Segundos
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col justify-between gap-1.5">
                    <span className="text-[10px] font-mono text-violet-400 font-semibold">1. Contraintuitivo</span>
                    <span className="text-xs text-white/90 font-medium">{analysis.hooks.hook1}</span>
                    <button
                      type="button"
                      onClick={() => showCopy('hook1', analysis.hooks.hook1)}
                      className="text-[10px] text-white/40 hover:text-white font-mono flex items-center gap-1 self-end mt-1"
                    >
                      {copiedKey === 'hook1' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      Copiar
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col justify-between gap-1.5">
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">2. Métrica / Resultado</span>
                    <span className="text-xs text-white/90 font-medium">{analysis.hooks.hook2}</span>
                    <button
                      type="button"
                      onClick={() => showCopy('hook2', analysis.hooks.hook2)}
                      className="text-[10px] text-white/40 hover:text-white font-mono flex items-center gap-1 self-end mt-1"
                    >
                      {copiedKey === 'hook2' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      Copiar
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col justify-between gap-1.5">
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold">3. Quebra de Padrão</span>
                    <span className="text-xs text-white/90 font-medium">{analysis.hooks.hook3}</span>
                    <button
                      type="button"
                      onClick={() => showCopy('hook3', analysis.hooks.hook3)}
                      className="text-[10px] text-white/40 hover:text-white font-mono flex items-center gap-1 self-end mt-1"
                    >
                      {copiedKey === 'hook3' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      Copiar
                    </button>
                  </div>
                </div>
              </div>

              {/* Subtitles & Jump-Cuts Timeline */}
              <div className="p-4 rounded-2xl bg-[#0f0f15] border border-white/[0.08] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scissors size={15} className="text-violet-400" />
                    <span className="text-xs font-semibold text-white">
                      Legendas Sincronizadas &amp; Cortes ({analysis.cues.length} falas, {analysis.cuts.length} pausas)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => downloadFile(analysis.srtContent, 'legendas.srt', 'text/plain')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono bg-white/[0.04] hover:bg-white/[0.08] text-white/70 border border-white/[0.06] transition-colors"
                      title="Baixar arquivo SRT de legendas"
                    >
                      <Download size={11} />
                      .SRT
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadFile(analysis.vttContent, 'legendas.vtt', 'text/plain')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono bg-white/[0.04] hover:bg-white/[0.08] text-white/70 border border-white/[0.06] transition-colors"
                      title="Baixar arquivo VTT de legendas"
                    >
                      <Download size={11} />
                      .VTT
                    </button>
                  </div>
                </div>

                {/* Subtitle Cues Scrollable List */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                  {analysis.cues.map((cue) => {
                    const isCurrent = activeCue?.id === cue.id;
                    return (
                      <div
                        key={cue.id}
                        onClick={() => jumpToTime(cue.startSeconds)}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-violet-600/20 border-violet-500/50 text-white font-medium'
                            : 'bg-black/40 border-white/[0.04] text-white/70 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono text-[10px] text-violet-400 shrink-0">
                            {cue.start}
                          </span>
                          <span className="truncate">{cue.text}</span>
                        </div>
                        {cue.highlightWords && cue.highlightWords.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 shrink-0">
                            {cue.highlightWords.join(', ')}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Jump-cut / FFmpeg Recommendation */}
                {analysis.cuts.length > 0 && analysis.ffmpegCutCommand && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
                        <Scissors size={13} /> {analysis.cuts.length} Pausas Detectadas para Jump-Cut
                      </span>
                      <button
                        type="button"
                        onClick={() => showCopy('ffmpeg', analysis.ffmpegCutCommand || '')}
                        className="flex items-center gap-1 text-[10px] font-mono text-amber-300 hover:text-amber-200"
                      >
                        {copiedKey === 'ffmpeg' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        <span>Copiar Comando FFmpeg</span>
                      </button>
                    </div>
                    <code className="text-[10px] font-mono text-white/60 truncate bg-black/40 p-1.5 rounded">
                      {analysis.ffmpegCutCommand}
                    </code>
                  </div>
                )}
              </div>

              {/* Multi-Platform Captions Tab View */}
              <div className="p-4 rounded-2xl bg-[#0f0f15] border border-white/[0.08] flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveCaptionTab('instagram')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activeCaptionTab === 'instagram'
                          ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      <InstagramLogo className="size-3.5" />
                      <span>Instagram Reels</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveCaptionTab('tiktok')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activeCaptionTab === 'tiktok'
                          ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-sm'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      <TikTokLogo className="size-3.5" />
                      <span>TikTok</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveCaptionTab('linkedin')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activeCaptionTab === 'linkedin'
                          ? 'bg-[#0A66C2] text-white shadow-sm'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      <LinkedInLogo className="size-3.5 text-white" />
                      <span>LinkedIn</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveCaptionTab('x')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activeCaptionTab === 'x'
                          ? 'bg-white text-black shadow-sm'
                          : 'text-white/50 hover:text-white'
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
                    className="flex items-center gap-1 text-[11px] font-mono text-white/50 hover:text-white"
                  >
                    {copiedKey === activeCaptionTab ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>Copiar Legenda</span>
                  </button>
                </div>

                {/* Active Caption Details */}
                {activeCaptionTab === 'instagram' && (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-pink-300">
                        ⚡ Gatilho Auto-DM Recomendado: &quot;{analysis.captions.instagram.dmTriggerKeyword}&quot;
                      </span>
                      <span className="text-[10px] font-mono text-white/40">
                        {analysis.captions.instagram.caption.length} caracteres
                      </span>
                    </div>
                    <p className="text-xs text-white/90 whitespace-pre-line leading-relaxed bg-black/40 p-3 rounded-xl border border-white/[0.04]">
                      {analysis.captions.instagram.caption}
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {analysis.captions.instagram.hashtags.map((h, i) => (
                        <span key={i} className="text-[10px] font-mono text-pink-400/80 bg-pink-500/10 px-2 py-0.5 rounded">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeCaptionTab === 'tiktok' && (
                  <div className="flex flex-col gap-2.5">
                    <p className="text-xs text-white/90 whitespace-pre-line leading-relaxed bg-black/40 p-3 rounded-xl border border-white/[0.04]">
                      {analysis.captions.tiktok.caption}
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {analysis.captions.tiktok.hashtags.map((h, i) => (
                        <span key={i} className="text-[10px] font-mono text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeCaptionTab === 'linkedin' && (
                  <div className="flex flex-col gap-2.5">
                    <span className="text-xs font-semibold text-[#70b5f9]">
                      {analysis.captions.linkedin.headline}
                    </span>
                    <p className="text-xs text-white/90 whitespace-pre-line leading-relaxed bg-black/40 p-3 rounded-xl border border-white/[0.04]">
                      {analysis.captions.linkedin.articleText}
                    </p>
                  </div>
                )}

                {activeCaptionTab === 'x' && (
                  <div className="flex flex-col gap-2.5">
                    <p className="text-xs text-white/90 whitespace-pre-line leading-relaxed bg-black/40 p-3 rounded-xl border border-white/[0.04]">
                      {analysis.captions.x.tweetText}
                    </p>
                    {analysis.captions.x.threadFollowUp && (
                      <div className="p-2.5 rounded-lg bg-black/60 border border-white/[0.06] text-xs text-white/70">
                        <span className="text-[10px] font-mono text-violet-400 block mb-0.5">Tweet 2 (Fio):</span>
                        {analysis.captions.x.threadFollowUp}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Final Publishing CTA Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/40 via-purple-950/20 to-black border border-violet-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-violet-400" />
                    Pacote Pronto para Distribuição
                  </span>
                  <span className="text-[11px] text-white/50">
                    Gere o post na fila ou dispare como Reels imediatamente via API da Meta.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isScheduling}
                    onClick={() => handleCreateAndSchedulePost(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/[0.1] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CalendarClock size={13} className="text-violet-400" />
                    <span>Agendar no Próximo Slot</span>
                  </button>

                  <button
                    type="button"
                    disabled={isPublishingNow}
                    onClick={handlePublishReelsNow}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-lg shadow-pink-600/30 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
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
            <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-white/[0.015] border border-dashed border-white/[0.08] text-center gap-3">
              <div className="p-3 rounded-full bg-violet-600/10 text-violet-400">
                <Sparkles size={24} />
              </div>
              <span className="text-sm font-semibold text-white/80">
                Aguardando processamento com IA
              </span>
              <span className="text-xs text-white/40 max-w-sm">
                Carregue o vídeo ao lado e clique em &quot;Processar Vídeo com IA&quot;. O Gemini extrairá o áudio, gerará as legendas, identificará silêncios e criará as copies de todas as redes.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Media Library Picker Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto p-6 rounded-2xl bg-[#0f0f15] border border-white/[0.1] shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <FolderOpen size={18} className="text-violet-400" />
                <span className="text-sm font-semibold text-white">Escolher Vídeo do Acervo</span>
              </div>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
              >
                ×
              </button>
            </div>

            <MediaLibraryView
              isModalPicker={true}
              onSelectMedia={(url) => handleSelectFromLibrary(url)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
