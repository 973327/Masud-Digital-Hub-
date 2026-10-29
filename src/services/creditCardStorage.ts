import { BankCreditCard, CreditCardLead, RetailerCommissionSummary, LeadStatus } from '../types/creditCard';

export const BANK_CARDS: BankCreditCard[] = [
  // 1. HDFC Bank
  {
    id: 'hdfc_millennia',
    bank: 'HDFC',
    cardName: 'HDFC Millennia Credit Card',
    joiningFee: 1000,
    annualFee: 1000,
    feeWaiverCondition: 'Waived on spending ₹1,00,000 in a calendar year',
    retailerCommission: 2200,
    payoutTimeline: 'Within 7 working days of bank card approval',
    cashbackHighlights: [
      '5% Cashback on Amazon, Flipkart, Swiggy, Zomato & Myntra',
      '1% Cashback on all other retail transactions & fuel',
      '8 Complimentary Domestic Airport Lounge access per year'
    ],
    welcomeBenefit: '1,000 CashPoints upon fee realization',
    minIncomeRequired: 35000,
    recommendedFor: 'Best all-rounder for online shopping & daily spends',
    cardTier: 'Cashback',
    cardColorGradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    network: 'Visa',
    rupayUpiSupported: false,
    bulletPoints: [
      'CashPoints can be redeemed directly against statement balance (1 CP = ₹1)',
      '1% Fuel Surcharge Waiver up to ₹250/month',
      'Contactless NFC tap-to-pay technology'
    ]
  },
  {
    id: 'hdfc_swiggy',
    bank: 'HDFC',
    cardName: 'Swiggy HDFC Bank Credit Card',
    joiningFee: 500,
    annualFee: 500,
    feeWaiverCondition: 'Waived on spends of ₹2,00,000 in a year',
    retailerCommission: 1900,
    payoutTimeline: 'Within 5-7 days after physical card dispatch',
    cashbackHighlights: [
      '10% Instant Cashback on Swiggy (Food, Instamart & Dineout)',
      '5% Cashback on top 1,000+ online shopping partner platforms',
      '1% Cashback on other spends'
    ],
    welcomeBenefit: 'Complimentary 3-Month Swiggy One Membership',
    minIncomeRequired: 25000,
    recommendedFor: 'Food lovers, grocery ordering & instant deliveries',
    cardTier: 'Cashback',
    cardColorGradient: 'linear-gradient(135deg, #fc8019 0%, #d85a00 100%)',
    network: 'Mastercard',
    rupayUpiSupported: false,
    bulletPoints: [
      'Direct monthly cashback credited to Swiggy Money',
      'Zero documentation digital video KYC process',
      'Low entry income requirement (₹25k/mo)'
    ]
  },

  // 2. SBI Card
  {
    id: 'sbi_cashback',
    bank: 'SBI',
    cardName: 'Cashback SBI Card',
    joiningFee: 999,
    annualFee: 999,
    feeWaiverCondition: 'Waived on spending ₹2,00,000 annually',
    retailerCommission: 2400,
    payoutTimeline: 'Within 7 days of approval & verification',
    cashbackHighlights: [
      'Flat 5% Cashback on ANY online merchant across India',
      '1% Unlimited Cashback on all offline POS purchases',
      'No merchant restrictions or coupon code requirements'
    ],
    welcomeBenefit: 'Auto statement credit within 2 days of bill generation',
    minIncomeRequired: 30000,
    recommendedFor: 'Highest unrestricted online cashback across all brands',
    cardTier: 'Cashback',
    cardColorGradient: 'linear-gradient(135deg, #004b91 0%, #002244 100%)',
    network: 'Visa',
    rupayUpiSupported: false,
    bulletPoints: [
      'Cashback automatically credited to card statement next month',
      'Universal acceptance across all online websites',
      '1% Fuel surcharge waiver at all petrol pumps'
    ]
  },
  {
    id: 'sbi_simplyclick',
    bank: 'SBI',
    cardName: 'SBI SimplyCLICK Credit Card',
    joiningFee: 499,
    annualFee: 499,
    feeWaiverCondition: 'Waived on spending ₹1,00,000 in a year',
    retailerCommission: 1800,
    payoutTimeline: 'Within 5-7 days of digital application confirmation',
    cashbackHighlights: [
      '10X Reward Points on Amazon, BookMyShow, Cleartrip, Netmeds',
      '5X Reward Points on all other online spends',
      '1 Reward Point per ₹100 spent offline'
    ],
    welcomeBenefit: '₹500 Amazon Gift Voucher on annual fee payment',
    minIncomeRequired: 20000,
    recommendedFor: 'First-time credit card applicants & starter budget',
    cardTier: 'Rewards',
    cardColorGradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    network: 'Visa',
    rupayUpiSupported: false,
    bulletPoints: [
      'Instant ₹500 e-voucher covers the first year fee',
      'Easy approval rate for young salaried professionals',
      'E-voucher rewards on reaching annual spend milestones'
    ]
  },

  // 3. Axis Bank
  {
    id: 'axis_ace',
    bank: 'Axis',
    cardName: 'Axis Bank ACE Credit Card',
    joiningFee: 499,
    annualFee: 499,
    feeWaiverCondition: 'Waived on annual spends exceeding ₹2,00,000',
    retailerCommission: 2100,
    payoutTimeline: 'Within 7-10 days of successful KYC completion',
    cashbackHighlights: [
      '5% Cashback on Bill Payments (Electricity, DTH, Mobile) via Google Pay',
      '4% Cashback on Swiggy, Zomato & Ola Cabs',
      '2% Flat UNLIMITED Cashback on all other spends'
    ],
    welcomeBenefit: 'Joining fee reversed on spending ₹10,000 in 45 days',
    minIncomeRequired: 25000,
    recommendedFor: 'Best card for utility bill payments & daily rides',
    cardTier: 'Cashback',
    cardColorGradient: 'linear-gradient(135deg, #97144d 0%, #5d0c2f 100%)',
    network: 'Visa',
    rupayUpiSupported: false,
    bulletPoints: [
      'Direct monthly cashback without voucher conversions',
      '4 Free Domestic Airport Lounge visits every year',
      'Unlimited 2% offline and online flat cashback'
    ]
  },
  {
    id: 'axis_flipkart',
    bank: 'Axis',
    cardName: 'Flipkart Axis Bank Credit Card',
    joiningFee: 500,
    annualFee: 500,
    feeWaiverCondition: 'Waived on annual spends of ₹3,50,000',
    retailerCommission: 2000,
    payoutTimeline: 'Within 7 days of card verification',
    cashbackHighlights: [
      '5% Unlimited Cashback on Flipkart & Cleartrip',
      '4% Preferred Merchant Cashback on Uber, PVR, Swiggy, Cure.fit',
      '1.5% Unlimited Cashback on all other retail transactions'
    ],
    welcomeBenefit: '₹600 Flipkart voucher + ₹500 Myntra discount',
    minIncomeRequired: 25000,
    recommendedFor: 'Flipkart shoppers, frequent travelers & daily diners',
    cardTier: 'Shopping',
    cardColorGradient: 'linear-gradient(135deg, #2874f0 0%, #0c4399 100%)',
    network: 'Mastercard',
    rupayUpiSupported: false,
    bulletPoints: [
      'Zero upper cap on 5% Flipkart cashback',
      '4 Complimentary Domestic Lounge visits per year',
      'Direct cashback credit to statement'
    ]
  },

  // 4. ICICI Bank
  {
    id: 'icici_amazon_pay',
    bank: 'ICICI',
    cardName: 'Amazon Pay ICICI Credit Card',
    joiningFee: 0,
    annualFee: 0,
    feeWaiverCondition: 'Lifetime Free (Zero Annual Fees forever)',
    retailerCommission: 1750,
    payoutTimeline: 'Within 5-7 days of digital KYC confirmation',
    cashbackHighlights: [
      '5% Unlimited Cashback on Amazon India (for Prime members)',
      '3% Unlimited Cashback on Amazon (for non-Prime members)',
      '2% Cashback on 100+ Amazon Pay partner merchants (recharge, bills, Uber)'
    ],
    welcomeBenefit: '₹1,500 Amazon Pay gift voucher upon card activation',
    minIncomeRequired: 25000,
    recommendedFor: 'Lifetime Free card with zero maintenance charges',
    cardTier: 'Lifetime Free',
    cardColorGradient: 'linear-gradient(135deg, #f26522 0%, #a83c07 100%)',
    network: 'Visa',
    rupayUpiSupported: false,
    bulletPoints: [
      '100% Lifetime Free with no hidden charges',
      'Direct Amazon Pay Balance cashback credited each month',
      '1% fuel surcharge waiver across India'
    ]
  },

  // 5. IDFC First Bank (RuPay UPI)
  {
    id: 'idfc_first_wow',
    bank: 'IDFC First',
    cardName: 'IDFC FIRST WOW RuPay UPI Credit Card',
    joiningFee: 0,
    annualFee: 0,
    feeWaiverCondition: 'Lifetime Free (Zero Joining / Zero Annual Fee)',
    retailerCommission: 1600,
    payoutTimeline: 'Instant approval against fixed deposit (No income proof needed)',
    cashbackHighlights: [
      'Scan & Pay on ANY QR Code via Google Pay, PhonePe, Paytm (RuPay UPI)',
      '4X Reward Points that NEVER expire',
      'Zero Forex Markup fee on international transactions'
    ],
    welcomeBenefit: 'Zero income proof required (100% guaranteed approval)',
    minIncomeRequired: 0,
    recommendedFor: 'RuPay UPI payments at local shops + builds CIBIL score',
    cardTier: 'RuPay UPI',
    cardColorGradient: 'linear-gradient(135deg, #9b1c1c 0%, #4c0d0d 100%)',
    network: 'RuPay',
    rupayUpiSupported: true,
    bulletPoints: [
      'Links directly to UPI apps for merchant QR code scanning',
      'Builds & boosts CIBIL credit score from day 1',
      'Interest-free cash withdrawal from ATMs up to 48 days'
    ]
  }
];

