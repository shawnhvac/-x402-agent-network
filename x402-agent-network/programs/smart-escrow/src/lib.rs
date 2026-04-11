use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("8uqRBwpExWpzLHNRthtsvHtSam9vgWcLa9XfBKqWR8K");

/**
 * SmartEscrow - Rust/Anchor Implementation for Solana
 * 
 * Conditional payment engine for autonomous AI-to-AI agent economy
 * Modular design allows easy EVM (Polygon, Base, Cardano) ports later
 * 
 * Milestones:
 * - Deposit funds conditionally
 * - Release on milestone completion
 * - Dispute resolution with arbitrator
 * - Timeout refunds
 */

#[program]
pub mod smart_escrow {
    use super::*;

    // ===== ESCROW CREATION =====
    
    /**
     * Buyer agent creates escrow with milestone-based payments
     * 
     * Example: Vehicle wants tune-up (100 USDC)
     * Milestones:
     *   1. Inspection: 20 USDC
     *   2. Parts replacement: 50 USDC
     *   3. Testing & delivery: 30 USDC
     */
    pub fn create_escrow(
        ctx: Context<CreateEscrow>,
        total_amount_usdc: u64,
        service_type: String,
        deadline_minutes: u64,
        milestone_criteria: Vec<String>,
        milestone_payments: Vec<u64>,
    ) -> Result<()> {
        // Validate inputs
        require!(total_amount_usdc > 0, EscrowError::InvalidAmount);
        require!(
            milestone_criteria.len() == milestone_payments.len(),
            EscrowError::MilestonesMismatch
        );

        // Verify milestone sum equals total
        let total_milestones: u64 = milestone_payments.iter().sum();
        require!(
            total_milestones == total_amount_usdc,
            EscrowError::MilestonesSumMismatch
        );

        // Transfer USDC from buyer to escrow vault
        let transfer_instruction = Transfer {
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.escrow_vault.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                transfer_instruction,
            ),
            total_amount_usdc,
        )?;

        // Initialize escrow account
        let escrow = &mut ctx.accounts.escrow_agreement;
        escrow.escrow_id = ctx.accounts.escrow_counter.counter;
        escrow.buyer_agent = ctx.accounts.buyer.key();
        escrow.seller_agent = ctx.accounts.seller.key();
        escrow.total_amount_usdc = total_amount_usdc;
        escrow.service_type = service_type;
        escrow.created_at = Clock::get()?.unix_timestamp as u64;
        escrow.deadline = escrow.created_at + (deadline_minutes * 60);
        escrow.dispute_timeout = 24 * 60 * 60; // 24 hours in seconds
        escrow.state = EscrowState::Created;
        escrow.completed_milestones = 0;
        escrow.total_paid_to_seller = 0;
        escrow.disputed = false;

        // Create milestones
        escrow.milestones = vec![];
        for (i, (criteria, payment)) in milestone_criteria
            .iter()
            .zip(milestone_payments.iter())
            .enumerate()
        {
            escrow.milestones.push(Milestone {
                index: i as u32,
                description: criteria.clone(),
                payment_amount_usdc: *payment,
                completion_criteria: criteria.clone(),
                completed: false,
                completed_at: 0,
            });
        }

        // Increment escrow counter
        ctx.accounts.escrow_counter.counter += 1;

        emit!(EscrowCreated {
            escrow_id: escrow.escrow_id,
            buyer: escrow.buyer_agent,
            seller: escrow.seller_agent,
            amount: total_amount_usdc,
            deadline: escrow.deadline,
        });

