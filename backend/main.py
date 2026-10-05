from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
import os

from backend.Assistaint.grok_service import ask_grok
from backend.Assistaint.schemas import AIRequest, AIResponse


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL is missing from .env")

if not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_KEY is missing from .env")


# ============================================================
# SUPABASE CLIENT
# ============================================================

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="CloudCalc Pro API",
    description="CloudCalc Pro with Groq AI Assistant and Supabase",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "success": True,
        "application": "CloudCalc Pro",
        "service": "CloudCalc Pro API",
        "status": "running"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health():
    return {
        "success": True,
        "status": "healthy",
        "ai": "Groq AI",
        "model": "openai/gpt-oss-20b"
    }


# ============================================================
# AI ASK
# ============================================================

@app.post("/api/ai/ask", response_model=AIResponse)
def ask_ai(request: AIRequest):
    try:
        answer = ask_grok(
            question=request.question,
            expression=request.expression,
            result=request.result
        )

        return AIResponse(
            success=True,
            question=request.question,
            answer=answer,
            model="openai/gpt-oss-20b"
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"AI Assistant error: {str(error)}"
        )


# ============================================================
# AI EXPLANATION
# ============================================================

@app.post("/api/ai/explain")
def explain_calculation(
    expression: str,
    result: str
):
    try:
        question = """
Explain the following CloudCalc Pro calculation
in a simple step-by-step way.

Include:

1. What the expression means
2. The formula
3. Step-by-step explanation
4. Why the result is correct
5. One practical example

Do not change the supplied result.
"""

        answer = ask_grok(
            question=question,
            expression=expression,
            result=result
        )

        return {
            "success": True,
            "expression": expression,
            "result": result,
            "explanation": answer,
            "model": "openai/gpt-oss-20b"
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"AI explanation error: {str(error)}"
        )


# ============================================================
# SAVE CALCULATION HISTORY
# ============================================================

@app.post("/api/history")
def save_history(
    data: dict,
    authorization: str | None = Header(default=None)
):
    try:
        # ----------------------------------------------------
        # Validate Authorization Header
        # ----------------------------------------------------

        if not authorization:
            raise HTTPException(
                status_code=401,
                detail="Authorization token is required."
            )

        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=401,
                detail="Invalid authorization format."
            )

        access_token = authorization.replace(
            "Bearer ",
            "",
            1
        ).strip()

        if not access_token:
            raise HTTPException(
                status_code=401,
                detail="Invalid access token."
            )

        # ----------------------------------------------------
        # Get Calculation Data
        # ----------------------------------------------------

        user_id = data.get("user_id")
        expression = data.get("expression")
        result = data.get("result")
        operation = data.get("operation")

        if not user_id:
            raise HTTPException(
                status_code=400,
                detail="user_id is required."
            )

        if expression is None:
            raise HTTPException(
                status_code=400,
                detail="expression is required."
            )

        if result is None:
            raise HTTPException(
                status_code=400,
                detail="result is required."
            )

        # ----------------------------------------------------
        # Create User Supabase Client
        # ----------------------------------------------------

        user_supabase = create_client(
            SUPABASE_URL,
            SUPABASE_KEY
        )

        # Apply logged-in user's access token.
        # This allows Supabase RLS policies to apply.
        user_supabase.postgrest.auth(access_token)

        # ----------------------------------------------------
        # Insert History Record
        # ----------------------------------------------------

        response = (
            user_supabase
            .table("history")
            .insert({
                "user_id": user_id,
                "expression": expression,
                "result": str(result),
                "operation": operation
            })
            .execute()
        )

        return {
            "success": True,
            "message": "Calculation saved successfully.",
            "data": response.data or []
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"History save error: {str(error)}"
        )


# ============================================================
# GET CALCULATION HISTORY
# ============================================================

@app.get("/api/history")
def get_history(
    user_id: str,
    authorization: str | None = Header(default=None)
):
    try:
        # ----------------------------------------------------
        # Validate Authorization Header
        # ----------------------------------------------------

        if not authorization:
            raise HTTPException(
                status_code=401,
                detail="Authorization token is required."
            )

        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=401,
                detail="Invalid authorization format."
            )

        access_token = authorization.replace(
            "Bearer ",
            "",
            1
        ).strip()

        if not access_token:
            raise HTTPException(
                status_code=401,
                detail="Invalid access token."
            )

        # ----------------------------------------------------
        # Create User Supabase Client
        # ----------------------------------------------------

        user_supabase = create_client(
            SUPABASE_URL,
            SUPABASE_KEY
        )

        # Apply logged-in user's access token.
        user_supabase.postgrest.auth(access_token)

        # ----------------------------------------------------
        # Get History
        # ----------------------------------------------------

        response = (
            user_supabase
            .table("history")
            .select(
                "id,user_id,expression,result,operation,created_at"
            )
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(100)
            .execute()
        )

        return {
            "success": True,
            "history": response.data or []
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"History API error: {str(error)}"
        )


# ============================================================
# DELETE HISTORY RECORD
# ============================================================

@app.delete("/api/history/{history_id}")
def delete_history(
    history_id: int,
    authorization: str | None = Header(default=None)
):
    try:
        # ----------------------------------------------------
        # Validate Authorization Header
        # ----------------------------------------------------

        if not authorization:
            raise HTTPException(
                status_code=401,
                detail="Authorization token is required."
            )

        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=401,
                detail="Invalid authorization format."
            )

        access_token = authorization.replace(
            "Bearer ",
            "",
            1
        ).strip()

        if not access_token:
            raise HTTPException(
                status_code=401,
                detail="Invalid access token."
            )

        # ----------------------------------------------------
        # Create User Supabase Client
        # ----------------------------------------------------

        user_supabase = create_client(
            SUPABASE_URL,
            SUPABASE_KEY
        )

        # Apply logged-in user's access token.
        user_supabase.postgrest.auth(access_token)

        # ----------------------------------------------------
        # Delete History Record
        # ----------------------------------------------------

        response = (
            user_supabase
            .table("history")
            .delete()
            .eq("id", history_id)
            .execute()
        )

        return {
            "success": True,
            "message": "History record deleted successfully.",
            "data": response.data or []
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"History delete error: {str(error)}"
        )