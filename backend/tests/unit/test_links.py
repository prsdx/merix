"""Unit tests for link extraction, normalisation, and classification."""

import pymupdf

from merix.services import links


def make_linked_pdf(text: str, uri: str) -> bytes:
    """PDF with both a text-layer URL and a hyperlink annotation."""
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((72, 72), text)
    page.insert_link({"kind": pymupdf.LINK_URI, "from": pymupdf.Rect(72, 60, 200, 76), "uri": uri})
    data = doc.tobytes()
    doc.close()
    return data


# --- normalise_link ---


def test_normalize_adds_scheme():
    assert links.normalize_link("linkedin.com/in/jane-doe") == "https://linkedin.com/in/jane-doe"


def test_normalize_lowercases_scheme_and_host():
    assert links.normalize_link("HTTPS://GitHub.COM/User/Repo") == "https://github.com/User/Repo"


def test_normalize_strips_trailing_punctuation():
    assert links.normalize_link("https://github.com/user.") == "https://github.com/user"
    assert links.normalize_link("github.com/user/repo,") == "https://github.com/user/repo"


def test_normalize_keeps_balanced_paren_url():
    url = "https://en.wikipedia.org/wiki/Python_(programming_language)"
    assert links.normalize_link(url) == url


def test_normalize_strips_tracking_params():
    out = links.normalize_link("https://linkedin.com/in/jane?utm_source=x&fbclid=abc&id=7")
    assert out == "https://linkedin.com/in/jane?id=7"


def test_normalize_rejects_garbage():
    for bad in ["", "not a link", "https://", "python", "1"]:
        assert links.normalize_link(bad) is None, bad


# --- classify_link ---


def test_classify_known_hosts():
    assert links.classify_link("https://www.linkedin.com/in/x") == "linkedin"
    assert links.classify_link("https://github.com/u/r") == "github"
    assert links.classify_link("https://dribbble.com/shots") == "portfolio"
    assert links.classify_link("https://medium.com/@x") == "blog"


def test_classify_unknown_host_is_other():
    assert links.classify_link("https://janesmith.dev/work") == "other"
    # A trick host must not be classified by substring match.
    assert links.classify_link("https://notlinkedin.com/in/x") == "other"


# --- extraction from PDFs ---


def test_collect_links_from_annotation_and_text():
    pdf = make_linked_pdf(
        "Jane Doe linkedin.com/in/jane-text github.com/jane/text-repo",
        "https://github.com/jane/annotated?utm_source=mail",
    )
    got = links.collect_links(pdf)
    urls = [item["url"] for item in got]
    # Annotation href wins and is deduped against nothing else.
    assert "https://github.com/jane/annotated" in urls
    assert all(not u.startswith(("utm", "?")) for u in urls)
    types = {item["url"]: item["type"] for item in got}
    assert types["https://github.com/jane/annotated"] == "github"
    assert any(t == "linkedin" for t in types.values())


def test_collect_links_dedupes():
    pdf = make_linked_pdf(
        "github.com/jane/dup https://github.com/jane/dup",
        "https://github.com/jane/dup",
    )
    urls = [item["url"] for item in links.collect_links(pdf)]

    assert urls.count("https://github.com/jane/dup") == 1


def test_extract_raw_urls_never_raises_on_garbage():
    assert links.extract_raw_urls(b"%PDF-not-a-real-doc") == []
