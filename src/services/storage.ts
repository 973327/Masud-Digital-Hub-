import { User, Job, SupportConfig, CVData, FeedbackItem, LearningVideo, LoanService } from '../types';
import { LEARNING_VIDEOS } from '../data/learningVideos';

export const ADMIN_CREDENTIALS = {
  mobileNumber: '9733279310',
  password: '#Asd1122'
};

export const DEFAULT_SUPPORT_CONFIG: SupportConfig = {
  companyName: 'Masud Digital Hub',
  tagline: 'Cyber Cafe, Document Scanner & Digital Seva Hub',
  whatsappNumber: '9733279310',
  helplineNumber: '9733279310',
  officialEmail: 'masuddigitalhub@gmail.com',
  upiId: 'Q001283362@ybl',
  joiningFee: 50,
  addressBengal: 'Regional Office: Barasat / Esplanade Employment Hub, Kolkata, West Bengal - 700001',
  addressBihar: 'Branch Office: Fraser Road, Dak Bunglow Chowk, Patna, Bihar - 800001',
  branchOffices: [
    {
      id: 'branch_wb_siliguri',
      name: 'North Bengal Regional Hub',
      address: 'Hill Cart Road, Near Junction Bus Terminal, Siliguri, West Bengal - 734001',
      phone: '9733279310'
    },
    {
      id: 'branch_bihar_gaya',
      name: 'South Bihar Assistance Desk',
      address: 'Station Road, Near Gandhi Maidan, Gaya, Bihar - 823001',
      phone: '9733279310'
    }
  ],
  announcement: {
    id: 'announcement_kb_01',
    title: 'Masud Digital Hub Official Announcement',
    message: 'Official WhatsApp Helpdesk is active for all digital services, document scanning, passport photos, and credit card applications!',
    timestamp: 'Just Now',
    badgeText: 'New Update',
    isActive: true
  }
};

export const DEFAULT_PROFILE_PICTURE = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';

const DEFAULT_ADMIN_USER: User = {
  id: 'admin-super-01',
  fullName: 'Masud Digital Hub Super Admin',
  mobileNumber: '9733279310',
  password: '#Asd1122',
  state: 'West Bengal',
  district: 'Kolkata',
  profilePicture: DEFAULT_PROFILE_PICTURE,
  isActive: true,
  isBlocked: false,
  role: 'admin',
  registrationDate: '2025-01-01',
  paymentDetails: {
    amount: 50,
    upiId: 'Q001283362@ybl',
    paidAt: '2025-01-01',
    status: 'completed'
  }
};

const STORAGE_KEYS = {
  USERS: 'kajbondhu_users_v2',
  JOBS: 'kajbondhu_jobs_v2',
  SUPPORT: 'kajbondhu_support_config_v2',
  CURRENT_USER: 'kajbondhu_current_user_v2',
  CV_DATA: 'kajbondhu_cv_draft_v2',
  FEEDBACK: 'kajbondhu_feedback_v2',
  VIDEOS: 'kajbondhu_videos_v2',
  LOANS: 'kajbondhu_loans_v2'
};

const MAX_AVATAR_CHAR_LENGTH = 70000; // ~50KB max data URL for avatar

function sanitizeUserAvatar(user: User): User {
  if (user && user.profilePicture && user.profilePicture.startsWith('data:') && user.profilePicture.length > MAX_AVATAR_CHAR_LENGTH) {
    return {
      ...user,
      profilePicture: DEFAULT_PROFILE_PICTURE
    };
  }
  return user;
}

