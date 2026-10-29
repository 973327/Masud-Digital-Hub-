import React from 'react';
import { 
  Home,
  Briefcase, 
  Phone, 
  ShieldCheck, 
  KeyRound, 
  User as UserIcon, 
  LogOut,
  Sparkles,
  MessageSquarePlus,
  Camera,
  CreditCard
} from 'lucide-react';
import { SupportConfig, User } from '../../types';
import { ADMIN_CREDENTIALS } from '../../services/storage';

interface NavbarProps {
  currentUser: User | null;
  supportConfig: SupportConfig;
  activeTab?: string;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onNavigateTab: (tab: 'scanner' | 'credit_cards' | 'cybercafe' | 'shop_management' | 'home' | 'jobs' | 'loans' | 'learn' | 'profile' | 'admin') => void;
  onOpenFeedback?: () => void;
  onOpenPassportPhoto?: () => void;
  onQuickSwitchToAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  supportConfig,
  activeTab = 'home',
  onOpenAuth,
  onLogout,
  onNavigateTab,
  onOpenFeedback,
  onOpenPassportPhoto
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const cleanHelpline = supportConfig.helplineNumber.replace(/[^0-9]/g, '');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div 
          onClick={() => onNavigateTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                Masud Digital Hub
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                SEVA KENDRA
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium -mt-0.5">
              DocScan Pro, Cyber Cafe & Banking Portal
            </p>
          </div>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2">
          {/* Home Direct Navigation Button */}
          <button
            onClick={() => onNavigateTab('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Go to Home Dashboard"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </button>

          {/* Doc Scanner Direct Navigation Item */}
          <button
            onClick={() => onNavigateTab('scanner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'scanner'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
            }`}
            title="DocScan Pro - Document Scanner & PDF Studio"
          >
            <Camera className="w-3.5 h-3.5 text-blue-500" />
            <span>Doc Scanner</span>
          </button>

          {/* Credit Card Hub Navigation Item */}
          <button
            onClick={() => onNavigateTab('credit_cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'credit_cards'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm ring-2 ring-amber-400/40'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-extrabold'
            }`}
            title="Credit Card Hub - Bank Cards, Retailer Commissions & Lead Tracking"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-600" />
            <span>Card Hub</span>
          </button>

          {/* Shop Management Direct Navigation Item */}
          <button
            onClick={() => onNavigateTab('shop_management')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'shop_management'
                ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-600/40'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Cyber Cafe Shop Management & Customer Records"
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Shop Mgmt</span>
          </button>

          {/* Cyber Cafe Tools Direct Button */}
          <button
            onClick={() => onNavigateTab('cybercafe')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'cybercafe'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Open Cyber Cafe Tools Hub"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Cafe Tools</span>
          </button>

          {/* Loan Services Switcher */}
          <button
            onClick={() => onNavigateTab('loans')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'loans'
                ? 'bg-slate-900 text-white shadow-xs font-bold'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
            title="Loan & Financial Services (সহজ ঋণ সেবা)"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Loans</span>
          </button>

          {/* Quick Helpline Phone Link */}
          <a
            href={`tel:${cleanHelpline}`}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            title={`Helpline: ${supportConfig.helplineNumber}`}
          >
            <Phone className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-mono">{supportConfig.helplineNumber}</span>
          </a>

          {/* User Feedback Quick Trigger */}
          {onOpenFeedback && (
            <button
              onClick={onOpenFeedback}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-[11px] font-bold transition-colors cursor-pointer"
              title="Submit Feedback, Suggestions or Report an Issue"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden lg:inline">Feedback</span>
            </button>
          )}

          {/* Passport Photo Studio Quick Trigger */}
          {onOpenPassportPhoto && (
            <button
              onClick={onOpenPassportPhoto}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-colors border border-emerald-200 cursor-pointer"
              title="Create Standard 3.5cm x 4.5cm Passport Photos"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>Photo Studio</span>
            </button>
          )}

          {/* Admin Portal Shortcut (ONLY shown when logged in as Admin) */}
          {isAdmin && (
            <button
              onClick={() => onNavigateTab('admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-black shadow-xs cursor-pointer transition-all"
              title="Open Admin Control Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-900" />
              <span>Admin Portal</span>
            </button>
          )}

          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onNavigateTab('profile')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                {currentUser.profilePicture ? (
                  <img
                    src={currentUser.profilePicture}
                    alt={currentUser.fullName}
                    className="w-5 h-5 rounded-full object-cover border border-emerald-500 shadow-2xs shrink-0"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="max-w-[80px] sm:max-w-[120px] truncate">
                  {currentUser.fullName.split(' ')[0]}
                </span>
              </button>

              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Sign Up (₹50)
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
