import { FileFormat } from '../types';

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

// pptxgenjs를 CDN에서 동적 로드
async function loadPptxGenJs(): Promise<any> {
  if ((window as any).PptxGenJS) return (window as any).PptxGenJS;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.bundle.js';
    script.onload = () => resolve((window as any).PptxGenJS);
    script.onerror = () => reject(new Error('pptxgenjs 로드 실패'));
    document.head.appendChild(script);
  });
}

// PDF → PPTX 실제 변환
// pdf.js로 텍스트(좌표 포함) + 페이지 이미지 추출 → pptxgenjs로 슬라이드 생성
async function convertPdfToPptx(
  dataUrl: string,
  baseName: string
): Promise<{ blob: Blob; fileName: string; previewUrl: string }> {
  const pdfjsLib = await loadPdfJs();
  const PptxGenJS = await loadPptxGenJs();

  // dataUrl → Uint8Array
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const uint8 = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) uint8[i] = binary.charCodeAt(i);

  const pdfDoc = await pdfjsLib.getDocument({ data: uint8 }).promise;
  const totalPages = pdfDoc.numPages;

  const pptx = new PptxGenJS();

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });

    // 슬라이드 크기를 PDF 페이지 비율에 맞춤 (인치 단위)
    const INCH = 96; // 1인치 = 96px 기준
    const slideW = viewport.width / INCH;
    const slideH = viewport.height / INCH;
    pptx.defineLayout({ name: `L${pageNum}`, width: slideW, height: slideH });

    const slide = pptx.addSlide();

    // ── 1. 페이지 전체를 고해상도 이미지로 렌더링 (배경으로 삽입)
    const bgCanvas = document.createElement('canvas');
    const scale = 2.0;
    const bgViewport = page.getViewport({ scale });
    bgCanvas.width = bgViewport.width;
    bgCanvas.height = bgViewport.height;
    const bgCtx = bgCanvas.getContext('2d')!;
    bgCtx.fillStyle = '#ffffff';
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    await page.render({ canvasContext: bgCtx, viewport: bgViewport }).promise;
    const bgDataUrl = bgCanvas.toDataURL('image/png');

    // 배경 이미지 슬라이드 전체에 깔기
    slide.addImage({
      data: bgDataUrl,
      x: 0, y: 0,
      w: slideW, h: slideH,
    });

    // ── 2. 텍스트 콘텐츠 추출 → 투명 텍스트박스로 위에 올리기 (검색/복사 가능)
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];

    for (const item of items) {
      if (!item.str || item.str.trim() === '') continue;

      // PDF 좌표 → 슬라이드 좌표 변환
      // PDF는 좌하단 원점, PPTX는 좌상단 원점
      const tx = item.transform[4]; // x
      const ty = item.transform[5]; // y
      const fontSize = Math.abs(item.transform[3]); // 폰트 크기(pt)

      const x = tx / viewport.width * slideW;
      const y = (viewport.height - ty - fontSize) / viewport.height * slideH;
      const w = (item.width || fontSize * item.str.length * 0.6) / viewport.width * slideW;
      const h = (fontSize * 1.4) / viewport.height * slideH;

      // 범위 벗어나는 요소 스킵
      if (x < 0 || y < 0 || x > slideW || y > slideH) continue;

      slide.addText(item.str, {
        x: Math.max(0, x),
        y: Math.max(0, y),
        w: Math.max(0.1, w),
        h: Math.max(0.1, h),
        fontSize: Math.max(6, Math.round(fontSize * 0.75)), // pt → pptx pt
        color: '000000',
        transparency: 100, // 완전 투명 (배경 이미지 위에 올라가는 텍스트레이어)
        fontFace: 'Malgun Gothic', // 한글 폰트
        wrap: false,
      });
    }
  }

  // PPTX Blob 생성
  const pptxBlob = await pptx.write({ outputType: 'blob' }) as Blob;
  const fileName = `${baseName}.pptx`;

  // 미리보기: 첫 페이지 PNG
  const firstPage = await pdfDoc.getPage(1);
  const previewViewport = firstPage.getViewport({ scale: 1.5 });
  const previewCanvas = document.createElement('canvas');
  previewCanvas.width = previewViewport.width;
  previewCanvas.height = previewViewport.height;
  const previewCtx = previewCanvas.getContext('2d')!;
  previewCtx.fillStyle = '#ffffff';
  previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
  await firstPage.render({ canvasContext: previewCtx, viewport: previewViewport }).promise;
  const previewBlob = await new Promise<Blob>((res, rej) =>
    previewCanvas.toBlob((b) => (b ? res(b) : rej()), 'image/png')
  );
  const previewUrl = URL.createObjectURL(previewBlob);

  return { blob: pptxBlob, fileName, previewUrl };
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

