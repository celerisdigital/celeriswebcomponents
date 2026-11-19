import { useSyncExternalStore } from 'react'

const noopSubscribe = () => () => {}

export function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}
