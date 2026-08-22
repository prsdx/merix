"""Integration tests for health check and readiness endpoints."""


def test_root_health_returns_ok_and_db_status(client):
    """GET /health returns 200 with service and DB status."""
    r = client.get("/health")
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["status"] == "ok"
    assert data["service"] == "merix"
    assert data["database"] == "ok"


def test_api_health_returns_ok_and_db_status(client):
    """GET /api/health returns 200 with service and DB status."""
    r = client.get("/api/health")
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["status"] == "ok"
    assert data["service"] == "merix"
    assert data["database"] == "ok"


def test_ready_endpoint(client):
    """GET /ready returns 200 ready."""
    r = client.get("/ready")
    assert r.status_code == 200, r.text
    assert r.json() == {"status": "ready", "service": "merix"}
