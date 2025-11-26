use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, TokenAccount, Token, TransferChecked};
use crate::constants::*;
use crate::errors::*;
use crate::state::*;

#[derive(Accounts)]
pub struct WithdrawCollateral<'info> {
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
        mut,
        seeds = [SEED_MEMBER, pool.key().as_ref(), member_signer.key().as_ref()],
        bump,
        has_one = pool
    )]
    pub member_account: Account<'info, RoscaMember>,

    #[account(mut, token::mint = token_mint, token::authority = member_signer)]
    pub member_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn withdraw_collateral(ctx: Context<WithdrawCollateral>) -> Result<()> {
    let pool = &ctx.accounts.pool;
    let member = &mut ctx.accounts.member_account;

    require!(
        pool.current_cycle == pool.max_members,
        RoundPotError::WithdrawBeforeEnd
    );

    let amount = member.collateral_slashable;
    if amount == 0 {
        return Ok(());
    }

    let seeds: &[&[u8]] =
        &[SEED_POOL, pool.admin.as_ref(), &[ctx.bumps.pool]];
    let signer = &[&seeds[..]];

    let cpi_accounts = TransferChecked {
        from: ctx.accounts.pool_vault.to_account_info(),
        mint: ctx.accounts.token_mint.to_account_info(),
        to: ctx.accounts.member_ata.to_account_info(),
        authority: ctx.accounts.pool.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer,
    );

    token::transfer_checked(cpi_ctx, amount, ctx.accounts.token_mint.decimals)?;

    member.collateral_slashable = 0;

    Ok(())
}
