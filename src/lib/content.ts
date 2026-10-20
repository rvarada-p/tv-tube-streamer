/** One past the highest display position; the item count can collide after a delete. */
export function nextDisplayOrder(items: { display_order: number | null }[]): number {
  return items.reduce((max, item) => Math.max(max, item.display_order ?? -1), -1) + 1;
}
