export type FileFormat =
  | 'pdf'
  | 'jpg'
  | 'jpeg'
  | 'png'
  | 'hwp'
  | 'docx'
  | 'pptx'
  | 'txt'
  | 'dwg'
  | 'xlsx'
  | 'ai'
  | 'psd';

export interface FileData {
  id: string;
  name: string;
  size: number;
  type: string;
  extension: FileFormat;
  dataUrl?: string; // For images/text we read locally if possible
  rawContent?: string; // For text files
}

export interface ConversionSettings {
  quality: 'low' | 'medium' | 'high';
  pageSize: 'A4' | 'Letter' | 'Original';
  orientation: 'portrait' | 'landscape';
  imageResizePercent: number; // 50, 100, 150, 200
  hwpCompatibility: 'standard' | 'microsoft' | 'hwp97';
  dwgVersion: 'AutoCAD2018' | 'AutoCAD2013' | 'AutoCAD2000';
  xlsxGridlines: boolean;
  colorMode: 'color' | 'grayscale';
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
}

export interface AdData {
  id: string;
  title: string;
  description: string;
  badge: string;
  cta: string;
  imageUrl?: string;
  accentColor: string;
  company?: string;
}
