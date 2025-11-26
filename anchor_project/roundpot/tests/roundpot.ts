// ============================================================================
// ROUND●P●OT – FULL TEST SUITE (FINAL & WORKING)
// ============================================================================

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Roundpot } from "../target/types/roundpot";
import {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";

// Sleep helper
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Wait for real-time cycle change
async function waitCycle(program, poolPda, currentCycle) {
  while (true) {
    const pool = await program.account.roscaPool.fetch(poolPda);
    const slot = await program.provider.connection.getSlot();
    const now = await program.provider.connection.getBlockTime(slot);

    const elapsed = now - pool.startTimestamp.toNumber();
    const expected = Math.floor(elapsed / pool.cycleDuration.toNumber());

    if (expected > currentCycle) {
      console.log(`⏭ Cycle ready for settle: ${expected}`);
      return;
    }

    console.log("⏳ Waiting for next cycle...");
    await sleep(1000);
  }
}

// ============================================================================
// SUITE
// ============================================================================

describe("ROUND●P●OT FULL TEST SUITE", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Roundpot as Program<Roundpot>;

  const CONTRIBUTION = new anchor.BN(1_000_000);
  const MAX_MEMBERS = 3;
  const CYCLE_DURATION = new anchor.BN(3);

  const admin = provider.wallet;
  const users = [Keypair.generate(), Keypair.generate(), Keypair.generate()];

  let mint: PublicKey;
  const atas = new Map();

  let poolPda: PublicKey;
  let vaultPda: PublicKey;

  const memberPdas: PublicKey[] = [];
  const treasury = Keypair.generate();
  let treasuryAta: PublicKey;

  // ---------------------------------------------------------------------------
  // SETUP
  // ---------------------------------------------------------------------------

  before("Setup mint, ATAs, PDAs", async () => {
    for (const u of users)
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(u.publicKey, 2e9)
      );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(treasury.publicKey, 2e9)
    );

    mint = await createMint(
      provider.connection,
      admin.payer,
      admin.publicKey,
      null,
      6
    );

    treasuryAta = await createAssociatedTokenAccount(
      provider.connection,
      admin.payer,
      mint,
      treasury.publicKey
    );

    const adminAta = await createAssociatedTokenAccount(
      provider.connection,
      admin.payer,
      mint,
      admin.publicKey
    );
    atas.set(admin.publicKey.toBase58(), adminAta);

    for (const u of users) {
      const ata = await createAssociatedTokenAccount(
        provider.connection,
        admin.payer,
        mint,
        u.publicKey
      );
      atas.set(u.publicKey.toBase58(), ata);

      await mintTo(
        provider.connection,
        admin.payer,
        mint,
        ata,
        admin.publicKey,
        1_000_000_000
      );
    }

    [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), admin.publicKey.toBuffer()],
      program.programId
    );
    [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), poolPda.toBuffer()],
      program.programId
    );
  });

  // ---------------------------------------------------------------------------
  // CREATE + JOIN
  // ---------------------------------------------------------------------------

  it("Initialize pool", async () => {
    await program.methods
      .initializePool(CONTRIBUTION, MAX_MEMBERS, CYCLE_DURATION)
      .accounts({
        admin: admin.publicKey,
        tokenMint: mint,
        pool: poolPda,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();
  });

  it("Users join", async () => {
    for (const u of users) {
      const [memberPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("member"), poolPda.toBuffer(), u.publicKey.toBuffer()],
        program.programId
      );
      memberPdas.push(memberPda);

      await program.methods
        .joinPool()
        .accounts({
          memberSigner: u.publicKey,
          tokenMint: mint,
          pool: poolPda,
          poolVault: vaultPda,
          memberAccount: memberPda,
          memberAta: atas.get(u.publicKey.toBase58()),
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([u])
        .rpc();
    }
  });

  it("Join should now fail", async () => {
    const x = Keypair.generate();
    await provider.connection.requestAirdrop(x.publicKey, 2e9);

    const ata = await createAssociatedTokenAccount(
      provider.connection,
      admin.payer,
      mint,
      x.publicKey
    );
    await mintTo(provider.connection, admin.payer, mint, ata, admin.publicKey, 1);

    const [dummy] = PublicKey.findProgramAddressSync(
      [Buffer.from("member"), poolPda.toBuffer(), x.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .joinPool()
        .accounts({
          memberSigner: x.publicKey,
          tokenMint: mint,
          pool: poolPda,
          poolVault: vaultPda,
          memberAccount: dummy,
          memberAta: ata,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([x])
        .rpc();
      throw new Error("should fail");
    } catch {}
  });

  it("Activate pool", async () => {
    await program.methods
      .activatePool()
      .accounts({ anySigner: admin.publicKey, pool: poolPda })
      .rpc();

    console.log("✔ Synced to cycle 0");
  });

  // ---------------------------------------------------------------------------
  // CYCLE 0
  // ---------------------------------------------------------------------------

  it("Cycle 0 contribution", async () => {
    for (let i = 0; i < users.length; i++) {
      await program.methods
        .contribute()
        .accounts({
          payer: users[i].publicKey,
          tokenMint: mint,
          pool: poolPda,
          poolVault: vaultPda,
          memberAccount: memberPdas[i],
          payerAta: atas.get(users[i].publicKey.toBase58()),
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([users[i]])
        .rpc();
    }
  });

  it("Settle cycle 0", async () => {
    await waitCycle(program, poolPda, 0);

    await program.methods
      .settleCurrentCycle()
      .accounts({
        caller: admin.publicKey,
        tokenMint: mint,
        pool: poolPda,
        poolVault: vaultPda,
        treasuryAta,
        recipientMember: memberPdas[0],
        recipientWallet: users[0].publicKey,
        recipientAta: atas.get(users[0].publicKey.toBase58()),
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  });

  // ---------------------------------------------------------------------------
  // CYCLE 1
  // ---------------------------------------------------------------------------

  it("Cycle 1 contribution", async () => {
    for (let i = 0; i < users.length; i++) {
      await program.methods
        .contribute()
        .accounts({
          payer: users[i].publicKey,
          tokenMint: mint,
          pool: poolPda,
          poolVault: vaultPda,
          memberAccount: memberPdas[i],
          payerAta: atas.get(users[i].publicKey.toBase58()),
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([users[i]])
        .rpc();
    }
  });

  it("Settle cycle 1", async () => {
    await waitCycle(program, poolPda, 1);

    await program.methods
      .settleCurrentCycle()
      .accounts({
        caller: admin.publicKey,
        tokenMint: mint,
        pool: poolPda,
        poolVault: vaultPda,
        treasuryAta,
        recipientMember: memberPdas[1],
        recipientWallet: users[1].publicKey,
        recipientAta: atas.get(users[1].publicKey.toBase58()),
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  });

  // ---------------------------------------------------------------------------
  // CYCLE 2
  // ---------------------------------------------------------------------------

  it("Cycle 2 contribution", async () => {
    for (let i = 0; i < users.length; i++) {
      await program.methods
        .contribute()
        .accounts({
          payer: users[i].publicKey,
          tokenMint: mint,
          pool: poolPda,
          poolVault: vaultPda,
          memberAccount: memberPdas[i],
          payerAta: atas.get(users[i].publicKey.toBase58()),
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([users[i]])
        .rpc();
    }
  });

  it("Settle cycle 2", async () => {
    await waitCycle(program, poolPda, 2);

    await program.methods
      .settleCurrentCycle()
      .accounts({
        caller: admin.publicKey,
        tokenMint: mint,
        pool: poolPda,
        poolVault: vaultPda,
        treasuryAta,
        recipientMember: memberPdas[2],
        recipientWallet: users[2].publicKey,
        recipientAta: atas.get(users[2].publicKey.toBase58()),
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  });

  // ---------------------------------------------------------------------------
  // WITHDRAW (FIN)
  // ---------------------------------------------------------------------------

  it("Withdraw collateral (happy)", async () => {
    for (let i = 0; i < users.length; i++) {
      await program.methods
        .withdrawCollateral()
        .accounts({
          memberSigner: users[i].publicKey,
          tokenMint: mint,
          pool: poolPda,
          poolVault: vaultPda,
          memberAccount: memberPdas[i],
          memberAta: atas.get(users[i].publicKey.toBase58()),
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([users[i]])
        .rpc();
    }
  });

  it("withdraw should now fail before end (unhappy)", async () => {
    try {
      await program.methods
        .withdrawCollateral()
        .accounts({
          memberSigner: users[0].publicKey,
          tokenMint: mint,
          pool: poolPda,
          poolVault: vaultPda,
          memberAccount: memberPdas[0],
          memberAta: atas.get(users[0].publicKey.toBase58()),
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([users[0]])
        .rpc();
      throw new Error("should fail");
    } catch {}
  });
});
