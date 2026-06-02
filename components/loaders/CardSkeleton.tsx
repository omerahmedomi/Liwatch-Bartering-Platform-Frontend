export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 h-full flex flex-col rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden animate-pulse">
      <div className="relative aspect-video bg-slate-200 dark:bg-slate-700 shrink-0" />
      <div className="p-6 flex flex-col grow space-y-4">
        <div className="flex justify-between">
          <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded-md" />
          <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded-md" />
        </div>
        <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md" />
        <div className="space-y-2 grow">
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-md" />
          <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-700 rounded-md" />
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-slate-50 mt-auto">
          <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded-md" />
        </div>
      </div>
    </div>
  );
}
