/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Job, 
  SupportConfig, 
  LearningVideo, 
  StateType,
  FeedbackItem,
  Achievement,
  UserAchievementState,
  CVData,
  LoanService
} from './types';
import { 
  getStoredUsers, 
  saveUsers, 
  getStoredJobs, 
  saveJobs, 
  getStoredSupportConfig, 
  saveSupportConfig, 
  getStoredCurrentUser, 
  saveCurrentUser,
  getStoredFeedback,
  saveStoredFeedback,
  getStoredVideos,
  saveStoredVideos,
  getStoredCVData,
  getStoredLoans,
  saveStoredLoans,
  ADMIN_CREDENTIALS 
} from './services/storage';
import { compressImageForAvatar } from './services/imageUtils';
import { 
  getUserAchievementState, 
  saveUserAchievementState, 
  evaluateUserAchievements 
} from './services/achievements';
import { Navbar } from './components/Common/Navbar';
import { BottomNav, TabType } from './components/Common/BottomNav';
import { FloatingWhatsApp } from './components/Common/FloatingWhatsApp';
import { HomeTab } from './components/Tabs/HomeTab';
import { JobsTab } from './components/Tabs/JobsTab';
import { LoansTab } from './components/Tabs/LoansTab';
import { LearnTab } from './components/Tabs/LearnTab';
import { ProfileTab } from './components/Tabs/ProfileTab';
import { AdminPanelTab } from './components/Tabs/AdminPanelTab';
import { AuthModal } from './components/Auth/AuthModal';
import { UPIActivationModal } from './components/Payment/UPIActivationModal';
import { CVMakerModal } from './components/CVMaker/CVMakerModal';
import { FeedbackModal } from './components/Feedback/FeedbackModal';
import { PassportPhotoModal } from './components/PassportPhoto/PassportPhotoModal';
import { AchievementUnlockedModal } from './components/Achievements/AchievementUnlockedModal';
import { CyberCafeHub } from './components/CyberCafe/CyberCafeHub';
import { DocScannerHome } from './components/DocScanner/DocScannerHome';
import { CreditCardHub } from './components/CreditCard/CreditCardHub';

const deduplicateJobs = (jobList: Job[]): Job[] => {
  const seen = new Set<string>();
  const unique: Job[] = [];
  for (const job of jobList) {
    if (job && job.id && !seen.has(job.id)) {
      seen.add(job.id);
      unique.push(job);
    }
  }
  return unique;
};

