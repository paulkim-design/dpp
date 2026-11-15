# Design Context Brief & State JSON

## 1. What the feature does

An AI check on the product details page of a DPP review tool. It reads a supplier document (e.g. a GRS certificate) for one product attribute, compares it with the product's values from the materials source of truth, and shows each difference with its page reference so the approver can flag it or keep the product values.

## 2. States

The prototype is a small app: dashboard, list view, product side panel, product details page. The AI panel is one component on the product details page, in the right column next to the document preview. Six states and two variants.

Visual direction: none yet. Build with shadcn/ui components and its default neutral theme, following the layout of the attached wireframes. No brand colors, no custom styling.

- **High confidence:** up to 3 differences, an explanation quoting the source line, Flag and Keep actions.
- **Low confidence:** one reading the check is unsure about, the reason confidence is low, Review source and manual entry actions.
- **No result:** two reasons. No documents linked: list of this material's documents that fit the check. Not readable: no reading reached 0.60; manual entry and upload actions.
- **Failure:** the check did not finish; what is saved; next step that fits the cause.
- **Cold start:** the brand has no completed checks yet. Shown in the list view when a set opens. Receives the `no_result` payload; the interface replaces the no-result body with the onboarding affordances (sample data card, Try sample check, Upload certificate).
- **Waiting:** the check is running. No payload. Progress per document, skeleton output, Cancel check.
- **Variant, Feedback no:** high or low confidence after the user selects No. Feedback form replaces the feedback row.
- **Variant, Long output:** high confidence with more than 3 differences. First 3 differences shown, then Show more. Card scrolls; actions and feedback stay pinned at the panel foot.

## 3. Output constraints (verbatim from Lesson 5 annotations)

- Maximum 3 differences, then "Show more"
- Each certificate value as full fiber name with abbreviation in parentheses, e.g. Polyester (PES), with page reference
- Explanation of maximum 4 sentences, quoting the source line
- Confidence as "High" or "Low", no number

## 4. Data boundary rules

Every field appears in every payload. A field that doesn't apply to a state is `null` or `[]`, as listed in the last column.

| Field | Type | Bounds | Per state |
| --- | --- | --- | --- |
| `state` | string | one of `high_confidence`, `low_confidence`, `no_result`, `error` | all |
| `confidence` | float | 0.00 to 1.00. Never rendered | high: above 0.90 · low: 0.60 to 0.90 · no_result, error: `null` |
| `product.product_category` | string | 3 to 20 characters | all |
| `product.style_name` | string | 3 to 16 characters, a name, not the product category | all |
| `product.style_number` | string | exactly 9 digits: 2-digit year, 1 digit season (1 spring/summer, 2 fall/winter), 6-digit style | all |
| `attribute.name` | string | 3 to 40 characters, sentence case | all |
| `attribute.scope` | string | 3 to 40 characters, lower case | all |
| `summary` | string | 60 to 160 characters, 1 or 2 sentences | high, low · no_result, error: `null` |
| `differences` | array of objects | 0 to 5 items. One difference per field per colorway | high: 1 to 5 · low: exactly 1 · no_result, error: `[]` |
| `differences[].label` | string | 3 to 40 characters, lower case | high, low |
| `differences[].certificate_value` | string | 1 to 60 characters. Full fiber name with the document's abbreviation in parentheses, e.g. "45% polyester (PES)" | high, low |
| `differences[].product_value` | string | 1 to 60 characters | high, low |
| `differences[].pages` | array of integers | 1 to 5 items, each 1 to 999 | high, low |
| `explanation` | string | 80 to 480 characters, 1 to 4 sentences, contains at least one quote of the source line in “ ” | high, low · no_result, error: `null` |
| `sources` | array of objects | 0 to 5 items | high, low: 1 to 5 · error: exactly 1 · no_result: exactly 1 when `not_readable`, otherwise `[]` |
| `sources[].document_name` | string | 3 to 50 characters |  |
| `sources[].pages` | array of integers | 0 to 10 items, each 1 to 999. Empty only in error and `not_readable` |  |
| `sources[].valid_until` | string or null | ISO date `YYYY-MM-DD`, rendered as "12 March 2027" |  |
| `candidate_documents` | array of objects | 0 to 3 items | no_result with `no_documents_linked`: 0 to 3 · all others: `[]` |
| `candidate_documents[].document_name` | string | 3 to 50 characters |  |
| `candidate_documents[].valid_until` | string | ISO date `YYYY-MM-DD`, not in the past |  |
| `error_code` | string or null | one of `file_locked` | error only · all others: `null` |
| `no_result_reason` | string or null | one of `no_documents_linked`, `not_readable` | no_result only · all others: `null` |

