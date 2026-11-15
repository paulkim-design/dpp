const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]

/** ISO "2027-03-12" -> "12 March 2027" */
export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

/** [2] -> "2", [2, 3] -> "2 and 3", [2, 3, 7] -> "2, 3 and 7" */
export function listPages(pages: number[]) {
  if (pages.length <= 1) return pages.join("")
  return `${pages.slice(0, -1).join(", ")} and ${pages[pages.length - 1]}`
}

/** Source link label per brief copy: "View source", "View source, page 1", "View source, pages 2, 3 and 7" */
export function sourceLabel(pages: number[]) {
  if (pages.length === 0) return "View source"
  if (pages.length === 1) return `View source, page ${pages[0]}`
  return `View source, pages ${listPages(pages)}`
}

/** Page ranges in button labels are written "2–3" (brief section 6). */
export function pageRange(pages: number[]) {
  const consecutive = pages.every((p, i) => i === 0 || p === pages[i - 1] + 1)
  if (pages.length > 1 && consecutive) return `${pages[0]}–${pages[pages.length - 1]}`
  return listPages(pages)
}

export const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)
