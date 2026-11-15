# Figma screen map

File: Capstone (`Ib5bko7QNH6nDZNgJUQEE9`), page "Design" (`21:447`). Flow start: "DPP prototype" on 01 Dashboard.
Link pattern: `https://www.figma.com/design/Ib5bko7QNH6nDZNgJUQEE9/Capstone?node-id=<id with - instead of :>`

## Sections
| Section | Node |
| --- | --- |
| Components | 23:673 |
| AI Check Panel | 23:674 |
| Screens | 23:675 |

## Components (shadcn/ui, built locally)
| Component | Node | Props |
| --- | --- | --- |
| Button | 25:721 | Variant (default, secondary, outline, ghost, destructive, link), Size (default, sm), Label. Disabled = 50% opacity |
| Badge | 25:731 | Variant (default, secondary, outline, destructive), Label |
| Checkbox | 25:741 | Checked, Label |
| Input / Textarea / Select trigger | 25:743 / 25:745 / 25:747 | Text |
| Tabs/Trigger | 25:756 | Active, Label |
| Sidebar/MenuButton | 25:770 | Active, Label, Icon |
| Progress / Skeleton / Separator | 25:772 / 25:774 / 25:775 | |
| App Sidebar | 30:758 | Active (Dashboard, Product sets) |
| List/ProductRow | 31:800 | Selected, Identification, Issues |
| AI Check Panel | 29:1031 | State: High confidence, Low confidence, No result, No result not readable, Failure, Cold start, Waiting, Feedback no, Long output |
| Icons (lucide) | icon/* in Components | |

## Tokens
- `shadcn/theme` (Light): shadcn neutral defaults, plus `muted-subtle` (bg-muted/50 for the AI card), `highlight` (cited line), `overlay`.
- `input` is #737373 instead of the shadcn default #e5e5e5, so control borders reach 3:1 (brief section 9).
- `shadcn/primitives`: radius sm/md/lg/xl/full, spacing 0 to 16 (4px steps).
- Text styles `shadcn/text-{xs..2xl}/{regular,medium,semibold}`, `shadcn/label-caps`, font Geist.

## Screens
| # | Screen | Node |
| --- | --- | --- |
| 01 | Dashboard | 30:759 |
| 02 | List view, cold start | 31:801 |
| 02b | List view | 36:2743 |
| 03 | List view, products selected | 31:1031 |
| 04 | Bulk approve modal | 31:1246 |
| 05 | Product side panel | 32:1284 |
| 06 | Send for review modal | 32:1507 |
| 07 | Side panel, in review | 32:1751 |
| 08 | Details, AI high confidence | 33:1765 |
| 09 | Details, AI long output | 35:1870 |
| 10 | Details, AI feedback no | 35:2055 |
| 11 | Details, AI low confidence | 35:2240 |
| 12 | Details, AI no result | 35:2425 |
| 13 | Details, AI no result not readable | 35:2610 |
| 14 | Details, AI failure | 35:2795 |
| 15 | Details, AI waiting (auto to 08 after 3 s) | 35:2980 |
| 16 | Details, finding resolved | 35:3165 |
| 17 | Details, 5 issues flagged | 35:3350 |
| 18 | List view, sample check waiting (auto to 23 after 3 s) | 35:3535 |
| 19 | Details, low confidence manual entry | 39:3009 |
| 20 | Details, not readable manual entry | 39:3174 |
| 21 | Details, failure manual entry | 39:3322 |
| 22 | Details, entered manually | 39:3465 |
| 23 | List view, sample check result | 39:3588 |
| 24 | Details, low confidence feedback no | 39:3853 |

New AI Check Panel states: Low confidence manual entry, No result not readable manual entry, Failure manual entry, Feedback no low confidence, Sample result.

## Main click paths
- 01 Review products or set row → 02 (cold start) → Close → 02b
- 02/02b Open issues (Knit Sweater) → 05 → issue row → 08
- 08 Show more → 09 · No → 10 · Flag 5 issues → 17 · Keep product values → 16
- 05 Send for review → 06 → Send → 07 (In review)
- Select all → 03 → Approve 6 products → 04
- 12 Use for this check, 13/14 Upload → 15 Waiting → 08 · Cancel check → 12
- 02 Try sample check → 18

## Payload check
Section "Payload check" (42:3532): the AI panel at 420 px with each payload from brief section 10. All pass the automated layout check (no overflow, no empty frames, no "null", pinned actions inside the panel).

Notes:
- Button has State=Default/Disabled. Disabled = 50% fill, stroke and label opacity inside the variant, so instances inherit it.
- Tall result states (High, Low, Feedback no both, Sample result, Low manual entry, Long output) are 796 px high: scroll area plus pinned foot with actions.
- Sources render per payload source: document name, "Valid until" line only when valid_until is set, and "View source" with that source's pages.

## Open points
- differences[].pages is not shown next to each certificate value (brief section 3 asks for a page reference, but section 6 has no copy for it).
- Waiting on screen 18 (sample, 1 document) shares the 67% bar of the Waiting state.
- Sample result uses "1 difference" and "Flag 1 issue" (singular) instead of the plural template.
