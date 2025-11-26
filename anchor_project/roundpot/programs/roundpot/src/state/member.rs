use anchor_lang::prelude::*;

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

impl RoscaMember {
    pub const LEN: usize = 8
        + 32  // pool
        + 32  // member
        + 1   // position
        + 8   // collateral_deposited
        + 8   // collateral_slashable
        + 8   // total_contributed
        + 8   // total_received
        + 1   // has_received_payout
        + 1;  // last_paid_cycle
}