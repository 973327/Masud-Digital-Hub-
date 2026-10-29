export type BankName = 'HDFC' | 'SBI' | 'Axis' | 'ICICI' | 'Kotak' | 'IDFC First';

export type CardTier = 'Cashback' | 'Rewards' | 'Shopping' | 'Travel' | 'RuPay UPI' | 'Lifetime Free';

export type IncomeType = 'Salaried' | 'Self-Employed / Business' | 'Professional' | 'Student / Freelancer';

export type LeadStatus = 'Pending' | 'Verification' | 'Approved' | 'Rejected' | 'Disbursed';

export interface BankCreditCard {
  id: string;
  bank: BankName;
  cardName: string;
  joiningFee: number; // in ₹ (0 for lifetime free)
  annualFee: number;  // in ₹
  feeWaiverCondition: string; // e.g., "Waived on spends of ₹1,00,000/yr"
  retailerCommission: number; // in ₹ (retailer earnings per approved card)
  payoutTimeline: string;     // e.g., "Within 7-10 days of approval"
  cashbackHighlights: string[];
  welcomeBenefit: string;
  minIncomeRequired: number;  // ₹ per month
  recommendedFor: string;
  cardTier: CardTier;
  cardColorGradient: string; // CSS linear-gradient for 3D card display
  network: 'Visa' | 'Mastercard' | 'RuPay';
  rupayUpiSupported?: boolean;
  applyUrl?: string;
  bulletPoints: string[];
}

export interface CreditCardLead {
  id: string; // e.g. "LEAD-2026-101"
  customerName: string;
  customerMobile: string;
  panNumber: string;
  incomeType: IncomeType;
  monthlyIncome: number;
  cardId: string;
  cardName: string;
  bank: BankName;
  retailerCommission: number;
  status: LeadStatus;
  submissionDate: string; // ISO
  updatedAt: string;     // ISO
  notes?: string;
  appliedVia: 'Retailer Counter' | 'Customer WhatsApp Link';
  trackingNumber?: string;
}

export interface RetailerCommissionSummary {
  totalLeads: number;
  pendingLeads: number;
  approvedLeads: number;
  rejectedLeads: number;
  totalEarnedCommission: number;
  pipelineCommission: number;
}
