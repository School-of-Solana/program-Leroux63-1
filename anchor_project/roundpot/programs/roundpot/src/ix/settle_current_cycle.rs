use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, TokenAccount, Token, TransferChecked};
use crate::{errors::*, state::*, constants::*};

#[derive(Accounts)]
pub struct SettleCurrentCycle <'info> {
    pub caller: Signer<'info>,

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

    #[account(mut)]
    pub treasury_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            SEED_MEMBER,
            pool.key().as_ref(),
            recipient_wallet.key().as_ref()
        ],
        bump
    )]
    pub recipient_member: Account<'info, RoscaMember>,

    /// CHECK
    pub recipient_wallet: UncheckedAccount<'info>,

    #[account(mut)]
    pub recipient_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn settle_current_cycle(ctx: Context<SettleCurrentCycle>) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let recipient = &mut ctx.accounts.recipient_member;

    require!(pool.is_active, RoundPotError::PoolNotFull);

    // TIME CHECK
    let now = Clock::get()?.unix_timestamp;
    let required_finish =
        (pool.current_cycle as i64 + 1) * pool.cycle_duration + pool.start_timestamp;

    msg!("--- SETTLE WINDOW CHECK ---");
    msg!("now            = {}", now);
    msg!("required_finish= {}", required_finish);
    msg!("current_cycle  = {}", pool.current_cycle);

    require!(now >= required_finish, RoundPotError::CycleNotFinished);

    // CORRECT WINNER
    require!(
        recipient.position == pool.current_cycle,
        RoundPotError::InvalidRecipient
    );

    // POT = total contributions of this cycle
    let pot = pool.contribution_amount * pool.max_members as u64;

    // SIGNER SEEDS
    let signer_seeds: &[&[u8]] = &[
        SEED_POOL,
        pool.admin.as_ref(),
        &[ctx.bumps.pool]
    ];

    token::transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.pool_vault.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
                to: ctx.accounts.recipient_ata.to_account_info(),
                authority: pool.to_account_info(),
            },
            &[signer_seeds],
        ),
        pot,
        ctx.accounts.token_mint.decimals,
    )?;

    // STATE UPDATE
    recipient.total_received += pot;
    recipient.has_received_payout = true;

    pool.current_cycle += 1;

    if pool.current_cycle == pool.max_members {
        pool.is_active = false;
    }

    Ok(())
}
