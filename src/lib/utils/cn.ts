/**
 * Utility: Classname merger
 * Combineert Tailwind classes op een slimme manier
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge classnames met Tailwind conflict resolution
 *
 * @example
 * cn('px-4 py-2', 'px-8') // => 'py-2 px-8'
 * cn('text-red-500', condition && 'text-blue-500') // => conditional
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
