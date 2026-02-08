"""
Security headers middleware for Blinderfit Backend
"""

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import logging
from typing import List

logger = logging.getLogger(__name__)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware to add security headers to all responses"""

    def __init__(self, app, allowed_origins: List[str] = None):
        super().__init__(app)
        self.allowed_origins = allowed_origins or ["*"]

    async def dispatch(self, request: Request, call_next):
        """Add security headers to response"""
        response = await call_next(request)

        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https: blob:; "
            "connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://generativelanguage.googleapis.com; "
            "frame-ancestors 'none';"
        )
        response.headers["Content-Security-Policy"] = csp

        # HSTS (HTTP Strict Transport Security)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        # Remove server header for security
        response.headers.pop("server", None)

        # Add custom headers
        response.headers["X-API-Version"] = "1.0.0"
        response.headers["X-Request-ID"] = request.headers.get("X-Request-ID", "unknown")

        return response

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging requests and responses"""

    async def dispatch(self, request: Request, call_next):
        """Log request and response details"""
        start_time = __import__("time").time()

        # Log request
        logger.info(
            f"Request: {request.method} {request.url.path} "
            f"from {request.client.host if request.client else 'unknown'}"
        )

        try:
            response = await call_next(request)

            # Calculate processing time
            process_time = __import__("time").time() - start_time

            # Log response
            logger.info(
                f"Response: {response.status_code} "
                f"Time: {process_time:.3f}s "
                f"Size: {response.headers.get('content-length', 'unknown')}"
            )

            # Log potential security issues
            if response.status_code >= 400:
                logger.warning(
                    f"Error response: {response.status_code} for {request.method} {request.url.path}"
                )

            return response

        except Exception as e:
            # Log exceptions
            logger.error(
                f"Exception in request {request.method} {request.url.path}: {str(e)}",
                exc_info=True
            )
            raise

class IPFilterMiddleware(BaseHTTPMiddleware):
    """Middleware for IP address filtering"""

    def __init__(self, app, allowed_ips: List[str] = None, blocked_ips: List[str] = None):
        super().__init__(app)
        self.allowed_ips = set(allowed_ips or [])
        self.blocked_ips = set(blocked_ips or [])

    async def dispatch(self, request: Request, call_next):
        """Filter requests based on IP address"""
        client_ip = request.client.host if request.client else None

        if not client_ip:
            logger.warning("Request without client IP detected")
            return await call_next(request)

        # Check blocked IPs
        if client_ip in self.blocked_ips:
            logger.warning(f"Blocked IP attempted access: {client_ip}")
            from fastapi import HTTPException
            raise HTTPException(status_code=403, detail="Access denied")

        # Check allowed IPs (if whitelist is enabled)
        if self.allowed_ips and client_ip not in self.allowed_ips:
            logger.warning(f"IP not in whitelist: {client_ip}")
            from fastapi import HTTPException
            raise HTTPException(status_code=403, detail="Access denied")

        return await call_next(request)

# Global instances
security_headers_middleware = SecurityHeadersMiddleware
request_logging_middleware = RequestLoggingMiddleware
ip_filter_middleware = IPFilterMiddleware