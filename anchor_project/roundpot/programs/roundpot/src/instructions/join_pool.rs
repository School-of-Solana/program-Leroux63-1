use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, TokenAccount},
    token_2022::{self, Token2022, TransferChecked},
};
use crate::constants::*;
use crate::errors::*;
use crate::state::*;

#[derive(Accounts)]
pub struct JoinPool<'info> {
    #[account(mut)]
    pub member_signer: Signer<'info>,

    pub token_mint: Account<'info, Mint>,

    #[account(mut, seeds = [SEED_POOL, pool.admin.as_ref()], bump)]
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
        init,
        payer = member_signer,
        space = RoscaMember::LEN,
        seeds = [SEED_MEMBER, pool.key().as_ref(), member_signer.key().as_ref()],
        bump
    )]
    pub member_account: Account<'info, RoscaMember>,

    #[account(mut, token::mint = token_mint, token::authority = member_signer)]
    pub member_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<JoinPool>) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    require!(!pool.is_active, RoundPotError::PoolAlreadyActive);
    require!(pool.member_count < pool.max_members, RoundPotError::PoolCompleted);

    // Dépôt du collatéral requis
    let required_collateral = (pool.max_members as u64 - 1) * pool.contribution_amount;

    // ✅ Transfert Token-2022 sécurisé (checked)
    let cpi_accounts = TransferChecked {
        from: ctx.accounts.member_ata.to_account_info(),
        mint: ctx.accounts.token_mint.to_account_info(),
        to: ctx.accounts.pool_vault.to_account_info(),
        authority: ctx.accounts.member_signer.to_account_info(),
    };
    let cpi_ctx =
        CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    token_2022::transfer_checked(
        cpi_ctx,
        required_collateral,
        ctx.accounts.token_mint.decimals,
    )?;

    // Init du membre
    let m = &mut ctx.accounts.member_account;
    m.pool = pool.key();
    m.member = ctx.accounts.member_signer.key();
    m.position = pool.member_count;
    m.collateral_deposited = required_collateral;
    m.collateral_slashable = required_collateral;
    m.total_contributed = 0;
    m.total_received = 0;
    m.has_received_payout = false;
    m.last_paid_cycle = -1;

    pool.member_count += 1;
    Ok(())
}
