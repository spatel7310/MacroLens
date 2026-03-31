import { useState, useCallback } from 'react'

export function useDescriptionToggle(sectionKey: string): [boolean, () => void] {
  const storageKey = `macrolens-desc-${sectionKey}`

  const [visible, setVisible] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored === null ? true : stored === 'true'
    } catch {
      return true
    }
  })

  const toggle = useCallback(() => {
    setVisible((prev) => {
      const next = !prev
      try {
        localStorage.setItem(storageKey, String(next))
      } catch {
        // ignore storage errors
      }
      return next
    })
  }, [storageKey])

  return [visible, toggle]
}
