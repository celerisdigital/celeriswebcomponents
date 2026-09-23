import { LuFile, LuFileImage, LuFileText, LuFileSpreadsheet, LuFileType2, LuFileCode, LuFileJson } from 'react-icons/lu'

interface Props {
  contentType: string
  size?: number
}

export function FileTypeIcon({ contentType, size = 15 }: Props) {
  const cls = 'shrink-0'

  if (contentType.startsWith('image/'))
    return <LuFileImage size={size} className={`${cls} text-blue-500`} />

  switch (contentType) {
    case 'application/pdf':
      return <LuFileText size={size} className={`${cls} text-red-500`} />
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
      return <LuFileType2 size={size} className={`${cls} text-blue-600`} />
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.ms-excel':
      return <LuFileSpreadsheet size={size} className={`${cls} text-green-600`} />
    case 'text/csv':
      return <LuFileSpreadsheet size={size} className={`${cls} text-emerald-500`} />
    case 'application/json':
      return <LuFileJson size={size} className={`${cls} text-yellow-500`} />
    case 'text/plain':
      return <LuFileText size={size} className={`${cls} text-gray-500`} />
    case 'application/zip':
    case 'application/x-zip-compressed':
      return <LuFileCode size={size} className={`${cls} text-purple-500`} />
    default:
      return <LuFile size={size} className={`${cls} text-gray-400`} />
  }
}
