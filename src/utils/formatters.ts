export function formatDate(dateString: string): string {
  if (!dateString || dateString === '') return '-';
  return new Date(dateString).toLocaleDateString();
}

export function formatCurrency(amount: number): string {
  if (amount == null || isNaN(amount)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}