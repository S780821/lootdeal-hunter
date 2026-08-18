import type { HunterDeal } from "../hunter/sources/deal-types";

type TelegramResponse = {
  ok: boolean;
  result?: {
    message_id: number;
  };
  description?: string;
};

export async function sendDealToTelegram(
  deal: HunterDeal
) {
  const botToken =
    process.env.TELEGRAM_BOT_TOKEN;

  const chatId =
    process.env.TELEGRAM_CHAT_ID;

  if (!botToken) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN is not configured"
    );
  }

  if (!chatId) {
    throw new Error(
      "TELEGRAM_CHAT_ID is not configured"
    );
  }

  const score = deal.dealScore ?? 0;

  const emoji =
    score >= 90
      ? "🔥"
      : score >= 80
        ? "🟢"
        : "🟡";

  const discount =
    deal.discount !== undefined
      ? `${deal.discount}% OFF`
      : "";

  const price =
    deal.dealPrice !== undefined
      ? `${deal.currency ?? ""} ${deal.dealPrice}`
      : "Check deal";

  const message = [
    `${emoji} <b>LOOT DEAL ALERT</b>`,
    "",
    `<b>${escapeHtml(deal.title)}</b>`,
    "",
    `💰 Price: <b>${escapeHtml(price)}</b>`,
    discount
      ? `🏷️ Discount: <b>${discount}</b>`
      : "",
    `🏪 Store: ${escapeHtml(
      deal.store ?? "Unknown"
    )}`,
    `📂 Category: ${escapeHtml(
      deal.category ?? "General"
    )}`,
    `🎯 Loot Score: <b>${score}/100</b>`,
    "",
    `👉 <a href="${escapeHtml(deal.dealUrl)}">GET DEAL</a>`,
    "",
    `⚡ LootDeal Hunter`,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    }
  );

  const data =
    (await response.json()) as TelegramResponse;

  if (!response.ok || !data.ok) {
    throw new Error(
      data.description ??
        "Telegram API request failed"
    );
  }

  return {
    success: true,
    messageId: data.result?.message_id,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}