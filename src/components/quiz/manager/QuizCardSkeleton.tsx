import { cn } from '@/utils';

interface SkeletonBlockProps {
    className?: string;
}

const SkeletonBlock = ({ className }: SkeletonBlockProps) => (
    <div
        aria-hidden="true"
        className={cn(
            'animate-pulse rounded-xl bg-[color-mix(in_srgb,var(--surface-card-bg),var(--text-primary)_8%)]',
            className
        )}
    />
);

const QuizCardSkeleton = () => {
    return (
        <div className="card shadow-md overflow-hidden h-full">
            <div className="flex h-full flex-col justify-between gap-6">
                <div className="space-y-3">
                    <SkeletonBlock className="h-7 w-3/4 rounded-lg" />
                    <SkeletonBlock className="h-4 w-1/2 rounded-md" />
                </div>

                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                        <SkeletonBlock className="h-4 w-full rounded-md" />
                        <SkeletonBlock className="h-4 w-4/5 rounded-md" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <SkeletonBlock className="h-8 w-8 rounded-lg" />
                        <SkeletonBlock className="h-8 w-8 rounded-lg" />
                    </div>
                </div>

                <SkeletonBlock className="h-10 w-full rounded-xl" />
            </div>
        </div>
    );
};

export default QuizCardSkeleton;