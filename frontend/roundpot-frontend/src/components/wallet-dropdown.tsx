'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletModalButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui'

export function WalletDropdown() {
  const { publicKey } = useWallet()

  if (!publicKey) {
    return (
      <WalletModalButton className="cursor-pointer">
        Select Wallet
      </WalletModalButton>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">
        {publicKey.toBase58().slice(0, 4)}...
        {publicKey.toBase58().slice(-4)}
      </span>

      <WalletDisconnectButton className="cursor-pointer">
        Disconnect
      </WalletDisconnectButton>
    </div>
  )
}
