use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, TokenAccount},
    token_2022::{self, Token2022, TransferChecked},
};
use crate::constants::*;
use crate::errors::*;
use crate::state::*;

#[derive(Accounts)]
pub struct SettleCurrentCycle<'info> {
    #[account(mut)]
    pub caller: Signer<'info>,
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

    #[account(mut)]
    pub treasury_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [SEED_MEMBER, pool.key().as_ref(), recipient_wallet.key().as_ref()],
        bump,
        has_one = pool
    )]
    pub recipient_member: Account<'info, RoscaMember>,

    /// CHECK: used for seeds only
    pub recipient_wallet: AccountInfo<'info>,

    #[account(mut)]
    pub recipient_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token2022>,
}

pub fn handle(ctx: Context<SettleCurrentCycle>) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    require!(pool.is_active, RoundPotError::PoolNotFull);

    let now = Clock::get()?.unix_timestamp;
    let cycle_end = pool.start_timestamp + ((pool.current_cycle as i64 + 1) * pool.cycle_duration);
    require!(now >= cycle_end, RoundPotError::CycleNotFinished);

    require!(
        ctx.accounts.recipient_member.position == pool.current_cycle,
        RoundPotError::InvalidRecipient
    );

    for ai in ctx.remaining_accounts.iter() {
        if let Ok(mut data) = ai.try_borrow_mut_data() {
            if let Ok(mut member) = RoscaMember::try_deserialize_unchecked(&mut &data[..]) {
                if member.pool == pool.key()
                    && member.last_paid_cycle < pool.current_cycle as i8
                {
                    member.collateral_slashable = member
                        .collateral_slashable
                        .saturating_sub(pool.contribution_amount);
                    let _ = member.try_serialize(&mut &mut data[..]);
                }
            }
        }
    }

    let pot = (pool.max_members as u64) * pool.contribution_amount;
    let fee = pot * (FEE_BPS as u64) / 10_000;
    let net = pot - fee;

    let seeds: &[&[u8]] = &[SEED_POOL, pool.admin.as_ref(), &[ctx.bumps.pool]];
    let signer = &[&seeds[..]];

    for (amount, to) in [(fee, &ctx.accounts.treasury_ata), (net, &ctx.accounts.recipient_ata)] {
        let cpi = TransferChecked {
            from: ctx.accounts.pool_vault.to_account_info(),
            mint: ctx.accounts.token_mint.to_account_info(),
            to: to.to_account_info(),
            authority: pool.to_account_info(),
        };
        let cpi_ctx =
            CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi, signer);

        token_2022::transfer_checked(cpi_ctx, amount, ctx.accounts.token_mint.decimals)?;
    }

    let recipient_member = &mut ctx.accounts.recipient_member;
    recipient_member.total_received += net;
    recipient_member.has_received_payout = true;

    pool.current_cycle += 1;
    if pool.current_cycle == pool.max_members {
        pool.is_active = false;
    }
    Ok(())
}