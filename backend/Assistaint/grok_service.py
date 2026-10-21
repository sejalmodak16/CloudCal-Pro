
import os
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

from Assistaint.prompts import SYSTEM_PROMPT

# Load the .env file from the CloudCalc-Pro root folder
ROOT_ENV = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ROOT_ENV)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

if not GROQ_API_KEY:
    raise RuntimeError(
        f"GROQ_API_KEY is missing. Checked: {ROOT_ENV}"
    )

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)


def ask_grok(
    question: str,
    expression: str | None = None,
    result: str | None = None
) -> str:

    if not question or not question.strip():
        raise ValueError("Question cannot be empty.")

    user_prompt = question.strip()

    if expression or result:
        user_prompt += f"""

IMPORTANT CALCULATION CONTEXT
-----------------------------
Expression:
{expression or "Not provided"}

CloudCalc Result:
{result or "Not provided"}

Use the supplied result as the authoritative result.
Explain it instead of replacing it.
"""

    response = client.responses.create(
        model=GROQ_MODEL,
        instructions=SYSTEM_PROMPT,
        input=user_prompt
    )

    answer = response.output_text

    if not answer:
        raise RuntimeError("Groq returned an empty response.")

    return answer.strip()
