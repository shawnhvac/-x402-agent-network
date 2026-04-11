use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("11111111111111111111111111111112");

#[program]
pub mod smart_escrow {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.escrow_count = 0;
        Ok(())
    }

    pub fn create_escrow(
        ctx: Context<CreateEscrow>,
        escrow_id: u64,
        seller: Pubkey,
        amount: u64,
        deadline: u64,
        vault_bump: u8,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        escrow.escrow_id = escrow_id;
        escrow.buyer = ctx.accounts.buyer.key();
        escrow.seller = seller;
        escrow.amount = amount;
        escrow.deadline = deadline;
        escrow.state = EscrowState::Active;
        escrow.created_at = Clock::get()?.unix_timestamp as u64;
        escrow.vault_bump = vault_bump;

        // Transfer USDC from buyer to escrow vault
        let transfer_instruction = Transfer {
            from: ctx.accounts.buyer_usdc.to_account_info(),
            to: ctx.accounts.escrow_vault.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                transfer_instruction,
            ),
            amount,
        )?;

        emit!(EscrowCreated {
            escrow_id,
            buyer: escrow.buyer,
            seller,
            amount,
            deadline,
        });

        Ok(())
    }

    pub fn accept_escrow(ctx: Context<AcceptEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.seller == ctx.accounts.seller.key(), EscrowError::NotSeller);
        require!(
            escrow.state == EscrowState::Active,
            EscrowError::InvalidState
        );

        escrow.state = EscrowState::Accepted;

        emit!(EscrowAccepted {
            escrow_id: escrow.escrow_id,
            seller: escrow.seller,
        });

        Ok(())
    }

    pub fn release_payment(ctx: Context<ReleasePayment>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;

        require!(escrow.buyer == ctx.accounts.buyer.key(), EscrowError::NotBuyer);
        require!(
            escrow.state == EscrowState::Accepted,
            EscrowError::InvalidState
        );

        // Transfer USDC from escrow vault to seller
        let transfer_instruction = Transfer {
            from: ctx.accounts.escrow_vault.to_account_info(),
            to: ctx.accounts.seller_usdc.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
        };

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_instruction,
                &[&[
                    b"escrow_vault",
                    escrow.key().as_ref(),
                    &[escrow.vault_bump],
                ]],
            ),
            escrow.amount,
        )?;

        escrow.state = EscrowState::Completed;

        emit!(PaymentReleased {
            escrow_id: escrow.escrow_id,
            seller: escrow.seller,
            amount: escrow.amount,
        });

        Ok(())
    }

    pub fn refund_escrow(ctx: Context<RefundEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;

        require!(escrow.buyer == ctx.accounts.buyer.key(), EscrowError::NotBuyer);
        require!(
            escrow.state == EscrowState::Active || escrow.state == EscrowState::Accepted,
            EscrowError::InvalidState
        );

        let now = Clock::get()?.unix_timestamp as u64;
        require!(now > escrow.deadline, EscrowError::DeadlineNotPassed);

        // Transfer USDC back to buyer
        let transfer_instruction = Transfer {
            from: ctx.accounts.escrow_vault.to_account_info(),
            to: ctx.accounts.buyer_usdc.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
        };

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_instruction,
                &[&[
                    b"escrow_vault",
                    escrow.key().as_ref(),
                    &[escrow.vault_bump],
                ]],
            ),
            escrow.amount,
        )?;

        escrow.state = EscrowState::Refunded;

        emit!(EscrowRefunded {
            escrow_id: escrow.escrow_id,
            amount: escrow.amount,
        });

        Ok(())
    }
}

// ===== ACCOUNT STRUCTS =====

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = 8 + EscrowCounter::LEN,
        seeds = [b"counter"],
        bump
    )]
    pub counter: Account<'info, EscrowCounter>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateEscrow<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        init,
        payer = buyer,
        space = 8 + EscrowAgreement::LEN,
        seeds = [b"escrow", buyer.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, EscrowAgreement>,

    #[account(mut)]
    pub buyer_usdc: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = buyer,
        token::mint = usdc_mint,
        token::authority = vault_authority,
        seeds = [b"vault", escrow.key().as_ref()],
        bump
    )]
    pub escrow_vault: Account<'info, TokenAccount>,

    /// CHECK: PDA for vault authority
    #[account(
        seeds = [b"escrow_vault", escrow.key().as_ref()],
        bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    pub usdc_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AcceptEscrow<'info> {
    pub seller: Signer<'info>,

    #[account(mut)]
    pub escrow: Account<'info, EscrowAgreement>,
}

#[derive(Accounts)]
pub struct ReleasePayment<'info> {
    pub buyer: Signer<'info>,

    #[account(mut)]
    pub escrow: Account<'info, EscrowAgreement>,

    #[account(mut)]
    pub escrow_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller_usdc: Account<'info, TokenAccount>,

    /// CHECK: PDA for vault authority
    #[account(
        seeds = [b"escrow_vault", escrow.key().as_ref()],
        bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RefundEscrow<'info> {
    pub buyer: Signer<'info>,

    #[account(mut)]
    pub escrow: Account<'info, EscrowAgreement>,

    #[account(mut)]
    pub escrow_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer_usdc: Account<'info, TokenAccount>,

    /// CHECK: PDA for vault authority
    #[account(
        seeds = [b"escrow_vault", escrow.key().as_ref()],
        bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
}

// ===== ACCOUNT STATE =====

#[account]
pub struct EscrowAgreement {
    pub escrow_id: u64,
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub amount: u64,
    pub state: EscrowState,
    pub created_at: u64,
    pub deadline: u64,
    pub vault_bump: u8,
}

impl EscrowAgreement {
    const LEN: usize = 8 + 32 + 32 + 8 + 1 + 8 + 8 + 1;
}

#[account]
pub struct EscrowCounter {
    pub escrow_count: u64,
}

impl EscrowCounter {
    const LEN: usize = 8;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum EscrowState {
    Active,
    Accepted,
    Completed,
    Refunded,
}

// ===== EVENTS =====

#[event]
pub struct EscrowCreated {
    pub escrow_id: u64,
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub amount: u64,
    pub deadline: u64,
}

#[event]
pub struct EscrowAccepted {
    pub escrow_id: u64,
    pub seller: Pubkey,
}

#[event]
pub struct PaymentReleased {
    pub escrow_id: u64,
    pub seller: Pubkey,
    pub amount: u64,
}

#[event]
pub struct EscrowRefunded {
    pub escrow_id: u64,
    pub amount: u64,
}

// ===== ERRORS =====

#[error_code]
pub enum EscrowError {
    #[msg("Not buyer")]
    NotBuyer,

    #[msg("Not seller")]
    NotSeller,

    #[msg("Invalid state")]
    InvalidState,

    #[msg("Deadline not passed")]
    DeadlineNotPassed,
}
