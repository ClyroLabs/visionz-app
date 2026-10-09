/** Minimum human decisions before an accuracy figure is shown. */
export const MIN_DECISIONS = 30;

export type DecisionPair = { aiAllowed: boolean; humanAllowed: boolean };

/** Share of AI calls that a human moderator overturned, or null while data is insufficient. */
export function overturnRate(pairs: DecisionPair[], min = MIN_DECISIONS): number | null {
  if (pairs.length < min) return null;
  const flipped = pairs.filter((p) => p.aiAllowed !== p.humanAllowed).length;
  return Math.round((flipped / pairs.length) * 1000) / 10;
}

/** A title with an open parent report is hidden from kids profiles until a moderator decides. */
export function hiddenForKids(titleRef: string, kids: boolean, reported: ReadonlySet<string>) {
  return kids && reported.has(titleRef);
}
