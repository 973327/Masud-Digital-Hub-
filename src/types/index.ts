export type StateType = 'West Bengal' | 'Bihar';

export interface User {
  id: string;
  fullName: string;
  mobileNumber: string;
  password?: string;
  state: StateType;
  district: string;
  address?: string;
  profilePicture?: string;
  isActive: boolean;
  isBlocked: boolean;
  role: 'user' | 'admin';
  registrationDate: string;
  paymentDetails?: {
    amount: number;
    upiId: string;
    transactionId?: string;
    paidAt: string;
    status: 'completed' | 'pending';
  };
}

export interface Job {
  id: string;
  title: string;
  company: string;
  salary: string; // e.g. "₹15,000 - ₹22,000 / month"
  location: string; // District, State
  state: StateType;
  district: string;
  shiftTimings: string; // e.g. "9:30 AM - 6:30 PM (Day Shift)"
  contactPersonNumber: string; // 10-digit mobile number
  contactPersonName?: string;
  description?: string;
  requirements?: string[];
  vacancies?: number;
  category?: string;
  postedAt: string;
}

export interface BranchOffice {
  id: string;
  name: string;
  address: string;
  phone?: string;
}

export interface SupportAnnouncement {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  badgeText?: string;
  isActive: boolean;
}

export interface SupportConfig {
  companyName: string;
  tagline: string;
  whatsappNumber: string;
  helplineNumber: string;
  officialEmail: string;
  upiId: string;
  joiningFee: number;
  addressBengal: string;
  addressBihar: string;
  branchOffices?: BranchOffice[];
  announcement?: SupportAnnouncement;
}

export interface CVData {
  fullName: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  address: string;
  district: string;
  state: StateType;
  pincode: string;
  languages: string[];
  educationLevel: string;
  institution: string;
  passingYear: string;
  percentageOrGrade: string;
  isFresher: boolean;
  jobRole: string;
  companyName: string;
  experienceYears: string;
  jobResponsibilities: string;
  skills: string[];
  hasDrivingLicense: boolean;
  careerObjective: string;
}

export interface LearningVideo {
  id: string;
  title: string;
  titleBengali?: string;
  titleHindi?: string;
  category: 'vocational' | 'interview' | 'safety' | 'digital';
  duration: string;
  thumbnailGradient: string;
  instructor: string;
  description: string;
  keyPoints: string[];
  views: string;
  rating: number;
}

export interface FeedbackItem {
  id: string;
  userId?: string;
  userName: string;
  userMobile: string;
  userState?: StateType;
  userDistrict?: string;
  category: 'job_issue' | 'suggestion' | 'review' | 'payment_issue' | 'other';
  jobId?: string;
  jobTitle?: string;
  rating?: number; // 1 to 5
  subject: string;
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
  submittedAt: string;
  adminNote?: string;
}

export type AchievementCategory = 'profile' | 'jobs' | 'learning' | 'cv' | 'membership' | 'community';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Achievement {
  id: string;
  title: string;
  titleBengali: string;
  titleHindi?: string;
  description: string;
  category: AchievementCategory;
  tier: BadgeTier;
  iconName: string;
  targetValue: number;
  unit: string;
  points: number;
}

export interface UserAchievementState {
  userId: string;
  unlockedIds: string[];
  unlockTimestamps: Record<string, string>;
  appliedJobIds: string[];
  watchedVideoIds: string[];
  cvCreated: boolean;
  feedbackCount: number;
}

export interface LoanService {
  id: string;
  name: string;
  nameBengali?: string;
  nameHindi?: string;
  maxAmount: string; // e.g. "Up to ₹5,00,000"
  affiliateLink: string; // external affiliate link
  interestRate?: string; // e.g. "From 10.5% p.a."
  tenure?: string; // e.g. "3 - 60 Months"
  processingTime?: string; // e.g. "Instant 15-Min Disbursal"
  category: 'personal' | 'business' | 'micro' | 'vehicle' | 'education' | 'gold';
  provider?: string; // e.g. "Masud Digital Hub Partner NBFC"
  badge?: string; // e.g. "⚡ Instant Approval"
  features?: string[]; // e.g. ["100% Online Paperless", "Minimal KYC required"]
  isActive: boolean;
  updatedAt?: string;
}
