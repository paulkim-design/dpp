// State payloads, verbatim from the Design Context Brief, section 10.
// Cold start receives the no_result payload with no_documents_linked and no candidate documents.
// Waiting has no payload.

export type CheckState = "high_confidence" | "low_confidence" | "no_result" | "error"

export interface Difference {
  label: string
  certificate_value: string
  product_value: string
  pages: number[]
}

export interface Source {
  document_name: string
  pages: number[]
  valid_until: string | null
}

export interface CandidateDocument {
  document_name: string
  valid_until: string
}

export interface CheckPayload {
  state: CheckState
  confidence: number | null
  product: { product_category: string; style_name: string; style_number: string }
  attribute: { name: string; scope: string }
  summary: string | null
  differences: Difference[]
  explanation: string | null
  sources: Source[]
  candidate_documents: CandidateDocument[]
  error_code: "file_locked" | null
  no_result_reason: "no_documents_linked" | "not_readable" | null
}

const knitSweater = {
  product_category: "Knit Sweater",
  style_name: "Valentin-Unisex",
  style_number: "271002741",
}

export const payloads = {
  high: {
    state: "high_confidence",
    confidence: 0.91,
    product: knitSweater,
    attribute: { name: "Fiber composition", scope: "main fabric, all 3 colorways" },
    summary:
      "The certificate and this product differ in 5 places across 3 colorways: the fiber percentages of Navy and Rust, and the recycled polyester in all three.",
    differences: [
      {
        label: "navy, fiber percentages",
        certificate_value: "45% virgin wool (WV), 55% polyester (PES)",
        product_value: "50% wool, 50% polyester",
        pages: [2],
      },
      {
        label: "rust, fiber percentages",
        certificate_value: "45% virgin wool (WV), 52% polyester (PES), 3% elastane (EL)",
        product_value: "50% wool, 50% polyester",
        pages: [7],
      },
      {
        label: "navy, recycled",
        certificate_value: "Polyester (PES), recycled",
        product_value: "Recycled not checked",
        pages: [2],
      },
      {
        label: "ecru, recycled",
        certificate_value: "Polyester (PES), recycled",
        product_value: "Recycled not checked",
        pages: [3],
      },
      {
        label: "rust, recycled",
        certificate_value: "Polyester (PES), recycled",
        product_value: "Recycled not checked",
        pages: [7],
      },
    ],
    explanation:
      "Pages 2, 3 and 7 of the GRS certificate, section “Composition per colorway”, list Navy as “45% WV, 55% PES (recycled)”, Ecru as “50% WV, 50% PES (recycled)” and Rust as “45% WV, 52% PES, 3% EL (recycled PES)”. WV is virgin wool, PES is polyester and EL is elastane. Navy and Rust differ in their percentages, Rust also lists elastane, and the product has recycled unchecked on all 3 colorways. The certificate is valid until 12 March 2027.",
    sources: [
      { document_name: "GRS certificate", pages: [2, 3, 7], valid_until: "2027-03-12" },
      {
        document_name: "Supplier declaration, signed 14 September 2026",
        pages: [1],
        valid_until: null,
      },
    ],
    candidate_documents: [],
    error_code: null,
    no_result_reason: null,
  },
  low: {
    state: "low_confidence",
    confidence: 0.61,
    product: knitSweater,
    attribute: { name: "Fiber composition", scope: "main fabric" },
    summary:
      "The certificate says the polyester in the main fabric is recycled but gives no share for it. Review pages 2 and 3 of the certificate before you use this value.",
    differences: [
      {
        label: "recycled share",
        certificate_value: "Polyester (PES), recycled, share not stated",
        product_value: "Recycled not checked",
        pages: [2, 3],
      },
    ],
    explanation:
      "Page 2 of the GRS certificate, line “Composition”, says “45% WV, 55% PES (recycled)”, but page 3 says “recycled share on request”. The certificate does not say how much of the polyester in the main fabric is recycled. The product has recycled unchecked and no recycled share, so the two values cannot be compared yet. The certificate is valid until 12 March 2027.",
    sources: [{ document_name: "GRS certificate", pages: [2, 3], valid_until: "2027-03-12" }],
    candidate_documents: [],
    error_code: null,
    no_result_reason: null,
  },
  no_result: {
    state: "no_result",
    confidence: null,
    product: knitSweater,
    attribute: { name: "Fiber composition", scope: "main fabric" },
    summary: null,
    differences: [],
    explanation: null,
    sources: [],
    candidate_documents: [
      { document_name: "GRS certificate", valid_until: "2027-03-12" },
      { document_name: "Recycled Claim Standard declaration", valid_until: "2027-09-30" },
      { document_name: "Supplier composition declaration", valid_until: "2027-06-30" },
    ],
    error_code: null,
    no_result_reason: "no_documents_linked",
  },
  not_readable: {
    state: "no_result",
    confidence: null,
    product: knitSweater,
    attribute: { name: "Fiber composition", scope: "main fabric" },
    summary: null,
    differences: [],
    explanation: null,
    sources: [
      {
        document_name: "Supplier declaration, signed 14 September 2026",
        pages: [],
        valid_until: null,
      },
    ],
    candidate_documents: [],
    error_code: null,
    no_result_reason: "not_readable",
  },
  sample: {
    state: "high_confidence",
    confidence: 0.95,
    product: { product_category: "Linen Shirt", style_name: "Liora", style_number: "271000001" },
    attribute: { name: "Fiber composition", scope: "main fabric" },
    summary:
      "The certificate and this sample product differ in 1 place: the certificate lists pure linen, the product lists a linen and cotton blend.",
    differences: [
      {
        label: "fiber percentages",
        certificate_value: "100% linen (LI)",
        product_value: "55% linen, 45% cotton",
        pages: [1],
      },
    ],
    explanation:
      "Page 1 of the sample certificate, line “Composition”, says “100% LI”. LI is linen. The product lists 55% linen and 45% cotton, so the cotton share is not covered by this certificate. This is sample data and is not added to your products.",
    sources: [{ document_name: "Sample certificate", pages: [1], valid_until: "2027-12-31" }],
    candidate_documents: [],
    error_code: null,
    no_result_reason: null,
  },
  error: {
    state: "error",
    confidence: null,
    product: knitSweater,
    attribute: { name: "Fiber composition", scope: "main fabric" },
    summary: null,
    differences: [],
    explanation: null,
    sources: [{ document_name: "GRS certificate", pages: [], valid_until: null }],
    candidate_documents: [],
    error_code: "file_locked",
    no_result_reason: null,
  },
  // Cold start: no_result payload with no_documents_linked and no candidate documents.
  cold_start: {
    state: "no_result",
    confidence: null,
    product: knitSweater,
    attribute: { name: "Fiber composition", scope: "main fabric" },
    summary: null,
    differences: [],
    explanation: null,
    sources: [],
    candidate_documents: [],
    error_code: null,
    no_result_reason: "no_documents_linked",
  },
} satisfies Record<string, CheckPayload>

export type PayloadKey = keyof typeof payloads
