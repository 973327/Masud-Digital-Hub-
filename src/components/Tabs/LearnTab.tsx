import React, { useState } from 'react';
import { 
  PlayCircle, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Star, 
  Award, 
  Share2, 
  Volume2, 
  X,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { LearningVideo } from '../../types';
import { LEARNING_VIDEOS } from '../../data/learningVideos';

interface LearnTabProps {
  videos?: LearningVideo[];
  watchedVideoIds?: string[];
  onSelectVideo?: (video: LearningVideo) => void;
  onCompleteVideo?: (video: LearningVideo) => void;
  selectedVideoModal?: LearningVideo | null;
  onCloseVideoModal?: () => void;
}

export const LearnTab: React.FC<LearnTabProps> = ({
  videos = LEARNING_VIDEOS,
  watchedVideoIds = [],
  onSelectVideo,
  onCompleteVideo,
  selectedVideoModal: propSelectedVideo,
  onCloseVideoModal: propOnCloseVideo
}) => {
  const [internalSelectedVideo, setInternalSelectedVideo] = useState<LearningVideo | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'vocational' | 'interview' | 'safety' | 'digital'>('all');

  const activeVideo = propSelectedVideo !== undefined ? propSelectedVideo : internalSelectedVideo;
  const handleCloseVideo = () => {
    if (propOnCloseVideo) propOnCloseVideo();
    setInternalSelectedVideo(null);
  };

  const handleOpenVideo = (video: LearningVideo) => {
    if (onSelectVideo) onSelectVideo(video);
    if (onCompleteVideo) onCompleteVideo(video);
    setInternalSelectedVideo(video);
  };

  const filteredVideos = videos.filter((vid) => {
    if (activeCategory === 'all') return true;
    return vid.category === activeCategory;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Learn Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
            Masud Digital Hub Academy
          </span>
          <span className="text-xs text-slate-400">100% Free Training</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
          Educational & Training Video Tutorials (প্রশিক্ষণ ভিডিও)
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
          Upgrade your hands-on work skills, master interview questions, learn workplace safety rules, and gain an edge to secure higher salaries.
        </p>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            All Courses ({LEARNING_VIDEOS.length})
          </button>
          <button
            onClick={() => setActiveCategory('interview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'interview'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Job Interview Tips (ইন্টারভিউ)
          </button>
          <button
            onClick={() => setActiveCategory('vocational')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'vocational'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Vocational Trade Skills (কাজের দক্ষতা)
          </button>
          <button
            onClick={() => setActiveCategory('safety')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'safety'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Safety & Labor Rights (নিরাপত্তা ও আইন)
          </button>
          <button
            onClick={() => setActiveCategory('digital')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'digital'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Retail & Computer Basics (কম্পিউটার ও রিটেল)
          </button>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            onClick={() => handleOpenVideo(video)}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Thumbnail Container */}
              <div className={`h-40 bg-gradient-to-br ${video.thumbnailGradient} p-4 flex flex-col justify-between relative overflow-hidden`}>
                <div className="flex justify-between items-start z-10">
                  <span className="px-2.5 py-1 rounded-lg bg-black/40 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {video.duration}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                    {video.category}
                  </span>
                </div>

                {/* Center Play Icon */}
                <div className="w-14 h-14 rounded-full bg-white/95 group-hover:scale-110 transition-transform shadow-xl flex items-center justify-center text-emerald-600 mx-auto z-10">
                  <PlayCircle className="w-8 h-8 fill-emerald-600/20 text-emerald-600" />
                </div>

                <div className="z-10 flex justify-between items-center text-[11px] text-white/90">
                  <span>Instructor: {video.instructor}</span>
                  <span className="flex items-center gap-1 text-amber-300 font-bold">
                    <Star className="w-3 h-3 fill-amber-300" />
                    {video.rating}
                  </span>
                </div>
              </div>

              {/* Title & Details */}
              <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                  {video.title}
                </h3>

                {video.titleBengali && (
                  <p className="text-xs text-emerald-800 font-medium">
                    {video.titleBengali}
                  </p>
                )}

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {video.description}
                </p>
              </div>
            </div>

            {/* Bottom Key Topics Ribbon */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">{video.views} candidates watched</span>
              <span className="font-bold text-emerald-700 group-hover:underline flex items-center gap-1">
                Start Lesson
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Video Simulation Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                    {activeVideo.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Masud Digital Hub Masterclass • {activeVideo.duration}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseVideo}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated High-Res Video Player Canvas */}
            <div className={`w-full h-56 sm:h-72 bg-gradient-to-br ${activeVideo.thumbnailGradient} relative flex flex-col items-center justify-center text-white p-6 shadow-inner`}>
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/60 mb-3 shadow-2xl animate-pulse">
                <PlayCircle className="w-10 h-10 text-white fill-white/20" />
              </div>
              <p className="font-extrabold text-sm sm:text-base text-center max-w-md drop-shadow">
                {activeVideo.titleBengali || activeVideo.title}
              </p>
              <p className="text-xs text-white/80 mt-1">
                Instructor: {activeVideo.instructor}
              </p>

              {/* Simulated Video Progress Bar */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center gap-3 text-[11px] text-white/90">
                <span>04:15</span>
                <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-emerald-400 rounded-full" />
                </div>
                <span>{activeVideo.duration}</span>
                <Volume2 className="w-4 h-4" />
              </div>
            </div>

            {/* Lesson Breakdown & Action Items */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  Lesson Summary & Practical Guide
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  {activeVideo.description}
                </p>
              </div>

              {activeVideo.keyPoints && (
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-emerald-800 mb-2">
                    Key Practical Takeaways for Candidates:
                  </h4>
                  <div className="space-y-2">
                    {activeVideo.keyPoints.map((point, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-semibold text-slate-800">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Rated {activeVideo.rating} / 5 by verified job seekers
                </span>
                <button
                  onClick={handleCloseVideo}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
                >
                  Completed Lesson
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
