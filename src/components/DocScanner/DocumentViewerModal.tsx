import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Trash2, 
  Edit3, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  PenTool, 
  Check, 
  Copy, 
  Search, 
  Folder, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { ScannedDocument, ScannedPage, DocFolder } from '../../types/docScanner';
import { exportDocumentToPdf, downloadBlob, saveDocument } from '../../services/docStorage';
import { extractTextFromImage, OCRResult } from '../../services/ocrService';

interface DocumentViewerModalProps {
  document: ScannedDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onDocumentUpdated: (doc: ScannedDocument) => void;
  onDeleteDocument: (id: string) => void;
  folders: DocFolder[];
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document: initialDoc,
  isOpen,
  onClose,
  onDocumentUpdated,
  onDeleteDocument,
  folders
}) => {
  const [doc, setDoc] = useState<ScannedDocument | null>(initialDoc);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [isAnnotating, setIsAnnotating] = useState<boolean>(false);
  const [penColor, setPenColor] = useState<string>('#dc2626');
  const [penWidth, setPenWidth] = useState<number>(3);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'view' | 'ocr' | 'info'>('view');
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef<boolean>(false);

  useEffect(() => {
    setDoc(initialDoc);
    setCurrentPageIndex(0);
    setZoomLevel(1);
    setIsAnnotating(false);
    setDeleteConfirm(false);
    if (initialDoc) {
      setEditTitle(initialDoc.title);
    }
  }, [initialDoc]);

  if (!isOpen || !doc) return null;

  const currentPage: ScannedPage | undefined = doc.pages[currentPageIndex];
  const currentFolder = folders.find(f => f.id === doc.folderId);

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(3, Math.max(0.5, prev + delta)));
  };

  const handleRotatePage = async () => {
    if (!currentPage) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.height;
      c.height = img.width;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.translate(c.width / 2, c.height / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        const newUrl = c.toDataURL('image/jpeg', 0.92);

        const updatedPages = [...doc.pages];
        updatedPages[currentPageIndex] = {
          ...currentPage,
          processedImageUrl: newUrl,
          rotation: (currentPage.rotation + 90) % 360,
        };

        const updatedDoc = { ...doc, pages: updatedPages };
        setDoc(updatedDoc);
        saveDocument(updatedDoc);
        onDocumentUpdated(updatedDoc);
      }
    };
    img.src = currentPage.processedImageUrl;
  };

  const handleSaveTitle = async () => {
    if (!editTitle.trim()) return;
    const updated = { ...doc, title: editTitle.trim() };
    setDoc(updated);
    setIsEditingTitle(false);
    await saveDocument(updated);
    onDocumentUpdated(updated);
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const blob = await exportDocumentToPdf(doc);
      downloadBlob(blob, `${doc.title.replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      const blob = await exportDocumentToPdf(doc);
      const file = new File([blob], `${doc.title}.pdf`, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: doc.title,
          text: `Document: ${doc.title} scanned with DocScan Pro`,
        });
      } else {
        handleExportPdf();
      }
    } catch (err) {
      handleExportPdf();
    }
  };

  const runOcrOnPage = async () => {
    if (!currentPage) return;
    setOcrLoading(true);
    const res = await extractTextFromImage(currentPage.processedImageUrl);
    setOcrResult(res);
    setOcrLoading(false);
  };

  // Drawing annotation canvas handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isAnnotating || !canvasRef.current) return;
    isDrawing.current = true;
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
  };

  const handleSaveAnnotation = () => {
    if (!canvasRef.current || !currentPage) return;
    const finalUrl = canvasRef.current.toDataURL('image/jpeg', 0.92);
    const updatedPages = [...doc.pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      processedImageUrl: finalUrl,
    };
    const updated = { ...doc, pages: updatedPages };
    setDoc(updated);
    saveDocument(updated);
    onDocumentUpdated(updated);
    setIsAnnotating(false);
  };

  // Setup drawing canvas when entering annotation mode
  useEffect(() => {
    if (isAnnotating && canvasRef.current && currentPage) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 1100;
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = currentPage.processedImageUrl;
    }
  }, [isAnnotating, currentPage]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white animate-in fade-in duration-200 overflow-hidden">
      {/* Top Header */}
      <div className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {isEditingTitle ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-slate-800 text-white border border-blue-500 rounded-lg px-2 py-0.5 text-xs font-bold"
                autoFocus
              />
              <button onClick={handleSaveTitle} className="p-1 text-emerald-400">
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 truncate cursor-pointer" onClick={() => setIsEditingTitle(true)}>
              <h3 className="text-sm font-bold text-white truncate max-w-[180px] sm:max-w-xs">{doc.title}</h3>
              <Edit3 className="w-3.5 h-3.5 text-slate-400 hover:text-blue-400 shrink-0" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab(activeTab === 'ocr' ? 'view' : 'ocr')}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
              activeTab === 'ocr' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="OCR Text Recognition"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">OCR</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl"
            title="Share Document"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main Preview Workspace */}
      <div className="flex-1 relative overflow-auto flex items-center justify-center p-4 bg-slate-950">
        {activeTab === 'view' && currentPage && (
          <div className="relative flex flex-col items-center">
            {isAnnotating ? (
              <div className="space-y-2 flex flex-col items-center">
                <canvas
                  ref={canvasRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="rounded-xl shadow-2xl border border-blue-500/50 touch-none max-h-[65vh] object-contain bg-white cursor-crosshair"
                />
                <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold">Pen:</span>
                  {['#dc2626', '#2563eb', '#16a34a', '#000000', '#facc15'].map(c => (
                    <button
                      key={c}
                      onClick={() => setPenColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-5 h-5 rounded-full ${penColor === c ? 'ring-2 ring-white scale-110' : ''}`}
                    />
                  ))}
                  <button
                    onClick={handleSaveAnnotation}
                    className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-xl text-xs font-bold"
                  >
                    Save Markings
                  </button>
                  <button
                    onClick={() => setIsAnnotating(false)}
                    className="px-2 py-1 text-slate-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease' }}
                className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 bg-black max-w-full"
              >
                <img
                  src={currentPage.processedImageUrl}
                  alt={`Page ${currentPageIndex + 1}`}
                  className="max-h-[68vh] object-contain select-none"
                />
              </div>
            )}
          </div>
        )}

        {/* OCR Tab Content */}
        {activeTab === 'ocr' && (
          <div className="w-full max-w-lg bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold text-white">Extracted Text (Page {currentPageIndex + 1})</h4>
              </div>
              <button
                onClick={runOcrOnPage}
                disabled={ocrLoading}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow"
              >
                {ocrLoading ? 'Scanning...' : 'Extract Text'}
              </button>
            </div>

            {ocrResult ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
                  {ocrResult.fullText}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Confidence: ~{ocrResult.confidence}%</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(ocrResult.fullText);
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copySuccess ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                <FileText className="w-8 h-8 mx-auto text-slate-500" />
                <p>Click "Extract Text" above to read and index text using local OCR.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Zoom & Annotation Toolbar */}
      {activeTab === 'view' && !isAnnotating && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl z-20">
          <button
            onClick={() => handleZoom(-0.25)}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold px-1 text-slate-300">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.25)}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-slate-700 mx-1" />
          <button
            onClick={handleRotatePage}
            className="p-1.5 text-slate-300 hover:text-blue-400 rounded-lg hover:bg-slate-800"
            title="Rotate Page 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAnnotating(true)}
            className="p-1.5 text-slate-300 hover:text-amber-400 rounded-lg hover:bg-slate-800"
            title="Annotate & Sign"
          >
            <PenTool className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Page Thumbnail Strip */}
      <div className="h-18 px-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none flex-1">
          {doc.pages.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => {
                setCurrentPageIndex(idx);
                setZoomLevel(1);
                setIsAnnotating(false);
              }}
              className={`relative h-12 w-10 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                currentPageIndex === idx
                  ? 'border-blue-500 scale-105 shadow-md shadow-blue-500/20'
                  : 'border-slate-700 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={p.processedImageUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] font-bold text-center text-white">
                {idx + 1}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
          {deleteConfirm ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-rose-400 font-bold">Delete?</span>
              <button
                onClick={() => {
                  onDeleteDocument(doc.id);
                  onClose();
                }}
                className="px-2 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold"
              >
                Yes
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800"
              title="Delete Document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