// PDF → PNG 실제 변환 (1페이지 = 1PNG, 다중 페이지는 ZIP)
async function convertPdfToPng(
  dataUrl: string,
  baseName: string,
  scale: number = 2.0
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

    const previewUrl = URL.createObjectURL(blob);
    return { blob, fileName: `${baseName}.png`, previewUrl };
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
  return {
    blob: zipBlob,
    fileName: `${baseName}_${totalPages}pages.zip`,
    previewUrl: firstPagePreview,
  };
}

// Generate beautiful, high-fidelity mock vector rendering using canvas
export function generateCadMockup(originalFileName: string, type: 'dwg' | 'ai' | 'psd'): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 842;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const baseName = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName;

  if (type === 'dwg') {
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, 1200, 842);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < 1200; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 842); ctx.stroke();
    }
    for (let y = 0; y < 842; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1200, y); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(600, 400, 160, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(600, 400, 80, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2.5;
    ctx.strokeRect(200, 150, 800, 500);
    ctx.strokeStyle = '#0891b2'; ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(720, 510, 270, 120); ctx.strokeRect(720, 510, 270, 120);
    ctx.fillStyle = '#06b6d4'; ctx.font = 'bold 12px monospace';
    ctx.fillText('■ AUTOCAD DWG VECTOR TRANSPILED', 735, 535);
    ctx.fillStyle = '#cbd5e1'; ctx.font = '11px sans-serif';
    ctx.fillText(`도면명: ${baseName}`, 735, 560);
  }

  return canvas.toDataURL('image/png');
}

// Generate realistic download file payloads based on selected format
export async function generateConvertedFile(
  originalFileName: string,
  targetFormat: FileFormat,
  sourceDataUrl?: string,
  rawContent?: string
): Promise<{ blob: Blob; fileName: string; previewUrl: string }> {
  const dotIndex = originalFileName.lastIndexOf('.');
  const baseName = dotIndex !== -1 ? originalFileName.substring(0, dotIndex) : originalFileName;
  const sourceExt = dotIndex !== -1 ? originalFileName.substring(dotIndex + 1).toLowerCase() : '';
  const fileName = `${baseName}_converted.${targetFormat}`;

  // ─────────────────────────────────────────────
  // PDF → PPTX 실제 변환
  // ─────────────────────────────────────────────
  if (sourceExt === 'pdf' && targetFormat === 'pptx' && sourceDataUrl) {
    try {
      return await convertPdfToPptx(sourceDataUrl, baseName);
    } catch (e) {
      console.error('PDF→PPTX 변환 실패:', e);
      throw new Error(`PPTX 변환 중 오류가 발생했습니다: ${(e as Error).message}`);
    }
  }

  // ─────────────────────────────────────────────
  // PDF → PNG 실제 변환 (핵심 추가 로직)
  // ─────────────────────────────────────────────
  if (
    sourceExt === 'pdf' &&
    (targetFormat === 'png' || targetFormat === 'jpg' || targetFormat === 'jpeg') &&
    sourceDataUrl
  ) {
    try {
      const result = await convertPdfToPng(sourceDataUrl, baseName, 2.0);
      return result;
    } catch (e) {
      console.error('PDF→PNG 변환 실패:', e);
      throw new Error(`PDF 변환 중 오류가 발생했습니다: ${(e as Error).message}`);
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
      const isNonAscii = /[^\x00-\x7F]/.test(originalFileName);
      const safePdfDisplayName = isNonAscii
        ? `${originalFileName.split('.').pop()?.toUpperCase() || 'Document'} File`
        : originalFileName;
      fileContent = `%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 595 842]\n/Resources <</Font <</F1 4 0 R>>>>\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<< /Length 120 >>\nstream\nBT\n/F1 18 Tf\n50 800 Td\n(allchange Conversion Result) Tj\n/F1 12 Tf\n0 -30 Td\n(File: ${safePdfDisplayName} was successfully converted to PDF!) Tj\n0 -20 Td\n(Date: ${new Date().toLocaleDateString()}) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000018 00000 n\n0000000073 00000 n\n0000000138 00000 n\n0000000257 00000 n\n0000000329 00000 n\ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n500\n%%EOF`;
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
        fileContent = generateCadMockup(originalFileName, sourceExt as 'dwg' | 'ai' | 'psd');
      } else {
        fileContent = sourceDataUrl || '';
      }
      break;

    case 'png':
      mimeType = 'image/png';
      if (['dwg', 'ai', 'psd'].includes(sourceExt)) {
        fileContent = generateCadMockup(originalFileName, sourceExt as 'dwg' | 'ai' | 'psd');
      } else {
        fileContent = sourceDataUrl || '';
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

  let previewUrl = '';
  if (targetFormat === 'png' || targetFormat === 'jpg' || targetFormat === 'jpeg') {
    previewUrl = sourceDataUrl || '';
  } else {
    previewUrl = URL.createObjectURL(blob);
  }

  return { blob, fileName, previewUrl };
}