import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes intelligently
 * Combines clsx for conditional classes with twMerge for Tailwind specificity
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
