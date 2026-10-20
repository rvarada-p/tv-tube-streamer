const hhmm = (date: Date) => date.toTimeString().slice(0, 5);

/**
 * The first ad whose slot started within the last `graceMinutes` before `now`.
 * The grace window lets a late or restarted check still play the ad.
 */
export function findDueAd<T extends { slot_time: string }>(ads: T[], now: Date, graceMinutes = 2): T | undefined {
  const current = hhmm(now);
  const graceStart = hhmm(new Date(now.getTime() - graceMinutes * 60 * 1000));
  return ads.find((ad) => {
    const slot = ad.slot_time.slice(0, 5);
    return slot <= current && slot >= graceStart;
  });
}
