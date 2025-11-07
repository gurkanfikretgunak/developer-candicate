'use client';

import { ExternalLink, AlertTriangle, Lock } from 'lucide-react';
import { validateAndSanitizeUrl, getSafeLinkProps } from '@/lib/url-security';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface SafePortfolioLinkProps {
  url: string | null | undefined;
  label?: string;
}

export function SafePortfolioLink({ url, label = 'View portfolio' }: SafePortfolioLinkProps) {
  if (!url) {
    return null;
  }

  const validation = validateAndSanitizeUrl(url);
  const safeProps = getSafeLinkProps(url);

  if (!validation.isValid || !safeProps) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600">
        <AlertTriangle className="h-4 w-4" />
        <span>Invalid portfolio URL</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="link"
        size="sm"
        className="h-auto p-0 text-blue-600 underline"
        asChild
      >
        <a {...safeProps}>
          {label}
          <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </Button>
      {validation.isSecure ? (
        <Badge variant="outline" className="h-5 text-xs">
          <Lock className="mr-1 h-3 w-3" />
          Secure
        </Badge>
      ) : (
        <Badge variant="outline" className="h-5 text-xs text-amber-600">
          HTTP
        </Badge>
      )}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 text-xs">
            Preview
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Portfolio Link Preview</DialogTitle>
            <DialogDescription>
              This link will open in a new secure tab. Make sure you trust the source before clicking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-900 mb-2">URL:</p>
              <p className="text-sm text-gray-600 break-all">{safeProps.href}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {validation.isSecure ? (
                  <Badge variant="outline" className="text-green-600">
                    <Lock className="mr-1 h-3 w-3" />
                    HTTPS Secure
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600">
                    HTTP (Not Secure)
                  </Badge>
                )}
              </div>
              <Button asChild>
                <a {...safeProps}>
                  Open in new tab
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

