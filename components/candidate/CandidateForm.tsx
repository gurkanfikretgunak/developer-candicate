'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StepNavigator } from './StepNavigator';
import { Step1General } from './Step1_General';
import { Step2Technical } from './Step2_Technical';
import { Step3LiveCoding } from './Step3_LiveCoding';
import { Step4Final } from './Step4_Final';
import { createCandidate, updateCandidate, getOrganizationDepartmentCriteriaById } from '@/lib/actions';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Save, CheckCircle2, Loader2 } from 'lucide-react';
import type { Candidate, Step1Data, Step3Data, FinalEvaluationData, Category } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface CandidateFormProps {
  candidate?: Candidate | null;
  isNew: boolean;
}

export function CandidateForm({ candidate, isNew }: CandidateFormProps) {
  const router = useRouter();
  const t = useTranslations('candidate');
  const tCommon = useTranslations('common');
  const [currentStep, setCurrentStep] = useState(candidate?.current_step || 1);
  const [isSaving, setIsSaving] = useState(false);
  const [candidateId, setCandidateId] = useState(candidate?.id || '');

  const [department, setDepartment] = useState(candidate?.department || '');
  const [cvFileUrl, setCvFileUrl] = useState(candidate?.cv_file_url || null);
  const [cvFileName, setCvFileName] = useState(candidate?.cv_file_name || null);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [orgCustomCategories, setOrgCustomCategories] = useState<Category[] | undefined>(undefined);
  const [validationErrors, setValidationErrors] = useState<{
    name?: boolean;
    email?: boolean;
    position?: boolean;
    department?: boolean;
  }>({});
  
  const [step4ValidationErrors, setStep4ValidationErrors] = useState<{
    level?: boolean;
    summary?: boolean;
  }>({});
  
  const [step1Data, setStep1Data] = useState<Step1Data>(
    candidate?.step1_general || { evaluationDate: new Date().toISOString().split('T')[0] }
  );
  const [step2Scores, setStep2Scores] = useState<Record<string, number>>(
    candidate?.step2_scores || {}
  );
  const [step3Data, setStep3Data] = useState<Step3Data>(
    candidate?.step3_live_coding || {}
  );
  const [finalData, setFinalData] = useState<FinalEvaluationData>(
    candidate?.final_evaluation || {}
  );

  // Load organization custom criteria when department changes
  useEffect(() => {
    const loadOrgCriteria = async () => {
      if (department) {
        const { data } = await getOrganizationDepartmentCriteriaById(department);
        if (data) {
          setOrgCustomCategories(data.criteria.categories);
        } else {
          setOrgCustomCategories(undefined);
        }
      }
    };
    loadOrgCriteria();
  }, [department]);

  const handleCvUpload = async (file: File) => {
    setIsUploadingCv(true);
    
    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      
      // Check if bucket exists first
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      const bucketExists = buckets?.some(b => b.id === 'candidate-cvs');
      
      if (!bucketExists) {
        // Fallback: Just save filename without actual upload
        setCvFileName(file.name);
        toast.warning('CV name saved. Storage bucket not configured yet. See STORAGE_SETUP.md');
        setIsUploadingCv(false);
        return;
      }
      
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = candidateId 
        ? `${candidateId}/${fileName}` 
        : `temp/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('candidate-cvs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('candidate-cvs')
        .getPublicUrl(filePath);
      
      setCvFileUrl(publicUrl);
      setCvFileName(file.name);
      toast.success('CV uploaded successfully!');
    } catch (error: any) {
      console.error('CV Upload Error:', error);
      
      // Fallback: Save filename even if upload fails
      setCvFileName(file.name);
      
      if (error.message?.includes('Bucket not found')) {
        toast.error('Storage bucket not found. CV name saved. Please configure storage (see STORAGE_SETUP.md)');
      } else {
        toast.error(error.message || 'Upload failed, but CV name saved');
      }
    } finally {
      setIsUploadingCv(false);
    }
  };

  const handleCvRemove = async () => {
    if (!cvFileUrl) return;
    
    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      
      // Extract file path from URL
      const urlParts = cvFileUrl.split('/candidate-cvs/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        
        // Delete from storage
        await supabase.storage
          .from('candidate-cvs')
          .remove([filePath]);
      }
      
      setCvFileUrl(null);
      setCvFileName(null);
      toast.success('CV removed');
    } catch (error) {
      toast.error('Failed to remove CV');
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        const errors = {
          name: !step1Data.name,
          email: !step1Data.email,
          position: !step1Data.position,
          department: !department,
        };
        setValidationErrors(errors);
        
        if (errors.name || errors.email || errors.position || errors.department) {
          toast.error(t('fillRequired'));
          return false;
        }
        return true;
      case 2:
        if (Object.keys(step2Scores).length === 0) {
          toast.error(t('scoreAtLeastOne'));
          return false;
        }
        return true;
      case 3:
        return true; // Step 3 is optional
      case 4:
        const step4Errors = {
          level: !finalData.level,
          summary: !finalData.summary,
        };
        setStep4ValidationErrors(step4Errors);
        
        if (step4Errors.level || step4Errors.summary) {
          toast.error(t('fillRequired'));
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSave = async (moveToNextStep: boolean = false) => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSaving(true);

    try {
      const candidateData: Partial<Candidate> = {
        department,
        current_step: moveToNextStep ? Math.min(currentStep + 1, 4) : currentStep,
        cv_file_url: cvFileUrl,
        cv_file_name: cvFileName,
        evaluators: step1Data.evaluators || null,
        evaluation_date: step1Data.evaluationDate || null,
        step1_general: step1Data,
        step2_scores: step2Scores,
        step3_live_coding: step3Data,
        final_evaluation: finalData,
      };

      if (isNew && !candidateId) {
        const result = await createCandidate(candidateData);
        if (result.error) {
          toast.error(result.error);
        } else {
          setCandidateId(result.data!.id);
          toast.success(t('candidateSaved'));
          if (moveToNextStep) {
            setCurrentStep(currentStep + 1);
          }
        }
      } else {
        const result = await updateCandidate(candidateId || candidate!.id, candidateData);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(t('changesSaved'));
          if (moveToNextStep) {
            setCurrentStep(currentStep + 1);
          }
        }
      }
    } catch (error) {
      toast.error(t('fillRequired'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!validateStep(4)) {
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateCandidate(candidateId || candidate!.id, {
        current_step: 4,
        step1_general: step1Data,
        step2_scores: step2Scores,
        step3_live_coding: step3Data,
        final_evaluation: finalData,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t('evaluationComplete'));
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error(t('fillRequired'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleStepClick = (step: number) => {
    if (step <= currentStep || candidateId) {
      setCurrentStep(step);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </Button>
        <h1 className="text-2xl font-bold">
          {isNew ? t('new') : step1Data.name || t('new')}
        </h1>
        <div className="w-20" /> {/* Spacer for alignment */}
      </div>

      <Card>
        <CardContent className="pt-6">
          <StepNavigator currentStep={currentStep} onStepClick={handleStepClick} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <Step1General
                  data={step1Data}
                  onChange={setStep1Data}
                  department={department}
                  onDepartmentChange={setDepartment}
                  candidateId={candidateId}
                  cvFileUrl={cvFileUrl}
                  cvFileName={cvFileName}
                  onCvUpload={handleCvUpload}
                  onCvRemove={handleCvRemove}
                  isUploadingCv={isUploadingCv}
                  validationErrors={validationErrors}
                />
              )}
              {currentStep === 2 && (
                <Step2Technical
                  department={department}
                  scores={step2Scores}
                  onChange={setStep2Scores}
                  orgCustomCategories={orgCustomCategories}
                />
              )}
              {currentStep === 3 && (
                <Step3LiveCoding data={step3Data} onChange={setStep3Data} />
              )}
              {currentStep === 4 && (
                <Step4Final
                  data={finalData}
                  onChange={setFinalData}
                  candidate={{
                    step2_scores: step2Scores,
                    step3_live_coding: step3Data,
                  }}
                  validationErrors={step4ValidationErrors}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1 || isSaving}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {tCommon('previous')}
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? t('saving') : tCommon('save')}
          </Button>

          {currentStep < 4 ? (
            <Button onClick={() => handleSave(true)} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  {tCommon('next')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {t('completeEvaluation')}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

