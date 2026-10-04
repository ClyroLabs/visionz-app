import { z } from "zod";

const digits = (v: string) => v.replace(/\D/g, "");

/** Valid Brazilian CPF (checksum). */
export function isValidCpf(value: string): boolean {
  const c = digits(value);
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(c[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(c[9]) && calc(10) === Number(c[10]);
}

/** Only the last 4 digits of a card number are ever stored. */
export function cardLast4(cardNumber: string): string | null {
  const c = digits(cardNumber);
  if (c.length < 13 || c.length > 19) return null;
  return c.slice(-4);
}

export function cardBrand(cardNumber: string): string {
  const c = digits(cardNumber);
  if (/^4/.test(c)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(c)) return "Mastercard";
  if (/^3[47]/.test(c)) return "Amex";
  if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(c)) return "Elo";
  return "Cartão";
}

const opt = (s: z.ZodString) => s.trim().optional().or(z.literal("")).transform((v) => (v ? v : null));

export const profileSchema = z.object({
  full_name: opt(z.string().max(100)),
  nickname: opt(z.string().max(40)),
  phone: opt(z.string().regex(/^[\d\s()+-]{10,20}$/, "Telefone inválido")),
  birth_date: opt(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")),
  cpf: opt(z.string().refine(isValidCpf, "CPF inválido")),
  city: opt(z.string().max(80)),
  state: opt(z.string().regex(/^[A-Za-z]{2}$/, "Use a sigla, ex.: CE")).transform((v) => (v ? v.toUpperCase() : null)),
});

export const walletAddressSchema = z.string().trim().regex(/^(0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44})$/, "Endereço de carteira inválido");
export const pixKeySchema = z.string().trim().min(5, "Chave Pix inválida").max(77);
