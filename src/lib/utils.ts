import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for merging CSS classes using clsx and tailwind-merge
 * Combines multiple class values and resolves Tailwind CSS conflicts
 *
 * @param inputs - Variable number of class values (strings, objects, arrays, etc.)
 * @returns Merged and optimized class string
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}
