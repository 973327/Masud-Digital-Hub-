import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  IndianRupee, 
  Send, 
  Share2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Plus, 
  TrendingUp, 
  ShieldCheck, 
  Gift, 
  Sparkles, 
  ArrowRight, 
  ExternalLink, 
  Phone, 
  Copy, 
  Check, 
  X, 
  Building2, 
  FileText, 
  UserCheck, 
  QrCode, 
  Eye, 
  Trash2,
  Calendar,
  Zap,
  Info
} from 'lucide-react';
import { BankCreditCard, CreditCardLead, BankName, LeadStatus, IncomeType } from '../../types/creditCard';
import { 
  BANK_CARDS, 
  getStoredLeads, 
  addCreditCardLead, 
  updateLeadStatus, 
  deleteLead, 
  calculateRetailerCommissionSummary,
  generateWhatsAppShareText 
} from '../../services/creditCardStorage';

export const CreditCardHub: React.FC = () => {
  // Navigation tabs within Credit Card Hub
  const [activeTab, setActiveTab] = useState<'cards' | 'leads' | 'apply'>('cards');
  const [leads, setLeads] = useState<CreditCardLead[]>(() => getStoredLeads());

  // Filter bank cards
  const [selectedBankFilter, setSelectedBankFilter] = useState<'all' | BankName | 'lifetime_free'>('all');
  const [cardSearchQuery, setCardSearchQuery] = useState<string>('');

  // Modals state
  const [selectedCardForApply, setSelectedCardForApply] = useState<BankCreditCard | null>(null);
  const [shareCardModal, setShareCardModal] = useState<BankCreditCard | null>(null);
  const [cardDetailsModal, setCardDetailsModal] = useState<BankCreditCard | null>(null);
  const [statusUpdateModalLead, setStatusUpdateModalLead] = useState<CreditCardLead | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // Lead Dashboard state
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | LeadStatus>('all');
  const [leadSearchQuery, setLeadSearchQuery] = useState<string>('');

  // Quick Application Form State
  const [formCustomerName, setFormCustomerName] = useState<string>('');
  const [formMobile, setFormMobile] = useState<string>('');
  const [formPan, setFormPan] = useState<string>('');
  const [formIncomeType, setFormIncomeType] = useState<IncomeType>('Salaried');
  const [formMonthlyIncome, setFormMonthlyIncome] = useState<string>('35000');
  const [formSelectedCardId, setFormSelectedCardId] = useState<string>(BANK_CARDS[0].id);
  const [formNotes, setFormNotes] = useState<string>('');
  const [formSubmittedLead, setFormSubmittedLead] = useState<CreditCardLead | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // WhatsApp share custom mobile input
  const [customShareMobile, setCustomShareMobile] = useState<string>('');

  // Summary calculation
  const summary = useMemo(() => calculateRetailerCommissionSummary(leads), [leads]);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return BANK_CARDS.filter(card => {
      if (selectedBankFilter === 'lifetime_free') {
        if (card.annualFee > 0) return false;
      } else if (selectedBankFilter !== 'all') {
        if (card.bank !== selectedBankFilter) return false;
      }

      if (cardSearchQuery.trim()) {
        const q = cardSearchQuery.toLowerCase();
        const matchName = card.cardName.toLowerCase().includes(q);
        const matchBank = card.bank.toLowerCase().includes(q);
        const matchBenefits = card.cashbackHighlights.some(b => b.toLowerCase().includes(q));
        return matchName || matchBank || matchBenefits;
      }

      return true;
    });
  }, [selectedBankFilter, cardSearchQuery]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (leadStatusFilter !== 'all' && lead.status !== leadStatusFilter) return false;

      if (leadSearchQuery.trim()) {
        const q = leadSearchQuery.toLowerCase();
        const matchName = lead.customerName.toLowerCase().includes(q);
        const matchMobile = lead.customerMobile.includes(q);
        const matchId = lead.id.toLowerCase().includes(q);
        const matchPan = lead.panNumber.toLowerCase().includes(q);
        return matchName || matchMobile || matchId || matchPan;
      }

      return true;
    });
  }, [leads, leadStatusFilter, leadSearchQuery]);

  // Handle Form Submit
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validations
    if (!formCustomerName.trim()) {
      setFormError('Please enter customer full name.');
      return;
    }
    const cleanMobile = formMobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    const cleanPan = formPan.trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(cleanPan)) {
      setFormError('Please enter a valid 10-character PAN number (e.g. ABCDE1234F).');
      return;
    }
    const incomeNum = parseInt(formMonthlyIncome, 10) || 0;
    if (incomeNum <= 0) {
      setFormError('Please enter a valid monthly income.');
      return;
    }

    const card = BANK_CARDS.find(c => c.id === formSelectedCardId) || BANK_CARDS[0];

    const newLead = addCreditCardLead({
      customerName: formCustomerName.trim(),
      customerMobile: cleanMobile,
      panNumber: cleanPan,
      incomeType: formIncomeType,
      monthlyIncome: incomeNum,
      cardId: card.id,
      cardName: card.cardName,
      bank: card.bank,
      retailerCommission: card.retailerCommission,
      appliedVia: 'Retailer Counter',
      notes: formNotes.trim() || undefined
    });

    setLeads(getStoredLeads());
    setFormSubmittedLead(newLead);
    setSelectedCardForApply(null);

    // Reset fields
    setFormCustomerName('');
    setFormMobile('');
    setFormPan('');
    setFormNotes('');
  };

  const handleUpdateStatus = (leadId: string, newStatus: LeadStatus, note?: string) => {
    const updated = updateLeadStatus(leadId, newStatus, note);
    setLeads(updated);
    setStatusUpdateModalLead(null);
  };

  const handleDeleteLead = (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this lead record?')) {
      const updated = deleteLead(leadId);
      setLeads(updated);
    }
  };

  const openApplyForCard = (card: BankCreditCard) => {
    setSelectedCardForApply(card);
    setFormSelectedCardId(card.id);
  };

  const openShareModal = (card: BankCreditCard) => {
    setShareCardModal(card);
    setCustomShareMobile('');
    setCopiedSuccess(false);
  };

  const triggerDirectWhatsApp = (card: BankCreditCard, targetMobile?: string) => {
    const text = generateWhatsAppShareText(card, 'Masud Digital Hub');
    const encoded = encodeURIComponent(text);
    if (targetMobile && targetMobile.replace(/[^0-9]/g, '').length === 10) {
      window.open(`https://wa.me/91${targetMobile.replace(/[^0-9]/g, '')}?text=${encoded}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & RETAILER COMMISSION DASHBOARD SUMMARY */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-7 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 rounded-3xl text-white shadow-xl relative overflow-hidden border border-amber-500/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                Fintech Retailer Hub
              </span>
              <span className="text-white/40">•</span>
              <span className="text-xs text-slate-300">HDFC • SBI • Axis Bank Official Partner</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Credit Card Hub & Commission Portal</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Issue high-approval credit cards for your cyber cafe customers. Earn up to <strong>₹2,400 commission</strong> per approved card with zero upfront investment.
            </p>
          </div>

          {/* Quick Apply CTA */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setSelectedCardForApply(BANK_CARDS[0]);
                setFormSelectedCardId(BANK_CARDS[0].id);
                setActiveTab('apply');
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl text-xs shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Apply New Lead</span>
            </button>
          </div>
        </div>

        {/* Retailer Commission Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/80">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] text-slate-400 font-medium block">Total Leads</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">{summary.totalLeads}</span>
              <span className="text-[10px] text-slate-400">submitted</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 backdrop-blur-xs">
            <span className="text-[11px] text-emerald-300 font-medium block">Approved Cards</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-emerald-400">{summary.approvedLeads}</span>
              <span className="text-[10px] text-emerald-300">verified</span>
            </div>
          </div>

          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 backdrop-blur-xs">
            <span className="text-[11px] text-amber-300 font-medium block">Earned Payout</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-amber-400">₹{summary.totalEarnedCommission.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 backdrop-blur-xs">
            <span className="text-[11px] text-blue-300 font-medium block">Pipeline Payout</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-blue-400">₹{summary.pipelineCommission.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-400">in process</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-fit">
        <button
          onClick={() => setActiveTab('cards')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'cards'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4 text-amber-400" />
          <span>Bank Card Catalog ({BANK_CARDS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'leads'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-500" />
          <span>Real-time Lead Dashboard ({leads.length})</span>
        </button>

        <button
          onClick={() => {
            setSelectedCardForApply(BANK_CARDS[0]);
            setFormSelectedCardId(BANK_CARDS[0].id);
            setActiveTab('apply');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'apply'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Plus className="w-4 h-4 text-blue-500" />
          <span>New Lead Form</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: BANK CARD LIST & COMMISSION DISPLAY */}
      {/* ========================================================================= */}
      {activeTab === 'cards' && (
        <div className="space-y-5">
          {/* Bank Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All Banks' },
                { id: 'HDFC', label: 'HDFC Bank' },
                { id: 'SBI', label: 'SBI Card' },
                { id: 'Axis', label: 'Axis Bank' },
                { id: 'ICICI', label: 'ICICI Bank' },
                { id: 'IDFC First', label: 'RuPay UPI' },
                { id: 'lifetime_free', label: 'Lifetime Free' }
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBankFilter(b.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedBankFilter === b.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={cardSearchQuery}
                onChange={(e) => setCardSearchQuery(e.target.value)}
                placeholder="Search card, cashback, benefit..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Card Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-amber-400 hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Visual Credit Card Preview Plaque */}
                  <div
                    style={{ background: card.cardColorGradient }}
                    className="p-5 text-white relative flex flex-col justify-between h-44 rounded-t-3xl shadow-inner select-none overflow-hidden"
                  >
                    {/* Background subtle geometric rings */}
                    <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full border border-white/10 pointer-events-none" />
                    <div className="absolute right-6 -top-6 w-24 h-24 rounded-full border border-white/10 pointer-events-none" />

                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-amber-300" />
                        <span className="font-extrabold text-xs tracking-wider uppercase text-amber-200">
                          {card.bank} BANK
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20">
                        {card.network}
                      </span>
                    </div>

                    {/* Chip & Contactless */}
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="w-9 h-7 rounded-md bg-amber-300/80 border border-amber-200/90 flex items-center justify-center shadow-xs">
                        <div className="w-6 h-4 border border-amber-600/40 rounded-xs" />
                      </div>
                      <div className="text-[10px] font-mono tracking-widest text-white/70">
                        •••• •••• •••• 8820
                      </div>
                    </div>

                    <div className="relative z-10 flex items-end justify-between">
                      <div>
                        <h3 className="font-black text-sm text-white tracking-wide leading-tight drop-shadow-xs">
                          {card.cardName}
                        </h3>
                        <span className="text-[10px] text-white/70 block mt-0.5">
                          {card.recommendedFor}
                        </span>
                      </div>
                      {card.rupayUpiSupported && (
                        <span className="text-[10px] font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded">
                          UPI Enabled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Commission Bar */}
                  <div className="p-4 bg-amber-50/80 border-b border-amber-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Retailer Earning</span>
                      <div className="flex items-center gap-1 text-emerald-700 font-black text-lg leading-tight">
                        <IndianRupee className="w-4 h-4" />
                        <span>{card.retailerCommission.toLocaleString('en-IN')}</span>
                        <span className="text-[11px] font-bold text-emerald-600">/ approved</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Annual Fee</span>
                      <span className="text-xs font-bold text-slate-900">
                        {card.annualFee === 0 ? (
                          <span className="text-emerald-700 font-extrabold">Lifetime Free</span>
                        ) : (
                          `₹${card.annualFee}/yr`
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Key Cashback Benefits */}
                  <div className="p-4 space-y-2.5">
                    <span className="text-xs font-extrabold text-slate-900 block">
                      Top Benefits & Cashbacks:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {card.cashbackHighlights.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Welcome Gift */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center gap-2 text-xs text-slate-700 mt-2">
                      <Gift className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="leading-tight">
                        <strong>Welcome Gift:</strong> {card.welcomeBenefit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => openApplyForCard(card)}
                    className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  >
                    <span>Apply Lead</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>

                  <button
                    onClick={() => openShareModal(card)}
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    title="Share direct WhatsApp application link"
                  >
                    <Send className="w-4 h-4 text-emerald-600" />
                  </button>

                  <button
                    onClick={() => setCardDetailsModal(card)}
                    className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    title="View Eligibility Details"
                  >
                    <Info className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: REAL-TIME LEAD TRACKING STATUS DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          {/* Status Filter Pills & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(['all', 'Pending', 'Verification', 'Approved', 'Rejected', 'Disbursed'] as const).map((st) => {
                const count = st === 'all' ? leads.length : leads.filter(l => l.status === st).length;
                return (
                  <button
                    key={st}
                    onClick={() => setLeadStatusFilter(st)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      leadStatusFilter === st
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{st === 'all' ? 'All Leads' : st}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/80 text-slate-800">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={leadSearchQuery}
                onChange={(e) => setLeadSearchQuery(e.target.value)}
                placeholder="Search by name, mobile, PAN, ID..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Leads Table / Cards */}
          {filteredLeads.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <Clock className="w-12 h-12 text-slate-300 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">No customer leads found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {leadSearchQuery
                    ? `No application matches "${leadSearchQuery}".`
                    : 'Submit customer applications using the "New Lead Form" to track real-time approval status.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedCardForApply(BANK_CARDS[0]);
                  setActiveTab('apply');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Lead Now</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Lead ID & Date</th>
                      <th className="py-3 px-4">Customer Details</th>
                      <th className="py-3 px-4">Bank & Card Applied</th>
                      <th className="py-3 px-4">Retailer Commission</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredLeads.map((lead) => {
                      const isApproved = lead.status === 'Approved' || lead.status === 'Disbursed';
                      const isPending = lead.status === 'Pending' || lead.status === 'Verification';
                      const isRejected = lead.status === 'Rejected';

                      return (
                        <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Lead ID & Date */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900 block">{lead.id}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(lead.submissionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </td>

                          {/* Customer Details */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">{lead.customerName}</span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span>📱 {lead.customerMobile}</span>
                              <span>•</span>
                              <span className="font-mono text-slate-600 font-bold">{lead.panNumber}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {lead.incomeType} • ₹{lead.monthlyIncome.toLocaleString('en-IN')}/mo
                            </span>
                          </td>

                          {/* Bank & Card */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">{lead.cardName}</span>
                            <span className="text-[10px] font-semibold text-slate-500">
                              Bank: {lead.bank} • Ref: {lead.trackingNumber || 'Pending'}
                            </span>
                          </td>

                          {/* Retailer Commission */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1 font-bold text-emerald-700">
                              <IndianRupee className="w-3.5 h-3.5" />
                              <span className="text-sm font-black">{lead.retailerCommission.toLocaleString('en-IN')}</span>
                            </div>
                            <span className={`text-[10px] font-semibold ${isApproved ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                              {isApproved ? '✓ Payout Ready' : 'Pending Approval'}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : isRejected
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-emerald-600' : isRejected ? 'bg-rose-600' : 'bg-amber-600 animate-pulse'}`} />
                              <span>{lead.status}</span>
                            </span>
                            {lead.notes && (
                              <p className="text-[10px] text-slate-500 mt-1 max-w-xs truncate" title={lead.notes}>
                                {lead.notes}
                              </p>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Direct WhatsApp Follow-up */}
                              <a
                                href={`https://wa.me/91${lead.customerMobile}?text=${encodeURIComponent(
                                  `Namaskar ${lead.customerName}! Your application for ${lead.cardName} (Lead ID: ${lead.id}) is currently in status: *${lead.status}*. We are tracking your bank approval.`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                                title="WhatsApp Customer Follow-up"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </a>

                              {/* Update Status Dropdown Trigger */}
                              <button
                                onClick={() => setStatusUpdateModalLead(lead)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                title="Update Bank Status"
                              >
                                Update
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteLead(lead.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                                title="Delete Lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: QUICK LEAD APPLICATION FORM */}
      {/* ========================================================================= */}
      {activeTab === 'apply' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-500" />
              <span>Quick Credit Card Lead Application Form</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter customer details for instant bank processing & commission registration.
            </p>
          </div>

          {formSubmittedLead && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <span className="font-bold text-emerald-900 block text-sm">
                  Lead Registered Successfully!
                </span>
                <p className="text-emerald-700 mt-0.5">
                  Lead ID <strong>{formSubmittedLead.id}</strong> created for <strong>{formSubmittedLead.customerName}</strong>. Expected commission: <strong>₹{formSubmittedLead.retailerCommission}</strong> upon bank approval.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold"
                  >
                    View in Dashboard
                  </button>
                  <button
                    onClick={() => setFormSubmittedLead(null)}
                    className="px-3 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg font-bold"
                  >
                    Apply Another Customer
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleApplySubmit} className="space-y-4">
            {/* Selected Card Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Select Credit Card & Bank</label>
              <select
                value={formSelectedCardId}
                onChange={(e) => setFormSelectedCardId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
              >
                {BANK_CARDS.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.bank} - {c.cardName} (Retailer Earning: ₹{c.retailerCommission})
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Name & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Customer Full Name (as per PAN)</label>
                <input
                  type="text"
                  required
                  value={formCustomerName}
                  onChange={(e) => setFormCustomerName(e.target.value)}
                  placeholder="e.g. Subir Karmakar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">10-Digit Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="98XXXXXXXX"
                    className="w-full pl-11 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* PAN Card & Income Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Customer PAN Card Number</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={formPan}
                  onChange={(e) => setFormPan(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Income Type</label>
                <select
                  value={formIncomeType}
                  onChange={(e) => setFormIncomeType(e.target.value as IncomeType)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="Salaried">Salaried (Private / Govt Employee)</option>
                  <option value="Self-Employed / Business">Self-Employed / Shop Owner / Business</option>
                  <option value="Professional">Professional (Doctor, CA, Lawyer, Engineer)</option>
                  <option value="Student / Freelancer">Student / Freelancer / Others</option>
                </select>
              </div>
            </div>

            {/* Monthly Income & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Approx. Monthly Income (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formMonthlyIncome}
                  onChange={(e) => setFormMonthlyIncome(e.target.value)}
                  placeholder="35000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Internal Shop Notes (Optional)</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Existing salary account in HDFC"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Retailer Earning Highlight Box */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-800 block">Your Earning on this Lead</span>
                <span className="text-xs text-slate-600">Credited to your retailer wallet upon bank card approval</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-700 font-black text-xl">
                <IndianRupee className="w-5 h-5" />
                <span>
                  {(BANK_CARDS.find(c => c.id === formSelectedCardId)?.retailerCommission || 2000).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <Check className="w-4 h-4 text-amber-400 stroke-[3]" />
              <span>Submit Application & Register Lead</span>
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODALS (SHARE ON WHATSAPP & STATUS UPDATER) */}
      {/* ========================================================================= */}

      {/* WhatsApp Share Generator Modal */}
      {shareCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/70">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Share Customer Self-Apply Link</h3>
                  <p className="text-[11px] text-slate-500">{shareCardModal.cardName}</p>
                </div>
              </div>
              <button
                onClick={() => setShareCardModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Send directly to Customer WhatsApp Number (Optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={customShareMobile}
                    onChange={(e) => setCustomShareMobile(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="98XXXXXXXX (Leave blank to choose from WhatsApp chat)"
                    className="w-full pl-11 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Message Preview Box */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700">Pre-Formatted WhatsApp Message Preview:</span>
                <div className="p-3 bg-emerald-50/40 rounded-2xl border border-emerald-200/80 font-mono text-[11px] text-slate-800 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                  {generateWhatsAppShareText(shareCardModal, 'Masud Digital Hub')}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => triggerDirectWhatsApp(shareCardModal, customShareMobile)}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Send on WhatsApp</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateWhatsAppShareText(shareCardModal, 'Masud Digital Hub'));
                    setCopiedSuccess(true);
                    setTimeout(() => setCopiedSuccess(false), 2000);
                  }}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSuccess ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Details & Eligibility Modal */}
      {cardDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{cardDetailsModal.cardName}</h3>
                <span className="text-[11px] text-slate-500 font-semibold">{cardDetailsModal.bank} Bank Official Specifications</span>
              </div>
              <button
                onClick={() => setCardDetailsModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Joining Fee</span>
                  <span className="font-bold text-slate-900">
                    {cardDetailsModal.joiningFee === 0 ? 'Nil (Free)' : `₹${cardDetailsModal.joiningFee}`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Annual Fee</span>
                  <span className="font-bold text-slate-900">
                    {cardDetailsModal.annualFee === 0 ? 'Lifetime Free' : `₹${cardDetailsModal.annualFee}`}
                  </span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Fee Waiver Rule</span>
                  <span className="text-[11px] text-slate-700">{cardDetailsModal.feeWaiverCondition}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Key Features & Rewards:</span>
                <ul className="space-y-1.5">
                  {cardDetailsModal.bulletPoints.map((bp, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Retailer Commission</span>
                  <span className="text-[11px] text-slate-600">{cardDetailsModal.payoutTimeline}</span>
                </div>
                <span className="text-lg font-black text-emerald-700">₹{cardDetailsModal.retailerCommission}</span>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setCardDetailsModal(null)}
                className="px-3.5 py-1.5 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const card = cardDetailsModal;
                  setCardDetailsModal(null);
                  openApplyForCard(card);
                  setActiveTab('apply');
                }}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <span>Apply for Customer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Status Updater Modal */}
      {statusUpdateModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Update Lead Progress</h3>
                <span className="text-[11px] text-slate-500 font-mono">{statusUpdateModalLead.id} • {statusUpdateModalLead.customerName}</span>
              </div>
              <button
                onClick={() => setStatusUpdateModalLead(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Select Current Bank Status:</span>
              {(['Pending', 'Verification', 'Approved', 'Rejected', 'Disbursed'] as LeadStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleUpdateStatus(statusUpdateModalLead.id, st)}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between border transition-colors cursor-pointer ${
                    statusUpdateModalLead.status === st
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <span>{st}</span>
                  {statusUpdateModalLead.status === st && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
