"""Extract text content from uploaded files (PDF, DOCX, TXT)."""

import io
import logging

logger = logging.getLogger("cortex.file_extractor")

# Max file size: 10MB
MAX_FILE_SIZE = 10 * 1024 * 1024

# Max extracted text length (characters) to keep prompts reasonable
MAX_TEXT_LENGTH = 50000

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md", ".csv"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
    "text/csv",
}


def validate_file(filename: str, content_type: str, size: int, content: bytes = b"") -> None:
    """Validate file type, size, and content. Raises ValueError on invalid files."""
    import os

    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file type '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )
    if size > MAX_FILE_SIZE:
        raise ValueError(f"File too large ({size / 1024 / 1024:.1f}MB). Maximum is 10MB.")

    # Validate file content matches declared type (magic byte verification)
    if content and ext in (".pdf", ".docx"):
        _validate_magic_bytes(content, ext)


def _validate_magic_bytes(content: bytes, ext: str) -> None:
    """Verify file content matches its extension using magic bytes."""
    if ext == ".pdf":
        if not content[:5] == b"%PDF-":
            raise ValueError("File content does not match PDF format")
    elif ext == ".docx":
        # DOCX is a ZIP archive starting with PK\x03\x04
        if not content[:4] == b"PK\x03\x04":
            raise ValueError("File content does not match DOCX format")


def extract_text(filename: str, content: bytes) -> str:
    """Extract text from file content based on extension."""
    import os

    ext = os.path.splitext(filename)[1].lower()

    if ext == ".pdf":
        return _extract_pdf(content)
    elif ext == ".docx":
        return _extract_docx(content)
    elif ext in (".txt", ".md", ".csv"):
        return _extract_text(content)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def _extract_pdf(content: bytes) -> str:
    """Extract text from PDF bytes."""
    from PyPDF2 import PdfReader

    reader = PdfReader(io.BytesIO(content))
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text.strip())

    full_text = "\n\n".join(pages)
    if len(full_text) > MAX_TEXT_LENGTH:
        full_text = full_text[:MAX_TEXT_LENGTH] + "\n\n[... content truncated due to length]"

    return full_text


def _extract_docx(content: bytes) -> str:
    """Extract text from DOCX bytes."""
    from docx import Document

    doc = Document(io.BytesIO(content))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]

    full_text = "\n\n".join(paragraphs)
    if len(full_text) > MAX_TEXT_LENGTH:
        full_text = full_text[:MAX_TEXT_LENGTH] + "\n\n[... content truncated due to length]"

    return full_text


def _extract_text(content: bytes) -> str:
    """Extract text from plain text files."""
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        text = content.decode("latin-1")

    if len(text) > MAX_TEXT_LENGTH:
        text = text[:MAX_TEXT_LENGTH] + "\n\n[... content truncated due to length]"

    return text


# --- Chunking for source-aware answers ---

# Target ~500 words per chunk (roughly 3000 chars). Small enough for precise
# citations, large enough for coherent context.
CHUNK_SIZE = 3000
CHUNK_OVERLAP = 200


def _file_slug(filename: str) -> str:
    """Derive a short, safe slug from a filename for use as a chunk ID prefix.

    Examples: 'Report (Final).pdf' -> 'report-final'
              'data.csv' -> 'data'
    """
    import os
    import re as _re
    stem = os.path.splitext(filename)[0]
    # Keep only alphanumeric and spaces, collapse, lowercase, truncate
    slug = _re.sub(r'[^a-zA-Z0-9]+', '-', stem).strip('-').lower()
    return slug[:30] or "file"


def chunk_text(text: str, filename: str, pages: list[str] | None = None) -> list[dict]:
    """Split extracted text into chunks with stable, file-scoped identifiers.

    Chunk IDs are prefixed with a slug derived from the filename so that
    multiple uploads in the same conversation never collide.

    Args:
        text: The full extracted text.
        filename: Source filename (used in chunk metadata).
        pages: If available, per-page text list (for PDFs). Each entry becomes
               a separate chunk (or multiple if too long).

    Returns:
        List of dicts with keys: id, text, source, page.
    """
    slug = _file_slug(filename)
    chunks = []

    if pages:
        # PDF: one chunk per page (split large pages further)
        for page_num, page_text in enumerate(pages, start=1):
            page_text = page_text.strip()
            if not page_text:
                continue
            if len(page_text) <= CHUNK_SIZE:
                chunks.append({
                    "id": f"{slug}-page-{page_num}",
                    "text": page_text,
                    "source": filename,
                    "page": str(page_num),
                })
            else:
                # Split large page into sub-chunks
                for i, start in enumerate(range(0, len(page_text), CHUNK_SIZE - CHUNK_OVERLAP)):
                    chunk = page_text[start : start + CHUNK_SIZE]
                    if not chunk.strip():
                        continue
                    chunks.append({
                        "id": f"{slug}-page-{page_num}-{i + 1}",
                        "text": chunk,
                        "source": filename,
                        "page": str(page_num),
                    })
    else:
        # Non-PDF: chunk by character count with overlap
        if len(text) <= CHUNK_SIZE:
            chunks.append({
                "id": f"{slug}-chunk-1",
                "text": text,
                "source": filename,
                "page": None,
            })
        else:
            idx = 1
            for start in range(0, len(text), CHUNK_SIZE - CHUNK_OVERLAP):
                chunk = text[start : start + CHUNK_SIZE]
                if not chunk.strip():
                    continue
                chunks.append({
                    "id": f"{slug}-chunk-{idx}",
                    "text": chunk,
                    "source": filename,
                    "page": None,
                })
                idx += 1

    return chunks


def extract_pdf_pages(content: bytes) -> list[str]:
    """Extract text per page from PDF bytes (used for chunk metadata)."""
    from PyPDF2 import PdfReader

    reader = PdfReader(io.BytesIO(content))
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        pages.append(text.strip() if text else "")
    return pages
