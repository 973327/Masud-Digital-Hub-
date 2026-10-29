import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Share2, 
  X, 
  Check, 
  User as UserIcon, 
  GraduationCap, 
  Briefcase, 
  Wrench, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Printer,
  Sparkles
} from 'lucide-react';
import { CVData, User, StateType } from '../../types';
import { DISTRICTS_BY_STATE, COMMON_SKILLS, EDUCATION_LEVELS } from '../../data/locations';
import { getStoredCVData, saveStoredCVData } from '../../services/storage';

interface CVMakerModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess?: (data: CVData) => void;
}

export const CVMakerModal: React.FC<CVMakerModalProps> = ({ user, isOpen, onClose, onSaveSuccess }) => {
  // Load saved draft or initialize from current user
  const savedDraft = getStoredCVData(user.id);

  const [activeStep, setActiveStep] = useState<'form' | 'preview'>('form');
  const [formTab, setFormTab] = useState<'personal' | 'education' | 'experience' | 'skills'>('personal');

  const [cvData, setCvData] = useState<CVData>(() => {
    if (savedDraft) return savedDraft;
    return {
      fullName: user.fullName || '',
      phone: user.mobileNumber || '',
      email: '',
      dob: '2000-01-01',
      gender: 'Male',
      address: '',
      district: user.district || 'Kolkata',
      state: user.state || 'West Bengal',
      pincode: '',
      languages: ['Bengali', 'Hindi'],
      educationLevel: '10th Pass (Madhyamik / Matric)',
      institution: '',
      passingYear: '2018',
      percentageOrGrade: '65%',
      isFresher: true,
      jobRole: '',
      companyName: '',
      experienceYears: '1 Year',
      jobResponsibilities: '',
      skills: ['Commercial Driving (LMV / HMV)', 'Basic Computer / Data Entry'],
      hasDrivingLicense: true,
      careerObjective: 'Hardworking and dedicated individual looking for an honest job opportunity with a growing company where I can apply my skills and support my family.'
    };
  });

  const [newSkill, setNewSkill] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveDraft = () => {
    saveStoredCVData(cvData, user.id);
    setSaveStatus('Draft saved successfully!');
    if (onSaveSuccess) onSaveSuccess(cvData);
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleAddSkill = (skill: string) => {
    if (!cvData.skills.includes(skill)) {
      setCvData({ ...cvData, skills: [...cvData.skills, skill] });
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setCvData({ ...cvData, skills: cvData.skills.filter(s => s !== skill) });
  };

  const handleCustomSkillAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !cvData.skills.includes(newSkill.trim())) {
      setCvData({ ...cvData, skills: [...cvData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*Masud Digital Hub CV Summary*\n` +
      `*Name:* ${cvData.fullName}\n` +
      `*Contact:* +91 ${cvData.phone}\n` +
      `*Location:* ${cvData.district}, ${cvData.state}\n` +
      `*Education:* ${cvData.educationLevel} (${cvData.institution || 'Recognized Board'})\n` +
      `*Experience:* ${cvData.isFresher ? 'Fresher' : `${cvData.experienceYears} as ${cvData.jobRole} at ${cvData.companyName}`}\n` +
      `*Key Skills:* ${cvData.skills.join(', ')}\n` +
      `*Driving License:* ${cvData.hasDrivingLicense ? 'Yes (Valid)' : 'No'}\n\n` +
      `_Generated via Masud Digital Hub Portal_`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Built-in CV Maker (বায়োডাটা প্রস্তুতকারক)
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                  Instant PDF & WhatsApp
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Official CV format recognized across West Bengal & Bihar employers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveStep(activeStep === 'form' ? 'preview' : 'form')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeStep === 'preview'
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {activeStep === 'form' ? 'View Live Preview' : 'Edit CV Details'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {activeStep === 'form' ? (
            /* Form Mode */
            <div className="max-w-2xl mx-auto space-y-5">
              {/* Step Navigation Pill */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/80 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setFormTab('personal')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    formTab === 'personal' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  1. Personal
                </button>
                <button
                  type="button"
                  onClick={() => setFormTab('education')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    formTab === 'education' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  2. Education
                </button>
                <button
                  type="button"
                  onClick={() => setFormTab('experience')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    formTab === 'experience' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  3. Experience
                </button>
                <button
                  type="button"
                  onClick={() => setFormTab('skills')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    formTab === 'skills' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  4. Skills & Bio
                </button>
              </div>

              {/* Form Content by Tab */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                {formTab === 'personal' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                      <UserIcon className="w-4 h-4 text-emerald-600" />
                      Personal Information
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={cvData.fullName}
                          onChange={(e) => setCvData({ ...cvData, fullName: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          value={cvData.phone}
                          onChange={(e) => setCvData({ ...cvData, phone: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Email Address (Optional)
                        </label>
                        <input
                          type="email"
                          value={cvData.email}
                          onChange={(e) => setCvData({ ...cvData, email: e.target.value })}
                          placeholder="e.g. yourname@gmail.com"
                          className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={cvData.dob}
                          onChange={(e) => setCvData({ ...cvData, dob: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Gender
                        </label>
                        <select
                          value={cvData.gender}
                          onChange={(e) => setCvData({ ...cvData, gender: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-xs outline-none bg-white"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          State
                        </label>
                        <select
                          value={cvData.state}
                          onChange={(e) => {
                            const st = e.target.value as StateType;
                            setCvData({
                              ...cvData,
                              state: st,
                              district: DISTRICTS_BY_STATE[st][0]
                            });
                          }}
                          className="w-full px-3 py-2 border rounded-xl text-xs outline-none bg-white"
                        >
                          <option value="West Bengal">West Bengal</option>
                          <option value="Bihar">Bihar</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          District
                        </label>
                        <select
                          value={cvData.district}
                          onChange={(e) => setCvData({ ...cvData, district: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-xs outline-none bg-white"
                        >
                          {DISTRICTS_BY_STATE[cvData.state].map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Pin Code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={cvData.pincode}
                          onChange={(e) => setCvData({ ...cvData, pincode: e.target.value })}
                          placeholder="e.g. 700001"
                          className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Village / Street Address
                      </label>
                      <input
                        type="text"
                        value={cvData.address}
                        onChange={(e) => setCvData({ ...cvData, address: e.target.value })}
                        placeholder="House no, Village/Town, Post Office, Police Station"
                        className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {formTab === 'education' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      Educational Qualifications
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Highest Qualification Level *
                        </label>
                        <select
                          value={cvData.educationLevel}
                          onChange={(e) => setCvData({ ...cvData, educationLevel: e.target.value })}
                          className="w-full px-3 py-2.5 border rounded-xl text-xs outline-none bg-white"
                        >
                          {EDUCATION_LEVELS.map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {lvl}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          School / Board / College / University Name
                        </label>
                        <input
                          type="text"
                          value={cvData.institution}
                          onChange={(e) => setCvData({ ...cvData, institution: e.target.value })}
                          placeholder="e.g. WBBSE / BSEB / Govt. ITI College"
                          className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Passing Year
                          </label>
                          <input
                            type="text"
                            maxLength={4}
                            value={cvData.passingYear}
                            onChange={(e) => setCvData({ ...cvData, passingYear: e.target.value })}
                            placeholder="e.g. 2019"
                            className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Percentage / Division / Grade
                          </label>
                          <input
                            type="text"
                            value={cvData.percentageOrGrade}
                            onChange={(e) => setCvData({ ...cvData, percentageOrGrade: e.target.value })}
                            placeholder="e.g. 68% / 1st Division"
                            className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {formTab === 'experience' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      Work Experience
                    </h4>

                    {/* Fresher vs Experienced Switch */}
                    <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="expType"
                          checked={cvData.isFresher}
                          onChange={() => setCvData({ ...cvData, isFresher: true })}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>I am a Fresher (নতুন কর্মী)</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="expType"
                          checked={!cvData.isFresher}
                          onChange={() => setCvData({ ...cvData, isFresher: false })}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Experienced (অভিজ্ঞ)</span>
                      </label>
                    </div>

                    {!cvData.isFresher && (
                      <div className="space-y-3 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Job Title / Role
                            </label>
                            <input
                              type="text"
                              value={cvData.jobRole}
                              onChange={(e) => setCvData({ ...cvData, jobRole: e.target.value })}
                              placeholder="e.g. Delivery Executive / Electrician"
                              className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Company / Employer Name
                            </label>
                            <input
                              type="text"
                              value={cvData.companyName}
                              onChange={(e) => setCvData({ ...cvData, companyName: e.target.value })}
                              placeholder="e.g. Swiggy / Local Electricals"
                              className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Duration / Experience Period
                          </label>
                          <input
                            type="text"
                            value={cvData.experienceYears}
                            onChange={(e) => setCvData({ ...cvData, experienceYears: e.target.value })}
                            placeholder="e.g. 1 Year 6 Months"
                            className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Key Responsibilities Handled
                          </label>
                          <textarea
                            rows={3}
                            value={cvData.jobResponsibilities}
                            onChange={(e) => setCvData({ ...cvData, jobResponsibilities: e.target.value })}
                            placeholder="e.g. Delivered 25+ orders daily safely, operated hand drills, managed warehouse stock count..."
                            className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {formTab === 'skills' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                      <Wrench className="w-4 h-4 text-emerald-600" />
                      Skills, Licenses & Summary
                    </h4>

                    {/* Driving License Toggle */}
                    <div className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Do you hold a Valid Driving License?</p>
                        <p className="text-[11px] text-slate-500">Essential for delivery, driving & field roles</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCvData({ ...cvData, hasDrivingLicense: !cvData.hasDrivingLicense })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          cvData.hasDrivingLicense
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {cvData.hasDrivingLicense ? 'Yes, Valid DL' : 'No'}
                      </button>
                    </div>

                    {/* Selected Skills Chips */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Your Selected Skills (ক্লিক করে বাদ দিতে পারেন)
                      </label>
                      <div className="flex flex-wrap gap-1.5 min-h-12 p-2 bg-slate-50 rounded-xl border">
                        {cvData.skills.length === 0 && (
                          <span className="text-xs text-slate-400">No skills selected yet. Select from below:</span>
                        )}
                        {cvData.skills.map((skill) => (
                          <span
                            key={skill}
                            onClick={() => handleRemoveSkill(skill)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold hover:bg-red-100 hover:text-red-700 transition-colors cursor-pointer"
                          >
                            <span>{skill}</span>
                            <X className="w-3 h-3" />
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Quick Suggestions */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Tap to add common vocational skills:
                      </label>
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                        {COMMON_SKILLS.filter(s => !cvData.skills.includes(s)).map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleAddSkill(skill)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
                          >
                            + {skill}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Career Objective */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Career Objective / Summary Statement
                      </label>
                      <textarea
                        rows={3}
                        value={cvData.careerObjective}
                        onChange={(e) => setCvData({ ...cvData, careerObjective: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Form Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Save Draft
                </button>

                {saveStatus && (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {saveStatus}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    handleSaveDraft();
                    setActiveStep('preview');
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Preview & Generate CV</span>
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Live Preview & Printable A4 Sheet */
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Quick Action Ribbon */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-2xl border shadow-sm print:hidden">
                <span className="text-xs font-bold text-slate-700">
                  Ready for Employer Submission
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share on WhatsApp</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Download / Print PDF</span>
                  </button>
                </div>
              </div>

              {/* Rendered Resume Document (Styled for Clean Screen & Print) */}
              <div 
                id="printable-cv-document"
                className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-slate-800 print:shadow-none print:border-none print:p-0 print:m-0"
              >
                {/* CV Header */}
                <div className="border-b-2 border-emerald-600 pb-4 mb-5 flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                      {cvData.fullName || 'Candidate Name'}
                    </h1>
                    <p className="text-emerald-700 font-bold text-sm mt-0.5">
                      {cvData.isFresher ? 'Work Partner Candidate (Fresher)' : `${cvData.jobRole || 'Experienced Professional'}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {cvData.district}, {cvData.state} {cvData.pincode && `- ${cvData.pincode}`}
                    </p>
                  </div>

                  <div className="text-right text-xs space-y-1 text-slate-600">
                    <p className="font-bold flex items-center justify-end gap-1 text-slate-800">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      +91 {cvData.phone}
                    </p>
                    {cvData.email && (
                      <p className="flex items-center justify-end gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {cvData.email}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400">
                      Verified Member of Masud Digital Hub
                    </p>
                  </div>
                </div>

                {/* Career Objective */}
                <div className="mb-5">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded inline-block mb-2">
                    Career Objective
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{cvData.careerObjective}"
                  </p>
                </div>

                {/* Skills & Competencies */}
                <div className="mb-5">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded inline-block mb-2">
                    Key Vocational Skills & Capabilities
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {cvData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                    {cvData.hasDrivingLicense && (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                        ✓ Valid Driving License Holder
                      </span>
                    )}
                  </div>
                </div>

                {/* Work Experience */}
                <div className="mb-5">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded inline-block mb-2">
                    Work Experience
                  </h2>
                  {cvData.isFresher ? (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">Fresher (Energetic & Ready to Learn)</p>
                      <p className="mt-1">
                        Motivated to join immediately and undergo employer training with discipline and punctuality.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="border-l-2 border-emerald-500 pl-3">
                        <div className="flex justify-between items-baseline">
                          <h3 className="text-sm font-bold text-slate-800">{cvData.jobRole}</h3>
                          <span className="text-xs font-semibold text-slate-500">{cvData.experienceYears}</span>
                        </div>
                        <p className="text-xs font-medium text-emerald-700">{cvData.companyName}</p>
                        {cvData.jobResponsibilities && (
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {cvData.jobResponsibilities}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Education */}
                <div className="mb-5">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded inline-block mb-2">
                    Education & Credentials
                  </h2>
                  <div className="border rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b">
                        <tr>
                          <th className="p-2">Qualification</th>
                          <th className="p-2">Institution / Board</th>
                          <th className="p-2">Year</th>
                          <th className="p-2">Marks / Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-2 font-semibold text-slate-800">{cvData.educationLevel}</td>
                          <td className="p-2 text-slate-600">{cvData.institution || 'State Recognized'}</td>
                          <td className="p-2 text-slate-600">{cvData.passingYear}</td>
                          <td className="p-2 text-emerald-700 font-semibold">{cvData.percentageOrGrade}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Personal Profile Details */}
                <div className="mb-4">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded inline-block mb-2">
                    Personal Details
                  </h2>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                    <div>
                      <span className="font-semibold text-slate-500">Date of Birth: </span>
                      <span>{cvData.dob}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Gender: </span>
                      <span>{cvData.gender}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Languages Known: </span>
                      <span>Bengali, Hindi, Basic English</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Permanent Location: </span>
                      <span>{cvData.district}, {cvData.state}</span>
                    </div>
                  </div>
                </div>

                {/* Declaration Footer */}
                <div className="pt-4 border-t border-slate-200 mt-6 flex justify-between items-end text-[11px] text-slate-500">
                  <div>
                    <p>I hereby declare that the information provided above is true to the best of my knowledge.</p>
                    <p className="font-semibold text-slate-700 mt-1">Place: {cvData.district}, {cvData.state}</p>
                  </div>
                  <div className="text-right">
                    <div className="h-8"></div>
                    <p className="font-bold text-slate-800 border-t border-slate-400 pt-1">
                      {cvData.fullName}
                    </p>
                    <p className="text-[10px] text-slate-400">Signature / Applicant</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
