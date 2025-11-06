'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { levelOptions } from '@/config/assessment';
import { getOverallScore } from '@/lib/utils';
import type { FinalEvaluationData, Candidate } from '@/lib/types';
import { TrendingUp, Award } from 'lucide-react';

interface Step4FinalProps {
  data: FinalEvaluationData;
  onChange: (data: FinalEvaluationData) => void;
  candidate: Partial<Candidate>;
}

export function Step4Final({ data, onChange, candidate }: Step4FinalProps) {
  const handleChange = (field: keyof FinalEvaluationData, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  const calculatedScore = getOverallScore({
    step2_scores: candidate.step2_scores || {},
    step3_live_coding: candidate.step3_live_coding || {},
  });

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 border-zinc-200 dark:border-zinc-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Hesaplanan Genel Puan
                </p>
                <p className="text-2xl font-bold">{calculatedScore.toFixed(1)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg">
                <Award className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Teknik Ortalama
                </p>
                <p className="text-2xl font-bold">
                  {Object.keys(candidate.step2_scores || {}).length > 0
                    ? (
                        Object.values(candidate.step2_scores || {}).reduce(
                          (a, b) => a + b,
                          0
                        ) / Object.keys(candidate.step2_scores || {}).length
                      ).toFixed(1)
                    : '0.0'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="level">Seviye Değerlendirmesi *</Label>
          <Select
            value={data.level || ''}
            onValueChange={(value: any) => handleChange('level', value)}
            required
          >
            <SelectTrigger id="level">
              <SelectValue placeholder="Seviye seçin" />
            </SelectTrigger>
            <SelectContent>
              {levelOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-zinc-500">
            Adayın genel yetkinlik seviyesini belirleyin
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="overallScore">Genel Puan (Manuel - Opsiyonel)</Label>
          <div className="flex items-center gap-2">
            <input
              id="overallScore"
              type="number"
              min="0"
              max="100"
              className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
              placeholder={calculatedScore.toFixed(1)}
              value={data.overallScore || ''}
              onChange={(e) =>
                handleChange('overallScore', e.target.value ? Number(e.target.value) : 0)
              }
            />
          </div>
          <p className="text-xs text-zinc-500">
            İsterseniz hesaplanan puanın üzerine manuel puan girebilirsiniz
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">Nihai Değerlendirme Özeti *</Label>
          <Textarea
            id="summary"
            placeholder="Adayın güçlü/zayıf yönleri, genel izlenimler, işe alım önerisi..."
            value={data.summary || ''}
            onChange={(e) => handleChange('summary', e.target.value)}
            rows={8}
            required
          />
        </div>
      </div>
    </div>
  );
}

