/**
 * HSD Arena - Participant Game Constants
 *
 * Shared constants for question option colors and labels.
 */

export const OPTION_COLORS = [
    { bg: 'bg-teal-500', hover: 'hover:bg-teal-600', border: 'border-teal-400' },
    { bg: 'bg-pink-500', hover: 'hover:bg-pink-600', border: 'border-pink-400' },
    { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', border: 'border-purple-400' },
    { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', border: 'border-orange-400' },
] as const;

export const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;
