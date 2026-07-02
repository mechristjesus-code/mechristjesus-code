"""
Shared utilities: structured logging, custom exceptions, and HTTP response helpers.
"""

import logging
import sys
from typing import Any, Dict, Optional

from fastapi import HTTPException, status
from fastapi.responses import JSONResponse


# ─── Logging ──────────────────────────────────────────────────────────────────
def get_logger(name: str) -> logging.Logger:
    """Return a consistently configured logger."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(
            logging.Formatter(
                fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )
        )
        logger.addHandler(handler)
    logger.setLevel(logging.DEBUG)
    return logger


# ─── Custom Exceptions ────────────────────────────────────────────────────────
class NotFoundError(HTTPException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class UnauthorizedError(HTTPException):
    def __init__(self, detail: str = "Not authenticated"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class ForbiddenError(HTTPException):
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class ConflictError(HTTPException):
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class ValidationError(HTTPException):
    def __init__(self, detail: str = "Validation failed"):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail
        )


class ExternalServiceError(HTTPException):
    def __init__(self, detail: str = "External service error"):
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY, detail=detail
        )


# ─── Response helpers ─────────────────────────────────────────────────────────
def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = 200,
    meta: Optional[Dict[str, Any]] = None,
) -> JSONResponse:
    """Standardised success envelope."""
    body: Dict[str, Any] = {"success": True, "message": message}
    if data is not None:
        body["data"] = data
    if meta:
        body["meta"] = meta
    return JSONResponse(content=body, status_code=status_code)


def error_response(
    message: str,
    status_code: int = 400,
    errors: Optional[Any] = None,
) -> JSONResponse:
    """Standardised error envelope."""
    body: Dict[str, Any] = {"success": False, "message": message}
    if errors is not None:
        body["errors"] = errors
    return JSONResponse(content=body, status_code=status_code)
