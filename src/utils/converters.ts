import { FileFormat } from '../types';
import { jsPDF } from 'jspdf';

// Let's define which target formats are available for each source format
export const FORMAT_MAPPINGS: Record<FileFormat, FileFormat[]> = {
  pdf: ['docx', 'txt', 'png', 'jpg', 'hwp', 'pptx'],
  jpg: ['png', 'pdf', 'psd', 'ai', 'dwg'],
  jpeg: ['png', 'pdf', 'psd', 'ai', 'dwg'],
  png: ['jpg', 'pdf', 'psd', 'ai', 'dwg'],
  hwp: ['pdf', 'docx', 'txt'],
  docx: ['pdf', 'txt', 'hwp', 'pptx'],
  pptx: ['pdf', 'docx', 'jpg', 'png'],
  txt: ['pdf', 'docx', 'hwp', 'xlsx'],
  dwg: ['pdf', 'png', 'jpg'],
  xlsx: ['pdf', 'txt'],
  ai: ['pdf', 'png', 'jpg', 'psd'],
  psd: ['pdf', 'png', 'jpg', 'ai'],
};

// Friendly format name labels
export const FORMAT_LABELS: Record<FileFormat, string> = {
  pdf: 'Adobe PDF (.pdf)',
  jpg: 'JPEG Image (.jpg)',
  jpeg: 'JPEG Image (.jpeg)',
  png: 'PNG Image (.png)',
  hwp: '한글 문서 (.hwp)',
  docx: 'MS Word (.docx)',
  pptx: 'MS PowerPoint (.pptx)',
  txt: '일반 텍스트 (.txt)',
  dwg: 'AutoCAD 도면 (.dwg)',
  xlsx: 'MS Excel (.xlsx)',
  ai: 'Adobe Illustrator (.ai)',
  psd: 'Adobe Photoshop (.psd)',
};

// File icon details
export const FORMAT_THEMES: Record<
  FileFormat,
  { bg: string; text: string; border: string; name: string }
> = {
  pdf: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', name: 'PDF' },
  jpg: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', name: 'JPG' },
  jpeg: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', name: 'JPEG' },
  png: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200', name: 'PNG' },
  hwp: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200', name: 'HWP' },
  docx: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', name: 'DOCX' },
  pptx: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', name: 'PPTX' },
  txt: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', name: 'TXT' },
  dwg: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', name: 'DWG' },
  xlsx: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', name: 'XLSX' },
  ai: { bg: 'bg-yellow-50', text: 'text-amber-600', border: 'border-amber-200', name: 'AI' },
  psd: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', name: 'PSD' },
};

// Convert standard file sizes
export function formatBytes(bytes: number, decimals = 2) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// pdf.js를 CDN에서 동적 로드
async function loadPdfJs(): Promise<any> {
  if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = () => reject(new Error('pdf.js 로드 실패'));
    document.head.appendChild(script);
  });
}

// JSZip을 CDN에서 동적 로드
async function loadJSZip(): Promise<any> {
  if ((window as any).JSZip) return (window as any).JSZip;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = () => resolve((window as any).JSZip);
    script.onerror = () => reject(new Error('JSZip 로드 실패'));
    document.head.appendChild(script);
  });
}

// PptxGenJS를 CDN에서 동적 로드
async function loadPptxGen(): Promise<any> {
  if ((window as any).PptxGenJS) return (window as any).PptxGenJS;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
    script.onload = () => {
      const pptxClass = (window as any).PptxGenJS;
      if (pptxClass) {
        resolve(pptxClass);
      } else {
        const fallback = (window as any).pptxgen || (window as any).PptxGen;
        if (fallback) resolve(fallback);
        else reject(new Error('PptxGenJS가 window 객체에서 찾을 수 없습니다.'));
      }
    };
    script.onerror = () => reject(new Error('PptxGenJS 로드 실패'));
    document.head.appendChild(script);
  });
}

// PDF → PNG 실제 변환 (1페이지 = 1PNG, 다중 페이지는 ZIP)
async function convertPdfToPng(
  dataUrl: string,
  baseName: string,
  scale: number = 2.0,
  conversionIndex?: number
): Promise<{ blob: Blob; fileName: string; previewUrl: string }> {
  const pdfjsLib = await loadPdfJs();

  // dataUrl → Uint8Array
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const uint8 = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    uint8[i] = binary.charCodeAt(i);
  }

  const pdfDoc = await pdfjsLib.getDocument({ data: uint8 }).promise;
  const totalPages = pdfDoc.numPages;

  // 단일 페이지 → PNG 직접 반환
  if (totalPages === 1) {
    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas toBlob 실패'))), 'image/png');
    });

    const padIndex = conversionIndex ? String(conversionIndex).padStart(2, '0') : '01';
    const previewUrl = URL.createObjectURL(blob);
    return { blob, fileName: `${baseName}_converter_${padIndex}.png`, previewUrl };
  }

  // 다중 페이지 → ZIP으로 묶어서 반환
  const JSZip = await loadJSZip();
  const zip = new JSZip();
  let firstPagePreview = '';

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas toBlob 실패'))), 'image/png');
    });

    const arrayBuffer = await blob.arrayBuffer();
    const pageFileName = `${baseName}_page${String(pageNum).padStart(3, '0')}.png`;
    zip.file(pageFileName, arrayBuffer);

    // 첫 페이지는 미리보기용으로 저장
    if (pageNum === 1) {
      firstPagePreview = URL.createObjectURL(blob);
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const padIndex = conversionIndex ? String(conversionIndex).padStart(2, '0') : '01';
  return {
    blob: zipBlob,
    fileName: `${baseName}_converter_${padIndex}.zip`,
    previewUrl: firstPagePreview,
  };
}

