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
import { createCandidate, updateCandidate } from '@/lib/actions';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Save, CheckCircle2, Loader2 } from 'lucide-react';
import type { Candidate, Step1Data, Step3Data, FinalEvaluationData } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface CandidateFormProps {
  candidate?: Candidate | null;
  isNew: boolean;
}

export function CandidateForm({ candidate, isNew }: CandidateFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(candidate?.current_step || 1);
  const [isSaving, setIsSaving] = useState(false);
  const [candidateId, setCandidateId] = useState(candidate?.id || '');

  const [department, setDepartment] = useState(candidate?.department || '');
  const [step1Data, setStep1Data] = useState<Step1Data>(
    candidate?.step1_general || {}
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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!step1Data.name || !step1Data.email || !step1Data.position || !department) {
          toast.error('Lütfen tüm zorunlu alanları doldurun');
          return false;
        }
        return true;
      case 2:
        if (Object.keys(step2Scores).length === 0) {
          toast.error('Lütfen en az bir kriter puanlayın');
          return false;
        }
        return true;
      case 3:
        return true; // Step 3 is optional
      case 4:
        if (!finalData.level || !finalData.summary) {
          toast.error('Lütfen seviye ve özet alanlarını doldurun');
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
          toast.success('Aday kaydedildi');
          if (moveToNextStep) {
            setCurrentStep(currentStep + 1);
          }
        }
      } else {
        const result = await updateCandidate(candidateId || candidate!.id, candidateData);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success('Değişiklikler kaydedildi');
          if (moveToNextStep) {
            setCurrentStep(currentStep + 1);
          }
        }
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
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
        toast.success('Değerlendirme tamamlandı!');
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri
        </Button>
        <h1 className="text-2xl font-bold">
          {isNew ? 'Yeni Aday' : step1Data.name || 'Aday Değerlendirme'}
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
                />
              )}
              {currentStep === 2 && (
                <Step2Technical
                  department={department}
                  scores={step2Scores}
                  onChange={setStep2Scores}
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
          Önceki
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
            Kaydet
          </Button>

          {currentStep < 4 ? (
            <Button onClick={() => handleSave(true)} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  İleri
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
                  Değerlendirmeyi Tamamla
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

