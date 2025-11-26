'use client'

import * as React from 'react'
import { SolanaClusterId, useWalletUi, useWalletUiCluster } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ClusterDropdown() {
  const { cluster } = useWalletUi()
  const { clusters, setCluster } = useWalletUiCluster()

  // ---- FIX: sécuriser cluster et clusters ----
  const safeClusters = Array.isArray(clusters) ? clusters : []
  const clusterLabel = cluster?.label ?? 'Unknown'
  const clusterId = cluster?.id ?? (safeClusters[0]?.id ?? 'devnet')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{clusterLabel}</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuRadioGroup
          value={clusterId}
          onValueChange={(c) => setCluster(c as SolanaClusterId)}
        >
          {safeClusters.map((cl) => (
            <DropdownMenuRadioItem key={cl.id} value={cl.id}>
              {cl.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
