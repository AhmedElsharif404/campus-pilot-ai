"use client";

import { Check, ChevronDown, FileText, Pencil, Save, X } from "lucide-react";
import { useMemo, useState } from "react";
import { reviewFields } from "@/lib/demo-data";

type ReviewStatus = "pending" | "accepted" | "rejected" | "edited";
type Field = {
  id: string;
  group: string;
  field: string;
  value: string;
  confidence: number;
  page: number;
  source: string;
  status: ReviewStatus;
};

export function ExtractionReview() {
  const [fields, setFields] = useState<Field[]>(
    reviewFields.map((field) => ({ ...field })) as Field[],
  );
  const [editing, setEditing] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const remaining = useMemo(
    () => fields.filter((field) => field.status === "pending").length,
    [fields],
  );

  function setStatus(id: string, status: ReviewStatus) {
    setFields((current) =>
      current.map((field) => (field.id === id ? { ...field, status } : field)),
    );
    setSaved(false);
  }
  function acceptAllHighConfidence() {
    setFields((current) =>
      current.map((field) =>
        field.confidence >= 0.9 && field.status === "pending"
          ? { ...field, status: "accepted" }
          : field,
      ),
    );
  }

  return (
    <div className="review-layout">
      <aside
        className="document-preview"
        aria-label="Source document preview"
        tabIndex={0}
      >
        <div className="document-toolbar">
          <span>
            <FileText size={16} /> BIO214_Syllabus_Fall2026.pdf
          </span>
          <span>Page 1 of 6</span>
        </div>
        <div className="paper-preview">
          <p className="preview-school">NORTHBRIDGE UNIVERSITY</p>
          <h2>BIO 214: Cell Biology</h2>
          <p className="preview-term">Fall 2026 Course Syllabus</p>
          <hr />
          <p>
            <strong>Instructor:</strong> Dr. Maya Chen
            <br />
            <strong>Email:</strong> mchen@northbridge.edu
            <br />
            <strong>Office hours:</strong> Tuesday 2–4 PM, Science Hall 316
          </p>
          <p className="highlight-source">
            Class meets M/W 9:30–10:45, Science Hall 204
          </p>
          <h3>Course description</h3>
          <p>
            This course examines the structure and function of cells, with
            special emphasis on membranes, signaling, metabolism, and cellular
            organization.
          </p>
          <h3>Learning outcomes</h3>
          <p>
            Students will evaluate experimental evidence, interpret cellular
            processes, and communicate scientific findings.
          </p>
        </div>
      </aside>
      <section className="review-editor" aria-labelledby="review-title">
        <div className="review-editor-header">
          <div>
            <p className="eyebrow">Intake · Step 2 of 3</p>
            <h1 id="review-title">Check what we found.</h1>
            <p>
              {remaining === 0
                ? "Every field has a decision."
                : `${remaining} of ${fields.length} fields still need a decision.`}
            </p>
          </div>
          <button
            className="button button-secondary"
            onClick={acceptAllHighConfidence}
            disabled={
              !fields.some(
                (field) =>
                  field.confidence >= 0.9 && field.status === "pending",
              )
            }
          >
            <Check size={16} /> Accept 90%+
          </button>
        </div>
        <div
          className="review-progress"
          role="progressbar"
          aria-label="Extraction review progress"
          aria-valuemin={0}
          aria-valuemax={fields.length}
          aria-valuenow={fields.length - remaining}
        >
          <span
            style={{
              width: `${((fields.length - remaining) / fields.length) * 100}%`,
            }}
          />
        </div>
        <div className="extraction-list">
          {fields.map((field) => (
            <article
              key={field.id}
              className={`extraction-row state-${field.status}`}
            >
              <div className="field-heading">
                <span>{field.group}</span>
                <span
                  className={`confidence-label ${field.confidence < 0.8 ? "low" : ""}`}
                >
                  {Math.round(field.confidence * 100)}% confidence
                </span>
              </div>
              <div className="field-value">
                <label htmlFor={`field-${field.id}`}>{field.field}</label>
                {editing === field.id ? (
                  <input
                    id={`field-${field.id}`}
                    autoFocus
                    value={field.value}
                    onChange={(event) =>
                      setFields((current) =>
                        current.map((item) =>
                          item.id === field.id
                            ? {
                                ...item,
                                value: event.target.value,
                                status: "edited",
                              }
                            : item,
                        ),
                      )
                    }
                  />
                ) : (
                  <p>{field.value}</p>
                )}
              </div>
              <blockquote>
                “{field.source}”{" "}
                <button aria-label={`Show source on page ${field.page}`}>
                  Page {field.page} <ChevronDown size={13} />
                </button>
              </blockquote>
              <div className="field-actions">
                {editing === field.id ? (
                  <button
                    className="review-action save"
                    onClick={() => setEditing(null)}
                  >
                    <Save size={15} /> Done editing
                  </button>
                ) : (
                  <button
                    className="review-action"
                    onClick={() =>
                      setStatus(
                        field.id,
                        field.status === "accepted" ? "pending" : "accepted",
                      )
                    }
                    aria-pressed={field.status === "accepted"}
                  >
                    <Check size={15} />{" "}
                    {field.status === "accepted" ? "Accepted" : "Accept"}
                  </button>
                )}
                <button
                  className="review-action"
                  onClick={() => setEditing(field.id)}
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  className="review-action reject"
                  onClick={() =>
                    setStatus(
                      field.id,
                      field.status === "rejected" ? "pending" : "rejected",
                    )
                  }
                  aria-pressed={field.status === "rejected"}
                >
                  <X size={15} />{" "}
                  {field.status === "rejected" ? "Rejected" : "Reject"}
                </button>
              </div>
            </article>
          ))}
        </div>
        <div className="review-submit">
          <div>
            <strong>
              {remaining === 0
                ? "Review complete"
                : `${remaining} decision${remaining === 1 ? "" : "s"} remaining`}
            </strong>
            <span>Rejected fields will not become course data.</span>
          </div>
          <button
            className="button"
            disabled={remaining > 0 || saved}
            onClick={() => setSaved(true)}
          >
            {saved ? (
              <>
                <Check size={17} /> Course created
              </>
            ) : (
              "Confirm and create course"
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
