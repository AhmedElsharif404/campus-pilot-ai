from datetime import date

from campus_pilot.extraction.router import academic_datetime


def test_assignment_date_is_normalized_inside_semester() -> None:
    parsed = academic_datetime(
        "Lab report due Sept. 18 by 11:59pm",
        date(2026, 8, 20),
        date(2026, 12, 20),
        allow_end_of_day=True,
    )
    assert parsed is not None
    assert parsed.isoformat() == "2026-09-18T23:59:00+00:00"


def test_ambiguous_exam_time_is_not_made_canonical() -> None:
    parsed = academic_datetime(
        "Midterm exam October 12 during regular class hours",
        date(2026, 8, 20),
        date(2026, 12, 20),
        allow_end_of_day=False,
    )
    assert parsed is None


def test_date_outside_semester_is_rejected() -> None:
    parsed = academic_datetime(
        "Essay due February 2",
        date(2026, 8, 20),
        date(2026, 12, 20),
        allow_end_of_day=True,
    )
    assert parsed is None