## 5. Interface elements per state

**Shared frame (all states):** eyebrow line, heading, Close button; AI card with label and status chip; summary sentence.

- **High confidence:** output box with count heading; per difference a title and two columns (certificate, product), divider between differences; first 3 differences, then Show more; reason box with explanation and source link; primary and secondary action; feedback row with Yes / No; footnote.
- **Low confidence:** output box with one reading in two columns; reason box with explanation and source link; primary and secondary action; feedback row with Yes / No; footnote.
- **No result, no documents linked:** document list with heading and one row per candidate document (name, valid-until line, row button); list hidden when `candidate_documents` is empty; feedback row with Yes / No.
- **No result, not readable:** source link; primary and secondary action; feedback row with Yes / No.
- **Failure:** "What is saved" box; primary and secondary action. No feedback row, no footnote.
- **Cold start:** set-level eyebrow and heading; sample data box with two columns; primary and secondary action; footnote. Sits in the list view's side panel spot when a set opens and the brand has no completed checks. Closes with Close or when the user opens a product with "Open issues". "Try sample check" runs in the same panel: Waiting, then the result for the sample product, nothing added to the user's products. "Upload certificate": file picker, Waiting, then the result on the details page of the product the certificate belongs to. After the first completed check, cold start no longer appears.
- **Waiting:** progress line and progress bar; skeleton output box and skeleton reason box in the shape of the real ones; cancel action; footnote.
- **Feedback no:** high or low confidence card with the feedback row replaced by a question, three checkboxes, text input, primary and secondary action.
- **Long output:** AI card inside a scroll area; each difference separate, first 3 shown, then Show more; actions and feedback row pinned below it.

**Outside the panel:** the source links scroll the document preview to the cited page and mark the cited line. The attribute in the product details page shows its AI status until the user picks an action.

**Screens around the panel:**

- **Dashboard:** season header; summary numbers; product sync status; button to the list; tabs, only the first with content; set table, one row opens the list view.
- **List view:** breadcrumbs; filter and sort controls; table with multi-select; per row an issue count, "Open issues" and "Show product details"; bulk approve button when rows are selected.
- **Bulk approve modal:** products that will be approved; products with open issues or AI findings listed separately and not approved; confirm and cancel.
- **Product side panel** (from "Open issues"): product identification, review status, collection; list of issues; Show product details, Send for review, Approve. Clicking an issue opens the product details page with that issue's AI panel.
- **Send for review modal:** recipient select, message field, Send, Cancel. Afterwards the product's review status is In review.
- **Product details page:** breadcrumbs, version, Send for review, Approve; attributes column; document preview; AI panel.
- **Approve** (side panel and details page) is disabled while the product has an open issue or an AI finding not reviewed. Once approved, the review status is Approved.
- **After an AI panel action:** "Flag {n} issues" turns the finding into {n} open issues, which go out with Send for review. "Keep product values" or a manual entry resolves the finding.

## 6. Copy

Placeholders in {braces} are filled from the payload. Everything else is fixed.

**Shared**

- Eyebrow: "Issue on {product_category} {style_name}, style {style_number}"
- Heading: "{attribute name}, {attribute scope}"
- Card label: "AI CHECK"
- Close button: "Close"
- Show more / less: "Show more", "Show less"
- Feedback buttons: "Yes", "No"

**High confidence**

- Chip: "High confidence"
- Output heading: "What the check found, {n} differences"
- Difference title: "Difference {i}: {label}"
- Column labels: "In certificate", "In product"
- Reason heading: "Why this was flagged"
- Source link: "View source, page {pages}" (several pages: "View source, pages 2, 3 and 7")
- Buttons: "Flag {n} issues", "Keep product values"
- Feedback question: "Were these findings useful?"
- Footnote: "Nothing changes until you choose an action."

**Low confidence**

