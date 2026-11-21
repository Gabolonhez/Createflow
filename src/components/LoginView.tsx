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
        const { data, error } = await supabaseClient.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          throw error;
        }

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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-[#ececec] p-4 relative overflow-hidden select-none">
      <div className="relative w-full max-w-[420px] rounded-[26px] bg-[#161616] border border-[#242424] shadow-[0_24px_80px_rgba(0,0,0,0.85)] p-7 md:p-8 flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative size-14 rounded-2xl p-1 bg-[#212121] border border-[#2c2c2c] flex items-center justify-center overflow-hidden shadow-lg">
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
              <h1 className="text-xl font-medium tracking-[-0.03em] text-white">CreateFlow</h1>
              <span className="px-1.5 py-0.5 rounded-[5px] text-[10px] font-mono font-medium bg-[#262626] text-[#a0a0a0]">
                AI OS
              </span>
            </div>
            <p className="text-xs text-[#9a9a9a]">
              Segundo Cérebro &amp; Automação de Conteúdo
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-full bg-[#111111] border border-[#242424] text-[11px] font-mono text-[#9a9a9a] mx-auto">
          <ShieldCheck size={13} className="text-[#7ae6a0]" />
          <span>Área Restrita do Criador</span>
        </div>

        {/* Form Mode Toggle (Pluy Segmented Pill) */}
        <div className="grid grid-cols-2 p-1 rounded-full bg-[#111111] border border-[#242424] text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-full transition-all active:scale-[0.97] ${
              mode === 'signin'
                ? 'bg-[#262626] text-white shadow-sm'
                : 'text-[#8a8a8a] hover:text-[#ececec]'
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
            className={`py-2 rounded-full transition-all active:scale-[0.97] ${
              mode === 'signup'
                ? 'bg-[#262626] text-white shadow-sm'
                : 'text-[#8a8a8a] hover:text-[#ececec]'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#ff5f56]/10 border border-[#ff5f56]/25 text-[#ff8a84] text-xs leading-relaxed animate-in fade-in duration-200">
            <AlertCircle size={15} className="shrink-0 text-[#ff5f56] mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#7ae6a0]/10 border border-[#7ae6a0]/25 text-[#7ae6a0] text-xs leading-relaxed animate-in fade-in duration-200">
            <Sparkles size={15} className="shrink-0 text-[#7ae6a0] mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-[#9a9a9a] flex items-center gap-1.5">
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4e4e4e] transition-all font-sans"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-[#9a9a9a] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock size={12} />
                Senha
              </span>
              <span className="text-[10px] text-[#6f6f6f]">Mínimo 6 caracteres</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4e4e4e] transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6f6f6f] hover:text-[#ececec] transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-full bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] font-medium text-xs shadow-sm transition-all active:scale-[0.97] disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="inline-block size-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Acessar CreateFlow' : 'Criar Conta de Acesso'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center pt-3 border-t border-[#222222]">
          <p className="text-[11px] text-[#6f6f6f] font-mono">
            Protegido por Supabase Auth &amp; Criptografia ponta a ponta
          </p>
        </div>
      </div>
    </div>
  );
}
