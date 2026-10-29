import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Printer, 
  Upload, 
  Download, 
  Sparkles, 
  Check, 
  RotateCw, 
  RotateCcw,
  Scissors, 
  Sliders, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  FileText, 
  ShieldCheck, 
  ArrowLeft, 
  Eye, 
  Copy, 
  Zap, 
  CheckCircle2, 
  Sun, 
  Contrast, 
  Palette,
  Maximize2,
  Move,
  Crop,
  Layers,
  Circle,
  Square,
  Lock,
  Unlock
} from 'lucide-react';
import { imagesToPDF } from '../../services/pdfService';
import { applyAdjustmentsToImageData, DEFAULT_ADJUSTMENTS } from '../../services/imageProcessing';

// Realistic WhatsApp sample photo
const SAMPLE_WHATSAPP_PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=70';

const BG_COLOR_OPTIONS = [
  { id: 'white', name: 'Studio White (সাদা / सफेद)', color: '#ffffff', border: 'border-slate-300' },
  { id: 'blue', name: 'Official Blue (নীল / नीला)', color: '#bfdbfe', border: 'border-blue-400' },
  { id: 'gray', name: 'Light Gray (ধূসর / ग्रे)', color: '#e2e8f0', border: 'border-slate-400' },
  { id: 'original', name: 'Original (আসল / ओरिजिनल)', color: 'transparent', border: 'border-slate-300' }
];

const QUANTITY_PRESETS = [
  { count: 1, label: '1 Photo', desc: 'Single' },
  { count: 4, label: '4 Photos', desc: 'Small' },
  { count: 6, label: '6 Photos', desc: 'Standard 4x6' },
  { count: 8, label: '8 Photos', desc: 'Studio' },
  { count: 12, label: '12 Photos', desc: 'A4 Page' },
  { count: 16, label: '16 Photos', desc: 'Full A4' }
];

type AspectMode = 'passport' | 'square' | '4:3' | 'free';

interface CropRect {
  x: number; // percentage 0 to 100
  y: number; // percentage 0 to 100
  width: number; // percentage 0 to 100
  height: number; // percentage 0 to 100
}

interface WhatsAppExpressPrintToolProps {
  onNavigateBack: () => void;
  lang?: 'en' | 'bn';
  initialImageSrc?: string | null;
}

