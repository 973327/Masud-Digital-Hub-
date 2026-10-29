import React, { useState } from 'react';
import { 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  Star, 
  Award, 
  HelpCircle,
  FileText,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Achievement, CVData, SupportConfig, User, UserAchievementState } from '../../types';
import { ACHIEVEMENTS, TIER_CONFIG } from '../../data/achievements';
import { BadgeMedallion } from './BadgeMedallion';
import { BadgeDetailModal } from './BadgeDetailModal';
import { 
  calculateProfileCompletion, 
  calculateUserLevel, 
  getAchievementProgress 
} from '../../services/achievements';

interface AchievementsSectionProps {
  currentUser: User | null;
  achievementState: UserAchievementState;
  cvData: CVData | null;
  supportConfig: SupportConfig;
  onNavigateTab: (tab: 'cybercafe' | 'home' | 'jobs' | 'learn' | 'profile' | 'admin') => void;
  onOpenCVMaker: () => void;
  onOpenUPIActivation: () => void;
  onOpenFeedback?: (category?: 'job_issue' | 'suggestion' | 'review' | 'payment_issue' | 'other') => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  currentUser,
  achievementState,
  cvData,
  supportConfig,
  onNavigateTab,
  onOpenCVMaker,
  onOpenUPIActivation,
  onOpenFeedback,
  onOpenAuth
}) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [showChecklist, setShowChecklist] = useState(false);

  // Profile completion stats
  const profileStatus = calculateProfileCompletion(currentUser, cvData);

  // Level & XP Stats
  const levelStats = calculateUserLevel(achievementState.unlockedIds);

  const totalBadges = ACHIEVEMENTS.length;
  const unlockedCount = achievementState.unlockedIds.length;
  const progressRatio = Math.round((unlockedCount / totalBadges) * 100);

  // Filtered badges list
  const filteredAchievements = ACHIEVEMENTS.filter((ach) => {
    const isUnlocked = achievementState.unlockedIds.includes(ach.id);
    if (activeFilter === 'unlocked') return isUnlocked;
    if (activeFilter === 'locked') return !isUnlocked;
    return true;
  });

  const selectedProgress = selectedAchievement
    ? getAchievementProgress(selectedAchievement, currentUser, achievementState, cvData)
    : { current: 0, target: 1, percentage: 0, isUnlocked: false };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
      {/* Header with Title & Level Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Trophy className="w-6 h-6 text-amber-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                My Achievements & Badges
              </h3>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                কৃতিত্ব ও ব্যাজ
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Unlock badges as you apply, build your CV, and master job skills
            </p>
          </div>
        </div>

        {/* Level & Points Tag */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-4 py-2 rounded-2xl shadow-xs self-start sm:self-auto">
          <div className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs">
            L{levelStats.level}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs">{levelStats.levelTitle}</span>
              <span className="text-[10px] text-amber-300 font-mono">({levelStats.totalScore} XP)</span>
            </div>
            <p className="text-[10px] text-slate-300">{levelStats.levelTitleBengali}</p>
          </div>
        </div>
      </div>

      {/* Gamified Level Progress Bar */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Candidate Career Level: {levelStats.level}</span>
          </span>
          <span className="font-mono text-slate-500">
            {levelStats.totalScore} / {levelStats.nextLevelScore} XP to Level {levelStats.level + 1}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${levelStats.progressToNext}%` }}
          />
        </div>
      </div>

      {/* Interactive Profile Completion Card (Targeting 'Profile Perfected') */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/90 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Award className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">
                  Profile Completion: {profileStatus.percentage}%
                </span>
                {profileStatus.percentage === 100 ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    Profile Perfected!
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    Action Required
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {profileStatus.percentage === 100
                  ? 'Your profile is 100% complete! Employers can contact and verify your details immediately.'
                  : 'Complete missing items to reach 100% and unlock the "Profile Perfected" Gold Badge!'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowChecklist(!showChecklist)}
            className="px-3 py-1.5 rounded-xl bg-white text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100/50 transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap flex items-center gap-1"
          >
            <span>{showChecklist ? 'Hide Checklist' : 'View Checklist'}</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showChecklist ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-emerald-200/70 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
            style={{ width: `${profileStatus.percentage}%` }}
          />
        </div>

        {/* Expandable Checklist */}
        {showChecklist && (
          <div className="pt-2 border-t border-emerald-200/60 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
              Profile Perfected Checklist:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {profileStatus.checklist.map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                    item.completed
                      ? 'bg-white/80 border-emerald-200 text-emerald-900'
                      : 'bg-white border-amber-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                    )}
                    <span className={item.completed ? 'font-medium' : 'font-bold'}>{item.label}</span>
                  </div>

                  {!item.completed && (
                    <button
                      onClick={() => {
                        if (item.id === 'cv') onOpenCVMaker();
                        else if (item.id === 'membership') onOpenUPIActivation();
                        else if (item.id === 'auth' && onOpenAuth) onOpenAuth('register');
                        else onOpenCVMaker();
                      }}
                      className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700 cursor-pointer whitespace-nowrap"
                    >
                      {item.actionHint}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs & Badges Count Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Badges ({totalBadges})
          </button>

          <button
            onClick={() => setActiveFilter('unlocked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'unlocked'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Earned ({unlockedCount})
          </button>

          <button
            onClick={() => setActiveFilter('locked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'locked'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Progress ({totalBadges - unlockedCount})
          </button>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          {unlockedCount} of {totalBadges} Unlocked ({progressRatio}%)
        </span>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredAchievements.map((achievement) => {
          const isUnlocked = achievementState.unlockedIds.includes(achievement.id);
          const progress = getAchievementProgress(achievement, currentUser, achievementState, cvData);
          const tierStyle = TIER_CONFIG[achievement.tier] || TIER_CONFIG.bronze;
          const unlockedAt = achievementState.unlockTimestamps[achievement.id];

          return (
            <div
              key={achievement.id}
              onClick={() => setSelectedAchievement(achievement)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative ${
                isUnlocked
                  ? 'bg-white border-emerald-200/90 hover:border-emerald-400 hover:shadow-md'
                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                {/* Top Row: Medallion + Tier Tag + XP */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <BadgeMedallion
                    achievement={achievement}
                    isUnlocked={isUnlocked}
                    size="md"
                    showLock={true}
                  />

                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${
                        isUnlocked
                          ? tierStyle.ribbonColor
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {tierStyle.name}
                    </span>
                    <p className="font-mono text-[11px] font-bold text-amber-700 mt-1">
                      +{achievement.points} XP
                    </p>
                  </div>
                </div>

                {/* Title & Bengali Subtitle */}
                <h4 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-emerald-700 transition-colors">
                  {achievement.title}
                </h4>
                <p className="text-xs text-emerald-700 font-medium mt-0.5">
                  {achievement.titleBengali}
                </p>

                {/* Description */}
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {achievement.description}
                </p>
              </div>

              {/* Bottom Status / Progress Section */}
              <div className="pt-3 border-t border-slate-100 mt-3">
                {isUnlocked ? (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Unlocked</span>
                    </span>
                    {unlockedAt && (
                      <span className="text-slate-400">
                        {new Date(unlockedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                      <span>Progress:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {progress.current} / {progress.target} {achievement.unit}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedAchievement && (
        <BadgeDetailModal
          achievement={selectedAchievement}
          isUnlocked={achievementState.unlockedIds.includes(selectedAchievement.id)}
          progress={selectedProgress}
          unlockedAt={achievementState.unlockTimestamps[selectedAchievement.id]}
          onClose={() => setSelectedAchievement(null)}
          onNavigateTab={onNavigateTab}
          onOpenCVMaker={onOpenCVMaker}
          onOpenUPIActivation={onOpenUPIActivation}
          onOpenFeedback={() => onOpenFeedback && onOpenFeedback('review')}
        />
      )}
    </div>
  );
};
