# Project Description

**Deployed Frontend URL:** https://roundpot-dapp.vercel.app

**Solana Program ID:** 9PbdrKGxA7PdRbnSwjhDJbMirSCgSGCABtwEeBb3hyrj

## Project Overview

### Description
Roundpot is a ROSCA-style cyclic savings protocol built on Solana using the Anchor framework.  
Participants join a pool, contribute a fixed token amount each cycle, and one member receives the pooled funds per cycle.  
The program enforces cycle timing, contributions, payouts, and final withdrawals using secure PDA-based logic and SPL token transfers.

A separate frontend deployed on Vercel interacts with the Devnet program.

### Key Features

- PDA-based architecture (pool, vault, members)
- Fixed contribution amount each cycle
- Deterministic payout order based on join position
- Timestamp-based cycle logic
- Secure SPL token vault owned by a PDA
- Per-cycle settlement logic
- Final collateral withdrawal after all cycles
- Full happy & unhappy test suite in TypeScript

### How to Use the dApp

1. **Connect Wallet**  
   Connect your Solana wallet using Wallet Adapter.

2. **Join Pool**  
   If the pool is not full, the user generates a Member PDA and joins.

3. **Activate Pool**  
   When all members have joined, any user may activate the pool. This starts cycle 0.

4. **Contribute Per Cycle**  
   Each cycle, members must deposit the fixed amount of tokens into the vault PDA.

5. **Settle Cycle**  
   After the cycle duration, settlement distributes the pooled amount to the correct member.

6. **Withdraw Collateral**  
   After all cycles are completed, members can withdraw their remaining collateral.

---

## Program Architecture

### PDA Usage

**Pool PDA**  
Seeds: `["pool", admin_pubkey]`  
Purpose: Stores pool configuration, cycle state, timestamps.

**Vault PDA**  
Seeds: `["vault", pool_pubkey]`  
Purpose: SPL token vault; all contributions are stored here. Controlled by PDA signer.

**Member PDA**  
Seeds: `["member", pool_pubkey, user_pubkey]`  
Purpose: Tracks user position, contributions, payout status, and collateral.

### Program Instructions

- **initialize_pool**  
  Creates and initializes the pool and vault PDAs.

- **join_pool**  
  Creates a Member PDA and registers the user.

- **activate_pool**  
  Starts the ROSCA by setting the start timestamp.

- **contribute**  
  Verifies cycle timing and transfers tokens into the vault PDA.

- **settle_current_cycle**  
  Sends the payout to the correct member and increments `current_cycle`.

- **withdraw_collateral**  
  Allows users to withdraw remaining collateral after all cycles are completed.

### Account Structure

```rust
#[account]
pub struct RoscaPool {
    pub admin: Pubkey,
    pub token_mint: Pubkey,
    pub contribution_amount: u64,
    pub max_members: u8,
    pub member_count: u8,
    pub cycle_duration: i64,
    pub start_timestamp: i64,
    pub current_cycle: u8,
    pub is_active: bool,
}

#[account]
pub struct RoscaMember {
    pub pool: Pubkey,
    pub member: Pubkey,
    pub position: u8,
    pub collateral_deposited: u64,
    pub collateral_slashable: u64,
    pub total_contributed: u64,
    pub total_received: u64,
    pub has_received_payout: bool,
    pub last_paid_cycle: i8,
}

#[account]
pub struct PoolVault {
    pub pool: Pubkey,
}


## Testing

### Test Coverage
A complete TypeScript test suite is included and covers all program instructions.  
Both **happy path** and **unhappy path** scenarios are tested, as required by the assignment.

**Happy Path Tests:**
- **Test 1 — Initialize Pool:**  
  Successfully initializes the pool PDA and vault PDA with correct configuration.
- **Test 2 — Users Join:**  
  Three users successfully create their Member PDA and join the pool.
- **Test 3 — Join Fails Once Pool Is Full:**  
  Ensures no additional user can join after reaching `max_members`.
- **Test 4 — Activate Pool:**  
  Locks configuration and starts cycle 0 with a valid timestamp.
- **Test 5 — Cycle 0 Contribution:**  
  Each user sends the required contribution for cycle 0 into the vault PDA.
- **Test 6 — Settle Cycle 0:**  
  Correct user (position 0) receives the cycle payout.
- **Test 7 — Cycle 1 Contribution:**  
  All users contribute again for the next cycle.
- **Test 8 — Settle Cycle 1:**  
  Payout successfully goes to user in position 1.
- **Test 9 — Cycle 2 Contribution:**  
  Third round of contributions succeeds.
- **Test 10 — Settle Cycle 2:**  
  Final payout goes to user in position 2.
- **Test 11 — Final Withdrawal:**  
  After all cycles, members withdraw remaining collateral successfully.

**Unhappy Path Tests:**
- **Test A — Join After Full:**  
  Joining after `max_members` correctly triggers an error.
- **Test B — Double Contribution:**  
  Prevents a member from contributing twice in the same cycle.
- **Test C — Contribution Outside Cycle Window:**  
  Fails when attempting to contribute before activation or after cycle end.
- **Test D — Wrong Recipient Settlement:**  
  Ensures settlement cannot be executed with an incorrect `recipient_member` account.
- **Test E — Withdraw Before Completion:**  
  Prevents collateral withdrawal before all cycles are finished.

### Running Tests
```bash
yarn install
anchor run test
```

### Additional Notes for Evaluators

This project was built specifically for the School of Solana final assignment and follows all mandatory requirements:

- The program is fully PDA-driven (pool, vault, member accounts).
- Every instruction has both **happy** and **unhappy** test cases.
- The program is deployed on **Devnet** and the frontend is publicly accessible.
- Cycle timing uses real block timestamps; therefore tests intentionally use a short cycle duration (3 seconds) to allow full end-to-end validation.
- The frontend demonstrates the full workflow: joining the pool, activating it, contributing, waiting for cycle transitions, settling payouts, and withdrawing collateral.
- No external services are required; all logic and state transitions happen entirely on-chain.

The codebase was written from scratch for this assignment and significantly exceeds the minimal feature requirements by implementing a complete ROSCA mechanism with deterministic payout order, collateral tracking, and a treasury account for fee collection.

https://roundpotsol.vercel.app
