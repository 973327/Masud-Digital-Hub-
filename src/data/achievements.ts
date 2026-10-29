import { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'First Step',
    titleBengali: 'প্রথম পদক্ষেপ',
    titleHindi: 'पहला कदम',
    description: 'Apply to or contact your very first job employer on Masud Digital Hub.',
    category: 'jobs',
    tier: 'bronze',
    iconName: 'Send',
    targetValue: 1,
    unit: 'job applied',
    points: 25
  },
  {
    id: 'knowledge_seeker',
    title: 'Knowledge Seeker',
    titleBengali: 'জ্ঞান অর্জনকারী',
    titleHindi: 'ज्ञान साधक',
    description: 'Watch 3 learning and vocational training video tutorials in Masud Digital Hub Academy.',
    category: 'learning',
    tier: 'bronze',
    iconName: 'BookOpen',
    targetValue: 3,
    unit: 'videos watched',
    points: 50
  },
  {
    id: 'job_hunter',
    title: 'Job Hunter',
    titleBengali: 'চাকরি সন্ধানকারী',
    titleHindi: 'जॉब हंटर',
    description: 'Apply to or connect directly with 5 verified job postings in West Bengal or Bihar.',
    category: 'jobs',
    tier: 'silver',
    iconName: 'Briefcase',
    targetValue: 5,
    unit: 'jobs applied',
    points: 75
  },
  {
    id: 'cv_master',
    title: 'CV Master',
    titleBengali: 'বায়োডাটা প্রস্তুতকারক',
    titleHindi: 'सीवी मास्टर',
    description: 'Build and generate a complete professional CV in the built-in CV Maker.',
    category: 'cv',
    tier: 'silver',
    iconName: 'FileText',
    targetValue: 1,
    unit: 'CV generated',
    points: 60
  },
  {
    id: 'verified_member',
    title: 'Verified Member',
    titleBengali: 'যাচাইকৃত সদস্য',
    titleHindi: 'वेरिफाइड सदस्य',
    description: 'Complete the ₹50 one-time membership to unlock unlimited employer calling.',
    category: 'membership',
    tier: 'gold',
    iconName: 'ShieldCheck',
    targetValue: 1,
    unit: 'verified status',
    points: 80
  },
  {
    id: 'profile_perfected',
    title: 'Profile Perfected',
    titleBengali: 'প্রোফাইল সম্পূর্ণ',
    titleHindi: 'प्रोफाइल परफेक्ट',
    description: 'Achieve 100% profile completion including verified phone, state, district, full address, and active membership.',
    category: 'profile',
    tier: 'gold',
    iconName: 'Award',
    targetValue: 100,
    unit: '% profile completed',
    points: 100
  },
  {
    id: 'skill_explorer',
    title: 'Skill Explorer',
    titleBengali: 'দক্ষতা অন্বেষণকারী',
    titleHindi: 'स्किल एक्सप्लोरर',
    description: 'Complete 5 vocational training and interview preparation masterclasses.',
    category: 'learning',
    tier: 'silver',
    iconName: 'Sparkles',
    targetValue: 5,
    unit: 'videos watched',
    points: 85
  },
  {
    id: 'career_pioneer',
    title: 'Career Pioneer',
    titleBengali: 'অগ্রগামী কর্মী',
    titleHindi: 'करियर पायनियर',
    description: 'Connect with 10 different verified job opportunities across target districts.',
    category: 'jobs',
    tier: 'platinum',
    iconName: 'Trophy',
    targetValue: 10,
    unit: 'jobs applied',
    points: 150
  },
  {
    id: 'community_voice',
    title: 'Community Voice',
    titleBengali: 'সচেতন সদস্য',
    titleHindi: 'कम्युनिटी वॉइस',
    description: 'Submit an app review, feedback, or report a recruiter issue to protect job seekers.',
    category: 'community',
    tier: 'bronze',
    iconName: 'MessageSquare',
    targetValue: 1,
    unit: 'feedback shared',
    points: 35
  }
];

export const TIER_CONFIG: Record<
  string,
  {
    name: string;
    bgGradient: string;
    borderColor: string;
    textColor: string;
    glowColor: string;
    ribbonColor: string;
  }
> = {
  bronze: {
    name: 'Bronze',
    bgGradient: 'from-amber-700 via-orange-600 to-amber-900',
    borderColor: 'border-amber-600',
    textColor: 'text-amber-800',
    glowColor: 'rgba(217, 119, 6, 0.35)',
    ribbonColor: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  silver: {
    name: 'Silver',
    bgGradient: 'from-slate-400 via-slate-300 to-slate-500',
    borderColor: 'border-slate-300',
    textColor: 'text-slate-700',
    glowColor: 'rgba(148, 163, 184, 0.35)',
    ribbonColor: 'bg-slate-100 text-slate-800 border-slate-300'
  },
  gold: {
    name: 'Gold',
    bgGradient: 'from-amber-400 via-yellow-300 to-amber-500',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-600',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    ribbonColor: 'bg-amber-50 text-amber-900 border-amber-300'
  },
  platinum: {
    name: 'Platinum',
    bgGradient: 'from-indigo-600 via-purple-500 to-teal-400',
    borderColor: 'border-indigo-400',
    textColor: 'text-indigo-600',
    glowColor: 'rgba(99, 102, 241, 0.45)',
    ribbonColor: 'bg-indigo-50 text-indigo-900 border-indigo-200'
  }
};
