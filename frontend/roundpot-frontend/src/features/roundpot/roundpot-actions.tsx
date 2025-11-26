'use client'

import { useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { useProgram } from '@/utils/useProgram'
import * as anchor from '@coral-xyz/anchor'

type AnchorError = { message?: string }

export default function RoundpotActions() {
  const { publicKey, connected } = useWallet()
  const program = useProgram()

  const [status, setStatus] = useState<string>('')

  // -------------------------------------------------------------------------
  // STATE CHECKS
  // -------------------------------------------------------------------------
  if (!connected || !publicKey) {
    return <p className="text-center mt-10">Connect your wallet.</p>
  }

  // fix TS: program might be null
  if (!program) {
    return <p className="text-center mt-10">Program not ready…</p>
  }

  const admin = publicKey

  // -------------------------------------------------------------------------
  // PDAs
  // -------------------------------------------------------------------------
  const [poolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('pool'), admin.toBuffer()],
    program.programId
  )

  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), poolPda.toBuffer()],
    program.programId
  )

  const TOKEN_MINT = new PublicKey('So11111111111111111111111111111111111111112')

  function extractMsg(error: unknown): string {
    const err = error as AnchorError
    return err.message || 'Unknown error'
  }

  // ========================================================================
  // ACTIONS
  // ========================================================================

  async function initializePool() {
    setStatus('Initializing pool...')
    try {
      // @ts-ignore  ----> ignore TS typing for accounts()
      await program.methods
        .initializePool(new anchor.BN(1_000_000), 3, new anchor.BN(10))
        // @ts-ignore
        .accounts({
          admin,
          tokenMint: TOKEN_MINT,
          // @ts-ignore
          pool: poolPda,
          vault: vaultPda,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc()

      setStatus('Pool initialized!')
    } catch (e) {
      setStatus(extractMsg(e))
    }
  }

  async function joinPool() {
    setStatus('Joining pool...')
    try {
      const memberPub = admin
      const [memberPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), poolPda.toBuffer(), memberPub.toBuffer()],
        // @ts-ignore
        program.programId
      )

      // @ts-ignore
      await program.methods
        .joinPool()
        // @ts-ignore
        .accounts({
          memberSigner: memberPub,
          tokenMint: TOKEN_MINT,
          // @ts-ignore
          pool: poolPda,
          memberAccount: memberPda,
          memberAta: memberPub,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .rpc()

      setStatus('Joined pool!')
    } catch (e) {
      setStatus(extractMsg(e))
    }
  }

  async function activatePool() {
    setStatus('Activating pool...')
    try {
      // @ts-ignore
      await program.methods
        .activatePool()
        // @ts-ignore
        .accounts({
          anySigner: admin,
          // @ts-ignore
          pool: poolPda,
        })
        .rpc()

      setStatus('Pool activated!')
    } catch (e) {
      setStatus(extractMsg(e))
    }
  }

  async function contribute() {
    setStatus('Contributing...')
    try {
      const memberPub = admin
      const [memberPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), poolPda.toBuffer(), memberPub.toBuffer()],
        // @ts-ignore
        program.programId
      )

      // @ts-ignore
      await program.methods
        .contribute()
        // @ts-ignore
        .accounts({
          payer: memberPub,
          tokenMint: TOKEN_MINT,
          // @ts-ignore
          pool: poolPda,
          poolVault: vaultPda,
          memberAccount: memberPda,
          payerAta: memberPub,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .rpc()

      setStatus('Contribution sent!')
    } catch (e) {
      setStatus(extractMsg(e))
    }
  }

  async function settle() {
    setStatus('Settling cycle...')
    try {
        // @ts-ignore
      await program.methods
        .settleCurrentCycle()
        .accounts({
          caller: admin,
          tokenMint: TOKEN_MINT,
          // @ts-ignore
          pool: poolPda,
          poolVault: vaultPda,
          treasuryAta: admin,
          recipientMember: admin,
          recipientWallet: admin,
          recipientAta: admin,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .rpc()

      setStatus('Cycle settled!')
    } catch (e) {
      setStatus(extractMsg(e))
    }
  }

  async function withdraw() {
    setStatus('Withdrawing collateral...')
    try {
      const memberPub = admin
      const [memberPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), poolPda.toBuffer(), memberPub.toBuffer()],
        // @ts-ignore
        program.programId
      )

      // @ts-ignore
      await program.methods
        .withdrawCollateral()
        
        .accounts({
          memberSigner: memberPub,
          tokenMint: TOKEN_MINT,
          // @ts-ignore
          pool: poolPda,
          poolVault: vaultPda,
          memberAccount: memberPda,
          memberAta: memberPub,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .rpc()

      setStatus('Collateral withdrawn!')
    } catch (e) {
      setStatus(extractMsg(e))
    }
  }

  // ========================================================================
  // UI
  // ========================================================================
  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-4">
      <h2 className="text-2xl font-bold text-center">Roundpot Actions</h2>

      <button onClick={initializePool} className="btn-primary w-full">Initialize Pool</button>
      <button onClick={joinPool} className="btn-primary w-full">Join Pool</button>
      <button onClick={activatePool} className="btn-primary w-full">Activate Pool</button>
      <button onClick={contribute} className="btn-primary w-full">Contribute</button>
      <button onClick={settle} className="btn-primary w-full">Settle Current Cycle</button>
      <button onClick={withdraw} className="btn-primary w-full">Withdraw Collateral</button>

      <p className="text-center text-sm text-muted-foreground mt-4">{status}</p>
    </div>
  )
}
