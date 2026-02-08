"""
Rate limiting middleware for Blinderfit Backend
"""

from fastapi import Request, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
import logging
from typing import Dict, Any
from datetime import datetime, timedelta
import asyncio
from collections import defaultdict

logger = logging.getLogger(__name__)

class RateLimitMiddleware:
    """Custom rate limiting middleware with different limits for different endpoints"""

    def __init__(self):
        # Rate limit storage (in production, use Redis)
        self.requests: Dict[str, list] = defaultdict(list)
        self.cleanup_task = None

    def __call__(self, request: Request):
        """Apply rate limiting based on endpoint and user"""
        return self._check_rate_limit(request)

    def _check_rate_limit(self, request: Request) -> None:
        """Check if request should be rate limited"""
        # Get client identifier (IP or user ID)
        client_id = self._get_client_id(request)

        # Define rate limits for different endpoints
        rate_limits = self._get_rate_limits(request.url.path)

        if not rate_limits:
            return  # No rate limiting for this endpoint

        # Clean old requests
        self._cleanup_old_requests(client_id)

        # Check rate limit
        current_requests = self.requests[client_id]
        now = datetime.utcnow()

        # Count requests in the time window
        time_window = timedelta(seconds=rate_limits["window_seconds"])
        recent_requests = [
            req_time for req_time in current_requests
            if now - req_time < time_window
        ]

        if len(recent_requests) >= rate_limits["max_requests"]:
            # Rate limit exceeded
            reset_time = min(recent_requests) + time_window
            reset_seconds = int((reset_time - now).total_seconds())

            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Rate limit exceeded",
                    "retry_after": reset_seconds,
                    "limit": rate_limits["max_requests"],
                    "window_seconds": rate_limits["window_seconds"]
                }
            )

        # Add current request
        current_requests.append(now)
        self.requests[client_id] = recent_requests + [now]

    def _get_client_id(self, request: Request) -> str:
        """Get client identifier for rate limiting"""
        # Try to get user ID from authenticated request
        if hasattr(request.state, 'user') and request.state.user:
            return f"user_{request.state.user['uid']}"

        # Fall back to IP address
        return f"ip_{request.client.host}"

    def _get_rate_limits(self, path: str) -> Dict[str, int]:
        """Get rate limits for different endpoints"""
        # Authentication endpoints - more lenient
        if path.startswith("/auth"):
            return {"max_requests": 10, "window_seconds": 60}  # 10 per minute

        # AI chat endpoints - moderate limiting
        elif path.startswith("/ai"):
            return {"max_requests": 50, "window_seconds": 60}  # 50 per minute

        # General API endpoints
        elif path.startswith(("/plans", "/tracking", "/dashboard", "/ml")):
            return {"max_requests": 100, "window_seconds": 60}  # 100 per minute

        # Notification endpoints
        elif path.startswith("/notifications"):
            return {"max_requests": 30, "window_seconds": 60}  # 30 per minute

        # Integration endpoints - stricter
        elif path.startswith("/integrations"):
            return {"max_requests": 20, "window_seconds": 60}  # 20 per minute

        # Health check - no limit
        elif path in ["/health", "/"]:
            return None

        # Default rate limit
        return {"max_requests": 60, "window_seconds": 60}  # 60 per minute

    def _cleanup_old_requests(self, client_id: str) -> None:
        """Clean up old requests to prevent memory leaks"""
        if client_id not in self.requests:
            return

        # Keep only requests from the last hour
        cutoff = datetime.utcnow() - timedelta(hours=1)
        self.requests[client_id] = [
            req_time for req_time in self.requests[client_id]
            if req_time > cutoff
        ]

        # Remove empty entries
        if not self.requests[client_id]:
            del self.requests[client_id]

    async def start_cleanup_task(self):
        """Start background cleanup task"""
        if self.cleanup_task is None:
            self.cleanup_task = asyncio.create_task(self._periodic_cleanup())

    async def stop_cleanup_task(self):
        """Stop background cleanup task"""
        if self.cleanup_task:
            self.cleanup_task.cancel()
            try:
                await self.cleanup_task
            except asyncio.CancelledError:
                pass

    async def _periodic_cleanup(self):
        """Periodic cleanup of old rate limit data"""
        while True:
            try:
                await asyncio.sleep(300)  # Clean up every 5 minutes

                now = datetime.utcnow()
                cutoff = now - timedelta(hours=1)

                # Clean up old entries
                to_remove = []
                for client_id, requests in self.requests.items():
                    self.requests[client_id] = [
                        req_time for req_time in requests
                        if req_time > cutoff
                    ]
                    if not self.requests[client_id]:
                        to_remove.append(client_id)

                for client_id in to_remove:
                    del self.requests[client_id]

                logger.info(f"Rate limit cleanup completed. Active clients: {len(self.requests)}")

            except Exception as e:
                logger.error(f"Error in rate limit cleanup: {e}")

# Global instance
rate_limit_middleware = RateLimitMiddleware()

# FastAPI compatible rate limiter using slowapi
limiter = Limiter(key_func=get_remote_address)

def create_rate_limit_middleware():
    """Create FastAPI compatible rate limiting middleware"""
    return SlowAPIMiddleware