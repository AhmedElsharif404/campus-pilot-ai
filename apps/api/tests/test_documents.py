import pytest

from campus_pilot.documents import pipeline


def test_pdf_mime_signature_and_size_are_validated() -> None:
    with pytest.raises(pipeline.UnsafeDocumentError, match="Only application/pdf"):
        pipeline.validate_pdf(b"%PDF-1.7", "text/plain", 100)
    with pytest.raises(pipeline.UnsafeDocumentError, match="signature"):
        pipeline.validate_pdf(b"not a pdf", "application/pdf", 100)
    with pytest.raises(pipeline.UnsafeDocumentError, match="upload limit"):
        pipeline.validate_pdf(b"%PDF-" + b"a" * 100, "application/pdf", 50)


def test_pdf_pages_are_segmented_with_limits(monkeypatch: pytest.MonkeyPatch) -> None:
    class Page:
        def __init__(self, text: str) -> None:
            self.text = text

        def extract_text(self) -> str:
            return self.text

    class Reader:
        is_encrypted = False
        pages = [Page("Course: Biology"), Page("Assignment: Lab report due Friday")]

    monkeypatch.setattr(pipeline, "PdfReader", lambda *_args, **_kwargs: Reader())
    assert pipeline.extract_pdf_pages(b"%PDF-test") == [
        "Course: Biology",
        "Assignment: Lab report due Friday",
    ]
