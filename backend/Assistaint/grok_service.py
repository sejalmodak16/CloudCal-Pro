import os

from dotenv import load_dotenv
from openai import OpenAI

from backend.Assistaint.prompts import SYSTEM_PROMPT


load_dotenv()


GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")


if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is missing from the root .env file."
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

        user_prompt += """

IMPORTANT CALCULATION CONTEXT
-----------------------------

Expression:
{expression}

CloudCalc Result:
{result}

Use the supplied result as the authoritative result.
Explain it instead of replacing it.
""".format(
            expression=expression or "Not provided",
            result=result or "Not provided"
        )

    response = client.responses.create(
        model=GROQ_MODEL,
        instructions=SYSTEM_PROMPT,
        input=user_prompt
    )

    answer = response.output_text

    if not answer:
        raise RuntimeError(
            "Groq returned an empty response."
        )

    return answer.strip()