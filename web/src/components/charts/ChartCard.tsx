import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <Card
      className={cn(
        'flex flex-col overflow-hidden border-slate-200/90 shadow-sm',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 px-4 py-3 sm:px-5">
        <div>
          <h3 className="text-sm font-semibold text-brand-navy">{title}</h3>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="min-h-[260px] flex-1 p-3 sm:p-4">{children}</div>
    </Card>
  )
}
