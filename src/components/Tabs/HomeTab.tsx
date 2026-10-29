import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  CreditCard, 
  LayoutDashboard, 
  Sparkles, 
  Banknote, 
  PlayCircle, 
  ArrowRight, 
  ShieldCheck, 
  Phone, 
  MessageSquarePlus, 
  ChevronRight, 
  TrendingUp, 
  Zap, 
  FileText, 
  Users, 
  CheckCircle2, 
  Percent, 
  Clock, 
  Sparkle,
  Gift,
  Building2,
  ExternalLink
} from 'lucide-react';
import { User, SupportConfig, LoanService, LearningVideo } from '../../types';
import { TabType } from '../Common/BottomNav';
import { BANK_CARDS, getStoredLeads, calculateRetailerCommissionSummary } from '../../services/creditCardStorage';
import { DEFAULT_LOAN_SERVICES } from '../../services/storage';
import { LEARNING_VIDEOS } from '../../data/learningVideos';

interface HomeTabProps {
  currentUser: User | null;
  supportConfig: SupportConfig;
  videos?: LearningVideo[];
  loans?: LoanService[];
  onNavigateTab: (tab: TabType) => void;
  onOpenCVMaker?: () => void;
  onOpenPassportPhoto?: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenUPIActivation: () => void;
  onOpenFeedback?: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  currentUser,
  supportConfig,
  videos = LEARNING_VIDEOS,
  loans = DEFAULT_LOAN_SERVICES,
  onNavigateTab,
  onOpenCVMaker,
  onOpenPassportPhoto,
  onOpenAuth,
  onOpenUPIActivation,
  onOpenFeedback
}) => {
  const [leadsSummary, setLeadsSummary] = useState(() => calculateRetailerCommissionSummary(getStoredLeads()));

  useEffect(() => {
    // refresh summary on load
    setLeadsSummary(calculateRetailerCommissionSummary(getStoredLeads()));
  }, []);

  const cleanHelpline = supportConfig.helplineNumber.replace(/[^0-9]/g, '');

  // 6 Primary Service Features (Moved from bottom nav to top organized grid)
  const primaryServices = [
    {
      id: 'scanner',
      title: 'DocScan Pro',
      subtitle: 'Scanner & PDF Studio',
      description: 'Camera doc scan, multi-page, OCR, merge & split PDFs',
      icon: Camera,
      tag: 'SCANNER',
      tagColor: 'bg-blue-100 text-blue-700 border-blue-200',
      gradient: 'from-blue-600 to-indigo-600',
      cardBg: 'hover:border-blue-300 hover:shadow-blue-500/10',
      iconBg: 'bg-blue-600 text-white',
      accent: 'blue',
      tab: 'scanner' as TabType
    },
    {
      id: 'credit_cards',
      title: 'Credit Card Hub',
      subtitle: 'Bank Cards & Commission',
      description: 'HDFC, SBI, Axis, ICICI. Earn ₹1,600 – ₹2,400 per card',
      icon: CreditCard,
      tag: 'EARN ₹2,400',
      tagColor: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      gradient: 'from-amber-500 to-orange-600',
      cardBg: 'hover:border-amber-300 hover:shadow-amber-500/10',
      iconBg: 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950',
      accent: 'amber',
      tab: 'credit_cards' as TabType
    },
    {
      id: 'shop_management',
      title: 'Shop Management',
      subtitle: 'Token & Job Ledger',
      description: 'Customer token IDs, job status, delivery & balance ledger',
      icon: LayoutDashboard,
      tag: 'LEDGER',
      tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      gradient: 'from-emerald-600 to-teal-700',
      cardBg: 'hover:border-emerald-300 hover:shadow-emerald-500/10',
      iconBg: 'bg-emerald-600 text-white',
      accent: 'emerald',
      tab: 'shop_management' as TabType
    },
    {
      id: 'cybercafe',
      title: 'Cafe Hub Tools',
      subtitle: 'Photo Fixer & Resizer',
      description: '20-50 KB resizer, passport photo grid, signature & PDF',
      icon: Sparkles,
      tag: 'INSTANT TOOLS',
      tagColor: 'bg-purple-100 text-purple-800 border-purple-200',
      gradient: 'from-purple-600 to-pink-600',
      cardBg: 'hover:border-purple-300 hover:shadow-purple-500/10',
      iconBg: 'bg-purple-600 text-white',
      accent: 'purple',
      tab: 'cybercafe' as TabType
    },
    {
      id: 'loans',
      title: 'Loans & Credit',
      subtitle: 'Instant Financial Seva',
      description: 'Business MSME, Mudra & personal loans with low interest',
      icon: Banknote,
      tag: 'INSTANT CREDIT',
      tagColor: 'bg-teal-100 text-teal-800 border-teal-200',
      gradient: 'from-teal-600 to-cyan-600',
      cardBg: 'hover:border-teal-300 hover:shadow-teal-500/10',
      iconBg: 'bg-teal-600 text-white',
      accent: 'teal',
      tab: 'loans' as TabType
    },
    {
      id: 'learn',
      title: 'Learning Hub',
      subtitle: 'Tutorials & Training',
      description: 'Software training videos, Aadhaar & portal operator tips',
      icon: PlayCircle,
      tag: 'SKILL VIDEOS',
      tagColor: 'bg-slate-100 text-slate-800 border-slate-300',
      gradient: 'from-slate-700 to-slate-900',
      cardBg: 'hover:border-slate-300 hover:shadow-slate-500/10',
      iconBg: 'bg-slate-800 text-white',
      accent: 'slate',
      tab: 'learn' as TabType
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 pt-4 pb-24 space-y-6">
      
      {/* 1. Hero / Operator Greeting Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden border border-slate-700/80">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Pill & Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/25 text-blue-300 text-xs font-bold border border-blue-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                Cyber Cafe & Retailer Hub
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                All-in-One Digital Seva Portal
              </span>
            </div>

            {currentUser ? (
              <div className="flex items-center gap-2">
                {currentUser.isActive ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Verified Partner
                  </span>
                ) : (
                  <button
                    onClick={onOpenUPIActivation}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black hover:bg-amber-300 transition-colors shadow cursor-pointer"
                  >
                    <span>Activate Account (₹{supportConfig.joiningFee})</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all cursor-pointer border border-slate-700"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-black text-white transition-all cursor-pointer shadow-md shadow-blue-600/30"
                >
                  Register Shop
                </button>
              </div>
            )}
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              {currentUser ? (
                <>
                  নমস্কার, <span className="text-blue-400">{currentUser.fullName}</span>!
                </>
              ) : (
                <>
                  ডিজিটাল সেবা ও সাইবার ক্যাফে পোর্টাল <br />
                  <span className="text-blue-400">Masud Digital Hub</span>
                </>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed mt-1.5">
              Empowering Indian Cyber Cafes, CSC centers, and retailers with professional document scanning, credit card distributor earnings, customer job management, and instant loans.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Card Payout</p>
              <p className="text-base sm:text-lg font-black text-amber-400 mt-0.5">₹1,600 – ₹2,400</p>
              <p className="text-[10px] text-slate-300">Per approved card</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Document Scanner</p>
              <p className="text-base sm:text-lg font-black text-blue-300 mt-0.5">DocScan Pro</p>
              <p className="text-[10px] text-slate-300">Camera & PDF tools</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Shop Ledger</p>
              <p className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">Token System</p>
              <p className="text-[10px] text-slate-300">Balance & jobs tracking</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Express Loans</p>
              <p className="text-base sm:text-lg font-black text-teal-300 mt-0.5">Instant Seva</p>
              <p className="text-[10px] text-slate-300">Business & MSME credit</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Quick-Access Services Grid (The Core Requirement #1 & #3) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              Quick Access Services & Tools
            </h2>
            <p className="text-xs text-slate-500">
              Tap any service to open its dedicated dashboard
            </p>
          </div>
        </div>

        {/* 6-Card Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {primaryServices.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                onClick={() => onNavigateTab(service.tab)}
                className={`group bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 ${service.cardBg}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ${service.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${service.tagColor}`}>
                      {service.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    {service.subtitle}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-blue-600">
                  <span>Open Service</span>
                  <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. High Earning Spotlight: Credit Card Hub Preview (Requirement #3) */}
      <section className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 rounded-3xl p-5 border border-amber-300/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <CreditCard className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Credit Card Hub & Distributor Earnings
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  NEW
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Help customers apply for top bank cards & earn direct retailer commission per approval.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('credit_cards')}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow cursor-pointer shrink-0"
          >
            <span>Open Card Hub</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Top Cards Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {BANK_CARDS.slice(0, 3).map((card) => (
            <div
              key={card.id}
              onClick={() => onNavigateTab('credit_cards')}
              className="bg-white rounded-2xl p-3.5 border border-amber-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-900 text-white">
                    {card.bank}
                  </span>
                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Earn ₹{card.retailerCommission.toLocaleString('en-IN')}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {card.cardName}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {card.cashbackHighlights[0]}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">
                  {card.annualFee === 0 ? 'Lifetime Free' : `Fee: ₹${card.annualFee}/yr`}
                </span>
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  Apply Lead <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Instant Loans & Financial Seva Section (Requirement #3) */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-black border border-teal-200">
              <Banknote className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Loan Services & Financial Seva (সহজ ঋণ সেবা)
              </h3>
              <p className="text-xs text-slate-500">
                Provide instant personal, business & Mudra loan assistance to your customers.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('loans')}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer shrink-0"
          >
            <span>Explore All Loans</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Popular Loan Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(loans || DEFAULT_LOAN_SERVICES).slice(0, 3).map((loan) => (
            <div
              key={loan.id}
              onClick={() => onNavigateTab('loans')}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200/80 hover:border-teal-300 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                    {loan.category}
                  </span>
                  <span className="text-xs font-black text-teal-700">
                    {loan.interestRate}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {loan.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Max: <span className="font-semibold text-slate-700">{loan.maxAmount}</span> • Tenure: {loan.tenure || 'Flexible'}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-teal-700 font-bold">
                <span>Check Eligibility</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Support & Feedback Banner */}
      <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <Phone className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Dedicated Operator Support: <strong className="text-slate-900">{supportConfig.helplineNumber}</strong> (Mon–Sat 9AM–8PM)
          </span>
        </div>
        <div className="flex items-center gap-3">
          {onOpenFeedback && (
            <button
              onClick={onOpenFeedback}
              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Feedback & Suggestions</span>
            </button>
          )}
          <a
            href={`tel:${cleanHelpline}`}
            className="px-3 py-1 rounded-lg bg-white border border-slate-300 font-bold text-slate-800 hover:bg-slate-50"
          >
            Call Now
          </a>
        </div>
      </div>

    </div>
  );
};
