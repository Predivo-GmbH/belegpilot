import { useEffect } from 'react'

const SUFFIX = 'BelegPilot'

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SUFFIX}` : `${SUFFIX} — KI-Belegverarbeitung für Schweizer Treuhand`
  }, [title])
}
