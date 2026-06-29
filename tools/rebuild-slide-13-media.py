#!/usr/bin/env python3
"""
Rebuild the page 13 media layer while preserving the existing Canva masks.

This is mainly for manually tuning the large Wadi Showka camp image crop.
The HTML reveal code only shows/hides assets/slides/media/slide-13.webp;
the actual crop/pan is baked into that WebP layer.
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]

DEFAULT_MEDIA_LAYER = ROOT / "assets" / "slides" / "media" / "slide-13.webp"
BACKGROUND_LAYER = ROOT / "assets" / "slides" / "backgrounds" / "slide-13.webp"
TEXT_LAYER = ROOT / "assets" / "slides" / "text" / "slide-13.webp"
INDEX_HTML = ROOT / "index.html"

SOURCES = {
    "camp": ROOT / "assets" / "images" / "interactive map images" / "Wadi" / "Wadi shoka camp.webp",
    "farm": ROOT / "assets" / "images" / "interactive map images" / "Wadi" / "Local farm integration.webp",
    "heritage": ROOT / "assets" / "images" / "interactive map images" / "Wadi" / "Mountain heritage camp source.webp",
    "vehicle": ROOT / "assets" / "images" / "interactive map images" / "Wadi" / "Wadi Showka vehicle crossing.webp",
    "food": ROOT / "assets" / "images" / "interactive map images" / "Wadi" / "Food and beverage.webp",
}

BOTTOM_DEFAULTS = {
    "farm": {"anchor_x": 0.46, "anchor_y": 0.48, "zoom": 1.16},
    "heritage": {"anchor_x": 0.46, "anchor_y": 0.48, "zoom": 1.12},
    "vehicle": {"anchor_x": 0.50, "anchor_y": 0.48, "zoom": 1.12},
    "food": {"anchor_x": 0.47, "anchor_y": 0.48, "zoom": 1.12},
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Rebuild assets/slides/media/slide-13.webp with adjustable camp crop/pan.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--camp-zoom",
        type=float,
        default=1.00,
        help="Camp image zoom. 1.00 is the widest possible cover crop; 1.05 zooms in 5%.",
    )
    parser.add_argument(
        "--camp-x",
        "--camp-anchor-x",
        dest="camp_x",
        type=float,
        default=0.50,
        help="Camp horizontal pan. 0.00 = far left, 0.50 = center, 1.00 = far right.",
    )
    parser.add_argument(
        "--camp-y",
        "--camp-anchor-y",
        dest="camp_y",
        type=float,
        default=0.56,
        help="Camp vertical pan. Lower shows more top of source; higher shows more bottom.",
    )
    parser.add_argument(
        "--camp-source",
        type=Path,
        default=SOURCES["camp"],
        help="Image source for the large camp mask. Useful for testing a new raw image before replacing the saved WebP source.",
    )
    parser.add_argument(
        "--mask-layer",
        type=Path,
        default=DEFAULT_MEDIA_LAYER,
        help="Existing media layer whose alpha masks should be preserved.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_MEDIA_LAYER,
        help="Where to write the rebuilt media WebP. Default overwrites the live slide layer.",
    )
    parser.add_argument(
        "--preview",
        action="store_true",
        help="Also write a full-slide JPG preview with background + rebuilt media + text.",
    )
    parser.add_argument(
        "--preview-output",
        type=Path,
        default=ROOT / "tmp" / "slide-13-preview.jpg",
        help="Preview JPG path when --preview is used.",
    )
    parser.add_argument(
        "--bump-version",
        action="store_true",
        help="Increment ASSET_VERSION in index.html so the browser reloads the updated WebP.",
    )
    return parser.parse_args()


def require_file(path: Path) -> None:
    if not path.exists():
        raise FileNotFoundError(path)


def clamp01(value: float, name: str) -> float:
    if value < 0 or value > 1:
        raise ValueError(f"{name} must be between 0.00 and 1.00; got {value}")
    return value


def connected_alpha_boxes(alpha: np.ndarray) -> list[tuple[int, int, int, int, int]]:
    """Return bounding boxes for the separated mask islands in the slide media layer."""
    height, width = alpha.shape
    visited = np.zeros((height, width), dtype=bool)
    boxes: list[tuple[int, int, int, int, int]] = []

    for y in range(height):
        xs = np.where((alpha[y] > 0) & (~visited[y]))[0]
        for x0_raw in xs:
            x0 = int(x0_raw)
            if visited[y, x0] or alpha[y, x0] == 0:
                continue

            stack = [(x0, y)]
            visited[y, x0] = True
            min_x = max_x = x0
            min_y = max_y = y
            count = 0

            while stack:
                x, current_y = stack.pop()
                count += 1
                min_x = min(min_x, x)
                max_x = max(max_x, x)
                min_y = min(min_y, current_y)
                max_y = max(max_y, current_y)

                for next_x, next_y in (
                    (x + 1, current_y),
                    (x - 1, current_y),
                    (x, current_y + 1),
                    (x, current_y - 1),
                ):
                    if (
                        0 <= next_x < width
                        and 0 <= next_y < height
                        and not visited[next_y, next_x]
                        and alpha[next_y, next_x] > 0
                    ):
                        visited[next_y, next_x] = True
                        stack.append((next_x, next_y))

            if count > 1000:
                boxes.append((min_x, min_y, max_x + 1, max_y + 1, count))

    boxes.sort(key=lambda box: (box[1], box[0]))
    return boxes


def cover_crop(
    image: Image.Image,
    size: tuple[int, int],
    *,
    anchor_x: float,
    anchor_y: float,
    zoom: float,
) -> Image.Image:
    """Resize/crop an image to fill a target rectangle using Canva-like cover behavior."""
    if zoom < 1.0:
        raise ValueError(
            "zoom must be 1.00 or higher. Below 1.00 would reveal empty edges inside the mask."
        )

    target_width, target_height = size
    source = image.convert("RGB")
    source_width, source_height = source.size

    scale = max(target_width / source_width, target_height / source_height) * zoom
    resized_width = max(1, int(round(source_width * scale)))
    resized_height = max(1, int(round(source_height * scale)))
    resized = source.resize((resized_width, resized_height), Image.Resampling.LANCZOS)

    max_x = max(0, resized_width - target_width)
    max_y = max(0, resized_height - target_height)
    crop_x = int(round(max_x * anchor_x))
    crop_y = int(round(max_y * anchor_y))

    return resized.crop((crop_x, crop_y, crop_x + target_width, crop_y + target_height)).convert("RGBA")


def rebuild_media(args: argparse.Namespace) -> Image.Image:
    require_file(args.mask_layer)
    camp_source = args.camp_source if args.camp_source.is_absolute() else ROOT / args.camp_source
    require_file(camp_source)
    for key, source in SOURCES.items():
        if key == "camp":
            continue
        require_file(source)

    camp_settings = {
        "anchor_x": clamp01(args.camp_x, "--camp-x"),
        "anchor_y": clamp01(args.camp_y, "--camp-y"),
        "zoom": args.camp_zoom,
    }

    mask_layer = Image.open(args.mask_layer).convert("RGBA")
    alpha = np.array(mask_layer)[:, :, 3]
    boxes = connected_alpha_boxes(alpha)
    if len(boxes) < 5:
        raise RuntimeError(f"Expected at least 5 separate page 13 masks, found {len(boxes)}.")

    camp_box = boxes[0]
    bottom_boxes = sorted(boxes[1:5], key=lambda box: box[0])
    placements = [
        ("camp", camp_box, camp_settings),
        ("farm", bottom_boxes[0], BOTTOM_DEFAULTS["farm"]),
        ("heritage", bottom_boxes[1], BOTTOM_DEFAULTS["heritage"]),
        ("vehicle", bottom_boxes[2], BOTTOM_DEFAULTS["vehicle"]),
        ("food", bottom_boxes[3], BOTTOM_DEFAULTS["food"]),
    ]

    width, height = mask_layer.size
    rebuilt = Image.new("RGBA", (width, height), (0, 0, 0, 0))

    for key, box, settings in placements:
        x1, y1, x2, y2, _count = box
        mask = Image.fromarray(alpha[y1:y2, x1:x2], "L")
        source = camp_source if key == "camp" else SOURCES[key]
        fill = cover_crop(
            Image.open(source),
            (x2 - x1, y2 - y1),
            anchor_x=settings["anchor_x"],
            anchor_y=settings["anchor_y"],
            zoom=settings["zoom"],
        )
        fill.putalpha(mask)
        rebuilt.alpha_composite(fill, dest=(x1, y1))

    print("Page 13 masks:")
    for key, box, settings in placements:
        x1, y1, x2, y2, _count = box
        print(
            f"  {key:8s} bbox=({x1},{y1})-({x2},{y2}) "
            f"zoom={settings['zoom']:.3f} x={settings['anchor_x']:.3f} y={settings['anchor_y']:.3f}"
        )

    return rebuilt


def write_media(image: Image.Image, output: Path) -> None:
    output = output if output.is_absolute() else ROOT / output
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.suffix.lower() == ".png":
        image.save(output, "PNG")
    else:
        image.save(output, "WEBP", lossless=True, method=6)
    print(f"Wrote media layer: {output}")


def write_preview(media: Image.Image, preview_output: Path) -> None:
    require_file(BACKGROUND_LAYER)
    require_file(TEXT_LAYER)
    preview_output = preview_output if preview_output.is_absolute() else ROOT / preview_output
    preview_output.parent.mkdir(parents=True, exist_ok=True)

    composite = Image.open(BACKGROUND_LAYER).convert("RGBA")
    composite.alpha_composite(media)
    composite.alpha_composite(Image.open(TEXT_LAYER).convert("RGBA"))
    composite.convert("RGB").save(preview_output, "JPEG", quality=95)
    print(f"Wrote preview: {preview_output}")


def bump_asset_version() -> None:
    require_file(INDEX_HTML)
    html = INDEX_HTML.read_text(encoding="utf-8")

    def bump(match: re.Match[str]) -> str:
        version = int(match.group(1))
        return f"const ASSET_VERSION = '{version + 1}'"

    updated, count = re.subn(r"const ASSET_VERSION = '([0-9]+)'", bump, html, count=1)
    if count != 1:
        raise RuntimeError("Could not find ASSET_VERSION in index.html")
    INDEX_HTML.write_text(updated, encoding="utf-8")
    print("Bumped ASSET_VERSION in index.html")


def main() -> None:
    args = parse_args()
    media = rebuild_media(args)
    write_media(media, args.output)
    if args.preview:
        write_preview(media, args.preview_output)
    if args.bump_version:
        bump_asset_version()


if __name__ == "__main__":
    main()
