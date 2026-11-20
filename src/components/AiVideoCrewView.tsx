'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Bot,
  Video,
  CheckCircle2,
  Clock,
  Send,
  Zap,
  Sliders,
  Eye,
  Layers,
  ArrowRight,
  Plus,
  RefreshCw,
  ExternalLink,
  Code2,
  Copy,
  Check,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { InstagramLogo, TikTokLogo, XLogo, LinkedInLogo } from './BrandIcons';
import {
  generateMascotAction,
  generateMascotPoseAction,
  planViralVideoAction,
  reviewVideoCutAction,
  createPostFromCrewJobAction,
} from '@/app/actions';
import {
  VIRAL_TEMPLATES,
  DEFAULT_MASCOTS,
  ViralTemplate,
  MascotProfile,
  MascotPose,
  VideoCrewScene,
  VideoCrewJob,
} from '@/lib/video-crew';

interface AiVideoCrewViewProps {
  onNavigateToPosts?: () => void;
}

export function AiVideoCrewView({ onNavigateToPosts }: AiVideoCrewViewProps) {
  // Crew Bot Active Focus
  const [activeBot, setActiveBot] = useState<'pluy' | 'plume' | 'plot' | 'play' | 'plug'>('plot');

  // Autopilot Control (Pluy Signature: "Autopilot, or your yes at each step")
  const [autopilot, setAutopilot] = useState(false);

  // Mascot Studio State (Plume)
  const [mascots, setMascots] = useState<MascotProfile[]>(DEFAULT_MASCOTS);
  const [selectedMascot, setSelectedMascot] = useState<MascotProfile>(DEFAULT_MASCOTS[0]);
  const [newMascotName, setNewMascotName] = useState('');
  const [newMascotDesc, setNewMascotDesc] = useState('');
  const [newMascotStyle, setNewMascotStyle] = useState<MascotProfile['style']>('modern_sticker');
  const [isDrawingMascot, setIsDrawingMascot] = useState(false);
  const [isGeneratingPose, setIsGeneratingPose] = useState(false);
  const [selectedPose, setSelectedPose] = useState<MascotPose | null>(
    DEFAULT_MASCOTS[0].poses[0] || null
  );

  // Video Production State (Plot)
  const [selectedTemplate, setSelectedTemplate] = useState<ViralTemplate>(VIRAL_TEMPLATES[0]);
  const [videoTopic, setVideoTopic] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [currentJob, setCurrentJob] = useState<VideoCrewJob | null>(null);

  // Playback & Simulation State (Play)
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSceneIdx, setActiveSceneIdx] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);

  // Dispatch / Publishing State (Plug)
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Auto-play scenes timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentJob && currentJob.scenes.length > 0) {
      const scene = currentJob.scenes[activeSceneIdx];
      const durationMs = (scene?.durationSeconds || 3) * 1000;
      timer = setTimeout(() => {
        if (activeSceneIdx < currentJob.scenes.length - 1) {
          setActiveSceneIdx((prev) => prev + 1);
        } else {
          setIsPlaying(false);
          setActiveSceneIdx(0);
        }
      }, durationMs);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, activeSceneIdx, currentJob]);

  // Handler: Create new mascot with Plume Bot
  const handleCreateMascot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMascotName.trim() || !newMascotDesc.trim()) return;
    setIsDrawingMascot(true);
    try {
      const res = await generateMascotAction({
        name: newMascotName.trim(),
        style: newMascotStyle,
        description: newMascotDesc.trim(),
      });
      if (res.mascot) {
        setMascots((prev) => [res.mascot!, ...prev]);
        setSelectedMascot(res.mascot);
        setSelectedPose(res.mascot.poses[0] || null);
        setNewMascotName('');
        setNewMascotDesc('');
      }
    } finally {
      setIsDrawingMascot(false);
    }
  };

  // Handler: Add action pose to mascot
  const handleAddPose = async (action: MascotPose['action'], label: string) => {
    if (!selectedMascot) return;
    setIsGeneratingPose(true);
    try {
      const res = await generateMascotPoseAction({
        mascot: selectedMascot,
        poseName: label,
        action,
      });
      if (res.pose) {
        const updated = {
          ...selectedMascot,
          poses: [...selectedMascot.poses, res.pose],
        };
        setSelectedMascot(updated);
        setSelectedPose(res.pose);
        setMascots((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      }
    } finally {
      setIsGeneratingPose(false);
    }
  };

  // Handler: Plan and script viral video with Plot Bot
  const handlePlanVideo = async () => {
    if (!videoTopic.trim()) return;
    setIsPlanning(true);
    setPublishSuccess(false);
    try {
      const res = await planViralVideoAction({
        topic: videoTopic.trim(),
        templateId: selectedTemplate.id,
        mascot: selectedMascot,
      });

      if (res.plan) {
        const newJob: VideoCrewJob = {
          id: `crew_job_${Date.now()}`,
          title: res.plan.title,
          topic: videoTopic.trim(),
          templateId: selectedTemplate.id,
          mascotId: selectedMascot?.id,
          mascotPoseId: selectedPose?.id,
          mascotImageUrl: selectedPose?.imageUrl || selectedMascot?.baseImageUrl,
          scriptText: res.plan.scriptText,
          hook: res.plan.hook,
          scenes: res.plan.scenes,
          targetPlatforms: ['instagram', 'tiktok', 'youtube'],
          autopilot,
          status: autopilot ? 'ready_to_publish' : 'producing_video',
          created_at: new Date().toISOString(),
        };

        setCurrentJob(newJob);
        setActiveSceneIdx(0);
        setIsPlaying(true);

        // Auto trigger Play Bot quality review
        handleReviewCut(res.plan.hook, res.plan.scenes);

        // Se Autopilot estiver ativado, avança diretamente para Plug
        if (autopilot) {
          setActiveBot('plug');
        } else {
          setActiveBot('play');
        }
      }
    } finally {
      setIsPlanning(false);
    }
  };

  // Handler: Review cut with Play Bot
  const handleReviewCut = async (hook: string, scenes: VideoCrewScene[]) => {
    setIsReviewing(true);
    try {
      const res = await reviewVideoCutAction({ hook, scenes });
      if (res.review && currentJob) {
        setCurrentJob((prev) =>
          prev
            ? {
                ...prev,
                reviewScore: {
                  hookStrength: res.review!.hookStrength,
                  pacingScore: res.review!.pacingScore,
                  verdict: res.review!.verdict,
                },
              }
            : null
        );
      }
    } finally {
      setIsReviewing(false);
    }
  };

  // Handler: Publish with Plug Bot
  const handlePublishJob = async () => {
    if (!currentJob) return;
    setIsPublishing(true);
    try {
      const res = await createPostFromCrewJobAction({
        job: currentJob,
        autoSchedule: !autopilot, // Se não for autopilot, agenda para a fila
      });
      if (res.success) {
        setPublishSuccess(true);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const currentScene = currentJob?.scenes?.[activeSceneIdx] || null;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a] text-zinc-100 overflow-y-auto custom-scrollbar select-none">
      
      {/* 1. TOP CREW NAVIGATION BAR (Pluy Signature .lp-crew) */}
      <div className="sticky top-0 z-40 bg-[#0a0a0ad1] backdrop-blur-[14px] border-b border-[#1f1f1f] px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Bots Strip */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mr-1 hidden sm:inline">
              Equipe IA:
            </span>

            {/* Pluy (Coordinator) */}
            <button
              type="button"
              onClick={() => setActiveBot('pluy')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-[0.97] ${
                activeBot === 'pluy'
                  ? 'bg-[#212121] text-white border border-white/[0.15] shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="size-2 rounded-full bg-[#0c8ce9] animate-pulse" />
              <span className="font-semibold">Pluy</span>
              <span className="text-[10px] font-mono text-zinc-500 hidden md:inline">Coordenação</span>
            </button>

            {/* Plume (Mascots) */}
            <button
              type="button"
              onClick={() => setActiveBot('plume')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-[0.97] ${
                activeBot === 'plume'
                  ? 'bg-[#212121] text-white border border-white/[0.15] shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="size-2 rounded-full bg-pink-500" />
              <span className="font-semibold">Plume</span>
              <span className="text-[10px] font-mono text-zinc-500 hidden md:inline">Mascotes & Poses</span>
            </button>

            {/* Plot (Video Production) */}
            <button
              type="button"
              onClick={() => setActiveBot('plot')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-[0.97] ${
                activeBot === 'plot'
                  ? 'bg-[#212121] text-white border border-white/[0.15] shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="size-2 rounded-full bg-amber-400" />
              <span className="font-semibold">Plot</span>
              <span className="text-[10px] font-mono text-zinc-500 hidden md:inline">Roteiro & Vídeo</span>
            </button>

            {/* Play (Quality Director) */}
            <button
              type="button"
              onClick={() => setActiveBot('play')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-[0.97] ${
                activeBot === 'play'
                  ? 'bg-[#212121] text-white border border-white/[0.15] shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="size-2 rounded-full bg-emerald-400" />
              <span className="font-semibold">Play</span>
              <span className="text-[10px] font-mono text-zinc-500 hidden md:inline">Revisão do Corte</span>
            </button>

            {/* Plug (Publisher) */}
            <button
              type="button"
              onClick={() => setActiveBot('plug')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-[0.97] ${
                activeBot === 'plug'
                  ? 'bg-[#212121] text-white border border-white/[0.15] shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="size-2 rounded-full bg-violet-400" />
              <span className="font-semibold">Plug</span>
              <span className="text-[10px] font-mono text-zinc-500 hidden md:inline">Postagem Direta</span>
            </button>
          </div>

          {/* Autopilot Switch (Pluy Iconic Feature) */}
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <span className="text-xs font-mono text-zinc-400">
              {autopilot ? 'Autopilot Ativado' : 'Aprovação Passo a Passo'}
            </span>
            <button
              type="button"
              onClick={() => setAutopilot(!autopilot)}
              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border ${
                autopilot
                  ? 'bg-[#0c8ce9] border-[#0c8ce9]/60 shadow-lg shadow-[#0c8ce9]/20'
                  : 'bg-[#212121] border-[#383838]'
              }`}
              title={
                autopilot
                  ? 'Pluy gera e posta sem pausar'
                  : 'Pluy pausa e aguarda seu clique em cada etapa'
              }
            >
              <span
                className={`absolute top-0.5 left-0.5 size-4.5 rounded-full bg-white transition-transform ${
                  autopilot ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

        </div>
      </div>

      {/* 2. MAIN CREW WORKSPACE */}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* Hero Banner with Autopilot Philosophy */}
        <div className="p-5 rounded-2xl bg-[#141416] border border-[#1f1f1f] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-gradient-to-tr from-[#0c8ce9]/20 to-cyan-500/20 border border-[#0c8ce9]/30 flex items-center justify-center text-[#0c8ce9] shadow-inner shrink-0">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Video Crew OS — A Equipe de Vídeo de Founders
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0c8ce9]/15 text-[#0c8ce9] border border-[#0c8ce9]/30 font-semibold uppercase">
                  5 Bots Integrados
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {autopilot
                  ? 'Modo Autônomo: Pluy coordena Plume (Mascote), Plot (Roteiro) e Play (Corte) e publica direto nas redes.'
                  : 'Modo Controlado: Os bots desenham, roteirizam e preparam os cortes, mas aguardam seu SIM em cada etapa.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveBot('plume')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#212121] hover:bg-[#282828] text-zinc-200 border border-white/[0.08] transition-all active:scale-[0.97] cursor-pointer"
            >
              Criar Mascote
            </button>
            <button
              type="button"
              onClick={() => setActiveBot('plot')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#0c8ce9] hover:bg-[#0c8ce9]/90 text-white transition-all shadow-md shadow-[#0c8ce9]/25 active:scale-[0.97] cursor-pointer"
            >
              Novo Vídeo Viral (+33 Templates)
            </button>
          </div>
        </div>

        {/* 3. TWO-COLUMN SPLIT: CONTROLS & 9:16 LIVE PLAYER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: ACTIVE BOT COMPUTER (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* BOT 1: PLUY (Maestro & Overview) */}
            {activeBot === 'pluy' && (
              <div className="p-5 rounded-2xl bg-[#141416] border border-[#1f1f1f] space-y-4">
                <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full bg-[#0c8ce9]" />
                    <h2 className="text-sm font-bold text-white font-mono">
                      Computador de Pluy (Coordenação)
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">Status: Operando</span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  Diga o que você quer construir hoje. Pluy distribui o trabalho entre os 4 bots da equipe:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setActiveBot('plume')}
                    className="p-3.5 rounded-xl bg-[#18181c] border border-white/[0.06] hover:border-pink-500/40 transition-all cursor-pointer group space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-pink-400">1. Plume Bot</span>
                      <ArrowRight size={13} className="text-zinc-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Desenha seu mascote de marca com poses consistentes prontas para mover.
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveBot('plot')}
                    className="p-3.5 rounded-xl bg-[#18181c] border border-white/[0.06] hover:border-amber-500/40 transition-all cursor-pointer group space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">2. Plot Bot</span>
                      <ArrowRight size={13} className="text-zinc-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Escolha 1 de 33 formatos virais. Plot escreve o roteiro e desenha as cenas.
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveBot('play')}
                    className="p-3.5 rounded-xl bg-[#18181c] border border-white/[0.06] hover:border-emerald-500/40 transition-all cursor-pointer group space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">3. Play Bot</span>
                      <ArrowRight size={13} className="text-zinc-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Assiste cada corte antes de você. Verifica retenção e legibilidade.
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveBot('plug')}
                    className="p-3.5 rounded-xl bg-[#18181c] border border-white/[0.06] hover:border-violet-500/40 transition-all cursor-pointer group space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-violet-400">4. Plug Bot</span>
                      <ArrowRight size={13} className="text-zinc-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Posta diretamente no Instagram Reels, TikTok, YouTube Shorts e X.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* BOT 2: PLUME (Mascots & Poses Studio) */}
            {activeBot === 'plume' && (
              <div className="p-5 rounded-2xl bg-[#141416] border border-[#1f1f1f] space-y-5">
                <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full bg-pink-500" />
                    <h2 className="text-sm font-bold text-white font-mono">
                      Computador de Plume (Mascotes & Poses)
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {mascots.length} Mascote(s) Salvo(s)
                  </span>
                </div>

                {/* Create Mascot Form */}
                <form onSubmit={handleCreateMascot} className="p-4 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] space-y-3">
                  <span className="text-xs font-semibold text-white block">
                    Criar Novo Mascote Autoral para sua Marca
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-zinc-400">Nome do Mascote</label>
                      <input
                        type="text"
                        value={newMascotName}
                        onChange={(e) => setNewMascotName(e.target.value)}
                        placeholder="Ex: Byte, Orbit, Robô Dev..."
                        className="w-full px-3 py-1.5 rounded-lg bg-[#141416] border border-[#1f1f1f] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#0c8ce9]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-zinc-400">Estilo Artístico</label>
                      <select
                        value={newMascotStyle}
                        onChange={(e) => setNewMascotStyle(e.target.value as any)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#141416] border border-[#1f1f1f] text-xs text-white focus:outline-none"
                      >
                        <option value="modern_sticker">Adesivo 3D Glossy (Estilo Pluy)</option>
                        <option value="isometric_3d">3D Octane / Linear Studio</option>
                        <option value="flat_vector">Vetor Flat Minimalista</option>
                        <option value="cinematic_stickman">Stickman Moderno Tech</option>
                        <option value="paper_cutout">Colagem de Papel Recortado</option>
                        <option value="retro_pixel">Pixel Art 16-bit</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">Descrição Visual</label>
                    <input
                      type="text"
                      value={newMascotDesc}
                      onChange={(e) => setNewMascotDesc(e.target.value)}
                      placeholder="Ex: Pequeno robô roxo com antena de wifi e olhos digitais azuis brilhantes..."
                      className="w-full px-3 py-1.5 rounded-lg bg-[#141416] border border-[#1f1f1f] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#0c8ce9]"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isDrawingMascot || !newMascotName.trim() || !newMascotDesc.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-pink-600 hover:bg-pink-500 text-white shadow-md transition-all active:scale-[0.97] disabled:opacity-40 cursor-pointer"
                    >
                      <Sparkles size={13} className={isDrawingMascot ? 'animate-spin' : ''} />
                      <span>{isDrawingMascot ? 'Plume está desenhando…' : 'Desenhar Mascote com Plume'}</span>
                    </button>
                  </div>
                </form>

                {/* Mascots List & Poses Drawer */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-zinc-300 block">
                    Mascote Ativo & Galeria de Poses
                  </span>

                  <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                    {mascots.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedMascot(m);
                          setSelectedPose(m.poses[0] || null);
                        }}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all shrink-0 active:scale-[0.97] ${
                          selectedMascot?.id === m.id
                            ? 'bg-[#212121] border-[#0c8ce9]'
                            : 'bg-[#18181c] border-[#1f1f1f] hover:border-white/20'
                        }`}
                      >
                        <img
                          src={m.baseImageUrl}
                          alt={m.name}
                          className="size-10 rounded-lg object-cover bg-black/50"
                        />
                        <div className="text-left">
                          <span className="text-xs font-bold text-white block">{m.name}</span>
                          <span className="text-[10px] font-mono text-zinc-500 capitalize">{m.style}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Poses generator */}
                  {selectedMascot && (
                    <div className="p-4 rounded-xl bg-[#18181c] border border-white/[0.06] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">
                          Poses de {selectedMascot.name} ({selectedMascot.poses.length})
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          Clique em uma pose para selecionar
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {selectedMascot.poses.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => setSelectedPose(p)}
                            className={`p-2 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                              selectedPose?.id === p.id
                                ? 'bg-[#0c8ce9]/15 border-[#0c8ce9]'
                                : 'bg-[#141416] border-[#1f1f1f] hover:border-white/20'
                            }`}
                          >
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="size-16 rounded-lg object-contain bg-black/40"
                            />
                            <span className="text-[11px] font-medium text-white truncate max-w-full">
                              {p.name}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Request New Pose Buttons */}
                      <div className="pt-2 border-t border-[#1f1f1f] flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[11px] font-mono text-zinc-400">Pedir nova pose:</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            disabled={isGeneratingPose}
                            onClick={() => handleAddPose('holding_phone', 'Segurando Celular')}
                            className="px-2.5 py-1 rounded bg-[#212121] hover:bg-[#282828] text-white text-[11px] font-medium transition-colors"
                          >
                            + No Celular
                          </button>
                          <button
                            type="button"
                            disabled={isGeneratingPose}
                            onClick={() => handleAddPose('pointing', 'Apontando para Métrica')}
                            className="px-2.5 py-1 rounded bg-[#212121] hover:bg-[#282828] text-white text-[11px] font-medium transition-colors"
                          >
                            + Apontando
                          </button>
                          <button
                            type="button"
                            disabled={isGeneratingPose}
                            onClick={() => handleAddPose('laptop', 'No Laptop')}
                            className="px-2.5 py-1 rounded bg-[#212121] hover:bg-[#282828] text-white text-[11px] font-medium transition-colors"
                          >
                            + No Laptop
                          </button>
                          <button
                            type="button"
                            disabled={isGeneratingPose}
                            onClick={() => handleAddPose('surprised', 'Expressão Chocada')}
                            className="px-2.5 py-1 rounded bg-[#212121] hover:bg-[#282828] text-white text-[11px] font-medium transition-colors"
                          >
                            + Chocado
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BOT 3: PLOT (Viral Video Producer & 33 Templates) */}
            {activeBot === 'plot' && (
              <div className="p-5 rounded-2xl bg-[#141416] border border-[#1f1f1f] space-y-5">
                <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full bg-amber-400" />
                    <h2 className="text-sm font-bold text-white font-mono">
                      Computador de Plot (Roteiro & Vídeos Virais)
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">
                    33 Formatos Testados
                  </span>
                </div>

                {/* Topic Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white flex items-center justify-between">
                    <span>Sobre o que é seu vídeo?</span>
                    <span className="text-[11px] font-mono text-zinc-500">Plot cuidará do gancho e cortes</span>
                  </label>
                  <textarea
                    rows={2}
                    value={videoTopic}
                    onChange={(e) => setVideoTopic(e.target.value)}
                    placeholder="Ex: Como 1 linha de código nos economizou R$ 80.000 em servidores no mês passado..."
                    className="w-full p-3 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#0c8ce9] resize-none"
                  />
                </div>

                {/* Template Selection Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">
                      Escolha um Formato Viral (Benchmark Pluy):
                    </span>
                    <span className="text-[11px] font-mono text-[#0c8ce9]">
                      {selectedTemplate.viewsBenchmark}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto custom-scrollbar p-1">
                    {VIRAL_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setSelectedTemplate(tpl)}
                        className={`p-3 rounded-xl border text-left transition-all active:scale-[0.98] ${
                          selectedTemplate.id === tpl.id
                            ? 'bg-[#212121] border-[#0c8ce9] shadow-sm'
                            : 'bg-[#18181c] border-[#1f1f1f] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white truncate max-w-[180px]">
                            {tpl.name}
                          </span>
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                            {tpl.viewsBenchmark}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-2">
                          {tpl.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plan Trigger Button */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1f1f1f]">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                    <Clock size={13} className="text-[#0c8ce9]" />
                    <span>Duração média: ~{selectedTemplate.suggestedDuration}s em 9:16 vertical</span>
                  </div>

                  <button
                    type="button"
                    disabled={isPlanning || !videoTopic.trim()}
                    onClick={handlePlanVideo}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#0c8ce9] hover:bg-[#0c8ce9]/90 text-white shadow-lg shadow-[#0c8ce9]/25 transition-all active:scale-[0.97] disabled:opacity-40 cursor-pointer"
                  >
                    <Sparkles size={14} className={isPlanning ? 'animate-spin' : ''} />
                    <span>{isPlanning ? 'Plot está roteirizando…' : 'Plot: Criar Roteiro & Animar'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* BOT 4: PLAY (Director & Cut Reviewer) */}
            {activeBot === 'play' && (
              <div className="p-5 rounded-2xl bg-[#141416] border border-[#1f1f1f] space-y-4">
                <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full bg-emerald-400" />
                    <h2 className="text-sm font-bold text-white font-mono">
                      Computador de Play (Revisão do Corte)
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck size={13} />
                    {currentJob?.reviewScore?.verdict || 'Aguardando corte'}
                  </span>
                </div>

                {currentJob ? (
                  <div className="space-y-4">
                    {/* Score Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-[#18181c] border border-white/[0.06] space-y-1">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                          Força do Gancho (0-3s)
                        </span>
                        <div className="text-xl font-bold font-mono text-emerald-400">
                          {currentJob.reviewScore?.hookStrength || 94}/100
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#18181c] border border-white/[0.06] space-y-1">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                          Ritmo dos Cortes
                        </span>
                        <div className="text-xl font-bold font-mono text-[#0c8ce9]">
                          {currentJob.reviewScore?.pacingScore || 91}/100
                        </div>
                      </div>
                    </div>

                    {/* Hook callout */}
                    <div className="p-3 rounded-xl bg-[#0a0a0a] border border-emerald-500/25 space-y-1">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                        Gancho Aprovado por Play:
                      </span>
                      <p className="text-xs text-white font-medium italic">
                        "{currentJob.hook}"
                      </p>
                    </div>

                    {/* Step by step scenes */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-zinc-300">
                        Cenas Montadas ({currentJob.scenes.length}):
                      </span>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                        {currentJob.scenes.map((s, idx) => (
                          <div
                            key={idx}
                            onClick={() => setActiveSceneIdx(idx)}
                            className={`p-2.5 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-all ${
                              activeSceneIdx === idx
                                ? 'bg-[#212121] border-[#0c8ce9] text-white'
                                : 'bg-[#18181c] border-white/[0.04] text-zinc-400 hover:text-white'
                            }`}
                          >
                            <span className="font-mono text-[11px] text-[#0c8ce9]">
                              Cena #{s.order} ({s.durationSeconds}s)
                            </span>
                            <span className="font-bold text-white truncate max-w-[200px]">
                              {s.onScreenText}
                            </span>
                            <span className="text-[10px] text-zinc-500 capitalize">
                              {s.backgroundStyle.replace('_', ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-[#1f1f1f]">
                      <button
                        type="button"
                        onClick={() => setActiveBot('plug')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-[0.97] cursor-pointer"
                      >
                        <CheckCircle2 size={14} />
                        <span>Aprovar Corte & Ir para Postagem (Plug)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-zinc-500 space-y-2">
                    <Award size={32} className="mx-auto text-zinc-600" />
                    <p className="text-xs">
                      Nenhum corte foi gerado ainda. Selecione um formato no Plot Bot para começar.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* BOT 5: PLUG (Publisher & Direct Social Output) */}
            {activeBot === 'plug' && (
              <div className="p-5 rounded-2xl bg-[#141416] border border-[#1f1f1f] space-y-4">
                <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full bg-violet-400" />
                    <h2 className="text-sm font-bold text-white font-mono">
                      Computador de Plug (Postagem Social)
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">
                    Contas Conectadas no CreateFlow
                  </span>
                </div>

                {publishSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>
                      Vídeo enviado com sucesso para a fila de publicação das redes sociais!
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  <span className="text-xs font-semibold text-white block">
                    Canais de Destino para este Vídeo:
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-[#18181c] border border-white/[0.08] flex items-center gap-2">
                      <InstagramLogo className="size-4 text-pink-400" />
                      <div>
                        <span className="text-xs font-bold text-white block">Reels</span>
                        <span className="text-[10px] font-mono text-emerald-400">Ativo</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#18181c] border border-white/[0.08] flex items-center gap-2">
                      <TikTokLogo className="size-4 text-cyan-400" />
                      <div>
                        <span className="text-xs font-bold text-white block">TikTok</span>
                        <span className="text-[10px] font-mono text-emerald-400">Ativo</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#18181c] border border-white/[0.08] flex items-center gap-2">
                      <XLogo className="size-4 text-white" />
                      <div>
                        <span className="text-xs font-bold text-white block">X Video</span>
                        <span className="text-[10px] font-mono text-emerald-400">Ativo</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#18181c] border border-white/[0.08] flex items-center gap-2">
                      <LinkedInLogo className="size-4 text-[#0A66C2]" />
                      <div>
                        <span className="text-xs font-bold text-white block">LinkedIn</span>
                        <span className="text-[10px] font-mono text-emerald-400">Ativo</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1f1f1f] flex items-center justify-between gap-3">
                    <span className="text-xs text-zinc-400">
                      Disparo imediato ou agendado na fila inteligente de Brasília.
                    </span>

                    <button
                      type="button"
                      disabled={isPublishing || !currentJob}
                      onClick={handlePublishJob}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/25 transition-all active:scale-[0.97] disabled:opacity-40 cursor-pointer"
                    >
                      <Send size={14} className={isPublishing ? 'animate-spin' : ''} />
                      <span>{isPublishing ? 'Plug está postando…' : 'Postar Agora com Plug'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: 9:16 LIVE VIDEO SIMULATOR (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* macOS Window Chrome Container (Pluy Signature) */}
            <div className="rounded-2xl bg-[#141416] border border-[#1f1f1f] overflow-hidden shadow-2xl">
              
              {/* Window bar */}
              <div className="px-4 py-2.5 border-b border-[#1f1f1f] bg-[#0c0c0e] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="size-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="size-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="size-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  9:16 Vertical Cut — {selectedTemplate.name}
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  {isPlaying ? '● AO VIVO' : 'PAUSADO'}
                </span>
              </div>

              {/* 9:16 Canvas Simulator */}
              <div className="relative aspect-[9/16] max-h-[520px] w-full bg-gradient-to-b from-black via-zinc-950 to-[#0a0a0c] overflow-hidden flex flex-col justify-between p-6">
                
                {/* Top Overlay Header */}
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 z-10">
                  <span className="px-2 py-0.5 rounded-md bg-black/60 border border-white/[0.1] text-[10px]">
                    Cena #{currentScene ? currentScene.order : 1}/{currentJob?.scenes?.length || 1}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {currentScene ? `${currentScene.durationSeconds}s` : '3s'}
                  </span>
                </div>

                {/* Center Dynamic Kinetic Caption */}
                <div className="my-auto text-center space-y-3 z-10 px-2">
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-tight drop-shadow-md">
                    {currentScene ? currentScene.onScreenText : currentJob?.hook || 'SEU GANCHO VIRAL AQUI'}
                  </h3>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed drop-shadow">
                    {currentScene?.narration || 'Aguardando o roteiro ser compilado pelo Plot Bot...'}
                  </p>
                </div>

                {/* Bottom Animated Mascot Stage */}
                <div className="flex flex-col items-center justify-end z-10 pt-4">
                  <img
                    src={selectedPose?.imageUrl || selectedMascot?.baseImageUrl}
                    alt={selectedMascot?.name || 'Mascote'}
                    className={`size-28 object-contain drop-shadow-2xl transition-transform duration-300 ${
                      isPlaying ? 'animate-bounce' : ''
                    }`}
                  />
                  <span className="text-[10px] font-mono text-zinc-500 mt-1">
                    {selectedMascot?.name || 'Mascote Ativo'}
                  </span>
                </div>

                {/* Subtle Grid Backdrop */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#383838_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              </div>

              {/* Playback Controls */}
              <div className="p-3.5 border-t border-[#1f1f1f] bg-[#0c0c0e] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#212121] hover:bg-[#282828] text-white transition-all active:scale-[0.97]"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isPlaying ? 'Pausar' : 'Reproduzir Cena'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSceneIdx(0);
                      setIsPlaying(true);
                    }}
                    className="p-1.5 rounded-lg bg-[#212121] hover:bg-[#282828] text-zinc-300 hover:text-white transition-colors"
                    title="Reiniciar prévia"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
