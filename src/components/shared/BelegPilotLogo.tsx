import { cn } from '@/lib/utils'

const LOGO_PATH =
  'M10 37c-2 0-3-1-3-4-0.5-8-0.5-18 0-26 0-3 2-4 4-4l8 0c6 0 10 4 10 9 0 4-3 7-7 7.5 5 0.5 9 4.5 9 9 0 5.5-5 8.5-11 8.5z m3-29c0 0 4-0.5 6 0 3 1 4.5 2.5 4.5 4.5 0 2-1.5 4-5 4.5l-5.5 0z m0 14c0 0 5-0.5 7 0 3 1 5 3 5 5.5 0 2.5-2 4.5-5.5 4.5l-6.5 0z'

export function BelegPilotLogo({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'h-10 w-10' : 'h-8 w-8'
  const svgSize = size === 'lg' ? 22 : 18
  return (
    <div className={cn('flex items-center justify-center rounded-lg bg-foreground', dim)}>
      <svg width={svgSize} height={svgSize} viewBox="0 0 40 40" fill="none" aria-hidden="true" className="text-primary">
        <path d={LOGO_PATH} fill="currentColor" fillRule="evenodd" />
      </svg>
    </div>
  )
}
