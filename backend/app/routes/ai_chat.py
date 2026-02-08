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

from app.core.database import get_firestore_client
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
        db = get_firestore_client()

        # Get user context
        user_context = await get_user_context(user_id)

        # Create chat message
        user_message = ChatMessage(
            role="user",
            content=request.message,
            timestamp=datetime.utcnow(),
            attachments=request.attachments or []
        )

        # Generate AI response
        ai_response_content = await generate_ai_response(
            user_message.content,
            user_context,
            request.attachments
        )

        ai_message = ChatMessage(
            role="assistant",
            content=ai_response_content,
            timestamp=datetime.utcnow(),
            attachments=[]
        )

        # Save conversation to Firestore
        session_id = str(uuid.uuid4())
        chat_session = ChatSession(
            user_id=user_id,
            session_id=session_id,
            messages=[user_message, ai_message],
            context=user_context,
            summary=None,
            ended_at=None
        )

        # Save to user's chat history
        db.collection('users').document(user_id).collection('chats').document(session_id).set(chat_session.dict())

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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Chat request failed"
        )

@router.post("/chat/stream")
async def chat_with_fitmentor_stream(
    request: ChatRequest,
    user_id: str = Depends(get_current_user)
):
    """Streaming chat with FitMentor AI assistant"""
    try:
        user_context = await get_user_context(user_id)

        async def generate_stream():
            # Simulate streaming response (in production, use Gemini's streaming API)
            response_content = await generate_ai_response(
                request.message,
                user_context,
                request.attachments
            )

            # Split response into chunks for streaming effect
            words = response_content.split()
            for i, word in enumerate(words):
                chunk = {
                    "token": word,
                    "is_final": i == len(words) - 1,
                    "timestamp": datetime.utcnow().isoformat()
                }
                yield f"data: {json.dumps(chunk)}\n\n"

                # Small delay to simulate real streaming
                import asyncio
                await asyncio.sleep(0.05)

        return StreamingResponse(
            generate_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )

    except Exception as e:
        logger.error(f"Streaming chat error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Streaming chat failed"
        )

@router.post("/upload-attachment")
async def upload_chat_attachment(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    """Upload attachment for chat (image, document, etc.)"""
    try:
        # Validate file type
        allowed_types = [
            'image/jpeg', 'image/png', 'image/gif',
            'application/pdf',
            'audio/wav', 'audio/mpeg'
        ]

        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file type"
            )

        # Read file content
        file_content = await file.read()

        # In production, you'd upload to cloud storage (Firebase Storage, AWS S3, etc.)
        # For now, we'll just return a mock URL
        attachment_id = str(uuid.uuid4())
        mock_url = f"https://storage.blinderfit.com/attachments/{attachment_id}/{file.filename}"

        attachment_data = {
            "id": attachment_id,
            "filename": file.filename,
            "content_type": file.content_type,
            "size": len(file_content),
            "url": mock_url,
            "uploaded_at": datetime.utcnow().isoformat()
        }

        return APIResponse(
            success=True,
            message="Attachment uploaded successfully",
            data=attachment_data
        )

    except Exception as e:
        logger.error(f"Attachment upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Attachment upload failed"
        )

@router.get("/history", response_model=APIResponse)
async def get_chat_history(
    limit: int = 10,
    user_id: str = Depends(get_current_user)
):
    """Get user's chat history"""
    try:
        db = get_firestore_client()

        # Get recent chat sessions
        chats_ref = db.collection('users').document(user_id).collection('chats')
        chats = chats_ref.order_by('created_at', direction='DESCENDING').limit(limit).get()

        chat_history = []
        for chat in chats:
            chat_data = chat.to_dict()
            chat_history.append({
                "session_id": chat.id,
                "messages": chat_data.get('messages', []),
                "created_at": chat_data.get('created_at'),
                "summary": chat_data.get('summary')
            })

        return APIResponse(
            success=True,
            message="Chat history retrieved successfully",
            data={
                "chats": chat_history,
                "total": len(chat_history)
            }
        )

    except Exception as e:
        logger.error(f"Error getting chat history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get chat history"
        )

@router.get("/session/{session_id}", response_model=APIResponse)
async def get_chat_session(
    session_id: str,
    user_id: str = Depends(get_current_user)
):
    """Get specific chat session"""
    try:
        db = get_firestore_client()

        chat_doc = db.collection('users').document(user_id).collection('chats').document(session_id).get()

        if not chat_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )

        chat_data = chat_doc.to_dict()

        return APIResponse(
            success=True,
            message="Chat session retrieved successfully",
            data=chat_data
        )

    except Exception as e:
        logger.error(f"Error getting chat session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get chat session"
        )

