"""Matching endpoints (scaffold).

TODO: Implement in Task 3
- POST /matches - Run batch matching (JD + resumes)
- GET /matches/{id} - Get match result with explainability
- GET /matches/{id}/shortlist - Get ranked shortlist
"""

from fastapi import APIRouter

router = APIRouter()
