// Real SPL transfers of test $VZN on Solana devnet. Server-only (holds the reward wallet key).
import {
  address, appendTransactionMessageInstructions, createKeyPairSignerFromBytes, createSolanaRpc, createTransactionMessage,
  getBase58Encoder, getBase64EncodedWireTransaction, getPublicKeyFromAddress, getSignatureFromTransaction, pipe,
  setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, signTransactionMessageWithSigners,
  signatureBytes, verifySignature,
} from "@solana/kit";
import {
  TOKEN_PROGRAM_ADDRESS, findAssociatedTokenPda, getCreateAssociatedTokenIdempotentInstruction, getTransferCheckedInstruction,
} from "@solana-program/token";

export const VZN_DECIMALS = 9;

function cfg() {
  const key = process.env["VZN_DEVNET_TREASURY_KEY"];
  const mint = process.env["VZN_DEVNET_MINT"];
  if (!key || !mint) throw new Error("devnet_not_configured");
  if (process.env["VZN_DEVNET_PAUSED"] === "1") throw new Error("devnet_paused");
  return { key, mint: address(mint), rpc: createSolanaRpc(process.env["SOLANA_DEVNET_RPC"] || "https://api.devnet.solana.com") };
}

export function isValidAddress(a: string) {
  try { address(a); return true; } catch { return false; }
}

/** Checks a Phantom signMessage signature (base58) over the exact message. */
export async function verifyWalletSignature(addr: string, message: string, sigB58: string) {
  try {
    const key = await getPublicKeyFromAddress(address(addr));
    const sig = signatureBytes(new Uint8Array(getBase58Encoder().encode(sigB58)));
    return await verifySignature(key, sig, new TextEncoder().encode(message));
  } catch { return false; }
}

/** Sends `amount` $VZN to `to`, creating their token account if needed. Returns the signature once confirmed. */
export async function sendVzn(to: string, amount: number): Promise<string> {
  const { key, mint, rpc } = cfg();
  const signer = await createKeyPairSignerFromBytes(new Uint8Array(getBase58Encoder().encode(key)));
  const owner = address(to);
  const [srcAta] = await findAssociatedTokenPda({ owner: signer.address, mint, tokenProgram: TOKEN_PROGRAM_ADDRESS });
  const [dstAta] = await findAssociatedTokenPda({ owner, mint, tokenProgram: TOKEN_PROGRAM_ADDRESS });
  const raw = BigInt(Math.round(amount * 100)) * 10n ** BigInt(VZN_DECIMALS - 2);
  const { value: blockhash } = await rpc.getLatestBlockhash({ commitment: "confirmed" }).send();
  const msg = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayerSigner(signer, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(blockhash, m),
    (m) => appendTransactionMessageInstructions([
      getCreateAssociatedTokenIdempotentInstruction({ payer: signer, ata: dstAta, owner, mint }),
      getTransferCheckedInstruction({ source: srcAta, mint, destination: dstAta, authority: signer, amount: raw, decimals: VZN_DECIMALS }),
    ], m),
  );
  const tx = await signTransactionMessageWithSigners(msg);
  const sig = getSignatureFromTransaction(tx);
  await rpc.sendTransaction(getBase64EncodedWireTransaction(tx), { encoding: "base64", preflightCommitment: "confirmed" }).send();
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const { value } = await rpc.getSignatureStatuses([sig]).send();
    const s = value[0];
    if (s?.err) throw new Error("tx_failed");
    if (s && (s.confirmationStatus === "confirmed" || s.confirmationStatus === "finalized")) return sig;
  }
  return sig; // submitted; confirmation still pending
}
