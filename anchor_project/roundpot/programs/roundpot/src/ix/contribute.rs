use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, TokenAccount, Token, TransferChecked};
use crate::{errors::*, state::*, constants::*};

#[derive(Accounts)]
pub struct Contribute<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub token_mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [SEED_POOL, pool.admin.as_ref()],
        bump
    )]
    pub pool: Account<'info, RoscaPool>,

    #[account(
        mut,
        seeds = [SEED_VAULT, pool.key().as_ref()],
        bump,
        token::mint = token_mint,
        token::authority = pool
    )]
    pub pool_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            SEED_MEMBER,
            pool.key().as_ref(),
            payer.key().as_ref()
        ],
        bump,
        has_one = pool
    )]
    pub member_account: Account<'info, RoscaMember>,

    #[account(
        mut,
        token::mint = token_mint,
        token::authority = payer
    )]
    pub payer_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn contribute(ctx: Context<Contribute>) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let member = &mut ctx.accounts.member_account;

    require!(pool.is_active, RoundPotError::PoolNotFull);

    // timestamp
    let now = Clock::get()?.unix_timestamp;

    // --- WINDOW : cycle courant ---
    let cycle_start =
        pool.start_timestamp + (pool.current_cycle as i64 * pool.cycle_duration);
    let cycle_end = cycle_start + pool.cycle_duration;

    msg!("--- CONTRIBUTION WINDOW CHECK ---");
    msg!("now           = {}", now);
    msg!("cycle_start   = {}", cycle_start);
    msg!("cycle_end     = {}", cycle_end);
    msg!("current_cycle = {}", pool.current_cycle);

    require!(now >= cycle_start, RoundPotError::WrongCycleWindow);
    require!(now < cycle_end, RoundPotError::WrongCycleWindow);

    // --- déjà contribué ? ---
    require!(
        member.last_paid_cycle < pool.current_cycle as i8,
        RoundPotError::AlreadyContributed
    );

    // --- CPI TRANSFER ---
    let cpi_accounts = TransferChecked {
        from: ctx.accounts.payer_ata.to_account_info(),
        mint: ctx.accounts.token_mint.to_account_info(),
        to: ctx.accounts.pool_vault.to_account_info(),
        authority: ctx.accounts.payer.to_account_info(),
    };
    let cpi_ctx =
        CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);

    token::transfer_checked(
        cpi_ctx,
        pool.contribution_amount,
        ctx.accounts.token_mint.decimals,
    )?;

    // --- UPDATE STATE ---
    member.total_contributed += pool.contribution_amount;
    member.last_paid_cycle = pool.current_cycle as i8;

    Ok(())
}