const STORAGE_KEY_LEADS = 'docscan_credit_card_leads_v1';

const DEFAULT_SAMPLE_LEADS: CreditCardLead[] = [
  {
    id: 'LEAD-2026-101',
    customerName: 'Sourav Mondal',
    customerMobile: '9830214589',
    panNumber: 'BMYPM7892K',
    incomeType: 'Salaried',
    monthlyIncome: 45000,
    cardId: 'hdfc_millennia',
    cardName: 'HDFC Millennia Credit Card',
    bank: 'HDFC',
    retailerCommission: 2200,
    status: 'Approved',
    submissionDate: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    notes: 'Video KYC completed successfully. Physical card dispatched.',
    appliedVia: 'Retailer Counter',
    trackingNumber: 'HDFC-APP-894125'
  },
  {
    id: 'LEAD-2026-102',
    customerName: 'Priya Mukherjee',
    customerMobile: '9433128945',
    panNumber: 'CHZPM4512B',
    incomeType: 'Self-Employed / Business',
    monthlyIncome: 65000,
    cardId: 'sbi_cashback',
    cardName: 'Cashback SBI Card',
    bank: 'SBI',
    retailerCommission: 2400,
    status: 'Verification',
    submissionDate: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    notes: 'Address verification in progress by bank representative.',
    appliedVia: 'Retailer Counter',
    trackingNumber: 'SBI-REF-772910'
  },
  {
    id: 'LEAD-2026-103',
    customerName: 'Md. Tariqul Islam',
    customerMobile: '9734561230',
    panNumber: 'AQZPI9901M',
    incomeType: 'Salaried',
    monthlyIncome: 32000,
    cardId: 'axis_ace',
    cardName: 'Axis Bank ACE Credit Card',
    bank: 'Axis',
    retailerCommission: 2100,
    status: 'Pending',
    submissionDate: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    notes: 'Application received. Pending bank credit underwriting.',
    appliedVia: 'Customer WhatsApp Link',
    trackingNumber: 'AXIS-DIG-441029'
  }
];

