import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type StudyFlowLoadingProps = {
  label?: string
  className?: string
  size?: 'sm' | 'md'
}

export function StudyFlowLoading({
  label = 'Carregando...',
  className,
  size = 'md',
}: StudyFlowLoadingProps) {
  const iconSize = size === 'sm' ? 'h-5 w-5' : 'h-8 w-8'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className={cn(iconSize, 'animate-spin text-primary')} aria-hidden />
      {label ? (
        <p className={cn(textSize, 'font-medium text-muted-foreground')}>{label}</p>
      ) : null}
    </div>
  )
}

export function StudyFlowLoadingOverlay({ label }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm">
      <StudyFlowLoading label={label} />
    </div>
  )
}
