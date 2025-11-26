'use client'

import { AnchorProvider, Program, setProvider } from '@coral-xyz/anchor'
import { Connection } from '@solana/web3.js'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { useMemo } from 'react'
import idl from '@/idl/roundpot.json'
import { Roundpot } from '@/types/roundpot'

export const useProgram = () => {
  const wallet = useAnchorWallet()
  const connection = new Connection('https://api.devnet.solana.com', 'processed')

  return useMemo(() => {
    if (!wallet) return null

    const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions())
    setProvider(provider)

    return new Program<Roundpot>(idl as any, provider)
  }, [wallet])
}
