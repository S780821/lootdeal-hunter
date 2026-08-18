export type ExtractedPrices = {
  originalPrice?: number;
  dealPrice?: number;
};

function cleanPrice(value: string): number | undefined {
  const cleaned = value
    .replace(/,/g, "")
    .trim();

  const number = Number(cleaned);

  if (!Number.isFinite(number)) {
    return undefined;
  }

  if (number <= 0 || number > 10000000) {
    return undefined;
  }

  return number;
}

export function extractPrices(
  text: string
): ExtractedPrices {
  const result: ExtractedPrices = {};

  if (!text) {
    return result;
  }

  /*
   * IMPORTANT:
   * Look for explicit currency prices first.
   *
   * Examples:
   * $398
   * $40
   * $84
   * ₹1,999
   * €49.99
   * £29.99
   */

  const currencyPriceRegex =
    /(?:₹|Rs\.?|INR|\$|USD|€|EUR|£|GBP|¥|JPY)\s*([\d,]+(?:\.\d{1,2})?)/gi;

  const currencyPrices: number[] = [];

  let match: RegExpExecArray | null;

  while (
    (match = currencyPriceRegex.exec(text)) !== null
  ) {
    const price = cleanPrice(match[1]);

    if (price !== undefined) {
      currencyPrices.push(price);
    }
  }

  /*
   * Deal price patterns.
   *
   * "$398"
   * "at $398"
   * "for $398"
   * "$398 (13% off)"
   */

  const dealPriceRegex =
    /(?:at|for|now|sale price|deal price|price)\s*(?:is\s*)?(?:₹|Rs\.?|INR|\$|USD|€|EUR|£|GBP|¥|JPY)\s*([\d,]+(?:\.\d{1,2})?)/i;

  const dealMatch = text.match(dealPriceRegex);

  if (dealMatch) {
    const price = cleanPrice(dealMatch[1]);

    if (price !== undefined) {
      result.dealPrice = price;
    }
  }

  /*
   * If we didn't find "at $398", use the first
   * explicit currency price.
   */

  if (
    result.dealPrice === undefined &&
    currencyPrices.length > 0
  ) {
    result.dealPrice = currencyPrices[0];
  }

  /*
   * Look for explicit original-price language.
   *
   * Examples:
   * was $499
   * from $599
   * originally $699
   * regular price $799
   */

  const originalPriceRegex =
    /(?:was|from|originally|regular price|retail price|list price|normally)\s*(?:₹|Rs\.?|INR|\$|USD|€|EUR|£|GBP|¥|JPY)\s*([\d,]+(?:\.\d{1,2})?)/i;

  const originalMatch =
    text.match(originalPriceRegex);

  if (originalMatch) {
    const price = cleanPrice(originalMatch[1]);

    if (price !== undefined) {
      result.originalPrice = price;
    }
  }

  /*
   * If we know the discount and deal price,
   * estimate the original price.
   *
   * Example:
   * $398 (13% off)
   *
   * Original ≈ 398 / 0.87
   */

  const discountMatch =
    text.match(/(\d{1,3})\s*%\s*(?:off|discount)/i);

  if (
    result.originalPrice === undefined &&
    result.dealPrice !== undefined &&
    discountMatch
  ) {
    const discount = Number(discountMatch[1]);

    if (
      discount > 0 &&
      discount < 100
    ) {
      const estimated =
        result.dealPrice /
        (1 - discount / 100);

      result.originalPrice =
        Math.round(estimated * 100) / 100;
    }
  }

  /*
   * Never allow original price to be lower
   * than deal price.
   */

  if (
    result.originalPrice !== undefined &&
    result.dealPrice !== undefined &&
    result.originalPrice <= result.dealPrice
  ) {
    delete result.originalPrice;
  }

  return result;
}