'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Send,
  ShieldCheck,
  Award,
  ArrowRight,
  Sliders,
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

/* Autoral Pluy-style Geometric Bot Icons with || minimal eyes (from trypluy.com screenshots) */
function PluyBotMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12L19 5L15 12L19 19L5 12Z"
        stroke="#ececec"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="#242424"
      />
      <rect x="11.5" y="10.2" width="1.2" height="3.2" rx="0.6" fill="#ececec" />
      <rect x="13.8" y="10.2" width="1.2" height="3.2" rx="0.6" fill="#ececec" />
    </svg>
  );
}

function PlumeBotMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M17.5 4.5C12.5 5 6.5 10.2 6.5 15.5C6.5 18 8.3 19.5 10.8 19.5C15.5 19.5 18.8 13 17.5 4.5Z"
        fill="#ff6db3"
      />
      <rect x="11" y="11" width="1.2" height="3" rx="0.6" fill="#0a0a0a" />
      <rect x="13.5" y="11" width="1.2" height="3" rx="0.6" fill="#0a0a0a" />
    </svg>
  );
}

function PlotBotMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="5.5" width="14" height="13" rx="5" fill="#ff5b69" />
      <rect x="10.5" y="9.8" width="1.3" height="3.4" rx="0.65" fill="#ffffff" />
      <rect x="13.3" y="9.8" width="1.3" height="3.4" rx="0.65" fill="#ffffff" />
    </svg>
  );
}

function PlayBotMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 5.8C6.5 4.6 7.8 3.9 8.8 4.5L18.8 10.7C19.8 11.3 19.8 12.7 18.8 13.3L8.8 19.5C7.8 20.1 6.5 19.4 6.5 18.2V5.8Z"
        fill="#35d0ba"
      />
      <rect x="9.8" y="10" width="1.2" height="3.4" rx="0.6" fill="#0a0a0a" />
      <rect x="12.2" y="10" width="1.2" height="3.4" rx="0.6" fill="#0a0a0a" />
    </svg>
  );
}

function PlugBotMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8.5" y="4" width="2.2" height="4" rx="1" fill="#ff8438" />
      <rect x="13.3" y="4" width="2.2" height="4" rx="1" fill="#ff8438" />
      <path
        d="M6 9C6 7.9 6.9 7 8 7H16C17.1 7 18 7.9 18 9V14C18 17.3 15.3 20 12 20C8.7 20 6 17.3 6 14V9Z"
        fill="#ff8438"
      />
      <rect x="10.2" y="11" width="1.2" height="3" rx="0.6" fill="#0a0a0a" />
      <rect x="12.8" y="11" width="1.2" height="3" rx="0.6" fill="#0a0a0a" />
    </svg>
  );
}

