import io
from pathlib import Path

from pypdf import PdfReader


class UnsafeDocumentError(ValueError):
    pass


def validate_pdf(content: bytes, content_type: str | None, max_bytes: int) -> None:
    if content_type != "application/pdf":
        raise UnsafeDocumentError("Only application/pdf is accepted")
    if not content or len(content) > max_bytes:
        raise UnsafeDocumentError("PDF is empty or exceeds the upload limit")
    if not content.startswith(b"%PDF-"):
        raise UnsafeDocumentError("File signature does not match PDF")


def extract_pdf_pages(content: bytes) -> list[str]:
    reader = PdfReader(io.BytesIO(content), strict=True)
    if reader.is_encrypted:
        raise UnsafeDocumentError("Encrypted PDFs are not supported")
    if len(reader.pages) > 250:
        raise UnsafeDocumentError("PDF page count exceeds the 250-page limit")
    pages: list[str] = []
    for page in reader.pages:
        text = page.extract_text() or ""
        pages.append(text[:100_000])
    if not any(text.strip() for text in pages):
        raise UnsafeDocumentError("No machine-readable text found; OCR worker is required")
    return pages


def persist_quarantined(content: bytes, upload_dir: str, object_key: str) -> str:
    root = Path(upload_dir).resolve()
    root.mkdir(parents=True, exist_ok=True)
    target = (root / object_key).resolve()
    if root not in target.parents:
        raise UnsafeDocumentError("Invalid object key")
    target.write_bytes(content)
    return str(target)
