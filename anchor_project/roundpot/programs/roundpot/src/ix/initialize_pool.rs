use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount};
use anchor_spl::token::{Token};
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
#[instruction(contribution_amount: u64, max_members: u8, cycle_duration: i64)]
pub struct InitializePool<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    pub token_mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = admin,
        space = RoscaPool::LEN,
        seeds = [SEED_POOL, admin.key().as_ref()],
        bump
    )]
    pub pool: Account<'info, RoscaPool>,

    #[account(
        init,
        payer = admin,
        token::mint = token_mint,
        token::authority = pool,
        seeds = [SEED_VAULT, pool.key().as_ref()],
        bump
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn initialize_pool(
    ctx: Context<InitializePool>,
    contribution_amount: u64,
    max_members: u8,
    cycle_duration: i64,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    pool.admin = ctx.accounts.admin.key();
    pool.token_mint = ctx.accounts.token_mint.key();
    pool.contribution_amount = contribution_amount;
    pool.max_members = max_members;
    pool.member_count = 0;
    pool.cycle_duration = cycle_duration;
    pool.start_timestamp = 0;
    pool.current_cycle = 0;
    pool.is_active = false;
    Ok(())
}