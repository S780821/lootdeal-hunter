import { extractPrices } from "../lib/hunter/rss/extract-prices";

const tests = [
  "$999 now $376",
  "$999 → $376",
  "was $999, now $376",
  "$376 (63% off)",
  "$40 off",
  "$99 cheaper",
  "Save $120",
  "Apple Watch is $100 off right now",
  "AirPods Pro 3 are now $169",
  "from $6",
  "₹1,999 now ₹999",
  "₹2,999 (50% off)",
];

for (const text of tests) {
  console.log("\n--------------------------------");
  console.log(text);
  console.log(extractPrices(text));
}