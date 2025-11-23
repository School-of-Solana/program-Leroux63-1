//! Global constants for the RoundPot program

pub const SEED_POOL: &[u8] = b"pool";
pub const SEED_MEMBER: &[u8] = b"member";
pub const SEED_VAULT: &[u8] = b"vault";

// Default collateral policy (multiplier of contribution)
pub const DEFAULT_COLLATERAL_MULTIPLIER: u8 = 4; // equivalent to (N - 1) for 5 members

pub const FEE_BPS: u16 = 100; // 1%
// SEED_POOL, SEED_MEMBER, SEED_VAULT déjà présents

