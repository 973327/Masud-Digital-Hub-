import confetti from 'canvas-confetti';
import { Achievement, CVData, User, UserAchievementState } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';

const STORAGE_PREFIX = 'kajbondhu_user_achievements_v2';

export const DEFAULT_ACHIEVEMENT_STATE = (userId: string): UserAchievementState => ({
  userId,
  unlockedIds: [],
  unlockTimestamps: {},
  appliedJobIds: [],
  watchedVideoIds: [],
  cvCreated: false,
  feedbackCount: 0
});

export function getUserAchievementState(userId?: string): UserAchievementState {
  if (!userId) return DEFAULT_ACHIEVEMENT_STATE('guest');
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_ACHIEVEMENT_STATE(userId),
        ...parsed,
        unlockedIds: Array.isArray(parsed.unlockedIds) ? parsed.unlockedIds : [],
        unlockTimestamps: parsed.unlockTimestamps || {},
        appliedJobIds: Array.isArray(parsed.appliedJobIds) ? parsed.appliedJobIds : [],
        watchedVideoIds: Array.isArray(parsed.watchedVideoIds) ? parsed.watchedVideoIds : []
      };
    }
  } catch (e) {
    console.error('Error loading user achievement state:', e);
  }
  return DEFAULT_ACHIEVEMENT_STATE(userId);
}

