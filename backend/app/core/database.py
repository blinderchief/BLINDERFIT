"""
PostgreSQL (Neon) database initialization and service layer
Replaces Firebase Firestore with PostgreSQL + SQLAlchemy
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
import uuid

from sqlalchemy import create_engine, text, Column, String, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from app.core.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()
engine = None
SessionLocal = None


# ──────────────────────────────────────────────
# SQLAlchemy ORM Models
# ──────────────────────────────────────────────

class UserRow(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    email = Column(String, nullable=True)
    display_name = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    data = Column(JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class UserDocument(Base):
    __tablename__ = "user_documents"
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    collection_name = Column(String, nullable=False, index=True)
    doc_id = Column(String, nullable=False, index=True)
    data = Column(JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class GlobalDocument(Base):
    __tablename__ = "global_documents"
    id = Column(String, primary_key=True)
    collection_name = Column(String, nullable=False, index=True)
    doc_id = Column(String, nullable=False, index=True)
    data = Column(JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ──────────────────────────────────────────────
# Database initialization
# ──────────────────────────────────────────────

async def init_database():
    """Initialize PostgreSQL connection and create tables"""
    global engine, SessionLocal
    try:
        engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=300,
            pool_size=10,
            max_overflow=20,
        )
        SessionLocal = sessionmaker(bind=engine)
        Base.metadata.create_all(bind=engine)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("PostgreSQL (Neon) database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


def get_db() -> Session:
    """Get a database session"""
    return SessionLocal()


# ──────────────────────────────────────────────
# Database Service
# ──────────────────────────────────────────────

class DatabaseService:
    """Provides Firestore-compatible CRUD on PostgreSQL"""

    # ── User CRUD ──

    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        db = get_db()
        try:
            row = db.query(UserRow).filter(UserRow.id == user_id).first()
            if not row:
                return None
            result = dict(row.data or {})
            result.update({
                "uid": row.id,
                "email": row.email,
                "display_name": row.display_name,
                "photo_url": row.photo_url,
                "phone_number": row.phone_number,
                "created_at": row.created_at.isoformat() if row.created_at else None,
                "updated_at": row.updated_at.isoformat() if row.updated_at else None,
            })
            return result
        finally:
            db.close()

    def set_user(self, user_id: str, data: Dict[str, Any]) -> None:
        db = get_db()
        try:
            existing = db.query(UserRow).filter(UserRow.id == user_id).first()
            now = datetime.utcnow()
            if existing:
                existing.email = data.get("email", existing.email)
                existing.display_name = data.get("display_name", existing.display_name)
                existing.photo_url = data.get("photo_url", existing.photo_url)
                existing.phone_number = data.get("phone_number", existing.phone_number)
                existing.data = data
                existing.updated_at = now
            else:
                row = UserRow(
                    id=user_id,
                    email=data.get("email"),
                    display_name=data.get("display_name"),
                    photo_url=data.get("photo_url"),
                    phone_number=data.get("phone_number"),
                    data=data,
                    created_at=now,
                    updated_at=now,
                )
                db.add(row)
            db.commit()
        finally:
            db.close()

    def update_user(self, user_id: str, updates: Dict[str, Any]) -> None:
        db = get_db()
        try:
            row = db.query(UserRow).filter(UserRow.id == user_id).first()
            if not row:
                self.set_user(user_id, updates)
                return
            existing_data = dict(row.data or {})
            existing_data.update(updates)
            row.data = existing_data
            if "email" in updates:
                row.email = updates["email"]
            if "display_name" in updates:
                row.display_name = updates["display_name"]
            if "photo_url" in updates:
                row.photo_url = updates["photo_url"]
            if "phone_number" in updates:
                row.phone_number = updates["phone_number"]
            row.updated_at = datetime.utcnow()
            db.commit()
        finally:
            db.close()

    def delete_user(self, user_id: str) -> None:
        db = get_db()
        try:
            db.query(UserDocument).filter(UserDocument.user_id == user_id).delete()
            db.query(UserRow).filter(UserRow.id == user_id).delete()
            db.commit()
        finally:
            db.close()

    # ── User Subcollection CRUD ──

    def get_user_doc(self, user_id: str, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        db = get_db()
        try:
            row = (
                db.query(UserDocument)
                .filter(
                    UserDocument.user_id == user_id,
                    UserDocument.collection_name == collection,
                    UserDocument.doc_id == doc_id,
                )
                .first()
            )
            if not row:
                return None
            result = dict(row.data or {})
            result["_id"] = row.doc_id
            return result
        finally:
            db.close()

    def set_user_doc(self, user_id: str, collection: str, doc_id: str, data: Dict[str, Any]) -> str:
        db = get_db()
        try:
            row_id = f"{user_id}:{collection}:{doc_id}"
            existing = (
                db.query(UserDocument)
                .filter(
                    UserDocument.user_id == user_id,
                    UserDocument.collection_name == collection,
                    UserDocument.doc_id == doc_id,
                )
                .first()
            )
            now = datetime.utcnow()
            if existing:
                existing.data = data
                existing.updated_at = now
            else:
                row = UserDocument(
                    id=row_id,
                    user_id=user_id,
                    collection_name=collection,
                    doc_id=doc_id,
                    data=data,
                    created_at=now,
                    updated_at=now,
                )
                db.add(row)
            db.commit()
            return doc_id
        finally:
            db.close()

    def update_user_doc(self, user_id: str, collection: str, doc_id: str, updates: Dict[str, Any]) -> None:
        db = get_db()
        try:
            existing = (
                db.query(UserDocument)
                .filter(
                    UserDocument.user_id == user_id,
                    UserDocument.collection_name == collection,
                    UserDocument.doc_id == doc_id,
                )
                .first()
            )
            if existing:
                data = dict(existing.data or {})
                data.update(updates)
                existing.data = data
                existing.updated_at = datetime.utcnow()
                db.commit()
            else:
                self.set_user_doc(user_id, collection, doc_id, updates)
        finally:
            db.close()

    def delete_user_doc(self, user_id: str, collection: str, doc_id: str) -> None:
        db = get_db()
        try:
            db.query(UserDocument).filter(
                UserDocument.user_id == user_id,
                UserDocument.collection_name == collection,
                UserDocument.doc_id == doc_id,
            ).delete()
            db.commit()
        finally:
            db.close()

    def query_user_docs(
        self,
        user_id: str,
        collection: str,
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None,
        order_dir: str = "DESC",
        limit_count: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        db = get_db()
        try:
            q = db.query(UserDocument).filter(
                UserDocument.user_id == user_id,
                UserDocument.collection_name == collection,
            )
            if filters:
                for key, value in filters.items():
                    if isinstance(value, bool):
                        q = q.filter(UserDocument.data[key].astext == str(value).lower())
                    else:
                        q = q.filter(UserDocument.data[key].astext == str(value))
            if order_by:
                if order_dir.upper() == "ASC":
                    q = q.order_by(UserDocument.data[order_by].asc())
                else:
                    q = q.order_by(UserDocument.data[order_by].desc())
            else:
                q = q.order_by(UserDocument.created_at.desc())
            if limit_count:
                q = q.limit(limit_count)
            rows = q.all()
            results = []
            for row in rows:
                data = dict(row.data or {})
                data["_id"] = row.doc_id
                results.append(data)
            return results
        finally:
            db.close()

    def add_user_doc(self, user_id: str, collection: str, data: Dict[str, Any]) -> str:
        doc_id = str(uuid.uuid4())
        self.set_user_doc(user_id, collection, doc_id, data)
        return doc_id

    # ── Global Collection CRUD ──

    def get_global_doc(self, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        db = get_db()
        try:
            row = (
                db.query(GlobalDocument)
                .filter(GlobalDocument.collection_name == collection, GlobalDocument.doc_id == doc_id)
                .first()
            )
            if not row:
                return None
            return dict(row.data or {})
        finally:
            db.close()

    def set_global_doc(self, collection: str, doc_id: str, data: Dict[str, Any]) -> str:
        db = get_db()
        try:
            row_id = f"{collection}:{doc_id}"
            existing = (
                db.query(GlobalDocument)
                .filter(GlobalDocument.collection_name == collection, GlobalDocument.doc_id == doc_id)
                .first()
            )
            now = datetime.utcnow()
            if existing:
                existing.data = data
                existing.updated_at = now
            else:
                row = GlobalDocument(
                    id=row_id,
                    collection_name=collection,
                    doc_id=doc_id,
                    data=data,
                    created_at=now,
                    updated_at=now,
                )
                db.add(row)
            db.commit()
            return doc_id
        finally:
            db.close()

    def add_global_doc(self, collection: str, data: Dict[str, Any]) -> str:
        doc_id = str(uuid.uuid4())
        self.set_global_doc(collection, doc_id, data)
        return doc_id


# Global singleton
db_service = DatabaseService()