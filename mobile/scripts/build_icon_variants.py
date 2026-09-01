#!/usr/bin/env python3
"""Generate App Store icon variants (ਪ) as 1024×1024 PNGs. Requires Pillow."""
from __future__ import annotations

import argparse
import os
import shutil
import sys
from pathlib import Path

# Gurmukhi letter PA — ਪ
GLYPH = "\u0a2a"

MOBILE = Path(__file__).resolve().parents[1]
OUT_DIR = MOBILE / "icon-variants"
IOS_ICON = (
    MOBILE
    / "ios"
    / "App"
    / "App"
    / "Assets.xcassets"
    / "AppIcon.appiconset"
    / "AppIcon-512@2x.png"
)
CANONICAL_VARIANT = "02-pa-off-white.png"

FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Gurmukhi.ttf",
    "/System/Library/Fonts/Supplemental/Gurmukhi MN.ttc",
    "/System/Library/Fonts/Supplemental/Gurmukhi Sangam MN.ttc",
]

GLYPH_FILL = (15, 15, 20)
WHITE = (255, 255, 255)
OFF_WHITE = (247, 245, 240)
ACCENT_BLUE = (91, 159, 212)  # --accent from styles.css
GOLD = (244, 185, 66)


def pick_font() -> str:
    for p in FONT_CANDIDATES:
        if os.path.isfile(p):
            return p
    raise SystemExit("No Gurmukhi font found under /System/Library/Fonts/Supplemental")


def draw_glyph_centered(draw, font, size: int, fill: tuple[int, int, int]) -> None:
    bbox = draw.textbbox((0, 0), GLYPH, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - tw) // 2 - bbox[0]
    y = (size - th) // 2 - bbox[1]
    draw.text((x, y), GLYPH, font=font, fill=fill)


def render_white(size: int, font) -> "Image.Image":
    from PIL import Image, ImageDraw

    img = Image.new("RGB", (size, size), WHITE)
    draw = ImageDraw.Draw(img)
    draw_glyph_centered(draw, font, size, GLYPH_FILL)
    return img


def render_off_white(size: int, font) -> "Image.Image":
    from PIL import Image, ImageDraw

    img = Image.new("RGB", (size, size), OFF_WHITE)
    draw = ImageDraw.Draw(img)
    draw_glyph_centered(draw, font, size, GLYPH_FILL)
    return img


def render_gold_circle(size: int, font) -> "Image.Image":
    from PIL import Image, ImageDraw

    img = Image.new("RGB", (size, size), WHITE)
    draw = ImageDraw.Draw(img)
    margin = int(size * 0.12)
    draw.ellipse(
        (margin, margin, size - margin, size - margin),
        fill=GOLD,
    )
    draw_glyph_centered(draw, font, size, WHITE)
    return img


def render_blue_ring(size: int, font) -> "Image.Image":
    from PIL import Image, ImageDraw

    img = Image.new("RGB", (size, size), OFF_WHITE)
    draw = ImageDraw.Draw(img)
    ring_width = max(8, int(size * 0.028))
    margin = int(size * 0.08)
    draw.ellipse(
        (margin, margin, size - margin, size - margin),
        outline=ACCENT_BLUE,
        width=ring_width,
    )
    draw_glyph_centered(draw, font, size, GLYPH_FILL)
    return img


VARIANTS = [
    ("01-pa-white.png", render_white),
    ("02-pa-off-white.png", render_off_white),
    ("03-pa-gold-circle.png", render_gold_circle),
    ("04-pa-blue-ring.png", render_blue_ring),
]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--install-ios",
        action="store_true",
        help="Copy the off-white variant into the iOS AppIcon asset",
    )
    args = parser.parse_args()

    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        print("Install Pillow: pip install pillow", file=sys.stderr)
        raise SystemExit(1) from None

    font_path = pick_font()
    size = 1024
    font = ImageFont.truetype(font_path, int(size * 0.62))

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for filename, render in VARIANTS:
        out = OUT_DIR / filename
        render(size, font).save(out, "PNG")
        print("Wrote", out)

    if args.install_ios:
        src = OUT_DIR / CANONICAL_VARIANT
        IOS_ICON.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, IOS_ICON)
        print("Installed", IOS_ICON)


if __name__ == "__main__":
    main()