@router.delete("/session/{session_id}", response_model=APIResponse)
async def delete_chat_session(
    session_id: str,
    user_id: str = Depends(get_current_user)
):
    """Delete a chat session"""
    try:
        db = get_firestore_client()

        chat_ref = db.collection('users').document(user_id).collection('chats').document(session_id)
        chat_ref.delete()

        return APIResponse(
            success=True,
            message="Chat session deleted successfully"
        )

    except Exception as e:
        logger.error(f"Error deleting chat session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete chat session"
        )

async def get_user_context(user_id: str) -> Dict[str, Any]:
    """Get user's context for personalized AI responses"""
    try:
        db = get_firestore_client()

        # Get user profile
        user_doc = db.collection('users').document(user_id).get()
        user_data = user_doc.to_dict() if user_doc.exists else {}

        # Get recent tracking data
        tracking_ref = db.collection('users').document(user_id).collection('tracking')
        recent_tracking = tracking_ref.order_by('date', direction='DESCENDING').limit(7).get()

        tracking_data = []
        for track in recent_tracking:
            tracking_data.append(track.to_dict())

        # Get current plan
        plan_ref = db.collection('users').document(user_id).collection('plans')
        current_plan = plan_ref.where('is_active', '==', True).limit(1).get()

        plan_data = None
        if current_plan:
            plan_data = current_plan[0].to_dict()

        # Get recent ML insights
        insights_ref = db.collection('users').document(user_id).collection('ml_insights')
        recent_insights = insights_ref.order_by('generated_at', direction='DESCENDING').limit(5).get()

        insights_data = []
        for insight in recent_insights:
            insights_data.append(insight.to_dict())

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

async def generate_ai_response(
    message: str,
    context: Dict[str, Any],
    attachments: Optional[List[Dict[str, Any]]] = None
) -> str:
    """Generate AI response using Gemini"""
    try:
        # Build system prompt with user context
        system_prompt = f"""
        You are FitMentor, an expert AI health coach for Blinderfit. You provide personalized,
        evidence-based health and nutrition advice. Always prioritize user safety and recommend
        consulting healthcare professionals for medical concerns.

        User Context:
        - Age: {context.get('user_profile', {}).get('age', 'Unknown')}
        - Gender: {context.get('user_profile', {}).get('gender', 'Unknown')}
        - BMI: {context.get('user_profile', {}).get('bmi', 'Unknown')}
        - Activity Level: {context.get('user_profile', {}).get('activity_level', 'Unknown')}
        - Current Goals: {context.get('user_profile', {}).get('goals', {}).get('primary_goal', 'Unknown')}

        Recent Activity: {len(context.get('recent_tracking', []))} days tracked
        Active Plan: {'Yes' if context.get('current_plan') else 'No'}

        Respond helpfully, encouragingly, and professionally. Include specific, actionable advice.
        """

        # Handle attachments if present
        attachment_context = ""
        if attachments:
            attachment_context = "\n\nAttachments provided:"
            for attachment in attachments:
                attachment_context += f"\n- {attachment.get('filename', 'Unknown')}: {attachment.get('content_type', 'Unknown')}"

        full_message = f"{message}{attachment_context}"

        # Generate response using Gemini
        response = await gemini_service.generate_response(
            prompt=full_message,
            system_prompt=system_prompt,
            context=context,
            temperature=0.7,
            max_tokens=1000
        )

        return response

    except Exception as e:
        logger.error(f"Error generating AI response: {e}")
        return "I apologize, but I'm experiencing technical difficulties. Please try again later, or contact support if the issue persists."

def extract_suggestions(response: str) -> List[str]:
    """Extract actionable suggestions from AI response"""
    # Simple extraction - in production, use more sophisticated NLP
    suggestions = []

    # Look for common suggestion patterns
    suggestion_keywords = [
        "try", "consider", "recommend", "suggest",
        "increase", "decrease", "add", "remove",
        "focus on", "aim for", "track", "monitor"
    ]

    sentences = response.split('.')
    for sentence in sentences:
        sentence = sentence.strip()
        if any(keyword in sentence.lower() for keyword in suggestion_keywords):
            if len(sentence) > 10 and len(sentence) < 100:
                suggestions.append(sentence)

    return suggestions[:3]  # Return up to 3 suggestions