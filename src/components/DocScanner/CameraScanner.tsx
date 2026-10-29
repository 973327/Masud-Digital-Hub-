import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  X, 
  RotateCw, 
  Check, 
  Layers, 
  Trash2, 
  Sliders, 
  Zap, 
  ZapOff, 
  Plus, 
  ArrowLeft, 
  FileText, 
  Image as ImageIcon,
  Crop,
  Sparkles,
  Move
} from 'lucide-react';
import { Point, QuadCorners, DocumentFilterType, ScannedPage, ScannedDocument, DocFolder, DocCategory } from '../../types/docScanner';
import { detectDocumentCorners, warpPerspectiveCanvas, applyDocumentFilter, rotateCanvas } from '../../services/imageProcessingUtils';
import { saveDocument, getAllFolders } from '../../services/docStorage';

interface CameraScannerProps {
  onClose: () => void;
  onDocumentSaved: (doc: ScannedDocument) => void;
  initialFolderId?: string;
  initialImageFile?: File;
}

type ScanStage = 'camera' | 'crop' | 'filter' | 'review' | 'save_meta';

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onClose,
  onDocumentSaved,
  initialFolderId = 'folder_personal',
  initialImageFile
}) => {
  const [stage, setStage] = useState<ScanStage>('camera');
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  
  // Camera stream state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [hasTorchSupport, setHasTorchSupport] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Active uncropped snapshot for current editing
  const [rawImage, setRawImage] = useState<HTMLImageElement | null>(null);
  const [corners, setCorners] = useState<QuadCorners | null>(null);
  const [activeCornerDrag, setActiveCornerDrag] = useState<keyof QuadCorners | null>(null);

  // Cropped canvas for filter adjustment
  const [croppedCanvas, setCroppedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [filterType, setFilterType] = useState<DocumentFilterType>('color');
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  // Save metadata
  const [docTitle, setDocTitle] = useState<string>(() => {
    const d = new Date();
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
    return `Scan_${dateStr}`;
  });
  const [selectedFolderId, setSelectedFolderId] = useState<string>(initialFolderId);
  const [selectedCategory, setSelectedCategory] = useState<DocCategory>('business');
  const [folders, setFolders] = useState<DocFolder[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const cropCanvasRef = useRef<HTMLCanvasElement>(null);

  // Load folders
  useEffect(() => {
    getAllFolders().then(setFolders);
  }, []);

  // Handle initial file upload if passed
  useEffect(() => {
    if (initialImageFile) {
      handleImportFromFile(initialImageFile);
    } else {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [initialImageFile]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this browser');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      setStream(mediaStream);
      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Check torch capabilities
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = (track as any).getCapabilities?.() || {};
      if (capabilities.torch) {
        setHasTorchSupport(true);
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setHasCameraPermission(false);
      setCameraError(err.message || 'Could not access device camera');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track && hasTorchSupport) {
      try {
        const next = !isTorchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: next }]
        });
        setIsTorchOn(next);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    const img = new Image();
    img.onload = () => {
      setRawImage(img);
      const detected = detectDocumentCorners(img);
      setCorners(detected);
      setStage('crop');
    };
    img.src = dataUrl;
  };

  const handleImportFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setRawImage(img);
        const detected = detectDocumentCorners(img);
        setCorners(detected);
        setStage('crop');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Redraw crop overlay canvas
  useEffect(() => {
    if (stage !== 'crop' || !rawImage || !corners || !cropCanvasRef.current) return;

    const canvas = cropCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale canvas to fit viewport
    const maxWidth = Math.min(window.innerWidth - 32, 500);
    const scale = maxWidth / rawImage.width;
    canvas.width = maxWidth;
    canvas.height = rawImage.height * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(rawImage, 0, 0, canvas.width, canvas.height);

    // Darken exterior
    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear interior polygon
    const c = {
      tl: { x: corners.topLeft.x * scale, y: corners.topLeft.y * scale },
      tr: { x: corners.topRight.x * scale, y: corners.topRight.y * scale },
      br: { x: corners.bottomRight.x * scale, y: corners.bottomRight.y * scale },
      bl: { x: corners.bottomLeft.x * scale, y: corners.bottomLeft.y * scale },
    };

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(c.tl.x, c.tl.y);
    ctx.lineTo(c.tr.x, c.tr.y);
    ctx.lineTo(c.br.x, c.br.y);
    ctx.lineTo(c.bl.x, c.bl.y);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(rawImage, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw boundary lines
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(c.tl.x, c.tl.y);
    ctx.lineTo(c.tr.x, c.tr.y);
    ctx.lineTo(c.br.x, c.br.y);
    ctx.lineTo(c.bl.x, c.bl.y);
    ctx.closePath();
    ctx.stroke();

    // Draw corner handles
    const handleRadius = 10;
    const cornerPoints = [
      { key: 'topLeft', pt: c.tl },
      { key: 'topRight', pt: c.tr },
      { key: 'bottomRight', pt: c.br },
      { key: 'bottomLeft', pt: c.bl },
    ];

    cornerPoints.forEach(({ pt }) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, handleRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 3;
      ctx.stroke();
    });
  }, [stage, rawImage, corners]);

  // Touch / Pointer handling for corner adjustment
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!rawImage || !corners || !cropCanvasRef.current) return;
    const rect = cropCanvasRef.current.getBoundingClientRect();
    const scale = cropCanvasRef.current.width / rawImage.width;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hitDist = 28;
    const pts: [keyof QuadCorners, Point][] = [
      ['topLeft', { x: corners.topLeft.x * scale, y: corners.topLeft.y * scale }],
      ['topRight', { x: corners.topRight.x * scale, y: corners.topRight.y * scale }],
      ['bottomRight', { x: corners.bottomRight.x * scale, y: corners.bottomRight.y * scale }],
      ['bottomLeft', { x: corners.bottomLeft.x * scale, y: corners.bottomLeft.y * scale }],
    ];

    for (const [key, pt] of pts) {
      if (Math.hypot(pt.x - x, pt.y - y) <= hitDist) {
        setActiveCornerDrag(key);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        break;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activeCornerDrag || !rawImage || !corners || !cropCanvasRef.current) return;
    const rect = cropCanvasRef.current.getBoundingClientRect();
    const scale = cropCanvasRef.current.width / rawImage.width;
    const x = Math.max(0, Math.min(rawImage.width, (e.clientX - rect.left) / scale));
    const y = Math.max(0, Math.min(rawImage.height, (e.clientY - rect.top) / scale));

    setCorners(prev => prev ? {
      ...prev,
      [activeCornerDrag]: { x, y }
    } : null);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeCornerDrag) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setActiveCornerDrag(null);
    }
  };

  const applyCropAndProceed = () => {
    if (!rawImage || !corners) return;
    const warped = warpPerspectiveCanvas(rawImage, corners);
    setCroppedCanvas(warped);
    setFilterType('color');
    setBrightness(100);
    setContrast(100);
    setRotationAngle(0);
    setStage('filter');
  };

  const getFilteredDataUrl = (): string => {
    if (!croppedCanvas) return '';
    let filtered = applyDocumentFilter(croppedCanvas, filterType, brightness, contrast);
    if (rotationAngle !== 0) {
      filtered = rotateCanvas(filtered, rotationAngle);
    }
    return filtered.toDataURL('image/jpeg', 0.92);
  };

  const saveCurrentPage = () => {
    if (!rawImage || !croppedCanvas) return;
    const finalUrl = getFilteredDataUrl();

    const newPage: ScannedPage = {
      id: `page_${Date.now()}_${pages.length + 1}`,
      originalImageUrl: rawImage.src,
      processedImageUrl: finalUrl,
      rotation: rotationAngle,
      filter: filterType,
      brightness,
      contrast,
      corners: corners || undefined,
      width: croppedCanvas.width,
      height: croppedCanvas.height
    };

    setPages(prev => [...prev, newPage]);
    setStage('review');
  };

  const handleSaveDocument = async () => {
    if (pages.length === 0) return;
    setIsSaving(true);

    try {
      const doc: ScannedDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: docTitle.trim() || 'Untitled Document',
        folderId: selectedFolderId,
        category: selectedCategory,
        pageCount: pages.length,
        pages,
        thumbnail: pages[0].processedImageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: false,
        fileType: 'scanned_pdf',
        sizeBytes: pages.length * 150000,
        extractedText: `Document ${docTitle} scanned with ${pages.length} pages.`
      };

      await saveDocument(doc);
      onDocumentSaved(doc);
    } catch (err) {
      console.error('Failed to save document:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b192c] text-white flex flex-col select-none overflow-hidden animate-in fade-in duration-200">
      {/* Top Navigation Bar */}
      <div className="h-14 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Exit Scanner"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 font-bold text-sm tracking-tight text-white">
          <Camera className="w-4 h-4 text-blue-400" />
          <span>
            {stage === 'camera' && 'Document Scanner'}
            {stage === 'crop' && 'Adjust Document Corners'}
            {stage === 'filter' && 'Enhance & Filters'}
            {stage === 'review' && `Scanned Pages (${pages.length})`}
            {stage === 'save_meta' && 'Save Document'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {stage === 'camera' && hasTorchSupport && (
            <button
              onClick={toggleTorch}
              className={`p-2 rounded-xl transition-colors ${isTorchOn ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
              title="Toggle Flashlight"
            >
              {isTorchOn ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
            </button>
          )}

          {stage === 'crop' && (
            <button
              onClick={applyCropAndProceed}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow transition-colors flex items-center gap-1.5"
            >
              <span>Next</span>
              <Check className="w-4 h-4" />
            </button>
          )}

          {stage === 'filter' && (
            <button
              onClick={saveCurrentPage}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow transition-colors flex items-center gap-1.5"
            >
              <span>Keep Page</span>
              <Check className="w-4 h-4" />
            </button>
          )}

          {stage === 'review' && (
            <button
              onClick={() => setStage('save_meta')}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition-colors flex items-center gap-1.5"
            >
              <span>Done</span>
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Body per Stage */}
      <div className="flex-1 relative flex items-center justify-center p-3 overflow-y-auto">
        {/* STAGE 1: CAMERA STREAM */}
        {stage === 'camera' && (
          <div className="w-full h-full max-w-md mx-auto flex flex-col justify-between items-center relative">
            {hasCameraPermission === false ? (
              <div className="my-auto text-center p-6 bg-slate-800/80 rounded-3xl border border-slate-700 max-w-xs space-y-4">
                <Camera className="w-12 h-12 text-slate-400 mx-auto" />
                <div>
                  <h4 className="font-bold text-white text-base">Camera Access Required</h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Allow camera access or upload an existing image from your device gallery.
                  </p>
                </div>
                <label className="block w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer text-center shadow">
                  <span>Pick from Gallery</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImportFromFile(file);
                    }}
                  />
                </label>
              </div>
            ) : (
              <>
                {/* Live viewfinder with document alignment guide */}
                <div className="relative w-full aspect-[3/4] max-h-[72vh] rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-700/80 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Document Alignment Frame */}
                  <div className="absolute inset-5 border-2 border-white/60 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between">
                      <div className="w-4 h-4 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1 rounded-tl-sm" />
                      <div className="w-4 h-4 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1 rounded-tr-sm" />
                    </div>
                    <p className="text-center text-xs font-semibold text-white/90 bg-black/40 backdrop-blur-xs px-3 py-1 rounded-full w-fit mx-auto">
                      Align document inside frame
                    </p>
                    <div className="flex justify-between">
                      <div className="w-4 h-4 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1 rounded-bl-sm" />
                      <div className="w-4 h-4 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1 rounded-br-sm" />
                    </div>
                  </div>
                </div>

                {/* Shutter controls */}
                <div className="w-full py-4 flex items-center justify-around">
                  <label className="p-3 rounded-full bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors" title="Gallery">
                    <ImageIcon className="w-6 h-6" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImportFromFile(file);
                      }}
                    />
                  </label>

                  {/* Main Shutter Button */}
                  <button
                    onClick={capturePhoto}
                    className="w-18 h-18 rounded-full border-4 border-white p-1 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  >
                    <div className="w-full h-full rounded-full bg-blue-600 hover:bg-blue-500" />
                  </button>

                  <div className="w-12 h-12 flex items-center justify-center">
                    {pages.length > 0 && (
                      <button
                        onClick={() => setStage('review')}
                        className="relative p-2 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-bold text-white hover:bg-slate-700"
                      >
                        <Layers className="w-5 h-5 text-blue-400" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white rounded-full text-[10px] flex items-center justify-center font-black">
                          {pages.length}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* STAGE 2: MANUAL CORNER CROP */}
        {stage === 'crop' && (
          <div className="flex flex-col items-center gap-3">
            <div className="relative touch-none cursor-crosshair">
              <canvas
                ref={cropCanvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="rounded-xl shadow-2xl border border-slate-700 max-h-[68vh]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (rawImage) setCorners(detectDocumentCorners(rawImage));
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Auto Detect</span>
              </button>
              <button
                onClick={() => {
                  if (rawImage) {
                    setCorners({
                      topLeft: { x: 0, y: 0 },
                      topRight: { x: rawImage.width, y: 0 },
                      bottomRight: { x: rawImage.width, y: rawImage.height },
                      bottomLeft: { x: 0, y: rawImage.height },
                    });
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5"
              >
                <Crop className="w-3.5 h-3.5 text-slate-400" />
                <span>Full Frame</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: FILTER & ENHANCE */}
        {stage === 'filter' && croppedCanvas && (
          <div className="flex flex-col items-center gap-4 w-full max-w-sm">
            {/* Live Filter Preview */}
            <div className="relative max-h-[52vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex items-center justify-center bg-black">
              <img
                src={getFilteredDataUrl()}
                alt="Document preview"
                className="max-h-[50vh] object-contain"
              />
            </div>

            {/* Filter selection tabs */}
            <div className="w-full grid grid-cols-4 gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800">
              {(['original', 'color', 'grayscale', 'bw'] as DocumentFilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold capitalize transition-colors ${
                    filterType === f
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f === 'color' ? 'Magic' : f}
                </button>
              ))}
            </div>

            {/* Rotation & Quick Tools */}
            <div className="flex items-center justify-center gap-3 w-full">
              <button
                onClick={() => setRotationAngle(r => (r + 90) % 360)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold"
              >
                <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                <span>Rotate 90°</span>
              </button>
              <button
                onClick={() => {
                  setBrightness(100);
                  setContrast(100);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* STAGE 4: MULTI-PAGE REVIEW */}
        {stage === 'review' && (
          <div className="w-full max-w-md mx-auto space-y-4">
            <div className="grid grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto p-1">
              {pages.map((p, idx) => (
                <div
                  key={p.id}
                  className="relative group bg-slate-900 rounded-2xl p-2 border border-slate-800 flex flex-col items-center"
                >
                  <img
                    src={p.processedImageUrl}
                    alt={`Page ${idx + 1}`}
                    className="w-full h-44 object-contain rounded-xl bg-black/40"
                  />
                  <div className="w-full flex items-center justify-between mt-2 px-1 text-xs text-slate-400">
                    <span className="font-bold text-white">Page {idx + 1}</span>
                    <button
                      onClick={() => {
                        setPages(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom action bar */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setStage('camera');
                  startCamera();
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 shadow"
              >
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Add Another Page</span>
              </button>

              <button
                onClick={() => setStage('save_meta')}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow"
              >
                <Check className="w-4 h-4" />
                <span>Save ({pages.length} Pages)</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 5: SAVE METADATA & FOLDER PICKER */}
        {stage === 'save_meta' && (
          <div className="w-full max-w-md bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Save Scanned Document</h3>
              <p className="text-xs text-slate-400 mt-0.5">Specify document details and target folder</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., GST Invoice Oct 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Folder</label>
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as DocCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="business">Business Documents</option>
                  <option value="bills">Bills & Receipts</option>
                  <option value="id_cards">ID Cards & Passports</option>
                  <option value="business_cards">Business Cards</option>
                  <option value="certificates">Certificates</option>
                  <option value="education">Educational Documents</option>
                  <option value="personal">Personal Documents</option>
                  <option value="other">Other Documents</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setStage('review')}
                className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleSaveDocument}
                disabled={isSaving}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Confirm & Save Document'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
