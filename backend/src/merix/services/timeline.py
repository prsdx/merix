"""Timeline reconstruction: deterministic analysis of a resume's work history.

The LLM extracts raw ``timeline`` entries (company/title/start/end as written).
This module turns them into recruiter-facing facts WITHOUT trusting the LLM's
arithmetic: tenure spans, union-based total experience, overlapping roles, and
employment gaps. Pure functions, fully unit-testable.
"""

from __future__ import annotations

import re
from datetime import UTC, datetime

_MONTHS = {
    "jan": 1,
    "feb": 2,
    "mar": 3,
    "apr": 4,
    "may": 5,
    "jun": 6,
    "jul": 7,
    "aug": 8,
    "sep": 9,
    "oct": 10,
    "nov": 11,
    "dec": 12,
}
_YEAR_RE = re.compile(r"\b(\d{4})\b")
_PRESENT_WORDS = ("present", "current", "now", "today", "till date", "ongoing")
_EMPTY_VALUES = {"", "-", "—", "–", "n/a", "na", "none"}

# Gaps shorter than this are noise (job hunting, internships ending).
_GAP_THRESHOLD_MONTHS = 6


def _current_year() -> int:
    return datetime.now(tz=UTC).year


def parse_year(value: object) -> int | None:
    """Parse a date-ish value to a year.

    An explicit year always wins ("Mar-2021 to Present" -> 2021).
    'Present'-style values without a year -> current year.
    """
    if value is None:
        return None
    s = str(value).strip().lower()
    if not s or s in _EMPTY_VALUES:
        return None
    match = _YEAR_RE.search(s)
    if match:
        return int(match.group(1))
    for word in _PRESENT_WORDS:
        if re.search(rf"\b{re.escape(word)}\b", s):
            return _current_year()
    return None


def _merge_intervals(intervals: list[tuple[int, int]]) -> list[tuple[int, float]]:
    """Merge (start_month_index, end_month_index) pairs; returns union coverage."""
    merged: list[list[float]] = []
    for start, end in sorted(intervals):
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return [(a, b) for a, b in merged]


def _to_month_index(year: int) -> float:
    return year * 12.0


def analyse_timeline(entries: list[dict] | None) -> dict:
    """Deterministically analyse raw timeline entries from resume extraction.

    Returns a dict safe to embed in ``Resume.parsed["timeline_analysis"]``.
    Never raises: malformed entries are flagged, not fatal.
    """
    analysis: dict = {
        "total_experience_years": 0.0,
        "spans": [],
        "overlaps": [],
        "gaps": [],
        "flags": [],
    }
    if not entries:
        return analysis

    intervals: list[tuple[int, int]] = []
    spans: list[dict] = []
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        company = str(entry.get("company") or "unknown").strip()
        title = str(entry.get("title") or "").strip()
        start = parse_year(entry.get("start"))
        end_raw = entry.get("end")
        end = parse_year(end_raw)
        end_open = end is None and str(end_raw or "").strip().lower() in _EMPTY_VALUES
        if end is None:
            # No usable end: assume ongoing only when the field is blank;
            # unparseable text stays unassumed and gets flagged instead.
            if str(end_raw or "").strip():
                analysis["flags"].append(f"unparseable_end:{company}")
                continue
            end = _current_year()
            end_open = True
        if start is None:
            analysis["flags"].append(f"unparseable_start:{company}")
            continue
        if end < start:
            analysis["flags"].append(f"implausible_range:{company}:{start}-{end}")
            continue
        spans.append(
            {
                "company": company,
                "title": title,
                "start_year": start,
                "end_year": end,
                "end_open": end_open,
            }
        )
        # Year granularity: a tenure "2018-2020" counts as 2018.0 -> 2020.0
        # in month units (2 years), not through December of the end year.
        intervals.append((_to_month_index(start), _to_month_index(end)))

    if not spans:
        return analysis

    spans.sort(key=lambda s: (s["start_year"], s["end_year"]))
    analysis["spans"] = spans

    # Total experience: union of tenures, so concurrent roles don't double-count.
    covered_months = sum(end - start for start, end in _merge_intervals(intervals))
    analysis["total_experience_years"] = round(covered_months / 12.0, 1)

    # Overlaps between chronologically adjacent spans.
    for prev, nxt in zip(spans, spans[1:], strict=False):
        if nxt["start_year"] < prev["end_year"]:
            analysis["overlaps"].append([prev["company"], nxt["company"]])

    # Gaps between merged coverage intervals.
    merged = _merge_intervals(intervals)
    for (_, prev_end), (next_start, _) in zip(merged, merged[1:], strict=False):
        gap_months = next_start - prev_end
        if gap_months >= _GAP_THRESHOLD_MONTHS:
            analysis["gaps"].append({"after_year": int(prev_end // 12), "months": int(gap_months)})

    return analysis
