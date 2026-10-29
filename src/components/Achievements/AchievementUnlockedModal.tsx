import React, { useEffect } from 'react';
import { Sparkles, Trophy, Share2, X, Check, ArrowRight } from 'lucide-react';
import { Achievement } from '../../types';
import { TIER_CONFIG } from '../../data/achievements';
import { BadgeMedallion } from './BadgeMedallion';
import { playAchievementChime, triggerAchievementConfetti } from '../../services/achievements';

interface AchievementUnlockedModalProps {
  achievement: Achievement | null;
  onClose: () => void;
  onViewProfile?: () => void;
}

export const AchievementUnlockedModal: React.FC<AchievementUnlockedModalProps> = ({
  achievement,
  onClose,
  onViewProfile
}) => {
  useEffect(() => {
    if (achievement) {
      triggerAchievementConfetti();
      playAchievementChime();
    }
  }, [achievement]);

  if (!achievement) return null;

  const tierStyle = TIER_CONFIG[achievement.tier] || TIER_CONFIG.bronze;

  const handleShareWhatsApp = () => {
    const text = `🎉 I just earned the "${achievement.title}" (${achievement.titleBengali}) badge on Masud Digital Hub! Check out digital seva & cyber cafe services.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative text-center">
        {/* Top Header Background */}
        <div className={`p-6 bg-gradient-to-b ${tierStyle.bgGradient} text-white relative flex flex-col items-center justify-center`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Celebration Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Achievement Unlocked!</span>
          </div>

          {/* Large Badge Medallion */}
          <div className="my-2 transform hover:scale-105 transition-transform">
            <BadgeMedallion achievement={achievement} isUnlocked={true} size="xl" showLock={false} />
          </div>

          {/* Points Pill */}
          <div className="mt-3 inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-black/30 backdrop-blur-md text-amber-300 text-xs font-mono font-black">
            <span>+{achievement.points} XP POINTS</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${tierStyle.ribbonColor}`}>
                {tierStyle.name} Badge
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {achievement.title}
            </h3>
            <p className="text-sm font-semibold text-emerald-700 mt-0.5">
              {achievement.titleBengali} {achievement.titleHindi && `• ${achievement.titleHindi}`}
            </p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            {achievement.description}
          </p>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                onClose();
                if (onViewProfile) onViewProfile();
              }}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View in Profile & Badges</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>Share Badge on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