- Chip: "Low confidence"
- Output heading: "Reading"
- Column labels: "Reading from certificate", "Value in product"
- Reason heading: "Why confidence is low"
- Source link: "View source, pages {pages}"
- Buttons: "Review source (p. {pages})", "Enter {label}"
- Feedback question: "Was this result useful?"
- Footnote: "Nothing changes until you choose an action."

**No result (no_documents_linked)**

- Chip: "No result"
- Summary: "The check found nothing to compare this value against. The documents for this material are not linked to this check yet."
- List heading: "Documents for this material, {n} files"
- Row line: "Valid until {valid_until}"
- Row button: "Use for this check"
- Feedback question: "Did you expect a finding here?"

**No result (not_readable)**

- Chip: "No result"
- Summary: "The check could not read this document clearly enough to compare it. Enter the value manually or upload a clearer file."
- Source link: "View source"
- Buttons: "Enter values manually", "Upload clearer file"
- Feedback question: "Did you expect a finding here?"

**Failure (file_locked)**

- Chip: "Check failed"
- Summary: "The check did not finish. It could not open the {document_name} because the file is password protected."
- Box heading: "What is saved"
- Box text: "Nothing was changed. Your values, the uploaded file and your review notes are exactly as you left them."
- Buttons: "Upload unlocked file", "Enter values manually"

**Cold start**

- Eyebrow: "Side panel, {set name}" (prototype: "SS27 / M / Urban Jungle")
- Heading: "Evidence check"
- Chip: "New, no checks yet"
- Summary: "No checks yet. Run one on a sample product to see what the check finds, or upload a certificate of your own."
- Box heading: "Sample data, not your products"
- Column labels: "Sample product", "Example finding"
- Sample product: "Linen Shirt Liora, style 271000001"
- Example finding: "Certificate lists 100% linen. Product lists 55% linen and 45% cotton."
- Buttons: "Try sample check", "Upload certificate"
- Footnote: "Takes about 20 seconds. Nothing is added to your products."

**Waiting**

- Chip: "In progress"
- Summary: "Checking {attributes} against {n} documents. This usually takes about 20 seconds."
- Progress line: "Reading document {i} of {n}: {document_name}"
- Button: "Cancel check"
- Footnote: "You can keep working. Your values stay unchanged while the check runs, and cancelling keeps everything as it is."

**Feedback no**

- Question: "Thanks. What was wrong?"
- Options: "The certificate does not say that", "This is not relevant to this product", "Something else"
- Input placeholder: "Tell us more (optional)"
- Buttons: "Send feedback", "Skip"

**Product details page**

- Attribute status: "AI finding, not reviewed"
- Preview marker: "Cited in finding"
- Breadcrumbs: "Product sets / SS27 / M / Urban Jungle / Knit Sweater Valentin-Unisex"
- Version: "Version: draft, revision 1"
- Buttons: "Send for review", "Approve"
- Attribute groups: "Identification", "Material, main fabric", "Supplier"

**Dashboard**

- Season header: "SS27, deadline 15 January 2027"
- Summary: "1 AI finding to review", "17 ready to approve", "18 of 1,004 planned products imported"
- Sync status: "Product data synced from PLM today"
- Button: "Review products"
- Section heading: "Your workspace"
- Tabs: "Active product sets", "Recently published DPP", "Recently viewed products"
- Table headers: "Set", "Status", "Progress", "Creation date", "Created by"
- Rows: "SS27 / M / Urban Jungle", "Active", "0/6", "1 August 2026", "John Doe" · "SS27 / W / Cottage Core", "Active", "0/12", "1 August 2026", "Jane Doe" · "PRE27 / W / Capsule", "Active", "58/60", "1 February 2026", "Jane Doe"

**List view**

- Breadcrumbs: "Product sets / SS27 / M / Urban Jungle"
- Filters: "Review status", "Issues", "Product category"
- Sort: "Sort by style number"
- Column headers: "Review status", "Collection", "Identification", "Issues"
- Review status values: "Draft", "In review", "Approved"
- Collection cell: "SS27 / M / Urban Jungle, deadline 15 January 2027"
- Issue cell: "AI finding, not reviewed", "{n} open issues", "No issues"
- Row actions: "Open issues", "Show product details"
- Bulk action: "Approve {n} products"
- Rows (all Draft): "Knit Sweater Valentin-Unisex, style 271002741" with "AI finding, not reviewed" · "Overshirt Markos, style 271002742" · "Chino Elio, style 271002743" · "T-Shirt Tarik, style 271002744" · "Bomber Jacket Jonas, style 271002745" · "Knit Polo Mats, style 271002746", each with "No issues"

