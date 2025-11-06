'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import type { Step3Data } from '@/lib/types';

interface Step3LiveCodingProps {
  data: Step3Data;
  onChange: (data: Step3Data) => void;
}

export function Step3LiveCoding({ data, onChange }: Step3LiveCodingProps) {
  const handleChange = (field: keyof Step3Data, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  const score = data.score || 0;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="score">Puan (0-100)</Label>
            <span className="text-2xl font-bold">{score}</span>
          </div>
          <Slider
            id="score"
            value={[score]}
            onValueChange={([v]) => handleChange('score', v)}
            min={0}
            max={100}
            step={1}
            className="py-2"
          />
          <p className="text-xs text-zinc-500">
            Live coding performansını 0-100 aralığında değerlendirin
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="solutionUrl">Çözüm URL'si (Opsiyonel)</Label>
          <Input
            id="solutionUrl"
            type="url"
            placeholder="https://github.com/..."
            value={data.solutionUrl || ''}
            onChange={(e) => handleChange('solutionUrl', e.target.value)}
          />
          <p className="text-xs text-zinc-500">
            GitHub repository veya başka bir kaynak linki
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notlar</Label>
          <Textarea
            id="notes"
            placeholder="Live coding süreci, kullanılan yaklaşımlar, güçlü/zayıf yönler..."
            value={data.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={6}
          />
        </div>
      </div>
    </div>
  );
}

