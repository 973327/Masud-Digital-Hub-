import { PDFDocument, rgb, degrees, StandardFonts, PageSizes } from 'pdf-lib';

/**
 * 1. Convert an array of Image Files/Blobs to a single PDF
 */
export async function imagesToPdf(
  imageBlobs: { blob: Blob; fileName?: string }[],
  options: {
    margin: 'none' | 'small' | 'standard';
    pageSize: 'a4' | 'fit';
    orientation: 'portrait' | 'landscape' | 'auto';
  }
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  for (const item of imageBlobs) {
    const arrayBuffer = await item.blob.arrayBuffer();
    const isJpg = item.blob.type.includes('jpeg') || item.blob.type.includes('jpg');

    let embeddedImage;
    if (isJpg) {
      embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
    } else {
      embeddedImage = await pdfDoc.embedPng(arrayBuffer);
    }

    const { width: imgW, height: imgH } = embeddedImage;
    let marginPx = options.margin === 'none' ? 0 : options.margin === 'small' ? 18 : 36;

    let pageW = PageSizes.A4[0];
    let pageH = PageSizes.A4[1];

    if (options.orientation === 'landscape' || (options.orientation === 'auto' && imgW > imgH)) {
      pageW = PageSizes.A4[1];
      pageH = PageSizes.A4[0];
    }

    if (options.pageSize === 'fit') {
      pageW = imgW + marginPx * 2;
      pageH = imgH + marginPx * 2;
    }

    const page = pdfDoc.addPage([pageW, pageH]);
    const maxW = pageW - marginPx * 2;
    const maxH = pageH - marginPx * 2;

    const scale = Math.min(maxW / imgW, maxH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;

    const x = marginPx + (maxW - drawW) / 2;
    const y = marginPx + (maxH - drawH) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawW,
      height: drawH,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * 2. Merge multiple PDF files into one
 */
export async function mergePdfFiles(pdfFiles: Blob[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (const file of pdfFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
    copiedPages.forEach((p) => mergedPdf.addPage(p));
  }

  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * 3. Split PDF into selected page subsets
 */
export async function splitPdfPages(
  pdfBlob: Blob,
  pagesToKeep1Indexed: number[]
): Promise<Blob> {
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const total = sourcePdf.getPageCount();

  const newPdf = await PDFDocument.create();
  const indices0 = pagesToKeep1Indexed
    .map(p => p - 1)
    .filter(i => i >= 0 && i < total);

  if (indices0.length === 0) {
    throw new Error('No valid pages selected for split');
  }

  const copied = await newPdf.copyPages(sourcePdf, indices0);
  copied.forEach(p => newPdf.addPage(p));

  const pdfBytes = await newPdf.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * 4. Reorder and Delete pages in PDF
 */
export async function reorderAndDeletePdfPages(
  pdfBlob: Blob,
  newOrder1Indexed: number[]
): Promise<Blob> {
  return splitPdfPages(pdfBlob, newOrder1Indexed);
}

/**
 * 5. Rotate PDF pages by 90, 180, 270 degrees
 */
export async function rotatePdfPages(
  pdfBlob: Blob,
  angleDeg: 90 | 180 | 270,
  pageIndices0Indexed?: number[]
): Promise<Blob> {
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const count = pdfDoc.getPageCount();

  const targets = pageIndices0Indexed && pageIndices0Indexed.length > 0
    ? pageIndices0Indexed
    : Array.from({ length: count }, (_, i) => i);

  for (const idx of targets) {
    if (idx >= 0 && idx < count) {
      const page = pdfDoc.getPage(idx);
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + angleDeg) % 360));
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * 6. Add Page Numbers to PDF
 */
export async function addPageNumbersToPdf(
  pdfBlob: Blob,
  options: {
    format: 'X' | 'Page X of Y';
    position: 'bottom-center' | 'bottom-right' | 'top-right';
    fontSize?: number;
  }
): Promise<Blob> {
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const count = pdfDoc.getPageCount();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const size = options.fontSize || 10;

  for (let i = 0; i < count; i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();
    const text = options.format === 'Page X of Y' 
      ? `Page ${i + 1} of ${count}` 
      : `${i + 1}`;

    const textWidth = font.widthOfTextAtSize(text, size);

    let x = width / 2 - textWidth / 2;
    let y = 24;

    if (options.position === 'bottom-right') {
      x = width - textWidth - 36;
      y = 24;
    } else if (options.position === 'top-right') {
      x = width - textWidth - 36;
      y = height - 36;
    }

    page.drawText(text, {
      x,
      y,
      size,
      font,
      color: rgb(0.3, 0.35, 0.4),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * 7. Add Watermark / Text to PDF
 */
export async function addWatermarkToPdf(
  pdfBlob: Blob,
  watermarkText: string,
  options: {
    opacity?: number;
    rotation?: number;
    fontSize?: number;
    color?: 'gray' | 'red' | 'blue';
  }
): Promise<Blob> {
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const count = pdfDoc.getPageCount();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = options.fontSize || 42;
  const rot = options.rotation !== undefined ? options.rotation : 45;
  const opacity = options.opacity || 0.18;

  let textColor = rgb(0.5, 0.5, 0.5);
  if (options.color === 'red') textColor = rgb(0.9, 0.2, 0.2);
  if (options.color === 'blue') textColor = rgb(0.15, 0.35, 0.85);

  for (let i = 0; i < count; i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    page.drawText(watermarkText, {
      x: width / 2 - (textWidth / 2) * Math.cos((rot * Math.PI) / 180),
      y: height / 2 - (textHeight / 2),
      size: fontSize,
      font,
      color: textColor,
      opacity,
      rotate: degrees(rot),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * 8. Add Signature to PDF Page
 */
export async function addSignatureToPdf(
  pdfBlob: Blob,
  signaturePngDataUrl: string,
  options: {
    pageNumber1Indexed: number;
    xRatio: number; // 0 to 1 across width
    yRatio: number; // 0 to 1 across height
    widthPx?: number;
  }
): Promise<Blob> {
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  const pageIdx = Math.max(0, Math.min(options.pageNumber1Indexed - 1, pdfDoc.getPageCount() - 1));
  const page = pdfDoc.getPage(pageIdx);
  const { width, height } = page.getSize();

  const base64 = signaturePngDataUrl.split(',')[1];
  const sigBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const embeddedSig = await pdfDoc.embedPng(sigBytes);

  const sigWidth = options.widthPx || 120;
  const sigHeight = (embeddedSig.height / embeddedSig.width) * sigWidth;

  const posX = options.xRatio * width;
  const posY = options.yRatio * height;

  page.drawImage(embeddedSig, {
    x: posX,
    y: posY,
    width: sigWidth,
    height: sigHeight,
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * 9. Convert Text / Markdown file content to PDF
 */
export async function convertTextDocToPdf(title: string, textContent: string): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const a4W = PageSizes.A4[0];
  const a4H = PageSizes.A4[1];
  const margin = 50;
  const contentWidth = a4W - margin * 2;
  const lineHeight = 16;
  const fontSize = 11;

  let currentPage = pdfDoc.addPage([a4W, a4H]);
  let currentY = a4H - margin;

  // Title
  currentPage.drawText(title, {
    x: margin,
    y: currentY,
    size: 18,
    font: fontBold,
    color: rgb(0.08, 0.12, 0.2),
  });
  currentY -= 30;

  // Horizontal divider
  currentPage.drawLine({
    start: { x: margin, y: currentY },
    end: { x: a4W - margin, y: currentY },
    thickness: 1,
    color: rgb(0.8, 0.85, 0.9),
  });
  currentY -= 20;

  // Wrap text
  const paragraphs = textContent.split(/\r?\n/);
  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      currentY -= lineHeight * 0.75;
      continue;
    }

    const words = paragraph.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = fontRegular.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > contentWidth) {
        if (currentY <= margin + 20) {
          currentPage = pdfDoc.addPage([a4W, a4H]);
          currentY = a4H - margin;
        }
        currentPage.drawText(currentLine, {
          x: margin,
          y: currentY,
          size: fontSize,
          font: fontRegular,
          color: rgb(0.2, 0.25, 0.3),
        });
        currentY -= lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      if (currentY <= margin + 20) {
        currentPage = pdfDoc.addPage([a4W, a4H]);
        currentY = a4H - margin;
      }
      currentPage.drawText(currentLine, {
        x: margin,
        y: currentY,
        size: fontSize,
        font: fontRegular,
        color: rgb(0.2, 0.25, 0.3),
      });
      currentY -= lineHeight;
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * 10. Inspect PDF page count & metadata
 */
export async function getPdfInfo(pdfBlob: Blob): Promise<{ pageCount: number; title?: string }> {
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return {
    pageCount: pdfDoc.getPageCount(),
    title: pdfDoc.getTitle(),
  };
}
