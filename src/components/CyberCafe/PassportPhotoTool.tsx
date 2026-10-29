import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  FileText,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Circle,
  Square,
  Move,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Palette
} from 'lucide-react';
import { imagesToPDF } from '../../services/pdfService';
import { 
  applyAdjustmentsToImageData, 
  DEFAULT_ADJUSTMENTS, 
  ImageAdjustments,
  blobToDataUrl,
  sharpenImageData
} from '../../services/imageProcessing';

const SAMPLE_PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80';

export const BG_COLORS = [
  { id: 'white', name: 'Clean White', color: '#ffffff', border: 'border-slate-300', text: 'Official / Passport Standard' },
  { id: 'blue', name: 'Studio Blue', color: '#bfdbfe', border: 'border-blue-400', text: 'Indian Govt / Exam Standard' },
  { id: 'dark_blue', name: 'Royal Blue', color: '#2563eb', border: 'border-blue-700', text: 'Formal Dark Blue' },
  { id: 'gray', name: 'Light Gray', color: '#e2e8f0', border: 'border-slate-400', text: 'Corporate & ID Standard' },
  { id: 'cream', name: 'Soft Cream', color: '#fef3c7', border: 'border-amber-300', text: 'Off-White Neutral' },
  { id: 'red', name: 'Passport Red', color: '#dc2626', border: 'border-red-600', text: 'Red Background' },
  { id: 'original', name: 'Original', color: 'transparent', border: 'border-slate-300', text: 'Original Background' }
];

export interface DimensionPreset {
  id: string;
  name: string;
  widthCm: number;
  heightCm: number;
  widthInches: number;
  heightInches: number;
  desc: string;
  aspectRatio: number; // width / height
}

export const DIMENSION_PRESETS: DimensionPreset[] = [
  { 
    id: 'in_1_2x1_5', 
    name: '1.2in x 1.5in', 
    widthCm: 3.05, 
    heightCm: 3.81, 
    widthInches: 1.2, 
    heightInches: 1.5, 
    desc: '1.2" x 1.5" (Official Standard)', 
    aspectRatio: 1.2 / 1.5 
  },
  { 
    id: 'in_passport', 
    name: 'Indian Passport / PAN', 
    widthCm: 3.5, 
    heightCm: 4.5, 
    widthInches: 1.38, 
    heightInches: 1.77, 
    desc: '3.5cm x 4.5cm (7:9)', 
    aspectRatio: 3.5 / 4.5 
  },
  { 
    id: 'stamp_size', 
    name: 'Stamp Size', 
    widthCm: 2.5, 
    heightCm: 3.0, 
    widthInches: 1.0, 
    heightInches: 1.2, 
    desc: '2.5cm x 3.0cm (1.0" x 1.2")', 
    aspectRatio: 2.5 / 3.0 
  },
  { 
    id: 'visa_2x2', 
    name: 'US / Visa (2x2")', 
    widthCm: 5.1, 
    heightCm: 5.1, 
    widthInches: 2.0, 
    heightInches: 2.0, 
    desc: '5.1cm x 5.1cm (2" x 2")', 
    aspectRatio: 1.0 
  },
  { 
    id: 'dl_custom', 
    name: 'Driving License', 
    widthCm: 3.0, 
    heightCm: 4.0, 
    widthInches: 1.18, 
    heightInches: 1.57, 
    desc: '3.0cm x 4.0cm (3:4)', 
    aspectRatio: 3.0 / 4.0 
  }
];

type CropAspectMode = '1.2x1.5' | 'passport' | 'stamp' | 'square' | 'dl' | 'free';
type CropShapeMode = 'rectangle' | 'oval';

interface CropBoxPercent {
  x: number; // percentage 0 - 100
  y: number;
  w: number;
  h: number;
}

interface PassportPhotoToolProps {
  onNavigateBack: () => void;
  lang?: 'en' | 'bn';
  initialImageSrc?: string | null;
}

