import React from 'react';
import { Home, User, ShieldCheck } from 'lucide-react';
import { User as UserType } from '../../types';

export type TabType = 'home' | 'profile' | 'admin' | 'scanner' | 'credit_cards' | 'cybercafe' | 'shop_management' | 'loans' | 'learn' | 'jobs';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  currentUser: UserType | null;
  jobsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  currentUser
}) => {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg">
      <div className={`max-w-md mx-auto flex items-center justify-around px-4 py-2 ${isAdmin ? 'grid grid-cols-3' : 'grid grid-cols-2'}`}>
        {/* 1. Home Tab */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'text-blue-600 font-extrabold bg-blue-50/80 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          title="Home Dashboard & Quick Services"
        >
          <div className="relative">
            <Home className={`w-5 h-5 ${activeTab === 'home' ? 'text-blue-600 stroke-[2.5]' : 'stroke-2'}`} />
          </div>
          <span className="text-[11px] font-semibold mt-0.5">Home</span>
        </button>

        {/* 2. Profile Tab */}
        <button
          onClick={() => onChangeTab('profile')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'text-blue-600 font-extrabold bg-blue-50/80 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          title="Retailer Profile & Account Settings"
        >
          <div className="relative">
            {currentUser?.profilePicture ? (
              <img
                src={currentUser.profilePicture}
                alt={currentUser.fullName}
                className={`w-5 h-5 rounded-full object-cover border ${
                  activeTab === 'profile' ? 'border-blue-600 ring-2 ring-blue-500/30' : 'border-slate-300'
                }`}
              />
            ) : (
              <User className={`w-5 h-5 ${activeTab === 'profile' ? 'text-blue-600 stroke-[2.5]' : 'stroke-2'}`} />
            )}
            {currentUser?.isActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
            )}
          </div>
          <span className="text-[11px] font-semibold mt-0.5">Profile</span>
        </button>

        {/* 3. Admin Panel Tab (Strictly visible ONLY when logged in as Admin / Master) */}
        {isAdmin && (
          <button
            onClick={() => onChangeTab('admin')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'text-amber-600 font-extrabold bg-amber-50/80 shadow-xs'
                : 'text-amber-700 font-semibold hover:text-amber-800'
            }`}
            title="Master Administration Console"
          >
            <div className="relative">
              <ShieldCheck className={`w-5 h-5 ${activeTab === 'admin' ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <span className="text-[11px] font-semibold mt-0.5">Admin</span>
          </button>
        )}
      </div>
    </nav>
  );
};
