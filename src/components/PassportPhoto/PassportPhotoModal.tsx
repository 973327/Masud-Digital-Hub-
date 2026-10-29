import React, { useState, useRef, useEffect, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { 
  Camera, 
  Upload, 
  Download, 
  Printer, 
  Scissors, 
  Sliders, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  Check, 
  Sparkles, 
  Image as ImageIcon, 
  Eye, 
  Trash2, 
  Sun, 
  Contrast, 
  X, 
  FileText, 
  UserCheck, 
  RotateCw, 
  RotateCcw,
  Palette,
  Crop,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { SupportConfig } from '../../types';

interface PassportPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  supportConfig: SupportConfig;
  onPhotoGenerated?: (photoDataUrl: string) => void;
}

// Preset candidate sample photo for instant 1-click test
const SAMPLE_CANDIDATE_PHOTO = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';

export interface DimensionPreset {
  id: string;
  name: string;
  subname: string;
  aspectRatio: number;
  widthPx: number;
  heightPx: number;
  badge?: string;
}

export const DIMENSION_PRESETS: DimensionPreset[] = [
  {
    id: '1.2x1.5',
    name: '1.2in x 1.5in',
    subname: '3.05cm x 3.81cm (Indian Passport / Standard)',
    aspectRatio: 1.2 / 1.5, // 0.8
    widthPx: 360,
    heightPx: 450,
    badge: '★ Recommended'
  },
  {
    id: '3.5x4.5',
    name: '3.5cm x 4.5cm',
    subname: 'Govt / PAN / Exam Standard',
    aspectRatio: 3.5 / 4.5,
    widthPx: 413,
    heightPx: 531
  },
  {
    id: '3x4',
    name: '3:4 Biometric',
    subname: 'Standard Portrait Biometric',
    aspectRatio: 3 / 4,
    widthPx: 413,
    heightPx: 551
  },
  {
    id: '2x2',
    name: '2in x 2in (Square)',
    subname: '5.08cm x 5.08cm (US Visa / OCI)',
    aspectRatio: 1,
    widthPx: 600,
    heightPx: 600
  }
];

const BG_COLORS = [
  { id: 'white', name: 'Clean White', color: '#ffffff', border: 'border-slate-300', text: 'Official / Passport Standard' },
  { id: 'blue', name: 'Studio Blue', color: '#bfdbfe', border: 'border-blue-400', text: 'Indian Govt / Exam Standard' },
  { id: 'royal_blue', name: 'Royal Blue', color: '#2563eb', border: 'border-blue-600', text: 'Deep Studio Blue' },
  { id: 'gray', name: 'Light Gray', color: '#e2e8f0', border: 'border-slate-400', text: 'Corporate & ID Standard' },
  { id: 'cream', name: 'Soft Cream', color: '#fef3c7', border: 'border-amber-300', text: 'Off-White Neutral' },
  { id: 'red', name: 'Passport Red', color: '#dc2626', border: 'border-red-500', text: 'Official Asian Standard' },
  { id: 'original', name: 'Original', color: 'transparent', border: 'border-slate-300', text: 'No Background Color' }
];

export const PassportPhotoModal: React.FC<PassportPhotoModalProps> = ({
  isOpen,
  onClose,
  supportConfig,
  onPhotoGenerated
}) => {
  // Master Image Source
  const [imageSrc, setImageSrc] = useState<string | null>(SAMPLE_CANDIDATE_PHOTO);

  // Preset & Aspect Ratio
  const [selectedPresetId, setSelectedPresetId] = useState<string>('1.2x1.5');
  const activePreset = DIMENSION_PRESETS.find((p) => p.id === selectedPresetId) || DIMENSION_PRESETS[0];

  // react-easy-crop state
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<number>(1.2 / 1.5); // default 1.2in x 1.5in (0.8)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Overlays & Guides
  const [showFaceGuide, setShowFaceGuide] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Background & Lighting
  const [selectedBg, setSelectedBg] = useState<string>('white');
  const [bgCleanThreshold, setBgCleanThreshold] = useState<number>(35);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);

  // Quantity: 6, 8, 12, 16 photos
  const [quantity, setQuantity] = useState<6 | 8 | 12 | 16>(6);
  const [paperFormat, setPaperFormat] = useState<'4x6' | 'A4'>('4x6');
  const [showCutLines, setShowCutLines] = useState<boolean>(true);

  // Output URLs
  const [singlePhotoUrl, setSinglePhotoUrl] = useState<string | null>(null);
  const [printSheetUrl, setPrintSheetUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [isProcessingCrop, setIsProcessingCrop] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);

  const PHOTO_WIDTH = activePreset.widthPx;
  const PHOTO_HEIGHT = activePreset.heightPx;

  // Handle Preset change
  const handleSelectPreset = (preset: DimensionPreset) => {
    setSelectedPresetId(preset.id);
    setAspectRatio(preset.aspectRatio);
  };

  // Instant 1-Click Auto-Crop 1.2in x 1.5in
  const handleAutoCrop1_2x1_5 = () => {
    setSelectedPresetId('1.2x1.5');
    setAspectRatio(1.2 / 1.5);
    setCrop({ x: 0, y: 0 });
    setZoom(1.15);
    setRotation(0);
  };

  // Crop callback from react-easy-crop
  const onCropComplete = useCallback((croppedArea: Area, currentCroppedAreaPixels: Area) => {
    setCroppedAreaPixels(currentCroppedAreaPixels);
  }, []);

  // Process and extract cropped image from react-easy-crop area pixels
  const processCroppedPhoto = useCallback(async (pixelCropOverride?: Area) => {
    if (!imageSrc) return;
    const targetCrop = pixelCropOverride || croppedAreaPixels;
    if (!targetCrop) return;

    setIsProcessingCrop(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
        img.src = imageSrc;
      });

      // 1. Offscreen canvas to handle rotation
      const rotRad = (rotation * Math.PI) / 180;
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      // Calculate bounding box of rotated image
      const bBoxWidth = Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height);
      const bBoxHeight = Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height);

      const rotCanvas = document.createElement('canvas');
      rotCanvas.width = bBoxWidth;
      rotCanvas.height = bBoxHeight;
      const rotCtx = rotCanvas.getContext('2d');
      if (!rotCtx) throw new Error('Cannot get rotation context');

      rotCtx.translate(bBoxWidth / 2, bBoxHeight / 2);
      rotCtx.rotate(rotRad);
      rotCtx.translate(-width / 2, -height / 2);
      rotCtx.drawImage(img, 0, 0);

      // 2. High-resolution output canvas at 300 DPI (3:4 ratio: 413 x 551 px)
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = PHOTO_WIDTH;
      outputCanvas.height = PHOTO_HEIGHT;
      const ctx = outputCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Cannot get output context');

      // Fill background if chosen
      const bgObj = BG_COLORS.find((b) => b.id === selectedBg);
      if (selectedBg !== 'original' && bgObj && bgObj.color !== 'transparent') {
        ctx.fillStyle = bgObj.color;
        ctx.fillRect(0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
      } else {
        ctx.clearRect(0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
      }

      // Apply brightness & contrast filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

      // Draw cropped area into output canvas
      ctx.drawImage(
        rotCanvas,
        targetCrop.x,
        targetCrop.y,
        targetCrop.width,
        targetCrop.height,
        0,
        0,
        PHOTO_WIDTH,
        PHOTO_HEIGHT
      );

      // 3. Background keying if non-original background is chosen
      if (selectedBg !== 'original') {
        try {
          const imgData = ctx.getImageData(0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
          const data = imgData.data;

          const cornerR = data[0];
          const cornerG = data[1];
          const cornerB = data[2];

          const targetBg = bgObj ? bgObj.color : '#ffffff';
          const tr = parseInt(targetBg.slice(1, 3), 16) || 255;
          const tg = parseInt(targetBg.slice(3, 5), 16) || 255;
          const tb = parseInt(targetBg.slice(5, 7), 16) || 255;

          const threshold = bgCleanThreshold;

          for (let y = 0; y < PHOTO_HEIGHT; y++) {
            for (let x = 0; x < PHOTO_WIDTH; x++) {
              const idx = (y * PHOTO_WIDTH + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];

              const diff = Math.sqrt(
                Math.pow(r - cornerR, 2) + Math.pow(g - cornerG, 2) + Math.pow(b - cornerB, 2)
              );

              if (diff < threshold * 2.5) {
                const alpha = Math.min(1, Math.max(0, diff / (threshold * 2.5)));
                data[idx] = Math.round(r * alpha + tr * (1 - alpha));
                data[idx + 1] = Math.round(g * alpha + tg * (1 - alpha));
                data[idx + 2] = Math.round(b * alpha + tb * (1 - alpha));
              }
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } catch (e) {
          console.warn('Background color replacement skipped (CORS limitation):', e);
        }
      }

      // Subtle 1px studio border
      ctx.filter = 'none';
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);

      const url = outputCanvas.toDataURL('image/jpeg', 0.92);
      setSinglePhotoUrl(url);
      if (onPhotoGenerated) {
        try {
          const avatarCanvas = document.createElement('canvas');
          const maxDim = 200;
          let w = PHOTO_WIDTH;
          let h = PHOTO_HEIGHT;
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
          avatarCanvas.width = Math.max(1, w);
          avatarCanvas.height = Math.max(1, h);
          const avCtx = avatarCanvas.getContext('2d');
          if (avCtx) {
            avCtx.drawImage(outputCanvas, 0, 0, w, h);
            const avatarUrl = avatarCanvas.toDataURL('image/jpeg', 0.75);
            onPhotoGenerated(avatarUrl);
          } else {
            onPhotoGenerated(url);
          }
        } catch {
          onPhotoGenerated(url);
        }
      }
    } catch (err) {
      console.error('Error cropping image:', err);
    } finally {
      setIsProcessingCrop(false);
    }
  }, [
    imageSrc,
    croppedAreaPixels,
    rotation,
    selectedBg,
    bgCleanThreshold,
    brightness,
    contrast,
    PHOTO_WIDTH,
    PHOTO_HEIGHT,
    onPhotoGenerated
  ]);

  // Automatically update single photo when adjustments (background/brightness/contrast/preset) change
  useEffect(() => {
    if (croppedAreaPixels) {
      const timer = setTimeout(() => {
        processCroppedPhoto();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [selectedBg, bgCleanThreshold, brightness, contrast, selectedPresetId]);

  // Generate full Print Sheet (6, 8, 12, or 16 photos with scissor cutting lines)
  useEffect(() => {
    if (!singlePhotoUrl) return;

    const img = new Image();
    img.onload = () => {
      const sheet = sheetCanvasRef.current;
      if (!sheet) return;
      const ctx = sheet.getContext('2d');
      if (!ctx) return;

      const is4x6 = paperFormat === '4x6';
      // High resolution standard: 4x6 at 300 DPI is 1800 x 1200 px; A4 is 2480 x 3508 px
      sheet.width = is4x6 ? 1800 : 2480;
      sheet.height = is4x6 ? 1200 : 3508;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sheet.width, sheet.height);

      ctx.fillStyle = '#64748b';
      ctx.font = is4x6 ? 'bold 22px sans-serif' : 'bold 28px sans-serif';
      ctx.fillText(
        `Masud Digital Hub Passport Photo Studio • ${activePreset.name} (${activePreset.subname}) • Quantity: ${quantity} Photos • ${is4x6 ? '4×6 Photo Paper' : 'A4 Sheet'}`,
        is4x6 ? 40 : 80,
        is4x6 ? 45 : 70
      );

      let cols = 3;
      let rows = 2;
      if (quantity === 6) {
        cols = 3;
        rows = 2;
      } else if (quantity === 8) {
        cols = 4;
        rows = 2;
      } else if (quantity === 12) {
        cols = is4x6 ? 4 : 3;
        rows = is4x6 ? 3 : 4;
      } else if (quantity === 16) {
        cols = 4;
        rows = 4;
      }

      const pW = activePreset.widthPx;
      const pH = activePreset.heightPx;

      const marginX = is4x6 ? 45 : 90;
      const marginY = is4x6 ? 60 : 120;
      const gapX = is4x6 ? 20 : 32;
      const gapY = is4x6 ? 20 : 32;

      const availW = sheet.width - marginX * 2;
      const availH = sheet.height - marginY * 2;

      const maxCellW = (availW - (cols - 1) * gapX) / cols;
      const maxCellH = (availH - (rows - 1) * gapY) / rows;

      const fitScale = Math.min(1.0, Math.min(maxCellW / pW, maxCellH / pH));
      const targetW = Math.round(pW * fitScale);
      const targetH = Math.round(pH * fitScale);

      const totalGridW = cols * targetW + (cols - 1) * gapX;
      const totalGridH = rows * targetH + (rows - 1) * gapY;
      const startX = Math.round((sheet.width - totalGridW) / 2);
      const startY = Math.round(marginY + (availH - totalGridH) / 2);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const index = r * cols + c;
          if (index >= quantity) break;

          const x = startX + c * (targetW + gapX);
          const y = startY + r * (targetH + gapY);

          ctx.drawImage(img, x, y, targetW, targetH);

          if (showCutLines) {
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 6]);
            ctx.strokeRect(x - 2, y - 2, targetW + 4, targetH + 4);
            ctx.setLineDash([]);
          }
        }
      }

      setPrintSheetUrl(sheet.toDataURL('image/jpeg', 0.95));
    };
    img.src = singlePhotoUrl;
  }, [singlePhotoUrl, quantity, paperFormat, showCutLines, activePreset]);

  if (!isOpen) return null;

  // File Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
          setCrop({ x: 0, y: 0 });
          setZoom(1);
          setRotation(0);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Direct Print via window.print
  const handlePrintSheet = () => {
    if (!printSheetUrl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Passport Photos Print Sheet - Masud Digital Hub</title>
          <style>
            @page {
              size: ${paperFormat === '4x6' ? '6in 4in' : 'A4'};
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: white;
            }
            img {
              max-width: 100vw;
              max-height: 100vh;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="${printSheetUrl}" onload="window.print();window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Download Single Photo
  const handleDownloadSingle = async () => {
    if (!singlePhotoUrl) {
      await processCroppedPhoto();
    }
    const targetUrl = singlePhotoUrl;
    if (!targetUrl) return;
    const link = document.createElement('a');
    link.download = `masud_digital_hub_passport_${selectedPresetId}_photo.jpg`;
    link.href = targetUrl;
    link.click();
  };

  // Download Full Sheet
  const handleDownloadSheet = () => {
    if (!printSheetUrl) return;
    const link = document.createElement('a');
    link.download = `masud_digital_hub_passport_photos_${quantity}_sheet.jpg`;
    link.href = printSheetUrl;
    link.click();
  };

  // Process & Continue to Sheet
  const handleApplyAndProceed = async () => {
    await processCroppedPhoto();
    setActiveTab('preview');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Hidden Render Canvas */}
        <canvas ref={sheetCanvasRef} className="hidden" />

        {/* Header Ribbon */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md">
              <Camera className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Passport Photo Maker (পাসপোর্ট ফটো মেকার)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Auto-crop 1.2in x 1.5in</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auto-crop 1.2in x 1.5in • Studio background replacement • 4x6 & A4 sheets ({quantity} photos)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="hidden sm:flex items-center p-1 bg-slate-800 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'editor' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Crop className="w-3.5 h-3.5" />
                <span>1. Drag & Crop (3:4)</span>
              </button>
              <button
                onClick={handleApplyAndProceed}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'preview' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>2. Print Sheet ({quantity} Pcs)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="sm:hidden flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex-1 py-2.5 text-center border-b-2 cursor-pointer ${
              activeTab === 'editor' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-slate-500'
            }`}
          >
            1. Drag & Crop (3:4)
          </button>
          <button
            onClick={handleApplyAndProceed}
            className={`flex-1 py-2.5 text-center border-b-2 cursor-pointer ${
              activeTab === 'preview' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-slate-500'
            }`}
          >
            2. Print Sheet ({quantity} Pcs)
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs text-slate-700">
          {activeTab === 'editor' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: react-easy-crop Viewport */}
              <div className="lg:col-span-6 flex flex-col items-center space-y-3">
                <div className="w-full flex items-center justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <Crop className="w-4 h-4" />
                    <span>Drag, Zoom & Align Photo (3:4 Ratio)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowFaceGuide(!showFaceGuide)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                        showFaceGuide
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {showFaceGuide ? 'Face Guide: ON' : 'Guide: OFF'}
                    </button>
                    <button
                      onClick={() => setShowGrid(!showGrid)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                        showGrid
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {showGrid ? 'Grid: ON' : 'Grid: OFF'}
                    </button>
                  </div>
                </div>

                {/* react-easy-crop Cropper Container */}
                <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-xl select-none">
                  {imageSrc ? (
                    <>
                      <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspectRatio}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        onCropComplete={onCropComplete}
                        showGrid={showGrid}
                        cropShape="rect"
                        style={{
                          containerStyle: {
                            backgroundColor: '#090d16'
                          },
                          cropAreaStyle: {
                            border: '2px solid #10b981',
                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)'
                          }
                        }}
                      />

                      {/* Oval Biometric Face Guide Overlay */}
                      {showFaceGuide && (
                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                          <div className="w-[180px] h-[240px] border-2 border-dashed border-amber-300/80 rounded-[50%] shadow-[0_0_12px_rgba(251,191,36,0.4)] flex flex-col items-center justify-between py-3 relative">
                            {/* Crown level */}
                            <span className="text-[9px] font-bold text-amber-300 bg-slate-950/80 px-1.5 py-0.5 rounded border border-amber-400/30">
                              Top of Head (Crown)
                            </span>

                            {/* Eye line */}
                            <div className="w-20 border-b border-amber-300/60" />

                            {/* Chin level */}
                            <span className="text-[9px] font-bold text-amber-300 bg-slate-950/80 px-1.5 py-0.5 rounded border border-amber-400/30">
                              Chin Line
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                      <ImageIcon className="w-10 h-10 text-slate-600" />
                      <p className="text-xs">No photo uploaded yet</p>
                    </div>
                  )}
                </div>

                {/* Drag, Zoom & Rotate Instruction bar */}
                <div className="w-full bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Zoom:</span>
                    </span>
                    <button
                      onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
                      className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-200 cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5 text-slate-700" />
                    </button>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.05}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-24 sm:w-32 accent-emerald-600 cursor-pointer"
                    />
                    <button
                      onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                      className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-200 cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5 text-slate-700" />
                    </button>
                    <span className="font-mono text-slate-800 font-bold">{Math.round(zoom * 100)}%</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                      title="Rotate 90° CCW"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                      <span>-90°</span>
                    </button>
                    <button
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                      title="Rotate 90° CW"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-emerald-600" />
                      <span>+90°</span>
                    </button>
                    <button
                      onClick={() => {
                        setCrop({ x: 0, y: 0 });
                        setZoom(1);
                        setRotation(0);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 text-[11px] font-semibold cursor-pointer"
                      title="Reset position"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* 1-Click Auto-Crop 1.2in x 1.5in & Dimension Presets */}
                <div className="w-full space-y-2 bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Standard Dimension Presets:</span>
                    </span>
                    <button
                      onClick={handleAutoCrop1_2x1_5}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                      title="Auto-crop standard 1.2in x 1.5in size"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>⚡ Auto-crop 1.2in x 1.5in</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {DIMENSION_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPreset(p)}
                        className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedPresetId === p.id
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black">{p.name}</span>
                          {p.badge && (
                            <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${selectedPresetId === p.id ? 'bg-amber-300 text-slate-900' : 'bg-emerald-100 text-emerald-800'}`}>
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <span className={`text-[9px] block truncate ${selectedPresetId === p.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {p.subname}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Controls, Background Colors & Processing */}
              <div className="lg:col-span-6 space-y-4">
                {/* 1. Upload candidate photo */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>Step 1: Upload or Replace Photo</span>
                    </h3>
                    <button
                      onClick={() => {
                        setImageSrc(SAMPLE_CANDIDATE_PHOTO);
                        setCrop({ x: 0, y: 0 });
                        setZoom(1);
                        setRotation(0);
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Use Demo Candidate
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Select Photo from Device</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Supports JPG, PNG, and WebP. Works on phones, tablets, and desktop computers.
                  </p>
                </div>

                {/* 2. Studio Background Colors */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Palette className="w-4 h-4 text-indigo-600" />
                      <span>Step 2: Clean Studio Background</span>
                    </h3>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Standard Colors
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {BG_COLORS.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => setSelectedBg(bg.id)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          selectedBg === bg.id
                            ? 'ring-2 ring-emerald-600 bg-white shadow-xs font-bold'
                            : 'bg-white/80 hover:bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full border shadow-inner ${bg.border}`}
                          style={{ backgroundColor: bg.color }}
                        />
                        <span className="text-[10px] leading-tight truncate w-full">{bg.name}</span>
                      </button>
                    ))}
                  </div>

                  {selectedBg !== 'original' && (
                    <div className="pt-2 border-t border-slate-200/70 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700">
                          Auto-Background Cleaning Sensitivity:
                        </span>
                        <span className="font-mono font-bold text-emerald-700">{bgCleanThreshold}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="80"
                        value={bgCleanThreshold}
                        onChange={(e) => setBgCleanThreshold(Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* 3. Brightness & Contrast Studio Sliders */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-600" />
                    <span>Step 3: Studio Lighting</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-600 font-semibold flex items-center gap-1">
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                          <span>Brightness:</span>
                        </span>
                        <span className="font-mono font-bold text-slate-800">{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="70"
                        max="140"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-600 font-semibold flex items-center gap-1">
                          <Contrast className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Contrast:</span>
                        </span>
                        <span className="font-mono font-bold text-slate-800">{contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="70"
                        max="140"
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Choose Print Quantity & Action Button */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-emerald-600" />
                      <span>Step 4: Select Quantity & Process</span>
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-800">
                      Print-Ready Grid
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[6, 8, 12, 16].map((qty) => (
                      <button
                        key={qty}
                        onClick={() => setQuantity(qty as 6 | 8 | 12 | 16)}
                        className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          quantity === qty
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-black'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <span className="block text-xs sm:text-sm font-black">{qty} Pcs</span>
                        <span className={`text-[9px] block ${quantity === qty ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {qty === 6 ? '6 Photos' : qty === 8 ? '8 Photos' : qty === 12 ? '12 Photos' : '16 Photos'}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Primary Action Button: Process & Go to Print Sheet */}
                  <div className="pt-1 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleApplyAndProceed}
                      disabled={isProcessingCrop}
                      className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isProcessingCrop ? (
                        <span>Processing Cropped Photo...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Process Crop & Continue to Sheet ({quantity} Photos)</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleDownloadSingle}
                      className="py-3 px-4 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      title={`Download Single ${activePreset.name} Passport Photo`}
                    >
                      <Download className="w-4 h-4 text-emerald-600" />
                      <span>Single ({activePreset.name})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ======================== TAB 2: PRINT SHEET PREVIEW ======================== */
            <div className="space-y-5">
              {/* Top Controls Ribbon */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 px-2">Quantity:</span>
                    {[6, 8, 12, 16].map((qty) => (
                      <button
                        key={qty}
                        onClick={() => setQuantity(qty as 6 | 8 | 12 | 16)}
                        className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                          quantity === qty ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {qty} Pcs
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 px-2">Paper:</span>
                    <button
                      onClick={() => setPaperFormat('4x6')}
                      className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                        paperFormat === '4x6' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      4×6 Photo Paper
                    </button>
                    <button
                      onClick={() => setPaperFormat('A4')}
                      className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                        paperFormat === 'A4' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      A4 Sheet
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCutLines(!showCutLines)}
                    className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
                      showCutLines ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>{showCutLines ? 'Scissor Cut Marks: ON' : 'Cut Marks: OFF'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('editor')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    <span>Adjust / Re-Crop Photo</span>
                  </button>
                </div>
              </div>

              {/* Rendered Printable Sheet Preview */}
              <div className="p-4 bg-slate-100 rounded-3xl border border-slate-200 flex justify-center overflow-x-auto">
                {printSheetUrl ? (
                  <div className="shadow-2xl rounded-xl overflow-hidden border border-slate-300 max-w-full bg-white">
                    <img
                      src={printSheetUrl}
                      alt="Print Sheet Preview"
                      className="max-h-[50vh] object-contain"
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400">Rendering sheet preview...</div>
                )}
              </div>

              {/* Final Output Actions */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Ready to Print or Download ({activePreset.name})
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Crisp 300 DPI resolution with {activePreset.name} cropped photos formatted for 4×6 photo paper or A4 sheets with cutting guidelines.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadSingle}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Single ({activePreset.name}) JPG</span>
                  </button>

                  <button
                    onClick={handleDownloadSheet}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Sheet (JPG)</span>
                  </button>

                  <button
                    onClick={handlePrintSheet}
                    className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Printer className="w-4 h-4 text-amber-300" />
                    <span>Print Sheet / Save as PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
