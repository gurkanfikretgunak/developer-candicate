'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/lib/utils';
import { ArrowRight, FileText, ClipboardList, Download } from 'lucide-react';
import type { Candidate } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { CandidateReport } from './CandidateReport';

interface CandidateCardProps {
  candidate: Candidate;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const t = useTranslations('candidate');
  const tReport = useTranslations('report');
  const tStatus = useTranslations('candidate.step4.statuses');
  const progress = (candidate.current_step / 4) * 100;
  const name = candidate.step1_general?.name || 'Unnamed Candidate';
  const position = candidate.step1_general?.position || 'No position specified';
  const hasCv = !!candidate.cv_file_url;
  const status = candidate.final_evaluation?.status;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'postponed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusDot = (status?: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'postponed':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStepLabel = (step: number) => {
    return t(`progress.step${step}` as any);
  };

  const handleCvPreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (candidate.cv_file_url) {
      window.open(candidate.cv_file_url, '_blank');
    }
  };

  const handleReportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCvDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (candidate.cv_file_url) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = candidate.cv_file_url;
      link.download = candidate.cv_file_name || `${name}_CV.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Link href={`/dashboard/candidate/${candidate.id}`}>
      <Card className="hover:border-primary transition-colors cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-gray-900">{name}</h3>
                <div className="flex items-center gap-1">
                {hasCv && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-gray-100"
                    onClick={handleCvPreview}
                    title="View CV"
                  >
                    <FileText className="h-4 w-4 text-gray-600" />
                  </Button>
                )}
                  <div onClick={handleReportClick}>
                    <CandidateReport 
                      candidate={candidate}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-gray-100"
                          title={tReport('viewReport')}
                        >
                          <ClipboardList className="h-4 w-4 text-gray-600" />
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">{position}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{candidate.department}</Badge>
            {status && (
              <Badge 
                variant="outline" 
                className={`${getStatusColor(status)} border font-medium`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(status)} mr-1.5`} />
                {tStatus(status as any)}
              </Badge>
            )}
            <span className="text-xs text-gray-500">
              {formatDate(candidate.created_at, 'dd MMM yyyy')}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {t('step')} {candidate.current_step}/4: {getStepLabel(candidate.current_step)}
              </span>
              <span className="font-medium text-gray-900">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {hasCv && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3 h-8 text-xs hover:bg-gray-50 border-gray-200"
              onClick={handleCvDownload}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              {t('downloadCV')}
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
