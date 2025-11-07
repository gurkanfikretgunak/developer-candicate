'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

type HealthStatus = 'online' | 'offline' | 'checking';

export function SupabaseHealthCheck() {
  const [vercelStatus, setVercelStatus] = useState<HealthStatus>('checking');
  const [supabaseStatus, setSupabaseStatus] = useState<HealthStatus>('checking');

  useEffect(() => {
    let isMounted = true;
    let supabaseTimeoutId: NodeJS.Timeout;
    let vercelTimeoutId: NodeJS.Timeout;

    // Check Vercel status (if page is loaded, Vercel is online)
    const checkVercelHealth = async () => {
      if (typeof window === 'undefined') {
        setVercelStatus('checking');
        return;
      }

      // Since the page has loaded successfully, Vercel is online
      // We can optionally do a quick health check
      try {
        const controller = new AbortController();
        vercelTimeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(window.location.origin, { 
          method: 'HEAD',
          cache: 'no-store',
          signal: controller.signal
        });
        
        if (vercelTimeoutId) clearTimeout(vercelTimeoutId);
        
        if (isMounted) {
          setVercelStatus('online');
        }
      } catch (error: any) {
        if (vercelTimeoutId) clearTimeout(vercelTimeoutId);
        
        // Even if fetch fails, page loaded successfully means Vercel is online
        if (isMounted) {
          setVercelStatus('online');
        }
      }
    };

    const checkSupabaseHealth = async () => {
      try {
        const supabase = createClient();
        
        // Set a timeout for the health check
        const timeoutPromise = new Promise<{ error: { message: string } }>((resolve) => {
          supabaseTimeoutId = setTimeout(() => {
            resolve({ error: { message: 'Timeout' } });
          }, 5000);
        });

        // Simple health check - try to query a lightweight endpoint
        const queryPromise = supabase.from('organizations').select('id').limit(1);
        
        const result = await Promise.race([queryPromise, timeoutPromise]);
        
        if (supabaseTimeoutId) clearTimeout(supabaseTimeoutId);
        
        if (!isMounted) return;

        if ('error' in result && result.error) {
          const { error } = result;
          // If it's a permission error (PGRST116), that's actually fine - it means Supabase is online
          // Only mark as offline if it's a network/connection error
          if ('code' in error && (error.code === 'PGRST116' || error.code === '42501')) {
            // Permission denied means Supabase is online, just not accessible without auth
            setSupabaseStatus('online');
          } else if (error.message?.includes('network') || error.message?.includes('fetch') || error.message === 'Timeout') {
            setSupabaseStatus('offline');
          } else {
            // Other errors might mean Supabase is online but something else is wrong
            setSupabaseStatus('online');
          }
        } else {
          setSupabaseStatus('online');
        }
      } catch (error: any) {
        if (supabaseTimeoutId) clearTimeout(supabaseTimeoutId);
        if (!isMounted) return;
        
        // Network errors or timeouts
        if (error?.message === 'Timeout' || error?.message?.includes('network') || error?.message?.includes('fetch')) {
          setSupabaseStatus('offline');
        } else {
          // Unknown error, assume offline
          setSupabaseStatus('offline');
        }
      }
    };

    // Check immediately
    checkVercelHealth();
    checkSupabaseHealth();

    // Check every 30 seconds
    const vercelInterval = setInterval(checkVercelHealth, 30000);
    const supabaseInterval = setInterval(checkSupabaseHealth, 30000);

    return () => {
      isMounted = false;
      clearInterval(vercelInterval);
      clearInterval(supabaseInterval);
      if (supabaseTimeoutId) clearTimeout(supabaseTimeoutId);
      if (vercelTimeoutId) clearTimeout(vercelTimeoutId);
    };
  }, []);

  const getOverallStatus = (): HealthStatus => {
    // If both are online, show green
    if (vercelStatus === 'online' && supabaseStatus === 'online') {
      return 'online';
    }
    // If either is offline, show red
    if (vercelStatus === 'offline' || supabaseStatus === 'offline') {
      return 'offline';
    }
    // Otherwise checking
    return 'checking';
  };

  const getDotColor = () => {
    const overallStatus = getOverallStatus();
    switch (overallStatus) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      case 'checking':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: HealthStatus) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'checking':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };

  const getTooltip = () => {
    return `Vercel: ${getStatusText(vercelStatus)}\nSupabase: ${getStatusText(supabaseStatus)}`;
  };

  const overallStatus = getOverallStatus();

  return (
    <span className="relative inline-flex items-center ml-2 group">
      <span
        className={`w-2 h-2 rounded-full ${getDotColor()} ${overallStatus === 'checking' ? 'animate-pulse' : ''} cursor-help`}
        aria-label={getTooltip()}
      />
      {/* Tooltip */}
      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-pre-line z-50 min-w-[140px] text-center">
        {getTooltip()}
        <span className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></span>
      </span>
    </span>
  );
}

