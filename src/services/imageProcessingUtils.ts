import { Point, QuadCorners, DocumentFilterType } from '../types/docScanner';

/**
 * Approximate default corners inside an image with 5% margin
 */
export function getDefaultCorners(width: number, height: number): QuadCorners {
  const marginX = width * 0.05;
  const marginY = height * 0.05;
  return {
    topLeft: { x: marginX, y: marginY },
    topRight: { x: width - marginX, y: marginY },
    bottomRight: { x: width - marginX, y: height - marginY },
    bottomLeft: { x: marginX, y: height - marginY },
  };
}

/**
 * Fast client-side document corner detection using edge gradient analysis
 */
export function detectDocumentCorners(
  img: HTMLImageElement | HTMLCanvasElement,
  fallbackMarginPercent: number = 0.06
): QuadCorners {
  const width = 'naturalWidth' in img ? img.naturalWidth : img.width;
  const height = 'naturalHeight' in img ? img.naturalHeight : img.height;

  if (width <= 0 || height <= 0) {
    return getDefaultCorners(800, 1100);
  }

  // Create downscaled canvas for fast edge detection
  const scale = Math.min(1, 400 / Math.max(width, height));
  const sw = Math.round(width * scale);
  const sh = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d');
  if (!ctx) return getDefaultCorners(width, height);

  ctx.drawImage(img, 0, 0, sw, sh);
  const imgData = ctx.getImageData(0, 0, sw, sh);
  const data = imgData.data;

  // Compute horizontal and vertical luminance gradients
  let minX = sw, maxX = 0, minY = sh, maxY = 0;
  let threshold = 30; // edge threshold

  for (let y = 1; y < sh - 1; y += 2) {
    for (let x = 1; x < sw - 1; x += 2) {
      const idx = (y * sw + x) * 4;
      const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      
      const rightIdx = (y * sw + (x + 1)) * 4;
      const rightGray = 0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2];
      
      const downIdx = ((y + 1) * sw + x) * 4;
      const downGray = 0.299 * data[downIdx] + 0.587 * data[downIdx + 1] + 0.114 * data[downIdx + 2];

      const diff = Math.abs(gray - rightGray) + Math.abs(gray - downGray);
      if (diff > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Verify if detected boundary is meaningful
  const boxWidth = maxX - minX;
  const boxHeight = maxY - minY;
  if (boxWidth > sw * 0.35 && boxHeight > sh * 0.35) {
    const invScale = 1 / scale;
    return {
      topLeft: { x: Math.max(0, minX * invScale), y: Math.max(0, minY * invScale) },
      topRight: { x: Math.min(width, maxX * invScale), y: Math.max(0, minY * invScale) },
      bottomRight: { x: Math.min(width, maxX * invScale), y: Math.min(height, maxY * invScale) },
      bottomLeft: { x: Math.max(0, minX * invScale), y: Math.min(height, maxY * invScale) },
    };
  }

  return getDefaultCorners(width, height);
}

/**
 * Perspective warp from quadrilateral corners to flat rectangular canvas
 * Uses triangle subdivision texture mapping on HTML5 canvas.
 */
export function warpPerspectiveCanvas(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  corners: QuadCorners,
  targetWidth?: number,
  targetHeight?: number
): HTMLCanvasElement {
  // Calculate reasonable target dimensions based on corner distances
  const topDist = Math.hypot(corners.topRight.x - corners.topLeft.x, corners.topRight.y - corners.topLeft.y);
  const botDist = Math.hypot(corners.bottomRight.x - corners.bottomLeft.x, corners.bottomRight.y - corners.bottomLeft.y);
  const leftDist = Math.hypot(corners.bottomLeft.x - corners.topLeft.x, corners.bottomLeft.y - corners.topLeft.y);
  const rightDist = Math.hypot(corners.bottomRight.x - corners.topRight.x, corners.bottomRight.y - corners.topRight.y);

  const outWidth = Math.round(targetWidth || Math.max(topDist, botDist, 600));
  const outHeight = Math.round(targetHeight || Math.max(leftDist, rightDist, 800));

  const outCanvas = document.createElement('canvas');
  outCanvas.width = outWidth;
  outCanvas.height = outHeight;
  const ctx = outCanvas.getContext('2d');
  if (!ctx) return outCanvas;

  // Subdivide quad into fine mesh triangles for high-precision perspective transformation
  const steps = 16;
  const src = sourceImage;

  for (let y = 0; y < steps; y++) {
    for (let x = 0; x < steps; x++) {
      const u0 = x / steps;
      const v0 = y / steps;
      const u1 = (x + 1) / steps;
      const v1 = (y + 1) / steps;

      // Destination points on flat rectangular grid
      const dx0 = u0 * outWidth;
      const dy0 = v0 * outHeight;
      const dx1 = u1 * outWidth;
      const dy1 = v1 * outHeight;

      // Source bilinear interpolation points
      const p00 = bilinearPoint(corners, u0, v0);
      const p10 = bilinearPoint(corners, u1, v0);
      const p01 = bilinearPoint(corners, u0, v1);
      const p11 = bilinearPoint(corners, u1, v1);

      // Render upper triangle
      renderTriangle(ctx, src, p00, p10, p01, dx0, dy0, dx1, dy0, dx0, dy1);
      // Render lower triangle
      renderTriangle(ctx, src, p10, p11, p01, dx1, dy0, dx1, dy1, dx0, dy1);
    }
  }

  return outCanvas;
}

function bilinearPoint(corners: QuadCorners, u: number, v: number): Point {
  const topX = corners.topLeft.x + (corners.topRight.x - corners.topLeft.x) * u;
  const topY = corners.topLeft.y + (corners.topRight.y - corners.topLeft.y) * u;
  const botX = corners.bottomLeft.x + (corners.bottomRight.x - corners.bottomLeft.x) * u;
  const botY = corners.bottomLeft.y + (corners.bottomRight.y - corners.bottomLeft.y) * u;

  return {
    x: topX + (botX - topX) * v,
    y: topY + (botY - topY) * v,
  };
}

function renderTriangle(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  s0: Point, s1: Point, s2: Point,
  d0x: number, d0y: number,
  d1x: number, d1y: number,
  d2x: number, d2y: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(d0x, d0y);
  ctx.lineTo(d1x, d1y);
  ctx.lineTo(d2x, d2y);
  ctx.closePath();
  ctx.clip();

  // Compute affine transform matrix mapping (s0, s1, s2) to (d0, d1, d2)
  const denom = (s0.x * (s1.y - s2.y) - s1.x * (s0.y - s2.y) + s2.x * (s0.y - s1.y));
  if (Math.abs(denom) > 1e-6) {
    const a = (d0x * (s1.y - s2.y) - d1x * (s0.y - s2.y) + d2x * (s0.y - s1.y)) / denom;
    const b = (d0y * (s1.y - s2.y) - d1y * (s0.y - s2.y) + d2y * (s0.y - s1.y)) / denom;
    const c = (s0.x * (d1x - d2x) - s1.x * (d0x - d2x) + s2.x * (d0x - d1x)) / denom;
    const d = (s0.x * (d1y - d2y) - s1.x * (d0y - d2y) + s2.x * (d0y - d1y)) / denom;
    const e = (s0.x * (s1.y * d2x - s2.y * d1x) - s1.x * (s0.y * d2x - s2.y * d0x) + s2.x * (s0.y * d1x - s1.y * d0x)) / denom;
    const f = (s0.x * (s1.y * d2y - s2.y * d1y) - s1.x * (s0.y * d2y - s2.y * d0y) + s2.x * (s0.y * d1y - s1.y * d0y)) / denom;

    ctx.transform(a, b, c, d, e, f);
    ctx.drawImage(img, 0, 0);
  }

  ctx.restore();
}

/**
 * Apply scanning filter (Original, Magic Color, Grayscale, B&W threshold)
 */
export function applyDocumentFilter(
  inputCanvas: HTMLCanvasElement,
  filterType: DocumentFilterType,
  brightness: number = 100, // 0 to 200, 100 is default
  contrast: number = 100    // 0 to 200, 100 is default
): HTMLCanvasElement {
  const w = inputCanvas.width;
  const h = inputCanvas.height;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return inputCanvas;

  ctx.drawImage(inputCanvas, 0, 0);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const brightFactor = (brightness - 100) * 1.28; // -128 to +128
  const contrastFactor = (259 * (contrast + 100)) / (255 * (300 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Apply brightness
    r += brightFactor;
    g += brightFactor;
    b += brightFactor;

    // Apply contrast
    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    // Filter-specific processing
    if (filterType === 'color') {
      // Magic Color: boost saturation and push light greys towards white
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum > 175) {
        // Lighten paper background
        const boost = (lum - 175) * 0.7;
        r += boost;
        g += boost;
        b += boost;
      } else {
        // Deepen text ink
        r *= 0.92;
        g *= 0.92;
        b *= 0.92;
      }
    } else if (filterType === 'grayscale') {
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      r = gray;
      g = gray;
      b = gray;
    } else if (filterType === 'bw') {
      // Clean B&W Document Threshold
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      // Adaptive dynamic thresholding around ~138
      const val = gray > 138 ? 255 : 0;
      r = val;
      g = val;
      b = val;
    }

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Rotate canvas by 90, 180, or 270 degrees
 */
export function rotateCanvas(canvas: HTMLCanvasElement, degrees: number): HTMLCanvasElement {
  const normDeg = ((degrees % 360) + 360) % 360;
  if (normDeg === 0) return canvas;

  const out = document.createElement('canvas');
  const ctx = out.getContext('2d');
  if (!ctx) return canvas;

  if (normDeg === 90 || normDeg === 270) {
    out.width = canvas.height;
    out.height = canvas.width;
  } else {
    out.width = canvas.width;
    out.height = canvas.height;
  }

  ctx.translate(out.width / 2, out.height / 2);
  ctx.rotate((normDeg * Math.PI) / 180);
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

  return out;
}

/**
 * Helper to convert Blob or File to HTMLImageElement
 */
export function loadImageFromFile(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
