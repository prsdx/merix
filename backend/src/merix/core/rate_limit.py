"""Rate limiting (signup/login brute-force protection).

slowapi (wrapper around the established `limits` library) with in-process
memory storage — correct for v1's single uvicorn process. When we scale to
multiple replicas this needs a shared storage backend (Redis) or a gateway-level
limiter; per-process counters under-count otherwise.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

# Keyed by client IP. Signup is expensive (org + user creation), login is the
# credential-guessing surface, hence the tighter window.
limiter = Limiter(key_func=get_remote_address)

SIGNUP_RATE_LIMIT = "5/hour"
LOGIN_RATE_LIMIT = "10/minute"
