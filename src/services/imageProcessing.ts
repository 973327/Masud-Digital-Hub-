/**
 * Real client-side image processing utility for Cyber Cafe Tools.
 * Uses HTML5 2D Canvas and pixel-level manipulation without external paid APIs.
 */

export interface ImageAdjustments {
  brightness: number; // 0 to 200, default 100
  contrast: number;   // 0 to 200, default 100
  sharpness: number;  // 0 to 100, default 0
  saturation: number; // 0 to 200, default 100
  exposure: number;   // -100 to 100, default 0
  temperature: number;// -100 to 100, default 0
  rotation: number;   // -45 to 45 or 0, 90, 180, 270
}

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 100,
  contrast: 100,
  sharpness: 0,
  saturation: 100,
  exposure: 0,
  temperature: 0,
  rotation: 0
};

/**
 * Apply 3x3 convolution kernel to ImageData
 */
export function applyConvolution(
  imageData: ImageData,
  kernel: number[],
  weight: number = 1
): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const output = new ImageData(width, height);
  const dst = output.data;

  const half = 1; // 3x3 kernel half-size

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;

      for (let ky = -half; ky <= half; ky++) {
        for (let kx = -half; kx <= half; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const py = Math.min(height - 1, Math.max(0, y + ky));
          const srcIdx = (py * width + px) * 4;
          const kVal = kernel[(ky + half) * 3 + (kx + half)];

          r += src[srcIdx] * kVal;
          g += src[srcIdx + 1] * kVal;
          b += src[srcIdx + 2] * kVal;
        }
      }

      const dstIdx = (y * width + x) * 4;
      dst[dstIdx] = Math.min(255, Math.max(0, Math.round(r / weight)));
      dst[dstIdx + 1] = Math.min(255, Math.max(0, Math.round(g / weight)));
      dst[dstIdx + 2] = Math.min(255, Math.max(0, Math.round(b / weight)));
      dst[dstIdx + 3] = src[dstIdx + 3]; // keep alpha
    }
  }

  return output;
}

/**
 * Sharpen an image using an unsharp mask convolution kernel
 * amount: 0 to 100
 */
export function sharpenImageData(imageData: ImageData, amount: number): ImageData {
  if (amount <= 0) return imageData;

  // Normalized sharpness factor (amount 50 -> alpha ~ 0.5)
  const alpha = (amount / 100) * 1.2;
  const center = 1 + 4 * alpha;
  const edge = -alpha;

  const kernel = [
    0, edge, 0,
    edge, center, edge,
    0, edge, 0
  ];

  return applyConvolution(imageData, kernel, 1);
}

/**
 * Apply color, brightness, contrast, temperature and exposure adjustments
 */
export function applyAdjustmentsToImageData(
  imageData: ImageData,
  adjustments: ImageAdjustments
): ImageData {
  const data = imageData.data;
  const len = data.length;

  const bOffset = (adjustments.brightness - 100) * 2.55;
  const expFactor = Math.pow(2, adjustments.exposure / 50); // exposure multiplier
  const contrastFactor = adjustments.contrast === 100
    ? 1
    : (259 * ((adjustments.contrast - 100) * 2.55 + 255)) / (255 * (259 - (adjustments.contrast - 100) * 2.55));
  const satFactor = adjustments.saturation / 100;
  const tempOffset = adjustments.temperature * 0.8; // warm vs cool

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. Exposure
    if (adjustments.exposure !== 0) {
      r *= expFactor;
      g *= expFactor;
      b *= expFactor;
    }

    // 2. Brightness
    if (adjustments.brightness !== 100) {
      r += bOffset;
      g += bOffset;
      b += bOffset;
    }

    // 3. Contrast
    if (adjustments.contrast !== 100) {
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
    }

    // 4. Saturation
    if (adjustments.saturation !== 100) {
      const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * satFactor;
      g = gray + (g - gray) * satFactor;
      b = gray + (b - gray) * satFactor;
    }

    // 5. Temperature (Warmth)
    if (adjustments.temperature !== 0) {
      r += tempOffset;
      b -= tempOffset;
    }

    data[i] = Math.min(255, Math.max(0, Math.round(r)));
    data[i + 1] = Math.min(255, Math.max(0, Math.round(g)));
    data[i + 2] = Math.min(255, Math.max(0, Math.round(b)));
  }

  // Apply sharpness if requested
  if (adjustments.sharpness > 0) {
    return sharpenImageData(imageData, adjustments.sharpness);
  }

  return imageData;
}

