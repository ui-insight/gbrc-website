"""AI-guided intake conversation logic using MindRouter."""

import json
import logging
from collections.abc import AsyncIterator

from app.services.mindrouter import MindRouterClient, get_mindrouter_client

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """\
You are the GBRC Project Intake Assistant for the University of Idaho's Genomics \
and Bioinformatics Resources Core (GBRC). Your role is to help researchers plan \
their genomics and bioinformatics projects by guiding them through the intake process.

## GBRC Services
- **PacBio Sequencing**: Long-read sequencing for genome assembly, structural variants, \
and full-length transcripts (HiFi, Kinnex, Iso-Seq).
- **Illumina Sequencing**: Short-read sequencing for WGS, WES, RNA-seq, amplicon, \
and targeted panels.
- **RNA-seq Analysis**: Differential expression, pathway analysis, transcriptome assembly.
- **Bioinformatics Consulting**: Custom pipelines, data interpretation, visualization, \
and statistical analysis.
- **Sample Preparation**: Library prep, nucleic acid extraction, QC (Qubit, Bioanalyzer, \
TapeStation).

## Your Task
Guide the user conversationally to fill out their project intake form. Ask about:
1. Who they are (name, email, department)
2. Their project (title, description, goals)
3. Their samples (type, organism, count, extraction method, quality)
4. Which GBRC services they need
5. Timeline and budget considerations
6. Any methods papers or protocols they want to follow

Be friendly, knowledgeable, and concise. Ask one or two questions at a time. \
When the user provides information, acknowledge it and move to the next topic.

## Response Format
You MUST respond with valid JSON only. No markdown fences. The JSON must have:
{
  "response_text": "Your conversational reply to the user",
  "form_updates": {
    // Only include fields that the user has provided or confirmed.
    // Allowed keys: pi_name, pi_email, department, project_title,
    // project_description, project_goals, timeline_preference,
    // budget_estimate_cents, samples (array), services (array)
  }
}

For samples, use: [{"sample_type": "...", "organism": "...", "count": N, \
"extraction_method": "...", "notes": "..."}]
For services, use: [{"service_name": "...", "notes": "..."}]

Only include form_updates for fields the user has actually provided. \
Do not guess or fabricate information.\
"""


def _build_messages(
    chat_history: list[dict[str, str]],
    current_form_state: dict | None = None,
) -> list[dict[str, str]]:
    """Build the message list for MindRouter including system prompt and context."""
    messages: list[dict[str, str]] = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Include current form state as context
    if current_form_state:
        context = (
            "Current form state (already filled in by the user):\n"
            f"{json.dumps(current_form_state, indent=2)}\n\n"
            "Continue the conversation from where we left off. "
            "Don't re-ask about information already provided."
        )
        messages.append({"role": "system", "content": context})

    messages.extend(chat_history)
    return messages


async def guide_conversation(
    chat_history: list[dict[str, str]],
    current_form_state: dict | None = None,
    client: MindRouterClient | None = None,
) -> tuple[str, dict]:
    """Run a non-streaming conversation turn.

    Returns (response_text, form_updates).
    """
    if client is None:
        client = get_mindrouter_client()

    messages = _build_messages(chat_history, current_form_state)
    result = await client.chat_completion(messages, temperature=0.3, max_tokens=2000)
    content = client._strip_code_fences(result["content"])

    try:
        parsed = json.loads(content)
        return parsed.get("response_text", content), parsed.get("form_updates", {})
    except json.JSONDecodeError:
        logger.warning("Failed to parse AI response as JSON, returning raw text")
        return content, {}


async def stream_guide_conversation(
    chat_history: list[dict[str, str]],
    current_form_state: dict | None = None,
    client: MindRouterClient | None = None,
) -> AsyncIterator[str]:
    """Stream a conversation turn token-by-token.

    Yields raw tokens. The caller is responsible for accumulating and
    parsing the full response for form_updates after streaming completes.
    """
    if client is None:
        client = get_mindrouter_client()

    messages = _build_messages(chat_history, current_form_state)
    async for token in client.stream_chat_completion(
        messages, temperature=0.3, max_tokens=2000
    ):
        yield token


def extract_form_updates(full_response: str) -> tuple[str, dict]:
    """Parse a completed streamed response into response_text and form_updates."""
    full_response = MindRouterClient._strip_think_blocks(full_response)
    full_response = MindRouterClient._strip_code_fences(full_response)

    try:
        parsed = json.loads(full_response)
        return parsed.get("response_text", full_response), parsed.get(
            "form_updates", {}
        )
    except json.JSONDecodeError:
        return full_response, {}


async def summarize_pdf(
    text_content: str,
    client: MindRouterClient | None = None,
) -> str:
    """Summarize an uploaded PDF's text content for the intake context."""
    if client is None:
        client = get_mindrouter_client()

    messages = [
        {
            "role": "system",
            "content": (
                "Summarize the following methods/protocol document in 2-3 paragraphs. "
                "Focus on the key techniques, organisms, sequencing platforms, and "
                "bioinformatics tools mentioned. This summary will help GBRC staff "
                "understand what services the researcher needs."
            ),
        },
        {"role": "user", "content": text_content[:10000]},  # Limit input size
    ]

    result = await client.chat_completion(messages, temperature=0.2, max_tokens=500)
    return result["content"]
