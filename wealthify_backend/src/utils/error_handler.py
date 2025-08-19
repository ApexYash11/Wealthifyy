from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from typing import Union, Dict, Any
from src.utils.logger import log_error

class APIError(Exception):
    """Base API Error class"""
    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: Dict[str, Any] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)

async def error_handler(
    request: Request,
    exc: Union[HTTPException, APIError, Exception]
) -> JSONResponse:
    """
    Global error handler middleware
    """
    if isinstance(exc, HTTPException):
        # Handle FastAPI HTTP exceptions
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.detail,
                "status_code": exc.status_code
            }
        )
    
    if isinstance(exc, APIError):
        # Handle our custom API errors
        log_error(exc, {"path": request.url.path, "details": exc.details})
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.message,
                "details": exc.details,
                "status_code": exc.status_code
            }
        )
    
    # Handle unexpected errors
    log_error(exc, {"path": request.url.path})
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500
        }
    )
