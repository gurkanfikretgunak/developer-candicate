'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { updateUserProfile, updateUserLanguage, getUserOrganization } from '@/lib/actions';
import { Loader2, Globe, User, Building2, ShieldCheck, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import type { Organization, UserProfile } from '@/lib/types';
import { DepartmentCriteriaManager } from '@/components/settings/DepartmentCriteriaManager';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

// Helper function to get sector display value
const getSectorDisplay = (sector: string | null, tSectors: any): string => {
  if (!sector) return '';
  
  // Map old Turkish values to new keys
  const sectorKeyMap: Record<string, string> = {
    'Teknoloji': 'technology',
    'Finans': 'finance',
    'E-ticaret': 'ecommerce',
    'Sağlık': 'healthcare',
    'Eğitim': 'education',
    'Telekomünikasyon': 'telecommunications',
    'Üretim': 'manufacturing',
    'Danışmanlık': 'consulting',
    'Diğer': 'other'
  };
  
  // If it's an old Turkish value, map it to key
  const mappedKey = sectorKeyMap[sector];
  if (mappedKey) {
    try {
      return tSectors(mappedKey);
    } catch {
      return sector; // Fallback to original value
    }
  }
  
  // If it's already a key (like 'technology'), translate it
  try {
    return tSectors(sector);
  } catch {
    // If translation fails, return original value
    return sector;
  }
};

export default function SettingsPage() {
  const router = useRouter();
  const t = useTranslations('settings');
  const tSectors = useTranslations('sectors');
  const tOnboarding = useTranslations('onboarding.languages');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoadingData(true);
    try {
      const { organization: org, profile: prof } = await getUserOrganization();
      
      if (prof) {
        setProfile(prof);
        setFullName(prof.full_name || '');
        setCurrentLanguage(prof.language || 'en');
        setSelectedLanguage(prof.language || 'en');
      }
      
      if (org) {
        setOrganization(org);
      }

      // Get email from Supabase Auth
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateUserProfile({ full_name: fullName });
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t('messages.profileUpdated'));
      }
    } catch (error) {
      toast.error(t('messages.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeLanguage = async () => {
    if (selectedLanguage === currentLanguage) {
      return;
    }

    setIsSavingLanguage(true);

    try {
      const result = await updateUserLanguage(selectedLanguage);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t('messages.languageUpdated'));
        // Reload page to apply new language
        setTimeout(() => {
          router.refresh();
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      toast.error(t('messages.error'));
    } finally {
      setIsSavingLanguage(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('subtitle')}</p>
      </div>

      <Separator />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="general">{t('tabs.general')}</TabsTrigger>
          <TabsTrigger value="criteria">{t('tabs.departmentCriteria')}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          {/* Profile Section */}
          {isLoadingData ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-4 w-48 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-24" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <CardTitle>{t('profile.title')}</CardTitle>
                </div>
                <CardDescription>{t('subtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t('profile.fullName')}</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('profile.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-muted cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">{t('profile.emailReadonly')}</p>
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('actions.saving')}
                      </>
                    ) : (
                      t('actions.save')
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Language Section */}
          {isLoadingData ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-4 w-48 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-32" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <CardTitle>{t('language.title')}</CardTitle>
                </div>
                <CardDescription>{t('language.currentLanguage')}: {tOnboarding(currentLanguage as any)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">{t('language.selectLanguage')}</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{tOnboarding('en')}</SelectItem>
                      <SelectItem value="tr">{tOnboarding('tr')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleChangeLanguage} 
                  disabled={isSavingLanguage || selectedLanguage === currentLanguage}
                >
                  {isSavingLanguage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('actions.saving')}
                    </>
                  ) : (
                    t('language.changeLanguage')
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Organization Section */}
          {isLoadingData ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-40" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : (
            organization && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    <CardTitle>{t('organization.title')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('organization.name')}</Label>
                    <Input value={organization.name} disabled className="bg-muted cursor-not-allowed" />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('organization.sector')}</Label>
                    <Input 
                      value={getSectorDisplay(organization.sector, tSectors)} 
                      disabled 
                      className="bg-muted cursor-not-allowed" 
                    />
                  </div>
                </CardContent>
              </Card>
            )
          )}

          {/* Compliance Section */}
          {isLoadingData ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-8 w-28" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  <CardTitle>Compliance & Privacy</CardTitle>
                </div>
                <CardDescription>Your GDPR and cookie policy acceptance status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* GDPR Status */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                      {profile?.gdpr_accepted_at ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-amber-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">GDPR Policy</p>
                        {profile?.gdpr_accepted_at ? (
                          <p className="text-xs text-gray-600">
                            Accepted on {format(new Date(profile.gdpr_accepted_at), 'PPP')}
                          </p>
                        ) : (
                          <p className="text-xs text-amber-600">Not accepted</p>
                        )}
                      </div>
                    </div>
                    {profile?.gdpr_accepted_at ? (
                      <Badge variant="outline" className="border-green-500 bg-green-50 text-green-700">
                        <ShieldCheck className="mr-1 h-3 w-3" />
                        Accepted
                      </Badge>
                    ) : (
                      <Link href="/compliance">
                        <Button size="sm" variant="outline" className="border-amber-500 text-amber-700 hover:bg-amber-50">
                          Accept Now
                        </Button>
                      </Link>
                    )}
                  </div>

                  {/* Cookie Policy Status */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                      {profile?.cookies_accepted_at ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-amber-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">Cookie Policy</p>
                        {profile?.cookies_accepted_at ? (
                          <p className="text-xs text-gray-600">
                            Accepted on {format(new Date(profile.cookies_accepted_at), 'PPP')}
                          </p>
                        ) : (
                          <p className="text-xs text-amber-600">Not accepted</p>
                        )}
                      </div>
                    </div>
                    {profile?.cookies_accepted_at ? (
                      <Badge variant="outline" className="border-green-500 bg-green-50 text-green-700">
                        <ShieldCheck className="mr-1 h-3 w-3" />
                        Accepted
                      </Badge>
                    ) : (
                      <Link href="/compliance">
                        <Button size="sm" variant="outline" className="border-amber-500 text-amber-700 hover:bg-amber-50">
                          Accept Now
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      View full policies and update your preferences
                    </p>
                    <Link href="/policies">
                      <Button variant="ghost" size="sm">
                        View Policies
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="criteria" className="space-y-6 mt-6">
          <DepartmentCriteriaManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

