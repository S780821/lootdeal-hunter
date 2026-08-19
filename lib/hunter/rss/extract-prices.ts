export type ExtractedPrices = {
  originalPrice?: number;
  dealPrice?: number;
};

type PriceMention = {
  value: number;
  currency: string;
  index: number;
  raw: string;
};

function cleanPrice(
  value: string
): number | undefined {
  const cleaned = value
    .replace(/,/g, "")
    .trim();

  const number = Number(cleaned);

  if (!Number.isFinite(number)) {
    return undefined;
  }

  if (
    number <= 0 ||
    number > 10000000
  ) {
    return undefined;
  }

  return number;
}

function currencyPattern(): string {
  return String.raw`(?:₹|Rs\.?|INR|\$|USD|€|EUR|£|GBP|¥|JPY)`;
}

function getBeforeText(
  text: string,
  index: number,
  length = 100
): string {
  return text
    .slice(
      Math.max(0, index - length),
      index
    )
    .toLowerCase();
}

function getAfterText(
  text: string,
  index: number,
  raw: string,
  length = 100
): string {
  return text
    .slice(
      index + raw.length,
      index + raw.length + length
    )
    .toLowerCase();
}

function extractCurrencyPrices(
  text: string
): PriceMention[] {
  const results: PriceMention[] = [];

  const regex = new RegExp(
    `${currencyPattern()}\\s*([\\d,]+(?:\\.\\d{1,2})?)`,
    "gi"
  );

  let match: RegExpExecArray | null;

  while (
    (match = regex.exec(text)) !== null
  ) {
    const value = cleanPrice(match[1]);

    if (value === undefined) {
      continue;
    }

    results.push({
      value,
      currency: match[0]
        .replace(match[1], "")
        .trim(),
      index: match.index,
      raw: match[0],
    });
  }

  return results;
}

/*
 * -------------------------------------------------------
 * DISCOUNT AMOUNT CONTEXT
 *
 * Reject:
 *
 * $40 off
 * $99 cheaper
 * save $120
 * $50 discount
 * $100 savings
 *
 * IMPORTANT:
 *
 * Do NOT reject:
 *
 * $376 (63% off)
 * ₹2,999 (50% off)
 *
 * Those are actual deal prices followed by a
 * percentage discount.
 * -------------------------------------------------------
 */

