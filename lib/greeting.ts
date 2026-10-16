/** "Good morning" etc. in school time, whatever the server's timezone. */
export function greeting(now = new Date()) {
  const hour = Number(
    now.toLocaleString("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/London" })
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
