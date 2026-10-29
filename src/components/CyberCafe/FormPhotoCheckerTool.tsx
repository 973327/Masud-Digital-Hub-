import React, { useState, useRef } from 'react';
import { 
  FileCheck, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  Sliders, 
  RefreshCw, 
  Info, 
  ExternalLink,
  Camera,
  CreditCard,
  Globe,
  FileCode,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { CyberCafeToolId } from '../../types/cybercafe';
import { formatBytes } from '../../services/imageProcessing';

export interface DocumentStandard {
  id: string;
  name: string;
  category: 'passport' | 'id_card' | 'visa' | 'exam' | 'custom';
  description: string;
  minKb: number;
  maxKb: number;
  targetWidthPx: number;
  targetHeightPx: number;
  widthCm: number;
  heightCm: number;
  aspectRatio: number;
  allowedFormats: string[];
  backgroundNote: string;
}

export const COMMON_DOCUMENT_STANDARDS: DocumentStandard[] = [
  {
    id: 'passport_india',
    name: 'Indian Passport / Seva Photo',
    category: 'passport',
    description: 'Official Indian Passport & Visa 3.5cm x 4.5cm color photograph.',
    minKb: 20,
    maxKb: 300,
    targetWidthPx: 413,
    targetHeightPx: 531,
    widthCm: 3.5,
    heightCm: 4.5,
    aspectRatio: 3.5 / 4.5,
    allowedFormats: ['image/jpeg', 'image/jpg'],
    backgroundNote: 'Plain white background, no shadows or head coverings.'
  },
  {
    id: 'pan_card',
    name: 'PAN Card Photo (NSDL / UTIITSL)',
    category: 'id_card',
    description: 'Income Tax Department PAN card photo requirement (max 50 KB).',
    minKb: 10,
    maxKb: 50,
    targetWidthPx: 213,
    targetHeightPx: 213,
    widthCm: 2.5,
    heightCm: 2.5,
    aspectRatio: 1.0,
    allowedFormats: ['image/jpeg', 'image/jpg'],
    backgroundNote: 'White or very light monochrome background.'
  },
  {
    id: 'driving_license',
    name: 'Driving License / State ID',
    category: 'id_card',
    description: 'Standard 3.0cm x 4.0cm portrait photo for Sarathi / Parivahan & State IDs.',
    minKb: 10,
    maxKb: 100,
    targetWidthPx: 350,
    targetHeightPx: 466,
    widthCm: 3.0,
    heightCm: 4.0,
    aspectRatio: 3.0 / 4.0,
    allowedFormats: ['image/jpeg', 'image/jpg'],
    backgroundNote: 'Plain light blue or white background.'
  },
  {
    id: 'visa_us',
    name: 'US / International Visa (2x2")',
    category: 'visa',
    description: 'Square 2" x 2" (5.1cm x 5.1cm) 600x600 px passport photograph.',
    minKb: 20,
    maxKb: 240,
    targetWidthPx: 600,
    targetHeightPx: 600,
    widthCm: 5.1,
    heightCm: 5.1,
    aspectRatio: 1.0,
    allowedFormats: ['image/jpeg', 'image/jpg'],
    backgroundNote: 'Off-white or pure white background, head centered.'
  },
  {
    id: 'ssc_exam',
    name: 'SSC (Staff Selection Commission)',
    category: 'exam',
    description: 'SSC CGL, CHSL, MTS, GD Constable online photo specification.',
    minKb: 20,
    maxKb: 50,
    targetWidthPx: 350,
    targetHeightPx: 450,
    widthCm: 3.5,
    heightCm: 4.5,
    aspectRatio: 3.5 / 4.5,
    allowedFormats: ['image/jpeg', 'image/jpg'],
    backgroundNote: 'Light-colored background, clearly visible ears and face.'
  },
  {
    id: 'upsc_exam',
    name: 'UPSC Civil Services / NDA',
    category: 'exam',
    description: 'Square 350x350 px photograph taken within 10 days of filling form.',
    minKb: 20,
    maxKb: 300,
    targetWidthPx: 350,
    targetHeightPx: 350,
    widthCm: 3.5,
    heightCm: 3.5,
    aspectRatio: 1.0,
    allowedFormats: ['image/jpeg', 'image/jpg'],
    backgroundNote: 'Light background, full frontal view.'
  }
];

const SAMPLE_PHOTO = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';

interface MetricCheckResult {
  name: string;
  nameBengali: string;
  pass: boolean;
  actualValue: string;
  expectedValue: string;
  feedback: string;
}

interface FullValidationResult {
  isAllPassed: boolean;
  metrics: MetricCheckResult[];
  actualSizeKb: number;
  actualWidth: number;
  actualHeight: number;
  actualFormat: string;
}

interface FormPhotoCheckerToolProps {
  onNavigateBack: () => void;
  onLaunchTool: (toolId: CyberCafeToolId) => void;
  lang?: 'en' | 'bn';
}

export const FormPhotoCheckerTool: React.FC<FormPhotoCheckerToolProps> = ({
  onNavigateBack,
  onLaunchTool,
  lang = 'en'
}) => {
  const [selectedStandard, setSelectedStandard] = useState<DocumentStandard>(COMMON_DOCUMENT_STANDARDS[0]);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  // Custom configuration inputs
  const [customMinKb, setCustomMinKb] = useState<number>(20);
  const [customMaxKb, setCustomMaxKb] = useState<number>(50);
  const [customWidthPx, setCustomWidthPx] = useState<number>(350);
  const [customHeightPx, setCustomHeightPx] = useState<number>(450);

  // Uploaded photo state
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<FullValidationResult | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate uploaded file against chosen standard
  const runValidation = (file: File) => {
    setFileName(file.name);
    const sizeKb = Math.round((file.size / 1024) * 10) / 10;
    const fileFormat = file.type;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUploadedUrl(dataUrl);

      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        const currentAspect = w / h;

        const minKb = isCustom ? customMinKb : selectedStandard.minKb;
        const maxKb = isCustom ? customMaxKb : selectedStandard.maxKb;
        const targetW = isCustom ? customWidthPx : selectedStandard.targetWidthPx;
        const targetH = isCustom ? customHeightPx : selectedStandard.targetHeightPx;
        const targetAspect = isCustom ? customWidthPx / customHeightPx : selectedStandard.aspectRatio;
        const allowedFormats = isCustom ? ['image/jpeg', 'image/jpg'] : selectedStandard.allowedFormats;

        // 1. Metric: File Size (KB)
        const sizePass = sizeKb >= minKb && sizeKb <= maxKb;
        const sizeMetric: MetricCheckResult = {
          name: 'File Size',
          nameBengali: 'ফাইল সাইজ (KB)',
          pass: sizePass,
          actualValue: `${sizeKb} KB`,
          expectedValue: `${minKb} KB – ${maxKb} KB`,
          feedback: sizePass
            ? `File size (${sizeKb} KB) fits within the required ${minKb} – ${maxKb} KB limit.`
            : sizeKb > maxKb
            ? `File size (${sizeKb} KB) exceeds maximum limit of ${maxKb} KB.`
            : `File size (${sizeKb} KB) is below minimum requirement of ${minKb} KB.`
        };

        // 2. Metric: File Format
        const formatPass = allowedFormats.includes(fileFormat) || 
          (fileFormat === 'image/jpeg' && allowedFormats.includes('image/jpg'));
        const formatMetric: MetricCheckResult = {
          name: 'File Format',
          nameBengali: 'ফাইল ফরম্যাট',
          pass: formatPass,
          actualValue: fileFormat ? fileFormat.replace('image/', '').toUpperCase() : 'UNKNOWN',
          expectedValue: allowedFormats.map((f) => f.replace('image/', '').toUpperCase()).join(' / '),
          feedback: formatPass
            ? `File format (${fileFormat.replace('image/', '').toUpperCase()}) is accepted.`
            : `Format (${fileFormat.replace('image/', '').toUpperCase()}) is not allowed. Must be ${allowedFormats.map(f => f.replace('image/', '').toUpperCase()).join(' or ')}.`
        };

        // 3. Metric: Dimensions (Pixel Resolution)
        // Allow ~8% tolerance for dimensions
        const dimTol = 0.08;
        const widthMatch = Math.abs(w - targetW) / targetW <= dimTol;
        const heightMatch = Math.abs(h - targetH) / targetH <= dimTol;
        const dimPass = widthMatch && heightMatch;
        const dimMetric: MetricCheckResult = {
          name: 'Dimensions (Resolution)',
          nameBengali: 'ছবির মাপ (দৈর্ঘ্য ও প্রস্থ)',
          pass: dimPass,
          actualValue: `${w} × ${h} px`,
          expectedValue: `${targetW} × ${targetH} px`,
          feedback: dimPass
            ? `Resolution (${w}×${h}px) matches the document requirement.`
            : `Dimensions (${w}×${h}px) do not match expected ${targetW}×${targetH}px.`
        };

        // 4. Metric: Aspect Ratio & Orientation
        const isPortrait = h >= w;
        const expectedPortrait = targetH >= targetW;
        const aspectDiff = Math.abs(currentAspect - targetAspect);
        const aspectPass = (isPortrait === expectedPortrait) && aspectDiff <= 0.08;
        const aspectMetric: MetricCheckResult = {
          name: 'Aspect Ratio & Orientation',
          nameBengali: 'অনুপাত ও ওরিয়েন্টেশন',
          pass: aspectPass,
          actualValue: `${(currentAspect).toFixed(2)} (${isPortrait ? 'Portrait' : 'Landscape'})`,
          expectedValue: `${(targetAspect).toFixed(2)} (${expectedPortrait ? 'Portrait' : 'Square/Landscape'})`,
          feedback: aspectPass
            ? `Portrait orientation and aspect ratio are correct.`
            : isPortrait !== expectedPortrait
            ? `Orientation is ${isPortrait ? 'Portrait' : 'Landscape'}, but document expects ${expectedPortrait ? 'Portrait' : 'Square/Landscape'}.`
            : `Aspect ratio differs from standard document proportions.`
        };

        // 5. Metric: Minimum Clarity / Pixel Density
        const minPixels = 200 * 200;
        const clarityPass = w * h >= minPixels;
        const clarityMetric: MetricCheckResult = {
          name: 'Clarity & Sharpness',
          nameBengali: 'রেজোলিউশন ও স্বচ্ছতা',
          pass: clarityPass,
          actualValue: `${Math.round((w * h) / 1000)}k Pixels`,
          expectedValue: 'Min 40k Pixels',
          feedback: clarityPass
            ? 'Resolution is sharp and clear for official document verification.'
            : 'Image resolution is too low and may appear blurry when printed.'
        };

        const metrics = [sizeMetric, formatMetric, dimMetric, aspectMetric, clarityMetric];
        const isAllPassed = metrics.every((m) => m.pass);

        setValidationResult({
          isAllPassed,
          metrics,
          actualSizeKb: sizeKb,
          actualWidth: w,
          actualHeight: h,
          actualFormat: fileFormat
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) runValidation(file);
    e.target.value = '';
  };

  // Drag and Drop
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
    if (file) runValidation(file);
  };

  // Load sample photo for testing
  const handleLoadSample = async () => {
    try {
      const res = await fetch(SAMPLE_PHOTO);
      const blob = await res.blob();
      const file = new File([blob], 'candidate_sample_photo.jpg', { type: 'image/jpeg' });
      runValidation(file);
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger re-check if user switches standard with file already uploaded
  const handleSelectStandard = (std: DocumentStandard) => {
    setSelectedStandard(std);
    setIsCustom(false);
    if (uploadedUrl && fileInputRef.current?.files?.[0]) {
      runValidation(fileInputRef.current.files[0]);
    } else {
      setValidationResult(null);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden ${
        isDragOver ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200/90'
      }`}
    >
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
                {lang === 'bn' ? 'ফর্ম ফটো চেকার (Form Photo Checker)' : 'Form Photo Checker'}
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Passport & ID Compliance
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? 'পাসপোর্ট, আধার, প্যান, ভিসা ও সরকারি ফর্মের নিয়মানুযায়ী ছবির সাইজ, ফরম্যাট ও ডাইমেনশন যাচাই করুন'
                : 'Upload a photo to verify it against passport, ID card, visa, or exam requirements with clear Pass/Fail feedback.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-amber-300" />
            <span>{lang === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Photo'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left: Document Standard Selector */}
        <div className="lg:col-span-4 p-5 bg-slate-50 border-r border-slate-200 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
              {lang === 'bn' ? 'ডকুমেন্ট ও ফর্ম নির্বাচন করুন:' : 'Select Document Standard:'}
            </label>

            <div className="space-y-2">
              {COMMON_DOCUMENT_STANDARDS.map((std) => (
                <button
                  key={std.id}
                  onClick={() => handleSelectStandard(std)}
                  className={`w-full p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    selectedStandard.id === std.id && !isCustom
                      ? 'border-emerald-600 bg-white shadow-xs ring-1 ring-emerald-600/30'
                      : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{std.name}</span>
                    <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {std.widthCm}×{std.heightCm} cm
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{std.description}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    Max: {std.maxKb} KB · {std.targetWidthPx}×{std.targetHeightPx}px
                  </div>
                </button>
              ))}

              {/* Custom Specification Option */}
              <button
                onClick={() => {
                  setIsCustom(true);
                  setValidationResult(null);
                }}
                className={`w-full p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  isCustom
                    ? 'border-emerald-600 bg-white shadow-xs ring-1 ring-emerald-600/30'
                    : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">Custom Document Rules</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Specify custom KB range and pixel dimensions</div>
              </button>
            </div>
          </div>

          {/* Custom Settings Inputs */}
          {isCustom && (
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase block">Custom Criteria:</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Min KB</span>
                  <input
                    type="number"
                    value={customMinKb}
                    onChange={(e) => setCustomMinKb(parseInt(e.target.value, 10) || 5)}
                    className="w-full py-1 px-2.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Max KB</span>
                  <input
                    type="number"
                    value={customMaxKb}
                    onChange={(e) => setCustomMaxKb(parseInt(e.target.value, 10) || 50)}
                    className="w-full py-1 px-2.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Width (px)</span>
                  <input
                    type="number"
                    value={customWidthPx}
                    onChange={(e) => setCustomWidthPx(parseInt(e.target.value, 10) || 350)}
                    className="w-full py-1 px-2.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Height (px)</span>
                  <input
                    type="number"
                    value={customHeightPx}
                    onChange={(e) => setCustomHeightPx(parseInt(e.target.value, 10) || 450)}
                    className="w-full py-1 px-2.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Summary Criteria Box */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs">
            <span className="font-bold text-slate-900 block">
              Required Specs for {isCustom ? 'Custom Document' : selectedStandard.name}:
            </span>
            <div className="text-[11px] text-slate-600 space-y-1">
              <div>• <strong>File Size:</strong> {isCustom ? `${customMinKb} – ${customMaxKb} KB` : `${selectedStandard.minKb} – ${selectedStandard.maxKb} KB`}</div>
              <div>• <strong>Allowed Formats:</strong> JPG / JPEG</div>
              <div>• <strong>Expected Size:</strong> {isCustom ? `${customWidthPx} × ${customHeightPx} px` : `${selectedStandard.widthCm} × ${selectedStandard.heightCm} cm (${selectedStandard.targetWidthPx}×${selectedStandard.targetHeightPx}px)`}</div>
              {!isCustom && <div>• <strong>Background:</strong> {selectedStandard.backgroundNote}</div>}
            </div>
          </div>
        </div>

        {/* Right: Inspection Feedback & Pass/Fail Metrics */}
        <div className="lg:col-span-8 p-6 flex flex-col justify-between space-y-5">
          {validationResult ? (
            <div className="space-y-5">
              {/* Overall Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                  validationResult.isAllPassed
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-red-50 border-red-300 text-red-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  {validationResult.isAllPassed ? (
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                      <XCircle className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold">
                      {validationResult.isAllPassed
                        ? '100% Compliant: Ready for Submission!'
                        : 'Document Check Failed: Fixes Required'}
                    </h3>
                    <p className="text-xs opacity-85 mt-0.5">
                      {validationResult.isAllPassed
                        ? `Photo strictly passes all requirements for ${selectedStandard.name}.`
                        : `One or more requirements did not pass. Use the 1-click tools below to correct them.`}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full ${
                    validationResult.isAllPassed ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'
                  }`}>
                    {validationResult.metrics.filter(m => m.pass).length} / {validationResult.metrics.length} PASSED
                  </span>
                </div>
              </div>

              {/* Photo & Silhouette Guide Preview */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-900 rounded-2xl text-white">
                <div className="relative w-28 h-36 bg-black rounded-lg overflow-hidden border border-white/20 flex-shrink-0">
                  {uploadedUrl && (
                    <img src={uploadedUrl} alt="Tested document" className="w-full h-full object-cover" />
                  )}
                  {/* Subtle Face Oval Outline */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-[68%] h-[72%] rounded-full border border-dashed border-amber-300/80 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-200">{fileName}</div>
                  <div className="text-white/60 font-mono">
                    {validationResult.actualWidth}×{validationResult.actualHeight}px · {validationResult.actualSizeKb} KB
                  </div>
                  <p className="text-[11px] text-white/50 leading-relaxed pt-1">
                    Inspected against {isCustom ? 'Custom Document' : selectedStandard.name}. The dashed oval indicates standard facial framing coverage (70–80%).
                  </p>
                </div>
              </div>

              {/* Itemized Pass/Fail Cards for EACH Metric */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Detailed Metric-by-Metric Checklist:
                </span>

                {validationResult.metrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                      metric.pass
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-red-50/60 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {metric.pass ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {lang === 'bn' ? metric.nameBengali : metric.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            (Actual: {metric.actualValue} | Expected: {metric.expectedValue})
                          </span>
                        </div>
                        <p className={`text-[11px] mt-0.5 ${metric.pass ? 'text-emerald-800' : 'text-red-700'}`}>
                          {metric.feedback}
                        </p>
                      </div>
                    </div>

                    {/* Pass/Fail Label */}
                    <div className="flex-shrink-0">
                      {metric.pass ? (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
                          PASS ✓
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-red-800 bg-red-100 px-2.5 py-1 rounded-md">
                          FAIL ✗
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 1-Click Actionable Fix Shortcuts */}
              {!validationResult.isAllPassed && (
                <div className="p-4 bg-slate-900 rounded-xl text-white space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Quick Fix Shortcuts:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onLaunchTool('kb_resizer')}
                      className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Fix File Size in KB Resizer →
                    </button>
                    <button
                      onClick={() => onLaunchTool('passport_maker')}
                      className="py-1.5 px-3 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Crop to Passport Size in Studio →
                    </button>
                    <button
                      onClick={() => onLaunchTool('image_converter')}
                      className="py-1.5 px-3 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Convert Format in Image Converter →
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="py-16 px-6 border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-slate-50/50 rounded-2xl text-center space-y-3 cursor-pointer transition-all my-auto"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <FileCheck className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === 'bn' ? 'যাচাই করতে ছবি আপলোড করুন' : 'Upload a photo to check compliance'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {lang === 'bn'
                    ? 'ছবি আপলোড করলেই ফাইল সাইজ, ফরম্যাট, রেজোলিউশন ও ওরিয়েন্টেশনের জন্য আলাদা আলাদা পাস/ফেল রিপোর্ট পাবেন।'
                    : 'Get immediate pass/fail feedback for passport size, ID requirements, format, and file size.'}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs hover:bg-slate-800 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Select Photo</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadSample();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Try Sample Photo</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="pt-3 border-t border-slate-200 text-xs text-slate-400 flex items-center justify-between">
            <span>100% Client-Side In-Browser Verification</span>
            {fileName && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-emerald-700 font-semibold hover:underline"
              >
                Upload Different Photo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
