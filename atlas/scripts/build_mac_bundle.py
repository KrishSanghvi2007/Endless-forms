#!/usr/bin/env python3
"""Build Endless_Forms_Atlas_Mac.zip — a universal (Apple Silicon + Intel) macOS download.

Contents of the zip (top folder "Endless Forms Atlas/"):
  Endless Forms Atlas.app/   native app bundle that opens the offline atlas in the default browser
  Endless_Forms_Atlas.html   the same atlas as a single file (double-click, no Gatekeeper prompt)
  README_MAC.txt             instructions

Usage:  python3 atlas/scripts/build_mac_bundle.py [path/to/Endless_Forms_Atlas.html] [out.zip]
Requires Pillow for the icon.
"""
import io
import math
import struct
import sys
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

REPO = Path(__file__).resolve().parents[2]
SRC_HTML = Path(sys.argv[1]) if len(sys.argv) > 1 else REPO / "games/endless-forms/Endless_Forms_Atlas.html"
OUT_ZIP = Path(sys.argv[2]) if len(sys.argv) > 2 else REPO / "games/endless-forms/Endless_Forms_Atlas_Mac.zip"
ROOT = "Endless Forms Atlas"
APP = f"{ROOT}/Endless Forms Atlas.app/Contents"
VERSION = "2.0"

INFO_PLIST = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>Endless Forms Atlas</string>
  <key>CFBundleDisplayName</key><string>Endless Forms Atlas</string>
  <key>CFBundleIdentifier</key><string>org.endlessforms.atlas</string>
  <key>CFBundleExecutable</key><string>EndlessFormsAtlas</string>
  <key>CFBundleIconFile</key><string>AppIcon</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleInfoDictionaryVersion</key><string>6.0</string>
  <key>CFBundleVersion</key><string>{VERSION}</string>
  <key>CFBundleShortVersionString</key><string>{VERSION}</string>
  <key>LSMinimumSystemVersion</key><string>10.13</string>
  <key>LSApplicationCategoryType</key><string>public.app-category.education</string>
  <key>NSHighResolutionCapable</key><true/>
  <key>NSHumanReadableCopyright</key><string>Endless Forms — an undergraduate evo-eco-devo atlas.</string>
</dict>
</plist>
"""

LAUNCHER = """#!/bin/bash
# Opens the bundled offline Endless Forms Atlas in the default web browser.
DIR="$(cd "$(dirname "$0")/../Resources" && pwd)"
exec /usr/bin/open "$DIR/Endless_Forms_Atlas.html"
"""

README = """ENDLESS FORMS ATLAS — macOS (Apple Silicon & Intel, fully offline)
====================================================================

25 interactive 3D plates / 150 pages. No install, no internet needed.

OPTION A — quickest (no security prompt)
  Double-click  Endless_Forms_Atlas.html
  It opens in Safari / Chrome / Firefox / Edge.

OPTION B — as a Mac app with its own icon
  1. Drag  "Endless Forms Atlas.app"  into your Applications folder.
  2. First launch only: right-click (Control-click) the app -> Open -> Open.
     (The app is unsigned open-source software, so macOS asks once.)
  3. After that, launch it normally from Launchpad / Spotlight / the Dock.

If macOS says the app "is damaged" or "can't be opened", run once in Terminal:
  xattr -dr com.apple.quarantine "/Applications/Endless Forms Atlas.app"
or simply use Option A.

