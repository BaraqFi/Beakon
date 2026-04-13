/**
 * Format a date string into a readable format.
 * "2024-10-15" → "Oct 15, 2024"
 */
export default function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
