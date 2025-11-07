'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { levelOptions } from '@/config/assessment';
import { getOverallScore } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import type { FinalEvaluationData, Candidate } from '@/lib/types';
import { TrendingUp, Award } from 'lucide-react';

interface Step4FinalProps {
  data: FinalEvaluationData;
  onChange: (data: FinalEvaluationData) => void;
  candidate: Partial<Candidate>;
  validationErrors?: {
    level?: boolean;
    summary?: boolean;
  };
}

export function Step4Final({ data, onChange, candidate, validationErrors = {} }: Step4FinalProps) {
  const t = useTranslations('candidate.step4');
  
  const handleChange = (field: keyof FinalEvaluationData, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  const calculatedScore = getOverallScore({
    step2_scores: candidate.step2_scores || {},
    step3_live_coding: candidate.step3_live_coding || {},
  });

  const technicalAvg = Object.keys(candidate.step2_scores || {}).length > 0
    ? (
        Object.values(candidate.step2_scores || {}).reduce(
          (a, b) => a + b,
          0
        ) / Object.keys(candidate.step2_scores || {}).length
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Metrics Cards - White background, black text */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calculated Score */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-gray-700" />
              </div>
              <CardTitle className="text-sm font-medium text-gray-900">
                {t('calculatedScore')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {calculatedScore.toFixed(1)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Auto-calculated
            </p>
          </CardContent>
        </Card>

        {/* Technical Average */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Award className="h-5 w-5 text-gray-700" />
              </div>
              <CardTitle className="text-sm font-medium text-gray-900">
                {t('technicalAverage')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {technicalAvg.toFixed(1)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Step 2 average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Level */}
        <div className="space-y-2">
          <Label htmlFor="level">{t('level')} *</Label>
          <Select
            value={data.level || ''}
            onValueChange={(value: any) => handleChange('level', value)}
            required
          >
              <SelectTrigger 
                id="level"
                className={validationErrors.level ? 'border-red-500 focus:ring-red-500' : ''}
              >
              <SelectValue placeholder={t('selectLevel')} />
            </SelectTrigger>
            <SelectContent>
              {levelOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(`levels.${option.value}` as any)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
            {validationErrors.level ? (
              <p className="text-sm text-red-500">{t('level')} is required</p>
            ) : (
          <p className="text-xs text-gray-500">
            {t('levelDescription')}
          </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">{t('status')} *</Label>
            <Select
              value={data.status || ''}
              onValueChange={(value: any) => handleChange('status', value)}
              required
            >
              <SelectTrigger id="status">
                <SelectValue placeholder={t('selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    {t('statuses.pending')}
                  </span>
                </SelectItem>
                <SelectItem value="accepted">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    {t('statuses.accepted')}
                  </span>
                </SelectItem>
                <SelectItem value="rejected">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    {t('statuses.rejected')}
                  </span>
                </SelectItem>
                <SelectItem value="postponed">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    {t('statuses.postponed')}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {t('statusDescription')}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="overallScore">{t('overallScore')}</Label>
          <div className="flex items-center gap-2">
            <input
              id="overallScore"
              type="number"
              min="0"
              max="100"
              className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-900"
              placeholder={calculatedScore.toFixed(1)}
              value={data.overallScore || ''}
              onChange={(e) =>
                handleChange('overallScore', e.target.value ? Number(e.target.value) : 0)
              }
            />
          </div>
          <p className="text-xs text-gray-500">
            {t('overallScoreDescription')}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">{t('summary')} *</Label>
          <Textarea
            id="summary"
            placeholder={t('summaryPlaceholder')}
            value={data.summary || ''}
            onChange={(e) => handleChange('summary', e.target.value)}
            rows={8}
            required
            className={validationErrors.summary ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {validationErrors.summary && (
            <p className="text-sm text-red-500">{t('summary')} is required</p>
          )}
        </div>
      </div>
    </div>
  );
}
