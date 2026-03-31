"""Identicon-style avatar generator.

Generates a 5x5 symmetric grid pattern as an SVG, encoded as a base64 data URI.
Similar to GitHub's default profile pictures.
"""

import base64
import hashlib
import os


def generate_avatar(seed: str | None = None) -> str:
    """Generate an identicon avatar as a base64 SVG data URI.

    Args:
        seed: Optional seed string. If None, a random seed is used.

    Returns:
        A data:image/svg+xml;base64,... string ready for storage or display.
    """
    if seed is None:
        seed = os.urandom(16).hex()

    h = hashlib.sha256(seed.encode()).digest()

    # Derive color from hash
    hue = int(h[0] / 255 * 360)
    saturation = 50 + (h[1] % 25)  # 50-75%
    lightness = 45 + (h[2] % 15)   # 45-60%
    color = f"hsl({hue},{saturation}%,{lightness}%)"
    bg = f"hsl({hue},{max(saturation - 30, 15)}%,93%)"

    # Build symmetric 5x5 grid (only need 3 columns due to horizontal mirror)
    size = 300
    pad = 40
    cell = (size - 2 * pad) // 5  # 44

    rects = []
    for row in range(5):
        for col in range(3):
            idx = 3 + row * 3 + col
            if h[idx] > 120:  # ~53% fill rate
                y = pad + row * cell
                # Left/center cell
                x = pad + col * cell
                rects.append(
                    f'<rect x="{x}" y="{y}" width="{cell}" height="{cell}" rx="6"/>'
                )
                # Mirror right (skip center column 2)
                if col < 2:
                    mx = pad + (4 - col) * cell
                    rects.append(
                        f'<rect x="{mx}" y="{y}" width="{cell}" height="{cell}" rx="6"/>'
                    )

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">'
        f'<rect width="{size}" height="{size}" fill="{bg}" rx="16"/>'
        f'<g fill="{color}">{"".join(rects)}</g>'
        f'</svg>'
    )

    b64 = base64.b64encode(svg.encode()).decode()
    return f"data:image/svg+xml;base64,{b64}"
