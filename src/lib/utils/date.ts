/**
 * Date Utilities
 * Helper functions voor datum manipulatie
 */

import { addDays, differenceInDays, format, isAfter, isBefore, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';

/**
 * Format date voor display
 */
export function formatDate(date: Date | string, formatStr: string = 'PP'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: nl });
}

/**
 * Format datum als "7 mei 2025"
 */
export function formatDateNL(date: Date | string): string {
  return formatDate(date, 'd MMMM yyyy');
}

/**
 * Format datum als "di 7 mei"
 */
export function formatDateShort(date: Date | string): string {
  return formatDate(date, 'EEE d MMM');
}

/**
 * Bereken aantal dagen tussen twee datums
 */
export function getDaysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return differenceInDays(end, start);
}

/**
 * Genereer array van alle dagen tussen start en eind datum
 */
export function getDateRange(startDate: Date | string, endDate: Date | string): Date[] {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  const days: Date[] = [];
  let currentDate = start;

  while (!isAfter(currentDate, end)) {
    days.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  return days;
}

/**
 * Check of datum in het verleden is
 */
export function isPast(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(dateObj, new Date());
}

/**
 * Check of datum in de toekomst is
 */
export function isFuture(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isAfter(dateObj, new Date());
}
