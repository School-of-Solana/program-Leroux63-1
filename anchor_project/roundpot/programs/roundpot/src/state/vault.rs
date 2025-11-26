use anchor_lang::prelude::*;

#[account]
pub struct PoolVault {
    pub pool: Pubkey,
}

impl PoolVault {
    pub const LEN: usize = 8 + 32;
}