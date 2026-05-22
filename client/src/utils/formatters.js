// Pluralize helper
export function pluralize(count, word) {
  return count === 1 ? `${count} ${word}` : `${count} ${word}s`;
}

// Format timestamps
export function timestampFormatter(itemDate) {
  const now = new Date(); //Current date and time

  const diffSeconds = Math.floor((now - itemDate) / 1000); //Difference in seconds
  if (diffSeconds < 60) {
    return `${pluralize(diffSeconds, "second")} ago`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60); //Difference in minutes
  if (diffMinutes < 60) {
    return `${pluralize(diffMinutes, "minute")} ago`;
  }

  const diffHours = Math.floor(diffSeconds / 3600); //Difference in hours
  if (diffHours < 24) {
    return `${pluralize(diffHours, "hour")} ago`;
  }

  const diffDays = Math.floor(diffSeconds / 86400); //Difference in days
  if (diffDays < 30) {
    return `${pluralize(diffDays, "day")} ago`;
  }

  const diffMonths = Math.floor(diffDays / 30); //Difference in months
  if (diffMonths < 12) {
    return `${pluralize(diffMonths, "month")} ago`;
  }

  const diffYears = Math.floor(diffDays / 365); //Difference in years
  return `${pluralize(diffYears, "year")} ago`;
}

export const parseDate = (arr, key) =>
  arr.map((item) => ({
    ...item,
    [key]: item[key] ? new Date(item[key]) : item[key],
  }));