export function saveUserAchievementState(userId: string, state: UserAchievementState): void {
  if (!userId) return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}_${userId}`, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving user achievement state:', e);
  }
}

export interface ProfileCheckItem {
  id: string;
  label: string;
  weight: number;
  completed: boolean;
  actionHint: string;
}

export function calculateProfileCompletion(user: User | null, cvData?: CVData | null): {
  percentage: number;
  checklist: ProfileCheckItem[];
} {
  if (!user) {
    return {
      percentage: 0,
      checklist: [
        { id: 'auth', label: 'Create an account', weight: 20, completed: false, actionHint: 'Register with mobile' },
        { id: 'phone', label: 'Mobile Number Verified', weight: 15, completed: false, actionHint: 'Verify phone' },
        { id: 'location', label: 'District & State Selection', weight: 15, completed: false, actionHint: 'Choose location' },
        { id: 'address', label: 'Full Residential Address', weight: 15, completed: false, actionHint: 'Add full address' },
        { id: 'membership', label: 'Active Membership (₹50)', weight: 15, completed: false, actionHint: 'Activate membership' },
        { id: 'cv', label: 'Built-in CV Created', weight: 20, completed: false, actionHint: 'Create CV' }
      ]
    };
  }

  const hasName = Boolean(user.fullName && user.fullName.trim().length > 2);
  const hasPhone = Boolean(user.mobileNumber && user.mobileNumber.length >= 10);
  const hasLocation = Boolean(user.state && user.district);
  const hasAddress = Boolean(user.address && user.address.trim().length > 5);
  const hasMembership = Boolean(user.isActive || user.role === 'admin');
  const hasCV = Boolean(cvData && cvData.fullName && cvData.skills && cvData.skills.length > 0);

  const checklist: ProfileCheckItem[] = [
    { id: 'name', label: 'Full Candidate Name', weight: 15, completed: hasName, actionHint: 'Update name' },
    { id: 'phone', label: 'Mobile Number (+91)', weight: 15, completed: hasPhone, actionHint: 'Update phone' },
    { id: 'location', label: 'State & Home District', weight: 15, completed: hasLocation, actionHint: 'Select district' },
    { id: 'address', label: 'Detailed Residential Address', weight: 20, completed: hasAddress, actionHint: 'Add full home address' },
    { id: 'membership', label: 'Verified Membership Activation', weight: 15, completed: hasMembership, actionHint: 'Activate ₹50 pass' },
    { id: 'cv', label: 'Professional Biodata / CV Created', weight: 20, completed: hasCV, actionHint: 'Create CV in CV Maker' }
  ];

  const earned = checklist.reduce((sum, item) => sum + (item.completed ? item.weight : 0), 0);
  const percentage = Math.min(100, Math.round(earned));

  return { percentage, checklist };
}

export function getAchievementProgress(
  achievement: Achievement,
  user: User | null,
  state: UserAchievementState,
  cvData?: CVData | null
): { current: number; target: number; percentage: number; isUnlocked: boolean } {
  const isAlreadyUnlocked = state.unlockedIds.includes(achievement.id);

  let current = 0;
  const target = achievement.targetValue;

  switch (achievement.id) {
    case 'first_step':
      current = state.appliedJobIds.length;
      break;
    case 'job_hunter':
      current = state.appliedJobIds.length;
      break;
    case 'career_pioneer':
      current = state.appliedJobIds.length;
      break;
    case 'knowledge_seeker':
      current = state.watchedVideoIds.length;
      break;
    case 'skill_explorer':
      current = state.watchedVideoIds.length;
      break;
    case 'cv_master':
      current = state.cvCreated ? 1 : 0;
      break;
    case 'verified_member':
      current = user && (user.isActive || user.role === 'admin') ? 1 : 0;
      break;
    case 'profile_perfected': {
      const { percentage } = calculateProfileCompletion(user, cvData);
      current = percentage;
      break;
    }
    case 'community_voice':
      current = state.feedbackCount;
      break;
    default:
      current = 0;
  }

  const rawPercent = target > 0 ? (current / target) * 100 : 0;
  const percentage = Math.min(100, Math.max(0, Math.round(rawPercent)));
  const shouldBeUnlocked = isAlreadyUnlocked || current >= target;

  return {
    current,
    target,
    percentage: shouldBeUnlocked ? 100 : percentage,
    isUnlocked: shouldBeUnlocked
  };
}

/**
 * Checks all achievements against current user actions and unlocks any newly earned ones.
 */
export function evaluateUserAchievements(
  user: User | null,
  currentState: UserAchievementState,
  cvData?: CVData | null
): {
  updatedState: UserAchievementState;
  newlyUnlocked: Achievement[];
} {
  if (!user) {
    return { updatedState: currentState, newlyUnlocked: [] };
  }

  const unlockedIds = [...currentState.unlockedIds];
  const unlockTimestamps = { ...currentState.unlockTimestamps };
  const newlyUnlocked: Achievement[] = [];
  const now = new Date().toISOString();

  for (const achievement of ACHIEVEMENTS) {
    if (!unlockedIds.includes(achievement.id)) {
      const progress = getAchievementProgress(achievement, user, currentState, cvData);
      if (progress.current >= progress.target) {
        unlockedIds.push(achievement.id);
        unlockTimestamps[achievement.id] = now;
        newlyUnlocked.push(achievement);
      }
    }
  }

  const updatedState: UserAchievementState = {
    ...currentState,
    unlockedIds,
    unlockTimestamps
  };

  if (newlyUnlocked.length > 0) {
    saveUserAchievementState(user.id, updatedState);
  }

  return { updatedState, newlyUnlocked };
}

/**
 * Play a gentle celebratory synthesized chime using Web Audio API.
 * 100% self-contained, no external asset dependencies.
 */
export function playAchievementChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 triumphant arpeggio
    const startTime = ctx.currentTime + 0.05;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.1);

      gain.gain.setValueAtTime(0, startTime + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.18, startTime + idx * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.1 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.1);
      osc.stop(startTime + idx * 0.1 + 0.5);
    });
  } catch (e) {
    // Audio contexts can be blocked if user has not interacted yet; safe ignore
  }
}

/**
 * Trigger celebratory multi-burst confetti
 */
export function triggerAchievementConfetti(): void {
  try {
    // First burst from center
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    // Side cannons after short delay
    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.6 }
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.6 }
      });
    }, 200);
  } catch (e) {
    console.error('Confetti trigger error:', e);
  }
}

/**
 * Calculates candidate gamified level and total XP score
 */
export function calculateUserLevel(unlockedIds: string[]): {
  totalScore: number;
  level: number;
  levelTitle: string;
  levelTitleBengali: string;
  nextLevelScore: number;
  progressToNext: number;
} {
  let totalScore = 0;
  for (const ach of ACHIEVEMENTS) {
    if (unlockedIds.includes(ach.id)) {
      totalScore += ach.points;
    }
  }

  // Level thresholds:
  // L1: 0 - 99 (New Seeker / নতুন কর্মী)
  // L2: 100 - 249 (Active Explorer / সক্রিয় কর্মী)
  // L3: 250 - 449 (Skilled Candidate / দক্ষ প্রার্থী)
  // L4: 450+ (Champion Partner / চ্যাম্পিয়ন বন্ধু)

  let level = 1;
  let levelTitle = 'New Applicant';
  let levelTitleBengali = 'নতুন কর্মী';
  let nextLevelScore = 100;
  let prevLevelScore = 0;

  if (totalScore >= 450) {
    level = 4;
    levelTitle = 'Champion Partner';
    levelTitleBengali = 'চ্যাম্পিয়ন বন্ধু';
    nextLevelScore = 650;
    prevLevelScore = 450;
  } else if (totalScore >= 250) {
    level = 3;
    levelTitle = 'Skilled Candidate';
    levelTitleBengali = 'দক্ষ প্রার্থী';
    nextLevelScore = 450;
    prevLevelScore = 250;
  } else if (totalScore >= 100) {
    level = 2;
    levelTitle = 'Active Seeker';
    levelTitleBengali = 'সক্রিয় কর্মী';
    nextLevelScore = 250;
    prevLevelScore = 100;
  }

  const scoreInLevel = totalScore - prevLevelScore;
  const levelRange = Math.max(1, nextLevelScore - prevLevelScore);
  const progressToNext = Math.min(100, Math.round((scoreInLevel / levelRange) * 100));

  return {
    totalScore,
    level,
    levelTitle,
    levelTitleBengali,
    nextLevelScore,
    progressToNext
  };
}
