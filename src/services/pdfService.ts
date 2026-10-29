import { PDFDocument, PageSizes } from 'pdf-lib';

/**
 * Merge multiple PDF blobs into a single PDF blob.
 */
export async function mergePDFs(pdfBlobs: Blob[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (const blob of pdfBlobs) {
    const arrayBuffer = await blob.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();
  return new Blob([mergedPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Parse page ranges string (e.g., "1, 3-5, 8") into 0-indexed page numbers.
 */
export function parsePageRangeString(rangeStr: string, totalPages: number): number[] {
  const pages = new Set<number>();
  const parts = rangeStr.split(',').map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = Math.max(1, parseInt(startStr, 10));
      const end = Math.min(totalPages, parseInt(endStr, 10));
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let p = start; p <= end; p++) {
          pages.add(p - 1);
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        pages.add(pageNum - 1);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Format an array of 1-indexed page numbers into a clean range string (e.g. [1, 2, 3, 5] -> "1-3, 5")
 */
export function formatPageNumbersToRangeString(pages: number[]): string {
  if (pages.length === 0) return '';
  const sorted = Array.from(new Set(pages)).sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = start;

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = sorted[i];
      end = start;
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);

  return ranges.join(', ');
}

/**
 * Split/Extract specified pages from a PDF blob into a new PDF.
 */
export async function splitPDF(pdfBlob: Blob, pageRangeString: string): Promise<Blob> {
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcPdf.getPageCount();

  const selectedIndices = parsePageRangeString(pageRangeString, totalPages);
  if (selectedIndices.length === 0) {
    throw new Error('No valid pages found in the specified range.');
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(srcPdf, selectedIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const newPdfBytes = await newPdf.save();
  return new Blob([newPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Convert an array of image data URLs into a single formatted PDF.
 */
export async function imagesToPDF(
  images: { dataUrl: string }[],
  pageSize: 'A4' | 'Letter' = 'A4',
  marginPt: number = 20
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const standardSize = pageSize === 'A4' ? PageSizes.A4 : PageSizes.Letter;

  for (const imgItem of images) {
    const isPng = imgItem.dataUrl.startsWith('data:image/png');
    let embeddedImg;

    if (isPng) {
      embeddedImg = await pdfDoc.embedPng(imgItem.dataUrl);
    } else {
      // JPG or WebP converted to JPEG canvas
      embeddedImg = await pdfDoc.embedJpg(imgItem.dataUrl);
    }

    const page = pdfDoc.addPage(standardSize);
    const { width: pageWidth, height: pageHeight } = page.getSize();

    const maxW = pageWidth - marginPt * 2;
    const maxH = pageHeight - marginPt * 2;

    const imgDims = embeddedImg.scale(1);
    const scale = Math.min(maxW / imgDims.width, maxH / imgDims.height);
    const renderW = imgDims.width * scale;
    const renderH = imgDims.height * scale;

    const x = (pageWidth - renderW) / 2;
    const y = (pageHeight - renderH) / 2;

    page.drawImage(embeddedImg, {
      x,
      y,
      width: renderW,
      height: renderH
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Client-side PDF size optimization (removes unused objects and flattens streams).
 */
export async function compressPDF(pdfBlob: Blob): Promise<Blob> {
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  
  // Re-saving with useObjectStreams cleans overhead and minimizes stream buffers
  const compressedBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([compressedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Get total page count of a PDF file.
 */
export async function getPdfPageCount(pdfBlob: Blob): Promise<number> {
  try {
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    return pdfDoc.getPageCount();
  } catch (err) {
    console.error('Failed to get PDF page count:', err);
    return 1;
  }
}