        Ok(())
    }

    // ===== SELLER ACCEPTS ESCROW =====
    
    pub fn accept_escrow(ctx: Context<AcceptEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_agreement;

        // Only seller can accept
        require!(
            ctx.accounts.seller.key() == escrow.seller_agent,
            EscrowError::NotSellerAgent
        );

        // Can only accept in CREATED state
        require!(
            escrow.state == EscrowState::Created,
            EscrowError::InvalidState
        );

        // Deadline not passed
        let now = Clock::get()?.unix_timestamp as u64;
        require!(now < escrow.deadline, EscrowError::DeadlinePassed);

        escrow.state = EscrowState::Active;

        emit!(EscrowAccepted {
            escrow_id: escrow.escrow_id,
            seller: ctx.accounts.seller.key(),
        });

        Ok(())
    }

    // ===== MILESTONE COMPLETION =====
    
    /**
     * Seller signals milestone completion
     * Payment is automatically released
     */
    pub fn complete_milestone(
        ctx: Context<CompleteMilestone>,
        milestone_index: u32,
        result_hash: String,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_agreement;

        // Only seller can complete
        require!(
            ctx.accounts.seller.key() == escrow.seller_agent,
            EscrowError::NotSellerAgent
        );

        // Escrow must be active
        require!(escrow.state == EscrowState::Active, EscrowError::NotActive);

        // Valid milestone index
        require!(
            (milestone_index as usize) < escrow.milestones.len(),
            EscrowError::InvalidMilestone
        );

        let now = Clock::get()?.unix_timestamp as u64;
        require!(now < escrow.deadline, EscrowError::DeadlinePassed);

        let milestone = &mut escrow.milestones[milestone_index as usize];
        require!(!milestone.completed, EscrowError::AlreadyCompleted);

        // Mark milestone complete
        milestone.completed = true;
        milestone.completed_at = now;
        escrow.completed_milestones += 1;

        // Release payment to seller
        let payment_amount = milestone.payment_amount_usdc;
        
        let transfer_instruction = Transfer {
            from: ctx.accounts.escrow_vault.to_account_info(),
            to: ctx.accounts.seller_token_account.to_account_info(),
            authority: ctx.accounts.escrow_authority.to_account_info(),
        };

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_instruction,
                &[&ctx.accounts.escrow_authority.seeds[..]],
            ),
            payment_amount,
        )?;

        escrow.total_paid_to_seller += payment_amount;

        emit!(MilestoneCompleted {
            escrow_id: escrow.escrow_id,
            milestone_index: milestone_index as u32,
            payment_released: payment_amount,
        });

        // If all milestones done, mark escrow as completed
        if escrow.completed_milestones as usize == escrow.milestones.len() {
            escrow.state = EscrowState::Completed;
        }

        Ok(())
    }

    // ===== CLOSE ESCROW =====
    
    pub fn complete_escrow(ctx: Context<CompleteEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_agreement;

        // Only buyer can close
        require!(
            ctx.accounts.buyer.key() == escrow.buyer_agent,
            EscrowError::NotBuyerAgent
        );

        require!(
            escrow.state == EscrowState::Completed,
            EscrowError::NotCompleted
        );

        require!(
            escrow.completed_milestones as usize == escrow.milestones.len(),
            EscrowError::IncompleteWork
        );

        escrow.state = EscrowState::Resolved;

        Ok(())
    }

    // ===== DISPUTE HANDLING =====
    
    pub fn initialize_dispute(ctx: Context<InitializeDispute>, reason: String) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_agreement;

        // Only buyer or seller can initiate
        let is_buyer = ctx.accounts.initiator.key() == escrow.buyer_agent;
        let is_seller = ctx.accounts.initiator.key() == escrow.seller_agent;
        require!(is_buyer || is_seller, EscrowError::NotPartyToEscrow);

        // Dispute window must be open
        let now = Clock::get()?.unix_timestamp as u64;
        require!(
            now < escrow.deadline + escrow.dispute_timeout,
            EscrowError::DisputeWindowClosed
        );

        require!(!escrow.disputed, EscrowError::AlreadyDisputed);

        escrow.disputed = true;
        escrow.dispute_initiator = ctx.accounts.initiator.key();
        escrow.dispute_reason = reason;
        escrow.state = EscrowState::Disputed;

        emit!(DisputeInitiated {
            escrow_id: escrow.escrow_id,
            initiator: ctx.accounts.initiator.key(),
            reason: escrow.dispute_reason.clone(),
        });

        Ok(())
    }

    // ===== ARBITRATOR RESOLVES DISPUTE =====
    
    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        resolution: u8, // 0=RefundBuyer, 1=PaySeller, 2=SplitPayment
        buyer_amount: u64,
        seller_amount: u64,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_agreement;

        // Only arbitrator can resolve
        require!(
            ctx.accounts.arbitrator.key() == escrow.arbitrator,
            EscrowError::NotArbitrator
        );

        require!(escrow.disputed, EscrowError::NotDisputed);
        require!(
            escrow.state == EscrowState::Disputed,
            EscrowError::InvalidState
        );

        require!(
            buyer_amount + seller_amount <= escrow.total_amount_usdc,
            EscrowError::InvalidSplit
        );

        let resolution_enum = match resolution {
            0 => DisputeResolution::RefundBuyer,
            1 => DisputeResolution::PaySeller,
            2 => DisputeResolution::SplitPayment,
            _ => return Err(EscrowError::InvalidResolution.into()),
        };

        escrow.resolution = resolution_enum;
        escrow.state = EscrowState::Resolved;

        // Execute resolution
        match resolution_enum {
            DisputeResolution::RefundBuyer => {
                let refund_amount =
                    escrow.total_amount_usdc - escrow.total_paid_to_seller;
                if refund_amount > 0 {
                    let transfer_instruction = Transfer {
                        from: ctx.accounts.escrow_vault.to_account_info(),
                        to: ctx.accounts.buyer_token_account.to_account_info(),
                        authority: ctx.accounts.escrow_authority.to_account_info(),
                    };

                    token::transfer(
                        CpiContext::new_with_signer(
                            ctx.accounts.token_program.to_account_info(),
                            transfer_instruction,
                            &[&ctx.accounts.escrow_authority.seeds[..]],
                        ),
                        refund_amount,
                    )?;

                    emit!(EscrowRefunded {
                        escrow_id: escrow.escrow_id,
                        amount: refund_amount,
                    });
                }
            }
            DisputeResolution::PaySeller => {
                let remaining_amount =
                    escrow.total_amount_usdc - escrow.total_paid_to_seller;
                if remaining_amount > 0 {
                    let transfer_instruction = Transfer {
                        from: ctx.accounts.escrow_vault.to_account_info(),
                        to: ctx.accounts.seller_token_account.to_account_info(),
                        authority: ctx.accounts.escrow_authority.to_account_info(),
                    };

                    token::transfer(
                        CpiContext::new_with_signer(
                            ctx.accounts.token_program.to_account_info(),
                            transfer_instruction,
                            &[&ctx.accounts.escrow_authority.seeds[..]],
                        ),
                        remaining_amount,
                    )?;

                    emit!(PaymentReleased {
                        escrow_id: escrow.escrow_id,
                        recipient: escrow.seller_agent,
                        amount: remaining_amount,
                    });
                }
            }
            DisputeResolution::SplitPayment => {
                if buyer_amount > 0 {
                    let transfer_instruction = Transfer {
                        from: ctx.accounts.escrow_vault.to_account_info(),
                        to: ctx.accounts.buyer_token_account.to_account_info(),
                        authority: ctx.accounts.escrow_authority.to_account_info(),
                    };

                    token::transfer(
                        CpiContext::new_with_signer(
                            ctx.accounts.token_program.to_account_info(),
                            transfer_instruction,
                            &[&ctx.accounts.escrow_authority.seeds[..]],
                        ),
                        buyer_amount,
                    )?;
                }

                if seller_amount > escrow.total_paid_to_seller {
                    let additional_payment = seller_amount - escrow.total_paid_to_seller;
                    let transfer_instruction = Transfer {
                        from: ctx.accounts.escrow_vault.to_account_info(),
                        to: ctx.accounts.seller_token_account.to_account_info(),
                        authority: ctx.accounts.escrow_authority.to_account_info(),
                    };

                    token::transfer(
                        CpiContext::new_with_signer(
                            ctx.accounts.token_program.to_account_info(),
                            transfer_instruction,
                            &[&ctx.accounts.escrow_authority.seeds[..]],
                        ),
                        additional_payment,
                    )?;
                }
            }
        }

        emit!(DisputeResolved {
            escrow_id: escrow.escrow_id,
            resolution: resolution,
        });

        Ok(())
    }

    // ===== TIMEOUT REFUND =====
    
    pub fn request_timeout_refund(ctx: Context<RequestTimeoutRefund>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_agreement;

        // Only buyer can request
        require!(
            ctx.accounts.buyer.key() == escrow.buyer_agent,
            EscrowError::NotBuyerAgent
        );

        let now = Clock::get()?.unix_timestamp as u64;
        require!(now > escrow.deadline, EscrowError::DeadlineNotPassed);

        require!(escrow.state == EscrowState::Active, EscrowError::NotActive);

        let refund_amount = escrow.total_amount_usdc - escrow.total_paid_to_seller;
        if refund_amount > 0 {
            let transfer_instruction = Transfer {
                from: ctx.accounts.escrow_vault.to_account_info(),
                to: ctx.accounts.buyer_token_account.to_account_info(),
                authority: ctx.accounts.escrow_authority.to_account_info(),
            };

            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    transfer_instruction,
                    &[&ctx.accounts.escrow_authority.seeds[..]],
                ),
                refund_amount,
            )?;

            emit!(EscrowRefunded {
                escrow_id: escrow.escrow_id,
                amount: refund_amount,
            });
        }

        escrow.state = EscrowState::Refunded;

        Ok(())
    }
}

