import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  BookOpen, 
  Keyboard, 
  RefreshCw,
  Edit3
} from 'lucide-react';
import { DOCUMENT_TEMPLATES } from '../../data/cybercafeTemplates';
import { DocumentTemplate } from '../../types/cybercafe';

interface TypingDocumentToolProps {
  onNavigateBack: () => void;
  lang?: 'en' | 'bn';
}

const BENGALI_COMMON_CHARS = [
  'অ', 'আ', 'ই', 'ঈ', 'উ', 'ঊ', 'ঋ', 'এ', 'ঐ', 'ও', 'ঔ',
  'ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ',
  'ট', 'ঠ', 'ড', 'ঢ', 'ণ', 'ত', 'থ', 'দ', 'ধ', 'ন',
  'প', 'ফ', 'ব', 'ভ', 'ম', 'য', 'র', 'ল', 'শ', 'ষ', 'স', 'হ',
  'া', 'ি', 'ী', 'ু', 'ূ', 'ৃ', 'ে', 'ৈ', 'ো', 'ৌ', '্', 'ৎ', 'ং', 'ঃ', 'ঁ', '।'
];

export const TypingDocumentTool: React.FC<TypingDocumentToolProps> = ({
  onNavigateBack,
  lang = 'en'
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(DOCUMENT_TEMPLATES[0]);
  const [editorLanguage, setEditorLanguage] = useState<'bengali' | 'english'>('bengali');
  const [documentContent, setDocumentContent] = useState<string>(DOCUMENT_TEMPLATES[0].bengaliContent);
  const [copied, setCopied] = useState<boolean>(false);
  const [showBengaliKeyboard, setShowBengaliKeyboard] = useState<boolean>(false);

  // Switch template
  const handleSelectTemplate = (tmpl: DocumentTemplate) => {
    setSelectedTemplate(tmpl);
    setDocumentContent(editorLanguage === 'bengali' ? tmpl.bengaliContent : tmpl.englishContent);
  };

  // Switch language for template
  const handleSwitchLanguage = (l: 'bengali' | 'english') => {
    setEditorLanguage(l);
    setDocumentContent(l === 'bengali' ? selectedTemplate.bengaliContent : selectedTemplate.englishContent);
  };

  // Insert Bengali Character at cursor or end
  const handleInsertChar = (char: string) => {
    setDocumentContent((prev) => prev + char);
  };

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(documentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Print Formatted Document
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedTemplate.title}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { 
              font-family: 'Plus Jakarta Sans', 'Hind Siliguri', serif, sans-serif; 
              color: #1e293b; 
              line-height: 1.8; 
              font-size: 14pt; 
              white-space: pre-wrap; 
              padding: 20px;
            }
          </style>
        </head>
        <body>${documentContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Download Text File
  const handleDownloadText = () => {
    const blob = new Blob([documentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTemplate.id}_application.txt`;
    link.click();
    URL.revokeObjectURL(url);
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
                {lang === 'bn' ? 'টাইপিং ও দরখাস্ত ড্রাফটার' : 'Typing & Document Letters'}
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                English & বাংলা (Bengali)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? 'থানা জিডি, ব্যাঙ্ক, সাধারণ চাকরির আবেদন ও ছুটির দরখাস্ত প্রস্তুত করুন এবং সরাসরি প্রিন্ট নিন'
                : 'Prepare ready-to-print official letters for Police GD, Bank requests, jobs, and school leave.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBengaliKeyboard(!showBengaliKeyboard)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showBengaliKeyboard
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'বাংলা কীবোর্ড সাহায্য' : 'Bengali Characters'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Print Formatted Draft</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left: Template Selector */}
        <div className="lg:col-span-4 p-5 bg-slate-50 border-r border-slate-200 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
              {lang === 'bn' ? 'দরখাস্তের ক্যাটাগরি' : 'Cyber Cafe Templates'}
            </label>
            <div className="space-y-2">
              {DOCUMENT_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className={`w-full p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    selectedTemplate.id === tmpl.id
                      ? 'border-emerald-600 bg-white shadow-sm ring-1 ring-emerald-600/30'
                      : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 leading-snug">
                    {lang === 'bn' ? tmpl.titleBengali : tmpl.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {tmpl.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Helper Tips */}
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cyber Cafe Operator Tip:</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Replace placeholders in brackets like [Full Name] or [Date] with the customer's real details, then click 'Print Formatted Draft' for immediate A4 printing.
            </p>
          </div>
        </div>

        {/* Right: Rich Text Editor & Live Preview */}
        <div className="lg:col-span-8 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Editor Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800">Drafting Language:</span>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                  <button
                    onClick={() => handleSwitchLanguage('bengali')}
                    className={`py-1 px-3 rounded text-xs font-bold transition-all ${
                      editorLanguage === 'bengali' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    বাংলা (Bengali)
                  </button>
                  <button
                    onClick={() => handleSwitchLanguage('english')}
                    className={`py-1 px-3 rounded text-xs font-bold transition-all ${
                      editorLanguage === 'english' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setDocumentContent(
                      editorLanguage === 'bengali' ? selectedTemplate.bengaliContent : selectedTemplate.englishContent
                    )
                  }
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  title="Reset template"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Content</span>
                </button>
              </div>
            </div>

            {/* Virtual Bengali Character Insertion Bar */}
            {showBengaliKeyboard && (
              <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 block">
                  Click any character to insert into text:
                </span>
                <div className="flex flex-wrap gap-1">
                  {BENGALI_COMMON_CHARS.map((char) => (
                    <button
                      key={char}
                      onClick={() => handleInsertChar(char)}
                      className="w-7 h-7 bg-white hover:bg-emerald-100 text-slate-900 border border-slate-200 rounded text-xs font-bold font-serif flex items-center justify-center transition-colors cursor-pointer"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Textarea Editor */}
            <div className="relative">
              <textarea
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                rows={16}
                className="w-full p-4 rounded-xl border border-slate-300 font-sans text-xs sm:text-sm text-slate-900 leading-relaxed focus:outline-emerald-600 focus:border-emerald-600 shadow-inner bg-slate-50/30"
                placeholder="Type or edit your letter here..."
              />
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-400 font-mono">
              {documentContent.length} characters · {documentContent.split(/\s+/).filter(Boolean).length} words
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadText}
                className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Download (.txt)
              </button>
              <button
                onClick={handlePrint}
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                <span>Print Official Letter</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
