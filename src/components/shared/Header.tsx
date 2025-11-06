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
import { Building2, LogOut, User } from 'lucide-react';
import type { Organization, UserProfile } from '@/lib/types';

interface HeaderProps {
  organization: Organization | null;
  profile: UserProfile | null;
}

export function Header({ organization, profile }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
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

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">
              {organization?.name || 'Organizasyon'}
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Aday Değerlendirme
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild suppressHydrationWarning>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full" suppressHydrationWarning>
              <Avatar>
                <AvatarFallback>
                  {getInitials(profile?.full_name || null)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.full_name || 'Kullanıcı'}
                </p>
                <p className="text-xs leading-none text-zinc-600 dark:text-zinc-400">
                  {organization?.sector}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

