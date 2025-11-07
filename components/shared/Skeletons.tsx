import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CandidateCardSkeleton() {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-4 w-24 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export function CandidateListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <CandidateCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ApplicationItemSkeleton() {
  return (
    <div className="p-6 grid gap-3 md:grid-cols-[1fr_1fr] border-b border-gray-200">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-8 w-36" />
      </div>
    </div>
  );
}

export function CandidateFormSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-20" />
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 flex-1" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}

export function JobItemSkeleton() {
  return (
    <div className="p-6 hover:bg-gray-50 transition-colors border-b border-gray-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

export function JobsListSkeleton() {
  return (
    <div className="divide-y divide-gray-200">
      {Array.from({ length: 5 }).map((_, i) => (
        <JobItemSkeleton key={i} />
      ))}
    </div>
  );
}

export function JobsStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
          <Skeleton className="h-8 w-12 mx-auto mb-2" />
          <Skeleton className="h-4 w-16 mx-auto" />
        </div>
      ))}
    </div>
  );
}

export function HomeJobsSectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="text-left">
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-64 mb-1" />
        <Skeleton className="h-3 w-96" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-5 w-5 rounded" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-28 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-12 w-full sm:w-48" />
    </div>
  );
}

export function SettingsSectionSkeleton() {
  return (
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
  );
}

export function ComplianceSectionSkeleton() {
  return (
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
  );
}

export function DeleteAccountSectionSkeleton() {
  return (
    <Card className="border-red-200 bg-red-50/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-64" />
          <ul className="list-disc list-inside space-y-1 ml-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i}>
                <Skeleton className="h-3 w-48 inline-block" />
              </li>
            ))}
          </ul>
        </div>
        <div className="pt-4 border-t border-red-200">
          <Skeleton className="h-4 w-80 mb-4" />
          <Skeleton className="h-10 w-40" />
        </div>
      </CardContent>
    </Card>
  );
}

