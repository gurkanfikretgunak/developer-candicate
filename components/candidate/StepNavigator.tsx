'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StepNavigatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function StepNavigator({ currentStep, onStepClick }: StepNavigatorProps) {
  const t = useTranslations('candidate.progress');
  
  const steps = [
    { number: 1, label: t('step1') },
    { number: 2, label: t('step2') },
    { number: 3, label: t('step3') },
    { number: 4, label: t('step4') },
  ];
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
          <div
            className="h-full bg-gray-900 transition-all duration-300"
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
                  isCompleted && 'bg-gray-900 border-gray-900 text-white',
                  isCurrent && 'bg-white border-gray-900 text-gray-900',
                  !isCompleted && !isCurrent && 'bg-white border-gray-300 text-gray-400',
                  isClickable && 'cursor-pointer hover:border-gray-600'
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
                  isCurrent && 'text-gray-900',
                  !isCurrent && 'text-gray-500'
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

