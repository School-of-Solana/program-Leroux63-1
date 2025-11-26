use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, TokenAccount},
    token_2022::{self, Token2022, TransferChecked},
};
use crate::errors::*;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct Contribute<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

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
        seeds = [SEED_MEMBER, pool.key().as_ref(), payer.key().as_ref()],
        bump,
        has_one = pool
    )]
    pub member_account: Account<'info, RoscaMember>,

    #[account(mut, token::mint = token_mint, token::authority = payer)]
    pub payer_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token2022>,
}

pub fn handle(ctx: Context<Contribute>) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let member = &mut ctx.accounts.member_account;

    require!(pool.is_active, RoundPotError::PoolNotFull);

    // Vérifie que le cycle attendu correspond
    let now = Clock::get()?.unix_timestamp;
    let elapsed = now.saturating_sub(pool.start_timestamp);
    let expected = (elapsed / pool.cycle_duration) as u8;
    require!(expected == pool.current_cycle, RoundPotError::WrongCycleWindow);

    // Empêche de payer deux fois le même cycle
    require!(
        member.last_paid_cycle < pool.current_cycle as i8,
        RoundPotError::AlreadyContributed
    );

    // ✅ Transfert via Token-2022
    let cpi_accounts = TransferChecked {
        from: ctx.accounts.payer_ata.to_account_info(),
        mint: ctx.accounts.token_mint.to_account_info(),
        to: ctx.accounts.pool_vault.to_account_info(),
        authority: ctx.accounts.payer.to_account_info(),
    };
    let cpi_ctx =
        CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    token_2022::transfer_checked(
        cpi_ctx,
        pool.contribution_amount,
        ctx.accounts.token_mint.decimals,
    )?;

    // Mise à jour du membre
    member.total_contributed = member
        .total_contributed
        .checked_add(pool.contribution_amount)
        .unwrap();
    member.last_paid_cycle = pool.current_cycle as i8;

    Ok(())
}