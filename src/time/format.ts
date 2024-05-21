
/** Pad left with numDigit zeroes */
export function padNumWithZeroes(numDigits: number, n: number) {
  return n.toString(10).padStart(numDigits, "0");
}

// Apparently this is what "browser support for plural ordinals" means

const english_ordinal_rules = new Intl.PluralRules("en", { type: "ordinal" });
const suffixes: Record<Intl.LDMLPluralRule, string> = {
  zero: "th",
  one: "st",
  two: "nd",
  few: "rd",
  other: "th",
  many: "th",
} as const;

/** Take a number stick "st" or "th" on it. */
export function ordinal(number: number) {
  const category = english_ordinal_rules.select(number);
  const suffix = suffixes[category];

  return number.toString(10) + suffix;
}
