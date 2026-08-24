"""Unit tests for deterministic work-history timeline analysis."""

from datetime import UTC, datetime

from merix.services import timeline


def _now_year() -> int:
    return datetime.now(tz=UTC).year


# --- parse_year ---


def test_parse_year_plain():
    assert timeline.parse_year("2020") == 2020
    assert timeline.parse_year("Jan 2019") == 2019
    assert timeline.parse_year("Mar-2021 to Present") == 2021


def test_parse_present_is_current_year():
    assert timeline.parse_year("Present") == _now_year()
    assert timeline.parse_year("Current") == _now_year()
    assert timeline.parse_year("till date") == _now_year()


def test_parse_year_garbage_returns_none():
    for bad in [None, "", "-", "N/A", "unknown"]:
        assert timeline.parse_year(bad) is None, bad


# --- analyse_timeline ---


def test_empty_entries_yield_zeroed_analysis():
    out = timeline.analyse_timeline(None)
    assert out["spans"] == [] and out["total_experience_years"] == 0.0


def test_total_experience_uses_union_not_sum():
    entries = [
        {"company": "A", "title": "Dev", "start": "2018", "end": "2020"},
        {"company": "B", "title": "Sr Dev", "start": "2019", "end": "2021"},
    ]
    out = timeline.analyse_timeline(entries)
    # Overlapping 2018-2020 and 2019-2021 -> union is 3 years, not 4.
    assert out["total_experience_years"] == 3.0
    assert out["overlaps"] == [["A", "B"]]


def test_gap_detection_between_roles():
    entries = [
        {"company": "A", "title": "Dev", "start": "2015", "end": "2017"},
        {"company": "B", "title": "Dev2", "start": "2020", "end": "2022"},
    ]
    out = timeline.analyse_timeline(entries)
    assert len(out["gaps"]) == 1
    assert out["gaps"][0]["after_year"] == 2017
    assert out["gaps"][0]["months"] >= 24
    assert out["total_experience_years"] == 4.0


def test_open_end_assumed_present_and_flagged_free():
    entries = [{"company": "A", "title": "CTO", "start": "2022", "end": ""}]
    out = timeline.analyse_timeline(entries)
    assert out["spans"][0]["end_open"] is True
    assert out["spans"][0]["end_year"] == _now_year()
    assert not any("unparseable" in f for f in out["flags"])


def test_implausible_range_is_flagged_and_dropped():
    entries = [
        {"company": "X", "title": "Dev", "start": "2025", "end": "2019"},
        {"company": "Y", "title": "Dev", "start": "2018", "end": "2019"},
    ]
    out = timeline.analyse_timeline(entries)
    assert any("implausible_range:X" in f for f in out["flags"])
    assert [s["company"] for s in out["spans"]] == ["Y"]
