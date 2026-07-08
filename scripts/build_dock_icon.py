#!/usr/bin/env python3
"""Build Punjabi Tester.app/Contents/Resources/AppIcon.icns (ਪ on white). Requires Pillow."""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

# Gurmukhi letter PA — ਪ
GLYPH = "\u0a2a"

REPO = Path(__file__).resolve().parents[1]
ICNS_OUT = REPO / "Punjabi Tester.app" / "Contents" / "Resources" / "AppIcon.icns"

FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Gurmukhi.ttf",
    "/System/Library/Fonts/Supplemental/Gurmukhi MN.ttc",
    "/System/Library/Fonts/Supplemental/Gurmukhi Sangam MN.ttc",
]


def pick_font() -> str:
    for p in FONT_CANDIDATES:
        if os.path.isfile(p):
            return p
    raise SystemExit("No Gurmukhi font found under /System/Library/Fonts/Supplemental")


def main() -> None:
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        print("Install Pillow: ./venv/bin/pip install pillow", file=sys.stderr)
        raise SystemExit(1) from None

    font_path = pick_font()
    ICNS_OUT.parent.mkdir(parents=True, exist_ok=True)

    size = 1024
    img = Image.new("RGB", (size, size), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype(font_path, int(size * 0.62))
    bbox = draw.textbbox((0, 0), GLYPH, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - tw) // 2 - bbox[0]
    y = (size - th) // 2 - bbox[1]
    draw.text((x, y), GLYPH, font=font, fill=(15, 15, 20))

    names = [
        ("icon_16x16.png", 16),
        ("icon_16x16@2x.png", 32),
        ("icon_32x32.png", 32),
        ("icon_32x32@2x.png", 64),
        ("icon_128x128.png", 128),
        ("icon_128x128@2x.png", 256),
        ("icon_256x256.png", 256),
        ("icon_256x256@2x.png", 512),
        ("icon_512x512.png", 512),
        ("icon_512x512@2x.png", 1024),
    ]

    # iconutil misbehaves on some PNGs when the .iconset lives under a restricted tree; use /tmp.
    with tempfile.TemporaryDirectory(prefix="pa_dock_icon_") as td:
        iconset = Path(td) / "pa.iconset"
        iconset.mkdir()
        for fname, dim in names:
            out = iconset / fname
            resized = img.resize((dim, dim), Image.Resampling.LANCZOS)
            resized.save(out, "PNG")
        subprocess.run(["iconutil", "-c", "icns", str(iconset), "-o", str(ICNS_OUT)], check=True)

    print("Wrote", ICNS_OUT)


if __name__ == "__main__":
    main()
