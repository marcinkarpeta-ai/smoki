import { format, addDays, startOfMonth, endOfMonth, isAfter, isBefore, isSameDay, getDay, startOfWeek, endOfWeek, addMonths } from 'date-fns';
import { pl } from 'date-fns/locale';
import type { TrainingSession } from '@/types';

// Tuesday = 2, Thursday = 4
const TRAINING_DAYS = [2, 4];

export function getTrainingSessions(month: Date): TrainingSession[] {
  const sessions: TrainingSession[] = [];
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  
  let current = start;
  
  while (!isAfter(current, end)) {
    const dayOfWeek = getDay(current);
    if (TRAINING_DAYS.includes(dayOfWeek)) {
      sessions.push({
        date: format(current, 'yyyy-MM-dd'),
        dayOfWeek: dayOfWeek === 2 ? 'Wtorek' : 'Czwartek',
      });
    }
    current = addDays(current, 1);
  }
  
  return sessions;
}

export function getTrainingSessionsInRange(startDate: Date, endDate: Date): TrainingSession[] {
  const sessions: TrainingSession[] = [];
  let current = startOfMonth(startDate);
  const end = endOfMonth(endDate);

  while (!isAfter(current, end)) {
    const dayOfWeek = getDay(current);
    if (TRAINING_DAYS.includes(dayOfWeek)) {
      sessions.push({
        date: format(current, 'yyyy-MM-dd'),
        dayOfWeek: dayOfWeek === 2 ? 'Wtorek' : 'Czwartek',
      });
    }
    current = addDays(current, 1);
  }

  return sessions;
}

export function getNextTrainingDate(fromDate: Date = new Date()): string {
  let current = fromDate;
  
  for (let i = 0; i < 7; i++) {
    const dayOfWeek = getDay(current);
    if (TRAINING_DAYS.includes(dayOfWeek)) {
      return format(current, 'yyyy-MM-dd');
    }
    current = addDays(current, 1);
  }
  
  return format(fromDate, 'yyyy-MM-dd');
}

export function formatDatePolish(dateStr: string): string {
  const date = new Date(dateStr);
  return format(date, 'd MMMM yyyy', { locale: pl });
}

export function formatDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr);
  const day = getDay(date);
  return day === 2 ? 'Wtorek' : day === 4 ? 'Czwartek' : format(date, 'EEEE', { locale: pl });
}

export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}

export function formatMonthPolish(monthStr: string): string {
  const date = new Date(monthStr + '-01');
  return format(date, 'LLLL yyyy', { locale: pl });
}

export function isTrainingDay(dateStr: string): boolean {
  const date = new Date(dateStr);
  return TRAINING_DAYS.includes(getDay(date));
}