function emergencyStorageCleanup(): void {
  try {
    // 1. Prune oversized avatar from current user
    const rawCur = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (rawCur) {
      try {
        const cur: User = JSON.parse(rawCur);
        if (cur.profilePicture && cur.profilePicture.startsWith('data:') && cur.profilePicture.length > MAX_AVATAR_CHAR_LENGTH) {
          cur.profilePicture = DEFAULT_PROFILE_PICTURE;
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(cur));
        }
      } catch (e) {
        console.warn('Failed cleaning current user:', e);
      }
    }

    // 2. Prune oversized avatars from users collection
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (rawUsers) {
      try {
        const users: User[] = JSON.parse(rawUsers);
        if (Array.isArray(users)) {
          let modified = false;
          const cleaned = users.map((u) => {
            if (u.profilePicture && u.profilePicture.startsWith('data:') && u.profilePicture.length > MAX_AVATAR_CHAR_LENGTH) {
              modified = true;
              return { ...u, profilePicture: DEFAULT_PROFILE_PICTURE };
            }
            return u;
          });
          if (modified) {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(cleaned));
          }
        }
      } catch (e) {
        console.warn('Failed cleaning users collection:', e);
      }
    }

    // 3. Trim heavy feedback items if needed
    const rawFeedback = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
    if (rawFeedback) {
      try {
        const fb = JSON.parse(rawFeedback);
        if (Array.isArray(fb) && fb.length > 30) {
          localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(fb.slice(0, 20)));
        }
      } catch {}
    }
  } catch (err) {
    console.warn('Error during emergency storage cleanup:', err);
  }
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error: any) {
    console.warn(`localStorage quota exceeded or failed for key "${key}". Running cleanup recovery...`, error);
    emergencyStorageCleanup();

    try {
      if (key === STORAGE_KEYS.CURRENT_USER) {
        const user = JSON.parse(value);
        const sanitized = sanitizeUserAvatar(user);
        localStorage.setItem(key, JSON.stringify(sanitized));
        return true;
      }
      if (key === STORAGE_KEYS.USERS) {
        const users = JSON.parse(value);
        if (Array.isArray(users)) {
          const sanitized = users.map(sanitizeUserAvatar);
          localStorage.setItem(key, JSON.stringify(sanitized));
          return true;
        }
      }
      localStorage.setItem(key, value);
      return true;
    } catch (retryError) {
      console.error(`Storage retry also failed for key "${key}":`, retryError);
      return false;
    }
  }
}

export function getStoredSupportConfig(): SupportConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPPORT);
    if (raw) {
      const parsed = JSON.parse(raw);
      const companyName = (!parsed.companyName || parsed.companyName.includes('Kaj Bondhu'))
        ? 'Masud Digital Hub'
        : parsed.companyName;
      return {
        ...DEFAULT_SUPPORT_CONFIG,
        ...parsed,
        companyName,
        announcement: parsed.announcement !== undefined ? parsed.announcement : DEFAULT_SUPPORT_CONFIG.announcement
      };
    }
  } catch (e) {
    console.error('Error reading support config:', e);
  }
  return DEFAULT_SUPPORT_CONFIG;
}

export function saveSupportConfig(config: SupportConfig): void {
  safeSetItem(STORAGE_KEYS.SUPPORT, JSON.stringify(config));
}

export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) {
      const users: User[] = JSON.parse(raw);
      let needsResave = false;

      // Clean oversized avatars from legacy stored users
      const sanitizedUsers = users.map((u) => {
        if (u.profilePicture && u.profilePicture.startsWith('data:') && u.profilePicture.length > MAX_AVATAR_CHAR_LENGTH) {
          needsResave = true;
          return { ...u, profilePicture: DEFAULT_PROFILE_PICTURE };
        }
        return u;
      });

      // Ensure admin exists and has default clean profilePicture if missing
      const adminIdx = sanitizedUsers.findIndex(u => u.mobileNumber === ADMIN_CREDENTIALS.mobileNumber);
      if (adminIdx === -1) {
        sanitizedUsers.unshift(DEFAULT_ADMIN_USER);
        needsResave = true;
      } else if (!sanitizedUsers[adminIdx].profilePicture) {
        sanitizedUsers[adminIdx].profilePicture = DEFAULT_PROFILE_PICTURE;
        needsResave = true;
      }

      if (needsResave) {
        safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(sanitizedUsers));
      }
      return sanitizedUsers;
    }
  } catch (e) {
    console.error('Error reading users:', e);
  }
  const initial = [DEFAULT_ADMIN_USER];
  safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(initial));
  return initial;
}

export function saveUsers(users: User[]): void {
  const sanitized = users.map(sanitizeUserAvatar);
  safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(sanitized));
}

/**
 * Clean System State:
 * Starts with a completely clean database (no demo/mock jobs).
 * Displays only real jobs posted directly from the Admin Panel.
 */
