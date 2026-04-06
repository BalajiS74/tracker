// Check if current time is evening (for route reversal)
export const isEveningNow = () => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  // After 3:55 PM OR before 5:00 AM
  if (h > 15 || (h === 15 && m >= 55)) return true;
  if (h < 5) return true;
  return false;
};

// Format time for display
export const formatTime = (date = new Date()) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Calculate delay between scheduled and actual time
export const calculateDelay = (scheduledTime, actualTime) => {
  const scheduled = new Date(`1970/01/01 ${scheduledTime}`);
  const actual = new Date(`1970/01/01 ${actualTime}`);
  const diffMinutes = (actual - scheduled) / (1000 * 60);
  return diffMinutes > 0 ? Math.floor(diffMinutes) : 0;
};