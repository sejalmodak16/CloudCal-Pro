
from pathlib import Path
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

from Assistaint.grok_service import ask_grok
from Assistaint.schemas import AIRequest, AIResponse


# ============================================================
# ENVIRONMENT
# ============================================================

ROOT_ENV = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ROOT_ENV, override=True)

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()
SUPABASE_SERVICE_ROLE_KEY = os.getenv(
    "SUPABASE_SERVICE_ROLE_KEY", ""
).strip()

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "SUPABASE_URL and SUPABASE_KEY must be set in the root .env file."
    )

if not SUPABASE_URL.startswith("https://"):
    raise RuntimeError("SUPABASE_URL must be an HTTPS URL.")


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="CloudCalc Pro API",
    description="CloudCalc Pro with Supabase and Groq AI",
    version="1.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5001",
        "http://localhost:5001",
        "null",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# SUPABASE HELPERS
# ============================================================

def get_auth_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def get_verified_user(authorization: str | None):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Please log in. A valid Bearer token is required.",
        )

    token = authorization[len("Bearer "):].strip()

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Login token is missing.",
        )

    try:
        auth_client = get_auth_client()
        response = auth_client.auth.get_user(jwt=token)
        user = response.user

        if user is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired login session.",
            )

        return str(user.id), token

    except HTTPException:
        raise
    except Exception as error:
        print("Supabase token verification failed:", repr(error))
        raise HTTPException(
            status_code=401,
            detail=(
                "Supabase rejected the login token. "
                "Log in again and verify the Supabase project configuration."
            ),
        )


def get_database_client(token: str) -> Client:
    # Prefer a server-only secret/service-role key for database access.
    # The authenticated user's identity must be verified first.
    if SUPABASE_SERVICE_ROLE_KEY:
        return create_client(
            SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY,
        )

    # Without a server key, forward the user's token so RLS applies.
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    client.postgrest.auth(token)
    return client


# ============================================================
# ROOT AND HEALTH
# ============================================================

@app.get("/")
def root():
    return {
        "success": True,
        "application": "CloudCalc Pro",
        "status": "running",
    }


@app.get("/api/health")
def health():
    return {
        "success": True,
        "status": "healthy",
        "ai": "Groq AI",
        "model": "openai/gpt-oss-20b",
    }


# ============================================================
# AI ASSISTANT
# ============================================================

@app.post("/api/ai/ask", response_model=AIResponse)
def ask_ai(request: AIRequest):
    try:
        answer = ask_grok(
            question=request.question,
            expression=request.expression,
            result=request.result,
        )

        return AIResponse(
            success=True,
            question=request.question,
            answer=answer,
            model="openai/gpt-oss-20b",
        )

    except Exception as error:
        print("AI assistant error:", repr(error))
        raise HTTPException(
            status_code=500,
            detail="The AI assistant could not process the request.",
        )


@app.post("/api/ai/explain")
def explain_calculation(expression: str, result: str):
    try:
        question = """
Explain this calculation in simple steps.
Include its meaning, formula, calculation steps,
why the result is correct, and one practical example.
Do not change the supplied result.
"""

        answer = ask_grok(
            question=question,
            expression=expression,
            result=result,
        )

        return {
            "success": True,
            "expression": expression,
            "result": result,
            "explanation": answer,
            "model": "openai/gpt-oss-20b",
        }

    except Exception as error:
        print("AI explanation error:", repr(error))
        raise HTTPException(
            status_code=500,
            detail="The calculation explanation could not be generated.",
        )


# ============================================================
# SAVE HISTORY
# ============================================================

@app.post("/api/history")
def save_history(
    data: dict,
    authorization: str | None = Header(default=None),
):
    user_id, token = get_verified_user(authorization)

    expression = data.get("expression")
    result = data.get("result")
    operation = data.get("operation") or "calculation"

    if expression is None or not str(expression).strip():
        raise HTTPException(
            status_code=400,
            detail="expression is required.",
        )

    if result is None:
        raise HTTPException(
            status_code=400,
            detail="result is required.",
        )

    try:
        client = get_database_client(token)

        response = (
            client.table("history")
            .insert({
                "user_id": user_id,
                "expression": str(expression),
                "result": str(result),
                "operation": str(operation),
            })
            .execute()
        )

        return {
            "success": True,
            "message": "Calculation saved successfully.",
            "data": response.data or [],
        }

    except Exception as error:
        print("History save failed:", repr(error))
        raise HTTPException(
            status_code=500,
            detail=(
                "Could not save history. Check the history table, "
                "database permissions, and Supabase configuration."
            ),
        )


# ============================================================
# GET HISTORY
# ============================================================

@app.get("/api/history")
def get_history(
    user_id: str,
    authorization: str | None = Header(default=None),
):
    authenticated_id, token = get_verified_user(authorization)

    if user_id != authenticated_id:
        raise HTTPException(
            status_code=403,
            detail="You cannot access another user's history.",
        )

    try:
        client = get_database_client(token)

        response = (
            client.table("history")
            .select(
                "id,user_id,expression,result,operation,created_at"
            )
            .eq("user_id", authenticated_id)
            .order("created_at", desc=True)
            .limit(100)
            .execute()
        )

        return {
            "success": True,
            "history": response.data or [],
        }

    except Exception as error:
        print("History retrieval failed:", repr(error))
        raise HTTPException(
            status_code=500,
            detail="Could not retrieve calculation history.",
        )


# ============================================================
# DELETE HISTORY
# ============================================================

@app.delete("/api/history/{history_id}")
def delete_history(
    history_id: int,
    authorization: str | None = Header(default=None),
):
    authenticated_id, token = get_verified_user(authorization)

    try:
        client = get_database_client(token)

        response = (
            client.table("history")
            .delete()
            .eq("id", history_id)
            .eq("user_id", authenticated_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="History record not found.",
            )

        return {
            "success": True,
            "message": "History record deleted successfully.",
            "data": response.data,
        }

    except HTTPException:
        raise
    except Exception as error:
        print("History deletion failed:", repr(error))
        raise HTTPException(
            status_code=500,
            detail="Could not delete the history record.",
        )
