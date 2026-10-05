const AI_API_URL = "http://127.0.0.1:5000/api/ai/ask";

async function askCloudCalcAI(question, expression = null, result = null) {
    const response = await fetch(AI_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            question,
            expression,
            result
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "AI request failed");
    }

    return data;
}