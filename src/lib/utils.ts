const numberFormatter = new Intl.NumberFormat("en-US");

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatCredits(value: number): string {
  return numberFormatter.format(value);
}

export function formatChipAmount(value: number): string {
  return `${value}`;
}
