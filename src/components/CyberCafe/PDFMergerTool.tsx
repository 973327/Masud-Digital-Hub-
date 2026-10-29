import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Layers, 
  Eye, 
  Plus, 
  FileCheck,
  MoveVertical
} from 'lucide-react';
import { mergePDFs, getPdfPageCount } from '../../services/pdfService';
import { formatBytes } from '../../services/imageProcessing';

interface PDFFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

interface PDFMergerToolProps {
  onNavigateBack: () => void;
  lang?: 'en' | 'bn';
}

export const PDFMergerTool: React.FC<PDFMergerToolProps> = ({
  onNavigateBack,
  lang = 'en'
}) => {
  const [pdfFiles, setPdfFiles] = useState<PDFFileItem[]>([]);
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [isReadingFiles, setIsReadingFiles] = useState<boolean>(false);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [mergedSize, setMergedSize] = useState<number>(0);
  const [mergedPageCount, setMergedPageCount] = useState<number>(0);
  const [customFileName, setCustomFileName] = useState<string>('Combined_Document.pdf');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  // Process incoming files and extract page counts asynchronously
  const processFiles = async (files: File[]) => {
    setErrorMessage(null);
    const validPdfFiles = files.filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (validPdfFiles.length === 0) {
      setErrorMessage(
        lang === 'bn'
          ? 'অনুগ্রহ করে শুধুমাত্র ভ্যালিড পিডিএফ (.pdf) ফাইল নির্বাচন করুন।'
          : 'Please select valid PDF (.pdf) files only.'
      );
      return;
    }

    if (validPdfFiles.length < files.length) {
      setErrorMessage(
        lang === 'bn'
          ? 'কিছু ফাইল বাদ দেওয়া হয়েছে কারণ সেগুলি পিডিএফ ফরম্যাটে ছিল না।'
          : 'Some non-PDF files were skipped.'
      );
    }

    setIsReadingFiles(true);

    try {
      const newItems: PDFFileItem[] = [];

      for (const file of validPdfFiles) {
        const pages = await getPdfPageCount(file);
        newItems.push({
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
          pageCount: pages
        });
      }

      setPdfFiles((prev) => [...prev, ...newItems]);
      // Reset any previous merged result when new files are added
      if (mergedUrl) {
        URL.revokeObjectURL(mergedUrl);
        setMergedUrl(null);
        setMergedBlob(null);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to read page details from uploaded PDFs.');
    } finally {
      setIsReadingFiles(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
    // reset input so the same file can be re-selected if removed
    e.target.value = '';
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  // Reorder Item: Move Up
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setPdfFiles((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return updated;
    });
    resetMergedResult();
  };

  // Reorder Item: Move Down
  const handleMoveDown = (index: number) => {
    if (index >= pdfFiles.length - 1) return;
    setPdfFiles((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return updated;
    });
    resetMergedResult();
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    setPdfFiles((prev) => prev.filter((item) => item.id !== id));
    resetMergedResult();
  };

  // Clear All
  const handleClearAll = () => {
    setPdfFiles([]);
    resetMergedResult();
    setErrorMessage(null);
  };

  const resetMergedResult = () => {
    if (mergedUrl) {
      URL.revokeObjectURL(mergedUrl);
      setMergedUrl(null);
      setMergedBlob(null);
    }
  };

  // Execute Merge
  const handleMergePdfs = async () => {
    if (pdfFiles.length < 2) {
      setErrorMessage(
        lang === 'bn'
          ? 'পিডিএফ মার্জ করতে অনুগ্রহ করে কমপক্ষে ২টি পিডিএফ ফাইল যুক্ত করুন।'
          : 'Please add at least 2 PDF files to merge.'
      );
      return;
    }

    setIsMerging(true);
    setErrorMessage(null);

    try {
      const blobs = pdfFiles.map((item) => item.file);
      const combinedBlob = await mergePDFs(blobs);
      const url = URL.createObjectURL(combinedBlob);

      const totalPages = pdfFiles.reduce((acc, curr) => acc + curr.pageCount, 0);

      setMergedBlob(combinedBlob);
      setMergedUrl(url);
      setMergedSize(combinedBlob.size);
      setMergedPageCount(totalPages);
    } catch (err) {
      console.error(err);
      setErrorMessage(
        lang === 'bn'
          ? 'পিডিএফ একত্রিত করার সময় একটি ত্রুটি ঘটেছে। অনুগ্রহ করে ফাইলগুলি চেক করুন।'
          : 'An error occurred while merging PDFs. Please verify that files are not password-protected.'
      );
    } finally {
      setIsMerging(false);
    }
  };

  // Download Merged Document
  const handleDownload = () => {
    if (!mergedUrl) return;
    let fileName = customFileName.trim();
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      fileName += '.pdf';
    }
    const link = document.createElement('a');
    link.href = mergedUrl;
    link.download = fileName || 'Combined_Document.pdf';
    link.click();
  };

  // Computed summary
  const totalPagesSum = pdfFiles.reduce((acc, item) => acc + item.pageCount, 0);
  const totalSizeBytes = pdfFiles.reduce((acc, item) => acc + item.size, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
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
                {lang === 'bn' ? 'পিডিএফ জোড়া লাগান (PDF Merger)' : 'PDF Merger'}
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {lang === 'bn' ? '১০০% ব্রাউজার প্রসেসিং' : '100% In-Browser Secure'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? 'একাধিক পিডিএফ ফাইল আপলোড করুন, সহজে ক্রমানুসারে সাজান এবং একটি ফাইলে মার্জ করে ডাউনলোড করুন'
                : 'Upload multiple PDF files, reorder pages/documents in sequence, and download one combined document.'}
            </p>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2">
          {pdfFiles.length > 0 && (
            <button
              onClick={() => addMoreInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            >
              <Plus className="w-3.5 h-3.5 text-slate-600" />
              <span>{lang === 'bn' ? 'আরও পিডিএফ যুক্ত করুন' : 'Add More PDFs'}</span>
            </button>
          )}

          <input
            ref={addMoreInputRef}
            type="file"
            multiple
            accept="application/pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Main Container */}
      <div className="p-6 space-y-6">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 flex items-center gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Upload Drop Zone if no files yet */}
        {pdfFiles.length === 0 ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`py-16 px-6 border-2 border-dashed rounded-2xl text-center space-y-3 cursor-pointer transition-all ${
              isDragOver
                ? 'border-emerald-500 bg-emerald-50/50 scale-[1.005]'
                : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="application/pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <Layers className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {lang === 'bn' ? 'পিডিএফ ফাইলগুলি এখানে এনে ফেলুন বা ক্লিক করুন' : 'Drop your PDF files here, or click to upload'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {lang === 'bn'
                  ? 'একসাথে একাধিক পিডিএফ নির্বাচন করতে পারবেন। পরবর্তীতে যেকোনো সময় ক্রম পরিবর্তন করতে পারবেন।'
                  : 'Select 2 or more PDF documents. You can easily drag and reorder their positions before merging.'}
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs hover:bg-slate-800 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'bn' ? 'পিডিএফ নির্বাচন করুন' : 'Select PDF Files'}</span>
            </button>
          </div>
        ) : (
          /* File List & Reorder Section */
          <div className="space-y-4">
            {/* Summary Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 text-xs">
                <span className="font-bold text-slate-800">
                  {pdfFiles.length} {lang === 'bn' ? 'টি ফাইল অন্তর্ভুক্ত' : 'PDF Files Queued'}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-600">
                  {totalPagesSum} {lang === 'bn' ? 'মোট পাতা' : 'Total Pages'}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-600 font-mono">
                  {formatBytes(totalSizeBytes)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => addMoreInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-emerald-600" />
                  <span>Add More</span>
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
              <MoveVertical className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>
                {lang === 'bn'
                  ? 'ফাইলগুলির ক্রম পরিবর্তন করতে তীরচিহ্ন (↑ / ↓) ব্যবহার করুন। তালিকা অনুসারে ওপর থেকে নিচে মার্জ হবে।'
                  : 'Use the up (↑) and down (↓) arrow buttons to arrange documents in the exact order you want them combined.'}
              </span>
            </div>

            {/* Draggable / Reorderable Cards */}
            <div className="space-y-2.5">
              {pdfFiles.map((item, index) => {
                const isFirst = index === 0;
                const isLast = index === pdfFiles.length - 1;

                return (
                  <div
                    key={item.id}
                    className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between gap-3 group"
                  >
                    {/* Left: Position & File Details */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Numeric Order Badge */}
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-xs">
                        {index + 1}
                      </div>

                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                          <span>{formatBytes(item.size)}</span>
                          <span>·</span>
                          <span className="text-emerald-700 font-semibold font-sans">
                            {item.pageCount} {item.pageCount === 1 ? 'Page' : 'Pages'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Reorder & Remove Controls */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Move Up */}
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={isFirst}
                        title="Move Up"
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isFirst
                            ? 'opacity-30 border-slate-200 text-slate-300 cursor-not-allowed'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={isLast}
                        title="Move Down"
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isLast
                            ? 'opacity-30 border-slate-200 text-slate-300 cursor-not-allowed'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        title="Remove file"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Merge Settings & Trigger */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex-1 max-w-sm">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {lang === 'bn' ? 'আউটপুট ফাইলের নাম:' : 'Combined Output File Name:'}
                  </label>
                  <input
                    type="text"
                    value={customFileName}
                    onChange={(e) => setCustomFileName(e.target.value)}
                    placeholder="Combined_Document.pdf"
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-300 text-xs font-medium focus:outline-emerald-600 focus:border-emerald-600 bg-white"
                  />
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">
                    {lang === 'bn' ? 'সম্মিলিত ফলাফল:' : 'Combined Total:'}
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {pdfFiles.length} Documents · {totalPagesSum} Pages
                  </div>
                </div>
              </div>

              {/* Merge Button */}
              <button
                onClick={handleMergePdfs}
                disabled={pdfFiles.length < 2 || isMerging || isReadingFiles}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                {isMerging ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{lang === 'bn' ? 'পিডিএফ মার্জ করা হচ্ছে...' : 'Merging PDF Documents...'}</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4 text-amber-300" />
                    <span>
                      {lang === 'bn'
                        ? `${pdfFiles.length}টি পিডিএফ একত্রিত করুন`
                        : `Merge ${pdfFiles.length} PDFs into 1 Document`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Success Output Section */}
        {mergedUrl && (
          <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    {lang === 'bn' ? 'পিডিএফ সফলভাবে মার্জ হয়েছে!' : 'PDF Merged Successfully!'}
                  </h4>
                  <p className="text-xs text-emerald-800 font-mono mt-0.5">
                    {customFileName} · {mergedPageCount} Pages · {formatBytes(mergedSize)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={mergedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{lang === 'bn' ? 'নতুন ট্যাবে প্রিভিউ' : 'Preview'}</span>
                </a>

                <button
                  onClick={handleDownload}
                  className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'bn' ? 'ডাউনলোড করুন' : 'Download Merged PDF'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
