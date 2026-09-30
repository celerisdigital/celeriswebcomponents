import Link from 'next/link'
import { LuPlus } from 'react-icons/lu'

export function CreateInformativeLink({ basePath }: { basePath: string }) {
  return (
    <Link
      href={`${basePath}/novo`}
      className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-3 sm:px-5 py-2.5 rounded-full hover:bg-primary-hover transition-colors"
    >
      <LuPlus size={16} />
      <span className="hidden sm:inline">Cadastrar</span>
    </Link>
  )
}
