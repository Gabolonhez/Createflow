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
  const [bestTimeSlots, setBestTimeSlots] = useState<string[]>(
    profile.best_time_slots && profile.best_time_slots.length > 0
      ? profile.best_time_slots
      : ['09:00', '14:30', '18:30']
  );
  const [newSlotTime, setNewSlotTime] = useState('11:00');
  const [autoPilotMode, setAutoPilotMode] = useState<'review_first' | 'autonomous'>(
    profile.auto_pilot_mode || 'review_first'
  );
  const [preferredLanguage, setPreferredLanguage] = useState<'pt-BR' | 'en-US'>(
    profile.preferred_language || 'pt-BR'
  );

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
        best_time_slots: bestTimeSlots,
        auto_pilot_mode: autoPilotMode,
        preferred_language: preferredLanguage,
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

  const handleAddSlot = () => {
    if (newSlotTime && !bestTimeSlots.includes(newSlotTime) && bestTimeSlots.length < 8) {
      setBestTimeSlots([...bestTimeSlots, newSlotTime].sort());
    }
  };

  const handleRemoveSlot = (slotToRemove: string) => {
    if (bestTimeSlots.length <= 1) return;
    setBestTimeSlots(bestTimeSlots.filter((s) => s !== slotToRemove));
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      {/* Top Save Bar */}
      <div className="flex items-center justify-between p-4 sm:p-5 rounded-[22px] bg-[#141414]/90 border border-[#242424] sticky top-[72px] z-10 backdrop-blur-[14px] gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-[#212121] border border-[#2c2c2c] flex items-center justify-center text-[#ececec]">
            <Sliders size={14} />
          </div>
          <span className="text-xs font-semibold text-[#ececec]">
            Manual de Voz, Regras & Estilo Autoral
          </span>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] transition-all active:scale-[0.97] disabled:opacity-50 cursor-pointer"
        >
          {savedSuccess ? (
            <>
              <Check size={14} className="text-[#16a34a]" />
              <span>Salvo com sucesso!</span>
            </>
          ) : (
            <span>{isSaving ? 'Salvando…' : 'Salvar alterações'}</span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Identity Info */}
        <div className="flex flex-col gap-4 p-5 rounded-[22px] bg-[#161616] border border-[#222222]">
          <h3 className="text-[11px] font-mono font-semibold text-[#8a8a8a] uppercase tracking-wider">
            1. IDENTIDADE DO CRIADOR
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-[#7a7a7a]">Nome do Autor</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Gabriel Bolonhez"
              className="px-3.5 py-2.5 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] placeholder:text-[#6f6f6f] text-xs focus:outline-none focus:border-[#4a4a4a] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-[#7a7a7a]">Handle no X (Twitter)</label>
            <input
              type="text"
              value={handleX}
              onChange={(e) => setHandleX(e.target.value)}
              placeholder="Ex: @gabolonhez"
              className="px-3.5 py-2.5 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] placeholder:text-[#6f6f6f] text-xs focus:outline-none focus:border-[#4a4a4a] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-[#7a7a7a]">Headline (LinkedIn / Bio Curta)</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Ex: Software Engineer & Tech Founder | Building AI Tools"
              className="px-3.5 py-2.5 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] placeholder:text-[#6f6f6f] text-xs focus:outline-none focus:border-[#4a4a4a] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-[#7a7a7a]">Bio & Contexto Geral do Perfil</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Explique quem você é, o que constrói e sobre o que gosta de falar..."
              className="px-3.5 py-2.5 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] placeholder:text-[#6f6f6f] text-xs focus:outline-none focus:border-[#4a4a4a] resize-none leading-relaxed transition-colors"
            />
          </div>
        </div>

        {/* Tone Traits & Rules */}
        <div className="flex flex-col gap-4 p-5 rounded-[22px] bg-[#161616] border border-[#222222]">
          <h3 className="text-[11px] font-mono font-semibold text-[#8a8a8a] uppercase tracking-wider">
            2. TOM DE VOZ & TRAÇOS AUTORAIS
          </h3>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTrait}
                onChange={(e) => setNewTrait(e.target.value)}
                placeholder="Adicionar traço de tom (ex: Direto, sem rodeios)..."
                className="flex-1 px-3.5 py-2 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] placeholder:text-[#6f6f6f] text-xs focus:outline-none focus:border-[#4a4a4a] transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTrait())}
              />
              <button
                type="button"
                onClick={addTrait}
                className="px-3.5 py-2 rounded-full bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2e2e2e] text-xs font-medium transition-all cursor-pointer"
              >
                Adicionar
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {toneTraits.map((trait, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#212121] text-[#ececec] border border-[#2c2c2c]"
                >
                  <span>{trait}</span>
                  <button
                    type="button"
                    onClick={() => removeTrait(i)}
                    className="text-[#7a7a7a] hover:text-[#ececec] cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#222222]">
            <h4 className="text-xs font-semibold text-[#ff5f56] flex items-center gap-1.5 mb-2">
              <AlertTriangle size={13} />
              Palavras e Expressões Banidas (NUNCA usar)
            </h4>

            <div className="flex items-center gap-2 mb-2.5">
              <input
                type="text"
                value={newForbidden}
                onChange={(e) => setNewForbidden(e.target.value)}
                placeholder="Ex: Mergulhe, Neste artigo vamos desvendar..."
                className="flex-1 px-3.5 py-2 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] placeholder:text-[#6f6f6f] text-xs focus:outline-none focus:border-[#ff5f56]/50 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addForbidden())}
              />
              <button
                type="button"
                onClick={addForbidden}
                className="px-3.5 py-2 rounded-full bg-[#ff5f56]/15 text-[#ff5f56] hover:bg-[#ff5f56]/25 border border-[#ff5f56]/25 text-xs font-medium transition-colors cursor-pointer"
              >
                Banir
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {forbiddenWords.map((word, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#ff5f56]/10 text-[#ff5f56] border border-[#ff5f56]/25"
                >
                  <span>{word}</span>
                  <button
                    type="button"
                    onClick={() => removeForbidden(i)}
                    className="text-[#ff5f56]/70 hover:text-[#ff5f56] cursor-pointer"
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
      <div className="flex flex-col gap-4 p-5 rounded-[22px] bg-[#161616] border border-[#222222]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-[11px] font-mono font-semibold text-[#8a8a8a] uppercase tracking-wider">
              3. AMOSTRAS DE ESCRITA REAL (FEW-SHOT LEARNING)
            </h3>
            <p className="text-xs text-[#7a7a7a] mt-0.5">
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
            className="w-full px-3.5 py-2.5 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] placeholder:text-[#6f6f6f] text-xs focus:outline-none focus:border-[#4a4a4a] resize-none transition-colors"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addSample}
              disabled={!newSample.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2e2e2e] disabled:opacity-40 transition-all cursor-pointer"
            >
              <Plus size={13} />
              <span>Adicionar amostra</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
          {samples.map((sample, i) => (
            <div
              key={i}
              className="relative p-4 rounded-[16px] bg-[#1c1c1c] border border-[#262626] text-xs text-[#d0d0d0] leading-relaxed font-sans flex flex-col justify-between"
            >
              <p className="whitespace-pre-line line-clamp-4 italic">&quot;{sample}&quot;</p>
              <div className="flex justify-end pt-2.5 mt-2.5 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => removeSample(i)}
                  className="text-[#7a7a7a] hover:text-[#ff5f56] text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 size={11} /> Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Post Slots Section */}
      <div className="flex flex-col gap-4 p-5 rounded-[22px] bg-[#161616] border border-[#222222]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[11px] font-mono font-semibold text-[#8a8a8a] uppercase tracking-wider">
                4. FILA COM HORÁRIOS INTELIGENTES (SMART POST SLOTS)
              </h3>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#212121] text-[#ececec] border border-[#2e2e2e] font-medium">
                Auto-Scheduling
              </span>
            </div>
            <p className="text-xs text-[#7a7a7a] mt-0.5">
              Horários nobres fixos em Horário de Brasília (UTC-03:00). Ao aprovar qualquer post sem escolher data/hora manual, a fila ocupará automaticamente o próximo horário livre disponível.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={newSlotTime}
              onChange={(e) => setNewSlotTime(e.target.value)}
              className="px-3.5 py-2 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs font-mono focus:outline-none focus:border-[#4a4a4a]"
            />
            <button
              type="button"
              onClick={handleAddSlot}
              disabled={bestTimeSlots.includes(newSlotTime) || bestTimeSlots.length >= 8}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] disabled:opacity-40 transition-all active:scale-[0.97] cursor-pointer"
            >
              <Plus size={13} />
              <span>Adicionar Horário</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-[#6f6f6f]">
            Fuso: America/Sao_Paulo (UTC-03:00) • Margem de 30 min • Máx 8 horários
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {bestTimeSlots.map((slot) => (
            <div
              key={slot}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#212121] border border-[#2c2c2c] text-[#ececec]"
            >
              <Clock size={12} className="text-[#a0a0a0]" />
              <span className="text-xs font-mono font-semibold">{slot} BRT</span>
              {bestTimeSlots.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSlot(slot)}
                  className="text-[#7a7a7a] hover:text-[#ff5f56] text-xs ml-0.5 transition-colors cursor-pointer"
                  title="Remover horário"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Auto-Pilot Mode Selector */}
        <div className="flex flex-col gap-2.5 pt-4 border-t border-[#222222]">
          <label className="text-[11px] font-mono font-medium text-[#8a8a8a] uppercase tracking-wider">
            Modo de Autonomia da Criação:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label
              className={`flex items-start gap-2.5 p-3.5 rounded-[16px] border cursor-pointer transition-colors ${
                autoPilotMode === 'review_first'
                  ? 'bg-[#212121] border-[#ececec] text-[#ececec]'
                  : 'bg-[#1c1c1c] border-[#262626] text-[#8a8a8a] hover:border-[#363636]'
              }`}
            >
              <input
                type="radio"
                name="autoPilot"
                value="review_first"
                checked={autoPilotMode === 'review_first'}
                onChange={() => setAutoPilotMode('review_first')}
                className="mt-0.5 accent-[#0c8ce9]"
              />
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-[#ececec]">
                  Revisão do Criador (Padrão)
                </span>
                <span className="text-[#7a7a7a] text-[11px] mt-0.5 leading-relaxed">
                  A IA gera rascunhos com base nas suas ideias e referências e os coloca em &quot;Aguardando Aprovação&quot;. Você aprova com 1 clique antes de ir para a fila.
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-2.5 p-3.5 rounded-[16px] border cursor-pointer transition-colors ${
                autoPilotMode === 'autonomous'
                  ? 'bg-[#212121] border-[#0c8ce9] text-[#ececec]'
                  : 'bg-[#1c1c1c] border-[#262626] text-[#8a8a8a] hover:border-[#363636]'
              }`}
            >
              <input
                type="radio"
                name="autoPilot"
                value="autonomous"
                checked={autoPilotMode === 'autonomous'}
                onChange={() => setAutoPilotMode('autonomous')}
                className="mt-0.5 accent-[#0c8ce9]"
              />
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-[#ececec]">
                  Piloto Automático 100% Autônomo
                </span>
                <span className="text-[#7a7a7a] text-[11px] mt-0.5 leading-relaxed">
                  A IA gera os posts e já os agenda automaticamente nos próximos Smart Slots livres. Se as conexões de API estiverem configuradas, posta sem intervenção.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Preferred Language Selector */}
        <div className="flex flex-col gap-2.5 pt-4 border-t border-[#222222]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-[11px] font-mono font-medium text-[#8a8a8a] uppercase tracking-wider">
              Idioma Padrão de Redação da IA:
            </label>
            <span className="text-[11px] font-mono text-[#6f6f6f]">
              (Você pode alternar no gerador ou traduzir qualquer post com 1 clique)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label
              className={`flex items-start gap-2.5 p-3.5 rounded-[16px] border cursor-pointer transition-colors ${
                preferredLanguage === 'pt-BR'
                  ? 'bg-[#212121] border-[#ececec] text-[#ececec]'
                  : 'bg-[#1c1c1c] border-[#262626] text-[#8a8a8a] hover:border-[#363636]'
              }`}
            >
              <input
                type="radio"
                name="preferredLang"
                value="pt-BR"
                checked={preferredLanguage === 'pt-BR'}
                onChange={() => setPreferredLanguage('pt-BR')}
                className="mt-0.5 accent-[#0c8ce9]"
              />
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-[#ececec]">
                  Português do Brasil (Padrão)
                </span>
                <span className="text-[#7a7a7a] text-[11px] mt-0.5 leading-relaxed">
                  Gera todos os posts em português com vocabulário natural do mercado tech brasileiro.
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-2.5 p-3.5 rounded-[16px] border cursor-pointer transition-colors ${
                preferredLanguage === 'en-US'
                  ? 'bg-[#212121] border-[#ececec] text-[#ececec]'
                  : 'bg-[#1c1c1c] border-[#262626] text-[#8a8a8a] hover:border-[#363636]'
              }`}
            >
              <input
                type="radio"
                name="preferredLang"
                value="en-US"
                checked={preferredLanguage === 'en-US'}
                onChange={() => setPreferredLanguage('en-US')}
                className="mt-0.5 accent-[#0c8ce9]"
              />
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-[#ececec]">
                  Inglês (US Tech Operator)
                </span>
                <span className="text-[#7a7a7a] text-[11px] mt-0.5 leading-relaxed">
                  Gera nativamente em inglês no estilo founder / staff engineer do Vale do Silício.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
