use anchor_lang::prelude::*;
use crate::errors::*;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct ActivatePool<'info> {
    #[account(mut)]
    pub any_signer: Signer<'info>, // anyone may trigger once full

    #[account(
        mut,
        seeds = [SEED_POOL, pool.admin.as_ref()],
        bump
    )]
    pub pool: Account<'info, RoscaPool>,
}

pub fn handle(ctx: Context<ActivatePool>) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    require!(!pool.is_active, RoundPotError::PoolAlreadyActive);
    require!(pool.member_count == pool.max_members, RoundPotError::PoolNotFull);

    pool.is_active = true;
    pool.current_cycle = 0;
    pool.start_timestamp = Clock::get()?.unix_timestamp;

    Ok(())
}