export function getStoredJobs(): Job[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JOBS);
    if (raw) {
      const parsed: Job[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const seen = new Set<string>();
        const uniqueJobs: Job[] = [];
        for (const job of parsed) {
          if (job && job.id && !seen.has(job.id)) {
            seen.add(job.id);
            uniqueJobs.push(job);
          }
        }
        if (uniqueJobs.length !== parsed.length) {
          safeSetItem(STORAGE_KEYS.JOBS, JSON.stringify(uniqueJobs));
        }
        return uniqueJobs;
      }
    }
  } catch (e) {
    console.error('Error reading jobs:', e);
  }
  // Initialize with empty array as strictly requested
  const cleanJobs: Job[] = [];
  safeSetItem(STORAGE_KEYS.JOBS, JSON.stringify(cleanJobs));
  return cleanJobs;
}

export function saveJobs(jobs: Job[]): void {
  const seen = new Set<string>();
  const uniqueJobs: Job[] = [];
  for (const job of jobs) {
    if (job && job.id && !seen.has(job.id)) {
      seen.add(job.id);
      uniqueJobs.push(job);
    }
  }
  safeSetItem(STORAGE_KEYS.JOBS, JSON.stringify(uniqueJobs));
}

export function getStoredCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      let user: User = JSON.parse(raw);
      let needsResave = false;

      // Clean oversized avatar
      if (user && user.profilePicture && user.profilePicture.startsWith('data:') && user.profilePicture.length > MAX_AVATAR_CHAR_LENGTH) {
        user.profilePicture = DEFAULT_PROFILE_PICTURE;
        needsResave = true;
      }

      if (user && user.role === 'admin' && !user.profilePicture) {
        user.profilePicture = DEFAULT_PROFILE_PICTURE;
        needsResave = true;
      }

      if (needsResave) {
        safeSetItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      }
      return user;
    }
  } catch (e) {
    console.error('Error reading current user:', e);
  }
  return null;
}

export function saveCurrentUser(user: User | null): void {
  if (user) {
    const sanitized = sanitizeUserAvatar(user);
    safeSetItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(sanitized));
  } else {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (e) {
      console.warn('Error removing current user:', e);
    }
  }
}

export function getStoredCVData(userId?: string): CVData | null {
  try {
    const key = userId ? `${STORAGE_KEYS.CV_DATA}_${userId}` : STORAGE_KEYS.CV_DATA;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading CV draft:', e);
  }
  return null;
}

export function saveStoredCVData(data: CVData, userId?: string): void {
  const key = userId ? `${STORAGE_KEYS.CV_DATA}_${userId}` : STORAGE_KEYS.CV_DATA;
  safeSetItem(key, JSON.stringify(data));
}

export function getStoredFeedback(): FeedbackItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading feedback:', e);
  }
  return [];
}

export function saveStoredFeedback(items: FeedbackItem[]): void {
  safeSetItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(items));
}

export function getStoredVideos(): LearningVideo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VIDEOS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading learning videos:', e);
  }
  safeSetItem(STORAGE_KEYS.VIDEOS, JSON.stringify(LEARNING_VIDEOS));
  return LEARNING_VIDEOS;
}

export function saveStoredVideos(videos: LearningVideo[]): void {
  safeSetItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
}

