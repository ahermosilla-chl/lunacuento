#!/usr/bin/env python3
"""Separa la luna del hero: recorta el disco como sprite (luna-hero.webp) y rellena el cielo donde estaba en
hero-inicio-*.webp. Así la luna se coloca por CSS (siempre entera, junto al niño) y no depende del recorte de la
imagen. Operación de una sola vez (sin IA, sin costo): si ya no hay luna en la imagen, no hace nada.
Uso: python3 scripts/quitar-luna-hero.py"""
import json, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

DIR = "public/ilustraciones"
SIZES = [768, 1152, 1536, 2304, 3072]

def detect(path):
    a = np.array(Image.open(path).convert("RGB")).astype(int)
    H, W, _ = a.shape
    m = (a[:, :, 0] > 225) & (a[:, :, 1] > 185) & (a[:, :, 2] < 175)
    m[:, : int(W * 0.7)] = False
    m[int(H * 0.4):, :] = False
    ys, xs = np.where(m)
    if len(xs) < 2000:
        return None
    # disco: percentiles para ignorar el borde brillante suelto
    x0, x1 = np.percentile(xs, [0.5, 99.5]); y0, y1 = np.percentile(ys, [0.5, 99.5])
    return ((x0 + x1) / 2 / W, (y0 + y1) / 2 / H, (x1 - x0 + y1 - y0) / 4 / W)  # cx, cy (fracción), radio (fracción del ancho)

geo = detect(f"{DIR}/hero-inicio-1536.webp")
if not geo:
    print("No se detecta la luna en el hero (ya fue separada). Nada que hacer."); sys.exit(0)
fx, fy, fr = (float(v) for v in geo)
print("luna: centro %.3f,%.3f radio %.3f del ancho" % geo)

# 1) sprite desde la variante más grande
big = Image.open(f"{DIR}/hero-inicio-3072.webp").convert("RGB")
W, H = big.size
cx, cy, R = fx * W, fy * H, fr * W
pad = R * 1.04
box = (int(cx - pad), int(cy - pad), int(cx + pad), int(cy + pad))
sp = big.crop(box).convert("RGBA")
S = sp.size[0]
mask = Image.new("L", (S * 4, S * 4), 0)
ImageDraw.Draw(mask).ellipse((S * 4 * 0.055, S * 4 * 0.055, S * 4 * 0.945, S * 4 * 0.945), fill=255)
mask = mask.resize((S, S), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
sp.putalpha(mask)
sp = sp.resize((480, 480), Image.LANCZOS)
sp.save(f"{DIR}/luna-hero.webp", quality=90, method=6)

# 2) rellenar el cielo en cada variante: modelo suave del cielo (polinomio cúbico en x, y por canal) ajustado a un anillo
#    alrededor de la luna (descartando estrellas, nubes y la bandera como valores atípicos) y mezcla con borde suave
def terms(x, y):
    return np.stack([x ** i * y ** j for i in range(4) for j in range(4 - i)], axis=1)

for w in SIZES:
    p = f"{DIR}/hero-inicio-{w}.webp"
    im = Image.open(p).convert("RGB"); a = np.array(im).astype(float); h_, w_, _ = a.shape
    cx, cy, R = fx * w_, fy * h_, fr * w_
    r_fill, r_in, r_out = R * 2.15, R * 2.3, R * 2.9
    yy, xx = np.mgrid[0:h_, 0:w_]
    d = np.hypot(xx - cx, yy - cy)
    ring = (d > r_in) & (d < r_out) & (yy < h_ * 0.34)
    X = terms((xx[ring] - cx) / R, (yy[ring] - cy) / R)
    keep = np.ones(X.shape[0], bool)
    coef = None
    for _ in range(4):
        coef = [np.linalg.lstsq(X[keep], a[ring][:, c][keep], rcond=None)[0] for c in range(3)]
        res = np.abs(np.stack([X @ coef[c] - a[ring][:, c] for c in range(3)], 1)).max(1)
        keep = res < max(6.0, np.percentile(res[keep], 90) * 1.6)
    zone = d < r_fill + R * 0.5
    bx0, bx1 = int(max(0, cx - r_fill - R)), int(min(w_, cx + r_fill + R))
    by0, by1 = int(max(0, cy - r_fill - R)), int(min(h_, cy + r_fill + R))
    sx, sy = xx[by0:by1, bx0:bx1], yy[by0:by1, bx0:bx1]
    T = terms((sx.ravel() - cx) / R, (sy.ravel() - cy) / R)
    fillv = np.stack([(T @ coef[c]).reshape(sx.shape) for c in range(3)], 2)
    m = Image.new("L", (w_, h_), 0)
    ImageDraw.Draw(m).ellipse((cx - r_fill, cy - r_fill, cx + r_fill, cy + r_fill), fill=255)
    m = np.array(m.filter(ImageFilter.GaussianBlur(float(R * 0.35)))).astype(float)[by0:by1, bx0:bx1, None] / 255
    a[by0:by1, bx0:bx1] = a[by0:by1, bx0:bx1] * (1 - m) + fillv * m
    Image.fromarray(np.clip(a, 0, 255).astype("uint8")).save(p, quality=90, method=6)
    print("relleno", p, "(%d px de ajuste)" % int(keep.sum()))

mp = f"{DIR}/manifest.json"
man = json.load(open(mp))
man["luna-hero"] = {"src": "/ilustraciones/luna-hero.webp", "width": 480, "height": 480}
json.dump(man, open(mp, "w"), indent=2, ensure_ascii=False)
open(mp, "a").write("\n")
print("listo")