Tip: WebGL works best in an up-to-date Safari or Chrome.
"""


def make_icon(size: int = 1024) -> Image.Image:
    """Parchment museum plate with a sepia-ink nautilus spiral and watercolour wash."""
    s = size
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = int(s * 0.18)
    m = int(s * 0.06)
    d.rounded_rectangle([m, m, s - m, s - m], radius=r, fill=(240, 228, 200, 255), outline=(120, 86, 52, 255), width=int(s * 0.012))

    # watercolour wash
    wash = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    wd = ImageDraw.Draw(wash)
    cx, cy = s * 0.52, s * 0.52
    wd.ellipse([cx - s * 0.33, cy - s * 0.30, cx + s * 0.33, cy + s * 0.30], fill=(196, 132, 84, 120))
    wd.ellipse([cx - s * 0.22, cy - s * 0.24, cx + s * 0.28, cy + s * 0.20], fill=(214, 168, 112, 110))
    wash = wash.filter(ImageFilter.GaussianBlur(s * 0.035))
    img = Image.alpha_composite(img, wash)
    d = ImageDraw.Draw(img)

    # logarithmic (nautilus) spiral with septa
    ink = (74, 48, 28, 255)
    b = 0.1759  # golden-ish growth rate
    a = s * 0.012
    pts = []
    t = 0.0
    while True:
        rr = a * math.exp(b * t)
        if rr > s * 0.30:
            break
        pts.append((cx + rr * math.cos(t), cy + rr * math.sin(t)))
        t += 0.04
    d.line(pts, fill=ink, width=max(2, int(s * 0.014)), joint="curve")
    # outer shell outline: spiral one turn out
    t_end = t
    for k in range(10, int(t_end / 0.5)):
        th = k * 0.5
        r_in = a * math.exp(b * th)
        r_out = a * math.exp(b * (th + 2 * math.pi))
        if r_out > s * 0.30:
            r_out = s * 0.30
        p1 = (cx + r_in * math.cos(th), cy + r_in * math.sin(th))
        p2 = (cx + r_out * math.cos(th), cy + r_out * math.sin(th))
        d.line([p1, p2], fill=(110, 72, 42, 220), width=max(1, int(s * 0.006)))
    # outer rim arc
    rim = []
    th = t_end - 2 * math.pi
    while th <= t_end:
        rr = min(a * math.exp(b * (th + 2 * math.pi)), s * 0.30)
        rim.append((cx + rr * math.cos(th), cy + rr * math.sin(th)))
        th += 0.03
    d.line(rim, fill=ink, width=max(2, int(s * 0.016)), joint="curve")
    return img


def make_icns(base: Image.Image) -> bytes:
    chunks = b""
    for code, px in ((b"ic07", 128), (b"ic08", 256), (b"ic09", 512), (b"ic10", 1024)):
        buf = io.BytesIO()
        base.resize((px, px), Image.LANCZOS).save(buf, "PNG")
        data = buf.getvalue()
        chunks += code + struct.pack(">I", len(data) + 8) + data
    return b"icns" + struct.pack(">I", len(chunks) + 8) + chunks


def add(zf: zipfile.ZipFile, name: str, data: bytes, mode: int = 0o644) -> None:
    info = zipfile.ZipInfo(name, date_time=(2026, 11, 27, 12, 0, 0))
    info.create_system = 3  # Unix, so permissions are honoured by macOS Archive Utility
    info.external_attr = (0o100000 | mode) << 16
    info.compress_type = zipfile.ZIP_DEFLATED
    zf.writestr(info, data, compresslevel=9)


def add_dir(zf: zipfile.ZipFile, name: str) -> None:
    info = zipfile.ZipInfo(name.rstrip("/") + "/", date_time=(2026, 11, 27, 12, 0, 0))
    info.create_system = 3
    info.external_attr = (0o040755 << 16) | 0x10
    zf.writestr(info, b"")


def main() -> None:
    html = SRC_HTML.read_bytes()
    icon = make_icon()
    icns = make_icns(icon)
    OUT_ZIP.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUT_ZIP, "w") as zf:
        for dname in (ROOT, f"{ROOT}/Endless Forms Atlas.app", APP, f"{APP}/MacOS", f"{APP}/Resources"):
            add_dir(zf, dname)
        add(zf, f"{APP}/Info.plist", INFO_PLIST.encode())
        add(zf, f"{APP}/PkgInfo", b"APPL????")
        add(zf, f"{APP}/MacOS/EndlessFormsAtlas", LAUNCHER.encode(), 0o755)
        add(zf, f"{APP}/Resources/AppIcon.icns", icns)
        add(zf, f"{APP}/Resources/Endless_Forms_Atlas.html", html)
        add(zf, f"{ROOT}/Endless_Forms_Atlas.html", html)
        add(zf, f"{ROOT}/README_MAC.txt", README.encode())
    icon.resize((512, 512), Image.LANCZOS).save(OUT_ZIP.with_name("Endless_Forms_Atlas_icon.png"))
    print(f"wrote {OUT_ZIP} ({OUT_ZIP.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