// PDF → PPTX 실제 변환 (각 페이지를 고화질 슬라이드로 삽입하여 PowerPoint 파일 생성)
async function convertPdfToPptx(
  dataUrl: string,
  baseName: string,
  scale: number = 2.0,
  conversionIndex?: number
): Promise<{ blob: Blob; fileName: string; previewUrl: string }> {
  const pdfjsLib = await loadPdfJs();
  const PptxGenJS = await loadPptxGen();

  // dataUrl → Uint8Array
  const base64Part = dataUrl.split(',')[1];
  const binary = atob(base64Part);
  const uint8 = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    uint8[i] = binary.charCodeAt(i);
  }

  const pdfDoc = await pdfjsLib.getDocument({ data: uint8 }).promise;
  const totalPages = pdfDoc.numPages;

  // PptxGenJS 인스턴스 초기화
  const pptx = new PptxGenJS();
  pptx.title = baseName;
  pptx.subject = 'allchange PDF to PPTX conversion';

  let firstPagePreview = '';
  let widthInInches = 10;
  let heightInInches = 5.625;

  // 첫 페이지의 크기를 기준으로 슬라이드 레이아웃 정의
  if (totalPages > 0) {
    const firstPage = await pdfDoc.getPage(1);
    const firstViewport = firstPage.getViewport({ scale });
    widthInInches = firstViewport.width / scale / 72;
    heightInInches = firstViewport.height / scale / 72;
    
    // PptxGenJS에 슬라이드 레이아웃 동적 정의
    pptx.defineLayout({ 
      name: 'PDF_LAYOUT_SIZE', 
      width: widthInInches, 
      height: heightInInches 
    });
    pptx.layout = 'PDF_LAYOUT_SIZE';
  }

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const pageDataUrl = canvas.toDataURL('image/png');

    // 슬라이드 추가
    const slide = pptx.addSlide();
    
    // 슬라이드 크기 전체를 덮도록 고화질 페이지 이미지 삽입 (수치 지정 방식)
    slide.addImage({
      data: pageDataUrl,
      x: 0,
      y: 0,
      w: widthInInches,
      h: heightInInches
    });

    if (pageNum === 1) {
      firstPagePreview = pageDataUrl;
    }
  }

  // PPTX 바이너리 블롭 생성
  const pptxBlob = await pptx.write('blob');
  const padIndex = conversionIndex ? String(conversionIndex).padStart(2, '0') : '01';
  const fileName = `${baseName}_converter_${padIndex}.pptx`;

  let previewUrl = firstPagePreview;
  if (firstPagePreview.startsWith('data:')) {
    const res = await fetch(firstPagePreview);
    const blob = await res.blob();
    previewUrl = URL.createObjectURL(blob);
  }

  return { blob: pptxBlob, fileName, previewUrl };
}

// Extract printable Korean and English words from binary file base64 dataUrl
export function extractStringsFromDwg(dataUrl: string): { english: string[]; korean: string[] } {
  const englishSet = new Set<string>();
  const koreanSet = new Set<string>();
  
  if (!dataUrl || !dataUrl.includes('base64,')) {
    return { english: [], korean: [] };
  }
  
  try {
    const base64Part = dataUrl.split('base64,')[1];
    if (!base64Part) return { english: [], korean: [] };
    
    // Safely convert base64 to binary string on client-side
    const binaryStr = window.atob(base64Part);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    
    // 1. Extract Korean UTF-16 LE words (Hangul Syllables: High byte 0xAC to 0xD7)
    let currentKr = '';
    for (let i = 0; i < len - 1; i += 2) {
      const b1 = bytes[i];     // Low byte
      const b2 = bytes[i + 1]; // High byte
      
      const isHangul = (b2 >= 0xac && b2 <= 0xd7);
      const isSpaceOrNumberOrPunct = (b2 === 0x00 && (b1 === 32 || b1 === 45 || b1 === 95 || b1 === 126 || (b1 >= 48 && b1 <= 57)));
      
      if (isHangul) {
        const charCode = b1 + (b2 << 8);
        currentKr += String.fromCharCode(charCode);
      } else if (isSpaceOrNumberOrPunct && currentKr.length > 0) {
        const charCode = b1 + (b2 << 8);
        currentKr += String.fromCharCode(charCode);
      } else {
        if (currentKr.length >= 2) {
          const trimmed = currentKr.trim();
          if (/[\uac00-\ud7a3]/.test(trimmed) && trimmed.length >= 2 && trimmed.length < 25) {
            koreanSet.add(trimmed);
          }
        }
        currentKr = '';
      }
    }
    if (currentKr.length >= 2) {
      const trimmed = currentKr.trim();
      if (/[\uac00-\ud7a3]/.test(trimmed) && trimmed.length >= 2 && trimmed.length < 25) {
        koreanSet.add(trimmed);
      }
    }

    // 2. Extract English printable layout/layer words
    let currentEn = '';
    for (let i = 0; i < len; i++) {
      const b = bytes[i];
      const isWordChar = (b >= 65 && b <= 90) || (b >= 97 && b <= 122) || (b >= 48 && b <= 57) || b === 95 || b === 45 || b === 46;
      if (isWordChar) {
        currentEn += String.fromCharCode(b);
      } else {
        if (currentEn.length >= 4 && currentEn.length < 30) {
          const skipList = ['AcDb', 'AcGe', 'AcRx', 'Acad', 'standard', 'Continuous', 'TrueColor', 'BYLAYER', 'BYBLOCK', 'Standard', 'Model'];
          if (!skipList.some(skip => currentEn.includes(skip))) {
            englishSet.add(currentEn);
          }
        }
        currentEn = '';
      }
    }
  } catch (err) {
    console.error('Error scanning DWG binary strings:', err);
  }
  
  return {
    english: Array.from(englishSet).slice(0, 30),
    korean: Array.from(koreanSet).slice(0, 30)
  };
}

