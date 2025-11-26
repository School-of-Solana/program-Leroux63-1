'use client'

import { ReactNode } from 'react'

export function ClusterUiChecker({ children }: { children: ReactNode }) {
  // Wallet-UI n'est plus utilisé → ce composant ne doit plus rien faire.
  return <>{children}</>
}