export function AiVideoCrewView({ onNavigateToPosts }: AiVideoCrewViewProps) {
  const [activeBot, setActiveBot] = useState<'pluy' | 'plume' | 'plot' | 'play' | 'plug'>('plot');
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

        handleReviewCut(res.plan.hook, res.plan.scenes);

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

  const handleReviewCut = async (hook: string, scenes: VideoCrewScene[]) => {
    setIsReviewing(true);
    try {
      const res = await reviewVideoCutAction({ hook, scenes });
      if (res.review) {
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

  const handlePublishJob = async () => {
    if (!currentJob) return;
    setIsPublishing(true);
    try {
      const res = await createPostFromCrewJobAction({
        job: currentJob,
        autoSchedule: !autopilot,
      });
      if (res.success) {
        setPublishSuccess(true);
        if (onNavigateToPosts && autopilot) {
          onNavigateToPosts();
        }
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const currentScene = currentJob?.scenes?.[activeSceneIdx] || null;

  const bots = [
    { id: 'pluy' as const, name: 'Pluy', role: 'Coordenação', icon: <PluyBotMark size={16} /> },
    { id: 'plume' as const, name: 'Plume', role: 'Mascotes & Poses', icon: <PlumeBotMark size={16} /> },
    { id: 'plot' as const, name: 'Plot', role: 'Roteiro & Vídeo', icon: <PlotBotMark size={16} /> },
    { id: 'play' as const, name: 'Play', role: 'Revisão', icon: <PlayBotMark size={16} /> },
    { id: 'plug' as const, name: 'Plug', role: 'Postagem', icon: <PlugBotMark size={16} /> },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a] text-[#ececec] overflow-y-auto custom-scrollbar select-none">
      {/* 1. TOP CREW NAVIGATION BAR (Pluy Screenshot 6 Pill Bar) */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/90 backdrop-blur-[14px] border-b border-[#1f1f1f] px-3 sm:px-5 py-2.5 rounded-t-[20px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Bots Pill Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {bots.map((b) => {
              const isSelected = activeBot === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setActiveBot(b.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-[0.97] shrink-0 border ${
                    isSelected
                      ? 'bg-[#212121] border-[#ececec] text-white shadow-sm'
                      : 'bg-[#141414] border-[#262626] text-[#9a9a9a] hover:text-[#ececec] hover:border-[#363636]'
                  }`}
                >
                  {b.icon}
                  <span>{b.name}</span>
                  <span className="text-[10px] font-mono text-[#6f6f6f] hidden md:inline">{b.role}</span>
                </button>
              );
            })}
          </div>

          {/* Autopilot Switch (Pluy Electric Blue #0c8ce9 Exclusivo) */}
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <span className="text-xs font-mono text-[#9a9a9a]">
              Autopilot
            </span>
            <button
              type="button"
              onClick={() => setAutopilot(!autopilot)}
              className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                autopilot ? 'bg-[#0c8ce9]' : 'bg-[#333333]'
              }`}
              title={
                autopilot
                  ? 'Autopilot ligado: gera e envia sem pausar'
                  : 'Autopilot desligado: pausa para seu sim em cada etapa'
              }
            >
              <span
                className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform ${
                  autopilot ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN CREW WORKSPACE */}
      <div className="max-w-7xl w-full mx-auto pt-4 sm:pt-5 space-y-5">
        {/* Minimal Hero Strip (Pluy Style) */}
        <div className="p-4 sm:p-5 rounded-[22px] bg-[#161616] border border-[#222222] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-2xl bg-[#212121] border border-[#2e2e2e] flex items-center justify-center shrink-0">
              <PluyBotMark size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-medium text-[#ececec] tracking-[-0.025em]">
                  A equipe que produz seus vídeos
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-[5px] bg-[#262626] text-[#a0a0a0]">
                  5 Bots • Estilo Pluy
                </span>
              </div>
              <p className="text-xs text-[#8a8a8a] mt-0.5">
                {autopilot
                  ? 'Autopilot ativo: Pluy cria o roteiro, prepara o corte com seu mascote e despacha para publicação.'
                  : 'Modo passo a passo: os bots desenham e montam os cortes, e aguardam seu "Approve" em cada etapa.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveBot('plume')}
              className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2c2c2c] transition-all active:scale-[0.97]"
            >
              Criar Mascote
            </button>
            <button
              type="button"
              onClick={() => setActiveBot('plot')}
              className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] transition-all active:scale-[0.97] shadow-sm"
            >
              Novo Vídeo Viral
            </button>
          </div>
        </div>

        {/* 3. TWO-COLUMN SPLIT: ACTIVE BOT COMPUTER & 9:16 WINDOW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN: ACTIVE BOT COMPUTER (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* BOT 1: PLUY (Maestro & Overview) */}
            {activeBot === 'pluy' && (
              <div className="rounded-[22px] bg-[#161616] border border-[#222222] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1f1f1f] bg-[#121212] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-[#7ae6a0]" />
                    <span className="text-xs font-mono text-[#ececec]">Pluy&apos;s computer</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#6f6f6f]">Coordenação</span>
                </div>

                <div className="p-5 space-y-4">
                  <p className="text-xs text-[#9a9a9a] leading-relaxed">
                    Diga o que você quer publicar hoje. Pluy divide o trabalho entre os 4 bots especializados:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        id: 'plume' as const,
                        icon: <PlumeBotMark size={18} />,
                        title: '1. Plume Bot',
                        desc: 'Desenha seu mascote autoral e gera poses consistentes prontas para cena.',
                      },
                      {
                        id: 'plot' as const,
                        icon: <PlotBotMark size={18} />,
                        title: '2. Plot Bot',
                        desc: 'Roteiriza e monta cenas usando templates virais testados de alta retenção.',
                      },
                      {
                        id: 'play' as const,
                        icon: <PlayBotMark size={18} />,
                        title: '3. Play Bot',
                        desc: 'Assiste cada corte antes de você. Valida ritmo, gancho e legendas.',
                      },
                      {
                        id: 'plug' as const,
                        icon: <PlugBotMark size={18} />,
                        title: '4. Plug Bot',
                        desc: 'Posta diretamente no Instagram Reels, TikTok, LinkedIn e X.',
                      },
                    ].map((card) => (
                      <div
                        key={card.id}
                        onClick={() => setActiveBot(card.id)}
                        className="p-4 rounded-[18px] bg-[#1a1a1a] border border-[#242424] hover:border-[#363636] transition-all cursor-pointer group space-y-2 active:scale-[0.98]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {card.icon}
                            <span className="text-xs font-medium text-[#ececec]">{card.title}</span>
                          </div>
                          <ArrowRight size={13} className="text-[#6f6f6f] group-hover:text-[#ececec] group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-[11px] text-[#8a8a8a] leading-relaxed">{card.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* BOT 2: PLUME (Mascots & Poses Studio) */}
            {activeBot === 'plume' && (
              <div className="rounded-[22px] bg-[#161616] border border-[#222222] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1f1f1f] bg-[#121212] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-[#7ae6a0]" />
                    <span className="text-xs font-mono text-[#ececec]">Plume&apos;s computer</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#6f6f6f]">
                    {mascots.length} mascote(s)
                  </span>
                </div>

                <div className="p-5 space-y-5">
                  <form onSubmit={handleCreateMascot} className="p-4 rounded-[18px] bg-[#111111] border border-[#222222] space-y-3">
                    <span className="text-xs font-medium text-[#ececec] block">
                      Desenhar Novo Mascote no Seu Estilo
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-[#8a8a8a]">Nome do Mascote</label>
                        <input
                          type="text"
                          value={newMascotName}
                          onChange={(e) => setNewMascotName(e.target.value)}
                          placeholder="Ex: Byte, Orbit, Robô Dev..."
                          className="w-full px-3.5 py-2 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-xs text-[#ececec] placeholder-[#6f6f6f] focus:outline-none focus:border-[#4e4e4e]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-[#8a8a8a]">Estilo Artístico</label>
                        <select
                          value={newMascotStyle}
                          onChange={(e) => setNewMascotStyle(e.target.value as MascotProfile['style'])}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-xs text-[#ececec] focus:outline-none focus:border-[#4e4e4e]"
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
                      <label className="text-[11px] font-mono text-[#8a8a8a]">Descrição Visual</label>
                      <input
                        type="text"
                        value={newMascotDesc}
                        onChange={(e) => setNewMascotDesc(e.target.value)}
                        placeholder="Ex: Pequeno cérebro amigável com contorno nítido segurando um celular..."
                        className="w-full px-3.5 py-2 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-xs text-[#ececec] placeholder-[#6f6f6f] focus:outline-none focus:border-[#4e4e4e]"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={isDrawingMascot || !newMascotName.trim() || !newMascotDesc.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] shadow-sm transition-all active:scale-[0.97] disabled:opacity-40 cursor-pointer"
                      >
                        <Sparkles size={13} className={isDrawingMascot ? 'animate-spin' : ''} />
                        <span>{isDrawingMascot ? 'Plume está desenhando…' : 'Desenhar Mascote'}</span>
                      </button>
                    </div>
                  </form>

                  <div className="space-y-3">
                    <span className="text-xs font-medium text-[#9a9a9a] block">
                      Mascote Ativo &amp; Galeria de Poses
                    </span>

                    <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
                      {mascots.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSelectedMascot(m);
                            setSelectedPose(m.poses[0] || null);
                          }}
                          className={`flex items-center gap-2.5 p-2 rounded-[14px] border transition-all shrink-0 active:scale-[0.97] ${
                            selectedMascot?.id === m.id
                              ? 'bg-[#212121] border-[#ececec]/50 text-white'
                              : 'bg-[#1a1a1a] border-[#242424] hover:border-[#363636] text-[#9a9a9a]'
                          }`}
                        >
                          <img
                            src={m.baseImageUrl}
                            alt={m.name}
                            className="size-10 rounded-lg object-cover bg-[#111111]"
                          />
                          <div className="text-left">
                            <span className="text-xs font-medium text-[#ececec] block">{m.name}</span>
                            <span className="text-[10px] font-mono text-[#6f6f6f] capitalize">{m.style.replace('_', ' ')}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {selectedMascot && (
                      <div className="p-4 rounded-[18px] bg-[#1a1a1a] border border-[#242424] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#ececec]">
                            Poses de {selectedMascot.name} ({selectedMascot.poses.length})
                          </span>
                          <span className="text-[10px] font-mono text-[#6f6f6f]">
                            Toque para selecionar
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {selectedMascot.poses.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => setSelectedPose(p)}
                              className={`p-2 rounded-[14px] border flex flex-col items-center gap-2 text-center transition-all cursor-pointer active:scale-[0.97] ${
                                selectedPose?.id === p.id
                                  ? 'bg-[#212121] border-[#ececec]/50'
                                  : 'bg-[#141414] border-[#222222] hover:border-[#333333]'
                              }`}
                            >
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="size-16 rounded-lg object-contain bg-[#0e0e0e]"
                              />
                              <span className="text-[11px] font-medium text-[#ececec] truncate max-w-full">
                                {p.name}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Request New Pose Chips */}
                        <div className="pt-2.5 border-t border-[#242424] flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[11px] font-mono text-[#6f6f6f]">Pedir nova pose:</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {[
                              { action: 'holding_phone' as const, label: 'Segurando Celular', chip: 'No Celular' },
                              { action: 'pointing' as const, label: 'Apontando para Métrica', chip: 'Apontando' },
                              { action: 'laptop' as const, label: 'No Laptop', chip: 'No Laptop' },
                              { action: 'surprised' as const, label: 'Expressão Chocada', chip: 'Chocado' },
                            ].map((item) => (
                              <button
                                key={item.action}
                                type="button"
                                disabled={isGeneratingPose}
                                onClick={() => handleAddPose(item.action, item.label)}
                                className="px-3 py-1 rounded-full bg-[#242424] hover:bg-[#2e2e2e] border border-[#303030] text-[#ececec] text-[11px] font-medium transition-all active:scale-[0.97]"
                              >
                                + {item.chip}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* BOT 3: PLOT (Viral Video Producer & Templates) */}
            {activeBot === 'plot' && (
              <div className="rounded-[22px] bg-[#161616] border border-[#222222] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1f1f1f] bg-[#121212] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-[#7ae6a0]" />
                    <span className="text-xs font-mono text-[#ececec]">Plot&apos;s computer</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#6f6f6f]">
                    Templates Virais
                  </span>
                </div>

                <div className="p-5 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#ececec] flex items-center justify-between">
                      <span>Sobre o que é seu vídeo?</span>
                      <span className="text-[11px] font-mono text-[#6f6f6f]">Plot escreve o gancho e cenas</span>
                    </label>
                    <textarea
                      rows={2}
                      value={videoTopic}
                      onChange={(e) => setVideoTopic(e.target.value)}
                      placeholder="Ex: Rankeando 12 ferramentas de IA que realmente uso todo dia..."
                      className="w-full p-3.5 rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] text-xs text-[#ececec] placeholder-[#6f6f6f] focus:outline-none focus:border-[#4e4e4e] resize-none"
                    />
                  </div>

                  {/* Template Selection Grid */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#9a9a9a]">
                        Escolha um Formato Viral (Benchmark Pluy):
                      </span>
                      <span className="text-[11px] font-mono text-[#7ae6a0]">
                        {selectedTemplate.viewsBenchmark}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                      {VIRAL_TEMPLATES.map((tpl) => {
                        const isSelected = selectedTemplate.id === tpl.id;
                        return (
                          <button
                            key={tpl.id}
                            type="button"
                            onClick={() => setSelectedTemplate(tpl)}
                            className={`p-3.5 rounded-[16px] border text-left transition-all active:scale-[0.98] ${
                              isSelected
                                ? 'bg-[#212121] border-[#ececec]/50 shadow-sm'
                                : 'bg-[#1a1a1a] border-[#242424] hover:border-[#333333]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-xs font-medium text-[#ececec] truncate">
                                {tpl.name}
                              </span>
                              <span className="text-[10px] font-mono text-[#9a9a9a] bg-[#262626] px-1.5 py-0.5 rounded-[5px] shrink-0">
                                {tpl.viewsBenchmark}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#8a8a8a] line-clamp-2">
                              {tpl.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pluy Signature Approval Bar (Approve + Change + Autopilot) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#222222]">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#8a8a8a]">
                      <Clock size={13} className="text-[#9a9a9a]" />
                      <span>Duração: ~{selectedTemplate.suggestedDuration}s (9:16)</span>
                    </div>

                    <button
                      type="button"
                      disabled={isPlanning || !videoTopic.trim()}
                      onClick={handlePlanVideo}
                      className="flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] shadow-sm transition-all active:scale-[0.97] disabled:opacity-40 cursor-pointer"
                    >
                      <Sparkles size={13} className={isPlanning ? 'animate-spin' : ''} />
                      <span>{isPlanning ? 'Plot está criando…' : 'Gerar Roteiro & Cenas'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* BOT 4: PLAY (Director & Cut Reviewer) */}
            {activeBot === 'play' && (
              <div className="rounded-[22px] bg-[#161616] border border-[#222222] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1f1f1f] bg-[#121212] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-[#7ae6a0]" />
                    <span className="text-xs font-mono text-[#ececec]">Play&apos;s computer</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#7ae6a0] flex items-center gap-1">
                    <ShieldCheck size={13} />
                    {isReviewing ? 'Assistindo cortes...' : currentJob?.reviewScore?.verdict || 'Aguardando corte'}
                  </span>
                </div>

                <div className="p-5">
                  {currentJob ? (
                    <div className="space-y-4">
                      {/* Score Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-[16px] bg-[#1a1a1a] border border-[#242424] space-y-1">
                          <span className="text-[10px] font-mono text-[#6f6f6f] uppercase tracking-wider">
                            Força do Gancho (0-3s)
                          </span>
                          <div className="text-xl font-medium tracking-[-0.03em] font-mono text-[#7ae6a0]">
                            {currentJob.reviewScore?.hookStrength || 94}/100
                          </div>
                        </div>
                        <div className="p-3.5 rounded-[16px] bg-[#1a1a1a] border border-[#242424] space-y-1">
                          <span className="text-[10px] font-mono text-[#6f6f6f] uppercase tracking-wider">
                            Ritmo dos Cortes
                          </span>
                          <div className="text-xl font-medium tracking-[-0.03em] font-mono text-[#ececec]">
                            {currentJob.reviewScore?.pacingScore || 91}/100
                          </div>
                        </div>
                      </div>

                      {/* Hook callout */}
                      <div className="p-3.5 rounded-[16px] bg-[#111111] border border-[#242424] space-y-1">
                        <span className="text-[10px] font-mono text-[#7ae6a0] uppercase tracking-wider">
                          Gancho Validado por Play:
                        </span>
                        <p className="text-xs text-[#ececec] italic">
                          &ldquo;{currentJob.hook}&rdquo;
                        </p>
                      </div>

                      {/* Scenes */}
                      <div className="space-y-2">
                        <span className="text-xs font-medium text-[#9a9a9a]">
                          Cenas Montadas ({currentJob.scenes.length}):
                        </span>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                          {currentJob.scenes.map((s, idx) => (
                            <div
                              key={idx}
                              onClick={() => setActiveSceneIdx(idx)}
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                                activeSceneIdx === idx
                                  ? 'bg-[#212121] border-[#ececec]/50 text-white'
                                  : 'bg-[#1a1a1a] border-[#242424] text-[#8a8a8a] hover:text-[#ececec]'
                              }`}
                            >
                              <span className="font-mono text-[11px] text-[#9a9a9a]">
                                #{s.order} ({s.durationSeconds}s)
                              </span>
                              <span className="font-medium text-[#ececec] truncate max-w-[200px]">
                                {s.onScreenText}
                              </span>
                              <span className="text-[10px] text-[#6f6f6f] capitalize">
                                {s.backgroundStyle.replace('_', ' ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pluy Screenshot 6 Bottom Control Strip (Approve + Change + Autopilot status) */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#222222] flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveBot('plug')}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] shadow-sm transition-all active:scale-[0.97]"
                          >
                            <CheckCircle2 size={13} />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveBot('plot')}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2c2c2c] transition-all active:scale-[0.97]"
                          >
                            <Sliders size={12} />
                            <span>Change</span>
                          </button>
                        </div>

                        <span className="text-[11px] font-mono text-[#6f6f6f]">
                          {autopilot ? 'Autopilot ON' : 'Aguardando seu sim'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-[#6f6f6f] space-y-2">
                      <Award size={30} className="mx-auto text-[#4a4a4a]" />
                      <p className="text-xs">
                        Nenhum corte gerado ainda. Selecione um formato no Plot Bot para começar.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BOT 5: PLUG (Publisher & Direct Social Output) */}
            {activeBot === 'plug' && (
              <div className="rounded-[22px] bg-[#161616] border border-[#222222] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1f1f1f] bg-[#121212] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-[#7ae6a0]" />
                    <span className="text-xs font-mono text-[#ececec]">Plug&apos;s computer</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#6f6f6f]">
                    Signed in
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {publishSuccess && (
                    <div className="p-3 rounded-2xl bg-[#7ae6a0]/12 border border-[#7ae6a0]/25 text-[#7ae6a0] text-xs flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      <span>
                        Vídeo enviado com sucesso para a fila de publicação das redes sociais!
                      </span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <span className="text-xs font-medium text-[#ececec] block">
                      Canais Conectados para Publicação:
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3 rounded-[16px] bg-[#1a1a1a] border border-[#242424] flex items-center gap-2">
                        <InstagramLogo className="size-4 text-pink-400" />
                        <div>
                          <span className="text-xs font-medium text-[#ececec] block">Reels</span>
                          <span className="text-[10px] font-mono text-[#7ae6a0]">Signed in</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-[16px] bg-[#1a1a1a] border border-[#242424] flex items-center gap-2">
                        <TikTokLogo className="size-4 text-cyan-400" />
                        <div>
                          <span className="text-xs font-medium text-[#ececec] block">TikTok</span>
                          <span className="text-[10px] font-mono text-[#7ae6a0]">Signed in</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-[16px] bg-[#1a1a1a] border border-[#242424] flex items-center gap-2">
                        <XLogo className="size-4 text-white" />
                        <div>
                          <span className="text-xs font-medium text-[#ececec] block">X Video</span>
                          <span className="text-[10px] font-mono text-[#7ae6a0]">Signed in</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-[16px] bg-[#1a1a1a] border border-[#242424] flex items-center gap-2">
                        <LinkedInLogo className="size-4 text-[#0A66C2]" />
                        <div>
                          <span className="text-xs font-medium text-[#ececec] block">LinkedIn</span>
                          <span className="text-[10px] font-mono text-[#7ae6a0]">Signed in</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-xs text-[#8a8a8a]">
                        Disparo imediato ou agendado na fila inteligente de Brasília.
                      </span>

                      <button
                        type="button"
                        disabled={isPublishing || !currentJob}
                        onClick={handlePublishJob}
                        className="flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] shadow-sm transition-all active:scale-[0.97] disabled:opacity-40 cursor-pointer"
                      >
                        <Send size={13} className={isPublishing ? 'animate-spin' : ''} />
                        <span>{isPublishing ? 'Plug está postando…' : 'Postar Agora com Plug'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: 9:16 LIVE VIDEO SIMULATOR (macOS Window Chrome) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-[24px] bg-[#161616] border border-[#242424] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
              {/* macOS Window bar */}
              <div className="px-4 py-2.5 border-b border-[#1f1f1f] bg-[#121212] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="size-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="size-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="size-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-[11px] font-mono text-[#8a8a8a] truncate max-w-[180px]">
                  9:16 Cut — {selectedTemplate.name}
                </span>
                <span className="text-[10px] font-mono text-[#7ae6a0]">
                  {isPlaying ? '● LIVE' : 'PAUSED'}
                </span>
              </div>

              {/* 9:16 Canvas Simulator */}
              <div className="relative aspect-[9/16] max-h-[520px] w-full bg-[#0a0a0a] overflow-hidden flex flex-col justify-between p-6">
                {/* Top Overlay Header */}
                <div className="flex items-center justify-between text-xs font-mono text-[#8a8a8a] z-10">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#161616]/90 border border-[#262626] text-[10px] text-[#ececec]">
                    Cena #{currentScene ? currentScene.order : 1}/{currentJob?.scenes?.length || 1}
                  </span>
                  <span className="text-[10px] text-[#9a9a9a]">
                    {currentScene ? `${currentScene.durationSeconds}s` : '3s'}
                  </span>
                </div>

                {/* Center Dynamic Kinetic Caption */}
                <div className="my-auto text-center space-y-3 z-10 px-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight leading-tight">
                    {currentScene ? currentScene.onScreenText : currentJob?.hook || 'SEU GANCHO VIRAL AQUI'}
                  </h3>
                  <p className="text-xs text-[#9a9a9a] font-sans leading-relaxed">
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
                  <span className="text-[10px] font-mono text-[#6f6f6f] mt-1">
                    {selectedMascot?.name || 'Mascote Ativo'}
                  </span>
                </div>

                {/* Subtle Grid Backdrop */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#383838_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              </div>

              {/* Playback Controls */}
              <div className="p-3.5 border-t border-[#1f1f1f] bg-[#121212] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2a2a2a] border border-[#2c2c2c] text-[#ececec] transition-all active:scale-[0.97]"
                >
                  {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveSceneIdx(0);
                    setIsPlaying(true);
                  }}
                  className="p-2 rounded-full bg-[#212121] hover:bg-[#2a2a2a] border border-[#2c2c2c] text-[#9a9a9a] hover:text-[#ececec] transition-all active:scale-[0.97]"
                  title="Reiniciar prévia"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