export default function App() {
  // Core Application State
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredCurrentUser());
  const [users, setUsers] = useState<User[]>(() => getStoredUsers());
  const [jobs, setJobs] = useState<Job[]>(() => deduplicateJobs(getStoredJobs()));
  const [supportConfig, setSupportConfig] = useState<SupportConfig>(() => getStoredSupportConfig());
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(() => getStoredFeedback());
  const [videos, setVideos] = useState<LearningVideo[]>(() => getStoredVideos());
  const [loans, setLoans] = useState<LoanService[]>(() => getStoredLoans());
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Modals & Tools
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [pendingActivationUser, setPendingActivationUser] = useState<User | null>(null);
  const [isCVMakerOpen, setIsCVMakerOpen] = useState(false);
  const [isPassportModalOpen, setIsPassportModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<LearningVideo | null>(null);

  // Achievements & Gamification State
  const [achievementState, setAchievementState] = useState<UserAchievementState>(() =>
    getUserAchievementState(currentUser?.id)
  );
  const [cvData, setCvData] = useState<CVData | null>(() => getStoredCVData(currentUser?.id));
  const [currentCelebrationAchievement, setCurrentCelebrationAchievement] = useState<Achievement | null>(null);

  // Feedback Modal State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackTargetJob, setFeedbackTargetJob] = useState<Job | null>(null);
  const [feedbackInitialCategory, setFeedbackInitialCategory] = useState<
    'job_issue' | 'suggestion' | 'review' | 'payment_issue' | 'other'
  >('review');

  // Evaluate achievements on user change or load
  useEffect(() => {
    const loadedState = getUserAchievementState(currentUser?.id);
    const loadedCV = getStoredCVData(currentUser?.id);
    setCvData(loadedCV);
    const { updatedState, newlyUnlocked } = evaluateUserAchievements(currentUser, loadedState, loadedCV);
    setAchievementState(updatedState);
    if (newlyUnlocked.length > 0) {
      setCurrentCelebrationAchievement(newlyUnlocked[0]);
    }
  }, [currentUser]);

  // Sync users to storage
  const handleUpdateUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    saveUsers(newUsers);

    // If current user was updated, sync currentUser state
    if (currentUser) {
      const updatedCurrent = newUsers.find(u => u.id === currentUser.id);
      if (updatedCurrent) {
        setCurrentUser(updatedCurrent);
        saveCurrentUser(updatedCurrent);
      }
    }
  };

  // Update profile picture safely with auto-compression
  const handleUpdateProfilePicture = async (newPhotoUrl: string) => {
    if (!currentUser) return;
    try {
      let finalPhotoUrl = newPhotoUrl;
      if (newPhotoUrl && newPhotoUrl.startsWith('data:') && newPhotoUrl.length > 50000) {
        finalPhotoUrl = await compressImageForAvatar(newPhotoUrl, 200, 0.75);
      }

      const updatedCurrent: User = { ...currentUser, profilePicture: finalPhotoUrl };
      setCurrentUser(updatedCurrent);
      saveCurrentUser(updatedCurrent);

      const updatedUsers = users.map((u) => (u.id === currentUser.id ? updatedCurrent : u));
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
    } catch (err) {
      console.error('Failed to update profile picture safely:', err);
    }
  };

  // Sync jobs to storage (with deduplication)
  const handleUpdateJobs = (newJobs: Job[]) => {
    const unique = deduplicateJobs(newJobs);
    setJobs(unique);
    saveJobs(unique);
  };

  // Sync support config to storage
  const handleUpdateSupportConfig = (newConfig: SupportConfig) => {
    setSupportConfig(newConfig);
    saveSupportConfig(newConfig);
  };

  // Login handler
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    saveCurrentUser(user);
    setIsAuthModalOpen(false);

    // If user is pending activation, open UPI modal
    if (!user.isActive && user.role !== 'admin') {
      setPendingActivationUser(user);
      setIsUpiModalOpen(true);
    }
  };

  // Register submit handler -> transition to ₹50 activation
  const handleRegisterSubmit = (newUser: User) => {
    // Add user into registered array
    const updatedUsers = [...users, newUser];
    handleUpdateUsers(updatedUsers);

    setIsAuthModalOpen(false);
    setPendingActivationUser(newUser);
    setIsUpiModalOpen(true);
  };

  // Successful ₹50 UPI Activation
  const handleUPIActivationSuccess = (activatedUser: User) => {
    const updatedUsers = users.map((u) => (u.id === activatedUser.id ? activatedUser : u));
    handleUpdateUsers(updatedUsers);
    setCurrentUser(activatedUser);
    saveCurrentUser(activatedUser);
    setIsUpiModalOpen(false);
    setPendingActivationUser(null);

    // Evaluate membership achievement
    const { updatedState, newlyUnlocked } = evaluateUserAchievements(activatedUser, achievementState, cvData);
    setAchievementState(updatedState);
    saveUserAchievementState(activatedUser.id, updatedState);
    if (newlyUnlocked.length > 0) {
      setCurrentCelebrationAchievement(newlyUnlocked[0]);
    }
  };

  // Job Application / Contact tracking for Achievements (First Step, Job Hunter, Career Pioneer)
  const handleApplyJob = (job: Job) => {
    const alreadyApplied = achievementState.appliedJobIds.includes(job.id);
    const appliedJobIds = alreadyApplied
      ? achievementState.appliedJobIds
      : [...achievementState.appliedJobIds, job.id];

    const nextState: UserAchievementState = {
      ...achievementState,
      appliedJobIds
    };

    const { updatedState, newlyUnlocked } = evaluateUserAchievements(currentUser, nextState, cvData);
    setAchievementState(updatedState);
    if (currentUser) {
      saveUserAchievementState(currentUser.id, updatedState);
    }
    if (newlyUnlocked.length > 0) {
      setCurrentCelebrationAchievement(newlyUnlocked[0]);
    }
  };

  // Video Watching tracking for Achievements (Knowledge Seeker, Skill Explorer)
  const handleWatchVideo = (video: LearningVideo) => {
    const alreadyWatched = achievementState.watchedVideoIds.includes(video.id);
    const watchedVideoIds = alreadyWatched
      ? achievementState.watchedVideoIds
      : [...achievementState.watchedVideoIds, video.id];

    const nextState: UserAchievementState = {
      ...achievementState,
      watchedVideoIds
    };

    const { updatedState, newlyUnlocked } = evaluateUserAchievements(currentUser, nextState, cvData);
    setAchievementState(updatedState);
    if (currentUser) {
      saveUserAchievementState(currentUser.id, updatedState);
    }
    if (newlyUnlocked.length > 0) {
      setCurrentCelebrationAchievement(newlyUnlocked[0]);
    }
  };

  // CV Creation tracking for Achievements (CV Master, Profile Perfected)
  const handleCVSaved = (newCV: CVData) => {
    setCvData(newCV);
    const nextState: UserAchievementState = {
      ...achievementState,
      cvCreated: true
    };

    const { updatedState, newlyUnlocked } = evaluateUserAchievements(currentUser, nextState, newCV);
    setAchievementState(updatedState);
    if (currentUser) {
      saveUserAchievementState(currentUser.id, updatedState);
    }
    if (newlyUnlocked.length > 0) {
      setCurrentCelebrationAchievement(newlyUnlocked[0]);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveCurrentUser(null);
    setActiveTab('home');
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleOpenCVMaker = () => {
    if (!currentUser) {
      handleOpenAuth('register');
      return;
    }
    setIsCVMakerOpen(true);
  };

  const handleOpenPassportPhoto = () => {
    setIsPassportModalOpen(true);
  };

  const handleSelectJobStateFilter = (state: StateType) => {
    setActiveTab('jobs');
  };

  // Feedback Handlers with Community Voice achievement check
  const handleOpenFeedback = (
    job: Job | null = null,
    category: 'job_issue' | 'suggestion' | 'review' | 'payment_issue' | 'other' = 'review'
  ) => {
    setFeedbackTargetJob(job);
    setFeedbackInitialCategory(category);
    setIsFeedbackModalOpen(true);
  };

  const handleSubmitFeedback = (newFeedback: FeedbackItem) => {
    const updated = [newFeedback, ...feedbackList];
    setFeedbackList(updated);
    saveStoredFeedback(updated);

    const nextState: UserAchievementState = {
      ...achievementState,
      feedbackCount: achievementState.feedbackCount + 1
    };

    const { updatedState, newlyUnlocked } = evaluateUserAchievements(currentUser, nextState, cvData);
    setAchievementState(updatedState);
    if (currentUser) {
      saveUserAchievementState(currentUser.id, updatedState);
    }
    if (newlyUnlocked.length > 0) {
      setCurrentCelebrationAchievement(newlyUnlocked[0]);
    }
  };

  const handleUpdateFeedbackList = (updatedList: FeedbackItem[]) => {
    setFeedbackList(updatedList);
    saveStoredFeedback(updatedList);
  };

  const handleUpdateVideos = (updatedVideos: LearningVideo[]) => {
    setVideos(updatedVideos);
    saveStoredVideos(updatedVideos);
  };

  const handleUpdateLoans = (updatedLoans: LoanService[]) => {
    setLoans(updatedLoans);
    saveStoredLoans(updatedLoans);
  };

  // Guard: completely protect Admin tab & redirect legacy jobs tab
  useEffect(() => {
    if (activeTab === 'admin' && currentUser?.role !== 'admin') {
      setActiveTab('home');
    }
    if (activeTab === 'jobs') {
      setActiveTab('home');
    }
  }, [activeTab, currentUser]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        supportConfig={supportConfig}
        activeTab={activeTab}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onNavigateTab={setActiveTab}
        onOpenFeedback={() => handleOpenFeedback(null, 'review')}
        onOpenPassportPhoto={handleOpenPassportPhoto}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto">
        {activeTab === 'home' && (
          <HomeTab
            currentUser={currentUser}
            supportConfig={supportConfig}
            videos={videos}
            loans={loans}
            onNavigateTab={setActiveTab}
            onOpenCVMaker={handleOpenCVMaker}
            onOpenPassportPhoto={handleOpenPassportPhoto}
            onOpenAuth={handleOpenAuth}
            onOpenUPIActivation={() => {
              if (currentUser) {
                setPendingActivationUser(currentUser);
                setIsUpiModalOpen(true);
              }
            }}
            onOpenFeedback={() => handleOpenFeedback(null, 'review')}
          />
        )}

        {activeTab === 'scanner' && (
          <div>
            <div className="bg-slate-900 text-white px-4 py-2 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setActiveTab('home')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <span>← Back to Home</span>
              </button>
              <span className="text-[11px] font-semibold text-blue-400">DocScan Pro Studio</span>
            </div>
            <DocScannerHome />
          </div>
        )}

        {activeTab === 'credit_cards' && (
          <div className="max-w-5xl mx-auto px-4 pt-4 pb-24">
            <div className="mb-3">
              <button
                onClick={() => setActiveTab('home')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              >
                <span>← Back to Home</span>
              </button>
            </div>
            <CreditCardHub />
          </div>
        )}

        {(activeTab === 'shop_management' || activeTab === 'jobs') && (
          <div className="max-w-5xl mx-auto px-4 pt-4 pb-24">
            <div className="mb-3">
              <button
                onClick={() => setActiveTab('home')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              >
                <span>← Back to Home</span>
              </button>
            </div>
            <CyberCafeHub initialModule="management" />
          </div>
        )}

        {activeTab === 'cybercafe' && (
          <div className="max-w-5xl mx-auto px-4 pt-4 pb-24">
            <div className="mb-3">
              <button
                onClick={() => setActiveTab('home')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              >
                <span>← Back to Home</span>
              </button>
            </div>
            <CyberCafeHub initialModule="tools" />
          </div>
        )}

        {activeTab === 'loans' && (
          <div className="max-w-5xl mx-auto px-4 pt-4 pb-24">
            <div className="mb-3">
              <button
                onClick={() => setActiveTab('home')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              >
                <span>← Back to Home</span>
              </button>
            </div>
            <LoansTab
              loans={loans}
              currentUser={currentUser}
              onNavigateTab={setActiveTab}
              onOpenAdminLoans={() => setActiveTab('admin')}
            />
          </div>
        )}

        {activeTab === 'learn' && (
          <div className="max-w-5xl mx-auto px-4 pt-4 pb-24">
            <div className="mb-3">
              <button
                onClick={() => setActiveTab('home')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              >
                <span>← Back to Home</span>
              </button>
            </div>
            <LearnTab
              videos={videos}
              watchedVideoIds={achievementState.watchedVideoIds}
              onSelectVideo={(video) => setSelectedVideo(video)}
              onCompleteVideo={handleWatchVideo}
              selectedVideoModal={selectedVideo}
              onCloseVideoModal={() => setSelectedVideo(null)}
            />
          </div>
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            currentUser={currentUser}
            supportConfig={supportConfig}
            achievementState={achievementState}
            cvData={cvData}
            onOpenCVMaker={handleOpenCVMaker}
            onOpenPassportPhoto={handleOpenPassportPhoto}
            onOpenAuth={handleOpenAuth}
            onOpenUPIActivation={() => {
              if (currentUser) {
                setPendingActivationUser(currentUser);
                setIsUpiModalOpen(true);
              }
            }}
            onLogout={handleLogout}
            onNavigateTab={setActiveTab}
            onOpenFeedback={(cat) => handleOpenFeedback(null, cat || 'review')}
            onUpdateProfilePicture={handleUpdateProfilePicture}
          />
        )}

        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <AdminPanelTab
            currentUser={currentUser}
            users={users}
            jobs={jobs}
            supportConfig={supportConfig}
            feedbackList={feedbackList}
            videos={videos}
            loans={loans}
            onUpdateUsers={handleUpdateUsers}
            onUpdateJobs={handleUpdateJobs}
            onUpdateSupportConfig={handleUpdateSupportConfig}
            onUpdateFeedback={handleUpdateFeedbackList}
            onUpdateVideos={handleUpdateVideos}
            onUpdateLoans={handleUpdateLoans}
            onOpenAuth={handleOpenAuth}
          />
        )}
      </main>

      {/* Persistent Floating WhatsApp Support Button (Core Requirement 6) */}
      <FloatingWhatsApp supportConfig={supportConfig} />

      {/* 5-Tab Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        currentUser={currentUser}
        jobsCount={jobs.length}
      />

      {/* Auth Modal (Login & Registration with WB & Bihar dropdowns and 1-Click Admin switch) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onLogin={handleLogin}
        onRegisterSubmit={handleRegisterSubmit}
        users={users}
        supportConfig={supportConfig}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* ₹50 UPI Joining Fee Activation Modal */}
      {pendingActivationUser && (
        <UPIActivationModal
          isOpen={isUpiModalOpen}
          user={pendingActivationUser}
          supportConfig={supportConfig}
          onSuccess={handleUPIActivationSuccess}
          onClose={() => setIsUpiModalOpen(false)}
          canClose={true}
        />
      )}

      {/* Built-in CV Maker Modal */}
      {currentUser && (
        <CVMakerModal
          user={currentUser}
          isOpen={isCVMakerOpen}
          onClose={() => setIsCVMakerOpen(false)}
          onSaveSuccess={handleCVSaved}
        />
      )}

      {/* User Feedback & Issue Reporting Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => {
          setIsFeedbackModalOpen(false);
          setFeedbackTargetJob(null);
        }}
        onSubmit={handleSubmitFeedback}
        currentUser={currentUser}
        supportConfig={supportConfig}
        preSelectedJob={feedbackTargetJob}
        initialCategory={feedbackInitialCategory}
      />

      {/* Passport Photo Generator Studio Modal */}
      <PassportPhotoModal
        isOpen={isPassportModalOpen}
        onClose={() => setIsPassportModalOpen(false)}
        supportConfig={supportConfig}
        onPhotoGenerated={handleUpdateProfilePicture}
      />

      {/* Celebratory Achievement Unlocked Modal */}
      <AchievementUnlockedModal
        achievement={currentCelebrationAchievement}
        onClose={() => setCurrentCelebrationAchievement(null)}
        onViewProfile={() => {
          setCurrentCelebrationAchievement(null);
          setActiveTab('profile');
        }}
      />
    </div>
  );
}
