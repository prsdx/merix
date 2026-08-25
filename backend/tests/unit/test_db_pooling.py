"""Unit tests for DB engine pooling policy (merix.db)."""

from sqlalchemy.pool import NullPool

from merix.db import connection_pool_enabled, engine


def test_pooling_disabled_under_pytest():
    """pytest-asyncio's fresh event loops break pooled connections — NullPool."""
    assert connection_pool_enabled(under_pytest=True) is False


def test_pooling_enabled_outside_pytest_regardless_of_environment():
    """Any real deployment pools, even if ENVIRONMENT is unset/misconfigured.

    Regression guard: the old ENVIRONMENT == "production" gate silently gave
    misconfigured deploys NullPool and a 3-6s handshake on every request.
    """
    assert connection_pool_enabled(under_pytest=False) is True


def test_pytest_detection_defaults_to_true_in_this_suite():
    """This suite IS pytest, so auto-detection must disable pooling."""
    assert connection_pool_enabled() is False


def test_suite_engine_uses_null_pool():
    assert isinstance(engine.pool, NullPool)
