import re
from typing import Dict, Any, List, Union

EMAIL_REGEX = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', re.IGNORECASE)
PHONE_REGEX = re.compile(r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b')
SSN_REGEX = re.compile(r'\b\d{3}-\d{2}-\d{4}\b')
UUID_REGEX = re.compile(r'\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b')
JWT_REGEX = re.compile(r'eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*')

PII_FIELDS = {
    "email", "full_name", "name", "phone", "telephone", "mobile",
    "ssn", "social_security", "jwt", "token", "access_token", "refresh_token",
    "password", "secret", "user_id", "address"
}


def sanitize_text(text: str) -> str:
    """Strips PII tokens (emails, phones, SSNs, UUIDs, JWTs) from a text string."""
    if not isinstance(text, str):
        return text

    sanitized = text
    sanitized = JWT_REGEX.sub("[REDACTED_JWT]", sanitized)
    sanitized = EMAIL_REGEX.sub("[REDACTED_EMAIL]", sanitized)
    sanitized = PHONE_REGEX.sub("[REDACTED_PHONE]", sanitized)
    sanitized = SSN_REGEX.sub("[REDACTED_SSN]", sanitized)
    sanitized = UUID_REGEX.sub("[REDACTED_ID]", sanitized)
    return sanitized


def sanitize_dict(data: Union[Dict[str, Any], List[Any], str, int, float, bool, None]) -> Any:
    """
    Recursively strips PII fields and scrubs text strings in dictionary/list structures.
    """
    if isinstance(data, dict):
        sanitized = {}
        for key, value in data.items():
            if str(key).lower() in PII_FIELDS:
                continue  # Exclude sensitive keys completely
            sanitized[key] = sanitize_dict(value)
        return sanitized

    elif isinstance(data, list):
        return [sanitize_dict(item) for item in data]

    elif isinstance(data, str):
        return sanitize_text(data)

    return data
