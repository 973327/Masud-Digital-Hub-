import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Camera, 
  Sliders, 
  FileSignature, 
  FileText, 
  CreditCard, 
  FileCode, 
  Edit3, 
  FileCheck, 
  Search, 
  ShieldCheck, 
  Globe, 
  ArrowRight,
  Info,
  RotateCcw,
  Layers,
  Scissors,
  Zap,
  Printer,
  Upload,
  Briefcase,
  LayoutDashboard
} from 'lucide-react';
import { CYBER_CAFE_TOOLS } from '../../data/cybercafeTemplates';
import { CyberCafeToolId, ToolCategory } from '../../types/cybercafe';
import { CyberCafeManagementDashboard } from './CyberCafeManagementDashboard';
import { WhatsAppExpressPrintTool } from './WhatsAppExpressPrintTool';
import { AIPhotoFixerTool } from './AIPhotoFixerTool';
import { PassportPhotoTool } from './PassportPhotoTool';
import { PhotoKBResizerTool } from './PhotoKBResizerTool';
import { SignatureResizerTool } from './SignatureResizerTool';
import { PDFMergerTool } from './PDFMergerTool';
import { PDFSplitterTool } from './PDFSplitterTool';
import { PDFTools } from './PDFTools';
import { IDCardLayoutTool } from './IDCardLayoutTool';
import { ImageConverterTool } from './ImageConverterTool';
import { TypingDocumentTool } from './TypingDocumentTool';
import { FormPhotoCheckerTool } from './FormPhotoCheckerTool';

interface CyberCafeHubProps {
  initialToolId?: CyberCafeToolId | null;
  initialModule?: 'management' | 'tools';
  onNavigateToCareerHub?: () => void;
}

