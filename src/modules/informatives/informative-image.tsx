import { cn } from '../../lib/cn'

interface Props {
  src: string
  className?: string
}

export function InformativeImage({ src, className }: Props) {
  return (
    <img
      src={src}
      alt=""
      className={cn('block mx-auto max-h-48 w-auto max-w-full rounded-lg', className)}
    />
  )
}
