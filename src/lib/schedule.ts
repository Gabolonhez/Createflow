/**
 * Smart Scheduling & Post Slots Engine
 * Timezone: America/Sao_Paulo (Horário de Brasília, UTC-03:00)
 */

export const DEFAULT_POST_SLOTS: readonly string[] = ['09:00', '14:30', '18:30'];
export const MAX_POST_SLOTS = 8;
export const SP_TIMEZONE = 'America/Sao_Paulo';
const SP_OFFSET = '-03:00';
const DAY_MS = 86_400_000;
/** Margem de 30 minutos em torno de um slot para considerar ocupado */
const HOLD_MS = 30 * 60_000;
/** Quantos dias à frente buscar por vagas livres */
const HORIZON_DAYS = 14;

const SLOT_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Retorna a data no formato YYYY-MM-DD no horário de Brasília */
export function spDay(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: SP_TIMEZONE }).format(date);
}

/** Cria um objeto Date fixado no fuso de Brasília a partir de YYYY-MM-DD e HH:MM */
function at(day: string, hhmm: string): Date {
  return new Date(`${day}T${hhmm}:00${SP_OFFSET}`);
}

export function isValidSlot(value: string): boolean {
  return SLOT_RE.test(value);
}

/** Formata data amigável: "qui, 16/10 às 09:00" */
export function formatScheduleDatePtBr(isoOrDate: string | Date): string {
  const date = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  if (isNaN(date.getTime())) return 'Data não definida';

  const weekday = date.toLocaleDateString('pt-BR', { timeZone: SP_TIMEZONE, weekday: 'short' }).replace('.', '');
  const dayMonth = date.toLocaleDateString('pt-BR', { timeZone: SP_TIMEZONE, day: '2-digit', month: '2-digit' });
  const time = date.toLocaleTimeString('pt-BR', { timeZone: SP_TIMEZONE, hour: '2-digit', minute: '2-digit' });

  return `${weekday}, ${dayMonth} às ${time}`;
}

/**
 * Encontra o próximo horário nobre livre com base nos slots configurados e datas já ocupadas.
 * Se todos os slots nos próximos 14 dias estiverem ocupados, retorna o primeiro slot no 15º dia.
 */
export function nextFreeSlot(
  slots: readonly string[] = DEFAULT_POST_SLOTS,
  takenDates: readonly (string | Date)[] = [],
  after: Date = new Date()
): Date {
  const activeSlots = slots.length > 0 ? [...slots].filter(isValidSlot).sort() : [...DEFAULT_POST_SLOTS];
  const takenMs = takenDates
    .map((d) => (typeof d === 'string' ? new Date(d).getTime() : d.getTime()))
    .filter((ms) => !isNaN(ms));

  for (let d = 0; d <= HORIZON_DAYS; d++) {
    const day = spDay(new Date(after.getTime() + d * DAY_MS));
    for (const slot of activeSlots) {
      const candidateTime = at(day, slot);
      // Pula horários que já passaram
      if (candidateTime.getTime() <= after.getTime()) continue;

      // Verifica se algum post já está agendado perto deste horário (+-30min)
      const isOccupied = takenMs.some((tMs) => Math.abs(tMs - candidateTime.getTime()) < HOLD_MS);
      if (isOccupied) continue;

      return candidateTime;
    }
  }

  // Fallback se todos os slots estiverem tomados: após o horizonte
  const fallbackDay = spDay(new Date(after.getTime() + (HORIZON_DAYS + 1) * DAY_MS));
  return at(fallbackDay, activeSlots[0] || '09:00');
}

/** Adiciona um horário válido na lista (ordenado, sem duplicata, máx 8) */
export function addSlot(slots: string[], value: string): string[] {
  if (!isValidSlot(value) || slots.includes(value) || slots.length >= MAX_POST_SLOTS) {
    return slots;
  }
  return [...slots, value].sort();
}

/** Remove um horário mantendo pelo menos 1 */
export function removeSlot(slots: string[], value: string): string[] {
  if (slots.length <= 1) return slots;
  return slots.filter((s) => s !== value);
}
