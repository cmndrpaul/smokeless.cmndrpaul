// Integer centavos keep price calculations exact before formatting.
export function estimateSpending(sticks, price) {
  if (!/^\d+$/.test(sticks) || !/^\d+(\.\d{1,2})?$/.test(price)) return null;
  const count = Number(sticks);
  const [pesos, fraction = ''] = price.split('.');
  const cents = Number(pesos) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(count) || count > 200 || !Number.isSafeInteger(cents) || cents > 500000) return null;
  return { weekly: count * cents * 7 / 100, monthly: count * cents * 30 / 100 };
}
