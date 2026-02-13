use anchor_lang::prelude::*;

declare_id!("5tjey2DhszrAfN8u6CRxZ4RwyfkV3fXpqyXxVj7prtNo");

pub const ADMIN: Pubkey = pubkey!("EdyfuA8XdLjmSafUxVUuhmMZSFVXZ8u4G1MTLTtZDyNk");

#[program]
pub mod document_registry {
    use super::*;

    pub fn anchor_document(ctx: Context<AnchorDocument>, doc_hash: [u8; 32]) -> Result<()> {
        require!(doc_hash != [0u8; 32], RegistryError::InvalidDocHash);

        // admin only
        require_keys_eq!(ctx.accounts.authority.key(), ADMIN, RegistryError::NotAdmin);


        let doc = &mut ctx.accounts.doc;
        doc.doc_hash = doc_hash;
        doc.anchored_by = ctx.accounts.authority.key();
        doc.anchored_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn approve_document(ctx: Context<ApproveDocument>, doc_hash: [u8; 32]) -> Result<()> {
        require!(doc_hash != [0u8; 32], RegistryError::InvalidDocHash);

        require!(
            ctx.accounts.doc.doc_hash == doc_hash,
            RegistryError::DocHashMismatch
        );

        let approval = &mut ctx.accounts.approval;
        approval.doc_hash = doc_hash;
        approval.user = ctx.accounts.user.key();
        approval.approved_at = Clock::get()?.unix_timestamp;

        Ok(())
    }
}

/* ---------------- Accounts ---------------- */

#[account]
pub struct DocumentAccount {
    pub doc_hash: [u8; 32],
    pub anchored_by: Pubkey,
    pub anchored_at: i64,
}
impl DocumentAccount {
    pub const LEN: usize = 8 + 32 + 32 + 8;
}

#[account]
pub struct ApprovalAccount {
    pub doc_hash: [u8; 32],
    pub user: Pubkey,
    pub approved_at: i64,
}
impl ApprovalAccount {
    pub const LEN: usize = 8 + 32 + 32 + 8;
}

/* ---------------- Contexts ---------------- */

#[derive(Accounts)]
#[instruction(doc_hash: [u8; 32])]
pub struct AnchorDocument<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = DocumentAccount::LEN,
        seeds = [b"doc", doc_hash.as_ref()],
        bump
    )]
    pub doc: Account<'info, DocumentAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(doc_hash: [u8; 32])]
pub struct ApproveDocument<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [b"doc", doc_hash.as_ref()],
        bump
    )]
    pub doc: Account<'info, DocumentAccount>,

    #[account(
        init,
        payer = user,
        space = ApprovalAccount::LEN,
        seeds = [b"approval", doc_hash.as_ref(), user.key().as_ref()],
        bump
    )]
    pub approval: Account<'info, ApprovalAccount>,

    pub system_program: Program<'info, System>,
}

/* ---------------- Errors ---------------- */

#[error_code]
pub enum RegistryError {
    #[msg("Invalid doc hash (all zeros).")]
    InvalidDocHash,
    #[msg("Only admin can anchor documents.")]
    NotAdmin,
    #[msg("Document hash mismatch.")]
    DocHashMismatch,
}