export function getStoredLeads(): CreditCardLead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEADS);
    if (!raw) {
      saveStoredLeads(DEFAULT_SAMPLE_LEADS);
      return DEFAULT_SAMPLE_LEADS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load credit card leads:', err);
    return DEFAULT_SAMPLE_LEADS;
  }
}

export function saveStoredLeads(leads: CreditCardLead[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
  } catch (err) {
    console.error('Failed to save credit card leads:', err);
  }
}

export function generateLeadId(existingLeads: CreditCardLead[]): string {
  const currentYear = new Date().getFullYear();
  let maxSeq = 100;
  existingLeads.forEach(l => {
    const parts = l.id.split('-');
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  });
  return `LEAD-${currentYear}-${maxSeq + 1}`;
}

export function addCreditCardLead(newLeadData: Omit<CreditCardLead, 'id' | 'submissionDate' | 'updatedAt' | 'status'>): CreditCardLead {
  const currentLeads = getStoredLeads();
  const newLead: CreditCardLead = {
    ...newLeadData,
    id: generateLeadId(currentLeads),
    status: 'Pending',
    submissionDate: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    trackingNumber: `${newLeadData.bank.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`
  };

  const updated = [newLead, ...currentLeads];
  saveStoredLeads(updated);
  return newLead;
}

