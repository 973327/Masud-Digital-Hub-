import React, { useState, useRef } from 'react';
import { 
  User as UserIcon, 
  ShieldCheck, 
  FileText, 
  Phone, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Building2, 
  CreditCard, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  QrCode,
  MessageSquarePlus,
  Star,
  ThumbsUp,
  Camera,
  Upload,
  Sparkles,
  Check,
  X,
  RefreshCw
} from 'lucide-react';
import { CVData, SupportConfig, User, UserAchievementState } from '../../types';
import { AchievementsSection } from '../Achievements/AchievementsSection';
import { compressImageForAvatar } from '../../services/imageUtils';

const CLEAN_AVATAR_PRESETS = [
  {
    id: 'clean-1',
    name: 'Official Suit & Tie',
    desc: 'Clean studio white background',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'clean-2',
    name: 'Executive Studio Blue',
    desc: 'Dark blue official backdrop',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'clean-3',
    name: 'Corporate Candidate',
    desc: 'Professional ID headshot',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'clean-4',
    name: 'Modern Business Portrait',
    desc: 'Bright studio lighting',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'clean-5',
    name: 'Formal Studio (Female)',
    desc: 'Official passport headshot',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'clean-6',
    name: 'Smart Professional (Female)',
    desc: 'Clean white studio background',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80'
  }
];

