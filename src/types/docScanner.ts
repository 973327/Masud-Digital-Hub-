export type DocCategory = 
  | 'all'
  | 'id_cards'
  | 'bills'
  | 'certificates'
  | 'education'
  | 'business'
  | 'business_cards'
  | 'personal'
  | 'other';

export interface Point {
  x: number;
  y: number;
}

export interface QuadCorners {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

export type DocumentFilterType = 'original' | 'color' | 'grayscale' | 'bw';

export interface ScannedPage {
  id: string;
  originalImageUrl: string;
  processedImageUrl: string;
  rotation: number; // 0, 90, 180, 270
  filter: DocumentFilterType;
  brightness: number; // 0 to 200 (100 is default)
  contrast: number;   // 0 to 200 (100 is default)
  corners?: QuadCorners;
  ocrText?: string;
  width?: number;
  height?: number;
}

export interface ScannedDocument {
  id: string;
  title: string;
  folderId: string;
  category: DocCategory;
  pageCount: number;
  pages: ScannedPage[];
  thumbnail: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  isFavorite: boolean;
  notes?: string;
  tags?: string[];
  sizeBytes?: number;
  fileType: 'scanned_pdf' | 'imported_pdf' | 'images' | 'id_photo';
  extractedText?: string;
}

export interface DocFolder {
  id: string;
  name: string;
  iconName?: string;
  color: string;
  createdAt: string;
  isDefault?: boolean;
}

export type ActiveAppView = 'home' | 'pdf_tools' | 'id_photo' | 'camera_scan' | 'viewer';
