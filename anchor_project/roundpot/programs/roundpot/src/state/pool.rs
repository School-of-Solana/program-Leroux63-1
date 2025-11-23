use anchor_lang::prelude::*;

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

impl RoscaPool {
    pub const LEN: usize = 8  // discriminator
        + 32  // admin
        + 32  // token_mint
        + 8   // contribution_amount
        + 1   // max_members
        + 1   // member_count
        + 8   // cycle_duration
        + 8   // start_timestamp
        + 1   // current_cycle
        + 1;  // is_active
}
