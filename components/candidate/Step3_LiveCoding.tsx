'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import type { Step3Data } from '@/lib/types';

interface Step3LiveCodingProps {
  data: Step3Data;
  onChange: (data: Step3Data) => void;
}

export function Step3LiveCoding({ data, onChange }: Step3LiveCodingProps) {
  const t = useTranslations('candidate.step3');
  
  const handleChange = (field: keyof Step3Data, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  const score = data.score || 0;

  // Score interpretation function
  const getScoreInterpretation = (score: number) => {
    if (score >= 76) return { label: t('scoreTable.excellent'), desc: t('scoreTable.excellentDesc'), color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 51) return { label: t('scoreTable.good'), desc: t('scoreTable.goodDesc'), color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 26) return { label: t('scoreTable.average'), desc: t('scoreTable.averageDesc'), color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: t('scoreTable.poor'), desc: t('scoreTable.poorDesc'), color: 'text-red-600', bg: 'bg-red-50' };
  };

  const interpretation = getScoreInterpretation(score);

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">{t('score')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('scoreDescription')}</span>
              <span className="text-3xl font-bold text-gray-900">{score}</span>
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
          </div>

          {/* Score Interpretation */}
          {score > 0 && (
            <div className={`p-4 rounded-lg ${interpretation.bg} border border-gray-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">{t('scoreTable.title')}</p>
                  <p className={`text-lg font-bold ${interpretation.color}`}>{interpretation.label}</p>
                  <p className="text-sm text-gray-600 mt-1">{interpretation.desc}</p>
                </div>
              </div>
            </div>
          )}

          {/* Score Table */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-gray-600">76-100</p>
              <p className="text-sm font-semibold text-green-700">{t('scoreTable.excellent')}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-gray-600">51-75</p>
              <p className="text-sm font-semibold text-blue-700">{t('scoreTable.good')}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-gray-600">26-50</p>
              <p className="text-sm font-semibold text-yellow-700">{t('scoreTable.average')}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs text-gray-600">0-25</p>
              <p className="text-sm font-semibold text-red-700">{t('scoreTable.poor')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Coding Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">{t('title')} (1-5)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Code Quality */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">{t('criteria.codeQuality')}</Label>
              <span className="text-lg font-semibold text-gray-900">{data.codeQuality || 3}</span>
            </div>
            <Slider
              value={[data.codeQuality || 3]}
              onValueChange={([v]) => handleChange('codeQuality', v)}
              min={1}
              max={5}
              step={1}
              className="py-2"
            />
          </div>

          {/* Problem Solving */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">{t('criteria.problemSolving')}</Label>
              <span className="text-lg font-semibold text-gray-900">{data.problemSolving || 3}</span>
            </div>
            <Slider
              value={[data.problemSolving || 3]}
              onValueChange={([v]) => handleChange('problemSolving', v)}
              min={1}
              max={5}
              step={1}
              className="py-2"
            />
          </div>

          {/* Time Management */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">{t('criteria.timeManagement')}</Label>
              <span className="text-lg font-semibold text-gray-900">{data.timeManagement || 3}</span>
            </div>
            <Slider
              value={[data.timeManagement || 3]}
              onValueChange={([v]) => handleChange('timeManagement', v)}
              min={1}
              max={5}
              step={1}
              className="py-2"
            />
          </div>

          {/* Communication */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">{t('criteria.communication')}</Label>
              <span className="text-lg font-semibold text-gray-900">{data.communication || 3}</span>
            </div>
            <Slider
              value={[data.communication || 3]}
              onValueChange={([v]) => handleChange('communication', v)}
              min={1}
              max={5}
              step={1}
              className="py-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submission Date */}
      <div className="space-y-2">
        <Label htmlFor="submissionDate">{t('submissionDate')}</Label>
        <Input
          id="submissionDate"
          type="date"
          value={data.submissionDate || ''}
          onChange={(e) => handleChange('submissionDate', e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Solution URL */}
      <div className="space-y-2">
        <Label htmlFor="solutionUrl">{t('solutionUrl')}</Label>
        <Input
          id="solutionUrl"
          type="url"
          placeholder={t('solutionUrlPlaceholder')}
          value={data.solutionUrl || ''}
          onChange={(e) => handleChange('solutionUrl', e.target.value)}
        />
        <p className="text-xs text-gray-500">
          {t('solutionUrlDescription')}
        </p>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">{t('notes')}</Label>
        <Textarea
          id="notes"
          placeholder={t('notesPlaceholder')}
          value={data.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={6}
        />
      </div>
    </div>
  );
}
