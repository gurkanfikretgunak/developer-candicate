import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4">
        <UserPlus className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Henüz aday eklenmemiş</h3>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-center max-w-md">
        İlk adayınızın sürecini başlatabilirsiniz
      </p>
      <Link href="/dashboard/candidate/new">
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Yeni Aday Ekle
        </Button>
      </Link>
    </div>
  );
}

