from fastapi import APIRouter
from app import schemas
from app.services.ai_service import AIService

router = APIRouter()
ai_service = AIService()

@router.post("/autocomplete", response_model=schemas.AutocompleteResponse)
async def get_autocomplete(request: schemas.AutocompleteRequest):
    """
    Get AI autocomplete suggestions
    Mocked implementation with smart context-aware suggestions
    """
    suggestion = ai_service.get_suggestion(
        request.code,
        request.cursor_position,
        request.language
    )
    
    return schemas.AutocompleteResponse(
        suggestion=suggestion["text"],
        confidence=suggestion["confidence"],
        context=suggestion.get("context")
    )