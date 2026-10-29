export type CyberCafeToolId = 
  | 'whatsapp_print'
  | 'photo_fixer'
  | 'passport_maker'
  | 'kb_resizer'
  | 'signature_resizer'
  | 'pdf_merger'
  | 'pdf_splitter'
  | 'pdf_tools'
  | 'id_card_layout'
  | 'image_converter'
  | 'typing_tools'
  | 'form_checker';

export type ToolCategory = 'all' | 'photo' | 'resizer' | 'pdf' | 'document' | 'utility';

export interface CyberCafeToolInfo {
  id: CyberCafeToolId;
  title: string;
  titleBengali: string;
  description: string;
  descriptionBengali: string;
  category: ToolCategory;
  badge?: string;
  priority?: boolean;
}

export interface ExamPortalSpec {
  id: string;
  name: string;
  organization: string;
  photoSpec: {
    minKb: number;
    maxKb: number;
    widthCm?: number;
    heightCm?: number;
    widthPx?: number;
    heightPx?: number;
    allowedFormats: string[];
    bgNote: string;
    description: string;
  };
  signatureSpec?: {
    minKb: number;
    maxKb: number;
    widthCm?: number;
    heightCm?: number;
    widthPx?: number;
    heightPx?: number;
    allowedFormats: string[];
    description: string;
  };
}

export interface DocumentTemplate {
  id: string;
  title: string;
  titleBengali: string;
  category: 'application' | 'police' | 'bank' | 'certificate' | 'legal';
  description: string;
  englishContent: string;
  bengaliContent: string;
}
