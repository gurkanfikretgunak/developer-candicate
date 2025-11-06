'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDepartmentNames } from '@/config/assessment';
import { useTranslations } from 'next-intl';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import type { Step1Data } from '@/lib/types';

interface Step1GeneralProps {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
  department: string;
  onDepartmentChange: (dept: string) => void;
  candidateId?: string;
  cvFileUrl?: string | null;
  cvFileName?: string | null;
  onCvUpload?: (file: File) => Promise<void>;
  onCvRemove?: () => void;
  isUploadingCv?: boolean;
  validationErrors?: {
    name?: boolean;
    email?: boolean;
    position?: boolean;
    department?: boolean;
  };
}

export function Step1General({ 
  data, 
  onChange, 
  department, 
  onDepartmentChange,
  candidateId,
  cvFileUrl,
  cvFileName,
  onCvUpload,
  onCvRemove,
  isUploadingCv = false,
  validationErrors = {}
}: Step1GeneralProps) {
  const departments = getDepartmentNames();
  const t = useTranslations('candidate.step1');
  const tDept = useTranslations('departments');
  const [evaluatorsInput, setEvaluatorsInput] = useState(
    data.evaluators?.join(', ') || ''
  );

  const handleChange = (field: keyof Step1Data, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleEvaluatorsChange = (value: string) => {
    setEvaluatorsInput(value);
    const evaluators = value.split(',').map(e => e.trim()).filter(e => e);
    onChange({ ...data, evaluators });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onCvUpload) {
      await onCvUpload(file);
      e.target.value = ''; // Reset input
    }
  };

  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  const evaluationDate = data.evaluationDate || today;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t('fullName')} *</Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={data.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            className={validationErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {validationErrors.name && (
            <p className="text-sm text-red-500">{t('fullName')} is required</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('email')} *</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={data.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            className={validationErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {validationErrors.email && (
            <p className="text-sm text-red-500">{t('email')} is required</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position">{t('position')} *</Label>
          <Input
            id="position"
            placeholder="Senior Backend Developer"
            value={data.position || ''}
            onChange={(e) => handleChange('position', e.target.value)}
            required
            className={validationErrors.position ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {validationErrors.position && (
            <p className="text-sm text-red-500">{t('position')} is required</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">{t('department')} *</Label>
          <Select value={department} onValueChange={onDepartmentChange} required>
            <SelectTrigger 
              id="department"
              className={validationErrors.department ? 'border-red-500 focus:ring-red-500' : ''}
            >
              <SelectValue placeholder={t('selectDepartment')} />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.nameKey ? tDept(dept.nameKey.split('.')[1] as any) : dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.department && (
            <p className="text-sm text-red-500">{t('department')} is required</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="evaluators">{t('evaluators')}</Label>
          <Input
            id="evaluators"
            placeholder={t('evaluatorsPlaceholder')}
            value={evaluatorsInput}
            onChange={(e) => handleEvaluatorsChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="evaluationDate">{t('evaluationDate')}</Label>
          <Input
            id="evaluationDate"
            type="date"
            value={evaluationDate}
            onChange={(e) => handleChange('evaluationDate', e.target.value)}
          />
        </div>
      </div>

      {/* CV Upload */}
      <div className="space-y-2">
        <Label htmlFor="cv">{t('cvUpload')}</Label>
        {isUploadingCv ? (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-700">Uploading CV...</span>
          </div>
        ) : cvFileName ? (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <FileText className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 flex-1">{cvFileName}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCvRemove}
              className="text-green-700 hover:text-green-900 hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              id="cv"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploadingCv}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('cv')?.click()}
              className="w-full"
              disabled={isUploadingCv}
            >
              <Upload className="mr-2 h-4 w-4" />
              {t('cvUpload')}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t('notes')}</Label>
        <Textarea
          id="notes"
          placeholder={t('notesPlaceholder')}
          value={data.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
}
