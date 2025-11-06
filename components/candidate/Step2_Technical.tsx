'use client';

import { useState, useEffect } from 'react';
import { ScoreSlider } from './ScoreSlider';
import { getDepartmentCriteria } from '@/config/assessment';
import { calculateAverageScore } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { useTranslations } from 'next-intl';
import { Code, Users, Award } from 'lucide-react';
import type { Category } from '@/lib/types';

interface Step2TechnicalProps {
  department: string;
  scores: Record<string, number>;
  onChange: (scores: Record<string, number>) => void;
  orgCustomCategories?: Category[];
}

export function Step2Technical({ department, scores, onChange, orgCustomCategories }: Step2TechnicalProps) {
  const t = useTranslations('candidate.step2');
  const tCat = useTranslations('categories');
  const [mounted, setMounted] = useState(false);
  const departmentData = getDepartmentCriteria(department, orgCustomCategories);
  
  // Helper function to get translated category name
  const getCategoryName = (category: Category) => {
    if (category.nameKey) {
      // Default category - use translation
      return tCat(category.nameKey.split('.')[1] as any);
    }
    // Custom category - use name as is
    return category.name || '';
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!departmentData) {
    return (
      <div className="text-center py-8 text-gray-600">
        {t('noDepartment')}
      </div>
    );
  }

  const handleScoreChange = (criterion: string, value: number) => {
    onChange({ ...scores, [criterion]: value });
  };

  const getInitialScore = (criterion: string) => {
    return scores[criterion] || 3;
  };

  // Calculate metrics
  const overallAverage = calculateAverageScore(scores);
  
  // Calculate average by category (first category is technical, second is behavioral)
  const technicalCriteria = departmentData.categories[0]?.criteria || [];
  const behavioralCriteria = departmentData.categories[1]?.criteria || [];

  const technicalScores = technicalCriteria
    .map(criterion => scores[criterion])
    .filter(score => score !== undefined);
  const behavioralScores = behavioralCriteria
    .map(criterion => scores[criterion])
    .filter(score => score !== undefined);

  const technicalAverage = technicalScores.length > 0
    ? technicalScores.reduce((a, b) => a + b, 0) / technicalScores.length
    : 0;
  const behavioralAverage = behavioralScores.length > 0
    ? behavioralScores.reduce((a, b) => a + b, 0) / behavioralScores.length
    : 0;

  // Prepare bar chart data - include all categories with any scores
  const chartData = departmentData.categories
    .map(category => {
      const categoryScores = category.criteria
        .map(criterion => scores[criterion])
        .filter(score => score !== undefined);
      
      // Calculate average (include 0 scores)
      const avg = categoryScores.length > 0
        ? categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length
        : 0;
      
      return {
        name: getCategoryName(category),
        value: Number(avg.toFixed(2)),
        scoredCount: categoryScores.length,
        totalCount: category.criteria.length
      };
    })
    .filter(item => item.scoredCount > 0); // Only show if at least one criterion is scored

  const hasScores = Object.keys(scores).length > 0;

  return (
    <div className="space-y-6">
      {departmentData.categories.map((category, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">{getCategoryName(category)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {category.criteria.map((criterion) => (
              <ScoreSlider
                key={criterion}
                label={criterion}
                value={getInitialScore(criterion)}
                onChange={(value) => handleScoreChange(criterion, value)}
              />
            ))}
          </CardContent>
        </Card>
      ))}

      {hasScores && (
        <>
          {/* Overall Average Card - Black & White */}
          <Card className="bg-gray-900 text-white border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg text-white">{t('overallAverage')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{t('overallAverage')}</span>
                <span className="text-4xl font-bold text-white">{overallAverage.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* 3 Metric Cards - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Technical Average */}
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Code className="h-4 w-4 text-gray-700" />
                  </div>
                  <CardTitle className="text-sm font-medium text-gray-900">
                    {technicalCriteria.length > 0 ? t('technicalSkills') : 'N/A'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {technicalAverage > 0 ? technicalAverage.toFixed(2) : '-'}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {technicalCriteria.length} {t('criteria')}
                </p>
              </CardContent>
            </Card>

            {/* Behavioral Average */}
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Users className="h-4 w-4 text-gray-700" />
                  </div>
                  <CardTitle className="text-sm font-medium text-gray-900">
                    {behavioralCriteria.length > 0 ? t('behavioralSkills') : 'N/A'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {behavioralAverage > 0 ? behavioralAverage.toFixed(2) : '-'}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {behavioralCriteria.length} {t('criteria')}
                </p>
              </CardContent>
            </Card>

            {/* Overall Average */}
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Award className="h-4 w-4 text-gray-700" />
                  </div>
                  <CardTitle className="text-sm font-medium text-gray-900">
                    {t('overall')}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {overallAverage.toFixed(2)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t('combinedScore')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Bar Chart */}
          {mounted && chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">{t('performanceOverview')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      barSize={chartData.length > 2 ? 60 : 100}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        angle={-35}
                        textAnchor="end"
                        height={90}
                        interval={0}
                        tick={{ fill: '#374151', fontSize: 12 }}
                      />
                      <YAxis 
                        domain={[0, 5]}
                        ticks={[1, 2, 3, 4, 5]}
                        tick={{ fill: '#374151', fontSize: 12 }}
                        label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}
                        cursor={{ fill: 'rgba(17, 24, 39, 0.05)' }}
                        formatter={(value: number, name: string, props: any) => {
                          const { scoredCount, totalCount } = props.payload;
                          return [
                            <span key="value" className="font-bold">{value.toFixed(2)}</span>,
                            <span key="label" className="text-xs text-gray-500"> ({scoredCount}/{totalCount} scored)</span>
                          ];
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#111827"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-center text-xs text-gray-500">
                  Category averages on a scale of 1-5
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
