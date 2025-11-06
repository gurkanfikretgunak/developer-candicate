import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, formatStr: string = 'dd MMMM yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: tr });
}

export function calculateAverageScore(scores: Record<string, number>): number {
  const values = Object.values(scores);
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

export function getOverallScore(candidate: {
  step2_scores: Record<string, number>;
  step3_live_coding: { score?: number };
}): number {
  const technicalAvg = calculateAverageScore(candidate.step2_scores);
  const liveCodingScore = candidate.step3_live_coding.score || 0;
  
  // Weight: 60% technical scores, 40% live coding
  const overall = (technicalAvg * 20 * 0.6) + (liveCodingScore * 0.4);
  return Math.round(overall * 100) / 100;
}

export function getLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    'junior': 'Junior',
    'mid': 'Mid',
    'senior': 'Senior',
    'not-fit': 'Uygun Değil'
  };
  return labels[level] || level;
}

