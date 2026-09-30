import { BackButton } from '../../ui'

export function InformativeFormHeader({ title, basePath }: { title: string; basePath: string }) {
  return (
    <div className="flex items-center gap-2">
      <BackButton fallback={basePath} />
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
    </div>
  )
}
