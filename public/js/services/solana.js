import { CONFIG_PUBLIC } from "../../public.config.js";
import { Buffer } from "https://esm.sh/buffer@6.0.3";
import * as anchor from "https://esm.sh/@coral-xyz/anchor@0.30.1";
import { Connection, PublicKey } from "https://esm.sh/@solana/web3.js@1.95.2";

const SOL_RPC_URL = CONFIG_PUBLIC.solana.rpcUrl;
const SOL_PROGRAM_ID = CONFIG_PUBLIC.solana.programId;
const SOL_IDL_PATH = `${window.location.origin}/js/idl/${CONFIG_PUBLIC.solana.idlName}`;

function hexToU8a32(hex0x) {
  const hex = hex0x.startsWith("0x") ? hex0x.slice(2) : hex0x;
  if (hex.length !== 64) throw new Error("Expected bytes32 hex (64 chars)");
  const bytes = Uint8Array.from(Buffer.from(hex, "hex"));
  if (bytes.length !== 32) throw new Error("Expected 32 bytes");
  return bytes;
}

export class SolanaService {
  constructor() {
    this.connection = new Connection(SOL_RPC_URL, "confirmed");
    this.programId = new PublicKey(SOL_PROGRAM_ID);

    this.wallet = null;
    this.provider = null;
    this.program = null;
    this.idl = null;
  }

  async loadIdl() {
    if (this.idl) return this.idl;
    const res = await fetch(SOL_IDL_PATH);
    if (!res.ok) throw new Error("Cannot load IDL");
    this.idl = await res.json();
    return this.idl;
  }

  async connect() {
    if (!window.solana) {
      throw new Error("Solana Wallet not installed");
    }
    const resp = await window.solana.connect();
    this.wallet = window.solana;

    const wallet = {
      publicKey: this.wallet.publicKey,
      signTransaction: this.wallet.signTransaction.bind(this.wallet),
      signAllTransactions: this.wallet.signAllTransactions?.bind(this.wallet),
    };

    this.provider = new anchor.AnchorProvider(this.connection, wallet, {
      commitment: "confirmed",
    });

    anchor.setProvider(this.provider);

    const idl = await this.loadIdl();

    this.program = new anchor.Program(idl, this.provider);

    return resp.publicKey.toString();
  }

  async deriveDocPda(docHashHex) {
    const hashBytes = hexToU8a32(docHashHex);
    const [pda] = await PublicKey.findProgramAddress(
      [Buffer.from("doc"), Buffer.from(hashBytes)],
      this.programId
    );
    return pda;
  }

  async deriveApprovalPda(docHashHex, userPubkey) {
    const hashBytes = hexToU8a32(docHashHex);
    const userPk = new PublicKey(userPubkey);

    const [pda] = await PublicKey.findProgramAddress(
      [
        Buffer.from("approval"),
        Buffer.from(hashBytes),
        userPk.toBuffer(),
      ],
      this.programId
    );
    return pda;
  }

  async isAnchored(docHashHex) {
    const docPda = await this.deriveDocPda(docHashHex);
    const info = await this.connection.getAccountInfo(docPda);
    return info !== null;
  }

  async isApproved(docHashHex) {
    const userPubkey = this.provider.wallet.publicKey;

    if (userPubkey == null) throw new Error("Not connected");

    const approvalPda = await this.deriveApprovalPda(docHashHex, userPubkey);
    const info = await this.connection.getAccountInfo(approvalPda);
    return info !== null;
  }

  async anchor(docHashHex) {
    if (!this.program) throw new Error("Error during initialization");

    const docHash = hexToU8a32(docHashHex);
    const docPda = await this.deriveDocPda(docHashHex);

    const sig = await this.program.methods
      .anchorDocument([...docHash])
      .accounts({
        authority: this.provider.wallet.publicKey,
        doc: docPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    return sig;
  }

  async approve(docHashHex) {
    if (!this.program) throw new Error("Error during initialization");

    const docHash = hexToU8a32(docHashHex);
    const userPk = this.provider.wallet.publicKey;

    const docPda = await this.deriveDocPda(docHashHex);
    const approvalPda = await this.deriveApprovalPda(docHashHex, userPk.toString());

    const sig = await this.program.methods
      .approveDocument([...docHash])
      .accounts({
        user: userPk,
        doc: docPda,
        approval: approvalPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    return sig;
  }
}