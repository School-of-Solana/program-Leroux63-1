use anchor_lang::prelude::*;

declare_id!("9PbdrKGxA7PdRbnSwjhDJbMirSCgSGCABtwEeBb3hyrj");

// ---------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------
pub mod constants;
pub mod errors;
pub mod state;
pub mod ix;

use ix::*;

// ---------------------------------------------------------------------
// Program Declaration
// ---------------------------------------------------------------------
#[program]
pub mod roundpot {
    use super::*;

    /// Create a new RoundPot pool
    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        contribution_amount: u64,
        max_members: u8,
        cycle_duration: i64,
    ) -> Result<()> {
        ix::initialize_pool::handle(ctx, contribution_amount, max_members, cycle_duration)
    }

    /// Join an existing pool (deposit collateral)
    pub fn join_pool(ctx: Context<JoinPool>) -> Result<()> {
        ix::join_pool::handle(ctx)
    }

    /// Activate a full pool (start first cycle)
    pub fn activate_pool(ctx: Context<ActivatePool>) -> Result<()> {
        ix::activate_pool::handle(ctx)
    }

    /// Contribute to the current cycle
    pub fn contribute(ctx: Context<Contribute>) -> Result<()> {
        ix::contribute::handle(ctx)
    }

    /// Settle and distribute the current cycle pot
    pub fn settle_current_cycle(ctx: Context<SettleCurrentCycle>) -> Result<()> {
        ix::settle_current_cycle::handle(ctx)
    }

    /// Withdraw remaining collateral after completion
    pub fn withdraw_collateral(ctx: Context<WithdrawCollateral>) -> Result<()> {
        ix::withdraw_collateral::handle(ctx)
    }
}

// ---------------------------------------------------------------------
// END OF PROGRAM
// ---------------------------------------------------------------------