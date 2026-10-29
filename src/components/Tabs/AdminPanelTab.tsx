import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Briefcase, 
  Settings, 
  Plus, 
  Trash2, 
  Ban, 
  CheckCircle, 
  Phone, 
  DollarSign, 
  MapPin, 
  Mail, 
  Clock, 
  AlertCircle, 
  Check, 
  RefreshCw, 
  Building2,
  Sparkles,
  Search,
  KeyRound,
  MessageSquare,
  AlertTriangle,
  Star,
  MessageCircle,
  HelpCircle,
  ThumbsUp,
  Lightbulb,
  Edit3,
  BookOpen,
  PlayCircle,
  X,
  ExternalLink,
  GraduationCap,
  Bell,
  Megaphone,
  CreditCard,
  Link2,
  Copy
} from 'lucide-react';
import { Job, StateType, SupportConfig, User, FeedbackItem, BranchOffice, LearningVideo, LoanService } from '../../types';
import { DISTRICTS_BY_STATE, SUPPORTED_STATES } from '../../data/locations';
import { ADMIN_CREDENTIALS, DEFAULT_SUPPORT_CONFIG, DEFAULT_LOAN_SERVICES } from '../../services/storage';

interface AdminPanelTabProps {
  currentUser: User | null;
  users: User[];
  jobs: Job[];
  supportConfig: SupportConfig;
  feedbackList: FeedbackItem[];
  videos?: LearningVideo[];
  loans?: LoanService[];
  onUpdateUsers: (users: User[]) => void;
  onUpdateJobs: (jobs: Job[]) => void;
  onUpdateSupportConfig: (config: SupportConfig) => void;
  onUpdateFeedback: (feedback: FeedbackItem[]) => void;
  onUpdateVideos?: (videos: LearningVideo[]) => void;
  onUpdateLoans?: (loans: LoanService[]) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const AdminPanelTab: React.FC<AdminPanelTabProps> = ({
  currentUser,
  users,
  jobs,
  supportConfig,
  feedbackList = [],
  videos = [],
  loans = [],
  onUpdateUsers,
  onUpdateJobs,
  onUpdateSupportConfig,
  onUpdateFeedback,
  onUpdateVideos,
  onUpdateLoans,
  onOpenAuth
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'jobs' | 'users' | 'support' | 'feedback' | 'videos' | 'analytics' | 'loans'>('jobs');
  
  // Jobs Filter and Search
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobStateFilter, setJobStateFilter] = useState<'all' | StateType>('all');

  // Job Posting Form State
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobSalary, setJobSalary] = useState('');
  const [jobState, setJobState] = useState<StateType>('West Bengal');
  const [jobDistrict, setJobDistrict] = useState<string>(DISTRICTS_BY_STATE['West Bengal'][0]);
  const [jobSpecificLocation, setJobSpecificLocation] = useState('');
  const [jobShiftTimings, setJobShiftTimings] = useState('9:30 AM - 6:30 PM (Day Shift)');
  const [jobContactNumber, setJobContactNumber] = useState(supportConfig.helplineNumber);
  const [jobDescription, setJobDescription] = useState('');
  const [jobVacancies, setJobVacancies] = useState<number>(5);
  const [jobCategory, setJobCategory] = useState('Logistics & Delivery');
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [jobFormError, setJobFormError] = useState<string | null>(null);

