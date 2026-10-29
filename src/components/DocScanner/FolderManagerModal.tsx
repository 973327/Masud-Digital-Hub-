import React, { useState } from 'react';
import { 
  Folder, 
  FolderPlus, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  FolderCheck, 
  AlertTriangle 
} from 'lucide-react';
import { DocFolder, ScannedDocument } from '../../types/docScanner';
import { createFolder, renameFolder, deleteFolder } from '../../services/docStorage';

interface FolderManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: DocFolder[];
  documents: ScannedDocument[];
  onFoldersUpdated: () => void;
  onSelectFolderFilter?: (folderId: string) => void;
}

const COLOR_OPTIONS = [
  '#2563eb', // Blue
  '#16a34a', // Green
  '#d97706', // Amber
  '#9333ea', // Purple
  '#e11d48', // Rose
  '#0891b2', // Cyan
  '#475569', // Slate
];

export const FolderManagerModal: React.FC<FolderManagerModalProps> = ({
  isOpen,
  onClose,
  folders,
  documents,
  onFoldersUpdated,
  onSelectFolderFilter,
}) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#2563eb');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deletingFolder, setDeletingFolder] = useState<DocFolder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setIsSubmitting(true);
    await createFolder(newFolderName.trim(), selectedColor);
    setNewFolderName('');
    setIsSubmitting(false);
    onFoldersUpdated();
  };

  const handleSaveRename = async (id: string) => {
    if (!editName.trim()) return;
    await renameFolder(id, editName.trim());
    setEditingFolderId(null);
    onFoldersUpdated();
  };

  const handleConfirmDelete = async () => {
    if (!deletingFolder) return;
    await deleteFolder(deletingFolder.id);
    setDeletingFolder(null);
    onFoldersUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Manage Folders</h3>
              <p className="text-xs text-slate-500">Organize scanned files & categories</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Create new folder card */}
          <form onSubmit={handleCreate} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FolderPlus className="w-3.5 h-3.5 text-blue-600" />
              <span>Create New Folder</span>
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name (e.g. Tax Returns)"
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!newFolderName.trim() || isSubmitting}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Add
              </button>
            </div>

            {/* Color swatches */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500 font-medium">Color:</span>
              <div className="flex items-center gap-1.5">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      selectedColor === c ? 'scale-125 ring-2 ring-offset-1 ring-slate-800' : 'hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            </div>
          </form>

          {/* Folder list */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600">Your Folders ({folders.length})</span>
            <div className="space-y-1.5">
              {folders.map((folder) => {
                const count = documents.filter(d => d.folderId === folder.id).length;
                const isEditing = editingFolderId === folder.id;

                return (
                  <div
                    key={folder.id}
                    className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div
                        style={{ backgroundColor: folder.color }}
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      />
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 px-2 py-1 border border-blue-500 rounded-lg text-xs"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(folder.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingFolderId(null)}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            if (onSelectFolderFilter) {
                              onSelectFolderFilter(folder.id);
                              onClose();
                            }
                          }}
                          className="cursor-pointer truncate flex-1"
                        >
                          <h4 className="text-xs font-bold text-slate-900 truncate">{folder.name}</h4>
                          <span className="text-[11px] text-slate-500">{count} {count === 1 ? 'doc' : 'docs'}</span>
                        </div>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingFolderId(folder.id);
                            setEditName(folder.name);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                          title="Rename"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {!folder.isDefault && (
                          <button
                            onClick={() => setDeletingFolder(folder)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Alert Modal */}
        {deletingFolder && (
          <div className="p-4 bg-rose-50 border-t border-rose-200 space-y-2">
            <div className="flex items-start gap-2 text-rose-800 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>
                Delete <strong>{deletingFolder.name}</strong>? Documents inside will be preserved and moved to Personal.
              </span>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setDeletingFolder(null)}
                className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3 py-1 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-rose-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
