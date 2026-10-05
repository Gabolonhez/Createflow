'use client';

import React, { useState } from 'react';
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
} from 'lucide-react';
import { XLogo, LinkedInLogo } from './BrandIcons';
import type { CreatorPost } from '@/types';

interface CalendarViewProps {
  posts: CreatorPost[];
  onOpenPost: (post: CreatorPost) => void;
  onOpenComposerWithDate: (dateIso: string) => void;
}

export function CalendarView({
  posts,
  onOpenPost,
  onOpenComposerWithDate,
}: CalendarViewProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  // Generate current week dates
  const today = new Date();
  const currentMonday = new Date(today);
  const day = currentMonday.getDay();
  const diff = currentMonday.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  currentMonday.setDate(diff + weekOffset * 7);

  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentMonday);
    d.setDate(currentMonday.getDate() + i);
    return d;
  });

  const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  // Map scheduled posts to dates
  const getPostsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return posts.filter((p) => {
      if (!p.scheduledFor) return false;
      return p.scheduledFor.startsWith(dateStr);
    });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const check = new Date(date);
    check.setHours(23, 59, 59, 999);
    return check < today;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Week Navigation Header */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.07]">
        <div className="flex items-center gap-2">
          <CalendarClock size={16} className="text-violet-400" />
          <span className="text-xs font-semibold text-white">
            Semana de {daysOfWeek[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} a{' '}
            {daysOfWeek[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setWeekOffset((prev) => prev - 1)}
            className="p-1.5 rounded-md text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset(0)}
            className="px-2.5 py-1 rounded-md text-xs font-medium text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="p-1.5 rounded-md text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* 7 Days Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 min-h-[480px]">
        {daysOfWeek.map((dayDate, i) => {
          const dayPosts = getPostsForDay(dayDate);
          const past = isPast(dayDate);
          const activeToday = isToday(dayDate);

          return (
            <div
              key={i}
              className={`flex flex-col rounded-xl border p-3 min-h-[300px] transition-all ${
                activeToday
                  ? 'bg-violet-500/[0.06] border-violet-500/30 ring-1 ring-violet-500/20'
                  : past
                  ? 'bg-black/40 border-white/[0.04] calendar-past-hatch'
                  : 'bg-white/[0.02] border-white/[0.06]'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.05] mb-2">
                <div className="flex flex-col">
                  <span className="text-[11px] font-mono text-white/40 uppercase">
                    {dayNames[i]}
                  </span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      activeToday ? 'text-violet-300' : 'text-white/80'
                    }`}
                  >
                    {dayDate.getDate()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenComposerWithDate(dayDate.toISOString())}
                  title="Agendar post neste dia"
                  className="size-6 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Scheduled Posts in this day */}
              <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
                {dayPosts.map((post) => {
                  const timeStr = post.scheduledFor
                    ? new Date(post.scheduledFor).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '';

                  return (
                    <div
                      key={post.id}
                      onClick={() => onOpenPost(post)}
                      className="group flex flex-col p-2 rounded-lg bg-[#14141c] hover:bg-[#1a1a24] border border-white/[0.08] hover:border-violet-500/40 transition-all cursor-pointer shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-1 text-[10px] font-mono">
                        <span className="text-violet-300 flex items-center gap-1">
                          <Clock size={10} />
                          {timeStr}
                        </span>
                        <div className="flex items-center gap-1">
                          {post.platforms.includes('x') && <XLogo className="size-2.5 text-white/70" />}
                          {post.platforms.includes('linkedin') && (
                            <LinkedInLogo className="size-2.5 text-[#0A66C2]" />
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-white/80 line-clamp-2 leading-snug">
                        {post.text}
                      </p>
                    </div>
                  );
                })}

                {dayPosts.length === 0 && (
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-[10px] font-mono text-white/20">Vazio</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
