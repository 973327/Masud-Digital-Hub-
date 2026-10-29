import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Percent, 
  Calendar, 
  HelpCircle, 
  Search, 
  Filter, 
  Calculator, 
  Building2, 
  Banknote, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp,
  Settings,
  Zap,
  Info,
  Check,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Tag,
  RotateCcw
} from 'lucide-react';
import { LoanService, User } from '../../types';

interface LoansTabProps {
  loans: LoanService[];
  currentUser: User | null;
  onNavigateTab: (tab: 'cybercafe' | 'home' | 'jobs' | 'learn' | 'profile' | 'admin' | 'loans') => void;
  onOpenAdminLoans?: () => void;
}

/**
 * Extracts numeric value from a loan maximum amount string (e.g., 'Up to ₹5,00,000', '₹50,000', '10 Lakh')
 */
export function parseLoanAmount(str: string): number {
  if (!str) return 0;
  const lower = str.toLowerCase();
  
  // Match crore / cr
  const crMatch = lower.match(/([\d.]+)\s*(?:cr|crore|কোটি)/);
  if (crMatch) {
    return parseFloat(crMatch[1]) * 10000000;
  }
  
  // Match lakh / lac
  const lakhMatch = lower.match(/([\d.]+)\s*(?:lakh|lac|লাখ)/);
  if (lakhMatch) {
    return parseFloat(lakhMatch[1]) * 100000;
  }
  
  // Strip non-numeric characters except digits
  const clean = str.replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
}

