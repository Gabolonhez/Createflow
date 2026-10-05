'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Check,
  Plus,
  Trash2,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { XLogo, LinkedInLogo } from './BrandIcons';
import type { VoiceProfile, PostingSlot } from '@/types';

interface VoiceProfileViewProps {
  profile: VoiceProfile;
  onSaveProfile: (profile: Partial<VoiceProfile>) => Promise<void>;
}

const DEFAULT_DAYS = [
  { id: 'monday', label: 'Segunda-feira' },
  { id: 'tuesday', label: 'Terça-feira' },
  { id: 'wednesday', label: 'Quarta-feira' },
  { id: 'thursday', label: 'Quinta-feira' },
  { id: 'friday', label: 'Sexta-feira' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' },
] as const;

export function VoiceProfileView({ profile, onSaveProfile }: VoiceProfileViewProps) {
  const [name, setName] = useState(profile.creator_name || '');
  const [handleX, setHandleX] = useState(profile.handle_x || '');
  const [headline, setHeadline] = useState(profile.headline || '');
  const [bio, setBio] = useState(profile.bio || '');

  // Lists
  const [pillars, setPillars] = useState<string[]>(profile.pillars || []);
  const [newPillar, setNewPillar] = useState('');

  const [toneTraits, setToneTraits] = useState<string[]>(profile.tone_traits || []);
  const [newTrait, setNewTrait] = useState('');

  const [forbiddenWords, setForbiddenWords] = useState<string[]>(profile.forbidden_words || []);
  const [newForbidden, setNewForbidden] = useState('');

  const [samples, setSamples] = useState<string[]>(profile.writing_samples || []);
  const [newSample, setNewSample] = useState('');

  const [slots, setSlots] = useState<PostingSlot[]>(profile.posting_slots || []);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveProfile({
        creator_name: name,
        handle_x: handleX,
        headline,
        bio,
        pillars,
        tone_traits: toneTraits,
        forbidden_words: forbiddenWords,
        writing_samples: samples,
        posting_slots: slots,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const addPillar = () => {
    if (newPillar.trim() && !pillars.includes(newPillar.trim())) {
      setPillars([...pillars, newPillar.trim()]);
      setNewPillar('');
    }
  };

  const removePillar = (p: string) => setPillars(pillars.filter((x) => x !== p));

  const addTrait = () => {
    if (newTrait.trim()) {
      setToneTraits([...toneTraits, newTrait.trim()]);
      setNewTrait('');
    }
  };

  const removeTrait = (idx: number) => setToneTraits(toneTraits.filter((_, i) => i !== idx));

  const addForbidden = () => {
    if (newForbidden.trim()) {
      setForbiddenWords([...forbiddenWords, newForbidden.trim()]);
      setNewForbidden('');
    }
  };

  const removeForbidden = (idx: number) =>
    setForbiddenWords(forbiddenWords.filter((_, i) => i !== idx));

  const addSample = () => {
    if (newSample.trim()) {
      setSamples([...samples, newSample.trim()]);
      setNewSample('');
    }
  };

  const removeSample = (idx: number) => setSamples(samples.filter((_, i) => i !== idx));

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      {/* Top Save Bar */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.025] border border-white/[0.08] sticky top-[72px] z-10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Sliders size={16} className="text-violet-400" />
          <span className="text-xs font-semibold text-white">
            Manual de Voz, Regras & Estilo Autoral
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
              <span>Salvo com sucesso!</span>
            </>
          ) : (
            <span>{isSaving ? 'Salvando…' : 'Salvar alterações'}</span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Identity Info */}
        <div className="flex flex-col gap-4 p-5 rounded-xl bg-[#0f0f15] border border-white/[0.07]">
          <h3 className="text-xs font-mono font-semibold text-white/80 uppercase tracking-wider">
            1. IDENTIDADE DO CRIADOR
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-white/50">Nome do Autor</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Gabriel Bolonhez"
              className="px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-white/50">Handle no X (Twitter)</label>
            <input
              type="text"
              value={handleX}
              onChange={(e) => setHandleX(e.target.value)}
              placeholder="Ex: @gabolonhez"
              className="px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-white/50">Headline (LinkedIn / Bio Curta)</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Ex: Software Engineer & Tech Founder | Building AI Tools"
              className="px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-white/50">Bio & Contexto Geral do Perfil</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Explique quem você é, o que constrói e sobre o que gosta de falar..."
              className="px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Tone Traits & Rules */}
        <div className="flex flex-col gap-4 p-5 rounded-xl bg-[#0f0f15] border border-white/[0.07]">
          <h3 className="text-xs font-mono font-semibold text-white/80 uppercase tracking-wider">
            2. TOM DE VOZ & TRAÇOS AUTORAIS
          </h3>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTrait}
                onChange={(e) => setNewTrait(e.target.value)}
                placeholder="Adicionar traço de tom (ex: Direto, sem rodeios)..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTrait())}
              />
              <button
                type="button"
                onClick={addTrait}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-medium"
              >
                Adicionar
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {toneTraits.map((trait, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20"
                >
                  <span>{trait}</span>
                  <button
                    type="button"
                    onClick={() => removeTrait(i)}
                    className="text-white/40 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.05]">
            <h4 className="text-xs font-semibold text-rose-300 flex items-center gap-1.5 mb-2">
              <AlertTriangle size={13} />
              Palavras e Expressões Banidas (NUNCA usar)
            </h4>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={newForbidden}
                onChange={(e) => setNewForbidden(e.target.value)}
                placeholder="Ex: Mergulhe, Neste artigo vamos desvendar..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-rose-500/50"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addForbidden())}
              />
              <button
                type="button"
                onClick={addForbidden}
                className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 text-xs font-medium"
              >
                Banir
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {forbiddenWords.map((word, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20"
                >
                  <span>{word}</span>
                  <button
                    type="button"
                    onClick={() => removeForbidden(i)}
                    className="text-rose-400/60 hover:text-rose-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Writing Samples Section */}
      <div className="flex flex-col gap-4 p-5 rounded-xl bg-[#0f0f15] border border-white/[0.07]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-xs font-mono font-semibold text-white/80 uppercase tracking-wider">
              3. AMOSTRAS DE ESCRITA REAL (FEW-SHOT LEARNING)
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Cole exemplos de posts que você mesmo escreveu no X ou LinkedIn. A IA usará esses textos como modelo direto de ritmo, tamanho de frase e vocabulário.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <textarea
            rows={2}
            value={newSample}
            onChange={(e) => setNewSample(e.target.value)}
            placeholder="Cole aqui um post real seu que você gostou muito do estilo..."
            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50 resize-none"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addSample}
              disabled={!newSample.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white disabled:opacity-40 transition-all cursor-pointer"
            >
              <Plus size={13} />
              <span>Adicionar amostra</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {samples.map((sample, i) => (
            <div
              key={i}
              className="relative p-3 rounded-lg bg-black/40 border border-white/[0.06] text-xs text-white/80 leading-relaxed font-sans flex flex-col justify-between"
            >
              <p className="whitespace-pre-line line-clamp-4 italic">"{sample}"</p>
              <div className="flex justify-end pt-2 mt-2 border-t border-white/[0.04]">
                <button
                  type="button"
                  onClick={() => removeSample(i)}
                  className="text-white/30 hover:text-rose-400 text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={11} /> Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
