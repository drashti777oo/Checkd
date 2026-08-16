import re


def sanitize_health_prompt(prompt_text: str) -> str:
    """Strips email addresses, phone numbers, and SSNs to prevent PII leaks to third-party LLMs."""
    prompt_text = re.sub(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", "[REDACTED_EMAIL]", prompt_text)
    prompt_text = re.sub(r"\b\d{3}-\d{2}-\d{4}\b", "[REDACTED_SSN]", prompt_text)
    prompt_text = re.sub(r"\b\d{10}\b", "[REDACTED_PHONE]", prompt_text)
    return prompt_text
