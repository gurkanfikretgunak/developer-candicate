'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepNavigatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const steps = [
  { number: 1, label: 'Genel Bilgiler' },
  { number: 2, label: 'Teknik Değerlendirme' },
  { number: 3, label: 'Live Coding' },
  { number: 4, label: 'Nihai Değerlendirme' },
];

export function StepNavigator({ currentStep, onStepClick }: StepNavigatorProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-10">
          <div
            className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isClickable = currentStep >= step.number;

          return (
            <button
              key={step.number}
              onClick={() => isClickable && onStepClick(step.number)}
              disabled={!isClickable}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                  'border-2',
                  isCompleted && 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900',
                  isCurrent && 'bg-white dark:bg-zinc-900 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100',
                  !isCompleted && !isCurrent && 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600',
                  isClickable && 'cursor-pointer hover:border-zinc-500 dark:hover:border-zinc-400'
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium transition-colors hidden sm:block',
                  isCurrent && 'text-zinc-900 dark:text-zinc-100',
                  !isCurrent && 'text-zinc-500 dark:text-zinc-500'
                )}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

