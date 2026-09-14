/** Cheap visual FX helpers — prefer baked overlays & additive glows over shadowBlur. */

export function createOffscreenCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/** Bake a radial vignette once; draw with drawImage each frame. */
export function bakeVignette(
  width: number,
  height: number,
  strength: number,
): HTMLCanvasElement {
  const canvas = createOffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    height * 0.28,
    width / 2,
    height / 2,
    height * 0.85,
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.55, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  return canvas;
}

/** Bake a flat atmosphere tint overlay for a weather preset. */
export function bakeAtmosphereTint(
  width: number,
  height: number,
  tint: string,
): HTMLCanvasElement {
  const canvas = createOffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, width, height);
  return canvas;
}

/** Soft additive glow without Canvas shadowBlur (much cheaper). */
export function drawSoftGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha = 0.35,
): void {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Soft elliptical contact shadow under an entity. */
export function drawContactShadow(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  bottomY: number,
  width: number,
  alpha = 0.28,
): void {
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(centerX, bottomY, width / 2, Math.max(3, width * 0.12), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Draw a platform body with top lip, side bevel, and optional grass blades. */
export function drawDetailedPlatform(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: {
    bodyColor: string;
    topColor: string;
    drawGrass?: boolean;
    grassColor?: string;
  },
): void {
  ctx.fillStyle = opts.bodyColor;
  ctx.fillRect(x, y, w, h);

  // Subtle dirt/noise blocks (deterministic)
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for (let i = 0; i < w; i += 15) {
    for (let j = 12; j < h; j += 15) {
      if (((x + i * j) % 7) > 3) {
        ctx.fillRect(x + i, y + j, 6, 6);
      }
    }
  }

  if (h > 10) {
    // Top surface
    ctx.fillStyle = opts.topColor;
    ctx.fillRect(x, y, w, 10);

    // Highlight lip
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fillRect(x, y, w, 2);

    // Bottom edge shadow
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(x, y + h - 3, w, 3);

    // Left/right bevel
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(x, y, 2, h);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(x + w - 2, y, 2, h);

    if (opts.drawGrass) {
      ctx.fillStyle = opts.grassColor ?? opts.topColor;
      for (let g = 0; g < w; g += 8) {
        const bladeH = 4 + ((g + x) % 5);
        ctx.fillRect(x + g, y - bladeH, 3, bladeH);
      }
    }
  }
}

export function atmosphereTintForWeather(weather: string): string | null {
  switch (weather) {
    case 'CAVE':
    case 'TOMB':
      return 'rgba(8, 12, 40, 0.14)';
    case 'RAIN':
      return 'rgba(30, 41, 59, 0.12)';
    case 'SEA':
      return 'rgba(14, 116, 144, 0.10)';
    case 'SPACE':
      return 'rgba(15, 23, 42, 0.08)';
    case 'ARCTIC':
      return 'rgba(147, 197, 253, 0.08)';
    case 'SUNNY':
    case 'TRAIN':
      return 'rgba(255, 250, 220, 0.06)';
    default:
      return null;
  }
}
