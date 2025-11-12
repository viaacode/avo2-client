import { useEffect, useRef } from 'react'

export const useBeforeUnload = (action: (e: Event) => void) => {
  const callback = useRef(action)

  useEffect(() => {
    const handleBeforeUnload = callback.current

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [callback])
}