// ===== ACCOUNT STRUCTS =====

#[derive(Accounts)]
pub struct CreateEscrow<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: Seller address verified in instruction
    pub seller: AccountInfo<'info>,

    #[account(
        init,
        payer = buyer,
        space = 8 + EscrowAgreement::LEN,
        seeds = [b"escrow", buyer.key().as_ref(), &[0]],
        bump,
    )]
    pub escrow_agreement: Account<'info, EscrowAgreement>,

    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = buyer,
        token::mint = usdc_mint,
        token::authority = escrow_authority,
        seeds = [b"vault", escrow_agreement.key().as_ref()],
        bump,
    )]
    pub escrow_vault: Account<'info, TokenAccount>,

    /// CHECK: PDA authority for vault
    pub escrow_authority: AccountInfo<'info>,

    pub usdc_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,

    #[account(mut, seeds = [b"counter"], bump)]
    pub escrow_counter: Account<'info, EscrowCounter>,
}

#[derive(Accounts)]
pub struct AcceptEscrow<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(mut)]
    pub escrow_agreement: Account<'info, EscrowAgreement>,
}

#[derive(Accounts)]
pub struct CompleteMilestone<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(mut)]
    pub escrow_agreement: Account<'info, EscrowAgreement>,

    #[account(mut)]
    pub escrow_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,

    /// CHECK: PDA authority for vault
    pub escrow_authority: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CompleteEscrow<'info> {
    pub buyer: Signer<'info>,

    #[account(mut)]
    pub escrow_agreement: Account<'info, EscrowAgreement>,
}