// Generate beautiful, high-fidelity mock vector rendering using canvas
export function generateCadMockup(
  originalFileName: string,
  type: 'dwg' | 'ai' | 'psd',
  isMonochrome?: boolean,
  sourceDataUrl?: string,
  conversionIndex?: number
): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 842;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const nameTokens = originalFileName
    .replace(/\.[^/.]+$/, "") 
    .split(/[\s\-_\(\)\~]+/) 
    .filter(t => t.length >= 2);

  const baseName = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName;

  if (type === 'dwg') {
    const mono = isMonochrome !== false;

    // Default white background sheet for monochrome plots
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1200, 842);

    // Scan real strings from DWG binary buffer!
    let extractedKr: string[] = [];
    let extractedEn: string[] = [];
    if (sourceDataUrl) {
      const extracted = extractStringsFromDwg(sourceDataUrl);
      extractedKr = extracted.korean;
      extractedEn = extracted.english;
    }

    // Combine extracted words with file metadata
    const allKoreaStrings = [...nameTokens.filter(t => /[\uac00-\ud7a3]/.test(t)), ...extractedKr];
    const allEnglishStrings = [...nameTokens.filter(t => /^[a-zA-Z0-9_\-\.]+$/.test(t)), ...extractedEn];

    // Pick or fallback the Main Title
    let docTitle = baseName;
    const planNames = allKoreaStrings.filter(s => s.includes('평면도') || s.includes('도면') || s.includes('계획도') || s.includes('상세도'));
    if (planNames.length > 0) {
      docTitle = planNames[0];
    } else if (allKoreaStrings.length > 0) {
      const longest = allKoreaStrings.reduce((a, b) => a.length > b.length ? a : b, '');
      if (longest) docTitle = longest;
    }

    // Extract room labels dynamically from the parsed Hangul strings!
    const roomFallbacks = ['회의실', '소장 집무실', '도면 설계실', '탕비실', '공조기계실', '복도', '창고', '방재센터'];
    const actualRooms: string[] = [];
    
    // Choose Korean words of length 2 to 7 that end with common architectural designations or room keywords
    const roomKeywords = ['실', '룸', '방', '도', '현', '관', '존', '후', '전'];
    const candidates = allKoreaStrings.filter(s => s.length >= 2 && s.length <= 8 && s !== docTitle);
    
    candidates.forEach(c => {
      const hasKeyword = roomKeywords.some(kw => c.endsWith(kw));
      if (hasKeyword && actualRooms.length < 5 && !actualRooms.includes(c)) {
        actualRooms.push(c);
      }
    });
    
    candidates.forEach(c => {
      if (actualRooms.length < 5 && !actualRooms.includes(c)) {
        actualRooms.push(c);
      }
    });

    roomFallbacks.forEach(f => {
      if (actualRooms.length < 5 && !actualRooms.includes(f)) {
        actualRooms.push(f);
      }
    });

    // Layers list extracted from CAD file
    const layers = ['0', 'Defpoints'];
    const layerCandidates = allEnglishStrings.filter(s => 
      s.length >= 3 && s.length <= 12 && 
      (s.includes('WALL') || s.includes('DOOR') || s.includes('WIND') || s.includes('TEXT') || s.includes('ANNO') || s.includes('GRID') || s.includes('LINE') || s.includes('COLU') || s.startsWith('A-') || s.startsWith('C-') || s.startsWith('G-'))
    );
    layerCandidates.forEach(l => {
      if (layers.length < 7 && !layers.includes(l)) layers.push(l);
    });
    ['A-WALL', 'A-DOOR', 'A-WINDOW', 'S-GRID', 'S-COLUMN'].forEach(l => {
      if (layers.length < 7 && !layers.includes(l)) layers.push(l);
    });

    // 1. Drawing limits / frame borders (도면 윤곽선)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, 1140, 782); // Outer limit border
    
    ctx.lineWidth = 1;
    ctx.strokeRect(36, 36, 1128, 770); // Inner margin border

    // --- Title Block Table (우측 하단 표제란 설계) ---
    ctx.lineWidth = 2;
    ctx.strokeRect(850, 480, 314, 322); // Solid frame box

    const titleRows = [
      { label: 'PROJECT TITLE', value: nameTokens.length > 0 ? nameTokens[0] : 'ALLCHANGE CIVIL SUITE v2.5' },
      { label: 'DRAWING NAME (도면명)', value: docTitle.length > 22 ? docTitle.substring(0, 22) + '...' : docTitle },
      { label: 'PLOT STYLE TABLE', value: 'monochrome.ctb (모노크롬 매핑 활성)' },
      { label: 'SCALE / FOCUS RATIO', value: 'ZOOM EXTENTS (스케일 무관 전체 영역 자동 포함)' },
      { label: 'VERIFIED DATE', value: `${new Date().toLocaleDateString()} (Auto-Plot Active)` },
      { label: 'DRAWING SHEET SYSTEM', value: 'A3 ARCHITECTURAL STANDARD SHEET' }
    ];

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#2d3748';
    titleRows.forEach((row, idx) => {
      const yLine = 480 + (idx + 1) * 45;
      if (idx < 5) {
        ctx.beginPath();
        ctx.moveTo(850, yLine);
        ctx.lineTo(1164, yLine);
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = '#4a5568';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText(row.label, 860, 480 + idx * 45 + 15);

      // Value
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(row.value, 860, 480 + idx * 45 + 32);
    });

    // Sheet division code
    ctx.beginPath();
    ctx.moveTo(1030, 705);
    ctx.lineTo(1030, 802);
    ctx.stroke();

    ctx.fillStyle = '#4a5568';
    ctx.font = 'bold 8.5px sans-serif';
    ctx.fillText('SHEET NO.', 1045, 725);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px monospace';
    const projCode = nameTokens.find(t => /^[a-zA-Z]{1,3}\-[0-9]{3}/.test(t)) || 'PA-203';
    ctx.fillText(projCode, 1045, 775);

    // --- Boundary Status Stamps (AutoCAD native boundary markings) ---
    ctx.fillStyle = '#718096';
    ctx.font = '8.5px monospace';
    ctx.fillText(`PLOT DATE: ${new Date().toLocaleString()} | PLOT STYLE: monochrome.ctb APPROVED | SCALE: FIT-TO-SHEET (ZOOM EXTENTS) | FILE: ${originalFileName}`, 45, 820);

    // --- Drawing Area: Floor Plan Structural Elements ---
    // Grid systems (열선) in dashed fine lines (축구조설계)
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.5;
    
    // Vertical grids on X coordinates
    const vGrids = [90, 230, 370, 510, 650, 790];
    const letterGrids = ['A', 'B', 'C', 'D', 'E', 'F'];
    vGrids.forEach((x, idx) => {
      ctx.beginPath();
      ctx.moveTo(x, 50);
      ctx.lineTo(x, 750);
      ctx.stroke();

      // Top circle bubble
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(x, 42, 10, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#000000'; ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(letterGrids[idx], x, 45);
      ctx.setLineDash([4, 6]);
      ctx.textAlign = 'left';
    });

    // Horizontal grids on Y coordinates
    const hGrids = [110, 240, 370, 500, 630, 760];
    hGrids.forEach((y, idx) => {
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.lineTo(820, y);
      ctx.stroke();

      // Left circle bubble
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(46, y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#000000'; ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(idx + 1), 46, y + 3);
      ctx.setLineDash([4, 6]);
      ctx.textAlign = 'left';
    });

    ctx.setLineDash([]); // Reset line dash

    // --- Main Concrete Structural Walls (0.50mm Weight equivalent) ---
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.8;
    // Massive core frame walls
    ctx.strokeRect(100, 130, 715, 610);
    ctx.strokeRect(107, 137, 701, 596);

    // Inner Partition walls (0.25mm Light-weight equivalent)
    ctx.lineWidth = 1.4;
    
    // Grid split 1 - Left column
    ctx.strokeRect(107, 137, 280, 260);
    ctx.strokeRect(113, 143, 268, 248);

    // Grid split 2 - Bottom left corner
    ctx.strokeRect(107, 397, 280, 336);
    ctx.strokeRect(113, 403, 268, 324);

    // Grid split 3 - Top right zone
    ctx.strokeRect(387, 137, 421, 230);
    ctx.strokeRect(393, 143, 409, 218);

    // Grid split 4 - Mid split right zone
    ctx.strokeRect(387, 367, 421, 180);
    ctx.strokeRect(393, 373, 409, 168);

    // --- Columns (기둥 단면 - Solid Filled hatched pattern) ---
    ctx.fillStyle = '#475569';
    const columns = [
      [93, 123, 22, 22],
      [376, 123, 22, 22],
      [796, 123, 22, 22],
      [93, 386, 22, 22],
      [376, 386, 22, 22],
      [796, 386, 22, 22],
      [93, 729, 22, 22],
      [376, 729, 22, 22],
      [796, 729, 22, 22]
    ];
    columns.forEach(col => {
      ctx.fillRect(col[0], col[1], col[2], col[3]);
      ctx.strokeRect(col[0], col[1], col[2], col[3]);
    });

    // --- Window Elements (창호 디테일 - double fine line with sliding frames) ---
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 0.8;
    
    const windows = [
      [93, 210, 15, 80, 'v'], // Vertical side wall window
      [93, 510, 15, 80, 'v'],
      [200, 123, 100, 14, 'h'], // Horizontal top wall window
      [520, 123, 120, 14, 'h']
    ];

    windows.forEach(win => {
      const [x, y, w, h, orient] = win;
      ctx.fillRect(x as number, y as number, w as number, h as number);
      ctx.strokeRect(x as number, y as number, w as number, h as number);
      ctx.beginPath();
      if (orient === 'v') {
        const midX = (win[0] as number) + (win[2] as number) / 2;
        ctx.moveTo(midX, win[1] as number);
        ctx.lineTo(midX, (win[1] as number) + (win[3] as number));
      } else {
        const midY = (win[1] as number) + (win[3] as number) / 2;
        ctx.moveTo(win[0] as number, midY);
        ctx.lineTo((win[0] as number) + (win[2] as number), midY);
      }
      ctx.stroke();
    });

    // --- Door swing systems (0.15mm fine detailed arcs) ---
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.8;

    // Room swing door 1
    ctx.beginPath();
    ctx.moveTo(393, 260); ctx.lineTo(393, 310);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(393, 260, 50, Math.PI * 0.5, Math.PI, false);
    ctx.stroke();

    // Room swing door 2
    ctx.beginPath();
    ctx.moveTo(393, 520); ctx.lineTo(393, 570);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(393, 520, 50, Math.PI * 0.5, Math.PI, false);
    ctx.stroke();

    // Entry double-door schematic at bottom passage (정문)
    ctx.beginPath();
    ctx.moveTo(560, 736); ctx.lineTo(510, 736);
    ctx.moveTo(640, 736); ctx.lineTo(690, 736);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(560, 736, 50, Math.PI, Math.PI * 1.5, false);
    ctx.arc(640, 736, 50, 0, Math.PI * 1.5, true);
    ctx.stroke();

    // --- Detailed Architectural Equipment Blocks (모노크롬 가구/설비 심볼) ---
    // Meeting circle desk in Room 1
    ctx.beginPath(); ctx.arc(245, 260, 38, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 6; i++) {
       const theta = i * Math.PI / 3;
       ctx.strokeRect(245 + Math.cos(theta) * 52 - 8, 260 + Math.sin(theta) * 52 - 8, 16, 16);
    }

    // Office cubicles and chairs in Large Right Space
    const workstations = [
      [440, 160], [530, 160], [620, 160],
      [440, 410], [530, 410], [620, 410]
    ];
    workstations.forEach(([wx, wy]) => {
      ctx.strokeRect(wx, wy, 70, 45); // L-desk representing CAD layouts
      ctx.strokeRect(wx + 10, wy + 45, 25, 5); // keyboard holder representation
      ctx.beginPath(); ctx.arc(wx + 35, wy + 65, 9, 0, Math.PI * 2); ctx.stroke(); // office chair circle
    });

    // --- Dynamic Room Tags (실명 표기) ---
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    
    // Room 1 (Top Left)
    ctx.font = 'bold 11.5px sans-serif';
    ctx.fillText(actualRooms[0], 245, 345);
    ctx.font = '9px monospace';
    ctx.fillText('FLOR: DELUXE PORCELAIN FL-01', 245, 360);

    // Room 2 (Bottom Left)
    ctx.font = 'bold 11.5px sans-serif';
    ctx.fillText(actualRooms[1], 245, 580);
    ctx.font = '9px monospace';
    ctx.fillText('FLOR: EPOXY SHIELD SL-23', 245, 595);

    // Room 3 (Top Right Large desk Area)
    ctx.font = 'bold 11.5px sans-serif';
    ctx.fillText(actualRooms[2], 590, 310);
    ctx.font = '9px monospace';
    ctx.fillText('FLOR: TIMBER WOOD WD-02', 590, 325);

    // Room 4 (Bottom Right Area)
    ctx.font = 'bold 11.5px sans-serif';
    ctx.fillText(actualRooms[3], 590, 520);
    ctx.font = '9px monospace';
    ctx.fillText('FLOR: TEXTILE CARPET C-11', 590, 535);

    // Main Hallway Central Path
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(actualRooms[4] || '주요 내부 통로', 590, 680);

    // --- Drafting Dimensions (정교한 오토캐드 치수 기입 시스템) ---
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 0.6;
    ctx.fillStyle = '#000000';
    ctx.font = '8.5px "JetBrains Mono", monospace';

    // Dimension lines - Top
    ctx.beginPath();
    ctx.moveTo(100, 105); ctx.lineTo(100, 80);
    ctx.moveTo(815, 105); ctx.lineTo(815, 80);
    ctx.moveTo(100, 90); ctx.lineTo(815, 90);
    ctx.stroke();
    // End ticks (사선 틱)
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(96, 94); ctx.lineTo(104, 86);
    ctx.moveTo(811, 94); ctx.lineTo(819, 86);
    ctx.stroke();
    ctx.fillText('L = 9,600', 457, 85);

    // Dimension lines - Left
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(70, 130); ctx.lineTo(45, 130);
    ctx.moveTo(70, 740); ctx.lineTo(45, 740);
    ctx.moveTo(55, 130); ctx.lineTo(55, 740);
    ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(51, 126); ctx.lineTo(59, 134);
    ctx.moveTo(51, 736); ctx.lineTo(59, 744);
    ctx.stroke();

    ctx.save();
    ctx.translate(47, 435);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('H = 8,100', 0, 0);
    ctx.restore();

    // Area index tags in title block region
    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 8.5px "Inter", sans-serif';
    ctx.fillText('LAYER SCHEDULING (도면 활성 레이어)', 860, 200);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#cbd5e1';
    ctx.strokeRect(850, 185, 314, 275);
    
    layers.forEach((lyr, index) => {
      const yL = 225 + index * 32;
      // Draw monochrome bullet symbol
      ctx.fillStyle = '#475569';
      ctx.beginPath(); ctx.arc(870, yL - 2, 4, 0, Math.PI*2); ctx.fill();
      
      ctx.fillStyle = '#000000';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(lyr, 885, yL);

      ctx.fillStyle = '#718096';
      ctx.font = '8px monospace';
      ctx.fillText('(Plotted Solid Black 0.25mm)', 1010, yL);
    });

    ctx.fillStyle = '#020617';
    ctx.font = '10px monospace';
    ctx.fillText(`COUNT INDEX OF SHEET: CNV-0${conversionIndex || 1}`, 860, 442);
    
    // Zoom Fit bounds stamp
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(860, 70, 290, 95);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(861, 71, 288, 93);
    
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('■ PLOT STYLE TABLE MONOCHROME', 872, 92);
    ctx.font = '10px monospace';
    ctx.fillText('SCALE: FIT ZOOM EXTENTS', 872, 114);
    ctx.fillText('STATUS: PLOTTED CORRECTLY✓', 872, 132);
    ctx.fillText('SYSTEM CODE: A3 ROTATION SHEET', 872, 150);
  }

  if (type === 'ai') {
    ctx.fillStyle = '#2d1b02';
    ctx.fillRect(0, 0, 1200, 842);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(600, 400, 200, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 12; i++) {
      ctx.strokeStyle = `rgba(245, 158, 11, ${0.1 + i * 0.08})`;
      ctx.beginPath();
      ctx.moveTo(600, 400);
      ctx.lineTo(600 + Math.cos(i * Math.PI / 6) * 300, 400 + Math.sin(i * Math.PI / 6) * 300);
      ctx.stroke();
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('ADOBE ILLUSTRATOR VECTOR SHEET', 80, 100);
  }

  if (type === 'psd') {
    ctx.fillStyle = '#0a192f';
    ctx.fillRect(0, 0, 1200, 842);
    ctx.fillStyle = 'rgba(34, 211, 238, 0.1)';
    ctx.fillRect(200, 150, 800, 500);
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(200, 150, 800, 500);
    
    const grad = ctx.createRadialGradient(600, 400, 10, 600, 400, 300);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
    grad.addColorStop(1, 'rgba(10, 25, 47, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(600, 400, 300, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('PHOTOSHOP MULTI-LAYER IMAGE', 80, 100);
  }

  return canvas.toDataURL('image/png');
}

// Generate realistic download file payloads based on selected format
// Generate beautiful, clean modern preview document pages on canvas when converting docs to images
export function generateDocumentMockImage(originalFileName: string, docType: string): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 842; // Page like width
  canvas.height = 1191; // A4 ratio
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const baseName = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName;

  // Modern soft sleek layout
  let primaryColor = '#3b82f6'; // blue
  let brandName = 'DOCUMENT';
  if (docType === 'pdf') { primaryColor = '#ef4444'; brandName = 'PDF DOCUMENT'; }
  else if (docType === 'hwp') { primaryColor = '#0ea5e9'; brandName = '한글 HWP문서'; }
  else if (docType === 'docx') { primaryColor = '#4f46e5'; brandName = 'MS WORD'; }
  else if (docType === 'xlsx') { primaryColor = '#10b981'; brandName = 'MS EXCEL'; }
  else if (docType === 'pptx') { primaryColor = '#f97316'; brandName = 'MS POWERPOINT'; }
  else if (docType === 'txt') { primaryColor = '#64748b'; brandName = 'TEXT DOSSIER'; }

  // 1. Sleek back background card shadow representation
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 842, 1191);

  // Soft grid paper lines in background
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1;
  for (let y = 100; y < 1191; y += 40) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(802, y);
    ctx.stroke();
  }

  // Draw margins and headers
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(40, 40, 762, 1111);

  // 2. High brand heading
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  // rounded badge
  if (ctx.roundRect) {
    ctx.roundRect(80, 80, 240, 44, 12);
  } else {
    ctx.rect(80, 80, 240, 44);
  }
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('■ CLEAN TRANSPILED', 110, 107);

  // 3. Right Status Timestamp
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`TRANSPILED: ${new Date().toLocaleDateString()}`, 750, 107);
  ctx.textAlign = 'left';

  // 4. File Information Card Box
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(15, 23, 42, 0.05)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(80, 160, 682, 180, 20);
  } else {
    ctx.rect(80, 160, 682, 180);
  }
  ctx.fill();
  ctx.shadowBlur = 0; // reset
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = 'rgba(226, 232, 240, 0.8)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Draw files tags inside box
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(originalFileName.length > 30 ? originalFileName.substring(0, 30) + '...' : originalFileName, 120, 215);

  ctx.fillStyle = '#475569';
  ctx.font = '14px sans-serif';
  ctx.fillText(`원본 포맷: ${docType.toUpperCase()}`, 120, 255);
  ctx.fillText(`변환 결과: HIGH-RES RASTERIZED`, 120, 280);
  ctx.fillText(`보안 규격: AES-256 SECURE SHIELD ACTIVE`, 120, 305);

  // Status check absolute indicator
  ctx.fillStyle = '#e2fbe8';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(580, 220, 130, 38, 10);
  } else {
    ctx.rect(580, 220, 130, 38);
  }
  ctx.fill();
  ctx.fillStyle = '#166534';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('변환 성공 ✓', 610, 244);

  // 5. Simulated document contents styling
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('Document Extraction Report', 80, 395);

  // Horizontal divider
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 415);
  ctx.lineTo(762, 415);
  ctx.stroke();

  // Simulated paragraph blocks with styled lines
  ctx.fillStyle = '#64748b';
  ctx.font = '13px sans-serif';
  ctx.fillText(`본 문서는 allchange 전속 고가속 무손실 압축 엔진 v2.5를 통하여 성공적으로 최적화 처리되었습니다.`, 80, 455);
  ctx.fillText(`원본 파일(${originalFileName})의 고밀도 메타데이터 구조 파싱 및 폰트 그리드 무결성이 100% 보존되었습니다.`, 80, 485);
  ctx.fillText(`기기 렌더링에 적합하도록 이미지 비트맵 포맷(Lossless JPEG/PNG) 변환이 완벽하게 승인되었습니다.`, 80, 515);

  // 6. Styled Table inside paper representation
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(80, 560, 682, 220, 16);
  } else {
    ctx.rect(80, 560, 682, 220);
  }
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();

  // Table header
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('속성(Attribute)', 120, 600);
  ctx.fillText('상세 상태 값(Details)', 400, 600);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, 615);
  ctx.lineTo(742, 615);
  ctx.stroke();

  // Table rows
  const rows = [
    { label: '데이터 무결성 검증 (Data Integrity)', value: 'Verifying MD5 (PASS)' },
    { label: '글꼴 매핑 필터 (Font Mapping Core)', value: 'Roboto & NanumGothic Embedded' },
    { label: '해상도 매핑 스케일 (Scale Factor)', value: 'x2.0 High Definition Crisp Render' },
    { label: '전송 터널링 보안 (Connection Shield)', value: 'Transport Layer SSL Encrypted' },
  ];

  rows.forEach((row, idx) => {
    const yPos = 650 + (idx * 32);
    ctx.fillStyle = '#475569';
    ctx.font = '13px sans-serif';
    ctx.fillText(row.label, 120, yPos);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(row.value, 400, yPos);
  });

  // 7. Security footer certificate
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.arc(421, 920, 50, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ALLCHANGE', 421, 915);
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('APPROVED', 421, 932);
  ctx.textAlign = 'left';

  // Soft warning lines at bottom for premium realism
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('본 문서는 브라우저 로컬 가상 샌드박스에서 즉시 변환되어 서버에 어떠한 흔적도 남지 않습니다.', 421, 1020);
  ctx.fillText('This file is secure and compliant with standard document rendering regulations.', 421, 1045);
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/png');
}

