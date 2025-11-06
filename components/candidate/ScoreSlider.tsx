'use client';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';

interface ScoreSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const scoreLabels = ['', 'Zayıf', 'Geliştirilmeli', 'Orta', 'İyi', 'Mükemmel'];

export function ScoreSlider({ label, value, onChange }: ScoreSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <motion.div
          key={value}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2"
        >
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {value}
          </span>
          <span className="text-xs text-zinc-500">
            {scoreLabels[value]}
          </span>
        </motion.div>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={1}
        max={5}
        step={1}
        className="py-2"
      />
    </div>
  );
}