function isDiscountAmountContext(
  text: string,
  index: number,
  raw?: string
): boolean {
  const before =
    getBeforeText(text, index, 100);

  const after = raw
    ? getAfterText(
        text,
        index,
        raw,
        50
      )
    : text
        .slice(
          index,
          index + 50
        )
        .toLowerCase();

  /*
   * A percentage discount immediately after the price
   * means the currency amount is the actual deal price.
   *
   * Examples:
   *
   * $376 (63% off)
   * ₹2,999 (50% off)
   */
  if (
    /^\s*(?:\(\s*)?\d{1,3}\s*%\s*(?:off|discount|savings?)/i.test(
      after
    )
  ) {
    return false;
  }

  const beforeSignals = [
    "off",
    "discount",
    "discounted",
    "cheaper",
    "save",
    "saves",
    "saving",
    "savings",
    "price cut",
    "price drop",
    "slashed",
    "cut by",
    "reduced by",
  ];

  if (
    beforeSignals.some((signal) =>
      new RegExp(
        `\\b${signal.replace(
          / /g,
          "\\s+"
        )}\\b`,
        "i"
      ).test(before)
    )
  ) {
    return true;
  }

  const afterSignals = [
    "off",
    "discount",
    "cheaper",
    "savings",
    "saved",
  ];

  if (
    afterSignals.some((signal) =>
      new RegExp(
        `\\b${signal.replace(
          / /g,
          "\\s+"
        )}\\b`,
        "i"
      ).test(after)
    )
  ) {
    return true;
  }

  return false;
}

/*
 * -------------------------------------------------------
 * ORIGINAL PRICE CONTEXT
 * -------------------------------------------------------
 */

function isOriginalPriceContext(
  text: string,
  index: number,
  raw?: string
): boolean {
  const before =
    getBeforeText(text, index, 120);

  const after = raw
    ? getAfterText(
        text,
        index,
        raw,
        50
      )
    : text
        .slice(
          index,
          index + 50
        )
        .toLowerCase();

  const beforeSignals = [
    "was",
    "originally",
    "regular price",
    "retail price",
    "list price",
    "normally",
    "rrp",
    "msrp",
    "original price",
    "marked at",
  ];

  if (
    beforeSignals.some((signal) =>
      new RegExp(
        `\\b${signal.replace(
          / /g,
          "\\s+"
        )}\\b`,
        "i"
      ).test(before)
    )
  ) {
    return true;
  }

  const afterSignals = [
    "was",
    "original price",
  ];

  if (
    afterSignals.some((signal) =>
      new RegExp(
        `\\b${signal.replace(
          / /g,
          "\\s+"
        )}\\b`,
        "i"
      ).test(after)
    )
  ) {
    return true;
  }

  return false;
}

/*
 * -------------------------------------------------------
 * STARTING PRICE CONTEXT
 * -------------------------------------------------------
 */

function isStartingPriceContext(
  text: string,
  index: number
): boolean {
  const before =
    getBeforeText(text, index, 80);

  const signals = [
    "from",
    "starting at",
    "starts at",
    "as low as",
    "as little as",
    "beginning at",
  ];

  return signals.some((signal) =>
    new RegExp(
      `\\b${signal.replace(
        / /g,
        "\\s+"
      )}\\b`,
      "i"
    ).test(before)
  );
}

/*
 * -------------------------------------------------------
 * PRICE RANGE / LIMIT CONTEXT
 * -------------------------------------------------------
 */

function isPriceRangeOrLimitContext(
  text: string,
  index: number,
  raw?: string
): boolean {
  const before =
    getBeforeText(text, index, 100);

  const after = raw
    ? getAfterText(
        text,
        index,
        raw,
        80
      )
    : text
        .slice(
          index,
          index + 80
        )
        .toLowerCase();

  const beforeSignals = [
    "under",
    "below",
    "less than",
    "up to",
    "upto",
    "no more than",
    "maximum",
    "max",
  ];

  const afterSignals = [
    "or less",
    "or under",
    "or below",
    "and under",
    "and below",
  ];

  if (
    beforeSignals.some((signal) =>
      new RegExp(
        `\\b${signal.replace(
          / /g,
          "\\s+"
        )}\\b`,
        "i"
      ).test(before)
    )
  ) {
    return true;
  }

  if (
    afterSignals.some((signal) =>
      new RegExp(
        `\\b${signal.replace(
          / /g,
          "\\s+"
        )}\\b`,
        "i"
      ).test(after)
    )
  ) {
    return true;
  }

  return false;
}

/*
 * -------------------------------------------------------
 * CURRENT PRICE CONTEXT
 *
 * Accept:
 *
 * now $399
 * only $399
 * just $399
 * for $399
 * at $399
 * sale price $399
 * deal price $399
 * current price $399
 * priced at $399
 * buy for $399
 * get for $399
 * shop for $399
 *
 * Also accept:
 *
 * $376 (63% off)
 * ₹2,999 (50% off)
 * $49 - 20% off
 * -------------------------------------------------------
 */

function isCurrentPriceContext(
  text: string,
  index: number
): boolean {
  const after =
    text
      .slice(index, index + 100)
      .toLowerCase();

  /*
   * Price immediately followed by a percentage discount.
   */
  if (
    /(?:\(\s*)?\d{1,3}\s*%\s*(?:off|discount|savings?)/i.test(
      after
    )
  ) {
    return true;
  }

  const before =
    getBeforeText(text, index, 100);

  const signals = [
    "now",
    "only",
    "just",
    "for",
    "at",
    "price",
    "priced at",
    "sale price",
    "deal price",
    "current price",
    "buy for",
    "get for",
    "shop for",
  ];

  return signals.some((signal) =>
    new RegExp(
      `\\b${signal.replace(
        / /g,
        "\\s+"
      )}\\b`,
      "i"
    ).test(before)
  );
}

/*
 * -------------------------------------------------------
 * EXPLICIT DEAL PRICE
 * -------------------------------------------------------
 */

function extractExplicitDealPrice(
  text: string
): number | undefined {
  const patterns = [
    new RegExp(
      String.raw`(?:now|only|just|for|at|buy for|get for|shop for|sale price|deal price|current price|priced at)\s*(?:is\s*)?${currencyPattern()}\s*([\d,]+(?:\.\d{1,2})?)`,
      "i"
    ),

    new RegExp(
      String.raw`${currencyPattern()}\s*([\d,]+(?:\.\d{1,2})?)\s*(?:right now|today|now)`,
      "i"
    ),
  ];

  for (const regex of patterns) {
    const match =
      text.match(regex);

    if (!match) {
      continue;
    }

    const price =
      cleanPrice(match[1]);

    if (
      price !== undefined
    ) {
      return price;
    }
  }

  return undefined;
}

/*
 * -------------------------------------------------------
 * EXPLICIT ORIGINAL PRICE
 * -------------------------------------------------------
 */

function extractExplicitOriginalPrice(
  text: string
): number | undefined {
  const patterns = [
    new RegExp(
      String.raw`(?:was|originally|regular price|retail price|list price|normally|rrp|msrp|original price|marked at)\s*${currencyPattern()}\s*([\d,]+(?:\.\d{1,2})?)`,
      "i"
    ),

    new RegExp(
      String.raw`${currencyPattern()}\s*([\d,]+(?:\.\d{1,2})?)\s*(?:was|original price)`,
      "i"
    ),
  ];

  for (const regex of patterns) {
    const match =
      text.match(regex);

    if (!match) {
      continue;
    }

    const price =
      cleanPrice(match[1]);

    if (
      price !== undefined
    ) {
      return price;
    }
  }

  return undefined;
}

/*
 * -------------------------------------------------------
 * DISCOUNT AMOUNT
 * -------------------------------------------------------
 */

function extractDiscountAmount(
  text: string
): number | undefined {
  const patterns = [
    new RegExp(
      String.raw`${currencyPattern()}\s*([\d,]+(?:\.\d{1,2})?)\s*(?:off|discount|cheaper|savings?|saved)`,
      "i"
    ),

    new RegExp(
      String.raw`(?:save|saves|saving|savings|discount|discounted|price cut|price drop|slashed)\s*(?:of\s*)?${currencyPattern()}\s*([\d,]+(?:\.\d{1,2})?)`,
      "i"
    ),

    new RegExp(
      String.raw`(?:${currencyPattern()}\s*([\d,]+(?:\.\d{1,2})?)\s*)?(?:cheaper|price cut|price drop)`,
      "i"
    ),
  ];

  for (const regex of patterns) {
    const match =
      text.match(regex);

    if (!match) {
      continue;
    }

    const value =
      cleanPrice(match[1]);

    if (
      value !== undefined
    ) {
      return value;
    }
  }

  return undefined;
}

/*
 * -------------------------------------------------------
 * PERCENTAGE DISCOUNT
 * -------------------------------------------------------
 */

function extractPercentageDiscount(
  text: string
): number | undefined {
  const patterns = [
    /(\d{1,3})\s*%\s*(?:off|discount|savings?)/i,

    /(?:save|saves|saving|discount|discounted)\s*(\d{1,3})\s*%/i,

    /up\s*to\s*(\d{1,3})\s*%\s*off/i,
  ];

  for (const regex of patterns) {
    const match =
      text.match(regex);

    if (!match) {
      continue;
    }

    const value =
      Number(match[1]);

    if (
      Number.isFinite(value) &&
      value >= 1 &&
      value <= 100
    ) {
      return value;
    }
  }

  return undefined;
}

/*
 * -------------------------------------------------------
 * ESTIMATE ORIGINAL PRICE
 * -------------------------------------------------------
 */

function estimateOriginalPrice(
  dealPrice: number,
  discount: number
): number | undefined {
  if (
    dealPrice <= 0 ||
    discount <= 0 ||
    discount >= 100
  ) {
    return undefined;
  }

  const estimated =
    dealPrice /
    (1 - discount / 100);

  if (
    !Number.isFinite(
      estimated
    )
  ) {
    return undefined;
  }

  return Math.round(
    estimated * 100
  ) / 100;
}

/*
 * -------------------------------------------------------
 * MAIN PRICE EXTRACTION
 * -------------------------------------------------------
 */

export function extractPrices(
  text: string
): ExtractedPrices {
  const result: ExtractedPrices = {};

  if (
    !text ||
    typeof text !== "string"
  ) {
    return result;
  }

  /*
   * STEP 1
   * Find every explicit currency amount.
   */

  const mentions =
    extractCurrencyPrices(text);

  if (
    mentions.length === 0
  ) {
    return result;
  }

  /*
   * STEP 2
   * Explicit current/deal price.
   */

  const explicitDealPrice =
    extractExplicitDealPrice(text);

  if (
    explicitDealPrice !== undefined
  ) {
    result.dealPrice =
      explicitDealPrice;
  }

  /*
   * STEP 3
   * Explicit original price.
   */

  const explicitOriginalPrice =
    extractExplicitOriginalPrice(
      text
    );

  if (
    explicitOriginalPrice !== undefined
  ) {
    result.originalPrice =
      explicitOriginalPrice;
  }

  /*
   * STEP 4
   * Percentage discount.
   */

  const discount =
    extractPercentageDiscount(
      text
    );

  /*
   * STEP 5
   * Inspect currency mentions.
   */

  if (
    result.dealPrice === undefined
  ) {
    for (
      const mention of mentions
    ) {
      if (
        isDiscountAmountContext(
          text,
          mention.index,
          mention.raw
        )
      ) {
        continue;
      }

      if (
        isOriginalPriceContext(
          text,
          mention.index,
          mention.raw
        )
      ) {
        continue;
      }

      if (
        isPriceRangeOrLimitContext(
          text,
          mention.index,
          mention.raw
        )
      ) {
        continue;
      }

      if (
        isStartingPriceContext(
          text,
          mention.index
        )
      ) {
        continue;
      }

      if (
        isCurrentPriceContext(
          text,
          mention.index
        )
      ) {
        result.dealPrice =
          mention.value;

        break;
      }
    }
  }

  /*
   * STEP 6
   * Two prices:
   *
   * $999 → $376
   *
   * Higher = original
   * Lower = deal
   */

  if (
    result.dealPrice === undefined &&
    mentions.length >= 2
  ) {
    const validMentions =
      mentions.filter(
        (mention) =>
          !isDiscountAmountContext(
            text,
            mention.index,
            mention.raw
          ) &&
          !isPriceRangeOrLimitContext(
            text,
            mention.index,
            mention.raw
          ) &&
          !isStartingPriceContext(
            text,
            mention.index
          )
      );

    if (
      validMentions.length >= 2
    ) {
      const first =
        validMentions[0].value;

      const second =
        validMentions[1].value;

      if (
        first > second &&
        !isOriginalPriceContext(
          text,
          validMentions[1].index,
          validMentions[1].raw
        )
      ) {
        result.originalPrice =
          first;

        result.dealPrice =
          second;
      }
    }
  }

  /*
   * STEP 7
   * Single explicit current price.
   */

  if (
    result.dealPrice === undefined &&
    mentions.length === 1
  ) {
    const mention =
      mentions[0];

    const blocked =
      isDiscountAmountContext(
        text,
        mention.index,
        mention.raw
      ) ||
      isOriginalPriceContext(
        text,
        mention.index,
        mention.raw
      ) ||
      isPriceRangeOrLimitContext(
        text,
        mention.index,
        mention.raw
      ) ||
      isStartingPriceContext(
        text,
        mention.index
      );

    if (
      !blocked &&
      isCurrentPriceContext(
        text,
        mention.index
      )
    ) {
      result.dealPrice =
        mention.value;
    }
  }

  /*
   * STEP 8
   * Estimate original price from percentage discount.
   *
   * Example:
   *
   * $376 (63% off)
   *
   * estimated original ≈ $1,016.22
   */

  if (
    result.originalPrice === undefined &&
    result.dealPrice !== undefined &&
    discount !== undefined
  ) {
    result.originalPrice =
      estimateOriginalPrice(
        result.dealPrice,
        discount
      );
  }

  /*
   * STEP 9
   * Explicit original price but no current price.
   */

  if (
    result.originalPrice !== undefined &&
    result.dealPrice === undefined
  ) {
    for (
      const mention of mentions
    ) {
      if (
        mention.value >=
        result.originalPrice
      ) {
        continue;
      }

      if (
        isDiscountAmountContext(
          text,
          mention.index,
          mention.raw
        )
      ) {
        continue;
      }

      if (
        isPriceRangeOrLimitContext(
          text,
          mention.index,
          mention.raw
        )
      ) {
        continue;
      }

      if (
        isStartingPriceContext(
          text,
          mention.index
        )
      ) {
        continue;
      }

      if (
        isOriginalPriceContext(
          text,
          mention.index,
          mention.raw
        )
      ) {
        continue;
      }

      result.dealPrice =
        mention.value;

      break;
    }
  }

  /*
   * STEP 10
   * Safety validation.
   */

  if (
    result.originalPrice !== undefined &&
    result.dealPrice !== undefined
  ) {
    if (
      result.originalPrice <=
      result.dealPrice
    ) {
      delete result.originalPrice;
    }
  }

  /*
   * STEP 11
   * Final sanity check.
   */

  if (
    result.dealPrice !== undefined
  ) {
    if (
      !Number.isFinite(
        result.dealPrice
      ) ||
      result.dealPrice <= 0 ||
      result.dealPrice > 10000000
    ) {
      delete result.dealPrice;
    }
  }

  if (
    result.originalPrice !== undefined
  ) {
    if (
      !Number.isFinite(
        result.originalPrice
      ) ||
      result.originalPrice <= 0 ||
      result.originalPrice > 10000000
    ) {
      delete result.originalPrice;
    }
  }

  return result;
}