  // Edit Job State
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editJobCompany, setEditJobCompany] = useState('');
  const [editJobSalary, setEditJobSalary] = useState('');
  const [editJobState, setEditJobState] = useState<StateType>('West Bengal');
  const [editJobDistrict, setEditJobDistrict] = useState<string>(DISTRICTS_BY_STATE['West Bengal'][0]);
  const [editJobSpecificLocation, setEditJobSpecificLocation] = useState('');
  const [editJobShiftTimings, setEditJobShiftTimings] = useState('');
  const [editJobContactNumber, setEditJobContactNumber] = useState('');
  const [editJobDescription, setEditJobDescription] = useState('');
  const [editJobVacancies, setEditJobVacancies] = useState<number>(1);
  const [editJobCategory, setEditJobCategory] = useState('Logistics & Delivery');
  const [editJobError, setEditJobError] = useState<string | null>(null);

  // User Management State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserMobile, setNewUserMobile] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('1234');
  const [newUserState, setNewUserState] = useState<StateType>('West Bengal');
  const [newUserDistrict, setNewUserDistrict] = useState<string>(DISTRICTS_BY_STATE['West Bengal'][0]);
  const [newUserAddress, setNewUserAddress] = useState('');
  const [newUserIsActive, setNewUserIsActive] = useState(true);
  const [userFormError, setUserFormError] = useState<string | null>(null);

  // Edit User State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserMobile, setEditUserMobile] = useState('');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserState, setEditUserState] = useState<StateType>('West Bengal');
  const [editUserDistrict, setEditUserDistrict] = useState<string>('Kolkata');
  const [editUserAddress, setEditUserAddress] = useState('');
  const [editUserRole, setEditUserRole] = useState<'user' | 'admin'>('user');
  const [editUserIsActive, setEditUserIsActive] = useState(true);
  const [editUserIsBlocked, setEditUserIsBlocked] = useState(false);
  const [editUserError, setEditUserError] = useState<string | null>(null);

  // Support Settings Form State
  const [supportForm, setSupportForm] = useState<SupportConfig>({ ...supportConfig });
  const [supportSaveSuccess, setSupportSaveSuccess] = useState(false);

  // Branch Office (Address) Management State
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchOffice | null>(null);
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState(supportConfig.helplineNumber);

  // Feedback State
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('all');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<string>('all');
  const [feedbackSearchQuery, setFeedbackSearchQuery] = useState('');

  // Learning Tutorial State
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<LearningVideo | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoTitleBengali, setVideoTitleBengali] = useState('');
  const [videoTitleHindi, setVideoTitleHindi] = useState('');
  const [videoCategory, setVideoCategory] = useState<'vocational' | 'interview' | 'safety' | 'digital'>('vocational');
  const [videoDuration, setVideoDuration] = useState('15 min');
  const [videoInstructor, setVideoInstructor] = useState('Masud Digital Hub Trainer');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoKeyPoints, setVideoKeyPoints] = useState('');

  // Loan Services Management State
  const [loanSearchQuery, setLoanSearchQuery] = useState('');
  const [loanCategoryFilter, setLoanCategoryFilter] = useState<string>('all');
  const [showAddLoanModal, setShowAddLoanModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanService | null>(null);
  const [inlineEditLoanId, setInlineEditLoanId] = useState<string | null>(null);
  const [inlineLinkInput, setInlineLinkInput] = useState<string>('');
  const [copiedLoanId, setCopiedLoanId] = useState<string | null>(null);
  const [quickSaveSuccessId, setQuickSaveSuccessId] = useState<string | null>(null);

  // Add/Edit Loan Form State
  const [loanName, setLoanName] = useState('');
  const [loanNameBengali, setLoanNameBengali] = useState('');
  const [loanMaxAmount, setLoanMaxAmount] = useState('Up to ₹5,00,000');
  const [loanAffiliateLink, setLoanAffiliateLink] = useState('');
  const [loanInterestRate, setLoanInterestRate] = useState('Starting @ 10.5% p.a.');
  const [loanTenure, setLoanTenure] = useState('3 to 60 Months');
  const [loanProcessingTime, setLoanProcessingTime] = useState('Instant 15-Min Disbursal');
  const [loanCategory, setLoanCategory] = useState<'personal' | 'business' | 'micro' | 'vehicle' | 'education' | 'gold'>('personal');
  const [loanProvider, setLoanProvider] = useState('Masud Digital Hub Partner NBFC');
  const [loanBadge, setLoanBadge] = useState('⚡ Instant Approval');
  const [loanFeatures, setLoanFeatures] = useState('100% Online Paperless Approval\nNo collateral or security needed\nDirect instant bank transfer');
  const [loanIsActive, setLoanIsActive] = useState(true);
  const [loanFormError, setLoanFormError] = useState<string | null>(null);

  // Verification if current logged in user is admin
  const isAdmin = currentUser?.role === 'admin' || currentUser?.mobileNumber === ADMIN_CREDENTIALS.mobileNumber;

  if (!isAdmin) {
    return null;
  }

  // --- JOB HANDLERS ---
  const handleJobStateChange = (st: StateType) => {
    setJobState(st);
    setJobDistrict(DISTRICTS_BY_STATE[st][0]);
  };

  const handleEditJobStateChange = (st: StateType) => {
    setEditJobState(st);
    setEditJobDistrict(DISTRICTS_BY_STATE[st][0]);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    setJobFormError(null);

    if (!jobTitle.trim() || !jobCompany.trim() || !jobSalary.trim() || !jobContactNumber.trim()) {
      setJobFormError('Please fill all required job details.');
      return;
    }

    const cleanContact = jobContactNumber.replace(/[^0-9]/g, '');
    if (cleanContact.length !== 10) {
      setJobFormError('Contact person number must be a valid 10-digit mobile number.');
      return;
    }

    const newJob: Job = {
      id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: jobTitle.trim(),
      company: jobCompany.trim(),
      salary: jobSalary.trim(),
      state: jobState,
      district: jobDistrict,
      location: jobSpecificLocation.trim() ? `${jobSpecificLocation.trim()}, ${jobDistrict}, ${jobState}` : `${jobDistrict}, ${jobState}`,
      shiftTimings: jobShiftTimings.trim(),
      contactPersonNumber: cleanContact,
      description: jobDescription.trim() || `${jobTitle} required for ${jobCompany} in ${jobDistrict}. Immediate joining.`,
      vacancies: Number(jobVacancies) || 1,
      category: jobCategory,
      postedAt: new Date().toISOString()
    };

    onUpdateJobs([newJob, ...jobs]);

    // Reset Form
    setJobTitle('');
    setJobCompany('');
    setJobSalary('');
    setJobSpecificLocation('');
    setJobDescription('');
    setShowAddJobModal(false);
  };

  const handleStartEditJob = (job: Job) => {
    setEditingJob(job);
    setEditJobTitle(job.title);
    setEditJobCompany(job.company);
    setEditJobSalary(job.salary);
    setEditJobState(job.state);
    setEditJobDistrict(job.district);
    setEditJobSpecificLocation(job.location || '');
    setEditJobShiftTimings(job.shiftTimings);
    setEditJobContactNumber(job.contactPersonNumber);
    setEditJobDescription(job.description || '');
    setEditJobVacancies(job.vacancies || 1);
    setEditJobCategory(job.category || 'Logistics & Delivery');
    setEditJobError(null);
  };

  const handleSaveEditJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    if (!editJobTitle.trim() || !editJobCompany.trim() || !editJobSalary.trim() || !editJobContactNumber.trim()) {
      setEditJobError('Please fill all required job fields.');
      return;
    }

    const cleanContact = editJobContactNumber.replace(/[^0-9]/g, '');
    if (cleanContact.length !== 10) {
      setEditJobError('Contact person number must be a valid 10-digit mobile number.');
      return;
    }

    const updatedJob: Job = {
      ...editingJob,
      title: editJobTitle.trim(),
      company: editJobCompany.trim(),
      salary: editJobSalary.trim(),
      state: editJobState,
      district: editJobDistrict,
      location: editJobSpecificLocation.trim() || `${editJobDistrict}, ${editJobState}`,
      shiftTimings: editJobShiftTimings.trim(),
      contactPersonNumber: cleanContact,
      vacancies: Number(editJobVacancies) || 1,
      category: editJobCategory,
      description: editJobDescription.trim() || `${editJobTitle.trim()} required for ${editJobCompany.trim()}`
    };

    const updated = jobs.map((j) => (j.id === editingJob.id ? updatedJob : j));
    onUpdateJobs(updated);
    setEditingJob(null);
  };

  const handleDeleteJob = (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job listing permanently?')) {
      const updated = jobs.filter((j) => j.id !== jobId);
      onUpdateJobs(updated);
      if (editingJob && editingJob.id === jobId) {
        setEditingJob(null);
      }
    }
  };

  // --- USER HANDLERS ---
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError(null);

    if (!newUserName.trim() || !newUserMobile.trim()) {
      setUserFormError('Please enter user name and mobile number.');
      return;
    }

    const cleanMobile = newUserMobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length !== 10) {
      setUserFormError('Mobile number must be 10 digits.');
      return;
    }

    if (users.some((u) => u.mobileNumber === cleanMobile)) {
      setUserFormError('A user with this mobile number already exists.');
      return;
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      fullName: newUserName.trim(),
      mobileNumber: cleanMobile,
      password: newUserPassword || '1234',
      state: newUserState,
      district: newUserDistrict,
      address: newUserAddress.trim() || undefined,
      isActive: newUserIsActive,
      isBlocked: false,
      role: 'user',
      registrationDate: new Date().toISOString().split('T')[0],
      paymentDetails: newUserIsActive ? {
        amount: supportConfig.joiningFee,
        upiId: supportConfig.upiId,
        paidAt: new Date().toISOString(),
        status: 'completed'
      } : undefined
    };

    onUpdateUsers([...users, newUser]);
    setNewUserName('');
    setNewUserMobile('');
    setNewUserAddress('');
    setShowAddUserModal(false);
  };

  const handleStartEditUser = (user: User) => {
    setEditingUser(user);
    setEditUserName(user.fullName);
    setEditUserMobile(user.mobileNumber);
    setEditUserPassword(user.password || '');
    setEditUserState(user.state);
    setEditUserDistrict(user.district);
    setEditUserAddress(user.address || '');
    setEditUserRole(user.role);
    setEditUserIsActive(user.isActive);
    setEditUserIsBlocked(user.isBlocked);
    setEditUserError(null);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editUserName.trim() || !editUserMobile.trim()) {
      setEditUserError('Full Name and 10-digit mobile number are required.');
      return;
    }

    const cleanMobile = editUserMobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length !== 10) {
      setEditUserError('Mobile number must be exactly 10 digits.');
      return;
    }

    if (users.some((u) => u.id !== editingUser.id && u.mobileNumber === cleanMobile)) {
      setEditUserError('Another user already exists with this mobile number.');
      return;
    }

    const updatedUser: User = {
      ...editingUser,
      fullName: editUserName.trim(),
      mobileNumber: cleanMobile,
      password: editUserPassword.trim() || editingUser.password,
      state: editUserState,
      district: editUserDistrict,
      address: editUserAddress.trim() || undefined,
      role: editUserRole,
      isActive: editUserIsActive,
      isBlocked: editUserIsBlocked
    };

    const updated = users.map((u) => (u.id === editingUser.id ? updatedUser : u));
    onUpdateUsers(updated);
    setEditingUser(null);
  };

  const handleToggleBlockUser = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, isBlocked: !u.isBlocked };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  const handleToggleActiveUser = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, isActive: !u.isActive };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Permanently delete this candidate account and remove their data?')) {
      const updated = users.filter((u) => u.id !== userId);
      onUpdateUsers(updated);
      if (editingUser && editingUser.id === userId) {
        setEditingUser(null);
      }
    }
  };

  // --- SUPPORT & ADDRESSES HANDLERS ---
  const handleSaveSupportConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSupportConfig(supportForm);
    setSupportSaveSuccess(true);
    setTimeout(() => setSupportSaveSuccess(false), 2500);
  };

  const handleClearAddressBengal = () => {
    if (window.confirm('Delete/Clear the West Bengal Regional Office address? Candidates will no longer see this address.')) {
      const updated = { ...supportForm, addressBengal: '' };
      setSupportForm(updated);
      onUpdateSupportConfig(updated);
    }
  };

  const handleResetAddressBengal = () => {
    const updated = { ...supportForm, addressBengal: DEFAULT_SUPPORT_CONFIG.addressBengal };
    setSupportForm(updated);
    onUpdateSupportConfig(updated);
  };

  const handleClearAddressBihar = () => {
    if (window.confirm('Delete/Clear the Bihar Branch Office address? Candidates will no longer see this address.')) {
      const updated = { ...supportForm, addressBihar: '' };
      setSupportForm(updated);
      onUpdateSupportConfig(updated);
    }
  };

  const handleResetAddressBihar = () => {
    const updated = { ...supportForm, addressBihar: DEFAULT_SUPPORT_CONFIG.addressBihar };
    setSupportForm(updated);
    onUpdateSupportConfig(updated);
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim() || !branchAddress.trim()) return;
    const cleanPhone = branchPhone.replace(/[^0-9]/g, '');
    const newBranch: BranchOffice = {
      id: `branch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: branchName.trim(),
      address: branchAddress.trim(),
      phone: cleanPhone || supportConfig.helplineNumber
    };
    const currentBranches = supportForm.branchOffices || [];
    const updatedBranches = [...currentBranches, newBranch];
    const updatedConfig = { ...supportForm, branchOffices: updatedBranches };
    setSupportForm(updatedConfig);
    onUpdateSupportConfig(updatedConfig);
    setShowAddBranchModal(false);
    setBranchName('');
    setBranchAddress('');
    setBranchPhone(supportConfig.helplineNumber);
  };

  const handleStartEditBranch = (branch: BranchOffice) => {
    setEditingBranch(branch);
    setBranchName(branch.name);
    setBranchAddress(branch.address);
    setBranchPhone(branch.phone || supportConfig.helplineNumber);
  };

  const handleSaveEditBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch || !branchName.trim() || !branchAddress.trim()) return;
    const cleanPhone = branchPhone.replace(/[^0-9]/g, '');
    const currentBranches = supportForm.branchOffices || [];
    const updatedBranches = currentBranches.map((b) =>
      b.id === editingBranch.id
        ? {
            ...b,
            name: branchName.trim(),
            address: branchAddress.trim(),
            phone: cleanPhone || undefined
          }
        : b
    );
    const updatedConfig = { ...supportForm, branchOffices: updatedBranches };
    setSupportForm(updatedConfig);
    onUpdateSupportConfig(updatedConfig);
    setEditingBranch(null);
    setBranchName('');
    setBranchAddress('');
  };

  const handleDeleteBranch = (branchId: string) => {
    if (window.confirm('Delete this regional branch office address? It will be removed immediately from the candidate profile view.')) {
      const currentBranches = supportForm.branchOffices || [];
      const updatedBranches = currentBranches.filter((b) => b.id !== branchId);
      const updatedConfig = { ...supportForm, branchOffices: updatedBranches };
      setSupportForm(updatedConfig);
      onUpdateSupportConfig(updatedConfig);
    }
  };

  const handleResetAllSupportDefaults = () => {
    if (window.confirm('Reset all official company support details and regional addresses to standard defaults?')) {
      setSupportForm({ ...DEFAULT_SUPPORT_CONFIG });
      onUpdateSupportConfig({ ...DEFAULT_SUPPORT_CONFIG });
      setSupportSaveSuccess(true);
      setTimeout(() => setSupportSaveSuccess(false), 2500);
    }
  };

  // --- LEARNING TUTORIALS HANDLERS ---
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) return;
    const newVideo: LearningVideo = {
      id: `vid_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: videoTitle.trim(),
      titleBengali: videoTitleBengali.trim() || undefined,
      titleHindi: videoTitleHindi.trim() || undefined,
      category: videoCategory,
      duration: videoDuration.trim() || '15 min',
      thumbnailGradient: 'from-blue-600 to-indigo-800',
      instructor: videoInstructor.trim() || 'Masud Digital Hub Trainer',
      description: videoDescription.trim() || `${videoTitle} practical training for candidates.`,
      keyPoints: videoKeyPoints.split('\n').map((s) => s.trim()).filter(Boolean),
      views: '1.2K',
      rating: 4.9
    };
    if (onUpdateVideos) {
      onUpdateVideos([newVideo, ...videos]);
    }
    setShowAddVideoModal(false);
    setVideoTitle('');
    setVideoTitleBengali('');
    setVideoTitleHindi('');
    setVideoDescription('');
    setVideoKeyPoints('');
  };

  const handleStartEditVideo = (vid: LearningVideo) => {
    setEditingVideo(vid);
    setVideoTitle(vid.title);
    setVideoTitleBengali(vid.titleBengali || '');
    setVideoTitleHindi(vid.titleHindi || '');
    setVideoCategory(vid.category);
    setVideoDuration(vid.duration);
    setVideoInstructor(vid.instructor);
    setVideoDescription(vid.description);
    setVideoKeyPoints((vid.keyPoints || []).join('\n'));
  };

  const handleSaveEditVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo || !videoTitle.trim()) return;
    const updatedVideo: LearningVideo = {
      ...editingVideo,
      title: videoTitle.trim(),
      titleBengali: videoTitleBengali.trim() || undefined,
      titleHindi: videoTitleHindi.trim() || undefined,
      category: videoCategory,
      duration: videoDuration.trim() || editingVideo.duration,
      instructor: videoInstructor.trim() || editingVideo.instructor,
      description: videoDescription.trim() || editingVideo.description,
      keyPoints: videoKeyPoints.split('\n').map((s) => s.trim()).filter(Boolean)
    };
    if (onUpdateVideos) {
      const updated = videos.map((v) => (v.id === editingVideo.id ? updatedVideo : v));
      onUpdateVideos(updated);
    }
    setEditingVideo(null);
  };

  const handleDeleteVideo = (videoId: string) => {
    if (window.confirm('Delete this training video tutorial from the system?')) {
      if (onUpdateVideos) {
        onUpdateVideos(videos.filter((v) => v.id !== videoId));
      }
    }
  };

  // --- LOAN SERVICES HANDLERS ---
  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    setLoanFormError(null);
    if (!loanName.trim() || !loanMaxAmount.trim() || !loanAffiliateLink.trim()) {
      setLoanFormError('Loan Name, Maximum Amount, and Affiliate Link are required.');
      return;
    }

    const newLoan: LoanService = {
      id: `loan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: loanName.trim(),
      nameBengali: loanNameBengali.trim() || undefined,
      maxAmount: loanMaxAmount.trim(),
      affiliateLink: loanAffiliateLink.trim(),
      interestRate: loanInterestRate.trim() || undefined,
      tenure: loanTenure.trim() || undefined,
      processingTime: loanProcessingTime.trim() || undefined,
      category: loanCategory,
      provider: loanProvider.trim() || undefined,
      badge: loanBadge.trim() || undefined,
      features: loanFeatures.split('\n').map((s) => s.trim()).filter(Boolean),
      isActive: loanIsActive,
      updatedAt: new Date().toISOString()
    };

    if (onUpdateLoans) {
      onUpdateLoans([newLoan, ...loans]);
    }
    setShowAddLoanModal(false);
    setLoanName('');
    setLoanNameBengali('');
    setLoanMaxAmount('Up to ₹5,00,000');
    setLoanAffiliateLink('');
    setLoanInterestRate('Starting @ 10.5% p.a.');
    setLoanTenure('3 to 60 Months');
    setLoanProcessingTime('Instant 15-Min Disbursal');
    setLoanCategory('personal');
    setLoanProvider('Masud Digital Hub Partner NBFC');
    setLoanBadge('⚡ Instant Approval');
    setLoanFeatures('100% Online Paperless Approval\nNo collateral or security needed\nDirect instant bank transfer');
    setLoanIsActive(true);
  };

  const handleStartEditLoan = (loan: LoanService) => {
    setEditingLoan(loan);
    setLoanName(loan.name);
    setLoanNameBengali(loan.nameBengali || '');
    setLoanMaxAmount(loan.maxAmount);
    setLoanAffiliateLink(loan.affiliateLink);
    setLoanInterestRate(loan.interestRate || '');
    setLoanTenure(loan.tenure || '');
    setLoanProcessingTime(loan.processingTime || '');
    setLoanCategory(loan.category);
    setLoanProvider(loan.provider || '');
    setLoanBadge(loan.badge || '');
    setLoanFeatures((loan.features || []).join('\n'));
    setLoanIsActive(loan.isActive);
    setLoanFormError(null);
  };

  const handleSaveEditLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLoan || !loanName.trim() || !loanMaxAmount.trim() || !loanAffiliateLink.trim()) {
      setLoanFormError('Loan Name, Maximum Amount, and Affiliate Link are required.');
      return;
    }

    const updated: LoanService = {
      ...editingLoan,
      name: loanName.trim(),
      nameBengali: loanNameBengali.trim() || undefined,
      maxAmount: loanMaxAmount.trim(),
      affiliateLink: loanAffiliateLink.trim(),
      interestRate: loanInterestRate.trim() || undefined,
      tenure: loanTenure.trim() || undefined,
      processingTime: loanProcessingTime.trim() || undefined,
      category: loanCategory,
      provider: loanProvider.trim() || undefined,
      badge: loanBadge.trim() || undefined,
      features: loanFeatures.split('\n').map((s) => s.trim()).filter(Boolean),
      isActive: loanIsActive,
      updatedAt: new Date().toISOString()
    };

    if (onUpdateLoans) {
      onUpdateLoans(loans.map((l) => (l.id === editingLoan.id ? updated : l)));
    }
    setEditingLoan(null);
  };

  const handleToggleLoanStatus = (loanId: string) => {
    if (!onUpdateLoans) return;
    onUpdateLoans(
      loans.map((l) => (l.id === loanId ? { ...l, isActive: !l.isActive, updatedAt: new Date().toISOString() } : l))
    );
  };

  const handleDeleteLoan = (loanId: string) => {
    if (!onUpdateLoans) return;
    if (window.confirm('Are you sure you want to delete this loan service offering?')) {
      onUpdateLoans(loans.filter((l) => l.id !== loanId));
    }
  };

  const handleQuickSaveAffiliateLink = (loanId: string) => {
    if (!onUpdateLoans || !inlineLinkInput.trim()) return;
    onUpdateLoans(
      loans.map((l) =>
        l.id === loanId ? { ...l, affiliateLink: inlineLinkInput.trim(), updatedAt: new Date().toISOString() } : l
      )
    );
    setQuickSaveSuccessId(loanId);
    setTimeout(() => setQuickSaveSuccessId(null), 2000);
    setInlineEditLoanId(null);
    setInlineLinkInput('');
  };

  const handleCopyAffiliateLink = (loan: LoanService) => {
    if (!loan.affiliateLink) return;
    navigator.clipboard.writeText(loan.affiliateLink);
    setCopiedLoanId(loan.id);
    setTimeout(() => setCopiedLoanId(null), 2000);
  };

  const handleResetDefaultLoans = () => {
    if (!onUpdateLoans) return;
    if (window.confirm('Reset all loan cards and affiliate links to Masud Digital Hub verified defaults?')) {
      onUpdateLoans(DEFAULT_LOAN_SERVICES);
    }
  };

  // Seed sample jobs
  const handleSeedVerifiedJobs = () => {
    const timestamp = Date.now();
    const sampleJobs: Job[] = [
      {
        id: `job_sample_wb1_${timestamp}`,
        title: 'Senior Residential Electrician & Wireman',
        company: 'Bengal Power & Facilities Ltd',
        salary: '₹18,000 - ₹24,000 / month',
        state: 'West Bengal',
        district: 'Kolkata',
        location: 'Salt Lake Sector V, Kolkata, West Bengal',
        shiftTimings: '9:30 AM - 6:00 PM (Day Shift)',
        contactPersonNumber: '9733279310',
        description: 'Need certified ITI wireman for residential apartment wiring and maintenance. Overtime bonus + ESI benefits provided.',
        vacancies: 4,
        category: 'Trade & Technical',
        postedAt: new Date().toISOString()
      },
      {
        id: `job_sample_wb2_${timestamp}`,
        title: 'E-Commerce Delivery Associate (Bike/Van)',
        company: 'QuickDrop Logistics Bengal',
        salary: '₹16,000 - ₹22,000 + Fuel Bonus',
        state: 'West Bengal',
        district: 'Howrah',
        location: 'Shibpur & Central Howrah, West Bengal',
        shiftTimings: '8:00 AM - 4:00 PM (Morning Shift)',
        contactPersonNumber: '9733279310',
        description: 'Urgent hiring for parcel delivery. Valid Driving License required. Daily fuel payout + monthly attendance incentive.',
        vacancies: 10,
        category: 'Logistics & Delivery',
        postedAt: new Date().toISOString()
      },
      {
        id: `job_sample_br1_${timestamp}`,
        title: 'Security Supervisor (Ex-Serviceman / Civilians)',
        company: 'Patna SafeGuard Security Services',
        salary: '₹15,000 - ₹19,500 / month',
        state: 'Bihar',
        district: 'Patna',
        location: 'Boring Road & Fraser Road, Patna, Bihar',
        shiftTimings: '8:00 PM - 8:00 AM (Night Shift)',
        contactPersonNumber: '9733279310',
        description: 'Standard security guard supervision, entry register checking, CCTV monitoring. Free uniform and accommodation support.',
        vacancies: 6,
        category: 'Security & Safety',
        postedAt: new Date().toISOString()
      },
      {
        id: `job_sample_br2_${timestamp}`,
        title: 'Retail Store Cashier & Computer Operator',
        company: 'Bihar Mega Mart Superstore',
        salary: '₹14,000 - ₹18,000 / month',
        state: 'Bihar',
        district: 'Gaya',
        location: 'Civil Lines, Gaya, Bihar',
        shiftTimings: '10:00 AM - 7:00 PM (Day Shift)',
        contactPersonNumber: '9733279310',
        description: 'Responsible for barcode billing, cash register reconciliation, and courteous customer interaction.',
        vacancies: 3,
        category: 'Retail & Sales',
        postedAt: new Date().toISOString()
      }
    ];

    const seen = new Set<string>();
    const combined: Job[] = [];
    for (const j of [...sampleJobs, ...jobs]) {
      if (j && j.id && !seen.has(j.id)) {
        seen.add(j.id);
        combined.push(j);
      }
    }
    onUpdateJobs(combined);
  };

  // Filtered lists
  const filteredJobs = jobs.filter((job) => {
    if (jobStateFilter !== 'all' && job.state !== jobStateFilter) return false;
    if (jobSearchQuery.trim()) {
      const q = jobSearchQuery.toLowerCase();
      const match =
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.district.toLowerCase().includes(q) ||
        job.state.toLowerCase().includes(q) ||
        job.contactPersonNumber.includes(q) ||
        (job.location && job.location.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const filteredUsers = users.filter((u) => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.mobileNumber.includes(q) ||
      u.district.toLowerCase().includes(q) ||
      u.state.toLowerCase().includes(q) ||
      (u.address && u.address.toLowerCase().includes(q))
    );
  });

  const activeCandidatesCount = users.filter((u) => u.isActive && u.role !== 'admin').length;
  const estimatedRevenue = activeCandidatesCount * (supportConfig.joiningFee || 50);

  return (
    <div className="space-y-6 pb-20">
      {/* Admin Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wide">
              Super Admin Mode
            </span>
            <span className="text-xs text-slate-400 font-mono">
              User ID: {currentUser.mobileNumber}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Masud Digital Hub Super Admin Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete management system: Edit and delete job listings, user accounts, addresses, tutorials, and support routing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddJobModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Job</span>
          </button>
        </div>
      </div>

      {/* Admin Sub Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1 shadow-sm gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('jobs')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'jobs' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Job Listings ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'users' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('support')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'support' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Addresses & Support Details</span>
        </button>

        <button
          onClick={() => setActiveSubTab('videos')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'videos' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>Learning Tutorials ({videos.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('feedback')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'feedback' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Feedback & Reports ({feedbackList.length})</span>
          {feedbackList.filter((f) => f.status === 'pending').length > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[9px] font-bold">
              {feedbackList.filter((f) => f.status === 'pending').length} new
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'analytics' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Revenue & Overview</span>
        </button>

        <button
          onClick={() => setActiveSubTab('loans')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'loans' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-400" />
          <span>Loan Services & Links ({loans.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: JOB LISTINGS MANAGEMENT (Add, Edit, Delete) */}
      {activeSubTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Active Job Postings ({jobs.length})
              </h2>
              <p className="text-xs text-slate-500">
                All existing jobs can be edited or deleted directly from this panel
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSeedVerifiedJobs}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="Seed sample real verified jobs for WB & Bihar"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>+ Seed 4 Verified Jobs</span>
              </button>

              <button
                onClick={() => setShowAddJobModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post Job</span>
              </button>
            </div>
          </div>

          {/* Job Search & State Filter */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={jobSearchQuery}
                onChange={(e) => setJobSearchQuery(e.target.value)}
                placeholder="Search jobs by title, company, district, location or recruiter..."
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={jobStateFilter}
                onChange={(e) => setJobStateFilter(e.target.value as 'all' | StateType)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white outline-none"
              >
                <option value="all">All States (WB & Bihar)</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Bihar">Bihar</option>
              </select>
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                {jobs.length === 0 ? 'Database is Currently Clean' : 'No Jobs Match Your Filter'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {jobs.length === 0 
                  ? 'No active jobs. Click "Post Job" above to create real vacancies, or click "Seed 4 Verified Jobs".'
                  : 'Try clearing the search query or selecting "All States".'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                            {job.district}, {job.state}
                          </span>
                          {job.category && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                              {job.category}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-1">
                          {job.title}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{job.company}</span>
                        </p>
                        {job.location && (
                          <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleStartEditJob(job)}
                          className="p-1.5 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Job Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Job Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 p-2 bg-slate-50 rounded-xl text-[11px] text-slate-600">
                      <div>
                        <span className="text-slate-400 block">Salary:</span>
                        <span className="font-bold text-emerald-700">{job.salary}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Shift:</span>
                        <span className="font-semibold text-slate-800 truncate block">{job.shiftTimings}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Recruiter Contact:</span>
                        <span className="font-mono font-bold text-slate-800">{job.contactPersonNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Vacancies:</span>
                        <span className="font-semibold text-slate-800">{job.vacancies || 1} open</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>ID: {job.id.slice(0, 12)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEditJob(job)}
                        className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit Job
                      </button>
                      <a
                        href={`tel:${job.contactPersonNumber}`}
                        className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        Test Call
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: USER ACCOUNTS MANAGEMENT (Add, Edit, Block, Delete) */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Registered Candidates & Users ({users.length})
              </h2>
              <p className="text-xs text-slate-500">
                Edit candidate information, update contact addresses, toggle fee activation, or delete accounts
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* User Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Search by name, mobile, district, state, or address..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-emerald-500 bg-white"
            />
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">User Details</th>
                    <th className="p-3">Location & Address</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{user.fullName}</p>
                        <p className="text-slate-500 font-mono text-[11px]">+91 {user.mobileNumber}</p>
                        <p className="text-[10px] text-slate-400">Reg: {user.registrationDate}</p>
                      </td>

                      <td className="p-3">
                        <span className="font-semibold text-slate-800">{user.district}</span>
                        <span className="block text-[11px] text-slate-500">{user.state}</span>
                        {user.address && (
                          <span className="block text-[10px] text-slate-600 bg-slate-50 p-1 rounded mt-1 max-w-xs truncate">
                            {user.address}
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        {user.role === 'admin' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                            User
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="flex flex-col gap-1 items-start">
                          {user.isBlocked ? (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                              Blocked
                            </span>
                          ) : user.isActive ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              Active (₹50 Paid)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px]">
                              Pending ₹50
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit User Button */}
                          <button
                            onClick={() => handleStartEditUser(user)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit User Details & Address"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {user.role !== 'admin' && (
                            <>
                              <button
                                onClick={() => handleToggleActiveUser(user.id)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                  user.isActive
                                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                }`}
                                title="Toggle ₹50 Activation"
                              >
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </button>

                              <button
                                onClick={() => handleToggleBlockUser(user.id)}
                                className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                  user.isBlocked
                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                }`}
                                title={user.isBlocked ? 'Unblock User' : 'Block User'}
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ADDRESSES & SYSTEM SUPPORT (Edit, Delete, Add Addresses) */}
      {activeSubTab === 'support' && (
        <div className="space-y-6">
          {/* Section 1: Regional Addresses & District Branch Offices */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <span>Regional Addresses & Branch Offices</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Manage all official company addresses, West Bengal & Bihar state offices, and district help centers
                </p>
              </div>

              <button
                onClick={() => setShowAddBranchModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Branch Office Address</span>
              </button>
            </div>

            {/* West Bengal & Bihar Primary Regional Offices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* West Bengal Regional Office */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h3 className="font-bold text-xs text-slate-800">
                      West Bengal Regional Head Office
                    </h3>
                  </div>
                  {supportForm.addressBengal ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                      Cleared / Deleted
                    </span>
                  )}
                </div>

                <textarea
                  rows={3}
                  value={supportForm.addressBengal}
                  onChange={(e) => setSupportForm({ ...supportForm, addressBengal: e.target.value })}
                  placeholder="Enter full West Bengal office address, road, landmark, city, and pin code..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500"
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetAddressBengal}
                      className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Reset Default
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleClearAddressBengal}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Clear / Delete Address"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete Address</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateSupportConfig(supportForm);
                        setSupportSaveSuccess(true);
                        setTimeout(() => setSupportSaveSuccess(false), 2000);
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Save Address
                    </button>
                  </div>
                </div>
              </div>

              {/* Bihar Branch Office */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <h3 className="font-bold text-xs text-slate-800">
                      Bihar Branch Office Address
                    </h3>
                  </div>
                  {supportForm.addressBihar ? (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                      Cleared / Deleted
                    </span>
                  )}
                </div>

                <textarea
                  rows={3}
                  value={supportForm.addressBihar}
                  onChange={(e) => setSupportForm({ ...supportForm, addressBihar: e.target.value })}
                  placeholder="Enter full Bihar branch office address, road, landmark, city, and pin code..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetAddressBihar}
                      className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Reset Default
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleClearAddressBihar}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Clear / Delete Address"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete Address</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateSupportConfig(supportForm);
                        setSupportSaveSuccess(true);
                        setTimeout(() => setSupportSaveSuccess(false), 2000);
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Save Address
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional District Branch Offices List */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  District Branch Offices & Regional Centers ({supportForm.branchOffices?.length || 0})
                </h3>
              </div>

              {(!supportForm.branchOffices || supportForm.branchOffices.length === 0) ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                  No additional branch offices created. Click "+ Add Branch Office Address" above to register district centers.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {supportForm.branchOffices.map((branch) => (
                    <div
                      key={branch.id}
                      className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-amber-600" />
                            {branch.name}
                          </h4>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEditBranch(branch)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
                              title="Edit Branch Address"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBranch(branch.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                              title="Delete Branch Address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {branch.address}
                        </p>
                      </div>

                      <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Phone: +91 {branch.phone || supportConfig.helplineNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleStartEditBranch(branch)}
                          className="text-blue-600 font-bold hover:underline cursor-pointer"
                        >
                          Edit Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Official Contact Channels & UPI Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm max-w-3xl">
            <div className="border-b pb-3 mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-700" />
                  <span>Company Support & UPI Routing Details</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Changes made here immediately update the floating WhatsApp button, helpline call buttons, and UPI modal
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetAllSupportDefaults}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 border rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                title="Reset all settings to default"
              >
                Reset All Defaults
              </button>
            </div>

            <form onSubmit={handleSaveSupportConfig} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    WhatsApp Support Number *
                  </label>
                  <input
                    type="text"
                    value={supportForm.whatsappNumber}
                    onChange={(e) => setSupportForm({ ...supportForm, whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Helpline Call Number *
                  </label>
                  <input
                    type="text"
                    value={supportForm.helplineNumber}
                    onChange={(e) => setSupportForm({ ...supportForm, helplineNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    value={supportForm.officialEmail}
                    onChange={(e) => setSupportForm({ ...supportForm, officialEmail: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Official UPI Payment ID *
                  </label>
                  <input
                    type="text"
                    value={supportForm.upiId}
                    onChange={(e) => setSupportForm({ ...supportForm, upiId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono font-bold outline-none focus:border-emerald-500 text-emerald-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Standard Joining Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={supportForm.joiningFee}
                    onChange={(e) => setSupportForm({ ...supportForm, joiningFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-bold outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={supportForm.companyName}
                    onChange={(e) => setSupportForm({ ...supportForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Company Tagline
                </label>
                <input
                  type="text"
                  value={supportForm.tagline}
                  onChange={(e) => setSupportForm({ ...supportForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              {/* Official Team Announcement & Pulsing WhatsApp Red Notification Settings */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <span>Official Team Announcement & Support Alert</span>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        When active, triggers a small pulsing red notification badge on candidates' floating WhatsApp button
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 transition-colors">
                    <input
                      type="checkbox"
                      checked={supportForm.announcement?.isActive ?? true}
                      onChange={(e) =>
                        setSupportForm({
                          ...supportForm,
                          announcement: {
                            id: supportForm.announcement?.id || `announcement_${Date.now()}`,
                            title: supportForm.announcement?.title || 'Masud Digital Hub Official Announcement',
                            message: supportForm.announcement?.message || 'New verified job openings and helpline support available!',
                            timestamp: supportForm.announcement?.timestamp || 'Just now',
                            badgeText: supportForm.announcement?.badgeText || 'New Update',
                            isActive: e.target.checked
                          }
                        })
                      }
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      {(supportForm.announcement?.isActive ?? true) ? 'Active (Pulsing Badge ON)' : 'Inactive (Badge OFF)'}
                    </span>
                  </label>
                </div>

                <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">
                        Announcement / Message Title *
                      </label>
                      <input
                        type="text"
                        value={supportForm.announcement?.title || ''}
                        onChange={(e) =>
                          setSupportForm({
                            ...supportForm,
                            announcement: {
                              id: supportForm.announcement?.id || `announcement_${Date.now()}`,
                              title: e.target.value,
                              message: supportForm.announcement?.message || '',
                              timestamp: supportForm.announcement?.timestamp || 'Just now',
                              badgeText: supportForm.announcement?.badgeText || 'New Update',
                              isActive: supportForm.announcement?.isActive ?? true
                            }
                          })
                        }
                        placeholder="e.g. Masud Digital Hub Official Announcement"
                        className="w-full px-3 py-2 bg-white border rounded-xl outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Badge Tag
                      </label>
                      <input
                        type="text"
                        value={supportForm.announcement?.badgeText || ''}
                        onChange={(e) =>
                          setSupportForm({
                            ...supportForm,
                            announcement: {
                              id: supportForm.announcement?.id || `announcement_${Date.now()}`,
                              title: supportForm.announcement?.title || '',
                              message: supportForm.announcement?.message || '',
                              timestamp: supportForm.announcement?.timestamp || 'Just now',
                              badgeText: e.target.value,
                              isActive: supportForm.announcement?.isActive ?? true
                            }
                          })
                        }
                        placeholder="e.g. Urgent, Notice, Update"
                        className="w-full px-3 py-2 bg-white border rounded-xl outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Announcement / Message Body *
                    </label>
                    <textarea
                      rows={2}
                      value={supportForm.announcement?.message || ''}
                      onChange={(e) =>
                        setSupportForm({
                          ...supportForm,
                          announcement: {
                            id: supportForm.announcement?.id || `announcement_${Date.now()}`,
                            title: supportForm.announcement?.title || '',
                            message: e.target.value,
                            timestamp: supportForm.announcement?.timestamp || 'Just now',
                            badgeText: supportForm.announcement?.badgeText || 'New Update',
                            isActive: supportForm.announcement?.isActive ?? true
                          }
                        })
                      }
                      placeholder="Enter the official team notice or support guidance message here..."
                      className="w-full px-3 py-2 bg-white border rounded-xl outline-none focus:border-emerald-500 leading-relaxed"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                    <span className="text-slate-500">
                      Timestamp: <strong>{supportForm.announcement?.timestamp || 'Just now'}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        const newId = `announcement_kb_${Date.now()}`;
                        const updated: SupportConfig = {
                          ...supportForm,
                          announcement: {
                            id: newId,
                            title: supportForm.announcement?.title || 'Masud Digital Hub Official Announcement',
                            message: supportForm.announcement?.message || 'New verified job openings added for West Bengal & Bihar! Contact our team on WhatsApp for free CV review.',
                            timestamp: 'Just now',
                            badgeText: supportForm.announcement?.badgeText || 'New Alert',
                            isActive: true
                          }
                        };
                        setSupportForm(updated);
                        onUpdateSupportConfig(updated);
                        setSupportSaveSuccess(true);
                        setTimeout(() => setSupportSaveSuccess(false), 2500);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      title="Re-broadcasts this announcement as unread, triggering the pulsing red notification badge on all candidate devices"
                    >
                      <Bell className="w-3.5 h-3.5 animate-bounce" />
                      <span>Broadcast Fresh Alert & Pulse Red Badge</span>
                    </button>
                  </div>
                </div>
              </div>

              {supportSaveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Support and regional address configuration saved successfully!</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  All changes persist in local storage immediately.
                </span>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer transition-colors"
                >
                  Save Configuration Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: LEARNING TUTORIALS (Add, Edit, Delete) */}
      {activeSubTab === 'videos' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Educational & Training Tutorials ({videos.length})
              </h2>
              <p className="text-xs text-slate-500">
                Manage learning modules for candidate skill development and job interview preparation
              </p>
            </div>

            <button
              onClick={() => setShowAddVideoModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Training Module</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {videos.map((vid) => (
              <div
                key={vid.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold uppercase">
                          {vid.category}
                        </span>
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {vid.duration}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 mt-1">
                        {vid.title}
                      </h3>
                      {vid.titleBengali && (
                        <p className="text-xs text-slate-500">{vid.titleBengali}</p>
                      )}
                      <p className="text-xs text-slate-600 mt-1">
                        Instructor: <strong>{vid.instructor}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEditVideo(vid)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                        title="Edit Tutorial"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(vid.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Delete Tutorial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    {vid.description}
                  </p>
                </div>

                <div className="pt-2 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>ID: {vid.id}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEditVideo(vid)}
                      className="text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      Edit Tutorial
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: USER FEEDBACK & REPORTS */}
      {activeSubTab === 'feedback' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                User Feedback, Suggestions & Issue Reports ({feedbackList.length})
              </h2>
              <p className="text-xs text-slate-500">
                Candidate reviews, complaints regarding job listings, and feature suggestions
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold border border-amber-200">
                {feedbackList.filter((f) => f.status === 'pending').length} Pending Review
              </span>
            </div>
          </div>

          {/* Feedback Filter Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={feedbackSearchQuery}
                onChange={(e) => setFeedbackSearchQuery(e.target.value)}
                placeholder="Search candidate name, mobile, reference ID, or topic..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 outline-none text-xs"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Category:</span>
              <select
                value={feedbackCategoryFilter}
                onChange={(e) => setFeedbackCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-xs outline-none"
              >
                <option value="all">All Categories</option>
                <option value="job_issue">Job Issues / Fraud Reports</option>
                <option value="suggestion">Feature Suggestions</option>
                <option value="review">Reviews & Ratings</option>
                <option value="payment_issue">₹50 UPI Payment Inquiries</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Status:</span>
              <select
                value={feedbackStatusFilter}
                onChange={(e) => setFeedbackStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-xs outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Feedback Cards */}
          {feedbackList.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                No Feedback Submitted Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Candidate reviews, app suggestions, and job reports submitted via the Feedback button will appear here for admin review.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbackList
                .filter((item) => {
                  if (feedbackCategoryFilter !== 'all' && item.category !== feedbackCategoryFilter) return false;
                  if (feedbackStatusFilter !== 'all' && item.status !== feedbackStatusFilter) return false;
                  if (feedbackSearchQuery.trim()) {
                    const q = feedbackSearchQuery.toLowerCase();
                    const match =
                      item.userName.toLowerCase().includes(q) ||
                      item.userMobile.includes(q) ||
                      item.id.toLowerCase().includes(q) ||
                      item.subject.toLowerCase().includes(q) ||
                      item.message.toLowerCase().includes(q);
                    if (!match) return false;
                  }
                  return true;
                })
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.id}
                        </span>

                        {/* Category Badge */}
                        {item.category === 'job_issue' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Job Issue Report
                          </span>
                        )}
                        {item.category === 'suggestion' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                            <Lightbulb className="w-3 h-3 text-amber-600" />
                            Suggestion
                          </span>
                        )}
                        {item.category === 'review' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-emerald-600" />
                            Review
                          </span>
                        )}
                        {item.category === 'payment_issue' && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center gap-1">
                            <HelpCircle className="w-3 h-3 text-blue-600" />
                            UPI Payment Query
                          </span>
                        )}

                        {item.rating && (
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold text-xs ml-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            {item.rating}/5
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400 text-[11px]">
                          {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : ''}
                        </span>

                        <select
                          value={item.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as 'pending' | 'reviewed' | 'resolved';
                            const updated = feedbackList.map((f) => (f.id === item.id ? { ...f, status: newStatus } : f));
                            onUpdateFeedback(updated);
                          }}
                          className={`px-2 py-1 rounded-lg text-xs font-bold outline-none cursor-pointer border ${
                            item.status === 'resolved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : item.status === 'reviewed'
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : 'bg-amber-50 text-amber-700 border-amber-300'
                          }`}
                        >
                          <option value="pending">Status: Pending</option>
                          <option value="reviewed">Status: Reviewed</option>
                          <option value="resolved">Status: Resolved</option>
                        </select>

                        <button
                          onClick={() => {
                            if (window.confirm('Delete this feedback record permanently?')) {
                              onUpdateFeedback(feedbackList.filter((f) => f.id !== item.id));
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Candidate Info and Attached Job */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                      <div>
                        <span className="text-slate-400 block font-medium">Submitted By:</span>
                        <span className="font-bold text-slate-800">{item.userName}</span>
                        <span className="text-slate-500 block font-mono">
                          +91 {item.userMobile} • {item.userDistrict || 'Kolkata'}, {item.userState || 'West Bengal'}
                        </span>
                      </div>

                      <div className="flex items-center justify-start sm:justify-end gap-2">
                        <a
                          href={`tel:${item.userMobile}`}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                        >
                          <Phone className="w-3 h-3 text-blue-600" />
                          <span>Call Candidate</span>
                        </a>

                        <a
                          href={`https://wa.me/91${item.userMobile}?text=${encodeURIComponent(
                            `Hello ${item.userName}, this is Masud Digital Hub Support regarding your inquiry (${item.id}): "${item.subject}".`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                        >
                          <MessageCircle className="w-3 h-3 fill-white" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    {item.jobTitle && (
                      <div className="p-2 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-900 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                        <span><strong>Reported Job Listing:</strong> {item.jobTitle}</span>
                      </div>
                    )}

                    {/* Subject & Message Content */}
                    <div className="text-xs space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm">{item.subject}</h4>
                      <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                        "{item.message}"
                      </p>
                    </div>

                    {/* Admin Note Section */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs">
                      <span className="text-slate-500 font-bold shrink-0">Admin Action Note:</span>
                      <input
                        type="text"
                        defaultValue={item.adminNote || ''}
                        onBlur={(e) => {
                          const note = e.target.value.trim();
                          const updated = feedbackList.map((f) => (f.id === item.id ? { ...f, adminNote: note } : f));
                          onUpdateFeedback(updated);
                        }}
                        placeholder="Add internal resolution note (e.g. Called recruiter, verified address)..."
                        className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 6: PLATFORM ANALYTICS & REVENUE */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-slate-400 text-xs block font-medium">Total Candidates</span>
              <span className="text-2xl font-black text-slate-900">{users.filter((u) => u.role !== 'admin').length}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-slate-400 text-xs block font-medium">Active (₹50 Activated)</span>
              <span className="text-2xl font-black text-emerald-700">{activeCandidatesCount}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-slate-400 text-xs block font-medium">Total Active Real Jobs</span>
              <span className="text-2xl font-black text-blue-700">{jobs.length}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-slate-400 text-xs block font-medium">Activation Revenue</span>
              <span className="text-2xl font-black text-amber-600">₹{estimatedRevenue.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm mb-3">West Bengal Coverage</h3>
              <p className="text-xs text-slate-600 mb-2">
                All 23 districts configured: Kolkata, Howrah, Hooghly, North 24 Parganas, South 24 Parganas, Nadia, Murshidabad, Burdwan, Jalpaiguri, Siliguri, etc.
              </p>
              <div className="flex justify-between text-xs text-slate-500 pt-2 border-t">
                <span>WB Candidates: {users.filter((u) => u.state === 'West Bengal' && u.role !== 'admin').length}</span>
                <span>WB Active Jobs: {jobs.filter((j) => j.state === 'West Bengal').length}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Bihar Coverage</h3>
              <p className="text-xs text-slate-600 mb-2">
                All 38 districts configured: Patna, Gaya, Bhagalpur, Muzaffarpur, Darbhanga, Purnia, Rohtas, Saran, Nalanda, Begusarai, etc.
              </p>
              <div className="flex justify-between text-xs text-slate-500 pt-2 border-t">
                <span>Bihar Candidates: {users.filter((u) => u.state === 'Bihar' && u.role !== 'admin').length}</span>
                <span>Bihar Active Jobs: {jobs.filter((j) => j.state === 'Bihar').length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: LOAN SERVICES & AFFILIATE LINKS MANAGEMENT */}
      {activeSubTab === 'loans' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>Loan Services & Dynamic Affiliate Links (ঋণ সেবা ও লিংক ব্যবস্থাপনা)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Update loan names, maximum amounts, and external affiliate links dynamically. Changes reflect instantly in candidate views.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetDefaultLoans}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Reset to default Masud Digital Hub verified loan partners"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={() => {
                  setLoanName('');
                  setLoanNameBengali('');
                  setLoanMaxAmount('Up to ₹5,00,000');
                  setLoanAffiliateLink('');
                  setLoanInterestRate('Starting @ 10.5% p.a.');
                  setLoanTenure('3 to 60 Months');
                  setLoanProcessingTime('Instant 15-Min Disbursal');
                  setLoanCategory('personal');
                  setLoanProvider('Masud Digital Hub Partner NBFC');
                  setLoanBadge('⚡ Instant Approval');
                  setLoanFeatures('100% Online Paperless Approval\nNo collateral or security needed\nDirect instant bank transfer');
                  setLoanIsActive(true);
                  setLoanFormError(null);
                  setShowAddLoanModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Loan Card</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[11px] text-slate-400 block font-medium">Total Loan Cards</span>
              <span className="text-xl font-black text-slate-900">{loans.length}</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[11px] text-slate-400 block font-medium">Active Offers</span>
              <span className="text-xl font-black text-emerald-700">{loans.filter((l) => l.isActive).length}</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[11px] text-slate-400 block font-medium">Personal & Micro</span>
              <span className="text-xl font-black text-blue-700">
                {loans.filter((l) => l.category === 'personal' || l.category === 'micro').length}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[11px] text-slate-400 block font-medium">Business & Asset</span>
              <span className="text-xl font-black text-amber-600">
                {loans.filter((l) => l.category === 'business' || l.category === 'vehicle' || l.category === 'gold' || l.category === 'education').length}
              </span>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by loan name, provider, max amount, or affiliate link..."
                value={loanSearchQuery}
                onChange={(e) => setLoanSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={loanCategoryFilter}
              onChange={(e) => setLoanCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
            >
              <option value="all">All Categories</option>
              <option value="personal">Personal Loan</option>
              <option value="business">Business / MSME</option>
              <option value="micro">Micro / Aadhaar</option>
              <option value="vehicle">Two-Wheeler / Bike</option>
              <option value="education">Education & Skill</option>
              <option value="gold">Gold Loan</option>
            </select>
          </div>

          {/* Loan Cards List */}
          <div className="space-y-3">
            {loans
              .filter((l) => {
                if (loanCategoryFilter !== 'all' && l.category !== loanCategoryFilter) return false;
                if (loanSearchQuery.trim()) {
                  const q = loanSearchQuery.toLowerCase();
                  const match =
                    l.name.toLowerCase().includes(q) ||
                    (l.nameBengali && l.nameBengali.toLowerCase().includes(q)) ||
                    l.maxAmount.toLowerCase().includes(q) ||
                    (l.provider && l.provider.toLowerCase().includes(q)) ||
                    l.affiliateLink.toLowerCase().includes(q);
                  if (!match) return false;
                }
                return true;
              })
              .map((loan) => (
                <div
                  key={loan.id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all ${
                    loan.isActive ? 'border-slate-200 shadow-xs' : 'border-dashed border-slate-300 opacity-75 bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Loan Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                          {loan.category}
                        </span>
                        {loan.badge && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                            {loan.badge}
                          </span>
                        )}
                        <span
                          onClick={() => handleToggleLoanStatus(loan.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            loan.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {loan.isActive ? '● Active in App' : '○ Inactive / Hidden'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-baseline gap-2">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900">{loan.name}</h3>
                        {loan.nameBengali && (
                          <span className="text-xs text-emerald-800 font-medium">({loan.nameBengali})</span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                        <span className="font-semibold text-slate-700">
                          Max Amount:{' '}
                          <span className="font-mono font-black text-emerald-700 text-sm">{loan.maxAmount}</span>
                        </span>
                        {loan.interestRate && <span>Interest: {loan.interestRate}</span>}
                        {loan.tenure && <span>Tenure: {loan.tenure}</span>}
                        {loan.processingTime && <span>Speed: {loan.processingTime}</span>}
                        {loan.provider && <span>Provider: {loan.provider}</span>}
                      </div>

                      {/* Dynamic Affiliate Link Management Box */}
                      <div className="pt-2">
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/90 space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                            <span className="flex items-center gap-1.5 text-slate-800 font-bold">
                              <Link2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>Affiliate Link (আবেদন রিডাইরেক্ট লিংক):</span>
                            </span>
                            {quickSaveSuccessId === loan.id && (
                              <span className="text-emerald-700 text-[11px] font-bold animate-pulse">
                                ✓ Link Saved Successfully!
                              </span>
                            )}
                          </div>

                          {inlineEditLoanId === loan.id ? (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="url"
                                value={inlineLinkInput}
                                onChange={(e) => setInlineLinkInput(e.target.value)}
                                placeholder="https://example.com/apply-loan?ref=..."
                                className="flex-1 px-3 py-1.5 rounded-lg border border-blue-400 bg-white font-mono text-xs outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleQuickSaveAffiliateLink(loan.id)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                                >
                                  Save Link
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInlineEditLoanId(null);
                                    setInlineLinkInput('');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="font-mono text-xs text-blue-700 truncate max-w-lg select-all bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                {loan.affiliateLink}
                              </span>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInlineEditLoanId(loan.id);
                                    setInlineLinkInput(loan.affiliateLink);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 flex items-center gap-1 cursor-pointer"
                                  title="Edit Affiliate Link"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Edit Link</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleCopyAffiliateLink(loan)}
                                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer"
                                  title="Copy Link to Clipboard"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                {copiedLoanId === loan.id && (
                                  <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                                )}

                                <a
                                  href={loan.affiliateLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                                  title="Test this affiliate link in a new tab"
                                >
                                  <span>Test Link</span>
                                  <ExternalLink className="w-3 h-3 text-amber-300" />
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions on right */}
                    <div className="flex lg:flex-col items-center justify-end gap-2 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-4 shrink-0">
                      <button
                        onClick={() => handleStartEditLoan(loan)}
                        className="flex-1 lg:flex-none px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Edit Card Details</span>
                      </button>

                      <button
                        onClick={() => handleToggleLoanStatus(loan.id)}
                        className={`flex-1 lg:flex-none px-3 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                          loan.isActive ? 'text-amber-700 hover:bg-amber-50' : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        <span>{loan.isActive ? 'Hide Offer' : 'Show in App'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteLoan(loan.id)}
                        className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Delete Loan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: POST NEW JOB */}
      {/* ========================================================================= */}
      {showAddJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Post New Job Listing (নতুন চাকরির বিজ্ঞপ্তি)</h3>
              </div>
              <button
                onClick={() => setShowAddJobModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 overflow-y-auto space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Electrician / Delivery Associate"
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Company / Employer Name *
                  </label>
                  <input
                    type="text"
                    value={jobCompany}
                    onChange={(e) => setJobCompany(e.target.value)}
                    placeholder="e.g. Bengal Logistics Pvt Ltd"
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Salary Details *
                  </label>
                  <input
                    type="text"
                    value={jobSalary}
                    onChange={(e) => setJobSalary(e.target.value)}
                    placeholder="e.g. ₹16,000 - ₹22,000 / month"
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Shift Timings *
                  </label>
                  <input
                    type="text"
                    value={jobShiftTimings}
                    onChange={(e) => setJobShiftTimings(e.target.value)}
                    placeholder="e.g. 9:00 AM - 6:00 PM (Day Shift)"
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    State (West Bengal or Bihar) *
                  </label>
                  <select
                    value={jobState}
                    onChange={(e) => handleJobStateChange(e.target.value as StateType)}
                    className="w-full px-3 py-2 border rounded-xl outline-none bg-white"
                  >
                    {SUPPORTED_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    District *
                  </label>
                  <select
                    value={jobDistrict}
                    onChange={(e) => setJobDistrict(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none bg-white"
                  >
                    {DISTRICTS_BY_STATE[jobState].map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Contact Person 10-Digit Mobile *
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={jobContactNumber}
                    onChange={(e) => setJobContactNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Recruiter Mobile"
                    className="w-full px-3 py-2 border rounded-xl font-mono outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Open Vacancies
                  </label>
                  <input
                    type="number"
                    value={jobVacancies}
                    onChange={(e) => setJobVacancies(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Specific Work Area / Landmark / Address (Optional)
                </label>
                <input
                  type="text"
                  value={jobSpecificLocation}
                  onChange={(e) => setJobSpecificLocation(e.target.value)}
                  placeholder="e.g. Sector V, Barasat Junction, Fraser Road, Bailey Road"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Job Description & Work Profile
                </label>
                <textarea
                  rows={3}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Details about responsibilities, qualifications, overtime bonuses, and required documents..."
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              {jobFormError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{jobFormError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddJobModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer transition-colors"
                >
                  Publish Real Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT EXISTING JOB LISTING */}
      {/* ========================================================================= */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Edit Job Listing ({editingJob.title})</h3>
              </div>
              <button
                onClick={() => setEditingJob(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditJob} className="p-6 overflow-y-auto space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={editJobTitle}
                    onChange={(e) => setEditJobTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Company / Employer Name *
                  </label>
                  <input
                    type="text"
                    value={editJobCompany}
                    onChange={(e) => setEditJobCompany(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Salary Details *
                  </label>
                  <input
                    type="text"
                    value={editJobSalary}
                    onChange={(e) => setEditJobSalary(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Shift Timings *
                  </label>
                  <input
                    type="text"
                    value={editJobShiftTimings}
                    onChange={(e) => setEditJobShiftTimings(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    State (West Bengal or Bihar) *
                  </label>
                  <select
                    value={editJobState}
                    onChange={(e) => handleEditJobStateChange(e.target.value as StateType)}
                    className="w-full px-3 py-2 border rounded-xl outline-none bg-white"
                  >
                    {SUPPORTED_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    District *
                  </label>
                  <select
                    value={editJobDistrict}
                    onChange={(e) => setEditJobDistrict(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none bg-white"
                  >
                    {DISTRICTS_BY_STATE[editJobState].map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Contact Person 10-Digit Mobile *
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={editJobContactNumber}
                    onChange={(e) => setEditJobContactNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3 py-2 border rounded-xl font-mono outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Open Vacancies
                  </label>
                  <input
                    type="number"
                    value={editJobVacancies}
                    onChange={(e) => setEditJobVacancies(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Specific Work Area / Landmark / Address
                </label>
                <input
                  type="text"
                  value={editJobSpecificLocation}
                  onChange={(e) => setEditJobSpecificLocation(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Job Description & Work Profile
                </label>
                <textarea
                  rows={3}
                  value={editJobDescription}
                  onChange={(e) => setEditJobDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              {editJobError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editJobError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteJob(editingJob.id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Job</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingJob(null)}
                    className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow cursor-pointer transition-colors"
                  >
                    Save Job Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD NEW CANDIDATE USER */}
      {/* ========================================================================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Add New Candidate Account</h3>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">10-Digit Mobile Number *</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={newUserMobile}
                  onChange={(e) => setNewUserMobile(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3 py-2 border rounded-xl font-mono outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="text"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <select
                    value={newUserState}
                    onChange={(e) => {
                      const st = e.target.value as StateType;
                      setNewUserState(st);
                      setNewUserDistrict(DISTRICTS_BY_STATE[st][0]);
                    }}
                    className="w-full px-2 py-2 border rounded-xl bg-white"
                  >
                    <option value="West Bengal">West Bengal</option>
                    <option value="Bihar">Bihar</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">District</label>
                  <select
                    value={newUserDistrict}
                    onChange={(e) => setNewUserDistrict(e.target.value)}
                    className="w-full px-2 py-2 border rounded-xl bg-white"
                  >
                    {DISTRICTS_BY_STATE[newUserState].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Address / Landmark (Optional)</label>
                <input
                  type="text"
                  value={newUserAddress}
                  onChange={(e) => setNewUserAddress(e.target.value)}
                  placeholder="Street, post office, village/city, PIN code"
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={newUserIsActive}
                  onChange={(e) => setNewUserIsActive(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="activeCheck" className="font-semibold text-slate-700 cursor-pointer">
                  Mark as Active (₹50 Joining Fee Waived / Paid)
                </label>
              </div>

              {userFormError && (
                <div className="p-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl">
                  {userFormError}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT EXISTING CANDIDATE USER (Name, Mobile, Password, Address, Status) */}
      {/* ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Edit Candidate: {editingUser.fullName}</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">10-Digit Mobile Number *</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={editUserMobile}
                  onChange={(e) => setEditUserMobile(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3 py-2 border rounded-xl font-mono outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="text"
                  value={editUserPassword}
                  onChange={(e) => setEditUserPassword(e.target.value)}
                  placeholder="Leave as is or enter new password"
                  className="w-full px-3 py-2 border rounded-xl font-mono outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <select
                    value={editUserState}
                    onChange={(e) => {
                      const st = e.target.value as StateType;
                      setEditUserState(st);
                      setEditUserDistrict(DISTRICTS_BY_STATE[st][0]);
                    }}
                    className="w-full px-2 py-2 border rounded-xl bg-white"
                  >
                    <option value="West Bengal">West Bengal</option>
                    <option value="Bihar">Bihar</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">District</label>
                  <select
                    value={editUserDistrict}
                    onChange={(e) => setEditUserDistrict(e.target.value)}
                    className="w-full px-2 py-2 border rounded-xl bg-white"
                  >
                    {DISTRICTS_BY_STATE[editUserState].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact & Residential Address</label>
                <textarea
                  rows={2}
                  value={editUserAddress}
                  onChange={(e) => setEditUserAddress(e.target.value)}
                  placeholder="Street, post office, village/city, PIN code"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">System Role</label>
                  <select
                    value={editUserRole}
                    onChange={(e) => setEditUserRole(e.target.value as 'user' | 'admin')}
                    className="w-full px-2 py-1.5 border rounded-xl bg-white font-bold"
                  >
                    <option value="user">Candidate / User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      id="editActiveCheck"
                      checked={editUserIsActive}
                      onChange={(e) => setEditUserIsActive(e.target.checked)}
                      className="rounded text-emerald-600 cursor-pointer"
                    />
                    <label htmlFor="editActiveCheck" className="font-semibold text-slate-700 cursor-pointer text-[11px]">
                      ₹50 Membership Active
                    </label>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      id="editBlockedCheck"
                      checked={editUserIsBlocked}
                      onChange={(e) => setEditUserIsBlocked(e.target.checked)}
                      className="rounded text-rose-600 cursor-pointer"
                    />
                    <label htmlFor="editBlockedCheck" className="font-semibold text-rose-700 cursor-pointer text-[11px]">
                      Account Blocked
                    </label>
                  </div>
                </div>
              </div>

              {editUserError && (
                <div className="p-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl">
                  {editUserError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                {editingUser.role !== 'admin' ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(editingUser.id)}
                    className="text-rose-600 hover:bg-rose-50 px-2 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete User</span>
                  </button>
                ) : <span />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 border rounded-xl text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD NEW DISTRICT BRANCH OFFICE ADDRESS */}
      {/* ========================================================================= */}
      {showAddBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Add Regional Branch Office Address</h3>
              </div>
              <button
                onClick={() => setShowAddBranchModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBranch} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Branch Office / Hub Name *
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g. North Bengal Regional Hub / Howrah Desk"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Physical Office Address *
                </label>
                <textarea
                  rows={3}
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  placeholder="Building name, road, near landmark, district, state, PIN code..."
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={branchPhone}
                  onChange={(e) => setBranchPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3 py-2 border rounded-xl font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBranchModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Save Branch Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: EDIT EXISTING DISTRICT BRANCH OFFICE ADDRESS */}
      {/* ========================================================================= */}
      {editingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Edit Branch Office Address</h3>
              </div>
              <button
                onClick={() => setEditingBranch(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditBranch} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Branch Office / Hub Name *
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Physical Office Address *
                </label>
                <textarea
                  rows={3}
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={branchPhone}
                  onChange={(e) => setBranchPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3 py-2 border rounded-xl font-mono outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteBranch(editingBranch.id)}
                  className="text-rose-600 hover:bg-rose-50 px-2 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Address</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingBranch(null)}
                    className="px-4 py-2 border rounded-xl text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: ADD NEW LEARNING TUTORIAL */}
      {/* ========================================================================= */}
      {showAddVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Add Training Tutorial Module</h3>
              </div>
              <button
                onClick={() => setShowAddVideoModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVideo} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">English Title *</label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g. Electrician House Wiring Basics"
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bengali Title</label>
                  <input
                    type="text"
                    value={videoTitleBengali}
                    onChange={(e) => setVideoTitleBengali(e.target.value)}
                    placeholder="বাংলা শিরোনাম"
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hindi Title</label>
                  <input
                    type="text"
                    value={videoTitleHindi}
                    onChange={(e) => setVideoTitleHindi(e.target.value)}
                    placeholder="हिंदी शीर्षक"
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={videoCategory}
                    onChange={(e) => setVideoCategory(e.target.value as any)}
                    className="w-full px-2 py-2 border rounded-xl bg-white"
                  >
                    <option value="vocational">Vocational</option>
                    <option value="interview">Interview</option>
                    <option value="safety">Safety</option>
                    <option value="digital">Digital</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    placeholder="15 min"
                    className="w-full px-2 py-2 border rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Instructor</label>
                  <input
                    type="text"
                    value={videoInstructor}
                    onChange={(e) => setVideoInstructor(e.target.value)}
                    className="w-full px-2 py-2 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="Summary of tutorial lesson..."
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Key Learning Points (One per line)</label>
                <textarea
                  rows={2}
                  value={videoKeyPoints}
                  onChange={(e) => setVideoKeyPoints(e.target.value)}
                  placeholder="Safety tools&#10;Wire connection rules"
                  className="w-full px-3 py-2 border rounded-xl outline-none font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddVideoModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Add Tutorial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: EDIT EXISTING LEARNING TUTORIAL */}
      {/* ========================================================================= */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Edit Tutorial Module</h3>
              </div>
              <button
                onClick={() => setEditingVideo(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditVideo} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">English Title *</label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bengali Title</label>
                  <input
                    type="text"
                    value={videoTitleBengali}
                    onChange={(e) => setVideoTitleBengali(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hindi Title</label>
                  <input
                    type="text"
                    value={videoTitleHindi}
                    onChange={(e) => setVideoTitleHindi(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={videoCategory}
                    onChange={(e) => setVideoCategory(e.target.value as any)}
                    className="w-full px-2 py-2 border rounded-xl bg-white"
                  >
                    <option value="vocational">Vocational</option>
                    <option value="interview">Interview</option>
                    <option value="safety">Safety</option>
                    <option value="digital">Digital</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    className="w-full px-2 py-2 border rounded-xl outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Instructor</label>
                  <input
                    type="text"
                    value={videoInstructor}
                    onChange={(e) => setVideoInstructor(e.target.value)}
                    className="w-full px-2 py-2 border rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Key Learning Points (One per line)</label>
                <textarea
                  rows={2}
                  value={videoKeyPoints}
                  onChange={(e) => setVideoKeyPoints(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none font-mono text-[11px] focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteVideo(editingVideo.id)}
                  className="text-rose-600 hover:bg-rose-50 px-2 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Module</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingVideo(null)}
                    className="px-4 py-2 border rounded-xl text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD NEW LOAN CARD */}
      {/* ========================================================================= */}
      {showAddLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Add New Loan Offering (নতুন ঋণ সেবা যোগ করুন)</h3>
              </div>
              <button
                onClick={() => setShowAddLoanModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="p-6 overflow-y-auto space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loan Name (English) *</label>
                  <input
                    type="text"
                    value={loanName}
                    onChange={(e) => setLoanName(e.target.value)}
                    placeholder="e.g. Personal Instant Cash Loan"
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bengali Title (বাংলা নাম)</label>
                  <input
                    type="text"
                    value={loanNameBengali}
                    onChange={(e) => setLoanNameBengali(e.target.value)}
                    placeholder="e.g. পার্সোনাল ইনস্ট্যান্ট ক্যাশ লোন"
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Maximum Loan Amount *</label>
                  <input
                    type="text"
                    value={loanMaxAmount}
                    onChange={(e) => setLoanMaxAmount(e.target.value)}
                    placeholder="e.g. Up to ₹5,00,000"
                    className="w-full px-3 py-2 border rounded-xl font-bold font-mono outline-none focus:border-emerald-500 text-emerald-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={loanCategory}
                    onChange={(e) => setLoanCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-emerald-500"
                  >
                    <option value="personal">Personal Loan</option>
                    <option value="business">Business / MSME</option>
                    <option value="micro">Micro / Aadhaar Loan</option>
                    <option value="vehicle">Two-Wheeler / Bike</option>
                    <option value="education">Skill & Education</option>
                    <option value="gold">Gold Loan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  External Affiliate Application Link (এফিলিয়েট রিডাইরেক্ট লিংক) *
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={loanAffiliateLink}
                    onChange={(e) => setLoanAffiliateLink(e.target.value)}
                    placeholder="https://affiliate-partner.com/apply?aff_id=masud_hub"
                    className="w-full pl-9 pr-3 py-2 border border-blue-400 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  When users click "Apply Now", they will be redirected to this external URL in a new browser tab.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Interest Rate</label>
                  <input
                    type="text"
                    value={loanInterestRate}
                    onChange={(e) => setLoanInterestRate(e.target.value)}
                    placeholder="e.g. From 10.49% p.a."
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tenure</label>
                  <input
                    type="text"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(e.target.value)}
                    placeholder="e.g. 3 to 60 Months"
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Processing Speed</label>
                  <input
                    type="text"
                    value={loanProcessingTime}
                    onChange={(e) => setLoanProcessingTime(e.target.value)}
                    placeholder="e.g. 15-Min Disbursal"
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Provider / NBFC Name</label>
                  <input
                    type="text"
                    value={loanProvider}
                    onChange={(e) => setLoanProvider(e.target.value)}
                    placeholder="e.g. Masud Digital Hub Partner Bank"
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Highlight Badge</label>
                  <input
                    type="text"
                    value={loanBadge}
                    onChange={(e) => setLoanBadge(e.target.value)}
                    placeholder="e.g. ⚡ Instant Approval"
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Key Features (One per line)</label>
                <textarea
                  rows={3}
                  value={loanFeatures}
                  onChange={(e) => setLoanFeatures(e.target.value)}
                  placeholder="100% Online Paperless Approval&#10;No physical collateral needed&#10;Direct bank credit"
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="addLoanIsActive"
                  checked={loanIsActive}
                  onChange={(e) => setLoanIsActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <label htmlFor="addLoanIsActive" className="font-semibold text-slate-700 cursor-pointer">
                  Activate & show in candidate app immediately
                </label>
              </div>

              {loanFormError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loanFormError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddLoanModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer transition-colors"
                >
                  Publish Loan Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: EDIT EXISTING LOAN DETAILS & AFFILIATE LINK */}
      {/* ========================================================================= */}
      {editingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Edit Loan Offering ({editingLoan.name})</h3>
              </div>
              <button
                onClick={() => setEditingLoan(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditLoan} className="p-6 overflow-y-auto space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loan Name *</label>
                  <input
                    type="text"
                    value={loanName}
                    onChange={(e) => setLoanName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bengali Title (বাংলা নাম)</label>
                  <input
                    type="text"
                    value={loanNameBengali}
                    onChange={(e) => setLoanNameBengali(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Maximum Loan Amount *</label>
                  <input
                    type="text"
                    value={loanMaxAmount}
                    onChange={(e) => setLoanMaxAmount(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-bold font-mono outline-none focus:border-blue-500 text-emerald-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={loanCategory}
                    onChange={(e) => setLoanCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-blue-500"
                  >
                    <option value="personal">Personal Loan</option>
                    <option value="business">Business / MSME</option>
                    <option value="micro">Micro / Aadhaar Loan</option>
                    <option value="vehicle">Two-Wheeler / Bike</option>
                    <option value="education">Skill & Education</option>
                    <option value="gold">Gold Loan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  External Affiliate Application Link (এফিলিয়েট লিংক) *
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={loanAffiliateLink}
                    onChange={(e) => setLoanAffiliateLink(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-blue-400 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Interest Rate</label>
                  <input
                    type="text"
                    value={loanInterestRate}
                    onChange={(e) => setLoanInterestRate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tenure</label>
                  <input
                    type="text"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Processing Speed</label>
                  <input
                    type="text"
                    value={loanProcessingTime}
                    onChange={(e) => setLoanProcessingTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Provider / NBFC Name</label>
                  <input
                    type="text"
                    value={loanProvider}
                    onChange={(e) => setLoanProvider(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Highlight Badge</label>
                  <input
                    type="text"
                    value={loanBadge}
                    onChange={(e) => setLoanBadge(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Key Features (One per line)</label>
                <textarea
                  rows={3}
                  value={loanFeatures}
                  onChange={(e) => setLoanFeatures(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editLoanIsActive"
                  checked={loanIsActive}
                  onChange={(e) => setLoanIsActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <label htmlFor="editLoanIsActive" className="font-semibold text-slate-700 cursor-pointer">
                  Offer is active and visible to candidates in app
                </label>
              </div>

              {loanFormError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loanFormError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteLoan(editingLoan.id);
                    setEditingLoan(null);
                  }}
                  className="text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Offer</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingLoan(null)}
                    className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow cursor-pointer transition-colors"
                  >
                    Save Loan Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