export const WhatsAppExpressPrintTool: React.FC<WhatsAppExpressPrintToolProps> = ({
  onNavigateBack,
  lang = 'en',
  initialImageSrc = null
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(initialImageSrc || SAMPLE_WHATSAPP_PHOTO);
  const [imgNaturalSize, setImgNaturalSize] = useState<{ width: number; height: number }>({ width: 600, height: 800 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);

  // Active view tab (Editor or Print Sheet)
  const [activeTab, setActiveTab] = useState<'edit' | 'print'>('edit');

  // Interactive Crop State (in percentage 0-100)
  const [crop, setCrop] = useState<CropRect>({ x: 12, y: 8, width: 76, height: 84 });
  const [aspectMode, setAspectMode] = useState<AspectMode>('passport');
  const [showOvalGuide, setShowOvalGuide] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Full manual editing controls
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [fineStraighten, setFineStraighten] = useState<number>(0); // -45 to +45 deg
  const [brightness, setBrightness] = useState<number>(105); // 0 to 200
  const [contrast, setContrast] = useState<number>(110);   // 0 to 200
  const [sharpness, setSharpness] = useState<number>(35);   // 0 to 100
  const [saturation, setSaturation] = useState<number>(100); // 0 to 200
  const [bgColor, setBgColor] = useState<string>('white');
  const [showCutMarks, setShowCutMarks] = useState<boolean>(true);

  // Print sheet options
  const [quantity, setQuantity] = useState<number>(6);
  const [paperFormat, setPaperFormat] = useState<'4x6' | 'A4'>('4x6');

  // Outputs
  const [singlePassportUrl, setSinglePassportUrl] = useState<string | null>(null);
  const [printSheetUrl, setPrintSheetUrl] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  // Dragging crop handles state
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cropStart, setCropStart] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 });

  // Standard Indian Passport dimensions (3.5cm x 4.5cm at 300 DPI = 413 x 531 px)
  const PHOTO_W = 413;
  const PHOTO_H = 531;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const singleCanvasRef = useRef<HTMLCanvasElement>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-Crop preset calculator based on aspect ratio
  const calculateDefaultCrop = useCallback((aspect: AspectMode, imgW: number, imgH: number): CropRect => {
    let targetRatio = 3.5 / 4.5; // width / height
    if (aspect === 'square') targetRatio = 1;
    if (aspect === '4:3') targetRatio = 4 / 3;
    if (aspect === 'free') {
      return { x: 5, y: 5, width: 90, height: 90 };
    }

    const imgRatio = imgW / imgH;
    let widthPercent = 75;
    let heightPercent = (widthPercent / targetRatio) * imgRatio;

    if (heightPercent > 92) {
      heightPercent = 90;
      widthPercent = heightPercent * targetRatio * (imgH / imgW);
    }

    const x = Math.max(0, (100 - widthPercent) / 2);
    const y = Math.max(0, (100 - heightPercent) / 3); // portrait face usually sits slightly higher

    return {
      x: Number(x.toFixed(1)),
      y: Number(y.toFixed(1)),
      width: Number(widthPercent.toFixed(1)),
      height: Number(heightPercent.toFixed(1))
    };
  }, []);

  // Process incoming image
  const processNewImage = useCallback((dataUrl: string) => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const nw = img.naturalWidth || 600;
      const nh = img.naturalHeight || 800;
      setImgNaturalSize({ width: nw, height: nh });

      // Auto-detect orientation: if sideways landscape, rotate 90
      let rot = 0;
      if (nw > nh * 1.25) {
        rot = 90;
      }
      setRotation(rot);
      setFineStraighten(0);
      setBrightness(105);
      setContrast(110);
      setSharpness(35);
      setSaturation(100);

      // Set default crop for Indian Passport (3.5:4.5)
      const defCrop = calculateDefaultCrop('passport', nw, nh);
      setCrop(defCrop);
      setAspectMode('passport');
      setImageSrc(dataUrl);
      setIsProcessing(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    };
    img.src = dataUrl;
  }, [calculateDefaultCrop]);

  // Global Paste (Ctrl+V) listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              if (reader.result) {
                processNewImage(reader.result as string);
              }
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processNewImage]);

  // Switch Aspect Mode and adapt crop box
  const handleSwitchAspect = (mode: AspectMode) => {
    setAspectMode(mode);
    const newCrop = calculateDefaultCrop(mode, imgNaturalSize.width, imgNaturalSize.height);
    setCrop(newCrop);
  };

  // Reset to full image
  const handleResetFullCrop = () => {
    setAspectMode('free');
    setCrop({ x: 2, y: 2, width: 96, height: 96 });
  };

  // Auto-Crop to Passport Face
  const handleAutoCropPassport = () => {
    setAspectMode('passport');
    const newCrop = calculateDefaultCrop('passport', imgNaturalSize.width, imgNaturalSize.height);
    setCrop(newCrop);
    setRotation(0);
    setFineStraighten(0);
    setBrightness(108);
    setContrast(112);
    setSharpness(40);
  };

  // Dragging & Resizing Crop Box
  const handleCropMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveHandle(handle);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setCropStart({ ...crop });
  };

  const handleContainerMouseMove = useCallback((e: MouseEvent) => {
    if (!activeHandle || !cropContainerRef.current) return;

    const rect = cropContainerRef.current.getBoundingClientRect();
    const deltaXPercent = ((e.clientX - dragStartPos.x) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - dragStartPos.y) / rect.height) * 100;

    let targetRatio = 0;
    if (aspectMode === 'passport') targetRatio = 3.5 / 4.5;
    else if (aspectMode === 'square') targetRatio = 1;
    else if (aspectMode === '4:3') targetRatio = 4 / 3;

    // Aspect conversion between container pixels and percent
    const containerAspect = rect.width / rect.height;

    setCrop(() => {
      let nextX = cropStart.x;
      let nextY = cropStart.y;
      let nextW = cropStart.width;
      let nextH = cropStart.height;

      if (activeHandle === 'move') {
        nextX = Math.max(0, Math.min(100 - nextW, cropStart.x + deltaXPercent));
        nextY = Math.max(0, Math.min(100 - nextH, cropStart.y + deltaYPercent));
      } else if (activeHandle === 'se') {
        nextW = Math.max(15, Math.min(100 - cropStart.x, cropStart.width + deltaXPercent));
        if (targetRatio > 0) {
          nextH = (nextW / targetRatio) * containerAspect;
          if (cropStart.y + nextH > 100) {
            nextH = 100 - cropStart.y;
            nextW = nextH * targetRatio / containerAspect;
          }
        } else {
          nextH = Math.max(15, Math.min(100 - cropStart.y, cropStart.height + deltaYPercent));
        }
      } else if (activeHandle === 'nw') {
        const potentialW = Math.max(15, cropStart.width - deltaXPercent);
        const deltaRealX = cropStart.width - potentialW;
        nextX = Math.max(0, cropStart.x + deltaRealX);
        nextW = cropStart.width + (cropStart.x - nextX);

        if (targetRatio > 0) {
          nextH = (nextW / targetRatio) * containerAspect;
          nextY = Math.max(0, cropStart.y + cropStart.height - nextH);
        } else {
          const potentialH = Math.max(15, cropStart.height - deltaYPercent);
          const deltaRealY = cropStart.height - potentialH;
          nextY = Math.max(0, cropStart.y + deltaRealY);
          nextH = cropStart.height + (cropStart.y - nextY);
        }
      } else if (activeHandle === 'ne') {
        nextW = Math.max(15, Math.min(100 - cropStart.x, cropStart.width + deltaXPercent));
        if (targetRatio > 0) {
          nextH = (nextW / targetRatio) * containerAspect;
          nextY = Math.max(0, cropStart.y + cropStart.height - nextH);
        } else {
          const potentialH = Math.max(15, cropStart.height - deltaYPercent);
          nextY = Math.max(0, cropStart.y + (cropStart.height - potentialH));
          nextH = cropStart.height + (cropStart.y - nextY);
        }
      } else if (activeHandle === 'sw') {
        const potentialW = Math.max(15, cropStart.width - deltaXPercent);
        nextX = Math.max(0, cropStart.x + (cropStart.width - potentialW));
        nextW = cropStart.width + (cropStart.x - nextX);

        if (targetRatio > 0) {
          nextH = (nextW / targetRatio) * containerAspect;
          if (cropStart.y + nextH > 100) {
            nextH = 100 - cropStart.y;
            nextW = nextH * targetRatio / containerAspect;
          }
        } else {
          nextH = Math.max(15, Math.min(100 - cropStart.y, cropStart.height + deltaYPercent));
        }
      } else if (activeHandle === 's') {
        nextH = Math.max(15, Math.min(100 - cropStart.y, cropStart.height + deltaYPercent));
        if (targetRatio > 0) {
          nextW = nextH * targetRatio / containerAspect;
          if (nextX + nextW > 100) nextX = 100 - nextW;
        }
      } else if (activeHandle === 'e') {
        nextW = Math.max(15, Math.min(100 - cropStart.x, cropStart.width + deltaXPercent));
        if (targetRatio > 0) {
          nextH = (nextW / targetRatio) * containerAspect;
          if (nextY + nextH > 100) nextY = 100 - nextH;
        }
      }

      return {
        x: Number(nextX.toFixed(1)),
        y: Number(nextY.toFixed(1)),
        width: Number(nextW.toFixed(1)),
        height: Number(nextH.toFixed(1))
      };
    });
  }, [activeHandle, dragStartPos, cropStart, aspectMode]);

  const handleContainerMouseUp = useCallback(() => {
    setActiveHandle(null);
  }, []);

  useEffect(() => {
    if (activeHandle) {
      window.addEventListener('mousemove', handleContainerMouseMove);
      window.addEventListener('mouseup', handleContainerMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleContainerMouseMove);
        window.removeEventListener('mouseup', handleContainerMouseUp);
      };
    }
  }, [activeHandle, handleContainerMouseMove, handleContainerMouseUp]);

  // Render Cropped Passport Canvas
  const renderCroppedPassport = useCallback(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = singleCanvasRef.current;
      if (!canvas) return;

      canvas.width = PHOTO_W;
      canvas.height = PHOTO_H;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.clearRect(0, 0, PHOTO_W, PHOTO_H);

      // Background color replacement
      if (bgColor !== 'original') {
        const bgObj = BG_COLOR_OPTIONS.find((b) => b.id === bgColor);
        ctx.fillStyle = bgObj ? bgObj.color : '#ffffff';
        ctx.fillRect(0, 0, PHOTO_W, PHOTO_H);
      }

      // Convert percentage crop to original image pixels
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      const srcX = (crop.x / 100) * nw;
      const srcY = (crop.y / 100) * nh;
      const srcW = (crop.width / 100) * nw;
      const srcH = (crop.height / 100) * nh;

      // Temporary offscreen canvas for rotation and crop
      const offCanvas = document.createElement('canvas');
      offCanvas.width = srcW;
      offCanvas.height = srcH;
      const offCtx = offCanvas.getContext('2d');
      if (offCtx) {
        offCtx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
      }

      // Draw onto target passport canvas with rotation & fine tilt
      ctx.save();
      ctx.translate(PHOTO_W / 2, PHOTO_H / 2);
      const totalRad = (rotation + fineStraighten) * (Math.PI / 180);
      ctx.rotate(totalRad);

      // Draw cropped segment fitted to passport dimensions
      ctx.drawImage(offCanvas, -PHOTO_W / 2, -PHOTO_H / 2, PHOTO_W, PHOTO_H);
      ctx.restore();

      // Apply real pixel-level adjustments (Sharpness unsharp mask, brightness, contrast, saturation)
      try {
        const imgData = ctx.getImageData(0, 0, PHOTO_W, PHOTO_H);
        const adjustedData = applyAdjustmentsToImageData(imgData, {
          ...DEFAULT_ADJUSTMENTS,
          brightness,
          contrast,
          sharpness,
          saturation
        });
        ctx.putImageData(adjustedData, 0, 0);
      } catch (err) {
        console.warn('Canvas pixel adjustment fallback:', err);
      }

      // Outer thin passport photo border
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, PHOTO_W, PHOTO_H);

      const url = canvas.toDataURL('image/jpeg', 0.98);
      setSinglePassportUrl(url);
    };
    img.src = imageSrc;
  }, [imageSrc, crop, rotation, fineStraighten, brightness, contrast, sharpness, saturation, bgColor]);

  useEffect(() => {
    renderCroppedPassport();
  }, [renderCroppedPassport]);

  // Render Print Sheet (4x6 or A4)
  const renderPrintSheet = useCallback(() => {
    if (!singlePassportUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const sheetCanvas = sheetCanvasRef.current;
      if (!sheetCanvas) return;

      const is4x6 = paperFormat === '4x6';
      const sheetW = is4x6 ? 1800 : 2480;
      const sheetH = is4x6 ? 1200 : 3508;

      sheetCanvas.width = sheetW;
      sheetCanvas.height = sheetH;
      const ctx = sheetCanvas.getContext('2d');
      if (!ctx) return;

      // Clean white sheet paper
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sheetW, sheetH);

      // Grid arrangement
      let cols = 3;
      let rows = 2;

      if (is4x6) {
        if (quantity <= 4) { cols = 2; rows = 2; }
        else if (quantity <= 6) { cols = 3; rows = 2; }
        else { cols = 4; rows = 2; }
      } else {
        // A4
        if (quantity <= 6) { cols = 3; rows = 2; }
        else if (quantity <= 8) { cols = 4; rows = 2; }
        else if (quantity <= 12) { cols = 4; rows = 3; }
        else { cols = 4; rows = 4; }
      }

      const pw = PHOTO_W;
      const ph = PHOTO_H;
      const gapX = is4x6 ? 30 : 40;
      const gapY = is4x6 ? 30 : 40;

      const totalGridW = cols * pw + (cols - 1) * gapX;
      const totalGridH = rows * ph + (rows - 1) * gapY;

      const startX = Math.max(30, (sheetW - totalGridW) / 2);
      const startY = Math.max(40, (sheetH - totalGridH) / 2 - 20);

      let drawn = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (drawn >= quantity) break;

          const x = startX + c * (pw + gapX);
          const y = startY + r * (ph + gapY);

          // Draw Photo
          ctx.drawImage(img, x, y, pw, ph);

          // Thin cutting outline
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, pw, ph);

          // Dashed Cutting Marks
          if (showCutMarks) {
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);

            // Top guide
            ctx.beginPath();
            ctx.moveTo(x - 8, y);
            ctx.lineTo(x + pw + 8, y);
            ctx.stroke();

            // Bottom guide
            ctx.beginPath();
            ctx.moveTo(x - 8, y + ph);
            ctx.lineTo(x + pw + 8, y + ph);
            ctx.stroke();

            // Left guide
            ctx.beginPath();
            ctx.moveTo(x, y - 8);
            ctx.lineTo(x, y + ph + 8);
            ctx.stroke();

            // Right guide
            ctx.beginPath();
            ctx.moveTo(x + pw, y - 8);
            ctx.lineTo(x + pw, y + ph + 8);
            ctx.stroke();

            ctx.setLineDash([]);
          }

          drawn++;
        }
      }

      // Studio Branding Footer
      ctx.fillStyle = '#64748b';
      ctx.font = '24px sans-serif';
      ctx.fillText(
        `Masud Digital Hub • Professional Passport Studio • ${quantity} Copies (3.5x4.5 cm) • ${paperFormat.toUpperCase()} Sheet`,
        40,
        sheetH - 30
      );

      const sheetUrl = sheetCanvas.toDataURL('image/jpeg', 0.96);
      setPrintSheetUrl(sheetUrl);
    };
    img.src = singlePassportUrl;
  }, [singlePassportUrl, quantity, paperFormat, showCutMarks]);

  useEffect(() => {
    renderPrintSheet();
  }, [renderPrintSheet]);

  // 1-Click Direct Print Window
  const handleDirectPrint = () => {
    if (!printSheetUrl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Direct Print - Masud Digital Hub Passport Photos</title>
          <style>
            @page { size: ${paperFormat === '4x6' ? '4in 6in' : 'A4'}; margin: 0; }
            body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: white; }
            img { width: 100%; height: 100%; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${printSheetUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // PDF Export
  const handleDownloadPdf = async () => {
    if (!printSheetUrl) return;
    setIsExportingPdf(true);
    try {
      const pdfBlob = await imagesToPDF([{ dataUrl: printSheetUrl }], paperFormat === 'A4' ? 'A4' : 'Letter');
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Masud_Digital_Hub_Passport_Photos_${quantity}copies.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Download Single Cropped Photo
  const handleDownloadSingleJpg = () => {
    if (!singlePassportUrl) return;
    const a = document.createElement('a');
    a.href = singlePassportUrl;
    a.download = 'Customer_Cropped_Passport_3.5x4.5cm.jpg';
    a.click();
  };

  // File picker handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          processNewImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Hidden processing canvases */}
      <canvas ref={singleCanvasRef} className="hidden" />
      <canvas ref={sheetCanvasRef} className="hidden" />

      {/* Top Header & Fast Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateBack}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Back to All Tools"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Crop className="w-4 h-4" />
              </span>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Interactive Photo Cropper & Direct Print Studio
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                ⚡ फुल एडिट व क्रॉप
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'bn'
                ? 'ইচ্ছা মতো ছবি কাটুন (Crop), সোজা করুন, ব্রাইটনেস ও কালার ঠিক করুন এবং সরাসরি প্রিন্ট করুন।'
                : 'Free crop with handles, rotate, straighten, adjust brightness/sharpness, or auto-crop to 3.5cm x 4.5cm passport size.'}
            </p>
          </div>
        </div>

        {/* View Switcher & Direct Print */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'edit' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Crop className="w-3.5 h-3.5" />
              <span>1. Crop & Edit</span>
            </button>
            <button
              onClick={() => setActiveTab('print')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'print' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>2. Print Sheet</span>
            </button>
          </div>

          <button
            onClick={handleDirectPrint}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer ring-2 ring-emerald-500/40"
            title="Directly open browser printer dialog"
          >
            <Printer className="w-4 h-4 animate-pulse" />
            <span>🖨️ DIRECT PRINT</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Interactive Full Image Cropper Stage (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            {/* Cropper Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Crop className="w-4 h-4 text-emerald-600" />
                <span>Crop Ratio (ক্রপ অনুপাত):</span>
              </div>

              {/* Aspect Ratio Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => handleSwitchAspect('passport')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    aspectMode === 'passport' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700'
                  }`}
                  title="3.5cm x 4.5cm Standard Indian Passport Ratio"
                >
                  Passport 3.5:4.5
                </button>
                <button
                  onClick={() => handleSwitchAspect('square')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    aspectMode === 'square' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700'
                  }`}
                  title="1:1 Square (Visa / ID)"
                >
                  1:1 Square
                </button>
                <button
                  onClick={() => handleSwitchAspect('4:3')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    aspectMode === '4:3' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700'
                  }`}
                  title="4:3 Ratio"
                >
                  4:3
                </button>
                <button
                  onClick={() => handleSwitchAspect('free')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    aspectMode === 'free' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700'
                  }`}
                  title="Freeform Crop - resize any corner or edge freely"
                >
                  Free Crop (ফ্রি)
                </button>
              </div>

              {/* Auto Crop & Reset Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleAutoCropPassport}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  title="Auto-center face in standard passport frame"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Auto-Crop</span>
                </button>
                <button
                  onClick={handleResetFullCrop}
                  className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-100 cursor-pointer"
                  title="Reset to entire photo"
                >
                  Full Photo
                </button>
              </div>
            </div>

            {/* Interactive Image Cropper Canvas Stage */}
            <div
              ref={cropContainerRef}
              className="relative w-full max-h-[480px] bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center select-none"
              style={{ minHeight: '340px' }}
            >
              {imageSrc ? (
                <div className="relative inline-block max-w-full max-h-[460px]">
                  {/* Base Image */}
                  <img
                    src={imageSrc}
                    alt="Original Customer Upload"
                    className="max-h-[450px] w-auto max-w-full object-contain pointer-events-none block"
                    style={{
                      transform: `rotate(${rotation}deg)`
                    }}
                  />

                  {/* Darkened Semi-Transparent Backdrop Mask */}
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `rgba(0, 0, 0, 0.55)`,
                      clipPath: `polygon(
                        0% 0%, 100% 0%, 100% 100%, 0% 100%,
                        0% 0%,
                        ${crop.x}% ${crop.y}%,
                        ${crop.x}% ${crop.y + crop.height}%,
                        ${crop.x + crop.width}% ${crop.y + crop.height}%,
                        ${crop.x + crop.width}% ${crop.y}%,
                        ${crop.x}% ${crop.y}%
                      )`
                    }}
                  />

                  {/* Interactive Crop Rectangle Box */}
                  <div
                    onMouseDown={(e) => handleCropMouseDown(e, 'move')}
                    className="absolute border-2 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)] cursor-move select-none"
                    style={{
                      left: `${crop.x}%`,
                      top: `${crop.y}%`,
                      width: `${crop.width}%`,
                      height: `${crop.height}%`
                    }}
                  >
                    {/* Rule of Thirds Grid Lines */}
                    {showGrid && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute left-1/3 top-0 bottom-0 w-[1px] bg-white/40" />
                        <div className="absolute left-2/3 top-0 bottom-0 w-[1px] bg-white/40" />
                        <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-white/40" />
                        <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-white/40" />
                      </div>
                    )}

                    {/* Optional Oval Face Guide Overlay (User can toggle on/off!) */}
                    {showOvalGuide && (
                      <div className="absolute inset-x-[12%] inset-y-[10%] rounded-[50%] border-2 border-dashed border-amber-300 pointer-events-none flex items-center justify-center shadow-xs">
                        <div className="w-full h-[1px] bg-amber-300/40" />
                      </div>
                    )}

                    {/* Crop Dimensions Tag */}
                    <div className="absolute -top-6 left-0 bg-slate-900/90 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-sm pointer-events-none whitespace-nowrap">
                      {aspectMode === 'passport' ? '3.5 x 4.5 cm' : `${Math.round(crop.width)}% x ${Math.round(crop.height)}%`}
                    </div>

                    {/* 4 Corner Drag Handles */}
                    <div
                      onMouseDown={(e) => handleCropMouseDown(e, 'nw')}
                      className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-emerald-600 rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                    />
                    <div
                      onMouseDown={(e) => handleCropMouseDown(e, 'ne')}
                      className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-emerald-600 rounded-full cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                    />
                    <div
                      onMouseDown={(e) => handleCropMouseDown(e, 'sw')}
                      className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-emerald-600 rounded-full cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                    />
                    <div
                      onMouseDown={(e) => handleCropMouseDown(e, 'se')}
                      className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-emerald-600 rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                    />

                    {/* 2 Side Drag Handles */}
                    <div
                      onMouseDown={(e) => handleCropMouseDown(e, 'e')}
                      className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-5 bg-white border-2 border-emerald-600 rounded-md cursor-ew-resize shadow-xs"
                    />
                    <div
                      onMouseDown={(e) => handleCropMouseDown(e, 's')}
                      className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-5 h-3 bg-white border-2 border-emerald-600 rounded-md cursor-ns-resize shadow-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400">Please upload an image</div>
              )}
            </div>

            {/* Quick Helper Notes & Guides */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-600">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={showOvalGuide}
                    onChange={(e) => setShowOvalGuide(e.target.checked)}
                    className="w-3.5 h-3.5 text-emerald-600 rounded"
                  />
                  <span>Show Oval Face Guide (গোল গাইড)</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="w-3.5 h-3.5 text-emerald-600 rounded"
                  />
                  <span>Grid Lines (গ্রিড)</span>
                </label>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setRotation((r) => (r + 270) % 360)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
                  title="Rotate Left 90°"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
                  title="Rotate Right 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" />
                  <span>New Photo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Full Manual Sliders Panel: Brightness, Contrast, Sharpness, Tilt Straightening */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Adjustments & Lighting (উজ্জ্বলতা ও স্পষ্টতা)</span>
              </h3>
              <button
                onClick={() => {
                  setBrightness(100);
                  setContrast(100);
                  setSharpness(0);
                  setSaturation(100);
                  setFineStraighten(0);
                }}
                className="text-[11px] text-slate-400 hover:text-slate-700 font-semibold cursor-pointer"
              >
                Reset Sliders
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              {/* Brightness */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] text-slate-700 font-semibold">
                  <span>Brightness (উজ্জ্বলতা):</span>
                  <span className="font-mono text-emerald-700">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={180}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] text-slate-700 font-semibold">
                  <span>Contrast (কনট্রাস্ট):</span>
                  <span className="font-mono text-emerald-700">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={180}
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>

              {/* WhatsApp Blur Sharpness */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] text-slate-700 font-semibold">
                  <span>Sharpness (শার্পনেস / ক্ল্যারিটি):</span>
                  <span className="font-mono text-emerald-700">{sharpness}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sharpness}
                  onChange={(e) => setSharpness(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>

              {/* Fine Straighten Tilt (-30 to +30 deg) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] text-slate-700 font-semibold">
                  <span>Tilt Straighten (কোণ সোজা করুন):</span>
                  <span className="font-mono text-emerald-700">{fineStraighten > 0 ? `+${fineStraighten}°` : `${fineStraighten}°`}</span>
                </div>
                <input
                  type="range"
                  min={-30}
                  max={30}
                  value={fineStraighten}
                  onChange={(e) => setFineStraighten(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Background Color Picker */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                Background Color (ব্যাকগ্রাউন্ড পরিবর্তন):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BG_COLOR_OPTIONS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setBgColor(bg.id)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 cursor-pointer transition-all ${
                      bgColor === bg.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-2xs ring-1 ring-emerald-500/30'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border ${bg.border} shrink-0`}
                      style={{ backgroundColor: bg.color === 'transparent' ? '#cbd5e1' : bg.color }}
                    />
                    <span className="truncate">{bg.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Cropped Photo Preview & High-Res Print Sheet (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Live Cropped Result Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>Cropped Passport Preview</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                3.5cm x 4.5cm
              </span>
            </div>

            <div className="flex items-center justify-center p-3 bg-slate-100/70 rounded-xl">
              <div className="w-[180px] aspect-[35/45] bg-white rounded-lg shadow-md overflow-hidden border border-slate-300 flex items-center justify-center">
                {singlePassportUrl ? (
                  <img
                    src={singlePassportUrl}
                    alt="Cropped Passport Preview"
                    className="w-full h-full object-contain pointer-events-none"
                  />
                ) : (
                  <div className="text-xs text-slate-400">Generating preview...</div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleDownloadSingleJpg}
                className="flex-1 py-2 px-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Download Photo JPG</span>
              </button>

              <button
                onClick={() => setActiveTab('print')}
                className="py-2 px-3 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View Sheet</span>
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Print Sheet Options & Direct Print Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-emerald-600" />
                  <span>Print Sheet Setup</span>
                </h3>
              </div>

              {/* Paper Format Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setPaperFormat('4x6')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    paperFormat === '4x6' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  4x6 Paper
                </button>
                <button
                  onClick={() => setPaperFormat('A4')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    paperFormat === 'A4' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  A4 Page
                </button>
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Copies (ছবির সংখ্যা):
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {QUANTITY_PRESETS.map((q) => (
                  <button
                    key={q.count}
                    onClick={() => setQuantity(q.count)}
                    className={`py-1.5 px-1 text-center rounded-xl border transition-all cursor-pointer ${
                      quantity === q.count
                        ? 'border-emerald-600 bg-emerald-600 text-white font-extrabold shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold'
                    }`}
                  >
                    <div className="text-xs">{q.count} Photos</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sheet Thumbnail Preview */}
            <div className="relative group max-h-[170px] overflow-hidden rounded-xl border border-slate-300 bg-slate-900/5 flex items-center justify-center p-2">
              {printSheetUrl ? (
                <img
                  src={printSheetUrl}
                  alt="Print Sheet Layout"
                  className="max-h-[150px] w-auto object-contain shadow-xs rounded"
                />
              ) : (
                <div className="text-xs text-slate-400">Rendering sheet...</div>
              )}
            </div>

            {/* Giant Direct Print Button */}
            <button
              onClick={handleDirectPrint}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-99 ring-2 ring-emerald-500/50"
            >
              <Printer className="w-5 h-5 animate-pulse" />
              <span>DIRECT PRINT (डायरेक्ट प्रिंट करें)</span>
            </button>

            {/* PDF Export */}
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-rose-600" />
              <span>{isExportingPdf ? 'Generating PDF Document...' : 'Download Print Sheet PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
