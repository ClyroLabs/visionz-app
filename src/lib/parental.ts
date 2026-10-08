/** Parental control rules shared by browser and server (pure functions). */
export const RATINGS = ["L", "10", "12", "14", "16", "18"] as const;
export type AgeRating = (typeof RATINGS)[number];
export const FACE_THRESHOLD = 0.5;
export const MAX_FAILED = 3;
export const LOCK_MS = 5 * 60 * 1000;
export const DESCRIPTOR_LEN = 128;

export function faceDistance(a: number[], b: number[]) {
  if (a.length !== b.length || a.length === 0) return Infinity;
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2;
  return Math.sqrt(s);
}

export const isFaceMatch = (a: number[], b: number[]) => faceDistance(a, b) < FACE_THRESHOLD;

export function averageDescriptors(list: number[][]) {
  if (!list.length) return [];
  return list[0].map((_, i) => list.reduce((s, d) => s + d[i], 0) / list.length);
}

/** Applies one verification attempt: locks for 5 min after 3 failures. */
export function attempt(state: { failed: number; lockedUntil: number | null }, matched: boolean, now: number) {
  if (state.lockedUntil && state.lockedUntil > now) return { allowed: false, locked: true, failed: state.failed, lockedUntil: state.lockedUntil };
  if (matched) return { allowed: true, locked: false, failed: 0, lockedUntil: null };
  const failed = state.failed + 1;
  if (failed >= MAX_FAILED) return { allowed: false, locked: true, failed: 0, lockedUntil: now + LOCK_MS };
  return { allowed: false, locked: false, failed, lockedUntil: null };
}

export const ratingAllowed = (rating: string, max: string) => {
  const r = RATINGS.indexOf(rating as AgeRating), m = RATINGS.indexOf(max as AgeRating);
  return r >= 0 && m >= 0 && r <= m;
};

export const screenTimeLeft = (usedMin: number, limitMin: number) => Math.max(0, limitMin - usedMin);

/** Purchases from a kids profile always wait for the parent's face approval. */
export const purchaseNeedsApproval = (kidsProfile: boolean) => kidsProfile;
