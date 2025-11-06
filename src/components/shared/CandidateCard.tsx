import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import type { Candidate } from '@/lib/types';

interface CandidateCardProps {
  candidate: Candidate;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const progress = (candidate.current_step / 4) * 100;
  const name = candidate.step1_general?.name || 'İsimsiz Aday';
  const position = candidate.step1_general?.position || 'Pozisyon belirtilmemiş';

  const getStepLabel = (step: number) => {
    const labels = ['Genel Bilgiler', 'Teknik Değerlendirme', 'Live Coding', 'Nihai Değerlendirme'];
    return labels[step - 1] || 'Bilinmeyen';
  };

  return (
    <Link href={`/dashboard/candidate/${candidate.id}`}>
      <Card className="hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">{name}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{position}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-zinc-400" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{candidate.department}</Badge>
            <span className="text-xs text-zinc-500">
              {formatDate(candidate.created_at, 'dd MMM yyyy')}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                Adım {candidate.current_step}/4: {getStepLabel(candidate.current_step)}
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

