"""Domain exceptions."""


class MerixError(Exception):
    """Base exception for Merix."""


class NotFoundError(MerixError):
    """Resource not found."""


class ValidationError(MerixError):
    """Validation failed."""


class PermissionError(MerixError):
    """Permission denied."""


class ConflictError(MerixError):
    """Resource conflict."""
