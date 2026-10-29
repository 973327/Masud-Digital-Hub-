import React from 'react';
import { Camera, Sparkles, Printer, Download, Scissors, CheckCircle, ShieldCheck } from 'lucide-react';
import { SupportConfig } from '../../types';
import { PassportPhotoModal } from '../PassportPhoto/PassportPhotoModal';

interface PassportPhotoTabProps {
  supportConfig: SupportConfig;
  onOpenPassportModal: () => void;
}

export const PassportPhotoTab: React.FC<PassportPhotoTabProps> = ({
  supportConfig,
  onOpenPassportModal
}) => {
  return (
    <div className="space-y-6 pb-16 max-w-3xl mx-auto">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Masud Digital Hub Photo Studio • 100% Free</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Passport Photo Generator (পাসপোর্ট সাইজ ফটো)
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Create standard 3.5cm × 4.5cm Indian passport photos ready for government job exams (SSC, PSC, Railway), company ID badges, and official applications. Auto-crop, clean backgrounds, choose 3, 6, or 12 photos, and print or download as PDF.
          </p>

          <div className="pt-2">
            <button
              onClick={onOpenPassportModal}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Camera className="w-5 h-5 text-slate-950" />
              <span>Open Passport Photo Generator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">3.5cm × 4.5cm Standard</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Biometric ratio compliant with Indian Passport, PAN card, driving license, and WB/Bihar PSC exam specifications.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Scissors className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Clean Studio Backgrounds</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Instantly replace cluttered room backgrounds with clean official white, studio blue, or light grey.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Printer className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">3, 6, 12 Print Sheets</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Pre-arranged on 4x6 inch or A4 paper with scissor cut guidelines for easy printing at home or cyber cafe.
          </p>
        </div>
      </div>

      {/* Quick Launch Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-300 flex items-center justify-center mx-auto shadow-md">
          <Camera className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Generate Your Passport Photos Now
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            Upload any selfie or portrait from your phone. Our tool will align your face, crop to 3.5cm x 4.5cm, clean the background, and generate a printable sheet.
          </p>
        </div>
        <button
          onClick={onOpenPassportModal}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          Start Generating (ফটো তৈরি করুন)
        </button>
      </div>
    </div>
  );
};
