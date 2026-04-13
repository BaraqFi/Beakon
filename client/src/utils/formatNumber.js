/**
 * Format a number into a compact human-readable string.
 * 1247382  → "1.2M"
 * 48234    → "48.2K"
 * 892      → "892"
 */
export default function formatNumber(num) {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return String(num);
}
