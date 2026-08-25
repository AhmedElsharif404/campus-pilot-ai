import pytest
from pydantic import ValidationError

from campus_pilot.ai.provider import GroundedField


def test_extracted_field_requires_valid_provenance() -> None:
    with pytest.raises(ValidationError):
        GroundedField(
            entity_type="assignment",
            field_name="deadline",
            extracted_value="Friday",
            confidence=1.2,
            page_number=0,
            source_text_reference="",
        )


def test_extracted_field_accepts_grounded_value() -> None:
    field = GroundedField(
        entity_type="assignment",
        field_name="deadline",
        extracted_value="September 18",
        confidence=0.91,
        page_number=3,
        source_text_reference="Lab report due September 18",
    )
    assert field.page_number == 3
    assert field.confidence == 0.91
