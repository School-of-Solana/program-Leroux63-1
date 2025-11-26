use anchor_lang::prelude::*;

#[error_code]
pub enum RoundPotError {
    #[msg("Pool is already active")]
    PoolAlreadyActive,

    #[msg("Pool is not yet full")]
    PoolNotFull,

    #[msg("You are not a registered member of this pool")]
    NotMember,

    #[msg("Contribution already made for this cycle")]
    AlreadyContributed,

    #[msg("Too early to settle this cycle")]
    CycleNotFinished,

    #[msg("Insufficient collateral")]
    InsufficientCollateral,

    #[msg("This pool is already complete")]
    PoolCompleted,

    #[msg("You cannot withdraw collateral before pool completion")]
    WithdrawBeforeEnd,

    #[msg("Invalid vault account")]
    InvalidVaultAccount,

    #[msg("Wrong cycle window")]
    WrongCycleWindow,

    #[msg("Invalid recipient for this cycle")]
    InvalidRecipient,
    
    #[msg("Failed to write account")]
    AccountWriteFailed,
}