**Bulk approve modal**

- Title: "Approve {n} products?"
- List heading: "These products will be approved"
- Excluded heading: "Not approved, open issues or AI findings"
- Buttons: "Approve {n} products", "Cancel"

**Product side panel**

- Header: "{product_category} {style_name}, style {style_number}"
- Labels: "Review status", "Collection", "Issues"
- Issue row: "Fiber composition, main fabric", "AI finding, not reviewed"
- Buttons: "Show product details", "Send for review", "Approve", "Close"
- Approve disabled hint: "Approve is available when no issues are open."

**Send for review modal**

- Title: "Send for review"
- To field: "To", placeholder "Search name or team"
- Recipients: "Jane Doe, Product Development", "John Doe, Sourcing"
- Message field: "Message", placeholder "Can you check this please?"
- Buttons: "Send", "Cancel"

## 7. Scope

**In scope, build these:** dashboard with one clickable set (SS27 / M / Urban Jungle); list view with filters, sort, multi-select and bulk approve with its modal; product side panel; Send for review with its modal and the In review status; Approve on product level; product details page with attributes column, document preview and AI panel; the AI panel in all six states and both variants; a state switcher; Flag and Keep actions; source links opening the cited page in the preview; manual entry field for "Enter {label}" and "Enter values manually"; Use for this check, Try sample check and Upload (mock file picker) leading to Waiting, then a result; Cancel check returning to the previous state; feedback Yes / No and the feedback form; Show more / Show less.

**Below 0.60:** no reading is shown; the panel shows No result with the reason not readable.

**Out of scope, do not build:** other sets and the content of the other two dashboard tabs; the team member's side of a send-back; a Draft button; flagging the same issue on several products at once; import and data source setup (sync status only); viewing or resetting what the AI has learned; re-review after publication; two users on the same product; connection or model failures and a "Try again" control; live model calls.

## 8. What must never appear

- An approve or publish action inside the AI panel
- A value filled in by the AI where the document states none
- Product values that change before the user picks an action
- Expired documents, or documents that don't cover the checked value, in the "Documents for this material" list
- Generated brand content (care instructions, end-of-life guidance)
- Real people, brands, suppliers or certificate numbers. All content is invented.

## 9. Accessibility

- Text contrast at least 4.5:1 against its background, including muted text on the AI card background. Borders of buttons, chips, checkboxes and inputs at least 3:1.
- Status chip and progress line are announced by screen readers (`aria-live="polite"`); status is never shown by color alone.
- All actions are reachable by Tab in visual order. Esc closes the panel. Focus moves to the panel heading on open and back to the attribute on close.

## 10. State payloads

Cold start receives the no_result payload with `no_documents_linked` and no candidate documents. Waiting has no payload.

**High confidence**

```json
{
  "state": "high_confidence",
  "confidence": 0.91,
  "product": {
    "product_category": "Knit Sweater",
    "style_name": "Valentin-Unisex",
    "style_number": "271002741"
  },
  "attribute": {
    "name": "Fiber composition",
    "scope": "main fabric, all 3 colorways"
  },
  "summary": "The certificate and this product differ in 5 places across 3 colorways: the fiber percentages of Navy and Rust, and the recycled polyester in all three.",
  "differences": [
    {
      "label": "navy, fiber percentages",
      "certificate_value": "45% virgin wool (WV), 55% polyester (PES)",
      "product_value": "50% wool, 50% polyester",
      "pages": [2]
    },
    {
      "label": "rust, fiber percentages",
      "certificate_value": "45% virgin wool (WV), 52% polyester (PES), 3% elastane (EL)",
      "product_value": "50% wool, 50% polyester",
      "pages": [7]
    },
    {
      "label": "navy, recycled",
      "certificate_value": "Polyester (PES), recycled",
      "product_value": "Recycled not checked",
      "pages": [2]
    },
    {
      "label": "ecru, recycled",
      "certificate_value": "Polyester (PES), recycled",
      "product_value": "Recycled not checked",
      "pages": [3]
    },
    {
      "label": "rust, recycled",
      "certificate_value": "Polyester (PES), recycled",
      "product_value": "Recycled not checked",
      "pages": [7]
    }
  ],
  "explanation": "Pages 2, 3 and 7 of the GRS certificate, section “Composition per colorway”, list Navy as “45% WV, 55% PES (recycled)”, Ecru as “50% WV, 50% PES (recycled)” and Rust as “45% WV, 52% PES, 3% EL (recycled PES)”. WV is virgin wool, PES is polyester and EL is elastane. Navy and Rust differ in their percentages, Rust also lists elastane, and the product has recycled unchecked on all 3 colorways. The certificate is valid until 12 March 2027.",
  "sources": [
    {
      "document_name": "GRS certificate",
      "pages": [2, 3, 7],
      "valid_until": "2027-03-12"
    },
    {
      "document_name": "Supplier declaration, signed 14 September 2026",
      "pages": [1],
      "valid_until": null
    }
  ],
  "candidate_documents": [],
  "error_code": null,
  "no_result_reason": null
}
```

