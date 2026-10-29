import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FileSignature, 
  Upload, 
  Download, 
  Scissors, 
  RefreshCw, 
  Sparkles, 
  Sun, 
  Contrast, 
  CheckCircle2, 
  ArrowLeftRight,
  Sliders,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { 
  cleanSignatureImageData, 
  compressCanvasToTargetKB, 
  formatBytes,
  blobToDataUrl
} from '../../services/imageProcessing';

// Sample signature photo on yellowish paper
const SAMPLE_SIGNATURE = 'https://images.unsplash.com/photo-1583521214690-73421a1829a9?auto=format&fit=crop&w=600&q=80';

interface SignatureResizerToolProps {
  onNavigateBack: () => void;
  lang?: 'en' | 'bn';
}

export const SignatureResizerTool: React.FC<SignatureResizerToolProps> = ({
  onNavigateBack,
  lang = 'en'
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(SAMPLE_SIGNATURE);
  const [fileName, setFileName] = useState<string>('candidate_signature.jpg');
  const [originalBytes, setOriginalBytes] = useState<number>(340 * 1024);

  // Filters
  const [whitenThreshold, setWhitenThreshold] = useState<number>(185); // 120 - 240
  const [inkDarkness, setInkDarkness] = useState<number>(1.35);       // 1.0 - 2.5
  const [targetKb, setTargetKb] = useState<number>(15);              // 10, 15, 20 KB
  const [targetWidth, setTargetWidth] = useState<number>(280);
  const [targetHeight, setTargetHeight] = useState<number>(120);

  // Zoom & View
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [compareMode, setCompareMode] = useState<'split' | 'side'>('split');
  const [splitPos, setSplitPos] = useState<number>(50);

  // Results
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputBytes, setOutputBytes] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const origCanvasRef = useRef<HTMLCanvasElement>(null);
  const cleanedCanvasRef = useRef<HTMLCanvasElement>(null);

  // Process signature
  const processSignature = useCallback(async () => {
    if (!imageSrc) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = imageSrc;
      });

      // 1. Draw original canvas
      const origCanvas = origCanvasRef.current;
      if (origCanvas) {
        origCanvas.width = targetWidth;
        origCanvas.height = targetHeight;
        const origCtx = origCanvas.getContext('2d');
        if (origCtx) {
          origCtx.drawImage(img, 0, 0, targetWidth, targetHeight);
        }
      }

      // 2. Process cleaned canvas
      const cleanedCanvas = cleanedCanvasRef.current;
      if (!cleanedCanvas) return;
      cleanedCanvas.width = targetWidth;
      cleanedCanvas.height = targetHeight;
      const ctx = cleanedCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Clean background paper & darken ink
      const rawData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const cleanedData = cleanSignatureImageData(rawData, whitenThreshold, inkDarkness);
      ctx.putImageData(cleanedData, 0, 0);

      // Compress to target KB (10 - 20 KB)
      const res = await compressCanvasToTargetKB(cleanedCanvas, targetKb, 'image/jpeg');
      setOutputUrl(res.dataUrl);
      setOutputBytes(res.blob.size);
    } catch (err) {
      console.error('Signature processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [imageSrc, targetWidth, targetHeight, whitenThreshold, inkDarkness, targetKb]);

  useEffect(() => {
    processSignature();
  }, [processSignature]);

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalBytes(file.size);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Download
  const handleDownload = () => {
    if (!outputUrl) return;
    const base = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    const link = document.createElement('a');
    link.href = outputUrl;
    link.download = `${base}_cleaned_${Math.round(outputBytes / 1024)}KB.jpg`;
    link.click();
  };

  const outputKb = Math.round((outputBytes / 1024) * 10) / 10;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
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
                {lang === 'bn' ? 'স্বাক্ষর রিসাইজার ও ক্লিনার' : 'Signature Resizer & Whitener'}
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Pure White Background · {outputKb} KB
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? 'কাগজের হলুদ ভাব বা ছায়া দূর করে ধবধবে সাদা করুন এবং ১০-২০ কেবিতে নামিয়ে আনুন'
                : 'Whitens smudged paper backgrounds to pure white, boosts ink clarity, and compresses to 10-20 KB.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>{lang === 'bn' ? 'স্বাক্ষর আপলোড' : 'Upload Signature'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
        {/* Left: Signature Comparison Box */}
        <div className="lg:col-span-7 p-6 bg-slate-900 flex flex-col items-center justify-between select-none">
          {/* Top Bar */}
          <div className="w-full flex items-center justify-between text-xs pb-3 border-b border-white/10 text-white">
            <div className="flex items-center gap-2">
              <span className="text-white/60">Input: {formatBytes(originalBytes)}</span>
              <span>·</span>
              <span className="text-emerald-400 font-mono font-bold">Output: {outputKb} KB</span>
            </div>

            <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-lg">
              <button
                onClick={() => setCompareMode('split')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  compareMode === 'split' ? 'bg-white text-slate-900' : 'text-white/70'
                }`}
              >
                Split
              </button>
              <button
                onClick={() => setCompareMode('side')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  compareMode === 'side' ? 'bg-white text-slate-900' : 'text-white/70'
                }`}
              >
                Side-by-Side
              </button>
            </div>
          </div>

          {/* Interactive Comparison Preview */}
          <div className="my-auto py-6 flex flex-col items-center max-w-full">
            {compareMode === 'split' ? (
              <div
                className="relative rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl bg-white cursor-ew-resize"
                onMouseMove={(e) => {
                  if (e.buttons === 1) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                    setSplitPos((x / rect.width) * 100);
                  }
                }}
              >
                {/* Cleaned layer */}
                <canvas ref={cleanedCanvasRef} className="block max-w-[420px] max-h-[180px] object-contain" />

                {/* Original layer on top */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ width: `${splitPos}%` }}
                >
                  <canvas ref={origCanvasRef} className="block max-w-none max-h-[180px] object-contain" />
                </div>

                {/* Split line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 shadow-md pointer-events-none"
                  style={{ left: `${splitPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                    ↔
                  </div>
                </div>

                <div className="absolute bottom-1 left-2 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded pointer-events-none">
                  Original (Yellow Paper)
                </div>
                <div className="absolute bottom-1 right-2 text-[9px] bg-emerald-700/80 text-white px-1.5 py-0.5 rounded pointer-events-none">
                  Cleaned (Pure White)
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-slate-800 p-2 rounded-xl text-center">
                  <span className="text-[11px] text-white/60 mb-1 block">Original Upload</span>
                  <canvas ref={origCanvasRef} className="max-w-[360px] max-h-[140px] rounded bg-white" />
                </div>
                <div className="bg-slate-800 p-2 rounded-xl text-center">
                  <span className="text-[11px] text-emerald-400 mb-1 block font-semibold">
                    Cleaned & Compressed ({outputKb} KB)
                  </span>
                  <canvas ref={cleanedCanvasRef} className="max-w-[360px] max-h-[140px] rounded bg-white" />
                </div>
              </div>
            )}
          </div>

          <div className="w-full text-center text-white/50 text-[11px] pt-3 border-t border-white/10">
            {lang === 'bn'
              ? 'কাগজটি নিখুঁত সাদা হয়েছে কিনা যাচাই করুন'
              : 'Official exam portals require pure white background with legible signature strokes'}
          </div>
        </div>

        {/* Right: Threshold & Size Controls */}
        <div className="lg:col-span-5 p-5 flex flex-col justify-between space-y-5 overflow-y-auto max-h-[580px]">
          <div className="space-y-4">
            {/* 1. Paper Whitening Threshold */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {lang === 'bn' ? 'কাগজ পরিষ্কার ও সাদা করার মাত্রা' : 'Paper Whitening Sensitivity'}
                </label>
                <span className="text-xs font-mono font-bold text-emerald-700">{whitenThreshold}</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Increase if paper shadows or yellow tint still visible; decrease if ink lines break.
              </p>
              <input
                type="range"
                min="130"
                max="235"
                value={whitenThreshold}
                onChange={(e) => setWhitenThreshold(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* 2. Ink Darkness */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {lang === 'bn' ? 'কালির ঘনত্ব (Ink Darkness)' : 'Ink Stroke Boost'}
                </label>
                <span className="text-xs font-mono font-bold text-slate-700">{inkDarkness}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.05"
                value={inkDarkness}
                onChange={(e) => setInkDarkness(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* 3. Target KB Presets */}
            <div className="pt-2 border-t border-slate-200">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                {lang === 'bn' ? 'টার্গেট সাইজ (Target KB)' : 'Portal Limit Target'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 15, 20].map((kb) => (
                  <button
                    key={kb}
                    onClick={() => setTargetKb(kb)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      targetKb === kb
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Max {kb} KB
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Portal Dimensions Presets */}
            <div className="pt-2 border-t border-slate-200">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                {lang === 'bn' ? 'পোর্টাল সাইজ প্রিসেট' : 'Exam Dimensions'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setTargetWidth(280);
                    setTargetHeight(120);
                  }}
                  className={`p-2 rounded-xl text-left border text-xs font-semibold ${
                    targetWidth === 280 ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-slate-200'
                  }`}
                >
                  <div>SSC / IBPS Standard</div>
                  <div className="text-[10px] text-slate-500 font-mono">280 x 120 px</div>
                </button>
                <button
                  onClick={() => {
                    setTargetWidth(350);
                    setTargetHeight(175);
                  }}
                  className={`p-2 rounded-xl text-left border text-xs font-semibold ${
                    targetWidth === 350 ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-slate-200'
                  }`}
                >
                  <div>UPSC / WBPSC (2:1)</div>
                  <div className="text-[10px] text-slate-500 font-mono">350 x 175 px</div>
                </button>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={handleDownload}
              disabled={!outputUrl || isProcessing}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isProcessing ? 'Processing...' : `Download Signature (${outputKb} KB)`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