interface ProfileTabProps {
  currentUser: User | null;
  supportConfig: SupportConfig;
  achievementState: UserAchievementState;
  cvData: CVData | null;
  onOpenCVMaker: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenUPIActivation: () => void;
  onLogout: () => void;
  onNavigateTab: (tab: 'cybercafe' | 'home' | 'jobs' | 'learn' | 'profile' | 'admin') => void;
  onOpenFeedback?: (category?: 'job_issue' | 'suggestion' | 'review' | 'payment_issue' | 'other') => void;
  onOpenPassportPhoto?: () => void;
  onUpdateProfilePicture?: (newPhotoUrl: string) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  currentUser,
  supportConfig,
  achievementState,
  cvData,
  onOpenCVMaker,
  onOpenAuth,
  onOpenUPIActivation,
  onLogout,
  onNavigateTab,
  onOpenFeedback,
  onOpenPassportPhoto,
  onUpdateProfilePicture
}) => {
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanWhatsapp = supportConfig.whatsappNumber.replace(/[^0-9]/g, '');
  const cleanHelpline = supportConfig.helplineNumber.replace(/[^0-9]/g, '');

  const whatsappUrl = `https://wa.me/91${cleanWhatsapp}?text=${encodeURIComponent(
    'নমস্কার, I need assistance with my Masud Digital Hub profile.'
  )}`;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressing(true);
        // Compress avatar to compact 200x200 JPEG (~10-25KB) to guarantee zero QuotaExceededError
        const compressedUrl = await compressImageForAvatar(file, 200, 0.75);
        if (compressedUrl && onUpdateProfilePicture) {
          onUpdateProfilePicture(compressedUrl);
          setIsPhotoModalOpen(false);
        }
      } catch (err) {
        console.error('Error compressing profile photo:', err);
      } finally {
        setIsCompressing(false);
        if (e.target) e.target.value = '';
      }
    }
  };

  const handleSelectPreset = (url: string) => {
    if (onUpdateProfilePicture) {
      onUpdateProfilePicture(url);
      setIsPhotoModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-2xl mx-auto">
      {/* User Profile Card */}
      {currentUser ? (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-4">
              {/* Profile Avatar with Camera Trigger */}
              <div className="relative group shrink-0">
                {currentUser.profilePicture ? (
                  <img
                    src={currentUser.profilePicture}
                    alt={currentUser.fullName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shadow-emerald-500/20"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 text-2xl font-bold">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-slate-900 text-white hover:bg-emerald-600 shadow-md transition-colors cursor-pointer border border-white/40"
                  title="ছবি পরিবর্তন করুন (Change Profile Picture)"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-300" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    {currentUser.fullName}
                  </h2>
                  {currentUser.role === 'admin' ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase">
                      Super Admin
                    </span>
                  ) : currentUser.isActive ? (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Active Member
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                      Activation Pending
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  +91 {currentUser.mobileNumber}
                </p>

                <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser.district}, {currentUser.state}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <button
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ছবি পরিবর্তন করুন (Change Photo)</span>
                  </button>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => onNavigateTab('admin')}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-900" />
                      <span>Admin Portal</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>

          {/* Account Status / Payment Verification */}
          <div className="mt-4 pt-1">
            {currentUser.isActive ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Standard ₹{supportConfig.joiningFee} Membership Active
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Registered on: {currentUser.registrationDate} • Unlimited Employer Calling Enabled
                  </p>
                </div>
                <span className="font-mono text-[11px] text-emerald-800 font-bold bg-white px-2 py-1 rounded-lg border border-emerald-200">
                  VERIFIED
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Account Activation Pending
                  </p>
                  <p className="text-amber-700 text-[11px] mt-0.5">
                    Complete ₹{supportConfig.joiningFee} one-time UPI joining fee to unlock direct phone calling and CV downloads.
                  </p>
                </div>
                <button
                  onClick={onOpenUPIActivation}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer whitespace-nowrap"
                >
                  Pay ₹{supportConfig.joiningFee} Now
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Guest View */
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <UserIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Welcome to Masud Digital Hub
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Login or register to access digital services, customer management, credit cards, and photo tools.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow hover:bg-slate-800 cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow hover:bg-emerald-700 cursor-pointer"
            >
              New Registration (₹50)
            </button>
          </div>
        </div>
      )}

      {/* User Achievements & Badges Showcase Section */}
      <AchievementsSection
        currentUser={currentUser}
        achievementState={achievementState}
        cvData={cvData}
        supportConfig={supportConfig}
        onNavigateTab={onNavigateTab}
        onOpenCVMaker={onOpenCVMaker}
        onOpenUPIActivation={onOpenUPIActivation}
        onOpenFeedback={onOpenFeedback}
        onOpenAuth={onOpenAuth}
      />

      {/* Built-in CV Maker Access Card (Core Requirement 4 & 5) */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
              Feature Tool
            </span>
          </div>

          <h3 className="text-lg font-black tracking-tight leading-tight">
            Built-in CV Maker (বায়োডাটা প্রস্তুতকারক)
          </h3>

          <p className="text-xs text-emerald-100 max-w-md mt-1 leading-relaxed mb-4">
            Enter your personal info, qualifications, work experience, and vocational skills to generate, download PDF CVs or share them directly with recruiters via WhatsApp.
          </p>

          <button
            onClick={onOpenCVMaker}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-emerald-50 font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Open Built-in CV Maker</span>
          </button>
        </div>
      </div>

      {/* Passport Photo Studio Access Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-amber-300" />
              <span>Job Tool</span>
            </span>
            <span className="text-xs text-emerald-400 font-bold">Standard 3.5cm × 4.5cm</span>
          </div>

          <h3 className="text-lg font-black tracking-tight leading-tight">
            Passport Photo Generator (পাসপোর্ট সাইজ ছবি)
          </h3>

          <p className="text-xs text-slate-300 max-w-md mt-1 leading-relaxed mb-4">
            Upload any photo to auto-crop to official biometric size (3.5cm x 4.5cm), clean background to official studio white or blue, choose 3, 6, or 12 prints, and download as PDF.
          </p>

          <button
            onClick={onOpenPassportPhoto}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4 text-slate-950" />
            <span>Open Passport Photo Studio</span>
          </button>
        </div>
      </div>

      {/* Quick Support Buttons (WhatsApp & Helpline Call) (Core Requirement 4) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Quick Support & Helplines (সহায়তা কেন্দ্র)
          </h3>
          <p className="text-xs text-slate-500">
            Get instant help from our dedicated candidate relationship managers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* WhatsApp Support Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <MessageCircle className="w-5 h-5 fill-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">WhatsApp Support</p>
              <p className="text-xs font-mono font-bold text-emerald-700">
                +91 {supportConfig.whatsappNumber}
              </p>
              <p className="text-[10px] text-slate-400">Available Mon-Sat 9AM-8PM</p>
            </div>
          </a>

          {/* Helpline Call Button */}
          <a
            href={`tel:${cleanHelpline}`}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Helpline Call</p>
              <p className="text-xs font-mono font-bold text-blue-700">
                {supportConfig.helplineNumber}
              </p>
              <p className="text-[10px] text-slate-400">Toll-free regional support</p>
            </div>
          </a>
        </div>
      </div>

      {/* User Feedback & Issue Reporting Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                User Feedback, Reviews & Suggestions (মতামত ও অভিযোগ)
              </h3>
              <p className="text-xs text-slate-500">
                Report recruiter issues, request new district features, or rate our service
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Your feedback is directly monitored by our Super Admin team to protect candidates from fake listings and enhance job matching across West Bengal and Bihar.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => onOpenFeedback && onOpenFeedback('review')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Submit App Review & Rating</span>
          </button>

          <button
            onClick={() => onOpenFeedback && onOpenFeedback('job_issue')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs transition-colors cursor-pointer"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Report a Job / Fraud Issue</span>
          </button>
        </div>
      </div>

      {/* Official Company Credentials & Regional Addresses (Core Requirement 3 & 4) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Building2 className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {supportConfig.companyName}
            </h3>
            <p className="text-xs text-slate-500">{supportConfig.tagline}</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          <div className="flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-700 block">Official Email:</span>
              <a href={`mailto:${supportConfig.officialEmail}`} className="text-emerald-700 font-medium hover:underline">
                {supportConfig.officialEmail}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CreditCard className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-700 block">UPI ID for Joining:</span>
              <span className="font-mono font-bold text-slate-800 select-all">{supportConfig.upiId}</span>
            </div>
          </div>

          {supportConfig.addressBengal && (
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700 block">West Bengal Regional Office:</span>
                <span>{supportConfig.addressBengal}</span>
              </div>
            </div>
          )}

          {supportConfig.addressBihar && (
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700 block">Bihar Branch Office:</span>
                <span>{supportConfig.addressBihar}</span>
              </div>
            </div>
          )}

          {supportConfig.branchOffices && supportConfig.branchOffices.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Regional Hubs & District Branch Offices ({supportConfig.branchOffices.length})
              </span>
              {supportConfig.branchOffices.map((branch) => (
                <div key={branch.id} className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold text-slate-800 block text-xs">{branch.name}</span>
                    <span className="text-slate-600 block text-[11px]">{branch.address}</span>
                    {branch.phone && (
                      <span className="text-emerald-700 font-mono text-[11px] font-semibold mt-0.5 block">
                        Contact: +91 {branch.phone}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Masud Digital Hub Portal</span>
          <span>Version 2.4 (Clean Build)</span>
        </div>
      </div>

      {/* Change Profile Picture Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md">
                  <Camera className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    প্রোফাইল পিকচার পরিবর্তন করুন
                  </h3>
                  <p className="text-xs text-slate-400">
                    Choose a clean, sharp, professional profile photo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Current Picture Preview */}
              <div className="flex items-center gap-4 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md shrink-0 bg-white flex items-center justify-center">
                  {currentUser?.profilePicture ? (
                    <img
                      src={currentUser.profilePicture}
                      alt="Current"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-emerald-700 font-bold text-lg">
                      {currentUser?.fullName.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-emerald-950 block text-xs">
                    বর্তমান প্রোফাইল ছবি (Active Profile Picture)
                  </span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    আপনার একাউন্ট ও সিভি-তে এই ছবিটি সুন্দরভাবে প্রদর্শিত হবে।
                  </p>
                </div>
              </div>

              {/* Upload from Device */}
              <div className="space-y-2">
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[11px] block">
                  ১. ডিভাইস থেকে নতুন ছবি আপলোড করুন
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    {isCompressing ? (
                      <>
                        <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                        <span>অপ্টমাইজ হচ্ছে (Optimizing...)...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-emerald-400" />
                        <span>Upload Custom Photo</span>
                      </>
                    )}
                  </button>
                  {onOpenPassportPhoto && (
                    <button
                      onClick={() => {
                        setIsPhotoModalOpen(false);
                        onOpenPassportPhoto();
                      }}
                      className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Auto-crop with react-easy-crop studio"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Passport Studio</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Preset Clean Studio Avatars */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[11px] block">
                    ২. পরিষ্কার ও সুন্দর স্টুডিও পোর্ট্রেট নির্বাচন করুন
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    6 Studio Presets
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CLEAN_AVATAR_PRESETS.map((avatar) => {
                    const isSelected = currentUser?.profilePicture === avatar.url;
                    return (
                      <div
                        key={avatar.id}
                        onClick={() => handleSelectPreset(avatar.url)}
                        className={`group p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 relative ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 shadow-md ring-2 ring-emerald-500/30'
                            : 'border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-white'
                        }`}
                      >
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md relative">
                          <img
                            src={avatar.url}
                            alt={avatar.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-emerald-600/40 flex items-center justify-center">
                              <Check className="w-5 h-5 text-white stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-slate-900 text-[11px] block truncate w-full">
                          {avatar.name}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate w-full">
                          {avatar.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  if (onUpdateProfilePicture) {
                    onUpdateProfilePicture('');
                    setIsPhotoModalOpen(false);
                  }
                }}
                className="text-[11px] text-slate-500 hover:text-red-600 font-bold transition-colors cursor-pointer"
              >
                Reset to Initials
              </button>

              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="py-2 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
