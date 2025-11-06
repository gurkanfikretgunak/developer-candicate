'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Download, Copy, Check } from 'lucide-react';
import type { Candidate, Category } from '@/lib/types';
import { useTranslations } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatDate } from '@/lib/utils';
import { getDepartmentCriteria } from '@/config/assessment';
import { getOrganizationDepartmentCriteriaById } from '@/lib/actions';

interface CandidateReportProps {
  candidate: Candidate;
  trigger?: React.ReactNode;
}

export function CandidateReport({ candidate, trigger }: CandidateReportProps) {
  const t = useTranslations('report');
  const tCandidate = useTranslations('candidate');
  const tCat = useTranslations('categories');
  const [copied, setCopied] = useState(false);
  const [orgCustomCategories, setOrgCustomCategories] = useState<Category[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  
  // Helper function to get translated category name
  const getCategoryName = (category: Category) => {
    if (category.nameKey) {
      return tCat(category.nameKey.split('.')[1] as any);
    }
    return category.name || '';
  };

  useEffect(() => {
    const loadCriteria = async () => {
      if (candidate.department) {
        const { data } = await getOrganizationDepartmentCriteriaById(candidate.department);
        if (data) {
          setOrgCustomCategories(data.criteria.categories);
        }
      }
      setIsLoading(false);
    };
    loadCriteria();
  }, [candidate.department]);

  const generateMarkdownReport = (): string => {
    const name = candidate.step1_general?.name || 'N/A';
    const email = candidate.step1_general?.email || 'N/A';
    const position = candidate.step1_general?.position || 'N/A';
    const evaluators = candidate.evaluators?.join(', ') || 'N/A';
    const evaluationDate = candidate.evaluation_date || 'N/A';
    const notes = candidate.step1_general?.notes || 'N/A';

    // Get department criteria (custom or default)
    const departmentData = getDepartmentCriteria(candidate.department, orgCustomCategories);
    
    // Calculate scores
    const step2Scores = candidate.step2_scores || {};
    const scoreValues = Object.values(step2Scores).filter(s => typeof s === 'number') as number[];
    const technicalAverage = scoreValues.length > 0 
      ? (scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length).toFixed(2)
      : 'N/A';

    const liveCodingScore = candidate.step3_live_coding?.score || 'N/A';
    const codeQuality = candidate.step3_live_coding?.codeQuality || 'N/A';
    const problemSolving = candidate.step3_live_coding?.problemSolving || 'N/A';
    const timeManagement = candidate.step3_live_coding?.timeManagement || 'N/A';
    const communication = candidate.step3_live_coding?.communication || 'N/A';
    const solutionUrl = candidate.step3_live_coding?.solutionUrl || 'N/A';
    const submissionDate = candidate.step3_live_coding?.submissionDate || 'N/A';
    const liveCodingNotes = candidate.step3_live_coding?.notes || 'N/A';

    const finalLevel = candidate.final_evaluation?.level || 'N/A';
    const finalScore = candidate.final_evaluation?.overallScore || 'N/A';
    const finalStatus = candidate.final_evaluation?.status || 'N/A';
    const finalSummary = candidate.final_evaluation?.summary || 'N/A';
    
    // Helper function for score badges
    const getScoreBadge = (score: number | string) => {
      const numScore = typeof score === 'string' ? parseFloat(score) : score;
      if (isNaN(numScore)) return '⚪';
      if (numScore >= 4.5) return '🟢';
      if (numScore >= 3.5) return '🟡';
      if (numScore >= 2.5) return '🟠';
      return '🔴';
    };

    const getLevelEmoji = (level: string) => {
      switch(level) {
        case 'senior': return '⭐⭐⭐';
        case 'mid': return '⭐⭐';
        case 'junior': return '⭐';
        case 'not-fit': return '❌';
        default: return '❓';
      }
    };

    const getStatusEmoji = (status: string) => {
      switch(status) {
        case 'accepted': return '✅';
        case 'rejected': return '❌';
        case 'postponed': return '⏸️';
        case 'pending': return '⏳';
        default: return '❓';
      }
    };

    return `# 📋 ${t('title')}

## 👤 ${name}
**${position}** • ${candidate.department}

---

## 📊 ${t('sections.general')}

| 🏷️ ${t('fields.field')} | 📝 ${t('fields.value')} |
|:----------------------|:------------------------|
| **${t('fields.name')}** | ${name} |
| **${t('fields.email')}** | ${email} |
| **${t('fields.position')}** | ${position} |
| **${t('fields.department')}** | ${candidate.department} |
| **${t('fields.evaluators')}** | ${evaluators} |
| **${t('fields.evaluationDate')}** | ${evaluationDate} |
| **${t('fields.createdAt')}** | ${formatDate(candidate.created_at, 'dd MMM yyyy HH:mm')} |
| **${t('fields.cvLink')}** | ${candidate.cv_file_url ? `[📄 ${t('fields.viewCV')}](${candidate.cv_file_url})` : 'N/A'} |

${notes !== 'N/A' ? `> **💭 ${t('fields.notes')}**
> 
> ${notes.split('\n').join('\n> ')}` : ''}

---

## 🎯 ${t('sections.technical')}

### 📈 ${t('fields.overallAverage')}: ${getScoreBadge(parseFloat(technicalAverage))} **${technicalAverage}** / 5.0

${departmentData ? departmentData.categories.map((category, idx) => {
  const categoryScores = category.criteria
    .map(criterion => {
      const score = step2Scores[criterion];
      return score !== undefined ? `| ${criterion} | ${getScoreBadge(score)} **${score}** / 5 |` : null;
    })
    .filter(Boolean);
  
  if (categoryScores.length === 0) return '';
  
  const emoji = idx === 0 ? '⚙️' : '🤝';
  const categoryName = category.nameKey ? getCategoryName(category) : category.name;
  return `### ${emoji} ${categoryName}

| 📌 Criterion | 🎯 Score |
|:-------------|:---------|
${categoryScores.join('\n')}
`;
}).filter(Boolean).join('\n') : `| 📌 Criterion | 🎯 Score |
|:-------------|:---------|
${Object.entries(step2Scores).map(([criterion, score]) => 
  `| ${criterion} | ${getScoreBadge(score)} **${score}** / 5 |`
).join('\n') || 'No scores recorded'}`}

---

## 💻 ${t('sections.liveCoding')}

### 🏆 ${t('fields.overallScore')}: **${liveCodingScore}** / 100

| 📊 ${t('fields.metric')} | 🎯 ${t('fields.score')} |
|:-------------------------|:------------------------|
| **🎨 ${tCandidate('step3.criteria.codeQuality')}** | ${getScoreBadge(codeQuality)} ${codeQuality} / 5 |
| **🧩 ${tCandidate('step3.criteria.problemSolving')}** | ${getScoreBadge(problemSolving)} ${problemSolving} / 5 |
| **⏱️ ${tCandidate('step3.criteria.timeManagement')}** | ${getScoreBadge(timeManagement)} ${timeManagement} / 5 |
| **💬 ${tCandidate('step3.criteria.communication')}** | ${getScoreBadge(communication)} ${communication} / 5 |

📅 **${t('fields.submissionDate')}**: ${submissionDate}

🔗 **${t('fields.solutionUrl')}**: ${solutionUrl !== 'N/A' ? `[🔗 ${t('fields.viewSolution')}](${solutionUrl})` : 'N/A'}

${liveCodingNotes !== 'N/A' ? `> **💭 ${t('fields.notes')}**
> 
> ${liveCodingNotes.split('\n').join('\n> ')}` : ''}

---

## ⭐ ${t('sections.finalEvaluation')}

| 🏆 ${t('fields.field')} | 📊 ${t('fields.value')} |
|:------------------------|:------------------------|
| **Level** | ${getLevelEmoji(finalLevel)} **${finalLevel.toUpperCase()}** |
| **Status** | ${getStatusEmoji(finalStatus)} **${finalStatus.toUpperCase()}** |
| **Final Score** | 🎯 **${finalScore}** |

### 📝 ${t('fields.summary')}

> ${finalSummary.split('\n').join('\n> ')}

---

## 📈 ${t('sections.progress')}

**${t('fields.currentStep')}**: ${candidate.current_step} / 4 ${'█'.repeat(candidate.current_step)}${'░'.repeat(4 - candidate.current_step)}

**${t('fields.status')}**: ${candidate.current_step === 4 ? '✅ ' + t('fields.completed') : '⏳ ' + t('fields.inProgress')}

---

<div align="center">

*📅 ${t('generatedAt')}: ${formatDate(new Date().toISOString(), 'dd MMM yyyy HH:mm')}*

**Generated by Developer Evaluation Platform** 🚀

</div>
`;
  };

  const markdownContent = generateMarkdownReport();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${candidate.step1_general?.name || 'candidate'}_report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            {t('viewReport')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{t('title')}</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {t('copied')}
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    {t('copy')}
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                {t('download')}
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4 bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border-collapse border-2 border-gray-300 shadow-sm rounded-lg overflow-hidden" {...props} />
                  </div>
                ),
                th: ({node, ...props}) => (
                  <th className="border border-gray-300 bg-gradient-to-r from-gray-800 to-gray-700 text-white px-4 py-3 text-left font-semibold" {...props} />
                ),
                td: ({node, ...props}) => (
                  <td className="border border-gray-200 px-4 py-3 bg-white hover:bg-gray-50 transition-colors" {...props} />
                ),
                h1: ({node, ...props}) => (
                  <h1 className="text-4xl font-bold mb-6 text-gray-900 border-b-4 border-blue-500 pb-3" {...props} />
                ),
                h2: ({node, ...props}) => (
                  <h2 className="text-3xl font-bold mt-8 mb-4 text-gray-900 flex items-center gap-2" {...props} />
                ),
                h3: ({node, ...props}) => (
                  <h3 className="text-xl font-semibold mt-5 mb-3 text-gray-800 flex items-center gap-2" {...props} />
                ),
                h4: ({node, ...props}) => (
                  <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-700" {...props} />
                ),
                hr: ({node, ...props}) => (
                  <hr className="my-8 border-t-2 border-gray-300" {...props} />
                ),
                a: ({node, ...props}) => (
                  <a className="text-blue-600 hover:text-blue-800 hover:underline font-medium inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer" {...props} />
                ),
                p: ({node, ...props}) => (
                  <p className="my-3 text-gray-700 leading-relaxed" {...props} />
                ),
                blockquote: ({node, ...props}) => (
                  <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-3 my-4 italic text-gray-800 rounded-r-lg" {...props} />
                ),
                strong: ({node, ...props}) => (
                  <strong className="font-bold text-gray-900" {...props} />
                ),
                ul: ({node, ...props}) => (
                  <ul className="list-disc list-inside my-3 space-y-1" {...props} />
                ),
                ol: ({node, ...props}) => (
                  <ol className="list-decimal list-inside my-3 space-y-1" {...props} />
                ),
                li: ({node, ...props}) => (
                  <li className="text-gray-700" {...props} />
                ),
                code: ({node, className, children, ...props}: any) => {
                  const inline = !className;
                  return inline ? (
                    <code className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

