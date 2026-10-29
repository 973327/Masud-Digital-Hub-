import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  CreditCard, 
  Upload, 
  Download, 
  Printer, 
  Layers, 
  Scissors, 
  RotateCw, 
  Check, 
  AlertCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { imagesToPDF } from '../../services/pdfService';

// Sample placeholder cards
const SAMPLE_FRONT = 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80';
const SAMPLE_BACK = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';

interface IDCardLayoutToolProps {
  onNavigateBack: () => void;
  lang?: 'en' | 'bn';
}

export const IDCardLayoutTool: React.FC<IDCardLayoutToolProps> = ({
  onNavigateBack,
  lang = 'en'
}) => {
  const [frontImage, setFrontImage] = useState<string | null>(SAMPLE_FRONT);
  const [backImage, setBackImage] = useState<string | null>(SAMPLE_BACK);

  // Settings
  const [paperFormat, setPaperFormat] = useState<'A4' | '4x6'>('A4');
  const [arrangement, setArrangement] = useState<'horizontal' | 'vertical'>('horizontal');
  const [showCutMarks, setShowCutMarks] = useState<boolean>(true);
  const [showBorders, setShowBorders] = useState<boolean>(true);
  const [spacingMm, setSpacingMm] = useState<number>(10); // 10mm between cards
  const [laminateMargin, setLaminateMargin] = useState<boolean>(true); // extra border for pouch lamination

  // Export
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // CR80 Standard ID Card dimensions: 85.6mm x 53.98mm (~8.56cm x 5.4cm)
  // At 300 DPI: 1mm = 11.81 pixels
  // Card width = 1011 px, Card height = 638 px
  const CARD_WIDTH_PX = 1011;
  const CARD_HEIGHT_PX = 638;

  const renderIDSheet = useCallback(async () => {
    if (!frontImage && !backImage) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 300 DPI sheet sizes
    const sheetW = paperFormat === 'A4' ? 2480 : 1200;
    const sheetH = paperFormat === 'A4' ? 3508 : 1800;

    canvas.width = sheetW;
    canvas.height = sheetH;

    // Clean white paper
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, sheetW, sheetH);

    const spacingPx = Math.round(spacingMm * 11.81);

    // Load images
    const loadImg = (src: string | null) =>
      new Promise<HTMLImageElement | null>((res) => {
        if (!src) return res(null);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => res(img);
        img.onerror = () => res(null);
        img.src = src;
      });

    const [imgFront, imgBack] = await Promise.all([loadImg(frontImage), loadImg(backImage)]);

    const cw = CARD_WIDTH_PX;
    const ch = CARD_HEIGHT_PX;

    let startX = 0;
    let startY = 0;

    if (arrangement === 'horizontal') {
      // Side by side
      const totalW = cw * 2 + spacingPx;
      startX = Math.max(40, (sheetW - totalW) / 2);
      startY = Math.max(60, (sheetH - ch) / 3); // top third of page

      // Draw Front
      if (imgFront) {
        ctx.drawImage(imgFront, startX, startY, cw, ch);
        drawCardBordersAndMarks(ctx, startX, startY, cw, ch, 'FRONT SIDE');
      }

      // Draw Back
      const backX = startX + cw + spacingPx;
      if (imgBack) {
        ctx.drawImage(imgBack, backX, startY, cw, ch);
        drawCardBordersAndMarks(ctx, backX, startY, cw, ch, 'BACK SIDE');
      }
    } else {
      // Vertical stacked (one below the other)
      const totalH = ch * 2 + spacingPx;
      startX = Math.max(40, (sheetW - cw) / 2);
      startY = Math.max(60, (sheetH - totalH) / 3);

      // Draw Front
      if (imgFront) {
        ctx.drawImage(imgFront, startX, startY, cw, ch);
        drawCardBordersAndMarks(ctx, startX, startY, cw, ch, 'FRONT SIDE');
      }

      // Draw Back
      const backY = startY + ch + spacingPx;
      if (imgBack) {
        ctx.drawImage(imgBack, startX, backY, cw, ch);
        drawCardBordersAndMarks(ctx, startX, backY, cw, ch, 'BACK SIDE');
      }
    }

    // Sheet Title / Footer
    ctx.fillStyle = '#64748b';
    ctx.font = '24px sans-serif';
    ctx.fillText(
      `Masud Digital Hub • ID Card Print Layout • Standard CR80 Size (8.56cm x 5.40cm) • ${paperFormat} Page`,
      50,
      sheetH - 40
    );

    const url = canvas.toDataURL('image/jpeg', 0.95);
    setSheetUrl(url);
  }, [frontImage, backImage, paperFormat, arrangement, spacingMm, showCutMarks, showBorders]);

  const drawCardBordersAndMarks = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string
  ) => {
    // 1. Subtle card border
    if (showBorders) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
    }

    // 2. Cutting Marks
    if (showCutMarks) {
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      const tick = 18;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(x - tick, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y - tick);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(x + w + tick, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y - tick);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(x - tick, y + h);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x, y + h + tick);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(x + w + tick, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y + h + tick);
      ctx.stroke();
    }

    // Quiet label above card
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(label, x + 5, y - 8);
  };

  useEffect(() => {
    renderIDSheet();
  }, [renderIDSheet]);

  // Upload handlers
  const handleUploadFront = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFrontImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUploadBack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBackImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Direct Print
  const handlePrint = () => {
    if (!sheetUrl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print ID Card Layout</title>
          <style>
            @page { size: auto; margin: 0mm; }
            body { margin: 0; display: flex; justify-content: center; align-items: center; background: white; }
            img { max-width: 100vw; max-height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${sheetUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    if (!sheetUrl) return;
    setIsExportingPdf(true);
    try {
      const pdfBlob = await imagesToPDF([{ dataUrl: sheetUrl }], paperFormat === 'A4' ? 'A4' : 'Letter');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ID_Card_Print_${paperFormat}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateBack}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
          >
            ← {lang === 'bn' ? 'ড্যাশবোর্ড' : 'All Tools'}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {lang === 'bn' ? 'আইডি কার্ড প্রিন্ট লেআউট' : 'ID Card Print Layout'}
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                CR80 Standard (8.56cm x 5.40cm)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? 'আধার, ভোটার বা প্যান কার্ডের দুই পিঠ পাশাপাশি বা উপরে-নিচে সাজিয়ে প্রিন্ট বা পিডিএফ নিন'
                : 'Arrange front & back sides of Aadhaar, Voter, PAN, or Student ID on A4 or 4x6 paper for laminating.'}
            </p>
          </div>
        </div>
      </div>

      {/* Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
        {/* Left: Live Printable Sheet Preview */}
        <div className="lg:col-span-7 p-6 bg-slate-900 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between text-xs pb-3 border-b border-white/10 text-white">
            <span className="font-semibold text-emerald-400">Printable Page Preview</span>
            <span className="text-white/60 font-mono text-[11px]">{paperFormat} Sheet · 300 DPI</span>
          </div>

          <div className="my-auto py-4 flex flex-col items-center">
            {sheetUrl ? (
              <div className="max-h-[380px] bg-white rounded-lg shadow-2xl overflow-hidden border border-white/20">
                <img src={sheetUrl} alt="ID Card Layout" className="max-h-[380px] object-contain" />
              </div>
            ) : (
              <div className="p-12 text-white/50 text-xs">Generating layout...</div>
            )}
          </div>

          <div className="w-full text-center text-white/50 text-[11px] pt-3 border-t border-white/10">
            Dashed ticks indicate exact scissor lines for standard pouch lamination.
          </div>
        </div>

        {/* Right: Upload Cards & Configuration */}
        <div className="lg:col-span-5 p-5 flex flex-col justify-between space-y-5 overflow-y-auto max-h-[600px]">
          <div className="space-y-4">
            {/* 1. Upload Front & Back */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                {lang === 'bn' ? 'কার্ডের সামনের ও পেছনের দিক আপলোড' : 'Upload Card Sides'}
              </label>

              <div className="grid grid-cols-2 gap-2">
                {/* Front Side */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                  <div className="text-xs font-bold text-slate-700">1. Front Side</div>
                  <button
                    onClick={() => frontInputRef.current?.click()}
                    className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Front</span>
                  </button>
                  <input
                    ref={frontInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadFront}
                    className="hidden"
                  />
                </div>

                {/* Back Side */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                  <div className="text-xs font-bold text-slate-700">2. Back Side</div>
                  <button
                    onClick={() => backInputRef.current?.click()}
                    className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Back</span>
                  </button>
                  <input
                    ref={backInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadBack}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* 2. Paper Size & Arrangement */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                  Paper Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaperFormat('A4')}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      paperFormat === 'A4' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    A4 Full Paper
                  </button>
                  <button
                    onClick={() => setPaperFormat('4x6')}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      paperFormat === '4x6' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    4x6 Photo Glossy
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                  Card Arrangement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setArrangement('horizontal')}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      arrangement === 'horizontal' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Side-by-Side (Horizontal)
                  </button>
                  <button
                    onClick={() => setArrangement('vertical')}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      arrangement === 'vertical' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Stacked (Vertical)
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Spacing & Cutting Marks */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Gap between cards</span>
                <span className="text-xs font-mono font-bold text-emerald-700">{spacingMm} mm</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                value={spacingMm}
                onChange={(e) => setSpacingMm(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCutMarks}
                    onChange={(e) => setShowCutMarks(e.target.checked)}
                    className="rounded accent-emerald-600"
                  />
                  <span>Show Cut Marks</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBorders}
                    onChange={(e) => setShowBorders(e.target.checked)}
                    className="rounded accent-emerald-600"
                  />
                  <span>1px Outline</span>
                </label>
              </div>
            </div>
          </div>

          {/* Bottom Export Bar */}
          <div className="pt-4 border-t border-slate-200 flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={!sheetUrl}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Print Directly</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={!sheetUrl || isExportingPdf}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'Exporting...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