#[derive(Accounts)]
pub struct InitializeDispute<'info> {
    pub initiator: Signer<'info>,

    #[account(mut)]
    pub escrow_agreement: Account<'info, EscrowAgreement>,
}

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    pub arbitrator: Signer<'info>,

    #[account(mut)]
    pub escrow_agreement: Account<'info, EscrowAgreement>,

    #[account(mut)]
    pub escrow_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,

    /// CHECK: PDA authority for vault
    pub escrow_authority: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RequestTimeoutRefund<'info> {
    pub buyer: Signer<'info>,

    #[account(mut)]
    pub escrow_agreement: Account<'info, EscrowAgreement>,

    #[account(mut)]
    pub escrow_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,

    /// CHECK: PDA authority for vault
    pub escrow_authority: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

// ===== ACCOUNT STATE =====

#[account]
pub struct EscrowAgreement {
    pub escrow_id: u64,
    pub buyer_agent: Pubkey,
    pub seller_agent: Pubkey,
    pub total_amount_usdc: u64,
    pub service_type: String,
    pub created_at: u64,
    pub deadline: u64,
    pub dispute_timeout: u64,
    pub state: EscrowState,
    pub milestones: Vec<Milestone>,
    pub completed_milestones: u32,
    pub total_paid_to_seller: u64,
    pub disputed: bool,
    pub dispute_initiator: Pubkey,
    pub dispute_reason: String,
    pub resolution: DisputeResolution,
    pub arbitrator: Pubkey,
}

