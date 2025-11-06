'use client';

import { ScoreSlider } from './ScoreSlider';
import { getDepartmentById } from '@/config/assessment';
import { calculateAverageScore } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Step2TechnicalProps {
  department: string;
  scores: Record<string, number>;
  onChange: (scores: Record<string, number>) => void;
}

export function Step2Technical({ department, scores, onChange }: Step2TechnicalProps) {
  const departmentData = getDepartmentById(department);

  if (!departmentData) {
    return (
      <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
        Departman bilgisi bulunamadı
      </div>
    );
  }

  const handleScoreChange = (criterion: string, value: number) => {
    onChange({ ...scores, [criterion]: value });
  };

  const getInitialScore = (criterion: string) => {
    return scores[criterion] || 3;
  };

  const overallAverage = calculateAverageScore(scores);

  return (
    <div className="space-y-6">
      {departmentData.categories.map((category, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle className="text-lg">{category.name}</CardTitle>
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

      {Object.keys(scores).length > 0 && (
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Genel Ortalama</span>
            <span className="text-2xl font-bold">{overallAverage.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

