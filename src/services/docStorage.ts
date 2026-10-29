import { ScannedDocument, DocFolder, DocCategory, ScannedPage } from '../types/docScanner';
import { PDFDocument, PageSizes } from 'pdf-lib';

const DB_NAME = 'DocScanPro_DB';
const DB_VERSION = 1;
const DOCS_STORE = 'documents';
const FOLDERS_STORE = 'folders';

export const DEFAULT_FOLDERS: DocFolder[] = [
  { id: 'folder_id_cards', name: 'ID Cards', color: '#2563eb', createdAt: new Date().toISOString(), isDefault: true, iconName: 'credit-card' },
  { id: 'folder_bills', name: 'Bills & Receipts', color: '#16a34a', createdAt: new Date().toISOString(), isDefault: true, iconName: 'receipt' },
  { id: 'folder_business', name: 'Business Documents', color: '#d97706', createdAt: new Date().toISOString(), isDefault: true, iconName: 'briefcase' },
  { id: 'folder_personal', name: 'Personal Documents', color: '#9333ea', createdAt: new Date().toISOString(), isDefault: true, iconName: 'folder' },
  { id: 'folder_business_cards', name: 'Business Cards', color: '#0891b2', createdAt: new Date().toISOString(), isDefault: true, iconName: 'contact' },
  { id: 'folder_certificates', name: 'Certificates', color: '#e11d48', createdAt: new Date().toISOString(), isDefault: true, iconName: 'award' }
];

