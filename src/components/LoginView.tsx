'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { supabaseClient } from '@/lib/supabase-client';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onSuccess: (userEmail: string) => void;
}

export default function LoginView({ onSuccess }: LoginViewProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor, preencha o e-mail e a senha.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('A senha precisa ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('E-mail ou senha incorretos.');
          }
          throw error;
        }

        if (data.user) {
          onSuccess(data.user.email || email);
        }
      } else {
        // Modo Criação de Conta
        const { data, error } = await supabaseClient.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          throw error;
        }

        // Se o Supabase confirmou direto ou gerou sessão
        if (data.session && data.user) {
          onSuccess(data.user.email || email);
        } else if (data.user && !data.session) {
          setSuccessMsg('Conta criada com sucesso! Se a confirmação de e-mail estiver ativa no Supabase, verifique sua caixa de entrada.');
          setMode('signin');
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha na autenticação';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#07070a] text-white p-4 relative overflow-hidden select-none">
      <div className="relative w-full max-w-[420px] rounded-2xl bg-[#0f0f15] border border-zinc-800/80 shadow-2xl p-7 md:p-8 flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative size-14 rounded-2xl p-1 bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shadow-lg">
            <Image
              src="/createflow-logo.png"
              alt="CreateFlow Logo"
              width={56}
              height={56}
              className="rounded-xl object-cover"
              priority
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">CreateFlow</h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/80">
                AI OS
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Segundo Cérebro &amp; Automação de Conteúdo
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-white/60 mx-auto">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>Área Restrita do Criador</span>
        </div>

        {/* Form Mode Toggle */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-white/[0.12] text-white font-semibold shadow-sm'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-white/[0.12] text-white font-semibold shadow-sm'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs leading-relaxed animate-in fade-in duration-200">
            <AlertCircle size={15} className="shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs leading-relaxed animate-in fade-in duration-200">
            <Sparkles size={15} className="shrink-0 text-emerald-400 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-white/50 flex items-center gap-1.5">
              <Mail size={12} />
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu-email@exemplo.com"
              required
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all font-sans"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-white/50 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock size={12} />
                Senha
              </span>
              <span className="text-[10px] text-white/30">Mínimo 6 caracteres</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-black/50 border border-white/[0.08] text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/30 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="inline-block size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Acessar CreateFlow' : 'Criar Conta de Acesso'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center pt-2 border-t border-white/[0.04]">
          <p className="text-[11px] text-white/35 font-mono">
            Protegido por Supabase Auth &amp; Criptografia ponta a ponta
          </p>
        </div>
      </div>
    </div>
  );
}
