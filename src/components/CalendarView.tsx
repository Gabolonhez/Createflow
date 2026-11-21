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
      <div className="flex items-center justify-between p-4 rounded-[20px] bg-[#141414] border border-[#222222]">
        <div className="flex items-center gap-2">
          <CalendarClock size={16} className="text-[#ececec]" />
          <span className="text-xs font-medium text-[#ececec]">
            Semana de {daysOfWeek[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} a{' '}
            {daysOfWeek[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </span>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#101010] border border-[#242424]">
          <button
            type="button"
            onClick={() => setWeekOffset((prev) => prev - 1)}
            className="p-1.5 rounded-full text-[#8a8a8a] hover:text-[#ececec] hover:bg-[#212121] transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset(0)}
            className="px-3 py-1 rounded-full text-xs font-medium text-[#ececec] bg-[#212121] hover:bg-[#2a2a2a] transition-colors"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="p-1.5 rounded-full text-[#8a8a8a] hover:text-[#ececec] hover:bg-[#212121] transition-colors"
          >
            <ChevronRight size={14} />
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
              className={`flex flex-col rounded-[18px] border p-3 min-h-[300px] transition-all ${
                activeToday
                  ? 'bg-[#1a1a1a] border-[#ececec]/40'
                  : past
                  ? 'bg-[#101010] border-[#1f1f1f] calendar-past-hatch'
                  : 'bg-[#141414] border-[#222222]'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#1f1f1f] mb-2">
                <div className="flex flex-col">
                  <span className="text-[11px] font-mono text-[#6f6f6f] uppercase">
                    {dayNames[i]}
                  </span>
                  <span
                    className={`text-sm font-medium font-mono ${
                      activeToday ? 'text-white' : 'text-[#9a9a9a]'
                    }`}
                  >
                    {dayDate.getDate()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenComposerWithDate(dayDate.toISOString())}
                  title="Agendar post neste dia"
                  className="size-6 rounded-full flex items-center justify-center text-[#6f6f6f] hover:text-[#ececec] hover:bg-[#212121] transition-colors"
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
                      className="group flex flex-col p-2.5 rounded-xl bg-[#1c1c1c] hover:bg-[#242424] border border-[#282828] hover:border-[#383838] transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1 text-[10px] font-mono">
                        <span className="text-[#ececec] flex items-center gap-1">
                          <Clock size={10} className="text-[#9a9a9a]" />
                          {timeStr}
                        </span>
                        <div className="flex items-center gap-1">
                          {post.platforms.includes('x') && <XLogo className="size-2.5 text-[#ececec]" />}
                          {post.platforms.includes('linkedin') && (
                            <LinkedInLogo className="size-2.5 text-[#0A66C2]" />
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-[#9a9a9a] line-clamp-2 leading-snug">
                        {post.text}
                      </p>
                    </div>
                  );
                })}

                {dayPosts.length === 0 && (
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-[10px] font-mono text-[#4a4a4a]">Vazio</span>
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
