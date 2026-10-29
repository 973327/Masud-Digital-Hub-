import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Upload, 
  RotateCw, 
  RotateCcw, 
  Sliders, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Scissors, 
  RefreshCw, 
  Layers, 
  Info, 
  ArrowLeftRight, 
  Eye, 
  Sun, 
  Contrast, 
  Check, 
  AlertCircle,
  FileText,
  FileCheck
} from 'lucide-react';
import { 
  applyAdjustmentsToImageData, 
  DEFAULT_ADJUSTMENTS, 
  ImageAdjustments, 
  compressCanvasToTargetKB, 
  formatBytes,
  blobToDataUrl
} from '../../services/imageProcessing';

// Sample WhatsApp compressed photo for instant 1-click test
const SAMPLE_WHATSAPP_PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=60';

interface AIPhotoFixerToolProps {
  onNavigateBack: () => void;
  lang?: 'en' | 'bn';
}

export const AIPhotoFixerTool: React.FC<AIPhotoFixerToolProps> = ({
  onNavigateBack,
  lang = 'en'
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(SAMPLE_WHATSAPP_PHOTO);
  const [originalFileSize, setOriginalFileSize] = useState<number>(185 * 1024);
  const [fileName, setFileName] = useState<string>('customer_photo.jpg');

  // Adjustment Controls
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    ...DEFAULT_ADJUSTMENTS,
    sharpness: 35,
    contrast: 110,
    brightness: 105
  });

  // Zoom & View controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [compareMode, setCompareMode] = useState<'split' | 'side' | 'hold'>('split');
  const [splitPosition, setSplitPosition] = useState<number>(50); // percentage 0-100
  const [isStraightening, setIsStraightening] = useState<boolean>(false);
  const [fineAngle, setFineAngle] = useState<number>(0); // -45 to +45

  // Cropping State
  const [isCropActive, setIsCropActive] = useState<boolean>(false);
  const [cropAspect, setCropAspect] = useState<'free' | '1:1' | '3.5:4.5' | '4:3' | '16:9'>('free');
  const [cropBox, setCropBox] = useState<{ x: number; y: number; w: number; h: number }>({ x: 10, y: 10, w: 80, h: 80 });

  // Output Export State
  const [exportFormat, setExportFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [targetKb, setTargetKb] = useState<number>(100);
  const [useTargetKb, setUseTargetKb] = useState<boolean>(false);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSizeKb, setOutputSizeKb] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showAiRestoreInfo, setShowAiRestoreInfo] = useState<boolean>(false);

  // Canvases
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const enhancedCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  // Load and draw initial image
  const renderOriginalAndEnhanced = useCallback(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 1. Draw Original Canvas
      const origCanvas = originalCanvasRef.current;
      if (!origCanvas) return;
      origCanvas.width = img.naturalWidth || img.width;
      origCanvas.height = img.naturalHeight || img.height;
      const origCtx = origCanvas.getContext('2d');
      if (!origCtx) return;

      origCtx.clearRect(0, 0, origCanvas.width, origCanvas.height);
      origCtx.drawImage(img, 0, 0);

      // 2. Draw Enhanced Canvas with fine angle & rotation
      const enhCanvas = enhancedCanvasRef.current;
      if (!enhCanvas) return;

      const totalAngle = (adjustments.rotation + fineAngle) * (Math.PI / 180);
      const is90or270 = adjustments.rotation === 90 || adjustments.rotation === 270;
      const baseW = is90or270 ? img.naturalHeight : img.naturalWidth;
      const baseH = is90or270 ? img.naturalWidth : img.naturalHeight;

      enhCanvas.width = baseW;
      enhCanvas.height = baseH;

      const enhCtx = enhCanvas.getContext('2d', { willReadFrequently: true });
      if (!enhCtx) return;

      enhCtx.clearRect(0, 0, baseW, baseH);
      enhCtx.save();
      enhCtx.translate(baseW / 2, baseH / 2);
      enhCtx.rotate(totalAngle);
      enhCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      enhCtx.restore();

      // Get pixel data and apply real filters (unsharp mask sharpening, contrast, exposure, brightness)
      try {
        const rawImageData = enhCtx.getImageData(0, 0, baseW, baseH);
        const filteredData = applyAdjustmentsToImageData(rawImageData, adjustments);
        enhCtx.putImageData(filteredData, 0, 0);

        // Generate output blob
        if (useTargetKb && targetKb > 0) {
          compressCanvasToTargetKB(enhCanvas, targetKb, exportFormat).then((res) => {
            setOutputBlob(res.blob);
            setOutputUrl(res.dataUrl);
            setOutputSizeKb(res.actualKB);
          });
        } else {
          enhCanvas.toBlob((blob) => {
            if (blob) {
              setOutputBlob(blob);
              setOutputSizeKb(Math.round((blob.size / 1024) * 10) / 10);
              blobToDataUrl(blob).then((url) => setOutputUrl(url));
            }
          }, exportFormat, 0.92);
        }
      } catch (err) {
        console.error('Image processing error:', err);
      }
    };
    img.src = imageSrc;
  }, [imageSrc, adjustments, fineAngle, useTargetKb, targetKb, exportFormat]);

  useEffect(() => {
    renderOriginalAndEnhanced();
  }, [renderOriginalAndEnhanced]);

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please upload a valid JPG, JPEG, PNG, or WebP photo.');
      return;
    }

    setOriginalFileSize(file.size);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      // Reset adjustments to smart WhatsApp fix
      setAdjustments({
        ...DEFAULT_ADJUSTMENTS,
        sharpness: 40,
        contrast: 112,
        brightness: 104
      });
      setFineAngle(0);
    };
    reader.readAsDataURL(file);
  };

  // 1-Click WhatsApp Photo Auto-Enhancer
  const handleAutoFixWhatsApp = () => {
    setAdjustments({
      brightness: 106,
      contrast: 118,
      sharpness: 55,
      saturation: 108,
      exposure: 6,
      temperature: 2,
      rotation: adjustments.rotation
    });
  };

  // Reset to original
  const handleResetAdjustments = () => {
    setAdjustments({
      ...DEFAULT_ADJUSTMENTS,
      rotation: 0
    });
    setFineAngle(0);
  };

  // Rotate 90 deg
  const handleRotate = (direction: 'cw' | 'ccw') => {
    setAdjustments((prev) => {
      const delta = direction === 'cw' ? 90 : -90;
      let newRot = (prev.rotation + delta) % 360;
      if (newRot < 0) newRot += 360;
      return { ...prev, rotation: newRot };
    });
  };

  // Handle Split comparison drag
  const handleSplitMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (compareMode !== 'split') return;
    if (e.buttons !== 1) return; // only when dragging
    const container = splitContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSplitPosition((x / rect.width) * 100);
  };

  // Apply Crop
  const handleApplyCrop = () => {
    const canvas = enhancedCanvasRef.current;
    if (!canvas) return;

    const cropX = Math.round((cropBox.x / 100) * canvas.width);
    const cropY = Math.round((cropBox.y / 100) * canvas.height);
    const cropW = Math.round((cropBox.w / 100) * canvas.width);
    const cropH = Math.round((cropBox.h / 100) * canvas.height);

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropW;
    croppedCanvas.height = cropH;
    const ctx = croppedCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    const newSrc = croppedCanvas.toDataURL(exportFormat);
    setImageSrc(newSrc);
    setIsCropActive(false);
  };

  // Trigger Download
  const handleDownload = () => {
    if (!outputUrl) return;
    const ext = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg';
    const base = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    const link = document.createElement('a');
    link.href = outputUrl;
    link.download = `${base}_enhanced.${ext}`;
    link.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Tool Header */}
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
                {lang === 'bn' ? 'এআই ফটো ফিক্সার' : 'AI Photo Fixer'}
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {lang === 'bn' ? 'রিয়েল ইমেজ প্রসেসিং' : 'In-Browser Real Processing'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? 'হোয়াটসঅ্যাপের লো-কোয়ালিটি বা ঝাপসা ছবি স্পষ্ট করুন, বাঁকা সোজা করুন এবং কালার এডজাস্ট করুন'
                : 'Enhance blurry WhatsApp portraits, unblur edges, straighten tilts, and prepare high-clarity photos'}
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoFixWhatsApp}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="1-Click Auto Boost for WhatsApp Photos"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{lang === 'bn' ? '১-ক্লিক অটো ফিক্স' : '1-Click Auto Fix'}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>{lang === 'bn' ? 'নতুন ছবি আপলোড' : 'Upload Photo'}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Main Workspace: Left Viewport & Right Control Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left: Viewport with Before & After Split Slider */}
        <div className="lg:col-span-8 p-4 bg-slate-900/95 flex flex-col items-center justify-between relative overflow-hidden select-none">
          {/* Viewport Top Toolbar */}
          <div className="w-full flex items-center justify-between text-white/90 text-xs pb-3 border-b border-white/10 z-20">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-300">{fileName}</span>
              <span className="text-white/40">·</span>
              <span className="text-emerald-400 font-mono text-[11px]">
                {formatBytes(originalFileSize)} → {outputSizeKb > 0 ? `${outputSizeKb} KB` : '...'}
              </span>
            </div>

            {/* Compare Mode Segmented Control */}
            <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-lg">
              <button
                onClick={() => setCompareMode('split')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  compareMode === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                {lang === 'bn' ? 'স্প্লিট স্লাইডার' : 'Split Slider'}
              </button>
              <button
                onClick={() => setCompareMode('side')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  compareMode === 'side' ? 'bg-white text-slate-900 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                {lang === 'bn' ? 'পাশাপাশি' : 'Side-by-Side'}
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                className="text-white/80 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono w-10 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                className="text-white/80 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="text-[10px] text-white/60 hover:text-white pl-1"
                title="Fit to Screen"
              >
                Fit
              </button>
            </div>
          </div>

          {/* Canvas Display Container */}
          <div className="flex-1 w-full flex items-center justify-center p-4 overflow-auto">
            {compareMode === 'split' ? (
              <div
                ref={splitContainerRef}
                onMouseMove={handleSplitMouseMove}
                className="relative max-w-full max-h-[480px] rounded-lg overflow-hidden shadow-2xl cursor-ew-resize border border-white/20"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease'
                }}
              >
                {/* 1. Base Layer: Enhanced Image */}
                <canvas
                  ref={enhancedCanvasRef}
                  className="block max-h-[440px] max-w-full object-contain"
                />

                {/* 2. Top Clamped Layer: Original Image */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ width: `${splitPosition}%` }}
                >
                  <canvas
                    ref={originalCanvasRef}
                    className="block max-h-[440px] max-w-none object-contain"
                    style={{
                      width: enhancedCanvasRef.current?.width || 'auto',
                      height: enhancedCanvasRef.current?.height || 'auto'
                    }}
                  />
                </div>

                {/* Straightening Live Grid Overlay (when adjusting fine angle) */}
                {fineAngle !== 0 && (
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 pointer-events-none border border-emerald-400/40">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className="border border-emerald-400/20" />
                    ))}
                  </div>
                )}

                {/* Split Handle Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] pointer-events-none"
                  style={{ left: `${splitPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white text-slate-900 shadow-md flex items-center justify-center">
                    <ArrowLeftRight className="w-3 h-3 text-slate-700" />
                  </div>
                </div>

                {/* Labels */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-semibold pointer-events-none">
                  {lang === 'bn' ? 'আসল ছবি (Original)' : 'Original'}
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-emerald-600/80 text-white text-[10px] font-semibold pointer-events-none">
                  {lang === 'bn' ? 'উন্নত ছবি (Enhanced)' : 'Enhanced (Sharpened)'}
                </div>
              </div>
            ) : (
              /* Side-by-Side comparison */
              <div className="flex flex-wrap items-center justify-center gap-4 max-w-full">
                <div className="text-center">
                  <div className="text-white/70 text-xs font-semibold mb-1">
                    {lang === 'bn' ? 'আসল ছবি' : 'Original Photo'}
                  </div>
                  <canvas
                    ref={originalCanvasRef}
                    className="max-h-[380px] max-w-full object-contain rounded border border-white/20"
                  />
                </div>
                <div className="text-center">
                  <div className="text-emerald-400 text-xs font-semibold mb-1">
                    {lang === 'bn' ? 'উন্নত রেজাল্ট' : 'Enhanced Result'}
                  </div>
                  <canvas
                    ref={enhancedCanvasRef}
                    className="max-h-[380px] max-w-full object-contain rounded border border-emerald-500/50 shadow-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Viewport Hint */}
          <div className="w-full text-center text-white/50 text-[11px] pt-2 border-t border-white/10">
            {lang === 'bn' 
              ? 'স্লাইডারটি ডানে-বায়ে টেনে আসল ও উন্নত ছবির পার্থক্য তুলনা করুন' 
              : 'Drag the split slider left & right to inspect edge sharpness and clarity difference'}
          </div>
        </div>

        {/* Right Sidebar: Adjustments, Straightening, Format, Target KB */}
        <div className="lg:col-span-4 p-5 bg-white border-l border-slate-200 flex flex-col justify-between overflow-y-auto max-h-[640px]">
          <div className="space-y-5">
            {/* 1. Straighten & Rotation Controls */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {lang === 'bn' ? 'রোটেশন ও সোজা করা' : 'Straighten & Rotate'}
                </label>
                <span className="text-xs font-mono text-slate-500">{fineAngle}°</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => handleRotate('ccw')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>90° Left</span>
                </button>
                <button
                  onClick={() => handleRotate('cw')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>90° Right</span>
                </button>
              </div>

              {/* Fine angle tilt correction slider (-45 to +45) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>-45° Tilt</span>
                  <span>Straighten Angle</span>
                  <span>+45°</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={fineAngle}
                  onChange={(e) => setFineAngle(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* 2. Image Clarity & Enhancement Sliders */}
            <div className="space-y-3.5 pt-3 border-t border-slate-200">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                {lang === 'bn' ? 'ইমেজ শার্পনেস ও কোয়ালিটি' : 'Clarity & Enhancements'}
              </label>

              {/* Sharpness / Unsharp Mask */}
              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    {lang === 'bn' ? 'শার্পনেস (ঝাপসা দূর করুন)' : 'Sharpness (Unblur)'}
                  </span>
                  <span className="font-mono text-emerald-700 font-bold">{adjustments.sharpness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={adjustments.sharpness}
                  onChange={(e) => setAdjustments({ ...adjustments, sharpness: parseInt(e.target.value, 10) })}
                  className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Contrast className="w-3 h-3 text-slate-600" />
                    {lang === 'bn' ? 'কনট্রাস্ট (উজ্জ্বলতা বিভাজন)' : 'Contrast'}
                  </span>
                  <span className="font-mono font-medium">{adjustments.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="160"
                  value={adjustments.contrast}
                  onChange={(e) => setAdjustments({ ...adjustments, contrast: parseInt(e.target.value, 10) })}
                  className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Brightness */}
              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Sun className="w-3 h-3 text-amber-500" />
                    {lang === 'bn' ? 'উজ্জ্বলতা (Brightness)' : 'Brightness'}
                  </span>
                  <span className="font-mono font-medium">{adjustments.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="150"
                  value={adjustments.brightness}
                  onChange={(e) => setAdjustments({ ...adjustments, brightness: parseInt(e.target.value, 10) })}
                  className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1">
                  <span className="font-medium">{lang === 'bn' ? 'কালার স্যাচুরেশন' : 'Saturation'}</span>
                  <span className="font-mono font-medium">{adjustments.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="160"
                  value={adjustments.saturation}
                  onChange={(e) => setAdjustments({ ...adjustments, saturation: parseInt(e.target.value, 10) })}
                  className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* 3. Export Format & Target KB */}
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                {lang === 'bn' ? 'ডাউনলোড ফরম্যাট ও ফাইল সাইজ' : 'Export & File Size'}
              </label>

              {/* Format selection */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
                {(['image/jpeg', 'image/png', 'image/webp'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    className={`py-1 text-center text-xs font-semibold rounded transition-colors ${
                      exportFormat === fmt ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {fmt.replace('image/', '').toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Optional Target KB Limit */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useTargetKb}
                      onChange={(e) => setUseTargetKb(e.target.checked)}
                      className="rounded accent-emerald-600"
                    />
                    <span>{lang === 'bn' ? 'নির্দিষ্ট কেবি (KB) সাইজে নামান' : 'Set Exact Target KB'}</span>
                  </label>
                  {useTargetKb && (
                    <span className="text-xs font-mono font-bold text-emerald-700">{targetKb} KB</span>
                  )}
                </div>

                {useTargetKb && (
                  <div className="flex items-center gap-2">
                    {[20, 50, 100, 200].map((kb) => (
                      <button
                        key={kb}
                        onClick={() => setTargetKb(kb)}
                        className={`flex-1 py-1 rounded text-xs font-semibold transition-colors ${
                          targetKb === kb ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        {kb}K
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 4. AI-Assisted Photo Restoration Information & Ethical Disclosure */}
            <div className="pt-2">
              <button
                onClick={() => setShowAiRestoreInfo(!showAiRestoreInfo)}
                className="w-full text-left text-xs font-semibold text-slate-700 hover:text-emerald-700 flex items-center justify-between py-1 transition-colors"
              >
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  {lang === 'bn' ? 'এআই ফটো রেস্টোরেশন তথ্য ও খরচ' : 'AI Photo Restoration & Authenticity Notice'}
                </span>
                <span>{showAiRestoreInfo ? '▲' : '▼'}</span>
              </button>

              {showAiRestoreInfo && (
                <div className="mt-2 p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                  <div className="font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Important Disclosure</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    • In-browser enhancement uses real convolution algorithms (unsharp mask, luminance balance, sharpening).
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    • Server-side AI face inpainting can reconstruct damaged historical portraits, but any synthesized detail is AI-generated and not authentic photographic record.
                  </p>
                  <p className="text-[11px] leading-relaxed font-semibold">
                    • Strictly prohibited: Never alter identity, facial features, or official government documents (Aadhaar, Voter, PAN).
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions: Reset & Download */}
          <div className="pt-4 border-t border-slate-200 flex items-center gap-2">
            <button
              onClick={handleResetAdjustments}
              className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleDownload}
              disabled={!outputUrl}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{lang === 'bn' ? 'ছবি ডাউনলোড করুন' : 'Download Enhanced Photo'}</span>
              {outputSizeKb > 0 && <span className="opacity-80 font-mono">({outputSizeKb} KB)</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