impl EscrowAgreement {
    const LEN: usize = 8 + 32 + 32 + 8 + 64 + 8 + 8 + 8 + 1 + 4 + 1000 + 4 + 8 + 1 + 32 + 256 + 1 + 32;
}

#[account]
pub struct EscrowCounter {
    pub counter: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum EscrowState {
    Created,
    Active,
    Completed,
    Disputed,
    Resolved,
    Refunded,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum DisputeResolution {
    RefundBuyer,
    PaySeller,
    SplitPayment,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Milestone {
    pub index: u32,
    pub description: String,
    pub payment_amount_usdc: u64,
    pub completion_criteria: String,
    pub completed: bool,
    pub completed_at: u64,
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
pub struct MilestoneCompleted {
    pub escrow_id: u64,
    pub milestone_index: u32,
    pub payment_released: u64,
}

#[event]
pub struct DisputeInitiated {
    pub escrow_id: u64,
    pub initiator: Pubkey,
    pub reason: String,
}

#[event]
pub struct DisputeResolved {
    pub escrow_id: u64,
    pub resolution: u8,
}

#[event]
pub struct EscrowRefunded {
    pub escrow_id: u64,
    pub amount: u64,
}

#[event]
pub struct PaymentReleased {
    pub escrow_id: u64,
    pub recipient: Pubkey,
    pub amount: u64,
}

// ===== ERRORS =====

#[error_code]
pub enum EscrowError {
    #[msg("Invalid amount")]
    InvalidAmount,

    #[msg("Milestones mismatch")]
    MilestonesMismatch,

    #[msg("Milestones sum mismatch")]
    MilestonesSumMismatch,

    #[msg("Not seller agent")]
    NotSellerAgent,

    #[msg("Not buyer agent")]
    NotBuyerAgent,

    #[msg("Invalid state")]
    InvalidState,

    #[msg("Deadline passed")]
    DeadlinePassed,

    #[msg("Not active")]
    NotActive,

    #[msg("Invalid milestone")]
    InvalidMilestone,

    #[msg("Already completed")]
    AlreadyCompleted,

    #[msg("Not completed")]
    NotCompleted,

    #[msg("Incomplete work")]
    IncompleteWork,

    #[msg("Not party to escrow")]
    NotPartyToEscrow,

    #[msg("Dispute window closed")]
    DisputeWindowClosed,

    #[msg("Already disputed")]
    AlreadyDisputed,

    #[msg("Not arbitrator")]
    NotArbitrator,

    #[msg("Not disputed")]
    NotDisputed,

    #[msg("Invalid split")]
    InvalidSplit,

    #[msg("Invalid resolution")]
    InvalidResolution,

    #[msg("Deadline not passed")]
    DeadlineNotPassed,
}

use anchor_spl::token::Mint;