/**
 * Embedded Loan EMI Calculator Utility Function
 * Calculates monthly installment, total interest, and gross repayment
 * Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateLoanEMI(
  principal: number,
  annualInterestPercent: number,
  tenureMonths: number
): {
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
} {
  const P = Math.max(0, Number(principal) || 0);
  const r = (Number(annualInterestPercent) || 0) / 12 / 100;
  const n = Math.max(1, Number(tenureMonths) || 1);

  if (r === 0 || isNaN(r)) {
    const emi = P / n;
    return {
      monthlyEmi: Math.round(emi),
      totalInterest: 0,
      totalPayment: Math.round(P)
    };
  }

  const factor = Math.pow(1 + r, n);
  const emi = (P * r * factor) / (factor - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - P;

  return {
    monthlyEmi: Math.round(emi) || 0,
    totalInterest: Math.round(totalInterest) || 0,
    totalPayment: Math.round(totalPayment) || 0
  };
}

interface AmountRangeConfig {
  id: string;
  label: string;
  bengali: string;
  min: number;
  max: number;
  badge: string;
}

const AMOUNT_RANGES: AmountRangeConfig[] = [
  { id: 'all', label: 'All Amounts', bengali: 'সকল পরিমাণ', min: 0, max: Infinity, badge: 'All' },
  { id: 'under-50k', label: 'Under ₹50,000', bengali: '≤ ৫০ হাজার (মাইক্রো / জরুরি)', min: 0, max: 50000, badge: '≤ ₹50K' },
  { id: '50k-2lakh', label: '₹50,000 – ₹2,00,000', bengali: '৫০ হাজার - ২ লাখ (বাইক / স্কিল)', min: 50001, max: 200000, badge: '₹50K - ₹2L' },
  { id: '2lakh-5lakh', label: '₹2,00,000 – ₹5,00,000', bengali: '২ লাখ - ৫ লাখ (পার্সোনাল ক্যাশ)', min: 200001, max: 500000, badge: '₹2L - ₹5L' },
  { id: 'above-5lakh', label: 'Above ₹5,00,000', bengali: '৫ লাখের বেশি (MSME / স্বর্ণ)', min: 500001, max: Infinity, badge: '> ₹5L' }
];

const CATEGORIES = [
  { id: 'all', label: 'All Categories', bengali: 'সকল ক্যাটাগরি' },
  { id: 'personal', label: 'Personal', bengali: 'ব্যক্তিগত' },
  { id: 'business', label: 'Business / MSME', bengali: 'ব্যবসা ও দোকান' },
  { id: 'micro', label: 'Micro / Aadhaar', bengali: 'মাইক্রো ঋণ' },
  { id: 'vehicle', label: 'Vehicle / Bike', bengali: 'বাইক ও স্কুটার' },
  { id: 'education', label: 'Skill & Education', bengali: 'শিক্ষা ও ট্রেনিং' },
  { id: 'gold', label: 'Gold Loan', bengali: 'স্বর্ণ বন্ধকী' }
];

const POPULAR_SEARCH_KEYWORDS = [
  'Personal Instant',
  'MSME Business',
  'Aadhaar Micro',
  'Bike Loan',
  '₹5,00,000',
  '15-Min Disbursal',
  'Gold Loan'
];

export const LoansTab: React.FC<LoansTabProps> = ({
  loans,
  currentUser,
  onNavigateTab,
  onOpenAdminLoans
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAmountRange, setSelectedAmountRange] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'amount-desc' | 'amount-asc' | 'fastest'>('default');
  const [showCalculator, setShowCalculator] = useState<boolean>(true);

  // EMI Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(100000);
  const [calcInterest, setCalcInterest] = useState<number>(12);
  const [calcTenureMonths, setCalcTenureMonths] = useState<number>(24);

  const isAdmin = currentUser?.role === 'admin';

  // Only show active loans for normal users; admin sees all or active
  const activeLoans = useMemo(() => {
    return loans.filter((loan) => (isAdmin ? true : loan.isActive));
  }, [loans, isAdmin]);

  // Counts for amount range filter chips
  const getAmountRangeCount = (rangeId: string) => {
    if (rangeId === 'all') return activeLoans.length;
    const range = AMOUNT_RANGES.find(r => r.id === rangeId);
    if (!range) return 0;
    return activeLoans.filter(l => {
      const amt = parseLoanAmount(l.maxAmount);
      return amt >= range.min && amt <= range.max;
    }).length;
  };

  // Counts for category filter chips
  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return activeLoans.length;
    return activeLoans.filter(l => l.category === catId).length;
  };

  // Filtered & Sorted loans based on category, amount range, search query, and sort
  const filteredLoans = useMemo(() => {
    let result = activeLoans.filter((loan) => {
      // 1. Category Filter
      if (selectedCategory !== 'all' && loan.category !== selectedCategory) {
        return false;
      }

      // 2. Maximum Amount Range Filter Chip
      if (selectedAmountRange !== 'all') {
        const range = AMOUNT_RANGES.find(r => r.id === selectedAmountRange);
        if (range) {
          const amt = parseLoanAmount(loan.maxAmount);
          if (amt < range.min || amt > range.max) {
            return false;
          }
        }
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = loan.name.toLowerCase().includes(q);
        const matchBengali = loan.nameBengali?.toLowerCase().includes(q);
        const matchHindi = loan.nameHindi?.toLowerCase().includes(q);
        const matchMax = loan.maxAmount.toLowerCase().includes(q);
        const matchProvider = loan.provider?.toLowerCase().includes(q);
        const matchCategory = loan.category.toLowerCase().includes(q);
        const matchBadge = loan.badge?.toLowerCase().includes(q);
        const matchFeatures = loan.features?.some(f => f.toLowerCase().includes(q));

        // If search query is numbers only (e.g. "50000" or "500000"), check against numeric parsed amount
        const queryNumeric = parseInt(q.replace(/[^0-9]/g, ''), 10);
        let matchNumeric = false;
        if (!isNaN(queryNumeric) && queryNumeric > 0) {
          const loanNumeric = parseLoanAmount(loan.maxAmount);
          if (loanNumeric >= queryNumeric) {
            matchNumeric = true;
          }
        }

        if (
          !matchName &&
          !matchBengali &&
          !matchHindi &&
          !matchMax &&
          !matchProvider &&
          !matchCategory &&
          !matchBadge &&
          !matchFeatures &&
          !matchNumeric
        ) {
          return false;
        }
      }

      return true;
    });

    // 4. Sorting
    if (sortBy === 'amount-desc') {
      result = [...result].sort((a, b) => parseLoanAmount(b.maxAmount) - parseLoanAmount(a.maxAmount));
    } else if (sortBy === 'amount-asc') {
      result = [...result].sort((a, b) => parseLoanAmount(a.maxAmount) - parseLoanAmount(b.maxAmount));
    } else if (sortBy === 'fastest') {
      result = [...result].sort((a, b) => {
        const aInstant = (a.processingTime || '').toLowerCase().includes('instant') || (a.processingTime || '').toLowerCase().includes('min');
        const bInstant = (b.processingTime || '').toLowerCase().includes('instant') || (b.processingTime || '').toLowerCase().includes('min');
        if (aInstant && !bInstant) return -1;
        if (!aInstant && bInstant) return 1;
        return 0;
      });
    }

    return result;
  }, [activeLoans, selectedCategory, selectedAmountRange, searchQuery, sortBy]);

  // Embedded Loan EMI Calculator Utility Function (Core Feature)
  const { monthlyEmi, totalInterest, totalPayment } = useMemo(() => {
    return calculateLoanEMI(calcAmount, calcInterest, calcTenureMonths);
  }, [calcAmount, calcInterest, calcTenureMonths]);

  // Handle Affiliate Click with safety
  const handleApplyNow = (loan: LoanService) => {
    if (!loan.affiliateLink) return;
    window.open(loan.affiliateLink, '_blank', 'noopener,noreferrer');
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedAmountRange('all');
    setSearchQuery('');
    setSortBy('default');
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedAmountRange !== 'all' || searchQuery.trim().length > 0 || sortBy !== 'default';

  return (
    <div className="space-y-6 pb-16">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden border border-slate-700/60">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Verified Lending Partners</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-semibold border border-amber-400/30">
                100% Online Paperless
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              Loan Services (কাজ বন্ধু ঋণ সেবা)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Instant personal cash loans, MSME shopkeeper working capital, Aadhaar micro emergency credit, and vehicle finance with fast bank transfer.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Physical Visits</span>
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Direct Bank Disbursal</span>
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>RBI Regulated Partners</span>
              </span>
            </div>
          </div>

          {/* Quick CTA or Admin Link */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            {isAdmin && (
              <button
                onClick={() => {
                  if (onOpenAdminLoans) {
                    onOpenAdminLoans();
                  } else {
                    onNavigateTab('admin');
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
                title="Manage loan cards & update affiliate links in Admin Panel"
              >
                <Settings className="w-4 h-4" />
                <span>Manage Links in Admin</span>
              </button>
            )}

            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 flex items-center justify-center gap-2 cursor-pointer transition-colors backdrop-blur-xs"
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>{showCalculator ? 'Hide EMI Calculator' : 'Open EMI Calculator'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Loan EMI Calculator (Collapsible) */}
      {showCalculator && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm animate-in fade-in duration-200 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Loan EMI Calculator (ইএমআই ক্যালকুলেটর)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Estimate your monthly repayment installment before applying
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCalculator(false)}
              className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-0.5 cursor-pointer"
            >
              <span>Close</span>
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Inputs */}
            <div className="lg:col-span-7 space-y-4">
              {/* 1. Loan Amount */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs font-semibold gap-2">
                  <span className="text-slate-700">Required Loan Amount (ঋণের পরিমাণ):</span>
                  <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min={5000}
                      max={5000000}
                      step={5000}
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(Math.max(0, Number(e.target.value)))}
                      className="w-24 sm:w-28 font-mono font-black text-emerald-700 text-xs sm:text-sm text-right outline-none bg-transparent"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={1500000}
                  step={5000}
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>₹10,000</span>
                  <span>₹5,00,000</span>
                  <span>₹15,00,000</span>
                </div>
              </div>

              {/* 2. Interest Rate */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs font-semibold gap-2">
                  <span className="text-slate-700">Annual Interest Rate (সুদের হার % p.a.):</span>
                  <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                    <input
                      type="number"
                      min={1}
                      max={40}
                      step={0.1}
                      value={calcInterest}
                      onChange={(e) => setCalcInterest(Math.max(0, Number(e.target.value)))}
                      className="w-16 font-mono font-black text-slate-900 text-xs sm:text-sm text-right outline-none bg-transparent"
                    />
                    <span className="text-slate-400 font-bold text-xs">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={8}
                  max={28}
                  step={0.5}
                  value={calcInterest}
                  onChange={(e) => setCalcInterest(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>8% (Low)</span>
                  <span>14% (Standard)</span>
                  <span>28% (Micro)</span>
                </div>
              </div>

              {/* 3. Tenure in Months */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs font-semibold gap-2">
                  <span className="text-slate-700">Loan Tenure (মেয়াদ):</span>
                  <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                    <input
                      type="number"
                      min={1}
                      max={120}
                      step={1}
                      value={calcTenureMonths}
                      onChange={(e) => setCalcTenureMonths(Math.max(1, Number(e.target.value)))}
                      className="w-14 font-mono font-black text-slate-900 text-xs sm:text-sm text-right outline-none bg-transparent"
                    />
                    <span className="text-slate-400 font-bold text-[11px]">Mo</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={3}
                  max={84}
                  step={3}
                  value={calcTenureMonths}
                  onChange={(e) => setCalcTenureMonths(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>3 Months</span>
                  <span>24 Months (2 Yrs)</span>
                  <span>84 Months (7 Yrs)</span>
                </div>
              </div>
            </div>

            {/* Right Output Panel */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-emerald-950 rounded-2xl p-4 sm:p-5 text-white flex flex-col justify-between shadow-md">
              <div className="space-y-3">
                <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">
                  Estimated Monthly Installment
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                  ₹{monthlyEmi.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-300">/ month</span>
                </div>

                <div className="pt-3 border-t border-slate-700/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Principal Amount:</span>
                    <span className="font-mono font-semibold text-white">₹{calcAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Total Interest Payable:</span>
                    <span className="font-mono font-semibold text-amber-300">₹{totalInterest.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                    <span className="font-bold text-white">Total Repayment:</span>
                    <span className="font-mono font-bold text-emerald-400">₹{totalPayment.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 mt-4 leading-tight">
                *Final EMI and rate depends on candidate credit bureau score, repayment capacity, and lender evaluation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEARCH BAR & FILTER CONTROLS */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        {/* Main Search Input & Sort Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Bar Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-emerald-600" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by loan name (e.g. Instant, MSME, Bike, Gold) or max amount..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-full md:w-auto">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
                <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px] text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="default">Featured / Recommended</option>
                  <option value="amount-desc">Max Amount: High to Low</option>
                  <option value="amount-asc">Max Amount: Low to High</option>
                  <option value="fastest">Fastest Disbursal</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Search Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Tag className="w-3 h-3 text-emerald-600" />
            <span>Popular:</span>
          </span>
          {POPULAR_SEARCH_KEYWORDS.map((kw) => (
            <button
              key={kw}
              type="button"
              onClick={() => setSearchQuery(kw)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                searchQuery.toLowerCase() === kw.toLowerCase()
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {kw}
            </button>
          ))}
        </div>

        {/* Filter Chip Section 1: Maximum Amount Range (Core Requirement) */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">
                Filter by Maximum Amount Range (সর্বোচ্চ ঋণের সীমা)
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
              Select loan ceiling limit
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {AMOUNT_RANGES.map((range) => {
              const isSelected = selectedAmountRange === range.id;
              const count = getAmountRangeCount(range.id);
              return (
                <button
                  key={range.id}
                  onClick={() => setSelectedAmountRange(range.id)}
                  className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shrink-0 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500/30'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                  }`}
                >
                  <span>{range.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Chip Section 2: Category Filter Chips */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">
                Filter by Category (ঋণের ধরণ)
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
              Personal, MSME, Micro, Vehicle, Gold
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = getCategoryCount(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected
                        ? 'bg-white/20 text-white font-bold'
                        : 'bg-slate-100 text-slate-500 font-semibold'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filters Bar & Reset Summary */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-700">
              Showing <span className="text-emerald-700 font-black">{filteredLoans.length}</span> of {activeLoans.length} Verified Loans
            </span>

            {/* Badges for active filters */}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                <span>Keyword: "{searchQuery}"</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-emerald-950 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            )}

            {selectedAmountRange !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                <span>Amount: {AMOUNT_RANGES.find(r => r.id === selectedAmountRange)?.badge}</span>
                <button
                  onClick={() => setSelectedAmountRange('all')}
                  className="hover:text-emerald-950 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            )}

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200">
                <span>Category: {CATEGORIES.find(c => c.id === selectedCategory)?.label}</span>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="hover:text-slate-950 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters (সব ফিল্টার মুছুন)</span>
            </button>
          )}
        </div>
      </div>

      {/* Loan Cards Grid */}
      {filteredLoans.length === 0 ? (
        <div className="p-10 sm:p-14 text-center bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-slate-900 text-base sm:text-lg">
              No loan services found matching your criteria
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              কোনো ঋণ সেবা খুঁজে পাওয়া যায়নি। সার্চ কিওয়ার্ড পরিবর্তন করুন অথবা সর্বোচ্চ ঋণের সীমা ফিল্টার রিসেট করুন।
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters & Show All Loans</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLoans.map((loan) => (
            <div
              key={loan.id}
              className={`bg-white rounded-3xl border transition-all duration-200 hover:shadow-lg flex flex-col justify-between overflow-hidden ${
                loan.isActive ? 'border-slate-200/90 shadow-sm' : 'border-dashed border-slate-300 opacity-75'
              }`}
            >
              {/* Card Header & Badge */}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-xs">
                      <CreditCard className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {loan.category.toUpperCase()} LOAN
                      </span>
                      <span className="text-xs font-semibold text-slate-600 truncate block max-w-[140px]">
                        {loan.provider || 'Masud Digital Hub Partner'}
                      </span>
                    </div>
                  </div>

                  {loan.badge && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-[10px] border border-emerald-200 flex items-center gap-1 shrink-0">
                      <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
                      <span>{loan.badge}</span>
                    </span>
                  )}
                </div>

                {/* Loan Title & Bengali */}
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                    {loan.name}
                  </h3>
                  {loan.nameBengali && (
                    <p className="text-xs font-medium text-emerald-800 mt-0.5">
                      {loan.nameBengali}
                    </p>
                  )}
                </div>

                {/* Maximum Amount Highlight Box (Core Requirement) */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50/60 rounded-2xl p-3 border border-emerald-200/80">
                  <span className="text-[10px] font-bold uppercase text-emerald-900 tracking-wider block">
                    Maximum Loan Amount (সর্বোচ্চ ঋণ)
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-800 tracking-tight font-mono mt-0.5">
                    {loan.maxAmount}
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-3 gap-2 text-center py-1">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[9px] text-slate-400 block font-semibold">Interest Rate</span>
                    <span className="text-[11px] font-bold text-slate-800 block truncate">
                      {loan.interestRate || 'Low Rate'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[9px] text-slate-400 block font-semibold">Tenure</span>
                    <span className="text-[11px] font-bold text-slate-800 block truncate">
                      {loan.tenure || 'Flexible'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[9px] text-slate-400 block font-semibold">Disbursal</span>
                    <span className="text-[11px] font-bold text-slate-800 block truncate">
                      {loan.processingTime || 'Fast'}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                {loan.features && loan.features.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {loan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Apply Now Button (Core Requirement) */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => handleApplyNow(loan)}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Apply Now (এখনই আবেদন করুন)</span>
                  <ExternalLink className="w-4 h-4 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <span className="truncate">Opens partner application</span>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (onOpenAdminLoans) {
                          onOpenAdminLoans();
                        } else {
                          onNavigateTab('admin');
                        }
                      }}
                      className="text-amber-700 hover:underline font-bold cursor-pointer shrink-0"
                    >
                      Edit Link (Admin)
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Information & Safety Notice */}
      <div className="bg-amber-50/70 rounded-3xl p-5 border border-amber-200/80 space-y-2">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Security & Transparency Notice (নিরাপত্তা নির্দেশিকা)</span>
        </div>
        <p className="text-xs text-amber-800/90 leading-relaxed">
          Kaj Bandhu partners only with RBI registered Banks and NBFCs. We never ask for upfront loan processing cash or OTPs over WhatsApp or telephone. All interest rates, processing charges, and eligibility criteria are determined by the respective lending partner upon checking KYC documents.
        </p>
      </div>
    </div>
  );
};
