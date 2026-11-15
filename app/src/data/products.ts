export type ReviewStatus = "Draft" | "In review" | "Approved"
/** unreviewed: AI finding not reviewed · flagged: turned into open issues · kept / manual: resolved */
export type FindingStatus = "unreviewed" | "flagged" | "kept" | "manual"

export interface Product {
  styleNumber: string
  category: string
  styleName: string
  reviewStatus: ReviewStatus
  finding: FindingStatus | null
  openIssues: number
}

export const SET_NAME = "SS27 / M / Urban Jungle"
export const DEADLINE = "15 January 2027"
export const COLLECTION = `${SET_NAME}, deadline ${DEADLINE}`

export const initialProducts: Product[] = [
  { styleNumber: "271002741", category: "Knit Sweater", styleName: "Valentin-Unisex", reviewStatus: "Draft", finding: "unreviewed", openIssues: 0 },
  { styleNumber: "271002742", category: "Overshirt", styleName: "Markos", reviewStatus: "Draft", finding: null, openIssues: 0 },
  { styleNumber: "271002743", category: "Chino", styleName: "Elio", reviewStatus: "Draft", finding: null, openIssues: 0 },
  { styleNumber: "271002744", category: "T-Shirt", styleName: "Tarik", reviewStatus: "Draft", finding: null, openIssues: 0 },
  { styleNumber: "271002745", category: "Bomber Jacket", styleName: "Jonas", reviewStatus: "Draft", finding: null, openIssues: 0 },
  { styleNumber: "271002746", category: "Knit Polo", styleName: "Mats", reviewStatus: "Draft", finding: null, openIssues: 0 },
]

export const productName = (p: Product) => `${p.category} ${p.styleName}`
export const productLabel = (p: Product) => `${p.category} ${p.styleName}, style ${p.styleNumber}`

export function hasBlockingIssue(p: Product) {
  return p.finding === "unreviewed" || p.openIssues > 0
}

export function issueText(p: Product) {
  if (p.finding === "unreviewed") return "AI finding, not reviewed"
  if (p.openIssues > 0) return `${p.openIssues} open issues`
  return "No issues"
}

export const DASHBOARD_SETS = [
  { name: "SS27 / M / Urban Jungle", status: "Active", progress: "0/6", created: "1 August 2026", by: "John Doe", clickable: true },
  { name: "SS27 / W / Cottage Core", status: "Active", progress: "0/12", created: "1 August 2026", by: "Jane Doe", clickable: false },
  { name: "PRE27 / W / Capsule", status: "Active", progress: "58/60", created: "1 February 2026", by: "Jane Doe", clickable: false },
]

export const RECIPIENTS = ["Jane Doe, Product Development", "John Doe, Sourcing"]
