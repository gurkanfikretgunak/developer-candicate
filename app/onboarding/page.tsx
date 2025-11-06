'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOrganization } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Building2, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

const sectors = [
  'technology',
  'finance',
  'ecommerce',
  'healthcare',
  'education',
  'telecommunications',
  'manufacturing',
  'consulting',
  'other'
];

export default function OnboardingPage() {
  const router = useRouter();
  const t = useTranslations('onboarding');
  const tCommon = useTranslations('common');
  const tSectors = useTranslations('sectors');
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createOrganization({ name, sector, language });
      
      if (result.error) {
        toast.error(result.error);
      } else {
        // Set locale cookie
        document.cookie = `NEXT_LOCALE=${language}; path=/; max-age=31536000`;
        toast.success(t('success'));
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Building2 className="h-6 w-6 text-gray-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
              <p className="text-sm text-gray-600">
                {t('subtitle')}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('companyName')}</Label>
              <Input
                id="name"
                type="text"
                placeholder="Acme Technology"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className=""
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">{t('sector')}</Label>
              <Select value={sector} onValueChange={setSector} disabled={isLoading} required>
                <SelectTrigger id="sector" className="border-gray-300">
                  <SelectValue placeholder={t('selectSector')} />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((s) => (
                    <SelectItem key={s} value={s}>
                      {tSectors(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">{t('language')}</Label>
              <Select value={language} onValueChange={setLanguage} disabled={isLoading} required>
                <SelectTrigger id="language" className="border-gray-300">
                  <SelectValue placeholder={t('selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('languages.en')}</SelectItem>
                  <SelectItem value="tr">{t('languages.tr')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('creating')}
                </>
              ) : (
                tCommon('continue')
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
