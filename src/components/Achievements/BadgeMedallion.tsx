import React from 'react';
import { 
  Award, 
  Briefcase, 
  BookOpen, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  Trophy, 
  MessageSquare, 
  Send,
  Lock,
  Check
} from 'lucide-react';
import { Achievement } from '../../types';
import { TIER_CONFIG } from '../../data/achievements';

interface BadgeMedallionProps {
  achievement: Achievement;
  isUnlocked: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLock?: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Send,
  BookOpen,
  Briefcase,
  FileText,
  ShieldCheck,
  Award,
  Sparkles,
  Trophy,
  MessageSquare
};

export const BadgeMedallion: React.FC<BadgeMedallionProps> = ({
  achievement,
  isUnlocked,
  size = 'md',
  showLock = true
}) => {
  const IconComponent = ICON_MAP[achievement.iconName] || Award;
  const tierStyle = TIER_CONFIG[achievement.tier] || TIER_CONFIG.bronze;

  // Sizes configuration
  const sizeClasses = {
    sm: {
      outer: 'w-10 h-10',
      icon: 'w-4 h-4',
      badge: 'w-3.5 h-3.5',
      ring: 'border-2'
    },
    md: {
      outer: 'w-14 h-14',
      icon: 'w-6 h-6',
      badge: 'w-4 h-4',
      ring: 'border-2'
    },
    lg: {
      outer: 'w-20 h-20',
      icon: 'w-9 h-9',
      badge: 'w-6 h-6',
      ring: 'border-3'
    },
    xl: {
      outer: 'w-24 h-24',
      icon: 'w-11 h-11',
      badge: 'w-7 h-7',
      ring: 'border-4'
    }
  }[size];

  return (
    <div className="relative inline-flex items-center justify-center select-none">
      {/* Outer Glow for Unlocked High-tier Badges */}
      {isUnlocked && (
        <div 
          className="absolute inset-0 rounded-2xl blur-md opacity-70 animate-pulse pointer-events-none"
          style={{ backgroundColor: tierStyle.glowColor }}
        />
      )}

      {/* Main Medallion Shield */}
      <div
        className={`relative ${sizeClasses.outer} rounded-2xl flex items-center justify-center transition-transform ${
          isUnlocked
            ? `bg-gradient-to-br ${tierStyle.bgGradient} text-white shadow-md ${sizeClasses.ring} ${tierStyle.borderColor}`
            : 'bg-slate-100 text-slate-400 border border-slate-200 shadow-inner'
        }`}
      >
        <IconComponent
          className={`${sizeClasses.icon} ${
            isUnlocked ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]' : 'opacity-60'
          }`}
        />

        {/* Status Indicator Icon (Checkmark if unlocked, Lock if locked) */}
        {isUnlocked ? (
          <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white shadow-xs">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </div>
        ) : showLock ? (
          <div className="absolute -bottom-1 -right-1 bg-slate-600 text-white rounded-full p-1 border-2 border-white shadow-xs">
            <Lock className="w-2.5 h-2.5" />
          </div>
        ) : null}
      </div>
    </div>
  );
};