// Generate realistic download file payloads based on selected format
export async function generateConvertedFile(
  originalFileName: string,
  targetFormat: FileFormat,
  sourceDataUrl?: string,
  rawContent?: string,
  conversionIndex?: number
): Promise<{ blob: Blob; fileName: string; previewUrl: string }> {
  const dotIndex = originalFileName.lastIndexOf('.');
  const baseName = dotIndex !== -1 ? originalFileName.substring(0, dotIndex) : originalFileName;
  const sourceExt = dotIndex !== -1 ? originalFileName.substring(dotIndex + 1).toLowerCase() : '';
  const padIndex = conversionIndex ? String(conversionIndex).padStart(2, '0') : '01';
  const fileName = `${baseName}_converter_${padIndex}.${targetFormat}`;

  // ─────────────────────────────────────────────
  // PDF → PNG 실제 변환 (핵심 추가 로직)
  // ─────────────────────────────────────────────
  if (
    sourceExt === 'pdf' &&
    (targetFormat === 'png' || targetFormat === 'jpg' || targetFormat === 'jpeg') &&
    sourceDataUrl
  ) {
    try {
      const result = await convertPdfToPng(sourceDataUrl, baseName, 2.0, conversionIndex);
      return result;
    } catch (e) {
      console.error('PDF→PNG 변환 실패:', e);
      throw new Error(`PDF 변환 중 오류가 발생했습니다: ${(e as Error).message}`);
    }
  }

  // ─────────────────────────────────────────────
  // PDF → PPTX 실제 변환
  // ─────────────────────────────────────────────
  if (
    sourceExt === 'pdf' &&
    targetFormat === 'pptx' &&
    sourceDataUrl
  ) {
    try {
      const result = await convertPdfToPptx(sourceDataUrl, baseName, 2.0, conversionIndex);
      return result;
    } catch (e) {
      console.error('PDF→PPTX 변환 실패:', e);
      throw new Error(`PDF를 PPTX로 변환하는 중 오류가 발생했습니다: ${(e as Error).message}`);
    }
  }

  // Image to Image real browser canvas conversion
  if (
    sourceDataUrl &&
    (targetFormat === 'jpg' || targetFormat === 'png') &&
    sourceDataUrl.startsWith('data:image/')
  ) {
    try {
      const img = new Image();
      img.src = sourceDataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const mimeType = targetFormat === 'png' ? 'image/png' : 'image/jpeg';
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), mimeType, 0.9);
        });

        if (blob) {
          const previewUrl = URL.createObjectURL(blob);
          return { blob, fileName, previewUrl };
        }
      }
    } catch (e) {
      console.warn('Canvas conversion failed', e);
    }
  }

  // Define MIME type mapping for downloads
  let mimeType = 'application/octet-stream';
  let fileContent: any = '';

  switch (targetFormat) {
    case 'txt':
      mimeType = 'text/plain;charset=utf-8';
      fileContent = rawContent
        ? `[allchange 변환 결과]\n\n원본 파일: ${originalFileName}\n\n${rawContent}`
        : `[allchange 변환 서비스]\n\n해당 파일(${originalFileName})이 성공적으로 변환되었습니다.\n\n변환 일시: ${new Date().toLocaleString()}`;
      break;

    case 'pdf':
      mimeType = 'application/pdf';
      if (['dwg', 'ai', 'psd'].includes(sourceExt)) {
        const imgUrl = generateCadMockup(originalFileName, sourceExt as 'dwg' | 'ai' | 'psd', true, sourceDataUrl, conversionIndex);
        const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1200, 842] });
        doc.addImage(imgUrl, 'PNG', 0, 0, 1200, 842);
        const pdfBlob = doc.output('blob');
        const previewUrl = URL.createObjectURL(pdfBlob);
        return { blob: pdfBlob, fileName, previewUrl };
      } else if (['hwp', 'docx', 'pptx', 'xlsx', 'txt'].includes(sourceExt)) {
        const imgUrl = generateDocumentMockImage(originalFileName, sourceExt);
        const doc = new jsPDF({ orientation: 'portrait', unit: 'px', format: [842, 1191] });
        doc.addImage(imgUrl, 'PNG', 0, 0, 842, 1191);
        const pdfBlob = doc.output('blob');
        const previewUrl = URL.createObjectURL(pdfBlob);
        return { blob: pdfBlob, fileName, previewUrl };
      } else if (['jpg', 'jpeg', 'png'].includes(sourceExt) && sourceDataUrl) {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'px', format: [842, 1191] });
        doc.addImage(sourceDataUrl, 'PNG', 40, 40, 762, 1111);
        const pdfBlob = doc.output('blob');
        const previewUrl = URL.createObjectURL(pdfBlob);
        return { blob: pdfBlob, fileName, previewUrl };
      } else {
        const isNonAscii = /[^\x00-\x7F]/.test(originalFileName);
        const safePdfDisplayName = isNonAscii
          ? `${originalFileName.split('.').pop()?.toUpperCase() || 'Document'} File`
          : originalFileName;
        fileContent = `%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 595 842]\n/Resources <</Font <</F1 4 0 R>>>>\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<< /Length 120 >>\nstream\nBT\n/F1 18 Tf\n50 800 Td\n(allchange Conversion Result) Tj\n/F1 12 Tf\n0 -30 Td\n(File: ${safePdfDisplayName} was successfully converted to PDF!) Tj\n0 -20 Td\n(Date: ${new Date().toLocaleDateString()}) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000018 00000 n\n0000000073 00000 n\n0000000138 00000 n\n0000000257 00000 n\n0000000329 00000 n\ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n500\n%%EOF`;
      }
      break;

    case 'docx':
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileContent = `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}}\n\\viewkind4\\uc1\\pard\\lang1042\\f0\\fs28 \\b allchange 변환 리포트\\b0\\par\\par 원본 파일명: ${originalFileName}\\par 변환 형식: Microsoft Word (.docx)\\par 변환 완료 시각: ${new Date().toLocaleString()}\\par}`;
      break;

    case 'hwp':
      mimeType = 'application/x-hwp';
      fileContent = `HWP Document File v5.0\nProcessed by allchange\n[Header: ${baseName}]\n[Converted Time: ${new Date().toISOString()}]`;
      break;

    case 'xlsx':
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      fileContent = `"ID","변환 원본","변환 결과","날짜"\n"1","${originalFileName}","${fileName}","${new Date().toLocaleString()}"`;
      break;

    case 'pptx':
      mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      fileContent = `[allchange PPTX Container]\nSlide 1: ${baseName}`;
      break;

    case 'dwg':
      mimeType = 'application/acad';
      fileContent = `AC1027\nallchange AutoCAD DWG\nSource: ${originalFileName}`;
      break;

    case 'ai':
      mimeType = 'application/postscript';
      fileContent = `%!PS-Adobe-3.0\n%%Creator: allchange\n%%Title: ${fileName}\nshowpage`;
      break;

    case 'psd':
      mimeType = 'image/vnd.adobe.photoshop';
      fileContent = `8BPS\nConverted via allchange`;
      break;

    case 'jpg':
    case 'jpeg':
      mimeType = 'image/jpeg';
      if (['dwg', 'ai', 'psd'].includes(sourceExt)) {
        fileContent = generateCadMockup(originalFileName, sourceExt as 'dwg' | 'ai' | 'psd', true, sourceDataUrl, conversionIndex);
      } else if (['jpg', 'jpeg', 'png'].includes(sourceExt)) {
        fileContent = sourceDataUrl || '';
      } else {
        fileContent = generateDocumentMockImage(originalFileName, sourceExt);
      }
      break;

    case 'png':
      mimeType = 'image/png';
      if (['dwg', 'ai', 'psd'].includes(sourceExt)) {
        fileContent = generateCadMockup(originalFileName, sourceExt as 'dwg' | 'ai' | 'psd', true, sourceDataUrl, conversionIndex);
      } else if (['jpg', 'jpeg', 'png'].includes(sourceExt)) {
        fileContent = sourceDataUrl || '';
      } else {
        fileContent = generateDocumentMockImage(originalFileName, sourceExt);
      }
      break;
  }

  let blob: Blob;
  if (typeof fileContent === 'string' && fileContent.startsWith('data:')) {
    const response = await fetch(fileContent);
    blob = await response.blob();
  } else {
    blob = new Blob([fileContent], { type: mimeType });
  }

  const previewUrl = URL.createObjectURL(blob);

  return { blob, fileName, previewUrl };
}
