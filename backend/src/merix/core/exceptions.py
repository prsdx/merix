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


class AuthenticationError(MerixError):
    """Missing or invalid authentication credentials."""


class FileTooLargeError(ValidationError):
    """Uploaded file exceeds the size limit."""

    def __init__(self, max_bytes: int) -> None:
        super().__init__(f"File exceeds the maximum size of {max_bytes} bytes.")
        self.max_bytes = max_bytes


class UnsupportedFileTypeError(ValidationError):
    """Uploaded file is not a supported type (not a PDF)."""


class UnparseableFileError(ValidationError):
    """File could not be parsed (encrypted, corrupt, or image-only/scanned)."""
