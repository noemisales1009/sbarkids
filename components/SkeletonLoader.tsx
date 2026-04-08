import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded ${className}`} />
);

/** Skeleton para card de paciente */
export const PatientCardSkeleton: React.FC = () => (
  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <Skeleton className="h-5 w-48 mb-2" />
        <Skeleton className="h-3 w-32 mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-7 w-20 rounded-full" />
    </div>
  </div>
);

/** Skeleton para lista de pacientes */
export const PatientListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <PatientCardSkeleton key={i} />
    ))}
  </div>
);

/** Skeleton para card de alerta */
export const AlertaCardSkeleton: React.FC = () => (
  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <Skeleton className="h-4 w-56 mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  </div>
);

/** Skeleton para seção de alertas */
export const AlertasSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-3">
    <Skeleton className="h-14 w-full rounded-lg" />
    {Array.from({ length: count }).map((_, i) => (
      <AlertaCardSkeleton key={i} />
    ))}
  </div>
);

/** Skeleton para seção SBAR (assessment/recommendation) */
export const SbarSectionSkeleton: React.FC = () => (
  <div className="space-y-3">
    <Skeleton className="h-6 w-48 mb-2" />
    <div className="flex gap-4 mb-3">
      <Skeleton className="h-8 w-20 rounded" />
      <Skeleton className="h-8 w-20 rounded" />
      <Skeleton className="h-8 w-20 rounded" />
    </div>
    <Skeleton className="h-32 w-full rounded-lg" />
    <Skeleton className="h-10 w-full rounded-lg" />
  </div>
);

/** Skeleton genérico para página inteira */
export const PageSkeleton: React.FC = () => (
  <div className="p-4 space-y-4">
    <Skeleton className="h-8 w-64 mb-6" />
    <Skeleton className="h-10 w-full rounded-lg mb-4" />
    <PatientListSkeleton count={4} />
  </div>
);

export default Skeleton;