export function updateLeadStatus(leadId: string, status: LeadStatus, note?: string): CreditCardLead[] {
  const currentLeads = getStoredLeads();
  const updated = currentLeads.map(lead => {
    if (lead.id === leadId) {
      return {
        ...lead,
        status,
        updatedAt: new Date().toISOString(),
        notes: note !== undefined ? note : lead.notes
      };
    }
    return lead;
  });
  saveStoredLeads(updated);
  return updated;
}

export function deleteLead(leadId: string): CreditCardLead[] {
  const currentLeads = getStoredLeads();
  const updated = currentLeads.filter(l => l.id !== leadId);
  saveStoredLeads(updated);
  return updated;
}

export function calculateRetailerCommissionSummary(leads: CreditCardLead[]): RetailerCommissionSummary {
  let totalLeads = leads.length;
  let pendingLeads = 0;
  let approvedLeads = 0;
  let rejectedLeads = 0;
  let totalEarnedCommission = 0;
  let pipelineCommission = 0;

  leads.forEach(l => {
    if (l.status === 'Approved' || l.status === 'Disbursed') {
      approvedLeads++;
      totalEarnedCommission += (l.retailerCommission || 0);
    } else if (l.status === 'Pending' || l.status === 'Verification') {
      pendingLeads++;
      pipelineCommission += (l.retailerCommission || 0);
    } else if (l.status === 'Rejected') {
      rejectedLeads++;
    }
  });

  return {
    totalLeads,
    pendingLeads,
    approvedLeads,
    rejectedLeads,
    totalEarnedCommission,
    pipelineCommission
  };
}

/**
 * Format customized customer WhatsApp share text for self-application
 */
export function generateWhatsAppShareText(card: BankCreditCard, shopName: string = 'Digital Seva Kendra'): string {
  const annualFeeText = card.annualFee === 0 ? 'FREE for Life (Lifetime Free)' : `₹${card.annualFee}/year`;
  const benefitsBullet = card.cashbackHighlights.map(h => `• ${h}`).join('\n');

  return `🎉 *Special Credit Card Offer from ${shopName}*

💳 *Card Name:* ${card.cardName} (${card.bank} Bank)
💰 *Annual Fee:* ${annualFeeText} (${card.feeWaiverCondition})
🎁 *Welcome Benefit:* ${card.welcomeBenefit}

✨ *Top Cashback & Rewards:*
${benefitsBullet}

🚀 *Quick Online Application with Fast Bank Approval:*
Apply online or reply with your name to get your card processed directly!

📞 *Helpline / Inquiry:* Send us your Name & Mobile to check your pre-approved eligibility.`;
}
