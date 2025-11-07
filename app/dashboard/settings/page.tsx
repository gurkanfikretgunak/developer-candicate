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
import { updateUserProfile, updateUserLanguage, getUserOrganization, deleteAccount } from '@/lib/actions';
import { Loader2, Globe, User, Building2, ShieldCheck, AlertCircle, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import type { Organization, UserProfile } from '@/lib/types';
import { DepartmentCriteriaManager } from '@/components/settings/DepartmentCriteriaManager';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SettingsSectionSkeleton, ComplianceSectionSkeleton, DeleteAccountSectionSkeleton } from '@/components/shared/Skeletons';

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
  const tCompliance = useTranslations('settings.compliance');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error(t('deleteAccount.confirmError'));
      return;
    }

    setIsDeletingAccount(true);

    try {
      const result = await deleteAccount();
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t('deleteAccount.success'));
        // Redirect to home page after deletion
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      toast.error(t('deleteAccount.error'));
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteDialogOpen(false);
      setDeleteConfirmText('');
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
            <SettingsSectionSkeleton />
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
            <SettingsSectionSkeleton />
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
            <SettingsSectionSkeleton />
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
            <ComplianceSectionSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  <CardTitle>{tCompliance('title')}</CardTitle>
                </div>
                <CardDescription>{tCompliance('subtitle')}</CardDescription>
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
                        <p className="text-sm font-medium text-gray-900">{tCompliance('gdprPolicy')}</p>
                        {profile?.gdpr_accepted_at ? (
                          <p className="text-xs text-gray-600">
                            {tCompliance('acceptedOn')} {format(new Date(profile.gdpr_accepted_at), 'PPP', { locale: currentLanguage === 'tr' ? tr : enUS })}
                          </p>
                        ) : (
                          <p className="text-xs text-amber-600">{tCompliance('notAccepted')}</p>
                        )}
                      </div>
                    </div>
                    {profile?.gdpr_accepted_at ? (
                      <Badge variant="outline" className="border-green-500 bg-green-50 text-green-700">
                        <ShieldCheck className="mr-1 h-3 w-3" />
                        {tCompliance('accepted')}
                      </Badge>
                    ) : (
                      <Link href="/compliance">
                        <Button size="sm" variant="outline" className="border-amber-500 text-amber-700 hover:bg-amber-50">
                          {tCompliance('acceptNow')}
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
                        <p className="text-sm font-medium text-gray-900">{tCompliance('cookiePolicy')}</p>
                        {profile?.cookies_accepted_at ? (
                          <p className="text-xs text-gray-600">
                            {tCompliance('acceptedOn')} {format(new Date(profile.cookies_accepted_at), 'PPP', { locale: currentLanguage === 'tr' ? tr : enUS })}
                          </p>
                        ) : (
                          <p className="text-xs text-amber-600">{tCompliance('notAccepted')}</p>
                        )}
                      </div>
                    </div>
                    {profile?.cookies_accepted_at ? (
                      <Badge variant="outline" className="border-green-500 bg-green-50 text-green-700">
                        <ShieldCheck className="mr-1 h-3 w-3" />
                        {tCompliance('accepted')}
                      </Badge>
                    ) : (
                      <Link href="/compliance">
                        <Button size="sm" variant="outline" className="border-amber-500 text-amber-700 hover:bg-amber-50">
                          {tCompliance('acceptNow')}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {tCompliance('viewPoliciesDescription')}
                    </p>
                    <Link href="/policies">
                      <Button variant="ghost" size="sm">
                        {tCompliance('viewPolicies')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delete Account Section */}
          {isLoadingData ? (
            <DeleteAccountSectionSkeleton />
          ) : (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-red-900">{t('deleteAccount.title')}</CardTitle>
                </div>
                <CardDescription className="text-red-700">
                  {t('deleteAccount.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 font-medium">{t('deleteAccount.description')}</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-2">
                    <li>{t('deleteAccount.items.profile')}</li>
                    <li>{t('deleteAccount.items.organization')}</li>
                    <li>{t('deleteAccount.items.candidates')}</li>
                    <li>{t('deleteAccount.items.jobs')}</li>
                    <li>{t('deleteAccount.items.applications')}</li>
                    <li>{t('deleteAccount.items.criteria')}</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-red-200">
                  <p className="text-sm font-semibold text-red-900 mb-4">
                    {t('deleteAccount.warning')}
                  </p>
                  
                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full sm:w-auto">
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('deleteAccount.deleteButton')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-red-900 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          {t('deleteAccount.title')}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600">
                          {t('deleteAccount.warning')}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="deleteConfirm" className="text-sm font-medium">
                            {t('deleteAccount.confirmText')}
                          </Label>
                          <Input
                            id="deleteConfirm"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder={t('deleteAccount.confirmPlaceholder')}
                            className="font-mono"
                            disabled={isDeletingAccount}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsDeleteDialogOpen(false);
                            setDeleteConfirmText('');
                          }}
                          disabled={isDeletingAccount}
                        >
                          {t('actions.cancel')}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={isDeletingAccount || deleteConfirmText !== 'DELETE'}
                        >
                          {isDeletingAccount ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t('deleteAccount.deleting')}
                            </>
                          ) : (
                            <>
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('deleteAccount.deleteButton')}
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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

