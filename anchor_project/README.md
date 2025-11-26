# Roundpot – Solana ROSCA Program (School of Solana Final Project)

Roundpot is a ROSCA-style cyclic savings protocol implemented as a Solana smart contract using the Anchor framework.
Participants join a pool, contribute a fixed amount of tokens each cycle, and one member receives the pooled funds per cycle.
The program manages cycle timing, contributions, settlements, and final collateral withdrawals using PDAs and secure SPL token transfers.

This repository contains the Anchor program required for the School of Solana final submission.  
A separate frontend is deployed to interact with the Devnet-deployed program.

---

## 1. Features

- PDA-based architecture (pool, vault, members)
- Pool initialization with contribution amount, max members, and cycle duration
- Deterministic payout order based on join position
- Per-cycle contribution system enforced by timestamps
- Settlement logic performed cycle by cycle
- Treasury fee handling (configurable in the settlement)
- Final collateral withdrawal after all cycles are completed
- Full test suite including happy-path and unhappy-path tests

---

## 2. Program Architecture

### Program Derived Accounts (PDAs)

- `pool = ["pool", admin_pubkey]`
- `vault = ["vault", pool_pubkey]`
- `member = ["member", pool_pubkey, user_pubkey]`

### Core Instructions

1. `initialize_pool(contribution, max_members, cycle_duration)`
2. `join_pool()`
3. `activate_pool()`
4. `contribute()`
5. `settle_current_cycle()`
6. `withdraw_collateral()`

Each instruction uses Anchor account constraints and runtime checks to ensure correctness and safety.

### Token Handling

The program uses SPL Token Program (Token-2022 compatible) to manage:

- deposits
- vault-controlled payouts
- collateral withdrawals

All tokens transferred into the pool are held in a PDA-owned token account.

---

## 3. Tests

A complete test suite written in TypeScript validates:

### Happy-path tests
- pool initialization
- user registration
- pool activation
- cycle-based contributions
- settlement of cycles 0, 1, 2
- full round completion
- final collateral withdrawal

### Unhappy-path tests
- joining after pool is full
- double contribution attempts
- contribution outside the cycle window
- settlement with wrong recipient
- withdrawal before pool end

Run the tests with:

```bash
anchor run test
```
---

## 4. Deployment

### Required workflow (correct Anchor procedure)

1. Generate the program ID:

```bash
anchor keys sync
```

This updates:
- `Anchor.toml`
- `declare_id!(...)` in `programs/roundpot/src/lib.rs`

2. Build:

```bash
anchor build
```

3. Deploy to Devnet:

```bash
anchor deploy
```

## 5. Program ID (Devnet Deployment)

9PbdrKGxA7PdRbnSwjhDJbMirSCgSGCABtwEeBb3hyrj

Explorer link:

https://explorer.solana.com/address/9PbdrKGxA7PdRbnSwjhDJbMirSCgSGCABtwEeBb3hyrj?cluster=devnet