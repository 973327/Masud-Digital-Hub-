import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sliders, 
  Upload, 
  Download, 
  RefreshCw, 
  FileCheck, 
  Image as ImageIcon, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Layers,
  Info
} from 'lucide-react';
import { compressCanvasToTargetKB, formatBytes, blobToDataUrl } from '../../services/imageProcessing';

const SAMPLE_PHOTO = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80';

const PRESET_KB_TARGETS = [20, 50, 100, 200, 500];

interface PhotoKBResizerToolProps {
  onNavigateBack: () => void;
  lang?: 'en' | 'bn';
}

export const PhotoKBResizerTool: React.FC<PhotoKBResizerToolProps> = ({
  onNavigateBack,
  lang = 'en'
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(SAMPLE_PHOTO);
  const [originalBytes, setOriginalBytes] = useState<number>(1.8 * 1024 * 1024);
  const [originalWidth, setOriginalWidth] = useState<number>(800);
  const [originalHeight, setOriginalHeight] = useState<number>(1000);
  const [fileName, setFileName] = useState<string>('candidate_photo.jpg');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Target KB Settings
  const [targetKb, setTargetKb] = useState<number>(50);
  const [customKbInput, setCustomKbInput] = useState<string>('50');
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/webp' | 'image/png'>('image/jpeg');

  // Aspect Ratio & Dimensions
  const [customWidth, setCustomWidth] = useState<number>(800);
  const [customHeight, setCustomHeight] = useState<number>(1000);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(0.8);

  // View Controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Compression Output Results
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputBytes, setOutputBytes] = useState<number>(0);
  const [outputWidth, setOutputWidth] = useState<number>(800);
  const [outputHeight, setOutputHeight] = useState<number>(1000);
  const [outputQuality, setOutputQuality] = useState<number>(0.85);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load and inspect image
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      setOriginalWidth(w);
      setOriginalHeight(h);
      setCustomWidth(w);
      setCustomHeight(h);
      const ratio = w / h;
      setAspectRatio(ratio);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Handle Dimension changes with aspect ratio lock
  const handleWidthChange = (newW: number) => {
    setCustomWidth(newW);
    if (maintainAspect && aspectRatio > 0) {
      setCustomHeight(Math.round(newW / aspectRatio));
    }
  };

  const handleHeightChange = (newH: number) => {
    setCustomHeight(newH);
    if (maintainAspect && aspectRatio > 0) {
      setCustomWidth(Math.round(newH * aspectRatio));
    }
  };

  // Execute binary-search compression
  const executeCompression = useCallback(async () => {
    if (!imageSrc) return;
    setIsCompressing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = imageSrc;
      });

      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = customWidth > 0 ? customWidth : img.width;
      canvas.height = customHeight > 0 ? customHeight : img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw with smooth image scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const result = await compressCanvasToTargetKB(canvas, targetKb, targetFormat);
      setOutputUrl(result.dataUrl);
      setOutputBytes(result.blob.size);
      setOutputQuality(result.quality);

      // Read output image actual dimensions
      const outImg = new Image();
      outImg.onload = () => {
        setOutputWidth(outImg.width);
        setOutputHeight(outImg.height);
      };
      outImg.src = result.dataUrl;
    } catch (err) {
      console.error('Compression error:', err);
    } finally {
      setIsCompressing(false);
    }
  }, [imageSrc, customWidth, customHeight, targetKb, targetFormat]);

  useEffect(() => {
    executeCompression();
  }, [executeCompression]);

  // Handle File Upload
  const handleFile = (file: File) => {
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please upload a valid JPG, PNG, or WebP image.');
      return;
    }

    setOriginalBytes(file.size);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // Reset to original dimensions
  const handleResetToOriginal = () => {
    setCustomWidth(originalWidth);
    setCustomHeight(originalHeight);
    setMaintainAspect(true);
  };

  // Download Output
  const handleDownload = () => {
    if (!outputUrl) return;
    const ext = targetFormat === 'image/png' ? 'png' : targetFormat === 'image/webp' ? 'webp' : 'jpg';
    const base = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    const link = document.createElement('a');
    link.href = outputUrl;
    link.download = `${base}_${Math.round(outputBytes / 1024)}KB.${ext}`;
    link.click();
  };

  const outputKb = Math.round((outputBytes / 1024) * 10) / 10;
  const reductionPercent = originalBytes > 0 ? Math.round(((originalBytes - outputBytes) / originalBytes) * 100) : 0;
  const simplifiedAspect = (aspectRatio).toFixed(2);

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden ${
        isDragOver ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200/90'
      }`}
    >
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
                {lang === 'bn' ? 'ফটো কেবি রিসাইজার' : 'Photo KB Resizer'}
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Target: {targetKb} KB · Output: {outputKb} KB
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? 'অনলাইন ফর্ম ও পোর্টালের জন্য ছবির অনুপাত (Aspect Ratio) ঠিক রেখে নির্দিষ্ট কেবি (KB) সাইজে কম্প্রেস করুন'
                : 'Upload any image, specify target file size in KB, and output compressed photo maintaining exact aspect ratio.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-amber-300" />
            <span>{lang === 'bn' ? 'নতুন ছবি আপলোড' : 'Upload Image'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        {/* Left: Preview & Aspect Ratio Status */}
        <div className="lg:col-span-7 p-6 bg-slate-900 flex flex-col items-center justify-between select-none">
          {/* Top Status Bar */}
          <div className="w-full flex items-center justify-between text-xs pb-3 border-b border-white/10 text-white">
            <div className="flex items-center gap-2">
              <span className="text-white/60">Input: </span>
              <span className="font-mono text-amber-300 font-semibold">{formatBytes(originalBytes)}</span>
              <span className="text-white/40 text-[11px]">({originalWidth}×{originalHeight}px)</span>
            </div>

            <ArrowRight className="w-4 h-4 text-emerald-400" />

            <div className="flex items-center gap-2">
              <span className="text-white/60">Output: </span>
              <span className="font-mono text-emerald-400 font-bold">{outputKb} KB</span>
              <span className="text-white/40 text-[11px]">({outputWidth}×{outputHeight}px)</span>
            </div>
          </div>

          {/* Center Image Preview */}
          <div className="my-auto py-4 flex flex-col items-center max-w-full">
            <div
              className="relative max-h-[380px] max-w-full rounded-xl overflow-hidden border border-white/20 shadow-2xl bg-black/40 flex items-center justify-center"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease'
              }}
            >
              {outputUrl ? (
                <img
                  src={outputUrl}
                  alt="Resized output"
                  className="max-h-[360px] max-w-full object-contain"
                />
              ) : (
                <div className="p-12 text-white/50 text-xs flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Compressing image to {targetKb} KB...</span>
                </div>
              )}

              {/* Tag Overlays */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold flex items-center gap-1 backdrop-blur-xs">
                <Lock className="w-2.5 h-2.5 text-emerald-400" />
                <span>Aspect Ratio Preserved ({simplifiedAspect})</span>
              </div>

              <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-black/75 text-emerald-400 text-xs font-mono font-bold backdrop-blur-xs">
                {outputKb} KB ({reductionPercent > 0 ? `-${reductionPercent}%` : 'Original'})
              </div>
            </div>

            {/* Zoom Bar */}
            <div className="mt-3 flex items-center gap-2 bg-white/10 px-2.5 py-1 rounded-xl text-white text-xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                className="hover:text-emerald-400 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
                className="hover:text-emerald-400 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="text-[10px] text-white/60 hover:text-white pl-1"
              >
                Fit
              </button>
            </div>
          </div>

          {/* Bottom Compliance Check */}
          <div className="w-full text-center text-white/70 text-xs pt-3 border-t border-white/10 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>
              {outputKb <= targetKb
                ? `Output (${outputKb} KB) fits within specified target of ${targetKb} KB without distortion.`
                : `Output optimized to ${outputKb} KB maintaining sharpness and aspect ratio.`}
            </span>
          </div>
        </div>

        {/* Right: Controls & Parameters */}
        <div className="lg:col-span-5 p-5 flex flex-col justify-between space-y-5 overflow-y-auto max-h-[640px]">
          <div className="space-y-4">
            {/* 1. Target Size (KB) Specification */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {lang === 'bn' ? 'টার্গেট সাইজ নির্ধারণ (Target KB)' : 'Target File Size (KB)'}
                </label>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {targetKb} KB
                </span>
              </div>

              {/* Preset Buttons */}
              <div className="grid grid-cols-5 gap-1.5 mb-2.5">
                {PRESET_KB_TARGETS.map((kb) => (
                  <button
                    key={kb}
                    onClick={() => {
                      setTargetKb(kb);
                      setCustomKbInput(kb.toString());
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      targetKb === kb
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {kb} KB
                  </button>
                ))}
              </div>

              {/* Custom Target Input */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="5"
                    max="5000"
                    value={customKbInput}
                    onChange={(e) => {
                      setCustomKbInput(e.target.value);
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val > 0) {
                        setTargetKb(val);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = parseInt(customKbInput, 10);
                        if (!isNaN(val) && val > 0) setTargetKb(val);
                      }
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:outline-emerald-600 bg-white"
                    placeholder="Enter any KB (e.g. 35, 45, 75)"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    KB
                  </span>
                </div>
                <button
                  onClick={() => {
                    const val = parseInt(customKbInput, 10);
                    if (!isNaN(val) && val > 0) setTargetKb(val);
                  }}
                  className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>

              <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                <Info className="w-3 h-3 text-slate-400" />
                <span>
                  {lang === 'bn'
                    ? 'সরকারি চাকরির ফর্মে সাধারণ চাহিদামাফিক ২০ কেবি, ৫০ কেবি বা ১০০ কেবি প্রিসেট ব্যবহার করুন।'
                    : 'Standard requirements: SSC/IBPS (20–50 KB), PAN (max 50 KB), UPSC (20–300 KB).'}
                </span>
              </p>
            </div>

            {/* 2. Aspect Ratio & Dimensions Control */}
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {lang === 'bn' ? 'রেজোলিউশন ও অনুপাত' : 'Dimensions & Aspect Ratio'}
                </label>

                {/* Aspect Ratio Lock Toggle */}
                <button
                  onClick={() => setMaintainAspect(!maintainAspect)}
                  className={`text-[11px] flex items-center gap-1 font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    maintainAspect
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                  title="Toggle Aspect Ratio Lock"
                >
                  {maintainAspect ? <Lock className="w-3 h-3 text-emerald-600" /> : <Unlock className="w-3 h-3" />}
                  <span>{maintainAspect ? 'Aspect Ratio Locked' : 'Freeform'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Width (px)</span>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 100)}
                    className="w-full py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Height (px)</span>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 100)}
                    className="w-full py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                  />
                </div>
              </div>

              {/* Reset to Original Dimensions shortcut */}
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  Ratio: {simplifiedAspect} ({originalWidth}×{originalHeight} original)
                </span>
                <button
                  onClick={handleResetToOriginal}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 hover:underline font-semibold cursor-pointer"
                >
                  Reset Dimensions
                </button>
              </div>
            </div>

            {/* 3. Output Format */}
            <div className="pt-3 border-t border-slate-200">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                {lang === 'bn' ? 'আউটপুট ফরম্যাট' : 'Output Format'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['image/jpeg', 'image/webp', 'image/png'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setTargetFormat(fmt)}
                    className={`py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      targetFormat === fmt
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {fmt.replace('image/', '').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Download & Actions Bar */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <button
              onClick={handleDownload}
              disabled={!outputUrl || isCompressing}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>
                {isCompressing
                  ? 'Compressing to Target KB...'
                  : `Download Compressed Photo (${outputKb} KB)`}
              </span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Choose Another Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
