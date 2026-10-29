import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Scissors, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  Layers, 
  Check, 
  Sparkles,
  FileCheck,
  Grid,
  Info
} from 'lucide-react';
import { 
  splitPDF, 
  getPdfPageCount, 
  parsePageRangeString, 
  formatPageNumbersToRangeString 
} from '../../services/pdfService';
import { formatBytes } from '../../services/imageProcessing';

interface PDFSplitterToolProps {
  onNavigateBack: () => void;
  lang?: 'en' | 'bn';
}

export const PDFSplitterTool: React.FC<PDFSplitterToolProps> = ({
  onNavigateBack,
  lang = 'en'
}) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [rangeInput, setRangeInput] = useState<string>('1-3, 5');
  const [isReadingPdf, setIsReadingPdf] = useState<boolean>(false);
  const [isSplitting, setIsSplitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Result
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number>(0);
  const [outputPageCount, setOutputPageCount] = useState<number>(0);
  const [customFileName, setCustomFileName] = useState<string>('Extracted_Pages.pdf');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse current range input into 0-indexed page indices
  const parsedPageIndices = useMemo(() => {
    if (!totalPages || !rangeInput.trim()) return [];
    try {
      return parsePageRangeString(rangeInput, totalPages);
    } catch {
      return [];
    }
  }, [rangeInput, totalPages]);

  // 1-indexed list of selected page numbers for the UI
  const selectedPagesList = useMemo(() => {
    return parsedPageIndices.map((i) => i + 1);
  }, [parsedPageIndices]);

  // Load and analyze uploaded PDF
  const handleLoadPdf = async (file: File) => {
    setErrorMessage(null);
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage(
        lang === 'bn'
          ? 'অনুগ্রহ করে শুধুমাত্র ভ্যালিড পিডিএফ (.pdf) ফাইল নির্বাচন করুন।'
          : 'Please select a valid PDF (.pdf) file.'
      );
      return;
    }

    setIsReadingPdf(true);
    resetOutput();

    try {
      const pages = await getPdfPageCount(file);
      setPdfFile(file);
      setTotalPages(pages);

      // Default initial range: if document has 5 or more pages, default to "1-3, 5" as requested!
      // Otherwise if fewer pages, default to "1" or "1-2"
      const defaultRange = pages >= 5 ? '1-3, 5' : pages > 1 ? `1-${pages}` : '1';
      setRangeInput(defaultRange);

      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setCustomFileName(`${baseName}_extracted.pdf`);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to read PDF document pages.');
    } finally {
      setIsReadingPdf(false);
    }
  };

  const resetOutput = () => {
    if (outputUrl) {
      URL.revokeObjectURL(outputUrl);
      setOutputUrl(null);
      setOutputBlob(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLoadPdf(file);
    }
    e.target.value = '';
  };

  // Drag and Drop
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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleLoadPdf(file);
    }
  };

  // Toggle individual page selection
  const handleTogglePage = (pageNum: number) => {
    resetOutput();
    const currentSelected = new Set(selectedPagesList);
    if (currentSelected.has(pageNum)) {
      currentSelected.delete(pageNum);
    } else {
      currentSelected.add(pageNum);
    }
    const newRange = formatPageNumbersToRangeString(Array.from(currentSelected));
    setRangeInput(newRange);
  };

  // Quick Preset Handlers
  const handleSelectAll = () => {
    if (!totalPages) return;
    resetOutput();
    setRangeInput(`1-${totalPages}`);
  };

  const handleSelectFirstPage = () => {
    resetOutput();
    setRangeInput('1');
  };

  const handleSelectFirstThree = () => {
    if (!totalPages) return;
    resetOutput();
    const max = Math.min(3, totalPages);
    setRangeInput(max === 1 ? '1' : `1-${max}`);
  };

  const handleSelectSampleExample = () => {
    if (!totalPages) return;
    resetOutput();
    if (totalPages >= 5) {
      setRangeInput('1-3, 5');
    } else if (totalPages >= 3) {
      setRangeInput('1-2, 3');
    } else {
      setRangeInput('1');
    }
  };

  const handleSelectOddPages = () => {
    if (!totalPages) return;
    resetOutput();
    const odds: number[] = [];
    for (let p = 1; p <= totalPages; p += 2) {
      odds.push(p);
    }
    setRangeInput(formatPageNumbersToRangeString(odds));
  };

  const handleSelectEvenPages = () => {
    if (!totalPages) return;
    resetOutput();
    const evens: number[] = [];
    for (let p = 2; p <= totalPages; p += 2) {
      evens.push(p);
    }
    setRangeInput(formatPageNumbersToRangeString(evens));
  };

  const handleClearSelection = () => {
    resetOutput();
    setRangeInput('');
  };

  // Execute PDF Split / Page Extraction
  const handleExecuteSplit = async () => {
    if (!pdfFile) return;

    if (selectedPagesList.length === 0) {
      setErrorMessage(
        lang === 'bn'
          ? 'অনুগ্রহ করে কমপক্ষে একটি বৈধ পাতা নির্বাচন করুন (যেমন: 1-3, 5)।'
          : 'Please specify at least one valid page to extract (e.g., 1-3, 5).'
      );
      return;
    }

    setIsSplitting(true);
    setErrorMessage(null);

    try {
      const extractedBlob = await splitPDF(pdfFile, rangeInput);
      const url = URL.createObjectURL(extractedBlob);

      setOutputBlob(extractedBlob);
      setOutputUrl(url);
      setOutputSize(extractedBlob.size);
      setOutputPageCount(selectedPagesList.length);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message ||
          (lang === 'bn'
            ? 'পিডিএফ পাতা আলাদা করার সময় ত্রুটি হয়েছে। অনুগ্রহ করে পেজ রেঞ্জ যাচাই করুন।'
            : 'Error extracting pages from PDF. Please verify your page range.')
      );
    } finally {
      setIsSplitting(false);
    }
  };

  // Download Output PDF
  const handleDownload = () => {
    if (!outputUrl) return;
    let fileName = customFileName.trim();
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      fileName += '.pdf';
    }
    const link = document.createElement('a');
    link.href = outputUrl;
    link.download = fileName || 'Extracted_Pages.pdf';
    link.click();
  };

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
                {lang === 'bn' ? 'পিডিএফ পাতা আলাদা করুন (PDF Splitter)' : 'PDF Splitter'}
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {lang === 'bn' ? 'পেজ রেঞ্জ এক্সট্র্যাক্ট' : 'Custom Page Range'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? 'পেজ রেঞ্জ (যেমন: ১-৩, ৫) ইনপুট দিয়ে নির্দিষ্ট অংশ আলাদা করে নতুন পিডিএফ ফাইল হিসেবে তৈরি করুন'
                : 'Input a page range (e.g. 1-3, 5) or click individual pages to extract specific sections into a new PDF.'}
            </p>
          </div>
        </div>

        {pdfFile && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>{lang === 'bn' ? 'অন্য পিডিএফ আপলোড' : 'Change PDF'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 flex items-center gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Upload Drop Zone if no PDF loaded */}
        {!pdfFile ? (
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
              accept="application/pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <Scissors className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {lang === 'bn' ? 'পিডিএফ ফাইলটি এখানে টেনে আনুন বা ক্লিক করুন' : 'Drop your PDF here, or click to upload'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {lang === 'bn'
                  ? 'আপনার যেকোনো সাইজের পিডিএফ আপলোড করে নির্দিষ্ট পাতা (যেমন: ১-৩, ৫) সহজে আলাদা করুন।'
                  : 'Upload any document to extract individual pages, page ranges, or sections in seconds.'}
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs hover:bg-slate-800 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'bn' ? 'পিডিএফ ফাইল সিলেক্ট করুন' : 'Select PDF File'}</span>
            </button>
          </div>
        ) : (
          /* Split Workspace */
          <div className="space-y-6">
            {/* File Info Bar */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{pdfFile.name}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                    <span>{formatBytes(pdfFile.size)}</span>
                    <span>·</span>
                    <span className="text-emerald-700 font-bold font-sans">
                      {totalPages} {totalPages === 1 ? 'Page' : 'Pages'} Total
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setPdfFile(null);
                  setTotalPages(0);
                  resetOutput();
                }}
                className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'ফাইল মুছুন' : 'Remove File'}
              </button>
            </div>

            {/* Range Input Section */}
            <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-xs space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                  {lang === 'bn' ? 'পেজ রেঞ্জ ইনপুট (Page Range Input):' : 'Enter Page Range to Extract:'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => {
                      resetOutput();
                      setRangeInput(e.target.value);
                    }}
                    placeholder="e.g. 1-3, 5"
                    className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 font-mono text-sm text-slate-900 focus:outline-emerald-600 focus:border-emerald-600 bg-slate-50/40"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span>
                    {lang === 'bn'
                      ? 'উদাহরণ: "1-3, 5" দিলে ১ম, ২য়, ৩য় ও ৫ম পাতা আলাদা হবে। কমা দিয়ে একাধিক অংশ যুক্ত করতে পারবেন।'
                      : 'Format: Use hyphens for ranges (e.g. 1-3) and commas for individual pages (e.g. 1-3, 5).'}
                  </span>
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-slate-600 block">
                  {lang === 'bn' ? 'দ্রুত নির্বাচন বাটন:' : 'Quick Presets:'}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={handleSelectSampleExample}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                  >
                    1-3, 5 Preset
                  </button>
                  <button
                    onClick={handleSelectFirstPage}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    Page 1 Only
                  </button>
                  <button
                    onClick={handleSelectFirstThree}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    First 3 Pages
                  </button>
                  <button
                    onClick={handleSelectOddPages}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    Odd Pages
                  </button>
                  <button
                    onClick={handleSelectEvenPages}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    Even Pages
                  </button>
                  <button
                    onClick={handleSelectAll}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    All Pages (1-{totalPages})
                  </button>
                  <button
                    onClick={handleClearSelection}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer ml-auto"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Interactive Page Selection Grid */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {lang === 'bn' ? 'ইন্টারেক্টিভ পেজ ম্যাট্রিক্স (ক্লিক করে নির্বাচন করুন):' : 'Click to Toggle Pages:'}
                  </span>
                  <span className="text-xs text-emerald-700 font-bold font-mono">
                    {selectedPagesList.length} of {totalPages} Pages Selected
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-1.5 max-h-48 overflow-y-auto p-1 bg-slate-50/60 rounded-xl border border-slate-200">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isSelected = selectedPagesList.includes(pageNum);

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handleTogglePage(pageNum)}
                        className={`p-2 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs font-bold ring-2 ring-emerald-600/30'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium'
                        }`}
                      >
                        <span className="text-[10px] opacity-70">P.</span>
                        <span className="text-xs font-mono">{pageNum}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Summary */}
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between text-xs text-emerald-950">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    {selectedPagesList.length > 0 ? (
                      <>
                        <strong>{selectedPagesList.length} pages will be extracted:</strong>{' '}
                        <span className="font-mono text-emerald-800">
                          {selectedPagesList.join(', ')}
                        </span>
                      </>
                    ) : (
                      <span className="text-amber-800">No pages selected yet. Enter a range or click pages above.</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Output File Name Setting */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === 'bn' ? 'আউটপুট ফাইলের নাম:' : 'Custom Output File Name:'}
                </label>
                <input
                  type="text"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  placeholder="Extracted_Pages.pdf"
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-300 text-xs font-medium focus:outline-emerald-600 bg-white"
                />
              </div>

              {/* Extract Trigger Button */}
              <button
                onClick={handleExecuteSplit}
                disabled={isSplitting || selectedPagesList.length === 0}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                {isSplitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{lang === 'bn' ? 'পাতা আলাদা করা হচ্ছে...' : 'Extracting Pages...'}</span>
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4 text-amber-300" />
                    <span>
                      {lang === 'bn'
                        ? `${selectedPagesList.length}টি পাতা আলাদা করে নতুন পিডিএফ বানান`
                        : `Extract ${selectedPagesList.length} Selected Pages as New PDF`}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Merged / Extracted Output Success Banner */}
            {outputUrl && (
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">
                        {lang === 'bn' ? 'নতুন পিডিএফ সফলভাবে তৈরি হয়েছে!' : 'New PDF Extracted Successfully!'}
                      </h4>
                      <p className="text-xs text-emerald-800 font-mono mt-0.5">
                        {customFileName} · {outputPageCount} Pages ({rangeInput}) · {formatBytes(outputSize)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={outputUrl}
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
                      <span>{lang === 'bn' ? 'ডাউনলোড করুন' : 'Download Extracted PDF'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
