export async function verifyUrl(
  url: string
): Promise<boolean> {
  try {
    // --------------------------------
    // Basic URL validation
    // --------------------------------
    const parsed = new URL(url);

    if (
      parsed.protocol !== "http:" &&
      parsed.protocol !== "https:"
    ) {
      return false;
    }

    // --------------------------------
    // Google News URLs
    //
    // Google News RSS links are valid
    // redirect URLs, so don't reject them
    // just because the destination blocks
    // HEAD requests.
    // --------------------------------
    if (
      parsed.hostname === "news.google.com" ||
      parsed.hostname.endsWith(".google.com")
    ) {
      return true;
    }

    // --------------------------------
    // Normal URL verification
    // --------------------------------
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LootDealHunter/1.0)",
        Accept:
          "text/html,application/xhtml+xml,*/*",
      },
    });

    if (response.ok) {
      return true;
    }

    // --------------------------------
    // Some websites reject HEAD.
    // Use GET only for those cases.
    // --------------------------------
    if (
      response.status === 405 ||
      response.status === 403 ||
      response.status === 400
    ) {
      const fallback = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; LootDealHunter/1.0)",
          Accept:
            "text/html,application/xhtml+xml,*/*",
        },
      });

      return fallback.ok;
    }

    return false;
  } catch (error) {
    console.error(
      `⚠️ URL verification failed: ${url}`
    );

    return false;
  }
}