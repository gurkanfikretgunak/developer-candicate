'use client';

import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LogOut, Settings, ClipboardList, ShieldCheck, AlertCircle, LayoutDashboard, Briefcase, FileText } from 'lucide-react';
import Link from 'next/link';
import type { Organization, UserProfile } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface HeaderProps {
  organization: Organization | null;
  profile: UserProfile | null;
}

export function Header({ organization, profile }: HeaderProps) {
  const router = useRouter();
  const t = useTranslations('dashboard.header');

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    document.cookie = 'NEXT_LOCALE=; path=/; max-age=0';
    router.push('/');
    router.refresh();
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isCompliant = profile?.gdpr_accepted_at && profile?.cookies_accepted_at;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <ClipboardList className="h-5 w-5 text-gray-700 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="font-semibold text-sm text-gray-900 truncate">
              {organization?.name || 'Organization'}
            </h1>
            <p className="text-xs text-gray-600 hidden sm:block">
              {t('evaluation')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
          <Link href="/dashboard" className="hidden sm:block">
            <Button variant="ghost" size="sm">
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/hiring" className="hidden sm:block">
            <Button variant="ghost" size="sm">
              Hiring
            </Button>
          </Link>
          <Link href="/dashboard/hiring/jobs" className="hidden sm:block">
            <Button variant="ghost" size="sm">
              Jobs
            </Button>
          </Link>

          <DropdownMenu>
          <DropdownMenuTrigger asChild suppressHydrationWarning>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full" suppressHydrationWarning>
              <Avatar>
                <AvatarFallback className="bg-gray-200 text-gray-700">
                  {getInitials(profile?.full_name || null)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-gray-900">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs leading-none text-gray-600">
                  {organization?.sector}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="sm:hidden">
              <DropdownMenuItem asChild className="text-gray-700 cursor-pointer">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-gray-700 cursor-pointer">
                <Link href="/dashboard/hiring">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Hiring
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-gray-700 cursor-pointer">
                <Link href="/dashboard/hiring/jobs">
                  <FileText className="mr-2 h-4 w-4" />
                  Jobs
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </div>
            <DropdownMenuItem asChild className="text-gray-700 cursor-pointer">
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span className="flex-1">{t('settings')}</span>
                {isCompliant && (
                  <Badge variant="outline" className="ml-2 h-5 border-green-500 bg-green-50 text-green-700 text-xs">
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    Compliant
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
            {!isCompliant && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-amber-700 cursor-pointer bg-amber-50 hover:bg-amber-100">
                  <Link href="/compliance">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    <span className="flex-1">Complete Compliance</span>
                    <Badge variant="outline" className="ml-2 h-5 border-amber-500 bg-amber-100 text-amber-700 text-xs">
                      Required
                    </Badge>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={handleLogout} className="text-gray-700">
              <LogOut className="mr-2 h-4 w-4" />
              {t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
