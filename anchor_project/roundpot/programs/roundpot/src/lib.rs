use anchor_lang::prelude::*;

// ---------------------------------------------------------------------
// Program ID
// ---------------------------------------------------------------------
declare_id!("F7P3FGrMTm1Zqktxa5YTGCZBiVUFGjVY8BP976SFgJ8u");

// ---------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------
pub mod constants;
pub mod errors;
pub mod state;
pub mod instructions;

use instructions::*;

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
        instructions::initialize_pool::handle(ctx, contribution_amount, max_members, cycle_duration)
    }

    /// Join an existing pool (deposit collateral)
    pub fn join_pool(ctx: Context<JoinPool>) -> Result<()> {
        instructions::join_pool::handle(ctx)
    }

    /// Activate a full pool (start first cycle)
    pub fn activate_pool(ctx: Context<ActivatePool>) -> Result<()> {
        instructions::activate_pool::handle(ctx)
    }

    /// Contribute to the current cycle
    pub fn contribute(ctx: Context<Contribute>) -> Result<()> {
        instructions::contribute::handle(ctx)
    }

    /// Settle and distribute the current cycle pot
    pub fn settle_current_cycle(ctx: Context<SettleCurrentCycle>) -> Result<()> {
        instructions::settle_current_cycle::handle(ctx)
    }

    /// Withdraw remaining collateral after completion
    pub fn withdraw_collateral(ctx: Context<WithdrawCollateral>) -> Result<()> {
        instructions::withdraw_collateral::handle(ctx)
    }
}

// ---------------------------------------------------------------------
// END OF PROGRAM
// ---------------------------------------------------------------------