**Low confidence**

```json
{
  "state": "low_confidence",
  "confidence": 0.61,
  "product": {
    "product_category": "Knit Sweater",
    "style_name": "Valentin-Unisex",
    "style_number": "271002741"
  },
  "attribute": {
    "name": "Fiber composition",
    "scope": "main fabric"
  },
  "summary": "The certificate says the polyester in the main fabric is recycled but gives no share for it. Review pages 2 and 3 of the certificate before you use this value.",
  "differences": [
    {
      "label": "recycled share",
      "certificate_value": "Polyester (PES), recycled, share not stated",
      "product_value": "Recycled not checked",
      "pages": [2, 3]
    }
  ],
  "explanation": "Page 2 of the GRS certificate, line “Composition”, says “45% WV, 55% PES (recycled)”, but page 3 says “recycled share on request”. The certificate does not say how much of the polyester in the main fabric is recycled. The product has recycled unchecked and no recycled share, so the two values cannot be compared yet. The certificate is valid until 12 March 2027.",
  "sources": [
    {
      "document_name": "GRS certificate",
      "pages": [2, 3],
      "valid_until": "2027-03-12"
    }
  ],
  "candidate_documents": [],
  "error_code": null,
  "no_result_reason": null
}
```

**No result**

```json
{
  "state": "no_result",
  "confidence": null,
  "product": {
    "product_category": "Knit Sweater",
    "style_name": "Valentin-Unisex",
    "style_number": "271002741"
  },
  "attribute": {
    "name": "Fiber composition",
    "scope": "main fabric"
  },
  "summary": null,
  "differences": [],
  "explanation": null,
  "sources": [],
  "candidate_documents": [
    {
      "document_name": "GRS certificate",
      "valid_until": "2027-03-12"
    },
    {
      "document_name": "Recycled Claim Standard declaration",
      "valid_until": "2027-09-30"
    },
    {
      "document_name": "Supplier composition declaration",
      "valid_until": "2027-06-30"
    }
  ],
  "error_code": null,
  "no_result_reason": "no_documents_linked"
}
```

**No result, not readable**

```json
{
  "state": "no_result",
  "confidence": null,
  "product": {
    "product_category": "Knit Sweater",
    "style_name": "Valentin-Unisex",
    "style_number": "271002741"
  },
  "attribute": {
    "name": "Fiber composition",
    "scope": "main fabric"
  },
  "summary": null,
  "differences": [],
  "explanation": null,
  "sources": [
    {
      "document_name": "Supplier declaration, signed 14 September 2026",
      "pages": [],
      "valid_until": null
    }
  ],
  "candidate_documents": [],
  "error_code": null,
  "no_result_reason": "not_readable"
}
```

**Error**

```json
{
  "state": "error",
  "confidence": null,
  "product": {
    "product_category": "Knit Sweater",
    "style_name": "Valentin-Unisex",
    "style_number": "271002741"
  },
  "attribute": {
    "name": "Fiber composition",
    "scope": "main fabric"
  },
  "summary": null,
  "differences": [],
  "explanation": null,
  "sources": [
    {
      "document_name": "GRS certificate",
      "pages": [],
      "valid_until": null
    }
  ],
  "candidate_documents": [],
  "error_code": "file_locked",
  "no_result_reason": null
}
```