// Conexão real com carteiras injetadas no navegador (Phantom / MetaMask).
type Eth = { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> };
type Sol = { isPhantom?: boolean; connect: () => Promise<{ publicKey: { toString(): string } }>; signMessage: (m: Uint8Array, e: string) => Promise<unknown> };

const w = () => (typeof window === "undefined" ? {} : (window as unknown as { ethereum?: Eth; solana?: Sol; phantom?: { solana?: Sol } }));
export const hasPhantom = () => !!(w().phantom?.solana ?? w().solana)?.isPhantom;
export const hasEvm = () => !!w().ethereum;

export const EVM_CHAIN_ID: Record<"base" | "arbitrum" | "ethereum", string> = { ethereum: "0x1", base: "0x2105", arbitrum: "0xa4b1" };
const CHAIN_NAME: Record<string, string> = { "0x1": "ethereum", "0x2105": "base", "0xa4b1": "arbitrum" };

export type Connected = { kind: "phantom" | "evm"; address: string; chain: string; signed: boolean };

const proof = (addr: string) => `VisionZ — confirmo que sou dono da carteira ${addr}\nNonce: ${Date.now()}`;

export async function connectPhantom(): Promise<Connected> {
  const p = w().phantom?.solana ?? w().solana;
  if (!p) throw new Error("Phantom não encontrada");
  const { publicKey } = await p.connect();
  const address = publicKey.toString();
  await p.signMessage(new TextEncoder().encode(proof(address)), "utf8");
  return { kind: "phantom", address, chain: "solana", signed: true };
}

export async function connectEvm(): Promise<Connected> {
  const e = w().ethereum;
  if (!e) throw new Error("MetaMask não encontrada");
  const [address] = (await e.request({ method: "eth_requestAccounts" })) as string[];
  const id = (await e.request({ method: "eth_chainId" })) as string;
  await e.request({ method: "personal_sign", params: [proof(address), address] });
  return { kind: "evm", address, chain: CHAIN_NAME[id] ?? `chain ${parseInt(id, 16)}`, signed: true };
}

export async function switchEvm(chain: "base" | "arbitrum" | "ethereum") {
  await w().ethereum?.request({ method: "wallet_switchEthereumChain", params: [{ chainId: EVM_CHAIN_ID[chain] }] });
}

export const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