export const PassportPhotoTool: React.FC<PassportPhotoToolProps> = ({
  onNavigateBack,
  lang = 'en',
  initialImageSrc = null
}) => {
  // Navigation tabs between Cropping & Layout Sheet
  const [activeTab, setActiveTab] = useState<'crop' | 'sheet'>('crop');

  // Master image source (the uncropped raw image)
  const [rawImageSrc, setRawImageSrc] = useState<string>(initialImageSrc || SAMPLE_PHOTO);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 600, height: 800 });

  // Target Dimension Preset (Default: 1.2in x 1.5in)
  const [selectedDimensionId, setSelectedDimensionId] = useState<string>('in_1_2x1_5');
  const [customWidthCm, setCustomWidthCm] = useState<number>(3.05);
  const [customHeightCm, setCustomHeightCm] = useState<number>(3.81);

  // Cropping State (percentage-based relative to the displayed image)
  const [cropBox, setCropBox] = useState<CropBoxPercent>({ x: 15, y: 10, w: 70, h: 80 });
  const [cropAspect, setCropAspect] = useState<CropAspectMode>('1.2x1.5');
  const [cropShape, setCropShape] = useState<CropShapeMode>('rectangle');
  const [showFaceOvalGuide, setShowFaceOvalGuide] = useState<boolean>(true);

  // Rotation & Flip Transform
  const [rotationAngle, setRotationAngle] = useState<number>(0); // 0, 90, 180, 270
  const [fineAngle, setFineAngle] = useState<number>(0); // -45 to +45 tilt
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Studio Adjustments
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [sharpness, setSharpness] = useState<number>(35); // WhatsApp photo unblur

  // Background Color & Sensitivity
  const [selectedBg, setSelectedBg] = useState<string>('white');
  const [bgCleanThreshold, setBgCleanThreshold] = useState<number>(35); // background keying sensitivity

  // Sheet Layout Settings (6, 8, 12, 16 photos)
  const [quantity, setQuantity] = useState<number>(6);
  const [paperFormat, setPaperFormat] = useState<'4x6' | 'A4'>('4x6');
  const [showCutLines, setShowCutLines] = useState<boolean>(true);

  // Generated Outputs
  const [croppedPhotoUrl, setCroppedPhotoUrl] = useState<string | null>(null);
  const [printSheetUrl, setPrintSheetUrl] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isApplyingCrop, setIsApplyingCrop] = useState<boolean>(false);

  // Drag interaction state for crop box
  const [dragAction, setDragAction] = useState<string | null>(null); // 'move' | 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
  const [dragStartPoint, setDragStartPoint] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragStartBox, setDragStartBox] = useState<CropBoxPercent>(cropBox);

  // References
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);

  // Current Target Dimension
  const currentPreset = DIMENSION_PRESETS.find((d) => d.id === selectedDimensionId);
  const widthCm = currentPreset ? currentPreset.widthCm : customWidthCm;
  const heightCm = currentPreset ? currentPreset.heightCm : customHeightCm;
  const widthInches = currentPreset ? currentPreset.widthInches : 1.2;
  const heightInches = currentPreset ? currentPreset.heightInches : 1.5;

  // 300 DPI calculation (1 inch = 300 px; 1 cm = ~118.11 px)
  const targetPhotoWidthPx = Math.round(widthInches * 300); // 1.2 * 300 = 360 px
  const targetPhotoHeightPx = Math.round(heightInches * 300); // 1.5 * 300 = 450 px

  // Load natural dimensions of loaded image
  const onImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height
    });
    // Auto-fit crop box to selected aspect
    autoFitCropBox(img.naturalWidth || img.width, img.naturalHeight || img.height, cropAspect);
  };

  // Helper to calculate aspect ratio float
  const getAspectRatioFloat = useCallback((aspect: CropAspectMode): number | null => {
    switch (aspect) {
      case '1.2x1.5':
        return 1.2 / 1.5; // 0.8 (4:5)
      case 'passport':
        return 3.5 / 4.5;
      case 'stamp':
        return 2.5 / 3.0;
      case 'square':
        return 1.0;
      case 'dl':
        return 3.0 / 4.0;
      case 'free':
      default:
        return null;
    }
  }, []);

  // Auto-fit crop box centered on image
  const autoFitCropBox = useCallback((imgW: number, imgH: number, aspectMode: CropAspectMode) => {
    const ratio = getAspectRatioFloat(aspectMode);
    if (!ratio) {
      setCropBox({ x: 10, y: 10, w: 80, h: 80 });
      return;
    }

    const imgAspect = imgW / imgH;
    let boxW: number;
    let boxH: number;

    if (imgAspect > ratio) {
      boxH = 78;
      boxW = (boxH * ratio) / imgAspect;
    } else {
      boxW = 78;
      boxH = (boxW / ratio) * imgAspect;
    }

    boxW = Math.min(95, Math.max(20, boxW));
    boxH = Math.min(95, Math.max(20, boxH));

    const x = Math.max(0, (100 - boxW) / 2);
    const y = Math.max(0, (100 - boxH) / 2);

    setCropBox({ x, y, w: boxW, h: boxH });
  }, [getAspectRatioFloat]);

  // Handle changing aspect mode
  const handleAspectChange = (mode: CropAspectMode) => {
    setCropAspect(mode);
    if (mode === '1.2x1.5') {
      setSelectedDimensionId('in_1_2x1_5');
    } else if (mode === 'passport') {
      setSelectedDimensionId('in_passport');
    } else if (mode === 'stamp') {
      setSelectedDimensionId('stamp_size');
    } else if (mode === 'square') {
      setSelectedDimensionId('visa_2x2');
    } else if (mode === 'dl') {
      setSelectedDimensionId('dl_custom');
    }
    autoFitCropBox(imageDimensions.width, imageDimensions.height, mode);
  };

  // 1-Click Explicit "Auto-crop 1.2in x 1.5in"
  const handleAutoCrop12x15 = () => {
    handleAspectChange('1.2x1.5');
    setShowFaceOvalGuide(true);
    setCropShape('rectangle');
  };

  // Handle Drag & Resize interactions on the crop box
  const startDrag = (action: string, clientX: number, clientY: number) => {
    setDragAction(action);
    setDragStartPoint({ x: clientX, y: clientY });
    setDragStartBox({ ...cropBox });
  };

  const handlePointerDown = (action: string) => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startDrag(action, clientX, clientY);
  };

  // Process mouse/touch move
  useEffect(() => {
    if (!dragAction) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const container = cropContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaXPercent = ((clientX - dragStartPoint.x) / rect.width) * 100;
      const deltaYPercent = ((clientY - dragStartPoint.y) / rect.height) * 100;

      const ratio = getAspectRatioFloat(cropAspect);
      const containerAspect = rect.width / rect.height;

      setCropBox(() => {
        let { x, y, w, h } = dragStartBox;

        if (dragAction === 'move') {
          x = Math.max(0, Math.min(100 - w, x + deltaXPercent));
          y = Math.max(0, Math.min(100 - h, y + deltaYPercent));
          return { x, y, w, h };
        }

        if (dragAction.includes('e')) {
          w = Math.max(15, Math.min(100 - x, dragStartBox.w + deltaXPercent));
          if (ratio) {
            h = (w / ratio) * containerAspect;
            if (y + h > 100) {
              h = 100 - y;
              w = h * ratio / containerAspect;
            }
          }
        }
        if (dragAction.includes('s')) {
          h = Math.max(15, Math.min(100 - y, dragStartBox.h + deltaYPercent));
          if (ratio) {
            w = (h * ratio) / containerAspect;
            if (x + w > 100) {
              w = 100 - x;
              h = (w / ratio) * containerAspect;
            }
          }
        }
        if (dragAction.includes('w')) {
          const maxLeftShift = dragStartBox.x + dragStartBox.w - 15;
          const newX = Math.max(0, Math.min(maxLeftShift, dragStartBox.x + deltaXPercent));
          w = dragStartBox.x + dragStartBox.w - newX;
          x = newX;
          if (ratio) {
            h = (w / ratio) * containerAspect;
            if (y + h > 100) {
              h = 100 - y;
              w = (h * ratio) / containerAspect;
              x = dragStartBox.x + dragStartBox.w - w;
            }
          }
        }
        if (dragAction.includes('n')) {
          const maxTopShift = dragStartBox.y + dragStartBox.h - 15;
          const newY = Math.max(0, Math.min(maxTopShift, dragStartBox.y + deltaYPercent));
          h = dragStartBox.y + dragStartBox.h - newY;
          y = newY;
          if (ratio) {
            w = (h * ratio) / containerAspect;
            if (x + w > 100) {
              w = 100 - x;
              h = (w / ratio) * containerAspect;
              y = dragStartBox.y + dragStartBox.h - h;
            }
          }
        }

        x = Math.max(0, Math.min(100 - w, x));
        y = Math.max(0, Math.min(100 - h, y));
        w = Math.max(15, Math.min(100, w));
        h = Math.max(15, Math.min(100, h));

        return { x, y, w, h };
      });
    };

    const handlePointerUp = () => {
      setDragAction(null);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [dragAction, dragStartPoint, dragStartBox, cropAspect, getAspectRatioFloat]);

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setRotationAngle(0);
      setFineAngle(0);
      setFlipH(false);
      setFlipV(false);
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setSharpness(35);
      handleAutoCrop12x15();
      setActiveTab('crop');
    };
    reader.readAsDataURL(file);
  };

  // Rotate 90 degrees
  const handleRotate = (dir: 'cw' | 'ccw') => {
    setRotationAngle((prev) => {
      const delta = dir === 'cw' ? 90 : -90;
      let next = (prev + delta) % 360;
      if (next < 0) next += 360;
      return next;
    });
  };

  // 1-Click Auto Enhance (WhatsApp Photo Booster)
  const handleAutoEnhance = () => {
    setBrightness(105);
    setContrast(115);
    setSaturation(108);
    setSharpness(50);
  };

  // Reset all Crop & Adjust settings
  const handleResetAdjustments = () => {
    setRotationAngle(0);
    setFineAngle(0);
    setFlipH(false);
    setFlipV(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSharpness(25);
    autoFitCropBox(imageDimensions.width, imageDimensions.height, cropAspect);
  };

  // APPLY CROP & CONSTRAINTS WITH SMART BACKGROUND REPLACEMENT
  const handleApplyCropAndConstraints = useCallback(async () => {
    if (!rawImageSrc) return;
    setIsApplyingCrop(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // 1. Off-screen master canvas containing the fully transformed image
      const totalAngle = (rotationAngle + fineAngle) * (Math.PI / 180);
      const is90or270 = rotationAngle === 90 || rotationAngle === 270;
      const rawW = img.naturalWidth || img.width;
      const rawH = img.naturalHeight || img.height;

      const baseCanvas = document.createElement('canvas');
      const baseW = is90or270 ? rawH : rawW;
      const baseH = is90or270 ? rawW : rawH;
      baseCanvas.width = baseW;
      baseCanvas.height = baseH;

      const baseCtx = baseCanvas.getContext('2d');
      if (!baseCtx) {
        setIsApplyingCrop(false);
        return;
      }

      baseCtx.save();
      baseCtx.translate(baseW / 2, baseH / 2);
      baseCtx.rotate(totalAngle);
      baseCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      baseCtx.drawImage(img, -rawW / 2, -rawH / 2);
      baseCtx.restore();

      // 2. Compute exact source crop coordinates
      const cropPxX = Math.round((cropBox.x / 100) * baseW);
      const cropPxY = Math.round((cropBox.y / 100) * baseH);
      const cropPxW = Math.max(10, Math.round((cropBox.w / 100) * baseW));
      const cropPxH = Math.max(10, Math.round((cropBox.h / 100) * baseH));

      // 3. Target high-res canvas at 300 DPI
      const targetCanvas = document.createElement('canvas');
      targetCanvas.width = targetPhotoWidthPx;
      targetCanvas.height = targetPhotoHeightPx;
      const targetCtx = targetCanvas.getContext('2d', { willReadFrequently: true });
      if (!targetCtx) {
        setIsApplyingCrop(false);
        return;
      }

      // Draw cropped portion
      targetCtx.drawImage(
        baseCanvas,
        cropPxX,
        cropPxY,
        cropPxW,
        cropPxH,
        0,
        0,
        targetPhotoWidthPx,
        targetPhotoHeightPx
      );

      // 4. Background Replacement (Color Keying if non-original)
      if (selectedBg !== 'original') {
        const bgObj = BG_COLORS.find((b) => b.id === selectedBg);
        if (bgObj && bgObj.color !== 'transparent') {
          try {
            const imgData = targetCtx.getImageData(0, 0, targetPhotoWidthPx, targetPhotoHeightPx);
            const data = imgData.data;

            // Sample corner background colors (top-left, top-right)
            const cornerR = data[0];
            const cornerG = data[1];
            const cornerB = data[2];

            const targetBg = bgObj.color;
            const tr = parseInt(targetBg.slice(1, 3), 16) || 255;
            const tg = parseInt(targetBg.slice(3, 5), 16) || 255;
            const tb = parseInt(targetBg.slice(5, 7), 16) || 255;

            const threshold = bgCleanThreshold;

            for (let y = 0; y < targetPhotoHeightPx; y++) {
              for (let x = 0; x < targetPhotoWidthPx; x++) {
                const idx = (y * targetPhotoWidthPx + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];

                const diff = Math.sqrt(
                  Math.pow(r - cornerR, 2) + Math.pow(g - cornerG, 2) + Math.pow(b - cornerB, 2)
                );

                if (diff < threshold * 2.4) {
                  const alpha = Math.min(1, Math.max(0, diff / (threshold * 2.4)));
                  data[idx] = Math.round(r * alpha + tr * (1 - alpha));
                  data[idx + 1] = Math.round(g * alpha + tg * (1 - alpha));
                  data[idx + 2] = Math.round(b * alpha + tb * (1 - alpha));
                }
              }
            }
            targetCtx.putImageData(imgData, 0, 0);
          } catch (e) {
            console.warn('Canvas background keying note:', e);
          }
        }
      }

      // 5. Apply pixel adjustments (brightness, contrast, saturation, sharpness)
      try {
        const rawImgData = targetCtx.getImageData(0, 0, targetPhotoWidthPx, targetPhotoHeightPx);
        const adjConfig: ImageAdjustments = {
          ...DEFAULT_ADJUSTMENTS,
          brightness,
          contrast,
          saturation,
          sharpness
        };
        let adjustedData = applyAdjustmentsToImageData(rawImgData, adjConfig);
        if (sharpness > 0) {
          adjustedData = sharpenImageData(adjustedData, sharpness);
        }
        targetCtx.putImageData(adjustedData, 0, 0);

        // Thin professional 1px studio border
        targetCtx.strokeStyle = '#cbd5e1';
        targetCtx.lineWidth = 1;
        targetCtx.strokeRect(0, 0, targetPhotoWidthPx, targetPhotoHeightPx);

        const photoDataUrl = targetCanvas.toDataURL('image/jpeg', 0.95);
        setCroppedPhotoUrl(photoDataUrl);
        setIsApplyingCrop(false);
        setActiveTab('sheet');
      } catch (err) {
        console.error('Error applying crop:', err);
        setIsApplyingCrop(false);
      }
    };

    img.src = rawImageSrc;
  }, [
    rawImageSrc,
    rotationAngle,
    fineAngle,
    flipH,
    flipV,
    cropBox,
    targetPhotoWidthPx,
    targetPhotoHeightPx,
    selectedBg,
    bgCleanThreshold,
    brightness,
    contrast,
    saturation,
    sharpness
  ]);

  // Initial render on mount
  useEffect(() => {
    handleApplyCropAndConstraints();
  }, []);

  // Render Printable Grid Sheet (A4 or 4x6 for 6, 8, 12, 16 photos)
  const renderPrintSheet = useCallback(() => {
    if (!croppedPhotoUrl) return;

    const img = new Image();
    img.onload = () => {
      const sheetCanvas = sheetCanvasRef.current;
      if (!sheetCanvas) return;
      const ctx = sheetCanvas.getContext('2d');
      if (!ctx) return;

      // 300 DPI sheet dimensions:
      // 4x6 inch = 1800 x 1200 px (Landscape) or 1200 x 1800 px (Portrait)
      // A4 = 2480 x 3508 px
      const is4x6 = paperFormat === '4x6';
      const sheetW = is4x6 ? 1800 : 2480;
      const sheetH = is4x6 ? 1200 : 3508;

      sheetCanvas.width = sheetW;
      sheetCanvas.height = sheetH;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sheetW, sheetH);

      const targetCount = quantity;
      
      // Determine columns & rows for 4, 6, 8, 12, 16 photos
      let cols = 3;
      let rows = 2;
      if (is4x6) {
        if (targetCount === 4) {
          cols = 2; rows = 2;
        } else if (targetCount === 6) {
          cols = 3; rows = 2;
        } else if (targetCount === 8) {
          cols = 4; rows = 2;
        } else if (targetCount === 12) {
          cols = 4; rows = 3;
        } else if (targetCount === 16) {
          cols = 4; rows = 4;
        }
      } else {
        // A4 sheet
        if (targetCount === 4) {
          cols = 2; rows = 2;
        } else if (targetCount === 6) {
          cols = 3; rows = 2;
        } else if (targetCount === 8) {
          cols = 4; rows = 2;
        } else if (targetCount === 12) {
          cols = 4; rows = 3;
        } else if (targetCount === 16) {
          cols = 4; rows = 4;
        }
      }

      const gapX = is4x6 && targetCount >= 12 ? 25 : 35;
      const gapY = is4x6 && targetCount >= 12 ? 25 : 35;

      // Compute size to fit gracefully on sheet without overflow
      const maxGridW = sheetW - 100;
      const maxGridH = sheetH - 120;
      let pw = targetPhotoWidthPx;
      let ph = targetPhotoHeightPx;

      const rawGridW = cols * pw + (cols - 1) * gapX;
      const rawGridH = rows * ph + (rows - 1) * gapY;

      if (rawGridW > maxGridW || rawGridH > maxGridH) {
        const scaleX = (maxGridW - (cols - 1) * gapX) / (cols * pw);
        const scaleY = (maxGridH - (rows - 1) * gapY) / (rows * ph);
        const fitScale = Math.min(1, Math.min(scaleX, scaleY));
        pw = Math.floor(pw * fitScale);
        ph = Math.floor(ph * fitScale);
      }

      const totalGridW = cols * pw + (cols - 1) * gapX;
      const totalGridH = rows * ph + (rows - 1) * gapY;

      const startX = Math.max(30, (sheetW - totalGridW) / 2);
      const startY = Math.max(40, (sheetH - totalGridH) / 2);

      let drawn = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (drawn >= targetCount) break;

          const x = startX + c * (pw + gapX);
          const y = startY + r * (ph + gapY);

          // Draw Photo
          ctx.drawImage(img, x, y, pw, ph);

          // Thin border around each photo
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, pw, ph);

          // Cutting Guides (dashed scissor marks around edges)
          if (showCutLines) {
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);

            // Top mark
            ctx.beginPath();
            ctx.moveTo(x - 8, y);
            ctx.lineTo(x + pw + 8, y);
            ctx.stroke();

            // Bottom mark
            ctx.beginPath();
            ctx.moveTo(x - 8, y + ph);
            ctx.lineTo(x + pw + 8, y + ph);
            ctx.stroke();

            // Left mark
            ctx.beginPath();
            ctx.moveTo(x, y - 8);
            ctx.lineTo(x, y + ph + 8);
            ctx.stroke();

            // Right mark
            ctx.beginPath();
            ctx.moveTo(x + pw, y - 8);
            ctx.lineTo(x + pw, y + ph + 8);
            ctx.stroke();

            ctx.setLineDash([]);
          }

          drawn++;
        }
      }

      // Studio Header/Footer Information
      ctx.fillStyle = '#64748b';
      ctx.font = '22px sans-serif';
      ctx.fillText(
        `Masud Digital Hub • Passport Photo Studio • ${widthInches}"x${heightInches}" (${widthCm}x${heightCm} cm) • ${targetCount} Copies • ${paperFormat.toUpperCase()} Sheet`,
        45,
        sheetH - 28
      );

      const sheetUrl = sheetCanvas.toDataURL('image/jpeg', 0.95);
      setPrintSheetUrl(sheetUrl);
    };
    img.src = croppedPhotoUrl;
  }, [
    croppedPhotoUrl, 
    quantity, 
    paperFormat, 
    targetPhotoWidthPx, 
    targetPhotoHeightPx, 
    widthInches, 
    heightInches, 
    widthCm, 
    heightCm, 
    showCutLines
  ]);

  useEffect(() => {
    renderPrintSheet();
  }, [renderPrintSheet]);

  // Direct Print Action
  const handlePrint = () => {
    if (!printSheetUrl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Masud Digital Hub - Print Passport Photos (${quantity} Copies)</title>
          <style>
            @page { size: auto; margin: 0mm; }
            body { margin: 0; display: flex; justify-content: center; align-items: center; background: white; }
            img { max-width: 100vw; max-height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${printSheetUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Download PDF Action
  const handleDownloadPdf = async () => {
    if (!printSheetUrl) return;
    setIsExportingPdf(true);
    try {
      const pdfBlob = await imagesToPDF([{ dataUrl: printSheetUrl }], paperFormat === 'A4' ? 'A4' : 'Letter');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Passport_Photos_${quantity}Copies_${widthInches}x${heightInches}in_${paperFormat}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Download Single Photo (JPG)
  const handleDownloadSingle = () => {
    if (!croppedPhotoUrl) return;
    const link = document.createElement('a');
    link.href = croppedPhotoUrl;
    link.download = `Passport_Photo_${widthInches}x${heightInches}in.jpg`;
    link.click();
  };

  // Download Sheet JPG
  const handleDownloadSheetImage = () => {
    if (!printSheetUrl) return;
    const link = document.createElement('a');
    link.href = printSheetUrl;
    link.download = `Passport_Sheet_${quantity}Photos_${paperFormat}.jpg`;
    link.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Hidden processing canvas */}
      <canvas ref={sheetCanvasRef} className="hidden" />

      {/* Header Bar */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateBack}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
          >
            ← {lang === 'bn' ? 'ড্যাশবোর্ড' : 'All Tools'}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Crop className="w-5 h-5 text-emerald-600" />
                <span>{lang === 'bn' ? 'পাসপোর্ট ফটো মেকার' : 'Passport Photo Maker'}</span>
              </h2>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                {widthInches}" x {heightInches}" ({widthCm}x{heightCm} cm)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? '১.২x১.৫ ইঞ্চি অটো-ক্রপ, ব্যাকগ্রাউন্ড সাদা/নীল পরিবর্তন, ৪x৬ ও A4 শীটে সাজান (৬, ৮, ১২, ১৬ ফটো) ও প্রিন্ট নিন'
                : 'Auto-crop 1.2in x 1.5in, replace background color, arrange on 4x6 or A4 sheets (6, 8, 12, 16 photos), print or PDF.'}
            </p>
          </div>
        </div>

        {/* Workflow Navigation Tabs, 1-Click 1.2x1.5 Action & Upload */}
        <div className="flex items-center gap-2">
          {/* Quick Auto-Crop 1.2x1.5 Button */}
          <button
            onClick={handleAutoCrop12x15}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-xs transition-all cursor-pointer"
            title="1-Click Auto-Crop to 1.2in x 1.5in"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950 animate-pulse" />
            <span>Auto-crop 1.2in x 1.5in</span>
          </button>

          {/* Step Tabs */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('crop')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'crop'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Crop className="w-3.5 h-3.5 text-emerald-600" />
              <span>1. {lang === 'bn' ? 'ক্রপ ও এডিট' : 'Crop & Rotate'}</span>
            </button>
            <button
              onClick={handleApplyCropAndConstraints}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'sheet'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>2. {lang === 'bn' ? 'প্রিন্ট শিট' : 'Print Sheet'}</span>
            </button>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'bn' ? 'নতুন ছবি' : 'Upload Photo'}</span>
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

      {/* Main Content Area */}
      {activeTab === 'crop' ? (
        /* ======================== TAB 1: CROPPING & ADJUSTMENT STUDIO ======================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[620px] bg-slate-950">
          {/* Left / Center: Interactive Visual Cropping Workspace */}
          <div className="lg:col-span-8 p-4 sm:p-6 flex flex-col items-center justify-between relative select-none">
            {/* Top Workspace Toolbar */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-white/10 text-xs text-white/80">
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Crop className="w-4 h-4" />
                  <span>{widthInches}" x {heightInches}" Auto-Crop Workspace</span>
                </span>
                <button
                  onClick={handleAutoCrop12x15}
                  className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold text-[10px] border border-amber-400/30 cursor-pointer hover:bg-amber-400/30"
                >
                  ⚡ Snap 1.2" x 1.5"
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleRotate('ccw')}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                  title="Rotate 90° CCW"
                >
                  <RotateCcw className="w-4 h-4 text-emerald-400" />
                </button>
                <button
                  onClick={() => handleRotate('cw')}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                  title="Rotate 90° CW"
                >
                  <RotateCw className="w-4 h-4 text-emerald-400" />
                </button>
                <button
                  onClick={() => setFlipH((prev) => !prev)}
                  className={`p-1.5 rounded-lg text-white cursor-pointer transition-colors ${
                    flipH ? 'bg-emerald-600 text-white' : 'bg-white/10 hover:bg-white/20'
                  }`}
                  title="Flip Horizontal (Mirror)"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setFlipV((prev) => !prev)}
                  className={`p-1.5 rounded-lg text-white cursor-pointer transition-colors ${
                    flipV ? 'bg-emerald-600 text-white' : 'bg-white/10 hover:bg-white/20'
                  }`}
                  title="Flip Vertical"
                >
                  <FlipVertical className="w-4 h-4" />
                </button>
                <button
                  onClick={handleAutoEnhance}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  title="Auto-Boost Brightness & Sharpness"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Auto Fix</span>
                </button>
                <button
                  onClick={handleResetAdjustments}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Interactive Cropper Stage */}
            <div className="w-full flex-1 flex items-center justify-center p-2 min-h-[380px] sm:min-h-[460px]">
              <div
                ref={cropContainerRef}
                className="relative max-w-full max-h-[480px] overflow-hidden rounded-xl border border-white/20 shadow-2xl bg-slate-900 flex items-center justify-center select-none"
                style={{ touchAction: 'none' }}
              >
                {/* Master Image */}
                <img
                  ref={cropImageRef}
                  src={rawImageSrc}
                  alt="Crop Stage"
                  onLoad={onImageLoaded}
                  className="max-h-[440px] max-w-full object-contain pointer-events-none transition-transform duration-75"
                  style={{
                    transform: `rotate(${rotationAngle + fineAngle}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
                    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
                  }}
                />

                {/* Shaded Backdrop Overlay outside Crop Box */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `rgba(0, 0, 0, 0.58)`,
                    clipPath: `polygon(
                      0% 0%, 100% 0%, 100% 100%, 0% 100%,
                      0% ${cropBox.y}%, 
                      ${cropBox.x}% ${cropBox.y}%, 
                      ${cropBox.x}% ${cropBox.y + cropBox.h}%, 
                      ${cropBox.x + cropBox.w}% ${cropBox.y + cropBox.h}%, 
                      ${cropBox.x + cropBox.w}% ${cropBox.y}%, 
                      0% ${cropBox.y}%
                    )`
                  }}
                />

                {/* Interactive Resizable Crop Box (Marquee) */}
                <div
                  className="absolute border-2 border-emerald-400 shadow-[0_0_0_1px_rgba(0,0,0,0.5),0_0_15px_rgba(16,185,129,0.3)] transition-shadow"
                  style={{
                    left: `${cropBox.x}%`,
                    top: `${cropBox.y}%`,
                    width: `${cropBox.w}%`,
                    height: `${cropBox.h}%`,
                    cursor: dragAction === 'move' ? 'grabbing' : 'grab'
                  }}
                  onMouseDown={handlePointerDown('move')}
                  onTouchStart={handlePointerDown('move')}
                >
                  {/* Grid Lines (Rule of thirds) */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                    <div className="border-r border-b border-emerald-300 border-dashed" />
                    <div className="border-r border-b border-emerald-300 border-dashed" />
                    <div className="border-b border-emerald-300 border-dashed" />
                    <div className="border-r border-b border-emerald-300 border-dashed" />
                    <div className="border-r border-b border-emerald-300 border-dashed" />
                    <div className="border-b border-emerald-300 border-dashed" />
                    <div className="border-r border-emerald-300 border-dashed" />
                    <div className="border-r border-emerald-300 border-dashed" />
                    <div />
                  </div>

                  {/* Oval Face Guide Overlay */}
                  {showFaceOvalGuide && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-2">
                      <div
                        className="w-[72%] h-[82%] rounded-[50%] border-2 border-dashed border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-all flex flex-col items-center justify-between py-2"
                        style={{
                          borderRadius: cropShape === 'oval' ? '50%' : '50% 50% 46% 46%'
                        }}
                      >
                        <div className="w-8 border-t-2 border-amber-300/80" />
                        <div className="w-16 border-b border-amber-300/60" />
                        <div className="w-10 border-b-2 border-amber-300/80" />
                      </div>
                      <span className="absolute bottom-1 bg-black/85 text-[9px] font-bold text-amber-300 px-2 py-0.5 rounded shadow border border-amber-400/30">
                        1.2" x 1.5" Face Alignment (70-80%)
                      </span>
                    </div>
                  )}

                  {/* Dimensions Tag */}
                  <div className="absolute top-1 left-1 bg-black/80 backdrop-blur-xs text-white text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/20 pointer-events-none flex items-center gap-1">
                    <span className="text-emerald-400 font-bold">{widthInches}"x{heightInches}"</span>
                    <span className="text-white/60">({widthCm}x{heightCm}cm)</span>
                  </div>

                  {/* 8 Draggable Handles */}
                  <div
                    onMouseDown={handlePointerDown('nw')}
                    onTouchStart={handlePointerDown('nw')}
                    className="absolute -top-2 -left-2 w-4 h-4 bg-emerald-400 border-2 border-slate-900 rounded-sm cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={handlePointerDown('n')}
                    onTouchStart={handlePointerDown('n')}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-sm cursor-ns-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={handlePointerDown('ne')}
                    onTouchStart={handlePointerDown('ne')}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-400 border-2 border-slate-900 rounded-sm cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={handlePointerDown('e')}
                    onTouchStart={handlePointerDown('e')}
                    className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-4 bg-emerald-400 border-2 border-slate-900 rounded-sm cursor-ew-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={handlePointerDown('se')}
                    onTouchStart={handlePointerDown('se')}
                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-emerald-400 border-2 border-slate-900 rounded-sm cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={handlePointerDown('s')}
                    onTouchStart={handlePointerDown('s')}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-sm cursor-ns-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={handlePointerDown('sw')}
                    onTouchStart={handlePointerDown('sw')}
                    className="absolute -bottom-2 -left-2 w-4 h-4 bg-emerald-400 border-2 border-slate-900 rounded-sm cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={handlePointerDown('w')}
                    onTouchStart={handlePointerDown('w')}
                    className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-4 bg-emerald-400 border-2 border-slate-900 rounded-sm cursor-ew-resize shadow-md hover:scale-125 transition-transform"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Tilt Straightener Slider */}
            <div className="w-full max-w-lg mt-2 bg-slate-900/90 rounded-xl p-3 border border-white/10 text-xs text-white">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'bn' ? 'বাঁকা সোজা করুন (Tilt Straighten)' : 'Straighten & Tilt Angle'}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-bold">{fineAngle > 0 ? `+${fineAngle}` : fineAngle}°</span>
                  {fineAngle !== 0 && (
                    <button
                      onClick={() => setFineAngle(0)}
                      className="text-[10px] text-white/60 hover:text-white underline cursor-pointer"
                    >
                      Reset 0°
                    </button>
                  )}
                </div>
              </div>
              <input
                type="range"
                min={-45}
                max={45}
                step={0.5}
                value={fineAngle}
                onChange={(e) => setFineAngle(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-white/20 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/40 mt-1">
                <span>-45° Tilt Left</span>
                <span>0° Normal</span>
                <span>+45° Tilt Right</span>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Crop Controls, Background Colors & Quantities */}
          <div className="lg:col-span-4 p-5 bg-slate-900 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-between space-y-4 overflow-y-auto max-h-[640px]">
            <div className="space-y-4">
              {/* 1. Dimension Presets with 1.2in x 1.5in as Top Default */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-white uppercase tracking-wider block">
                    {lang === 'bn' ? 'ছবির মাপ (Photo Dimensions)' : 'Standard Dimensions'}
                  </label>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                    Featured: 1.2" x 1.5"
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleAspectChange('1.2x1.5')}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer col-span-2 ${
                      cropAspect === '1.2x1.5'
                        ? 'border-amber-400 bg-amber-950/70 text-white shadow-md ring-1 ring-amber-400'
                        : 'border-white/15 hover:border-white/30 text-white/90 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-amber-300">1.2in x 1.5in (Official Standard)</div>
                      <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded">
                        Auto-Crop
                      </span>
                    </div>
                    <div className="text-[11px] text-white/70 font-mono mt-0.5">
                      3.05cm x 3.81cm · 360 x 450 px @ 300 DPI
                    </div>
                  </button>

                  <button
                    onClick={() => handleAspectChange('passport')}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      cropAspect === 'passport'
                        ? 'border-emerald-500 bg-emerald-950/80 text-white shadow-xs'
                        : 'border-white/10 hover:border-white/20 text-white/80 bg-white/5'
                    }`}
                  >
                    <div className="text-xs font-bold">Indian Passport</div>
                    <div className="text-[10px] text-emerald-400 font-mono">3.5 x 4.5 cm (7:9)</div>
                  </button>

                  <button
                    onClick={() => handleAspectChange('stamp')}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      cropAspect === 'stamp'
                        ? 'border-emerald-500 bg-emerald-950/80 text-white shadow-xs'
                        : 'border-white/10 hover:border-white/20 text-white/80 bg-white/5'
                    }`}
                  >
                    <div className="text-xs font-bold">Stamp Size</div>
                    <div className="text-[10px] text-emerald-400 font-mono">2.5 x 3.0 cm (5:6)</div>
                  </button>

                  <button
                    onClick={() => handleAspectChange('square')}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      cropAspect === 'square'
                        ? 'border-emerald-500 bg-emerald-950/80 text-white shadow-xs'
                        : 'border-white/10 hover:border-white/20 text-white/80 bg-white/5'
                    }`}
                  >
                    <div className="text-xs font-bold">US Visa / 1:1</div>
                    <div className="text-[10px] text-emerald-400 font-mono">2" x 2" (5.1cm)</div>
                  </button>

                  <button
                    onClick={() => handleAspectChange('free')}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      cropAspect === 'free'
                        ? 'border-emerald-500 bg-emerald-950/80 text-white shadow-xs'
                        : 'border-white/10 hover:border-white/20 text-white/80 bg-white/5'
                    }`}
                  >
                    <div className="text-xs font-bold">Freeform Crop</div>
                    <div className="text-[10px] text-white/50">Custom Width/Height</div>
                  </button>
                </div>
              </div>

              {/* 2. Background Color Replacement */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-white uppercase tracking-wider block">
                    {lang === 'bn' ? 'ব্যাকগ্রাউন্ড পরিবর্তন (Background)' : 'Replace Background Color'}
                  </label>
                  <span className="text-[10px] text-emerald-400 font-semibold">Studio Clean</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {BG_COLORS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setSelectedBg(bg.id)}
                      className={`p-1.5 rounded-xl border text-left flex items-center gap-1.5 cursor-pointer transition-all ${
                        selectedBg === bg.id
                          ? 'border-emerald-400 bg-emerald-950/80 text-white shadow-xs'
                          : 'border-white/10 hover:border-white/20 text-white/80 bg-white/5'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border shrink-0 ${bg.border}`}
                        style={{ backgroundColor: bg.color === 'transparent' ? '#cbd5e1' : bg.color }}
                      />
                      <span className="text-[11px] font-semibold truncate">{bg.name}</span>
                    </button>
                  ))}
                </div>

                {selectedBg !== 'original' && (
                  <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                    <div className="flex justify-between text-[11px] text-white/70">
                      <span>Background Removal Sensitivity:</span>
                      <span className="font-mono text-emerald-400">{bgCleanThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={75}
                      value={bgCleanThreshold}
                      onChange={(e) => setBgCleanThreshold(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-white/20 rounded cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* 3. Studio Lighting & WhatsApp Unblur */}
              <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-white">
                <span className="font-bold uppercase tracking-wider text-slate-300 block">
                  {lang === 'bn' ? 'উজ্জ্বলতা ও স্পষ্টতা' : 'Lighting & WhatsApp Sharpness'}
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex justify-between text-white/80 text-[11px] mb-0.5">
                      <span>Brightness:</span>
                      <span className="font-mono text-emerald-400">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={150}
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-white/20 rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-white/80 text-[11px] mb-0.5">
                      <span>Contrast:</span>
                      <span className="font-mono text-emerald-400">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={160}
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-white/20 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-white/80 text-[11px] mb-0.5">
                    <span>WhatsApp Unblur / Sharpness Boost:</span>
                    <span className="font-mono text-amber-400">+{sharpness}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={80}
                    value={sharpness}
                    onChange={(e) => setSharpness(Number(e.target.value))}
                    className="w-full accent-amber-400 h-1 bg-white/20 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Big Apply Action Button */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <button
                onClick={handleApplyCropAndConstraints}
                disabled={isApplyingCrop}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer hover:shadow-emerald-500/25"
              >
                {isApplyingCrop ? (
                  <span>Applying Crop & Background...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 fill-slate-950 text-emerald-400" />
                    <span>Apply {widthInches}"x{heightInches}" & Arrange on Sheet</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-[11px] text-white/50 text-center">
                Prepares high-resolution 300 DPI copies for 4x6 or A4 printing.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ======================== TAB 2: PRINT SHEET & STUDIO LAYOUT ======================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          {/* Left: Cropped Single Photo & Quick Edit Back */}
          <div className="lg:col-span-4 p-5 bg-slate-900 border-r border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {lang === 'bn' ? 'একক ছবির প্রিভিউ' : 'Single Photo Preview'}
                </span>
                <span className="text-[11px] text-amber-300 font-mono font-bold">
                  {widthInches}" x {heightInches}" ({widthCm}x{heightCm}cm)
                </span>
              </div>

              {/* Single Photo Display */}
              <div className="py-5 flex flex-col items-center">
                <div
                  className="rounded-lg overflow-hidden border-2 border-emerald-400 shadow-2xl bg-white"
                  style={{
                    width: 190,
                    height: Math.round(190 * (heightCm / widthCm))
                  }}
                >
                  {croppedPhotoUrl ? (
                    <img
                      src={croppedPhotoUrl}
                      alt="Cropped Passport Result"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      Rendering...
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('crop')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer transition-colors"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'পুনরায় ক্রপ করুন' : 'Re-Crop / Adjust'}</span>
                  </button>
                  <button
                    onClick={handleDownloadSingle}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer flex items-center gap-1"
                    title="Download Single Photo (JPG)"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span className="text-[11px]">Single JPG</span>
                  </button>
                </div>
              </div>

              {/* Standard Dimensions Switcher */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-xs font-bold text-white/80 block">
                  {lang === 'bn' ? 'সাইজ পরিবর্তন' : 'Document Dimension Presets'}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {DIMENSION_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedDimensionId(p.id);
                        handleAspectChange(
                          p.id === 'in_1_2x1_5' ? '1.2x1.5' :
                          p.id === 'in_passport' ? 'passport' :
                          p.id === 'stamp_size' ? 'stamp' :
                          p.id === 'visa_2x2' ? 'square' : 'dl'
                        );
                        handleApplyCropAndConstraints();
                      }}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        selectedDimensionId === p.id
                          ? 'border-amber-400 bg-amber-950/70 text-white shadow-xs ring-1 ring-amber-400'
                          : 'border-white/10 hover:border-white/20 text-white/70 bg-white/5'
                      }`}
                    >
                      <div className="text-xs font-bold">{p.name}</div>
                      <div className="text-[10px] text-amber-300 font-mono">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Privacy Guarantee footer */}
            <div className="pt-3 border-t border-white/10 text-[11px] text-white/50 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% In-browser local processing. No images are uploaded to any external server.</span>
            </div>
          </div>

          {/* Right: Print Sheet Grid Preview, Background & Print Controls */}
          <div className="lg:col-span-8 p-5 flex flex-col justify-between space-y-5 overflow-y-auto max-h-[640px]">
            <div className="space-y-4">
              {/* 1. Background Color Selector */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  {lang === 'bn' ? 'ব্যাকগ্রাউন্ড কালার পরিবর্তন' : 'Replace Background Color'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {BG_COLORS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => {
                        setSelectedBg(bg.id);
                        handleApplyCropAndConstraints();
                      }}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                        selectedBg === bg.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border shrink-0 ${bg.border}`}
                        style={{ backgroundColor: bg.color === 'transparent' ? '#cbd5e1' : bg.color }}
                      />
                      <span className="text-[11px] font-semibold truncate">{bg.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Quantity & Paper Selection (6, 8, 12, 16 photos) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      {lang === 'bn' ? 'কপি সংখ্যা (Quantity)' : 'Copies Quantity'}
                    </label>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Standard Print Grid
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[6, 8, 12, 16].map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuantity(q)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                          quantity === q
                            ? 'bg-emerald-600 text-white shadow-md font-black ring-2 ring-emerald-500/20'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="block text-sm">{q}</span>
                        <span className="block text-[9px] opacity-80">Photos</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                    {lang === 'bn' ? 'কাগজের সাইজ (Paper Sheet)' : 'Paper Sheet Format'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaperFormat('4x6')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                        paperFormat === '4x6'
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>4 x 6 Photo Paper</span>
                      <span className="text-[10px] opacity-75">Studio Standard</span>
                    </button>
                    <button
                      onClick={() => setPaperFormat('A4')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                        paperFormat === 'A4'
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>A4 Full Sheet</span>
                      <span className="text-[10px] opacity-75">Bulk Document</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Live Printable Sheet Preview Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {quantity} Photos on {paperFormat.toUpperCase()} Sheet ({widthInches}"x{heightInches}")
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Studio Ready
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Formatted with scissor cutting guidelines and margin spacing for studio paper cutters.
                  </p>
                  <label className="flex items-center gap-2 text-xs text-slate-700 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCutLines}
                      onChange={(e) => setShowCutLines(e.target.checked)}
                      className="rounded accent-emerald-600 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-medium">Show cutting guide lines</span>
                  </label>
                </div>

                {printSheetUrl && (
                  <div className="w-28 h-36 sm:w-32 sm:h-40 bg-white border border-slate-300 shadow-md rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                    <img
                      src={printSheetUrl}
                      alt="Print Sheet Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Primary Export Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2.5">
              <button
                onClick={handlePrint}
                disabled={!printSheetUrl}
                className="flex-1 min-w-[140px] py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'bn' ? 'সরাসরি প্রিন্ট করুন' : 'Direct Print Photos'}</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={!printSheetUrl || isExportingPdf}
                className="flex-1 min-w-[140px] py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isExportingPdf ? 'Generating PDF...' : 'Download Print PDF'}</span>
              </button>

              <button
                onClick={handleDownloadSheetImage}
                disabled={!printSheetUrl}
                className="py-3 px-3.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="Download Sheet as JPG"
              >
                Sheet JPG
              </button>

              <button
                onClick={handleDownloadSingle}
                disabled={!croppedPhotoUrl}
                className="py-3 px-3.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="Download Single 1.2x1.5in Photo (JPG)"
              >
                Single JPG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
