use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount, Token};
use crate::errors::*;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct JoinPool<'info> {
    #[account(mut)]
    pub member_signer: Signer<'info>,

    pub token_mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [SEED_POOL, pool.admin.as_ref()],
        bump
    )]
    pub pool: Account<'info, RoscaPool>,

    #[account(
        init,
        payer = member_signer,
        space = RoscaMember::LEN,
        seeds = [
            SEED_MEMBER,
            pool.key().as_ref(),
            member_signer.key().as_ref()
        ],
        bump
    )]
    pub member_account: Account<'info, RoscaMember>,

    #[account(mut)]
    pub member_ata: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn join_pool(ctx: Context<JoinPool>) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    require!(!pool.is_active, RoundPotError::PoolAlreadyActive);
    require!(
        pool.member_count < pool.max_members,
        RoundPotError::PoolCompleted
    );

    let member = &mut ctx.accounts.member_account;

    member.pool = pool.key();
    member.member = ctx.accounts.member_signer.key();
    member.position = pool.member_count; // 👈 ORDRE D’ARRIVÉE = CYCLE DU PAYOUT
    member.collateral_deposited = 0;
    member.collateral_slashable = 0;
    member.total_contributed = 0;
    member.total_received = 0;
    member.last_paid_cycle = -1;
    member.has_received_payout = false;

    pool.member_count += 1;

    Ok(())
}
