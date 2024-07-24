export function formatNumberInternational(
  number: number,
  locale: string = "ne-NP",
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat(locale, options).format(number);
}