// In-memory fallback if IndexedDB is unavailable in sandbox
let memDocs: ScannedDocument[] = [];
let memFolders: DocFolder[] = [...DEFAULT_FOLDERS];

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(DOCS_STORE)) {
        db.createObjectStore(DOCS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(FOLDERS_STORE)) {
        db.createObjectStore(FOLDERS_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Seed initial sample documents if first run
 */
function createSampleDocuments(): ScannedDocument[] {
  // SVG-based clean high-fidelity document thumbnails
  const invoiceSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850" fill="%23ffffff"><rect width="600" height="850" fill="%23ffffff"/><rect x="40" y="40" width="520" height="770" rx="8" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="2"/><text x="70" y="90" font-family="sans-serif" font-weight="900" font-size="24" fill="%230f172a">TAX INVOICE</text><text x="70" y="115" font-family="sans-serif" font-size="12" fill="%2364748b">INV-2026-0891 • 24 Oct 2026</text><rect x="70" y="140" width="460" height="2" fill="%23e2e8f0"/><rect x="70" y="160" width="180" height="14" rx="3" fill="%23cbd5e1"/><rect x="70" y="185" width="280" height="10" rx="3" fill="%23e2e8f0"/><rect x="70" y="205" width="220" height="10" rx="3" fill="%23e2e8f0"/><rect x="70" y="260" width="460" height="35" rx="6" fill="%230f172a"/><text x="90" y="283" font-family="sans-serif" font-weight="bold" font-size="13" fill="%23ffffff">ITEM DESCRIPTION</text><text x="460" y="283" font-family="sans-serif" font-weight="bold" font-size="13" fill="%23ffffff">AMOUNT</text><rect x="70" y="310" width="460" height="40" rx="4" fill="%23f1f5f9"/><text x="90" y="335" font-family="sans-serif" font-size="13" fill="%231e293b">Commercial Scanning & Archiving</text><text x="470" y="335" font-family="sans-serif" font-weight="bold" font-size="13" fill="%231e293b">₹4,500</text><rect x="70" y="360" width="460" height="40" rx="4" fill="%23ffffff"/><text x="90" y="385" font-family="sans-serif" font-size="13" fill="%231e293b">PDF Extraction & OCR Indexing</text><text x="470" y="385" font-family="sans-serif" font-weight="bold" font-size="13" fill="%231e293b">₹1,850</text><rect x="70" y="420" width="460" height="2" fill="%23cbd5e1"/><text x="360" y="460" font-family="sans-serif" font-size="14" fill="%2364748b">Total Due:</text><text x="450" y="460" font-family="sans-serif" font-weight="900" font-size="18" fill="%2316a34a">₹6,350</text><rect x="70" y="520" width="200" height="80" rx="8" fill="%23ffffff" stroke="%2394a3b8" stroke-dasharray="4,4"/><text x="110" y="565" font-family="sans-serif" font-size="12" fill="%2364748b">Verified & Paid</text></svg>`;

  const cardSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380" fill="%230f172a"><rect width="600" height="380" rx="16" fill="%230f172a"/><circle cx="500" cy="80" r="120" fill="%232563eb" opacity="0.3"/><rect x="40" y="40" width="520" height="300" rx="12" fill="none" stroke="%23334155" stroke-width="2"/><text x="70" y="90" font-family="sans-serif" font-weight="900" font-size="24" fill="%23ffffff">ARUP BANERJEE</text><text x="70" y="115" font-family="sans-serif" font-weight="bold" font-size="13" fill="%2338bdf8">Managing Director • Horizon Technologies</text><line x1="70" y1="145" x2="320" y2="145" stroke="%2338bdf8" stroke-width="2"/><text x="70" y="180" font-family="sans-serif" font-size="12" fill="%23cbd5e1">📞 +91 98301 22450</text><text x="70" y="210" font-family="sans-serif" font-size="12" fill="%23cbd5e1">✉️ arup.b@horizontech.in</text><text x="70" y="240" font-family="sans-serif" font-size="12" fill="%23cbd5e1">🏢 Park Street Business Hub, Kolkata</text><rect x="440" y="200" width="80" height="80" rx="8" fill="%23ffffff"/><text x="455" y="245" font-family="sans-serif" font-size="10" fill="%230f172a">QR CODE</text></svg>`;

  const idSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23ffffff"><rect width="600" height="400" rx="16" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="3"/><rect x="0" y="0" width="600" height="70" rx="16" fill="%231e3a8a"/><text x="30" y="44" font-family="sans-serif" font-weight="bold" font-size="18" fill="%23ffffff">GOVERNMENT OF INDIA • IDENTITY CARD</text><rect x="40" y="100" width="130" height="160" rx="8" fill="%23e2e8f0" stroke="%2394a3b8"/><circle cx="105" cy="150" r="35" fill="%2364748b"/><path d="M65,230 Q105,190 145,230" fill="%2364748b"/><text x="190" y="130" font-family="sans-serif" font-weight="bold" font-size="16" fill="%230f172a">Name: RAHUL SHARMA</text><text x="190" y="160" font-family="sans-serif" font-size="13" fill="%23475569">DOB: 15/08/1994 | Gender: Male</text><text x="190" y="190" font-family="sans-serif" font-size="13" fill="%23475569">Issue Date: 12/04/2021</text><rect x="190" y="220" width="360" height="30" rx="4" fill="%23f1f5f9"/><text x="210" y="240" font-family="monospace" font-weight="bold" font-size="15" fill="%231e40af">XXXX - XXXX - 9842</text><rect x="40" y="290" width="520" height="70" rx="8" fill="%23f8fafc" stroke="%23e2e8f0"/><text x="60" y="325" font-family="sans-serif" font-size="11" fill="%2364748b">Verified Identity Document • Stored securely locally</text></svg>`;

  return [
    {
      id: 'doc_sample_invoice_01',
      title: 'Tax Invoice - Oct 2026',
      folderId: 'folder_bills',
      category: 'bills',
      pageCount: 1,
      thumbnail: invoiceSvg,
      pages: [
        {
          id: 'p1_inv',
          originalImageUrl: invoiceSvg,
          processedImageUrl: invoiceSvg,
          rotation: 0,
          filter: 'color',
          brightness: 100,
          contrast: 100,
          ocrText: 'TAX INVOICE INV-2026-0891 Commercial Scanning & Archiving ₹4,500 Total Due ₹6,350 Verified & Paid'
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      isFavorite: true,
      fileType: 'scanned_pdf',
      sizeBytes: 124000,
      tags: ['Tax', 'Invoice', 'October']
    },
    {
      id: 'doc_sample_card_02',
      title: 'Horizon Tech - Business Card',
      folderId: 'folder_business_cards',
      category: 'business_cards',
      pageCount: 1,
      thumbnail: cardSvg,
      pages: [
        {
          id: 'p1_card',
          originalImageUrl: cardSvg,
          processedImageUrl: cardSvg,
          rotation: 0,
          filter: 'original',
          brightness: 100,
          contrast: 100,
          ocrText: 'ARUP BANERJEE Managing Director Horizon Technologies +91 98301 22450 arup.b@horizontech.in Park Street Kolkata'
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      isFavorite: false,
      fileType: 'images',
      sizeBytes: 85000,
      tags: ['Visiting Card', 'Tech', 'Contact']
    },
    {
      id: 'doc_sample_id_03',
      title: 'National Identity Proof',
      folderId: 'folder_id_cards',
      category: 'id_cards',
      pageCount: 1,
      thumbnail: idSvg,
      pages: [
        {
          id: 'p1_id',
          originalImageUrl: idSvg,
          processedImageUrl: idSvg,
          rotation: 0,
          filter: 'color',
          brightness: 100,
          contrast: 100,
          ocrText: 'GOVERNMENT OF INDIA IDENTITY CARD RAHUL SHARMA 15/08/1994 XXXX-XXXX-9842 Verified Identity Document'
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      isFavorite: true,
      fileType: 'id_photo',
      sizeBytes: 98000,
      tags: ['ID', 'Verified']
    }
  ];
}

export async function getAllFolders(): Promise<DocFolder[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(FOLDERS_STORE, 'readonly');
      const store = tx.objectStore(FOLDERS_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        let folders = req.result as DocFolder[];
        if (!folders || folders.length === 0) {
          // initialize default folders
          saveDefaultFolders(DEFAULT_FOLDERS);
          resolve(DEFAULT_FOLDERS);
        } else {
          resolve(folders);
        }
      };
      req.onerror = () => resolve(memFolders);
    });
  } catch {
    return memFolders;
  }
}

async function saveDefaultFolders(folders: DocFolder[]) {
  try {
    const db = await openDB();
    const tx = db.transaction(FOLDERS_STORE, 'readwrite');
    const store = tx.objectStore(FOLDERS_STORE);
    folders.forEach(f => store.put(f));
  } catch (err) {
    memFolders = [...folders];
  }
}

export async function createFolder(name: string, color: string = '#2563eb'): Promise<DocFolder> {
  const newFolder: DocFolder = {
    id: `folder_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    color,
    createdAt: new Date().toISOString(),
    isDefault: false,
    iconName: 'folder'
  };

  try {
    const db = await openDB();
    const tx = db.transaction(FOLDERS_STORE, 'readwrite');
    const store = tx.objectStore(FOLDERS_STORE);
    store.put(newFolder);
  } catch {
    memFolders.push(newFolder);
  }

  return newFolder;
}

export async function renameFolder(id: string, newName: string): Promise<boolean> {
  try {
    const db = await openDB();
    const tx = db.transaction(FOLDERS_STORE, 'readwrite');
    const store = tx.objectStore(FOLDERS_STORE);
    const getReq = store.get(id);
    return new Promise((resolve) => {
      getReq.onsuccess = () => {
        const folder = getReq.result as DocFolder;
        if (folder) {
          folder.name = newName.trim();
          store.put(folder);
          resolve(true);
        } else {
          resolve(false);
        }
      };
      getReq.onerror = () => resolve(false);
    });
  } catch {
    const idx = memFolders.findIndex(f => f.id === id);
    if (idx !== -1) {
      memFolders[idx].name = newName;
      return true;
    }
    return false;
  }
}

export async function deleteFolder(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    const tx = db.transaction([FOLDERS_STORE, DOCS_STORE], 'readwrite');
    tx.objectStore(FOLDERS_STORE).delete(id);
    
    // Move any documents in this folder to general/unfiled
    const docsStore = tx.objectStore(DOCS_STORE);
    const docsReq = docsStore.getAll();
    docsReq.onsuccess = () => {
      const docs = docsReq.result as ScannedDocument[];
      docs.forEach(doc => {
        if (doc.folderId === id) {
          doc.folderId = 'folder_personal';
          docsStore.put(doc);
        }
      });
    };
    return true;
  } catch {
    memFolders = memFolders.filter(f => f.id !== id);
    memDocs.forEach(d => {
      if (d.folderId === id) d.folderId = 'folder_personal';
    });
    return true;
  }
}

export async function getAllDocuments(): Promise<ScannedDocument[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(DOCS_STORE, 'readonly');
      const store = tx.objectStore(DOCS_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        let docs = req.result as ScannedDocument[];
        if (!docs || docs.length === 0) {
          const samples = createSampleDocuments();
          saveSampleDocuments(samples);
          resolve(samples);
        } else {
          // Sort descending by updatedAt
          docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          resolve(docs);
        }
      };
      req.onerror = () => resolve(memDocs);
    });
  } catch {
    if (memDocs.length === 0) {
      memDocs = createSampleDocuments();
    }
    return memDocs;
  }
}

async function saveSampleDocuments(docs: ScannedDocument[]) {
  try {
    const db = await openDB();
    const tx = db.transaction(DOCS_STORE, 'readwrite');
    const store = tx.objectStore(DOCS_STORE);
    docs.forEach(d => store.put(d));
  } catch {
    memDocs = [...docs];
  }
}

export async function saveDocument(doc: ScannedDocument): Promise<ScannedDocument> {
  doc.updatedAt = new Date().toISOString();
  try {
    const db = await openDB();
    const tx = db.transaction(DOCS_STORE, 'readwrite');
    const store = tx.objectStore(DOCS_STORE);
    store.put(doc);
  } catch {
    const idx = memDocs.findIndex(d => d.id === doc.id);
    if (idx !== -1) memDocs[idx] = doc;
    else memDocs.unshift(doc);
  }
  return doc;
}

export async function getDocumentById(id: string): Promise<ScannedDocument | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(DOCS_STORE, 'readonly');
      const store = tx.objectStore(DOCS_STORE);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return memDocs.find(d => d.id === id) || null;
  }
}

export async function deleteDocument(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    const tx = db.transaction(DOCS_STORE, 'readwrite');
    tx.objectStore(DOCS_STORE).delete(id);
    return true;
  } catch {
    memDocs = memDocs.filter(d => d.id !== id);
    return true;
  }
}

export async function bulkDeleteDocuments(ids: string[]): Promise<boolean> {
  try {
    const db = await openDB();
    const tx = db.transaction(DOCS_STORE, 'readwrite');
    const store = tx.objectStore(DOCS_STORE);
    ids.forEach(id => store.delete(id));
    return true;
  } catch {
    const idSet = new Set(ids);
    memDocs = memDocs.filter(d => !idSet.has(d.id));
    return true;
  }
}

export async function toggleFavorite(id: string): Promise<boolean> {
  const doc = await getDocumentById(id);
  if (!doc) return false;
  doc.isFavorite = !doc.isFavorite;
  await saveDocument(doc);
  return doc.isFavorite;
}

export async function moveDocumentsToFolder(ids: string[], targetFolderId: string): Promise<void> {
  for (const id of ids) {
    const doc = await getDocumentById(id);
    if (doc) {
      doc.folderId = targetFolderId;
      await saveDocument(doc);
    }
  }
}

/**
 * Generate PDF blob from ScannedDocument pages
 */
export async function exportDocumentToPdf(doc: ScannedDocument): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  for (const page of doc.pages) {
    const imgDataUrl = page.processedImageUrl || page.originalImageUrl;
    if (!imgDataUrl) continue;

    // Convert data URL to array buffer
    let imgBytes: Uint8Array;
    let isJpg = false;

    if (imgDataUrl.startsWith('data:image/jpeg') || imgDataUrl.startsWith('data:image/jpg')) {
      isJpg = true;
      const base64 = imgDataUrl.split(',')[1];
      imgBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    } else {
      // Default / PNG / SVG canvas rasterization
      const canvas = document.createElement('canvas');
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imgDataUrl;
      });
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 1100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      const jpgUrl = canvas.toDataURL('image/jpeg', 0.92);
      isJpg = true;
      const base64 = jpgUrl.split(',')[1];
      imgBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    }

    const embeddedImage = isJpg ? await pdfDoc.embedJpg(imgBytes) : await pdfDoc.embedPng(imgBytes);
    const { width: imgW, height: imgH } = embeddedImage;

    // Standard A4 aspect fit
    const a4W = PageSizes.A4[0];
    const a4H = PageSizes.A4[1];

    const pdfPage = pdfDoc.addPage([a4W, a4H]);
    const scale = Math.min((a4W - 40) / imgW, (a4H - 40) / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;

    const posX = (a4W - drawW) / 2;
    const posY = (a4H - drawH) / 2;

    pdfPage.drawImage(embeddedImage, {
      x: posX,
      y: posY,
      width: drawW,
      height: drawH,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Trigger browser file download
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