/**
 * Clean & Whiten Signature paper background.
 * Thresholds off-white / yellowish paper, preserving dark ink.
 */
export function cleanSignatureImageData(
  imageData: ImageData,
  threshold: number = 185,
  inkDarkness: number = 1.3
): ImageData {
  const data = imageData.data;
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Perceived luminance
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (lum >= threshold) {
      // Paper background -> turn into crisp pure white
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    } else {
      // Ink stroke -> boost contrast and deepen
      const darkened = Math.max(0, lum * (1 / inkDarkness));
      // Detect if blue ink was used
      const isBlueInk = b > r + 20 && b > g + 10;
      if (isBlueInk) {
        data[i] = Math.max(0, r * 0.7);
        data[i + 1] = Math.max(0, g * 0.7);
        data[i + 2] = Math.min(255, b * 1.1);
      } else {
        // Black / dark ink
        data[i] = Math.round(darkened);
        data[i + 1] = Math.round(darkened);
        data[i + 2] = Math.round(darkened);
      }
    }
  }

  return imageData;
}

/**
 * Binary search target KB compression algorithm.
 * Guarantees output file is close to or under the target KB limit.
 */
export async function compressCanvasToTargetKB(
  canvas: HTMLCanvasElement,
  targetKB: number,
  format: 'image/jpeg' | 'image/webp' | 'image/png' = 'image/jpeg'
): Promise<{
  blob: Blob;
  dataUrl: string;
  actualKB: number;
  quality: number;
}> {
  if (format === 'image/png') {
    // PNG is lossless; convert directly
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/png');
    });
    const actualKB = Math.round((blob.size / 1024) * 10) / 10;
    const dataUrl = await blobToDataUrl(blob);
    return { blob, dataUrl, actualKB, quality: 1.0 };
  }

  const targetBytes = targetKB * 1024;
  let minQ = 0.05;
  let maxQ = 0.98;
  let bestBlob: Blob | null = null;
  let bestQuality = 0.85;

  // Initial check at max quality
  const testBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b || new Blob()), format, maxQ);
  });

  if (testBlob.size <= targetBytes) {
    const actualKB = Math.round((testBlob.size / 1024) * 10) / 10;
    const dataUrl = await blobToDataUrl(testBlob);
    return { blob: testBlob, dataUrl, actualKB, quality: maxQ };
  }

  // Binary search for quality
  for (let step = 0; step < 7; step++) {
    const midQ = (minQ + maxQ) / 2;
    const currentBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), format, midQ);
    });

    if (currentBlob.size <= targetBytes) {
      bestBlob = currentBlob;
      bestQuality = midQ;
      // Try to get higher quality while staying under limit
      minQ = midQ;
    } else {
      maxQ = midQ;
    }
  }

  // If even lowest quality is larger than targetKB, proportionally downsample canvas resolution
  if (!bestBlob || bestBlob.size > targetBytes) {
    const scale = Math.sqrt(targetBytes / testBlob.size) * 0.9;
    const scaledWidth = Math.max(50, Math.floor(canvas.width * scale));
    const scaledHeight = Math.max(50, Math.floor(canvas.height * scale));

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = scaledWidth;
    tempCanvas.height = scaledHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, 0, scaledWidth, scaledHeight);
      return compressCanvasToTargetKB(tempCanvas, targetKB, format);
    }
  }

  const finalBlob = bestBlob || testBlob;
  const actualKB = Math.round((finalBlob.size / 1024) * 10) / 10;
  const dataUrl = await blobToDataUrl(finalBlob);

  return {
    blob: finalBlob,
    dataUrl,
    actualKB,
    quality: bestQuality
  };
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Format bytes to readable string (e.g. 45.2 KB or 1.8 MB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}
