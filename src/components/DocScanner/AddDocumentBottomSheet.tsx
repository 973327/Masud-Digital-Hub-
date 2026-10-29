import React, { useRef } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  FileText, 
  Files, 
  X, 
  ChevronRight,
  FolderPlus
} from 'lucide-react';
import { DocFolder } from '../../types/docScanner';

interface AddDocumentBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScanCamera: () => void;
  onSelectImportGallery: (file: File) => void;
  onSelectImportPdf: (file: File) => void;
  onSelectImportDoc: (file: File) => void;
  folders: DocFolder[];
  selectedFolderId: string;
  onSelectFolder: (id: string) => void;
}

export const AddDocumentBottomSheet: React.FC<AddDocumentBottomSheetProps> = ({
  isOpen,
  onClose,
  onSelectScanCamera,
  onSelectImportGallery,
  onSelectImportPdf,
  onSelectImportDoc,
  folders,
  selectedFolderId,
  onSelectFolder
}) => {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl p-5 pb-8 space-y-4 z-10 animate-in slide-in-from-bottom duration-200">
        {/* Drag Handle Indicator */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto -mt-1 mb-2" />

        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Add New Document</h3>
            <p className="text-xs text-slate-500">Scan physical paper or import from device</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Folder Selector */}
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <FolderPlus className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">Save into:</span>
          </div>
          <select
            value={selectedFolderId}
            onChange={(e) => onSelectFolder(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 font-bold text-slate-800 text-xs focus:outline-none"
          >
            {folders.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        {/* 4 Working Action Options */}
        <div className="grid grid-cols-1 gap-2.5">
          {/* Option 1: Live Camera Scan */}
          <button
            onClick={() => {
              onClose();
              onSelectScanCamera();
            }}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Scan from Camera</h4>
                <p className="text-xs text-slate-500">Auto edge-detection, perspective crop & filters</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Option 2: Import from Gallery */}
          <button
            onClick={() => galleryInputRef.current?.click()}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Import from Gallery</h4>
                <p className="text-xs text-slate-500">Pick image photos from device storage</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onClose();
                onSelectImportGallery(file);
              }
            }}
          />

          {/* Option 3: Import PDF as Images */}
          <button
            onClick={() => pdfInputRef.current?.click()}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Import PDF File</h4>
                <p className="text-xs text-slate-500">Extract pages or store PDF in library</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onClose();
                onSelectImportPdf(file);
              }
            }}
          />

          {/* Option 4: Import Documents (TXT, Markdown, Docs) */}
          <button
            onClick={() => docInputRef.current?.click()}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Files className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Import Other Documents</h4>
                <p className="text-xs text-slate-500">Text files, reports, or document drafts</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <input
            ref={docInputRef}
            type="file"
            accept=".txt,.md,.pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onClose();
                onSelectImportDoc(file);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
