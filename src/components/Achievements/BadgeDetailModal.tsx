import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  Calendar, 
  Share2, 
  Award, 
  Sparkles,
  ExternalLink 
} from 'lucide-react';
import { Achievement, User } from '../../types';
import { TIER_CONFIG } from '../../data/achievements';
import { BadgeMedallion } from './BadgeMedallion';

interface BadgeDetailModalProps {
  achievement: Achievement | null;
  isUnlocked: boolean;
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
  unlockedAt?: string;
  onClose: () => void;
  onNavigateTab?: (tab: 'home' | 'jobs' | 'learn' | 'profile' | 'admin') => void;
  onOpenCVMaker?: () => void;
  onOpenUPIActivation?: () => void;
  onOpenFeedback?: () => void;
}

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({
  achievement,
  isUnlocked,
  progress,
  unlockedAt,
  onClose,
  onNavigateTab,
  onOpenCVMaker,
  onOpenUPIActivation,
  onOpenFeedback
}) => {
  if (!achievement) return null;

  const tierStyle = TIER_CONFIG[achievement.tier] || TIER_CONFIG.bronze;

  const handleShareWhatsApp = () => {
    const text = `🏆 I've earned the "${achievement.title}" (${achievement.titleBengali}) badge on Masud Digital Hub! Check out digital seva & cyber cafe services.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleAction = () => {
    onClose();
    switch (achievement.category) {
      case 'jobs':
        if (onNavigateTab) onNavigateTab('jobs');
        break;
      case 'learning':
        if (onNavigateTab) onNavigateTab('learn');
        break;
      case 'cv':
        if (onOpenCVMaker) onOpenCVMaker();
        break;
      case 'membership':
        if (onOpenUPIActivation) onOpenUPIActivation();
        break;
      case 'community':
        if (onOpenFeedback) onOpenFeedback();
        break;
      case 'profile':
        if (onOpenCVMaker) onOpenCVMaker();
        break;
      default:
        break;
    }
  };

  const actionLabel = {
    jobs: 'Browse Verified Jobs',
    learning: 'Watch Video Tutorials',
    cv: 'Open Built-in CV Maker',
    membership: 'Activate Membership (₹50)',
    community: 'Submit Review / Feedback',
    profile: 'Complete Candidate Profile'
  }[achievement.category];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Header */}
        <div className={`p-6 bg-gradient-to-br ${isUnlocked ? tierStyle.bgGradient : 'from-slate-800 to-slate-900'} text-white relative flex flex-col items-center text-center`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <BadgeMedallion achievement={achievement} isUnlocked={isUnlocked} size="xl" />

          <div className="mt-3 flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
              isUnlocked ? tierStyle.ribbonColor : 'bg-slate-700 text-slate-300 border-slate-600'
            }`}>
              {tierStyle.name} Badge • {achievement.points} XP
            </span>
          </div>

          <h3 className="text-xl font-black text-white mt-2 tracking-tight">
            {achievement.title}
          </h3>
          <p className="text-xs text-white/80 font-medium">
            {achievement.titleBengali} {achievement.titleHindi && `• ${achievement.titleHindi}`}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          <div>
            <h4 className="font-bold text-slate-900 mb-1">Badge Description:</h4>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {achievement.description}
            </p>
          </div>

          {/* Progress Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                {isUnlocked ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Achievement Completed!</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>Progress to Unlock</span>
                  </>
                )}
              </span>
              <span className="font-mono text-emerald-700">
                {progress.current} / {progress.target} {achievement.unit} ({progress.percentage}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isUnlocked ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                }`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>

            {isUnlocked && unlockedAt && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Earned on: {new Date(unlockedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col gap-2">
            {isUnlocked ? (
              <button
                onClick={handleShareWhatsApp}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Badge on WhatsApp</span>
              </button>
            ) : (
              <button
                onClick={handleAction}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>{actionLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
