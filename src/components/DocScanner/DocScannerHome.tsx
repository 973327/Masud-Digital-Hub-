import React, { useState, useEffect, useMemo } from 'react';
import { 
  Camera, 
  FolderPlus, 
  Search, 
  Filter, 
  Star, 
  Clock, 
  FileText, 
  Layers, 
  Plus, 
  MoreVertical, 
  Trash2, 
  Share2, 
  Folder, 
  Edit3, 
  Download, 
  Grid, 
  List, 
  CheckSquare, 
  Square, 
  Sparkles,
  ArrowUpDown,
  Calendar,
  Contact,
  CreditCard,
  Receipt,
  Award,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { ScannedDocument, DocFolder, DocCategory, ActiveAppView } from '../../types/docScanner';
import { 
  getAllDocuments, 
  getAllFolders, 
  toggleFavorite, 
  deleteDocument, 
  bulkDeleteDocuments, 
  moveDocumentsToFolder,
  exportDocumentToPdf,
  downloadBlob 
} from '../../services/docStorage';
import { CameraScanner } from './CameraScanner';
import { AddDocumentBottomSheet } from './AddDocumentBottomSheet';
import { FolderManagerModal } from './FolderManagerModal';
import { DocumentViewerModal } from './DocumentViewerModal';
import { PdfToolsSuite } from './PdfToolsSuite';
import { IdPhotoStudio } from './IdPhotoStudio';

const CATEGORIES: { id: DocCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Docs', icon: <FileText className="w-3.5 h-3.5 text-blue-600" /> },
  { id: 'business_cards', label: 'Business Cards', icon: <Contact className="w-3.5 h-3.5 text-cyan-600" /> },
  { id: 'id_cards', label: 'ID Cards', icon: <CreditCard className="w-3.5 h-3.5 text-blue-600" /> },
  { id: 'bills', label: 'Bills & Receipts', icon: <Receipt className="w-3.5 h-3.5 text-emerald-600" /> },
  { id: 'business', label: 'Business', icon: <Layers className="w-3.5 h-3.5 text-amber-600" /> },
  { id: 'certificates', label: 'Certificates', icon: <Award className="w-3.5 h-3.5 text-rose-600" /> },
  { id: 'personal', label: 'Personal', icon: <Folder className="w-3.5 h-3.5 text-purple-600" /> },
];

export const DocScannerHome: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveAppView>('home');
  const [documents, setDocuments] = useState<ScannedDocument[]>([]);
  const [folders, setFolders] = useState<DocFolder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<DocCategory>('all');
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'pages'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [isAddSheetOpen, setIsAddSheetOpen] = useState<boolean>(false);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState<boolean>(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState<boolean>(false);
  const [viewingDoc, setViewingDoc] = useState<ScannedDocument | null>(null);
  const [initialScanImage, setInitialScanImage] = useState<File | undefined>(undefined);

  // Multi-select bulk actions
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());

  // Active target folder for imports
  const [targetFolderId, setTargetFolderId] = useState<string>('folder_personal');

  // Load documents and folders
  const loadData = async () => {
    setLoading(true);
    const [docs, flds] = await Promise.all([getAllDocuments(), getAllFolders()]);
    setDocuments(docs);
    setFolders(flds);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered & Sorted documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      if (onlyFavorites && !doc.isFavorite) return false;
      if (selectedCategory !== 'all' && doc.category !== selectedCategory) return false;
      if (selectedFolderFilter !== 'all' && doc.folderId !== selectedFolderFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = doc.title.toLowerCase().includes(q);
        const matchTags = doc.tags?.some(t => t.toLowerCase().includes(q));
        const matchText = doc.extractedText?.toLowerCase().includes(q);
        const matchOcr = doc.pages.some(p => p.ocrText?.toLowerCase().includes(q));
        return matchTitle || matchTags || matchText || matchOcr;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'pages') {
        return b.pageCount - a.pageCount;
      }
      return 0;
    });
  }, [documents, searchQuery, selectedCategory, selectedFolderFilter, onlyFavorites, sortBy]);

  // Recent documents (last 5 updated)
  const recentDocuments = useMemo(() => {
    return [...documents]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [documents]);

  const handleToggleFavorite = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedFav = await toggleFavorite(docId);
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, isFavorite: updatedFav } : d));
  };

  const handleDeleteSingle = async (docId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await deleteDocument(docId);
    setDocuments(prev => prev.filter(d => d.id !== docId));
    if (viewingDoc?.id === docId) setViewingDoc(null);
  };

  const handleBulkDelete = async () => {
    if (selectedDocIds.size === 0) return;
    await bulkDeleteDocuments(Array.from(selectedDocIds));
    setDocuments(prev => prev.filter(d => !selectedDocIds.has(d.id)));
    setSelectedDocIds(new Set());
    setIsSelectionMode(false);
  };

  const toggleSelectDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDocIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '120 KB';
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none pb-24">
      {/* ========================================================================= */}
      {/* 1. DARK NAVY BRAND HEADER */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#0b192c] text-white border-b border-slate-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <div 
            onClick={() => setActiveView('home')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  DocScan Pro
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  v2.6
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium -mt-0.5">
                Document Scanner & PDF Studio
              </p>
            </div>
          </div>

          {/* Top Segmented Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1 p-1 bg-slate-900 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveView('home')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeView === 'home' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Documents
            </button>
            <button
              onClick={() => setActiveView('pdf_tools')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeView === 'pdf_tools' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              PDF Tools
            </button>
            <button
              onClick={() => setActiveView('id_photo')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeView === 'id_photo' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              ID Photo Studio
            </button>
          </div>

          {/* Quick Action Group */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFolderModalOpen(true)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Folder Manager"
            >
              <FolderPlus className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setInitialScanImage(undefined);
                setIsCameraScannerOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 cursor-pointer transition-all active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Camera Scan</span>
            </button>
          </div>
        </div>

        {/* Mobile View Switcher Ribbon */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 px-2 py-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveView('home')}
            className={`py-1 px-3 rounded-xl transition-colors ${
              activeView === 'home' ? 'text-blue-400 bg-blue-950/80' : 'text-slate-400'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveView('pdf_tools')}
            className={`py-1 px-3 rounded-xl transition-colors ${
              activeView === 'pdf_tools' ? 'text-blue-400 bg-blue-950/80' : 'text-slate-400'
            }`}
          >
            PDF Tools
          </button>
          <button
            onClick={() => setActiveView('id_photo')}
            className={`py-1 px-3 rounded-xl transition-colors ${
              activeView === 'id_photo' ? 'text-blue-400 bg-blue-950/80' : 'text-slate-400'
            }`}
          >
            ID Photo
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN APPLICATION CONTENT */}
      {/* ========================================================================= */}
      <main className="max-w-6xl w-full mx-auto px-4 pt-5 space-y-6 flex-1">
        {activeView === 'pdf_tools' && <PdfToolsSuite />}
        {activeView === 'id_photo' && <IdPhotoStudio />}

        {activeView === 'home' && (
          <div className="space-y-6">
            {/* Search Bar & Quick Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search scanned documents, invoices, text..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  onClick={() => setOnlyFavorites(prev => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    onlyFavorites
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Filter Favourites"
                >
                  <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                  <span>Favourites</span>
                </button>

                <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-blue-600' : 'text-slate-400'}`}
                    title="Grid View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-blue-600' : 'text-slate-400'}`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Document Categories Ribbon */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/90'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Folder Carousel & Manage Button */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Folders ({folders.length})
                </span>
                <button
                  onClick={() => setIsFolderModalOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Manage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {/* All Folders Option */}
                <div
                  onClick={() => setSelectedFolderFilter('all')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedFolderFilter === 'all'
                      ? 'bg-blue-50/80 border-blue-400 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 mb-1.5">
                    <Folder className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">All Files</h4>
                  <p className="text-[10px] text-slate-400">{documents.length} docs</p>
                </div>

                {folders.slice(0, 5).map((f) => {
                  const count = documents.filter(d => d.folderId === f.id).length;
                  const isSelected = selectedFolderFilter === f.id;

                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFolderFilter(isSelected ? 'all' : f.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-400 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div
                        style={{ backgroundColor: `${f.color}20`, color: f.color }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center mb-1.5"
                      >
                        <Folder className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">{f.name}</h4>
                      <p className="text-[10px] text-slate-400">{count} docs</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Documents Quick Carousel (if no active search) */}
            {!searchQuery && selectedCategory === 'all' && selectedFolderFilter === 'all' && recentDocuments.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Recently Scanned
                </span>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {recentDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setViewingDoc(doc)}
                      className="min-w-[150px] max-w-[170px] bg-white rounded-2xl p-2.5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col group shrink-0"
                    >
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 mb-2 border border-slate-100 flex items-center justify-center">
                        <img src={doc.thumbnail} alt={doc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                        <span className="absolute bottom-1 right-1 bg-black/60 text-[9px] font-bold text-white px-1.5 py-0.2 rounded-md backdrop-blur-xs">
                          {doc.pageCount}p
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">{doc.title}</h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(doc.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents List & Grid Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    Documents ({filteredDocuments.length})
                  </span>
                  {selectedDocIds.size > 0 && (
                    <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                      {selectedDocIds.size} selected
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isSelectionMode ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleBulkDelete}
                        disabled={selectedDocIds.size === 0}
                        className="px-2.5 py-1 bg-rose-600 disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsSelectionMode(false);
                          setSelectedDocIds(new Set());
                        }}
                        className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsSelectionMode(true)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>

              {/* Empty state */}
              {filteredDocuments.length === 0 && (
                <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">No documents found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                      {searchQuery
                        ? `No document matching "${searchQuery}". Try different keywords.`
                        : 'Tap the blue Camera or Add Document button below to scan your first physical paper!'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddSheetOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Document</span>
                  </button>
                </div>
              )}

              {/* Grid View */}
              {viewMode === 'grid' && filteredDocuments.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {filteredDocuments.map((doc) => {
                    const isSelected = selectedDocIds.has(doc.id);

                    return (
                      <div
                        key={doc.id}
                        onClick={() => {
                          if (isSelectionMode) toggleSelectDoc(doc.id, { stopPropagation: () => {} } as any);
                          else setViewingDoc(doc);
                        }}
                        className={`bg-white rounded-2xl p-3 border transition-all cursor-pointer flex flex-col justify-between group ${
                          isSelected
                            ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
                            : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div>
                          {/* Thumbnail */}
                          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 mb-2 border border-slate-100 flex items-center justify-center">
                            <img src={doc.thumbnail} alt={doc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                            
                            {/* Page count badge */}
                            <span className="absolute bottom-1.5 right-1.5 bg-black/65 text-[10px] font-bold text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
                              {doc.pageCount} {doc.pageCount === 1 ? 'Page' : 'Pages'}
                            </span>

                            {/* Favorite Star */}
                            <button
                              onClick={(e) => handleToggleFavorite(doc.id, e)}
                              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-colors"
                            >
                              <Star className={`w-3.5 h-3.5 ${doc.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-white'}`} />
                            </button>

                            {/* Checkbox in selection mode */}
                            {isSelectionMode && (
                              <div className="absolute top-2 left-2">
                                {isSelected ? (
                                  <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-md border-2 border-white bg-black/30" />
                                )}
                              </div>
                            )}
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">{doc.title}</h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                            <span>{new Date(doc.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            <span>•</span>
                            <span className="font-mono">{formatFileSize(doc.sizeBytes)}</span>
                          </div>
                        </div>

                        {/* Quick action bar */}
                        <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 truncate max-w-[80px]">
                            {doc.category.replace('_', ' ')}
                          </span>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const blob = await exportDocumentToPdf(doc);
                              downloadBlob(blob, `${doc.title}.pdf`);
                            }}
                            className="p-1 hover:text-blue-600 rounded transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && filteredDocuments.length > 0 && (
                <div className="space-y-2">
                  {filteredDocuments.map((doc) => {
                    const isSelected = selectedDocIds.has(doc.id);

                    return (
                      <div
                        key={doc.id}
                        onClick={() => {
                          if (isSelectionMode) toggleSelectDoc(doc.id, { stopPropagation: () => {} } as any);
                          else setViewingDoc(doc);
                        }}
                        className={`p-3 bg-white rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {isSelectionMode && (
                            <div className="shrink-0">
                              {isSelected ? (
                                <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-md border-2 border-slate-300" />
                              )}
                            </div>
                          )}

                          <div className="w-11 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <img src={doc.thumbnail} alt={doc.title} className="w-full h-full object-cover" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{doc.title}</h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span>{doc.pageCount} {doc.pageCount === 1 ? 'Page' : 'Pages'}</span>
                              <span>•</span>
                              <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{formatFileSize(doc.sizeBytes)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => handleToggleFavorite(doc.id, e)}
                            className="p-1.5 text-slate-400 hover:text-amber-500"
                          >
                            <Star className={`w-4 h-4 ${doc.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const blob = await exportDocumentToPdf(doc);
                              downloadBlob(blob, `${doc.title}.pdf`);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. MOBILE FLOATING ACTION BUTTON (FAB) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
        <button
          onClick={() => setIsAddSheetOpen(true)}
          className="w-14 h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
          title="Add Document / Scan"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODALS & DRAWERS */}
      {/* ========================================================================= */}
      {/* Add Document Bottom Sheet */}
      <AddDocumentBottomSheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        onSelectScanCamera={() => {
          setInitialScanImage(undefined);
          setIsCameraScannerOpen(true);
        }}
        onSelectImportGallery={(file) => {
          setInitialScanImage(file);
          setIsCameraScannerOpen(true);
        }}
        onSelectImportPdf={async (file) => {
          // Store PDF in library as a document
          const newDoc: ScannedDocument = {
            id: `doc_${Date.now()}`,
            title: file.name.replace(/\.[^/.]+$/, ''),
            folderId: targetFolderId,
            category: 'business',
            pageCount: 1,
            pages: [
              {
                id: `page_${Date.now()}`,
                originalImageUrl: '',
                processedImageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="%23ffffff"><rect width="600" height="800" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="2"/><text x="180" y="380" font-family="sans-serif" font-weight="bold" font-size="28" fill="%232563eb">PDF DOCUMENT</text><text x="160" y="420" font-family="sans-serif" font-size="14" fill="%2364748b">${file.name}</text></svg>`,
                rotation: 0,
                filter: 'original',
                brightness: 100,
                contrast: 100,
              }
            ],
            thumbnail: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="%23ffffff"><rect width="600" height="800" fill="%23f8fafc"/><text x="180" y="380" font-family="sans-serif" font-weight="bold" font-size="28" fill="%232563eb">PDF</text></svg>`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isFavorite: false,
            fileType: 'imported_pdf',
            sizeBytes: file.size,
          };
          setDocuments(prev => [newDoc, ...prev]);
        }}
        onSelectImportDoc={(file) => {
          const newDoc: ScannedDocument = {
            id: `doc_${Date.now()}`,
            title: file.name.replace(/\.[^/.]+$/, ''),
            folderId: targetFolderId,
            category: 'other',
            pageCount: 1,
            pages: [
              {
                id: `page_${Date.now()}`,
                originalImageUrl: '',
                processedImageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="%23ffffff"><rect width="600" height="800" fill="%23f8fafc"/><text x="180" y="380" font-family="sans-serif" font-weight="bold" font-size="28" fill="%23475569">DOCUMENT</text></svg>`,
                rotation: 0,
                filter: 'original',
                brightness: 100,
                contrast: 100,
              }
            ],
            thumbnail: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="%23ffffff"><rect width="600" height="800" fill="%23f8fafc"/><text x="180" y="380" font-family="sans-serif" font-weight="bold" font-size="28" fill="%23475569">DOC</text></svg>`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isFavorite: false,
            fileType: 'scanned_pdf',
            sizeBytes: file.size,
          };
          setDocuments(prev => [newDoc, ...prev]);
        }}
        folders={folders}
        selectedFolderId={targetFolderId}
        onSelectFolder={(id) => setTargetFolderId(id)}
      />

      {/* Camera Document Scanner Fullscreen Modal */}
      {isCameraScannerOpen && (
        <CameraScanner
          onClose={() => setIsCameraScannerOpen(false)}
          initialFolderId={targetFolderId}
          initialImageFile={initialScanImage}
          onDocumentSaved={(newDoc) => {
            setDocuments(prev => [newDoc, ...prev]);
            setIsCameraScannerOpen(false);
            setViewingDoc(newDoc);
          }}
        />
      )}

      {/* Folder Manager Modal */}
      <FolderManagerModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        folders={folders}
        documents={documents}
        onFoldersUpdated={loadData}
        onSelectFolderFilter={(fid) => setSelectedFolderFilter(fid)}
      />

      {/* Document Viewer & Editor Fullscreen Modal */}
      {viewingDoc && (
        <DocumentViewerModal
          document={viewingDoc}
          isOpen={Boolean(viewingDoc)}
          onClose={() => setViewingDoc(null)}
          onDocumentUpdated={(updated) => {
            setDocuments(prev => prev.map(d => d.id === updated.id ? updated : d));
            setViewingDoc(updated);
          }}
          onDeleteDocument={handleDeleteSingle}
          folders={folders}
        />
      )}
    </div>
  );
};
