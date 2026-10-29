import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Phone, 
  Lock, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Briefcase, 
  AlertCircle, 
  KeyRound,
  Sparkles
} from 'lucide-react';
import { StateType, User, SupportConfig } from '../../types';
import { DISTRICTS_BY_STATE, SUPPORTED_STATES } from '../../data/locations';
import { ADMIN_CREDENTIALS } from '../../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onLogin: (user: User) => void;
  onRegisterSubmit: (newUser: User) => void;
  users: User[];
  supportConfig: SupportConfig;
  initialMode?: 'login' | 'register';
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onLogin,
  onRegisterSubmit,
  users,
  supportConfig,
  initialMode = 'login',
  onClose
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login form state
  const [loginMobile, setLoginMobile] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regState, setRegState] = useState<StateType>('West Bengal');
  const [regDistrict, setRegDistrict] = useState<string>(DISTRICTS_BY_STATE['West Bengal'][0]);
  const [regError, setRegError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle State Change to sync district dropdown
  const handleStateChange = (state: StateType) => {
    setRegState(state);
    const districts = DISTRICTS_BY_STATE[state];
    setRegDistrict(districts[0]);
  };

  // 1-Click "Switch to Admin Account" as required in prompt!
  const handleSwitchToAdmin = () => {
    setLoginMobile(ADMIN_CREDENTIALS.mobileNumber);
    setLoginPassword(ADMIN_CREDENTIALS.password);
    setLoginError(null);
    setMode('login');

    // Auto submit or find admin
    const adminUser = users.find(u => u.mobileNumber === ADMIN_CREDENTIALS.mobileNumber);
    if (adminUser) {
      onLogin(adminUser);
    } else {
      // Fallback create admin session
      const newAdmin: User = {
        id: 'admin-super-01',
        fullName: 'Masud Digital Hub Super Admin',
        mobileNumber: ADMIN_CREDENTIALS.mobileNumber,
        password: ADMIN_CREDENTIALS.password,
        state: 'West Bengal',
        district: 'Kolkata',
        isActive: true,
        isBlocked: false,
        role: 'admin',
        registrationDate: new Date().toISOString()
      };
      onLogin(newAdmin);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanNumber = loginMobile.trim().replace(/[^0-9]/g, '');
    if (cleanNumber.length !== 10) {
      setLoginError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!loginPassword.trim()) {
      setLoginError('Please enter your password.');
      return;
    }

    // Check admin credentials
    if (cleanNumber === ADMIN_CREDENTIALS.mobileNumber && loginPassword === ADMIN_CREDENTIALS.password) {
      const admin = users.find(u => u.mobileNumber === ADMIN_CREDENTIALS.mobileNumber) || {
        id: 'admin-super-01',
        fullName: 'Masud Digital Hub Super Admin',
        mobileNumber: ADMIN_CREDENTIALS.mobileNumber,
        password: ADMIN_CREDENTIALS.password,
        state: 'West Bengal' as StateType,
        district: 'Kolkata',
        isActive: true,
        isBlocked: false,
        role: 'admin' as const,
        registrationDate: new Date().toISOString()
      };
      onLogin(admin);
      return;
    }

    // Check existing registered users
    const foundUser = users.find(u => u.mobileNumber === cleanNumber);
    if (!foundUser) {
      setLoginError('No account found with this mobile number. Please register first.');
      return;
    }

    if (foundUser.isBlocked) {
      setLoginError('This account has been suspended by administration. Please contact helpline.');
      return;
    }

    if (foundUser.password && foundUser.password !== loginPassword) {
      setLoginError('Incorrect password. Please verify and try again.');
      return;
    }

    onLogin(foundUser);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regFullName.trim()) {
      setRegError('Please enter your Full Name.');
      return;
    }

    const cleanNumber = regMobile.trim().replace(/[^0-9]/g, '');
    if (cleanNumber.length !== 10) {
      setRegError('Please provide a valid 10-digit mobile number.');
      return;
    }

    if (regPassword.length < 4) {
      setRegError('Password should be at least 4 characters.');
      return;
    }

    // Check if mobile already exists
    const existing = users.find(u => u.mobileNumber === cleanNumber);
    if (existing) {
      setRegError('An account with this mobile number already exists. Please log in.');
      return;
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      fullName: regFullName.trim(),
      mobileNumber: cleanNumber,
      password: regPassword,
      state: regState,
      district: regDistrict,
      isActive: false, // will become active upon standard ₹50 UPI activation
      isBlocked: false,
      role: 'user',
      registrationDate: new Date().toISOString().split('T')[0]
    };

    onRegisterSubmit(newUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Top Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg tracking-tight leading-tight">
                  Masud Digital Hub
                </h3>
                <p className="text-emerald-100 text-xs">ডিজিটাল সেবা ও সাইবার ক্যাফে</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white p-1 rounded-full text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tab Toggle: Login vs Register */}
        <div className="flex border-b border-slate-100 bg-slate-50/80">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-xs font-bold transition-colors cursor-pointer ${
              mode === 'login'
                ? 'text-emerald-700 bg-white border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            User Login (লগইন)
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-xs font-bold transition-colors cursor-pointer ${
              mode === 'register'
                ? 'text-emerald-700 bg-white border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            New Registration (রেজিস্ট্রেশন)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  10-Digit Mobile Number (মোবাইল নম্বর)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={loginMobile}
                    onChange={(e) => setLoginMobile(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 10-digit number"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs text-slate-800 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password (পাসওয়ার্ড)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs text-slate-800 outline-none transition-all"
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Login to Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-500">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Register Now
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name (সম্পূর্ণ নাম / पूरा नाम) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Rahul Das / Amit Kumar"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs text-slate-800 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  10-Digit Mobile Number (মোবাইল নম্বর) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 10-digit number"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs text-slate-800 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Create Password (পাসওয়ার্ড তৈরি করুন) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 4 characters"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs text-slate-800 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* State and District Dropdown - Strictly West Bengal & Bihar as per prompt! */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State (রাজ্য / राज्य)
                  </label>
                  <select
                    value={regState}
                    onChange={(e) => handleStateChange(e.target.value as StateType)}
                    className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 text-xs text-slate-800 outline-none bg-white cursor-pointer"
                  >
                    {SUPPORTED_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    District (জেলা / ज़िला)
                  </label>
                  <select
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 text-xs text-slate-800 outline-none bg-white cursor-pointer"
                  >
                    {DISTRICTS_BY_STATE[regState].map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ₹50 Joining Fee Notice */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                  ₹
                </div>
                <div className="text-[11px] text-emerald-900">
                  <p className="font-bold">Standard ₹{supportConfig.joiningFee} One-Time Joining Fee</p>
                  <p className="text-emerald-700 text-[10px] leading-snug mt-0.5">
                    UPI Activation grants unlimited direct employer calls and built-in CV Maker downloads.
                  </p>
                </div>
              </div>

              {regError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to ₹{supportConfig.joiningFee} Activation</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <p className="text-xs text-slate-500">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Login here
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
