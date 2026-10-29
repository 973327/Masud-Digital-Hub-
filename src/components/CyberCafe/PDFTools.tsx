import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Layers, 
  Scissors, 
  Minimize2, 
  Image as ImageIcon, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  ArrowUpDown
} from 'lucide-react';
import { mergePDFs, splitPDF, imagesToPDF, compressPDF } from '../../services/pdfService';
import { formatBytes } from '../../services/imageProcessing';

interface PDFToolsProps {
  onNavigateBack: () => void;
  lang?: 'en' | 'bn';
}

type PdfSubTool = 'merge' | 'split' | 'images_to_pdf' | 'compress';

export const PDFTools: React.FC<PDFToolsProps> = ({
  onNavigateBack,
  lang = 'en'
}) => {
  const [activeSubTool, setActiveSubTool] = useState<PdfSubTool>('images_to_pdf');

  // Images to PDF State
  const [imageFiles, setImageFiles] = useState<{ id: string; name: string; dataUrl: string; size: number }[]>([]);
  const [pageSize, setPageSize] = useState<'A4' | 'Letter'>('A4');

  // Merge State
  const [mergeFiles, setMergeFiles] = useState<{ id: string; name: string; blob: Blob; size: number }[]>([]);

  // Split State
  const [splitFile, setSplitFile] = useState<{ name: string; blob: Blob; size: number } | null>(null);
  const [pageRange, setPageRange] = useState<string>('1');

  // Compress State
  const [compressFile, setCompressFile] = useState<{ name: string; blob: Blob; size: number } | null>(null);

  // Results
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Convert Images to PDF
  const handleConvertImagesToPdf = async () => {
    if (imageFiles.length === 0) return;
    setIsProcessing(true);
    setStatusMessage('Generating PDF from image scans...');
    try {
      const pdfBlob = await imagesToPDF(imageFiles, pageSize);
      const url = URL.createObjectURL(pdfBlob);
      setOutputBlob(pdfBlob);
      setOutputUrl(url);
      setOutputSize(pdfBlob.size);
      setStatusMessage('PDF generated successfully!');
    } catch (err) {
      console.error(err);
      setStatusMessage('Error creating PDF. Please check your image files.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Merge PDFs
  const handleExecuteMerge = async () => {
    if (mergeFiles.length < 2) {
      alert('Please upload at least 2 PDF files to merge.');
      return;
    }
    setIsProcessing(true);
    setStatusMessage('Merging PDF files...');
    try {
      const mergedBlob = await mergePDFs(mergeFiles.map((m) => m.blob));
      const url = URL.createObjectURL(mergedBlob);
      setOutputBlob(mergedBlob);
      setOutputUrl(url);
      setOutputSize(mergedBlob.size);
      setStatusMessage('PDFs merged successfully!');
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to merge PDFs. Ensure files are valid unencrypted PDFs.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Split PDF
  const handleExecuteSplit = async () => {
    if (!splitFile) return;
    setIsProcessing(true);
    setStatusMessage('Extracting pages...');
    try {
      const splitBlob = await splitPDF(splitFile.blob, pageRange);
      const url = URL.createObjectURL(splitBlob);
      setOutputBlob(splitBlob);
      setOutputUrl(url);
      setOutputSize(splitBlob.size);
      setStatusMessage(`Extracted pages (${pageRange}) successfully!`);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(err.message || 'Error splitting PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. Compress PDF
  const handleExecuteCompress = async () => {
    if (!compressFile) return;
    setIsProcessing(true);
    setStatusMessage('Optimizing PDF streams and objects...');
    try {
      const compBlob = await compressPDF(compressFile.blob);
      const url = URL.createObjectURL(compBlob);
      setOutputBlob(compBlob);
      setOutputUrl(url);
      setOutputSize(compBlob.size);
      setStatusMessage('PDF compressed successfully!');
    } catch (err) {
      console.error(err);
      setStatusMessage('Error compressing PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Multi-image upload for Images to PDF
  const handleImageFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImageFiles((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            name: file.name,
            dataUrl: reader.result as string,
            size: file.size
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle PDF upload for Merge
  const handleMergePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfs = files.filter((f) => f.type === 'application/pdf');
    pdfs.forEach((file) => {
      setMergeFiles((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          name: file.name,
          blob: file,
          size: file.size
        }
      ]);
    });
  };

  // Download Output PDF
  const handleDownload = () => {
    if (!outputUrl) return;
    const link = document.createElement('a');
    link.href = outputUrl;
    link.download = `CyberCafe_${activeSubTool}_${Date.now()}.pdf`;
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
                {lang === 'bn' ? 'পিডিএফ টুলস (PDF Tools)' : 'All-in-One PDF Tools'}
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                100% In-Browser · Privacy Safe
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? 'ছবি থেকে পিডিএফ, একাধিক পিডিএফ একত্রীকরণ, পাতা আলাদা ও কম্প্রেস করুন'
                : 'Merge, split, compress, or convert document scans into ready-to-upload PDF files.'}
            </p>
          </div>
        </div>

        {/* Sub-tool Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => {
              setActiveSubTool('images_to_pdf');
              setOutputUrl(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTool === 'images_to_pdf' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'bn' ? 'ছবি থেকে পিডিএফ' : 'Images to PDF'}
          </button>
          <button
            onClick={() => {
              setActiveSubTool('merge');
              setOutputUrl(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTool === 'merge' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'bn' ? 'মার্জ (Merge)' : 'Merge PDFs'}
          </button>
          <button
            onClick={() => {
              setActiveSubTool('split');
              setOutputUrl(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTool === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'bn' ? 'স্প্লিট (Split)' : 'Split Pages'}
          </button>
          <button
            onClick={() => {
              setActiveSubTool('compress');
              setOutputUrl(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTool === 'compress' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'bn' ? 'কম্প্রেস (Compress)' : 'Compress PDF'}
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="p-6">
        {/* 1. Images to PDF Tool */}
        {activeSubTool === 'images_to_pdf' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
              <div>
                <h3 className="text-sm font-bold text-emerald-950">
                  {lang === 'bn' ? 'স্ক্যান করা ছবি থেকে পিডিএফ' : 'Convert Document Scans into a Single PDF'}
                </h3>
                <p className="text-xs text-emerald-800">
                  Ideal for Aadhaar card, PAN card, educational marksheet, and certificate scans.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as 'A4' | 'Letter')}
                  className="py-1.5 px-3 rounded-lg border border-emerald-300 text-xs font-semibold bg-white text-slate-800"
                >
                  <option value="A4">A4 Standard Size</option>
                  <option value="Letter">Letter Size</option>
                </select>

                <label className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Add Scanned Images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageFilesUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Uploaded Images List */}
            {imageFiles.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{imageFiles.length} Scans Added (Click Delete to remove)</span>
                  <button
                    onClick={() => setImageFiles([])}
                    className="text-red-600 hover:underline font-semibold"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {imageFiles.map((img, index) => (
                    <div
                      key={img.id}
                      className="relative p-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center group"
                    >
                      <div className="w-full h-28 bg-white rounded border border-slate-200 overflow-hidden mb-2">
                        <img src={img.dataUrl} alt={img.name} className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 truncate w-full text-center">
                        {index + 1}. {img.name}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{formatBytes(img.size)}</span>

                      <button
                        onClick={() => setImageFiles((prev) => prev.filter((item) => item.id !== img.id))}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete page"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleConvertImagesToPdf}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>{isProcessing ? 'Generating PDF...' : `Generate ${pageSize} PDF (${imageFiles.length} Pages)`}</span>
                </button>
              </div>
            ) : (
              <div className="py-12 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2">
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs font-semibold text-slate-600">No scanned images added yet</div>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Click 'Add Scanned Images' above to upload multiple JPG or PNG images and combine them into a single PDF document.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 2. Merge PDFs Tool */}
        {activeSubTool === 'merge' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === 'bn' ? 'একাধিক পিডিএফ ফাইল একত্রীকরণ' : 'Merge Multiple PDF Files'}
                </h3>
                <p className="text-xs text-slate-500">
                  Combine 2 or more separate PDF documents into a single sequential PDF file.
                </p>
              </div>

              <label className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload PDF Files</span>
                <input
                  type="file"
                  multiple
                  accept="application/pdf"
                  onChange={handleMergePdfUpload}
                  className="hidden"
                />
              </label>
            </div>

            {mergeFiles.length > 0 ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  {mergeFiles.map((pdf, idx) => (
                    <div
                      key={pdf.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold font-mono">
                          {idx + 1}
                        </span>
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-slate-800">{pdf.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">({formatBytes(pdf.size)})</span>
                      </div>
                      <button
                        onClick={() => setMergeFiles((prev) => prev.filter((p) => p.id !== pdf.id))}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleExecuteMerge}
                  disabled={mergeFiles.length < 2 || isProcessing}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>{isProcessing ? 'Merging PDFs...' : `Merge ${mergeFiles.length} PDFs into 1 File`}</span>
                </button>
              </div>
            ) : (
              <div className="py-12 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs font-semibold text-slate-600">Upload 2 or more PDF files to merge</div>
              </div>
            )}
          </div>
        )}

        {/* 3. Split PDF Tool */}
        {activeSubTool === 'split' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === 'bn' ? 'পিডিএফ পাতা আলাদা করা' : 'Split / Extract Pages from PDF'}
                </h3>
                <p className="text-xs text-slate-500">
                  Extract specific page numbers or ranges (e.g. "1", "1-3", "2, 4-6").
                </p>
              </div>

              <label className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Select PDF</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSplitFile({ name: file.name, blob: file, size: file.size });
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {splitFile ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">{splitFile.name}</span>
                    <span className="text-xs text-slate-400 font-mono">({formatBytes(splitFile.size)})</span>
                  </div>
                  <button onClick={() => setSplitFile(null)} className="text-xs text-red-600 hover:underline">
                    Remove
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Page Numbers to Extract (comma separated or range)
                  </label>
                  <input
                    type="text"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                    placeholder="e.g. 1, 3-5, 8"
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Examples: "1" for first page only; "1-2" for first two pages; "1, 3, 5" for odd pages.
                  </p>
                </div>

                <button
                  onClick={handleExecuteSplit}
                  disabled={isProcessing || !pageRange.trim()}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Scissors className="w-4 h-4" />
                  <span>{isProcessing ? 'Extracting...' : 'Extract & Download Specified Pages'}</span>
                </button>
              </div>
            ) : (
              <div className="py-12 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2">
                <Scissors className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs font-semibold text-slate-600">Upload a PDF to split pages</div>
              </div>
            )}
          </div>
        )}

        {/* 4. Compress PDF Tool */}
        {activeSubTool === 'compress' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === 'bn' ? 'পিডিএফ সাইজ কমান (Compress)' : 'Compress PDF File'}
                </h3>
                <p className="text-xs text-slate-500">
                  Clean internal PDF object streams and structure to reduce file size for online portal limits.
                </p>
              </div>

              <label className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload PDF to Compress</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setCompressFile({ name: file.name, blob: file, size: file.size });
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {compressFile ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">{compressFile.name}</span>
                    <span className="text-xs text-slate-400 font-mono">({formatBytes(compressFile.size)})</span>
                  </div>
                  <button onClick={() => setCompressFile(null)} className="text-xs text-red-600 hover:underline">
                    Remove
                  </button>
                </div>

                <button
                  onClick={handleExecuteCompress}
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>{isProcessing ? 'Compressing...' : 'Compress PDF File'}</span>
                </button>
              </div>
            ) : (
              <div className="py-12 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2">
                <Minimize2 className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs font-semibold text-slate-600">Upload a PDF to compress</div>
              </div>
            )}
          </div>
        )}

        {/* Global Output & Download Banner */}
        {outputUrl && (
          <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-xs font-bold text-emerald-950">
                  {statusMessage || 'PDF is Ready!'}
                </div>
                <div className="text-[11px] text-emerald-800 font-mono">
                  Final Size: {formatBytes(outputSize)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={outputUrl}
                target="_blank"
                rel="noreferrer"
                className="py-1.5 px-3 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition-colors"
              >
                Preview in New Tab
              </a>
              <button
                onClick={handleDownload}
                className="py-1.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
