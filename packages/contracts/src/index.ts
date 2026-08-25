import { z } from "zod";
export { ApiError, CampusPilotClient, type RequestOptions } from "./client";

export const extractionStatusSchema = z.enum([
  "pending",
  "accepted",
  "rejected",
  "edited",
]);
export const jobStatusSchema = z.enum([
  "queued",
  "processing",
  "requires_review",
  "completed",
  "failed",
]);

export const extractedFieldSchema = z.object({
  id: z.string().uuid(),
  entityType: z.enum([
    "course",
    "instructor",
    "meeting",
    "assignment",
    "exam",
    "reading",
  ]),
  fieldName: z.string(),
  extractedValue: z.string(),
  approvedValue: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  pageNumber: z.number().int().positive(),
  sourceTextReference: z.string(),
  status: extractionStatusSchema,
});

export const extractionReviewSchema = z.object({
  id: z.string().uuid(),
  documentName: z.string(),
  status: jobStatusSchema,
  fields: z.array(extractedFieldSchema),
});

export type ExtractedField = z.infer<typeof extractedFieldSchema>;
export type ExtractionReview = z.infer<typeof extractionReviewSchema>;

export type ApiPage<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};
