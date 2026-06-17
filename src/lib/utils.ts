export function calculateCascadingDiscount(basePrice: number, discountString: string): number {
  if (!discountString) return basePrice;
  const percentages = discountString.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
  let currentPrice = basePrice;
  for (const p of percentages) {
    currentPrice = currentPrice * (1 - (p / 100));
  }
  return currentPrice;
}

export function formatRupiah(number: number): string {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    maximumFractionDigits: 0 
  }).format(number);
}
