const oneDayMs = 24 * 60 * 60 * 1000;
const oneWeekMs = 7 * oneDayMs;

export function startOfWeek(date: Date): Date {
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = normalized.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  normalized.setDate(normalized.getDate() + mondayOffset);
  return normalized;
}

export function toIsoDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseIsoDate(isoDate: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  return new Date(year, monthIndex, day);
}

export function formatWeekdayLabel(date: Date): string {
  return new Intl.DateTimeFormat('es-CO', { weekday: 'short' }).format(date);
}

export function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short' }).format(date);
}

export function getWeekDays(baseDate: Date): Date[] {
  const monday = startOfWeek(baseDate);
  return Array.from({ length: 5 }, (_, index) => {
    const nextDate = new Date(monday);
    nextDate.setDate(monday.getDate() + index);
    return nextDate;
  });
}

export function getNextWeek(currentWeekStart: Date): Date {
  const nextWeek = new Date(currentWeekStart);
  nextWeek.setDate(currentWeekStart.getDate() + 7);
  return nextWeek;
}

export function getPrevWeek(currentWeekStart: Date): Date {
  const previousWeek = new Date(currentWeekStart);
  previousWeek.setDate(currentWeekStart.getDate() - 7);
  return previousWeek;
}

export function canNavigateForward(currentWeekStart: Date, maxWeeksForward: number, referenceDate: Date = new Date()): boolean {
  const referenceWeek = startOfWeek(referenceDate);
  const targetWeek = startOfWeek(currentWeekStart);
  const diffWeeks = Math.floor((targetWeek.getTime() - referenceWeek.getTime()) / oneWeekMs);
  return diffWeeks < maxWeeksForward;
}

export function canNavigateBackward(currentWeekStart: Date, referenceDate: Date = new Date()): boolean {
  const referenceWeek = startOfWeek(referenceDate);
  const targetWeek = startOfWeek(currentWeekStart);
  return targetWeek.getTime() > referenceWeek.getTime();
}