export const CyberCafeHub: React.FC<CyberCafeHubProps> = ({
  initialToolId = null,
  initialModule = 'management',
  onNavigateToCareerHub
}) => {
  const [activeModule, setActiveModule] = useState<'management' | 'tools'>(
    initialToolId ? 'tools' : (initialModule || 'management')
  );
  const [activeTool, setActiveTool] = useState<CyberCafeToolId | null>(initialToolId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [pastedImageSrc, setPastedImageSrc] = useState<string | null>(null);
  const hubFileInputRef = useRef<HTMLInputElement>(null);

  // Sync activeModule if initialModule prop changes
  useEffect(() => {
    if (initialModule) {
      setActiveModule(initialModule);
      if (initialModule === 'management') {
        setActiveTool(null);
      }
    }
  }, [initialModule]);

  // Global Paste listener (Ctrl+V from WhatsApp Web)
  useEffect(() => {
    const handleHubPaste = (e: ClipboardEvent) => {
      if (activeTool) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              if (reader.result) {
                setPastedImageSrc(reader.result as string);
                setActiveTool('whatsapp_print');
              }
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handleHubPaste);
    return () => window.removeEventListener('paste', handleHubPaste);
  }, [activeTool]);

  // Filter tools by search and category
  const filteredTools = CYBER_CAFE_TOOLS.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      tool.title.toLowerCase().includes(query) ||
      tool.titleBengali.includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.descriptionBengali.includes(query);
    return matchesCategory && matchesSearch;
  });

  // Get tool icon
  const getToolIcon = (id: CyberCafeToolId) => {
    switch (id) {
      case 'whatsapp_print':
        return <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />;
      case 'photo_fixer':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'passport_maker':
        return <Camera className="w-5 h-5 text-emerald-600" />;
      case 'kb_resizer':
        return <Sliders className="w-5 h-5 text-blue-600" />;
      case 'signature_resizer':
        return <FileSignature className="w-5 h-5 text-indigo-600" />;
      case 'pdf_merger':
        return <Layers className="w-5 h-5 text-rose-600" />;
      case 'pdf_splitter':
        return <Scissors className="w-5 h-5 text-rose-600" />;
      case 'pdf_tools':
        return <FileText className="w-5 h-5 text-rose-600" />;
      case 'id_card_layout':
        return <CreditCard className="w-5 h-5 text-teal-600" />;
      case 'image_converter':
        return <FileCode className="w-5 h-5 text-amber-600" />;
      case 'typing_tools':
        return <Edit3 className="w-5 h-5 text-purple-600" />;
      case 'form_checker':
        return <FileCheck className="w-5 h-5 text-emerald-600" />;
    }
  };

  // If a tool is active, render the dedicated tool view
  if (activeTool) {
    switch (activeTool) {
      case 'whatsapp_print':
        return (
          <WhatsAppExpressPrintTool
            onNavigateBack={() => {
              setActiveTool(null);
              setPastedImageSrc(null);
            }}
            lang={lang}
            initialImageSrc={pastedImageSrc}
          />
        );
      case 'photo_fixer':
        return <AIPhotoFixerTool onNavigateBack={() => setActiveTool(null)} lang={lang} />;
      case 'passport_maker':
        return (
          <PassportPhotoTool
            onNavigateBack={() => {
              setActiveTool(null);
              setPastedImageSrc(null);
            }}
            lang={lang}
            initialImageSrc={pastedImageSrc}
          />
        );
      case 'kb_resizer':
        return <PhotoKBResizerTool onNavigateBack={() => setActiveTool(null)} lang={lang} />;
      case 'signature_resizer':
        return <SignatureResizerTool onNavigateBack={() => setActiveTool(null)} lang={lang} />;
      case 'pdf_merger':
        return <PDFMergerTool onNavigateBack={() => setActiveTool(null)} lang={lang} />;
      case 'pdf_splitter':
        return <PDFSplitterTool onNavigateBack={() => setActiveTool(null)} lang={lang} />;
      case 'pdf_tools':
        return <PDFTools onNavigateBack={() => setActiveTool(null)} lang={lang} />;
      case 'id_card_layout':
        return <IDCardLayoutTool onNavigateBack={() => setActiveTool(null)} lang={lang} />;
      case 'image_converter':
        return <ImageConverterTool onNavigateBack={() => setActiveTool(null)} lang={lang} />;
      case 'typing_tools':
        return <TypingDocumentTool onNavigateBack={() => setActiveTool(null)} lang={lang} />;
      case 'form_checker':
        return (
          <FormPhotoCheckerTool
            onNavigateBack={() => setActiveTool(null)}
            onLaunchTool={(toolId) => setActiveTool(toolId)}
            lang={lang}
          />
        );
    }
  }

  // Main Dashboard Hub View
  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* CYBER CAFE TOP MODULE NAVIGATION BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl w-full sm:w-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveModule('management')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeModule === 'management'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Module 1: Shop Management & Records (দোকান ড্যাশবোর্ড)</span>
          </button>

          <button
            onClick={() => setActiveModule('tools')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeModule === 'tools'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Cyber Cafe Tools Suite (ফটো ও ডকুমেন্ট টুলস)</span>
          </button>
        </div>

        {/* Language switch */}
        <div className="flex items-center gap-1.5 px-2 self-end sm:self-auto shrink-0">
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              lang === 'en' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLang('bn')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              lang === 'bn' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            বাংলা
          </button>
        </div>
      </div>

      {/* Render Module 1: Cyber Cafe Management Dashboard OR Tools Suite */}
      {activeModule === 'management' ? (
        <CyberCafeManagementDashboard
          onLaunchTool={(toolId) => {
            setActiveModule('tools');
            setActiveTool(toolId);
          }}
          lang={lang}
        />
      ) : (
        <>
          {/* Hero Welcome Banner for Cyber Cafe Operators */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Masud Digital Hub • সাইবার ক্যাফে ও সিএসসি কেন্দ্র
            </span>
            <span className="text-white/40">·</span>
            <span className="text-xs text-slate-300">CSC & Digital Service Center</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {lang === 'bn' ? 'মাসুদ ডিজিটাল হাব - সাইবার ক্যাফে টুলস' : 'Masud Digital Hub - Cyber Cafe Tools'}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            {lang === 'bn'
              ? 'মাসুদ ডিজিটাল হাবের অল-ইন-ওয়ান সমাধান: পাসপোর্ট ছবি তৈরি, ঝাপসা ছবি ঠিক করা, কেবি রিসাইজার, স্বাক্ষর ক্লিনার, পিডিএফ মার্জ ও দরখাস্ত ড্রাফটিং।'
              : 'All-in-one preparation suite for Masud Digital Hub and digital service shops. Prepare customer photos, resize signatures, convert PDFs, and draft official letters in seconds.'}
          </p>

          {/* Quick stats and privacy assurance */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% In-Browser Local Processing (No server storage)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>9 Real Working Tools</span>
            </div>
          </div>
        </div>

        {/* Top Right Language Switcher inside Hero */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <div className="flex items-center bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/15">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                lang === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('bn')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                lang === 'bn' ? 'bg-emerald-600 text-white shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              বাংলা (Bengali)
            </button>
          </div>
        </div>
      </div>

      {/* ⚡ Superfast Express Action: 1-Click WhatsApp Photo to Direct Print */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-4 sm:p-5 text-white shadow-lg border border-emerald-400/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
            <Zap className="w-6 h-6 text-amber-300 fill-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                {lang === 'bn' ? 'হোয়াটসঅ্যাপ ফটো ডিরেক্ট প্রিন্ট (১-ক্লিক)' : '1-Click WhatsApp Photo to Direct Print'}
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                ⚡ सुपरफास्ट प्रिंट
              </span>
            </div>
            <p className="text-xs text-emerald-100 mt-1 leading-relaxed max-w-xl">
              {lang === 'bn'
                ? 'কাস্টমারের পাঠানো হোয়াটসঅ্যাপ ছবি ড্রপ বা পেস্ট (Ctrl+V) করুন — সাথে সাথে সোজা হবে, ৩.৫x৪.৫ সেমি পাসপোর্ট সাইজে কাটবে ও ডিরেক্ট প্রিন্ট রেডি হবে!'
                : 'Customer sends a photo on WhatsApp? Upload or Paste (Ctrl+V) it here: instantly auto-straightens, crops to 3.5cm x 4.5cm passport size, and readies for Direct Print!'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
          <input
            ref={hubFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  if (reader.result) {
                    setPastedImageSrc(reader.result as string);
                    setActiveTool('whatsapp_print');
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
          />

          <button
            onClick={() => hubFileInputRef.current?.click()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer transform active:scale-98"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Upload WhatsApp Photo</span>
          </button>

          <button
            onClick={() => {
              setPastedImageSrc(null);
              setActiveTool('whatsapp_print');
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/60 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
            title="Open Express Studio directly or test with demo customer photo"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Open Direct Print Studio</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Category Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'টুল খুঁজুন (যেমন: পাসপোর্ট, সাইজ, পিডিএফ, স্বাক্ষর)...' : 'Search tools (e.g. passport, kb resizer, pdf, signature)...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-emerald-600 focus:border-emerald-600 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Pills (Functional Buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: lang === 'bn' ? 'সব টুলস' : 'All Tools' },
            { id: 'photo', label: lang === 'bn' ? 'ফটো ও পাসপোর্ট' : 'Photos' },
            { id: 'resizer', label: lang === 'bn' ? 'রিসাইজার' : 'Resizers' },
            { id: 'pdf', label: 'PDF' },
            { id: 'document', label: lang === 'bn' ? 'ডকুমেন্ট' : 'Documents' },
            { id: 'utility', label: lang === 'bn' ? 'চেকার' : 'Checkers' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as ToolCategory)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Cyber Cafe Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
                  {getToolIcon(tool.id)}
                </div>

                {tool.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                    {tool.badge}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {lang === 'bn' ? tool.titleBengali : tool.title}
                </h3>
                {lang !== 'bn' && (
                  <span className="text-[11px] font-semibold text-slate-400 block -mt-0.5">
                    {tool.titleBengali}
                  </span>
                )}
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {lang === 'bn' ? tool.descriptionBengali : tool.description}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">
              <span>{lang === 'bn' ? 'টুল চালু করুন' : 'Open Tool'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Privacy and Operator Assurance Card */}
      <div className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            <strong>Data Security & Privacy:</strong> All image enhancements, cropping, and PDF merging run 100% locally inside your web browser. Customer documents are never uploaded to our servers.
          </span>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
