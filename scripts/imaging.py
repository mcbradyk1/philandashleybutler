#!/usr/bin/env python3
"""Shared image processing for guest and booth gallery sync workflows.

Single source of truth for thumbnail sizing, quality, and JPEG encoding
parameters. Both sync_gallery.py and sync_booth.py import from this module to
guarantee visually identical output across both pipelines.

Lightbox/large images are served directly from the Drive CDN
(lh3.googleusercontent.com/d/<id>=w####) at view time, so we do not
generate a large/ directory on disk.
"""
import io
from pathlib import Path

from PIL import Image, ImageOps
from pillow_heif import register_heif_opener

# Register HEIC support once at import time. Idempotent.
register_heif_opener()

# ---- Public constants -------------------------------------------------
# These define the "look" of the gallery grid. Change here -> both
# pipelines regenerate matching output on next run.
THUMB_MAX = 600   # max edge, px, for grid thumbnails
THUMB_Q   = 78    # JPEG quality for thumbnails (barely visible < 80)
JPEG_KWARGS = {
    "format": "JPEG",
    "optimize": True,
    "progressive": True,
}

# Resampling filter — LANCZOS is best quality for downscaling.
try:
    RESAMPLE = Image.Resampling.LANCZOS
except AttributeError:  # Pillow < 10
    RESAMPLE = Image.LANCZOS


# ---- Public API -------------------------------------------------------
def make_thumbnail(raw: bytes, out_id: str, thumb_dir: Path) -> tuple[int, int]:
    """Generate the 600px grid thumbnail from source bytes.

    Returns (width, height) of the ORIGINAL image so the manifest can record
    the aspect ratio. Writes <thumb_dir>/<out_id>.jpg.
    """
    thumb_dir.mkdir(parents=True, exist_ok=True)
    img = Image.open(io.BytesIO(raw))
    # Honor EXIF orientation, then drop it so browsers don't rotate again.
    img = ImageOps.exif_transpose(img)
    orig_w, orig_h = img.size

    thumb = img.convert("RGB")
    thumb.thumbnail((THUMB_MAX, THUMB_MAX), RESAMPLE)
    thumb.save(thumb_dir / f"{out_id}.jpg", quality=THUMB_Q, **JPEG_KWARGS)

    return orig_w, orig_h