export const DEFAULT_LOAN_SERVICES: LoanService[] = [
  {
    id: 'loan_personal_instant',
    name: 'Personal Instant Cash Loan',
    nameBengali: 'পার্সোনাল ইনস্ট্যান্ট ক্যাশ লোন',
    nameHindi: 'पर्सनल इंस्टेंट लोन',
    maxAmount: 'Up to ₹5,00,000',
    affiliateLink: 'https://mdeal.in/c_personal_instant_loan',
    interestRate: 'Starting @ 10.49% p.a.',
    tenure: '3 to 60 Months',
    processingTime: 'Instant 15-Min Disbursal',
    category: 'personal',
    provider: 'Masud Digital Hub Partner NBFC',
    badge: '⚡ Instant Disbursal',
    features: [
      '100% Online Paperless Approval',
      'No collateral or security needed',
      'Direct instant bank account transfer',
      'Flexible monthly EMI repayment'
    ],
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loan_business_msme',
    name: 'Small Business & Shopkeeper Loan',
    nameBengali: 'ব্যবসা ও দোকানদার লোন (MSME)',
    nameHindi: 'छोटा व्यापार एवं दुकान लोन',
    maxAmount: 'Up to ₹10,00,000',
    affiliateLink: 'https://mdeal.in/c_msme_business_loan',
    interestRate: 'Starting @ 11.25% p.a.',
    tenure: '12 to 84 Months',
    processingTime: '24-48 Hours Sanction',
    category: 'business',
    provider: 'Leading MSME Banking Network',
    badge: '★ Best for Shopkeepers',
    features: [
      'Working capital for retail & cyber cafe',
      'Minimal financial documentation',
      'No physical branch visit required',
      'Special rates for women entrepreneurs'
    ],
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loan_aadhaar_micro',
    name: 'Aadhaar / Micro Emergency Loan',
    nameBengali: 'আধার মাইক্রো ইমার্জেন্সি লোন',
    nameHindi: 'आधार माइक्रो इमरजेंसी लोन',
    maxAmount: 'Up to ₹50,000',
    affiliateLink: 'https://mdeal.in/c_aadhaar_micro_credit',
    interestRate: 'Low Daily / Monthly Interest',
    tenure: '1 to 12 Months',
    processingTime: 'Same Day 30-Min Credit',
    category: 'micro',
    provider: 'Digital Microfinance Partner',
    badge: '⚡ Fast Aadhaar KYC',
    features: [
      'Quick approval on Aadhaar & PAN verification',
      'No heavy salary slips or ITR required',
      'Emergency medical & household cash',
      'Early repayment discount available'
    ],
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loan_vehicle_bike',
    name: 'Two-Wheeler & Bike Loan',
    nameBengali: 'বাইক ও স্কুটার লোন',
    nameHindi: 'बाइक एवं टू-व्हीलर लोन',
    maxAmount: 'Up to ₹1,50,000',
    affiliateLink: 'https://mdeal.in/c_two_wheeler_finance',
    interestRate: 'Starting @ 8.99% p.a.',
    tenure: '12 to 48 Months',
    processingTime: 'Instant Dealership Clearance',
    category: 'vehicle',
    provider: 'Auto Finance Partner',
    badge: '100% On-Road Funding',
    features: [
      'Up to 100% on-road price financing',
      'Essential for delivery & field job agents',
      'Fast digital approval at showroom',
      'Affordable EMI starting ₹1,999/mo'
    ],
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loan_education_skill',
    name: 'Career Skill & Education Loan',
    nameBengali: 'ক্যারিয়ার ট্রেনিং ও এডুকেশন লোন',
    nameHindi: 'कौशल विकास एवं शिक्षा लोन',
    maxAmount: 'Up to ₹2,00,000',
    affiliateLink: 'https://mdeal.in/c_education_skill_loan',
    interestRate: 'Subsidized @ 7.5% p.a.',
    tenure: '6 to 36 Months',
    processingTime: '48 Hours Approval',
    category: 'education',
    provider: 'National Skill Development Finance',
    badge: '🎓 Low Subsidized Rate',
    features: [
      'For computer, nursing & technical courses',
      'Moratorium period until course completion',
      'Direct fee disbursement to institute',
      'No guarantor required for certified programs'
    ],
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loan_gold_quick',
    name: 'Instant Gold Loan Against Jewelry',
    nameBengali: 'স্বর্ণ বন্ধকী সহজ ঋণ',
    nameHindi: 'गोल्ड लोन (सोने पर लोन)',
    maxAmount: 'Up to ₹15,00,000',
    affiliateLink: 'https://mdeal.in/c_gold_loan_instant',
    interestRate: 'Starting @ 0.79% per month',
    tenure: '3 to 24 Months',
    processingTime: 'Doorstep / 30-Min Disbursal',
    category: 'gold',
    provider: 'Secured Gold Finance NBFC',
    badge: 'Highest Per-Gram Value',
    features: [
      'Maximum cash value per gram of gold',
      'Safe locker storage with 100% free insurance',
      'Pay interest only monthly, principal at end',
      'Instant return of ornaments on closure'
    ],
    isActive: true,
    updatedAt: new Date().toISOString()
  }
];

export function getStoredLoans(): LoanService[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOANS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored loans:', e);
  }
  safeSetItem(STORAGE_KEYS.LOANS, JSON.stringify(DEFAULT_LOAN_SERVICES));
  return DEFAULT_LOAN_SERVICES;
}

export function saveStoredLoans(loans: LoanService[]): void {
  safeSetItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
}

