"""
AI Chat routes for FitMentor
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import StreamingResponse
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
import json
import uuid

from app.core.database import db_service
from app.models import (
    ChatRequest,
    ChatMessage,
    ChatSession,
    APIResponse
)
from app.routes.auth import get_current_user
from app.services.gemini_service import gemini_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/chat", response_model=APIResponse)
async def chat_with_fitmentor(
    request: ChatRequest,
    user_id: str = Depends(get_current_user)
):
    """Chat with FitMentor AI assistant"""
    try:
        user_context = await get_user_context(user_id)

        user_message = ChatMessage(
            role="user",
            content=request.message,
            timestamp=datetime.utcnow(),
            attachments=request.attachments or []
        )

        ai_response_content = await generate_ai_response(
            user_message.content, user_context, request.attachments
        )

        ai_message = ChatMessage(
            role="assistant",
            content=ai_response_content,
            timestamp=datetime.utcnow(),
            attachments=[]
        )

        session_id = str(uuid.uuid4())
        chat_data = {
            "user_id": user_id,
            "session_id": session_id,
            "messages": [user_message.dict(), ai_message.dict()],
            "context": user_context,
            "created_at": datetime.utcnow().isoformat(),
        }
        db_service.set_user_doc(user_id, "chats", session_id, chat_data)

        return APIResponse(
            success=True,
            message="Chat response generated successfully",
            data={
                "session_id": session_id,
                "response": ai_message.content,
                "timestamp": ai_message.timestamp.isoformat(),
                "suggestions": extract_suggestions(ai_response_content)
            }
        )
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Chat request failed")

@router.post("/chat/stream")
async def chat_with_fitmentor_stream(
    request: ChatRequest,
    user_id: str = Depends(get_current_user)
):
    """Streaming chat with FitMentor AI assistant"""
    try:
        user_context = await get_user_context(user_id)

        async def generate_stream():
            response_content = await generate_ai_response(
                request.message, user_context, request.attachments
            )
            words = response_content.split()
            for i, word in enumerate(words):
                chunk = {"token": word, "is_final": i == len(words) - 1, "timestamp": datetime.utcnow().isoformat()}
                yield f"data: {json.dumps(chunk)}\n\n"
                import asyncio
                await asyncio.sleep(0.05)

        return StreamingResponse(generate_stream(), media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"})
    except Exception as e:
        logger.error(f"Streaming chat error: {e}")
        raise HTTPException(status_code=500, detail="Streaming chat failed")

@router.post("/upload-attachment")
async def upload_chat_attachment(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    """Upload attachment for chat"""
    try:
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'audio/wav', 'audio/mpeg']
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        file_content = await file.read()
        attachment_id = str(uuid.uuid4())

        return APIResponse(
            success=True,
            message="Attachment uploaded successfully",
            data={
                "id": attachment_id,
                "filename": file.filename,
                "content_type": file.content_type,
                "size": len(file_content),
                "uploaded_at": datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        logger.error(f"Attachment upload error: {e}")
        raise HTTPException(status_code=500, detail="Attachment upload failed")

@router.get("/history", response_model=APIResponse)
async def get_chat_history(limit: int = 10, user_id: str = Depends(get_current_user)):
    """Get user's chat history"""
    try:
        chats = db_service.query_user_docs(user_id, "chats", order_by="created_at", order_dir="DESC", limit_count=limit)
        chat_history = [{
            "session_id": c.get("session_id", c.get("_id")),
            "messages": c.get("messages", []),
            "created_at": c.get("created_at"),
            "summary": c.get("summary")
        } for c in chats]

        return APIResponse(success=True, message="Chat history retrieved", data={"chats": chat_history, "total": len(chat_history)})
    except Exception as e:
        logger.error(f"Error getting chat history: {e}")
        raise HTTPException(status_code=500, detail="Failed to get chat history")

@router.get("/session/{session_id}", response_model=APIResponse)
async def get_chat_session(session_id: str, user_id: str = Depends(get_current_user)):
    """Get specific chat session"""
    try:
        chat_data = db_service.get_user_doc(user_id, "chats", session_id)
        if not chat_data:
            raise HTTPException(status_code=404, detail="Chat session not found")
        return APIResponse(success=True, message="Chat session retrieved", data=chat_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting chat session: {e}")
        raise HTTPException(status_code=500, detail="Failed to get chat session")

@router.delete("/session/{session_id}", response_model=APIResponse)
async def delete_chat_session(session_id: str, user_id: str = Depends(get_current_user)):
    """Delete a chat session"""
    try:
        db_service.delete_user_doc(user_id, "chats", session_id)
        return APIResponse(success=True, message="Chat session deleted")
    except Exception as e:
        logger.error(f"Error deleting chat session: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete chat session")

async def get_user_context(user_id: str) -> Dict[str, Any]:
    """Get user's context for personalized AI responses"""
    try:
        user_data = db_service.get_user(user_id) or {}
        tracking_data = db_service.query_user_docs(user_id, "tracking", order_by="date", order_dir="DESC", limit_count=7)
        plans = db_service.query_user_docs(user_id, "plans", filters={"is_active": True}, limit_count=1)
        plan_data = plans[0] if plans else None
        insights_data = db_service.query_user_docs(user_id, "ml_insights", order_by="generated_at", order_dir="DESC", limit_count=5)

        return {
            "user_profile": user_data,
            "recent_tracking": tracking_data,
            "current_plan": plan_data,
            "recent_insights": insights_data,
            "context_timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting user context: {e}")
        return {}

async def generate_ai_response(message: str, context: Dict[str, Any], attachments: Optional[List[Dict[str, Any]]] = None) -> str:
    """Generate AI response using Gemini"""
    try:
        system_prompt = f"""
        You are FitMentor, an expert AI health coach for Blinderfit. You provide personalized,
        evidence-based health and nutrition advice. Always prioritize user safety.

        User Context:
        - Age: {context.get('user_profile', {}).get('age', 'Unknown')}
        - Gender: {context.get('user_profile', {}).get('gender', 'Unknown')}
        - BMI: {context.get('user_profile', {}).get('bmi', 'Unknown')}
        - Activity Level: {context.get('user_profile', {}).get('activity_level', 'Unknown')}
        - Goals: {context.get('user_profile', {}).get('goals', {}).get('primary_goal', 'Unknown')}

        Recent Activity: {len(context.get('recent_tracking', []))} days tracked
        Active Plan: {'Yes' if context.get('current_plan') else 'No'}
        """

        attachment_context = ""
        if attachments:
            attachment_context = "\n\nAttachments:"
            for a in attachments:
                attachment_context += f"\n- {a.get('filename', 'Unknown')}"

        response = await gemini_service.generate_response(
            prompt=f"{message}{attachment_context}",
            system_prompt=system_prompt,
            context=context,
            temperature=0.7,
            max_tokens=1000
        )
        return response
    except Exception as e:
        logger.error(f"Error generating AI response: {e}")
        return "I apologize, but I'm experiencing technical difficulties. Please try again later."

def extract_suggestions(response: str) -> List[str]:
    """Extract actionable suggestions from AI response"""
    suggestions = []
    keywords = ["try", "consider", "recommend", "suggest", "increase", "decrease", "focus on", "aim for"]
    for sentence in response.split('.'):
        sentence = sentence.strip()
        if any(kw in sentence.lower() for kw in keywords) and 10 < len(sentence) < 100:
            suggestions.append(sentence)
    return suggestions[:3]