'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    startTransition(() => {
      // Refresh the entire page including server components
      router.refresh();
    });

    // Reset animation after transition completes
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const isLoading = isPending || isRefreshing;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleRefresh}
      disabled={isLoading}
      className="hover:bg-gray-100 transition-colors relative"
      aria-label="Refresh candidates list"
      title="Refresh candidates list"
    >
      <RefreshCw 
        className={`h-4 w-4 transition-all duration-300 ${
          isLoading 
            ? 'animate-spin text-blue-600' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      />
      {isLoading && (
        <span className="absolute inset-0 rounded-md bg-blue-50 opacity-20 animate-pulse" />
      )}
    </Button>
  );
}

