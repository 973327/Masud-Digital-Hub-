import React, { useState, useRef } from 'react';
import { 
  FileCode, 
  Upload, 
  Download, 
  CheckCircle2, 
  RefreshCw, 
  Image as ImageIcon, 
  Trash2, 
  ArrowRight, 
  Sliders, 
  Eye, 
  Sparkles,
  Layers,
  Check,
  Info
} from 'lucide-react';
import { formatBytes, blobToDataUrl } from '../../services/imageProcessing';

interface ImageItem {
  id: string;
  name: string;
  originalBlob: Blob;
  originalSize: number;
  originalUrl: string;
  width: number;
  height: number;
  convertedBlob?: Blob;
  convertedUrl?: string;
  convertedSize?: number;
}

interface ImageConverterToolProps {
  onNavigateBack: () => void;
  lang?: 'en' | 'bn';
}

const SAMPLE_PHOTO = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80';

export const ImageConverterTool: React.FC<ImageConverterToolProps> = ({
  onNavigateBack,
  lang = 'en'
}) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState<number>(0.90);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [previewItem, setPreviewItem] = useState<ImageItem | null>(null);
  const [jpgBackgroundColor, setJpgBackgroundColor] = useState<string>('#ffffff');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process incoming files
  const processFiles = (files: File[]) => {
    const validFiles = files.filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    validFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setImages((prev) => [
          ...prev,
          {
            id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
            name: file.name,
            originalBlob: file,
            originalSize: file.size,
            originalUrl: url,
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height
          }
        ]);
      };
      img.src = url;
    });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) processFiles(files);
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
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) processFiles(files);
  };

  // Load sample image
  const handleLoadSample = async () => {
    try {
      const response = await fetch(SAMPLE_PHOTO);
      const blob = await response.blob();
      const file = new File([blob], 'sample_portrait.jpg', { type: 'image/jpeg' });
      processFiles([file]);
    } catch (err) {
      console.error(err);
    }
  };

  // Convert All Images
  const handleConvertAll = async () => {
    if (images.length === 0) return;
    setIsConverting(true);

    try {
      const convertedList = await Promise.all(
        images.map(async (item) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise((res, rej) => {
            img.onload = res;
            img.onerror = rej;
            img.src = item.originalUrl;
          });

          const canvas = document.createElement('canvas');
          canvas.width = item.width || img.naturalWidth || img.width;
          canvas.height = item.height || img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return item;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // If converting to JPEG, fill transparency with background color (default white)
          if (targetFormat === 'image/jpeg') {
            ctx.fillStyle = jpgBackgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const convertedBlob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b || item.originalBlob), targetFormat, quality);
          });

          const convertedUrl = await blobToDataUrl(convertedBlob);

          return {
            ...item,
            convertedBlob,
            convertedUrl,
            convertedSize: convertedBlob.size
          };
        })
      );

      setImages(convertedList);
    } catch (err) {
      console.error(err);
    } finally {
      setIsConverting(false);
    }
  };

  // Download converted item
  const handleDownloadItem = (item: ImageItem) => {
    if (!item.convertedUrl) return;
    const ext = targetFormat === 'image/jpeg' ? 'jpg' : targetFormat === 'image/png' ? 'png' : 'webp';
    const base = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    const link = document.createElement('a');
    link.href = item.convertedUrl;
    link.download = `${base}_converted.${ext}`;
    link.click();
  };

  // Batch Download All Converted
  const handleDownloadAll = () => {
    images.forEach((item, index) => {
      if (item.convertedUrl) {
        setTimeout(() => {
          handleDownloadItem(item);
        }, index * 250);
      }
    });
  };

  const hasAnyConverted = images.some((img) => img.convertedUrl);

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
                {lang === 'bn' ? 'ইমেজ কনভার্টার (JPG, PNG, WebP)' : 'Image Converter'}
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                JPG · PNG · WebP
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? 'জেপিজি, পিএনজি এবং ওয়েবপি ফরম্যাটে দ্রুত রূপান্তর করুন, ফাইলের সাইজ দেখুন ও ডাউনলোড করুন'
                : 'Convert images between JPG, PNG, and WebP with file size metrics and batch download.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-amber-300" />
            <span>{lang === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Images'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp"
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Main Workspace */}
      <div className="p-6 space-y-6">
        {/* Conversion Settings & Controls Bar */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Target Format Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {lang === 'bn' ? 'টার্গেট ফরম্যাট:' : 'Convert To:'}
              </span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                {[
                  { id: 'image/jpeg', label: 'JPG', desc: 'Standard / Photos' },
                  { id: 'image/png', label: 'PNG', desc: 'Lossless / Transparent' },
                  { id: 'image/webp', label: 'WebP', desc: 'Smallest Web Size' }
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setTargetFormat(fmt.id as any)}
                    className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      targetFormat === fmt.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider (for JPG and WebP) */}
            {targetFormat !== 'image/png' && (
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-600">
                  {lang === 'bn' ? 'কোয়ালিটি:' : 'Quality:'}
                </span>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="accent-emerald-600 w-24 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {Math.round(quality * 100)}%
                </span>
              </div>
            )}

            {/* Convert Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleConvertAll}
                disabled={images.length === 0 || isConverting}
                className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isConverting ? 'animate-spin' : ''}`} />
                <span>
                  {isConverting
                    ? 'Converting...'
                    : lang === 'bn'
                    ? `সব কনভার্ট করুন (${images.length})`
                    : `Convert All (${images.length})`}
                </span>
              </button>

              {hasAnyConverted && (
                <button
                  onClick={handleDownloadAll}
                  className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download All</span>
                </button>
              )}
            </div>
          </div>

          {/* Background note when converting to JPG */}
          {targetFormat === 'image/jpeg' && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span>
                {lang === 'bn'
                  ? 'পিএনজি থেকে জেপিজি কনভার্ট করলে স্বচ্ছ ব্যাকগ্রাউন্ড সাদা রঙে ফিল হবে।'
                  : 'Converting transparent PNG/WebP to JPG automatically fills transparent areas with clean white.'}
              </span>
            </div>
          )}
        </div>

        {/* Image Items List */}
        {images.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-700">
                {images.length} Image{images.length > 1 ? 's' : ''} in queue
              </span>
              <button
                onClick={() => setImages([])}
                className="text-red-600 hover:underline font-semibold cursor-pointer"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {images.map((item, idx) => {
                const diffPercent = item.convertedSize
                  ? Math.round(((item.originalSize - item.convertedSize) / item.originalSize) * 100)
                  : null;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Image Thumbnail */}
                      <div 
                        onClick={() => setPreviewItem(item)}
                        className="w-14 h-14 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex-shrink-0 cursor-pointer relative group/thumb"
                      >
                        <img 
                          src={item.convertedUrl || item.originalUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {item.width}×{item.height}px
                        </div>

                        {/* File Size Breakdown */}
                        <div className="flex items-center gap-1.5 text-xs font-mono mt-1">
                          <span className="text-slate-500">{formatBytes(item.originalSize)}</span>
                          {item.convertedSize && (
                            <>
                              <ArrowRight className="w-3 h-3 text-emerald-600" />
                              <span className="font-bold text-emerald-700 font-mono">
                                {formatBytes(item.convertedSize)}
                              </span>
                              {diffPercent !== null && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-sans ${
                                  diffPercent > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {diffPercent > 0 ? `-${diffPercent}%` : `+${Math.abs(diffPercent)}%`}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {item.convertedUrl ? (
                        <button
                          onClick={() => handleDownloadItem(item)}
                          className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                          title="Download Converted File"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleConvertAll}
                          disabled={isConverting}
                          className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Convert
                        </button>
                      )}

                      <button
                        onClick={() => setImages((prev) => prev.filter((i) => i.id !== item.id))}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Empty State Dropzone */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="py-16 px-6 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-slate-50/60 rounded-2xl text-center space-y-3 cursor-pointer transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <FileCode className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {lang === 'bn' ? 'ছবি ড্রপ করুন বা ক্লিক করে আপলোড করুন' : 'Drop your images here, or click to upload'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {lang === 'bn'
                  ? 'জেপিজি, পিএনজি এবং ওয়েবপি ছবি দ্রুত অন্য ফরম্যাটে রূপান্তর করুন এবং সাইজের পরিবর্তন দেখুন।'
                  : 'Supports converting between JPG, PNG, and WebP with instant file size comparison.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs hover:bg-slate-800 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Select Images</span>
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
                <span>Try Sample Image</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div 
          onClick={() => setPreviewItem(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 truncate">{previewItem.name}</h4>
              <button 
                onClick={() => setPreviewItem(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[360px] bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-2">
              <img 
                src={previewItem.convertedUrl || previewItem.originalUrl} 
                alt="Preview" 
                className="max-h-[340px] max-w-full object-contain" 
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-500">
                {previewItem.convertedSize 
                  ? `${formatBytes(previewItem.originalSize)} → ${formatBytes(previewItem.convertedSize)}`
                  : formatBytes(previewItem.originalSize)}
              </span>

              {previewItem.convertedUrl && (
                <button
                  onClick={() => handleDownloadItem(previewItem)}
                  className="py-1.5 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download This File</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
