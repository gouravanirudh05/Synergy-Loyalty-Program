from starlette_session import SessionMiddleware
from starlette_session.backends import BackendType
import redis
from config import SESSION_SECRET_KEY, REDIS_URL

def setup_sessions(app):
    """Attach session middleware (Redis or in-memory)."""
    if not SESSION_SECRET_KEY:
        raise ValueError("SESSION_SECRET_KEY not set!")

    if REDIS_URL:
        redis_client = redis.from_url(REDIS_URL)
        app.add_middleware(
            SessionMiddleware,
            cookie_name="session_id",
            secret_key=SESSION_SECRET_KEY,
            backend_type=BackendType.redis,
            backend_client=redis_client,
            https_only=True,
            same_site="lax",
        )
        print("✅ Redis session enabled")
    else:
        app.add_middleware(
            SessionMiddleware,
            cookie_name="session_id",
            secret_key=SESSION_SECRET_KEY
        )
        print("✅ In-memory session enabled")
