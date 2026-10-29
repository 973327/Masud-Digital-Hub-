import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Download, 
  Printer, 
  RotateCw, 
  Sliders, 
  Grid, 
  Check, 
  Sparkles, 
  Maximize2,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { downloadBlob } from '../../services/docStorage';

interface PhotoPreset {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  aspectRatio: number;
  description: string;
}

const PHOTO_PRESETS: PhotoPreset[] = [
  { id: 'in_passport', name: 'Indian Passport', widthMm: 35, heightMm: 45, aspectRatio: 35 / 45, description: '3.5 × 4.5 cm standard passport size' },
  { id: 'us_visa', name: 'US Visa / 2×2 Inch', widthMm: 51, heightMm: 51, aspectRatio: 1, description: '2 × 2 inches (51 × 51 mm) square' },
  { id: 'stamp_size', name: 'Stamp Size', widthMm: 25, heightMm: 30, aspectRatio: 25 / 30, description: '2.5 × 3.0 cm certificates & badges' },
  { id: 'pan_card', name: 'PAN / Driving License', widthMm: 25, heightMm: 35, aspectRatio: 25 / 35, description: '2.5 × 3.5 cm ID documents' },
];

export const IdPhotoStudio: React.FC = () => {
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PhotoPreset>(PHOTO_PRESETS[0]);
  const [bgColor, setBgColor] = useState<'white' | 'blue' | 'gray' | 'original'>('white');
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [sheetLayout, setSheetLayout] = useState<'4x6_8' | 'a4_32' | 'a4_16' | 'single'>('4x6_8');
  const [showCutMarks, setShowCutMarks] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const singlePhotoCanvasRef = useRef<HTMLCanvasElement>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);

  // Render individual processed photo
  useEffect(() => {
    if (!photoSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = singlePhotoCanvasRef.current;
      if (!canvas) return;

      const targetW = 420;
      const targetH = Math.round(targetW / selectedPreset.aspectRatio);
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw background if not original
      if (bgColor === 'white') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);
      } else if (bgColor === 'blue') {
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(0, 0, targetW, targetH);
      } else if (bgColor === 'gray') {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(0, 0, targetW, targetH);
      }

      // Center crop image into preset aspect ratio
      const imgAspect = img.width / img.height;
      let srcW = img.width;
      let srcH = img.height;
      let srcX = 0;
      let srcY = 0;

      if (imgAspect > selectedPreset.aspectRatio) {
        srcW = img.height * selectedPreset.aspectRatio;
        srcX = (img.width - srcW) / 2;
      } else {
        srcH = img.width / selectedPreset.aspectRatio;
        srcY = (img.height - srcH) / 2;
      }

      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);

      // Apply brightness & contrast
      const imgData = ctx.getImageData(0, 0, targetW, targetH);
      const d = imgData.data;
      const brightFactor = (brightness - 100) * 1.28;
      const contrastFactor = (259 * (contrast + 100)) / (255 * (300 - contrast));

      for (let i = 0; i < d.length; i += 4) {
        d[i] = Math.max(0, Math.min(255, contrastFactor * (d[i] + brightFactor - 128) + 128));
        d[i + 1] = Math.max(0, Math.min(255, contrastFactor * (d[i + 1] + brightFactor - 128) + 128));
        d[i + 2] = Math.max(0, Math.min(255, contrastFactor * (d[i + 2] + brightFactor - 128) + 128));
      }
      ctx.putImageData(imgData, 0, 0);

      // Now render printable multi-copy sheet
      renderPrintableSheet(canvas);
    };
    img.src = photoSrc;
  }, [photoSrc, selectedPreset, bgColor, brightness, contrast, sheetLayout, showCutMarks]);

  const renderPrintableSheet = (singleCanvas: HTMLCanvasElement) => {
    const sheetCanvas = sheetCanvasRef.current;
    if (!sheetCanvas) return;
    const ctx = sheetCanvas.getContext('2d');
    if (!ctx) return;

    if (sheetLayout === 'single') {
      sheetCanvas.width = singleCanvas.width;
      sheetCanvas.height = singleCanvas.height;
      ctx.drawImage(singleCanvas, 0, 0);
      return;
    }

    // High resolution 300 DPI sheet layouts
    let sheetW = 1200; // 4x6 inch at ~200 DPI
    let sheetH = 1800;
    let cols = 2;
    let rows = 4;

    if (sheetLayout === '4x6_8') {
      sheetW = 1200;
      sheetH = 1800;
      cols = 2;
      rows = 4;
    } else if (sheetLayout === 'a4_32') {
      sheetW = 2480; // A4 at 300 DPI
      sheetH = 3508;
      cols = 4;
      rows = 8;
    } else if (sheetLayout === 'a4_16') {
      sheetW = 2480;
      sheetH = 3508;
      cols = 4;
      rows = 4;
    }

    sheetCanvas.width = sheetW;
    sheetCanvas.height = sheetH;

    // Pure white sheet background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, sheetW, sheetH);

    const marginX = sheetW * 0.06;
    const marginY = sheetH * 0.06;
    const availW = sheetW - marginX * 2;
    const availH = sheetH - marginY * 2;

    const cellW = availW / cols;
    const cellH = availH / rows;

    const photoW = Math.min(cellW * 0.88, cellH * 0.88 * selectedPreset.aspectRatio);
    const photoH = photoW / selectedPreset.aspectRatio;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = marginX + c * cellW + (cellW - photoW) / 2;
        const cy = marginY + r * cellH + (cellH - photoH) / 2;

        ctx.drawImage(singleCanvas, cx, cy, photoW, photoH);

        // Optional cut mark border
        if (showCutMarks) {
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(cx - 2, cy - 2, photoW + 4, photoH + 4);
          ctx.setLineDash([]);
        }
      }
    }
  };

  const handleExportImage = () => {
    if (!sheetCanvasRef.current) return;
    sheetCanvasRef.current.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, `ID_Photo_${selectedPreset.id}_${sheetLayout}.png`);
      }
    }, 'image/png');
  };

  const handleExportPdf = async () => {
    if (!sheetCanvasRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = sheetCanvasRef.current.toDataURL('image/jpeg', 0.95);
      const base64 = dataUrl.split(',')[1];
      const imgBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

      const pdfDoc = await PDFDocument.create();
      const embedded = await pdfDoc.embedJpg(imgBytes);

      const pageSize = (sheetLayout === '4x6_8') ? [288, 432] : PageSizes.A4;
      const page = pdfDoc.addPage([pageSize[0], pageSize[1]]);

      page.drawImage(embedded, {
        x: 0,
        y: 0,
        width: pageSize[0],
        height: pageSize[1],
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      downloadBlob(blob, `Printable_ID_Photos_${selectedPreset.id}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  // Sample default image if none uploaded yet
  const loadSamplePhoto = () => {
    const sampleSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500" fill="%23f1f5f9"><rect width="400" height="500" fill="%23e2e8f0"/><circle cx="200" cy="190" r="85" fill="%233b82f6"/><path d="M100,380 C100,280 300,280 300,380 Z" fill="%231e3a8a"/><rect x="185" y="270" width="30" height="50" fill="%23fcd34d"/></svg>`;
    setPhotoSrc(sampleSvg);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950 px-2 py-0.5 rounded-md border border-blue-500/30">
              Photo Studio
            </span>
            <span className="text-xs text-slate-400">Passport, Visa & ID Card Layouts</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            ID Photo & Passport Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Format identity photos with exact passport dimensions, replace backgrounds, adjust lighting, and generate ready-to-print 4×6 inch or A4 multi-copy sheets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Photo Settings & Controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* Upload or Capture Card */}
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Upload Customer Photo</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-blue-50 hover:bg-blue-100/70 border border-blue-200 text-blue-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Choose Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setPhotoSrc(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <button
                onClick={loadSamplePhoto}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Load Sample</span>
              </button>
            </div>
          </div>

          {/* Preset Selector */}
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900">Identity Document Preset</h3>
            <div className="space-y-1.5">
              {PHOTO_PRESETS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPreset(p)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedPreset.id === p.id
                      ? 'bg-blue-50/70 border-blue-500 text-slate-900 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold">{p.name}</h4>
                    <p className="text-[11px] text-slate-500">{p.description}</p>
                  </div>
                  {selectedPreset.id === p.id && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Background Replacement */}
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900">Background Color</h3>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { id: 'white', label: 'White', color: '#ffffff', border: 'border-slate-300' },
                { id: 'blue', label: 'Light Blue', color: '#e0f2fe', border: 'border-sky-300' },
                { id: 'gray', label: 'Gray', color: '#f1f5f9', border: 'border-slate-300' },
                { id: 'original', label: 'Original', color: '#e2e8f0', border: 'border-slate-300' },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBgColor(b.id as any)}
                  className={`p-2 rounded-xl text-center font-bold border transition-all cursor-pointer ${
                    bgColor === b.id
                      ? 'ring-2 ring-blue-600 border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div style={{ backgroundColor: b.color }} className={`w-4 h-4 rounded-full mx-auto mb-1 border ${b.border}`} />
                  <span className="text-[10px]">{b.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Printable Sheet Configuration */}
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Printable Layout</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setSheetLayout('4x6_8')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-colors cursor-pointer ${
                  sheetLayout === '4x6_8' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span>4×6" Sheet (8 Copies)</span>
                <span className="block text-[10px] opacity-80">Photo Lab Standard</span>
              </button>
              <button
                onClick={() => setSheetLayout('a4_32')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-colors cursor-pointer ${
                  sheetLayout === 'a4_32' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span>A4 Sheet (32 Copies)</span>
                <span className="block text-[10px] opacity-80">Full Page Layout</span>
              </button>
              <button
                onClick={() => setSheetLayout('a4_16')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-colors cursor-pointer ${
                  sheetLayout === 'a4_16' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span>A4 Sheet (16 Copies)</span>
                <span className="block text-[10px] opacity-80">Spaced Printout</span>
              </button>
              <button
                onClick={() => setSheetLayout('single')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-colors cursor-pointer ${
                  sheetLayout === 'single' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span>Single Photo</span>
                <span className="block text-[10px] opacity-80">Individual file</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="font-semibold text-slate-700">Dotted Cut Border Lines</span>
              <input
                type="checkbox"
                checked={showCutMarks}
                onChange={(e) => setShowCutMarks(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Sheet Preview & Export */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Live Print Layout Preview</h3>
              <span className="text-[11px] font-semibold text-slate-500">
                {sheetLayout === '4x6_8' ? '4×6 Inch Sheet (8 photos)' : sheetLayout === 'a4_32' ? 'A4 Sheet (32 photos)' : 'Print View'}
              </span>
            </div>

            {/* Hidden Single Photo Canvas */}
            <canvas ref={singlePhotoCanvasRef} className="hidden" />

            {/* Live Sheet Canvas */}
            <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center min-h-[380px]">
              {photoSrc ? (
                <canvas
                  ref={sheetCanvasRef}
                  className="max-h-[55vh] object-contain rounded-lg shadow-md border border-slate-300 bg-white"
                />
              ) : (
                <div className="text-center p-8 space-y-2 text-slate-400">
                  <ImageIcon className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">Upload a customer portrait photo or click "Load Sample" to begin.</p>
                </div>
              )}
            </div>

            {/* Export Buttons */}
            {photoSrc && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={handleExportImage}
                  className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>Download High-Res Image (PNG)</span>
                </button>
                <button
                  onClick={handleExportPdf}
                  disabled={isExporting}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isExporting ? 'Generating...' : 'Print Ready PDF'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
