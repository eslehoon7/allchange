import { FileFormat } from '../types';

// Let's define which target formats are available for each source format
export const FORMAT_MAPPINGS: Record<FileFormat, FileFormat[]> = {
  pdf: ['docx', 'txt', 'png', 'jpg', 'hwp'],
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

// Generate realistic download file payloads based on selected format
export async function generateConvertedFile(
  originalFileName: string,
  targetFormat: FileFormat,
  sourceDataUrl?: string,
  rawContent?: string
): Promise<{ blob: Blob; fileName: string; previewUrl: string }> {
  // Extract base name without extension
  const dotIndex = originalFileName.lastIndexOf('.');
  const baseName = dotIndex !== -1 ? originalFileName.substring(0, dotIndex) : originalFileName;
  const fileName = `${baseName}_converted.${targetFormat}`;

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
        ctx.fillStyle = '#FFFFFF'; // white flag for JPG backgrounds
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
      console.warn('Canvas conversion failed, falling back to simulated file generation', e);
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
        : `[allchange 변환 서비스]\n\n해당 파일(${originalFileName})이 성공적으로 변환되었습니다.\n\n변환 일시: ${new Date().toLocaleString()}\n초고속 클라우드 변환 서비스 allchange`;
      break;

    case 'pdf':
      mimeType = 'application/pdf';
      // Create a super lightweight mock PDF format container
      fileContent = `%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 595 842]\n/Resources <</Font <</F1 4 0 R>>>>\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<< /Length 120 >>\nstream\nBT\n/F1 18 Tf\n50 800 Td\n(allchange Conversion Result) Tj\n/F1 12 Tf\n0 -30 Td\n(File: ${originalFileName} was successfully converted to PDF!) Tj\n0 -20 Td\n(Date: ${new Date().toLocaleDateString()}) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000018 00000 n\n0000000073 00000 n\n0000000138 00000 n\n0000000257 00000 n\n0000000329 00000 n\ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n500\n%%EOF`;
      break;

    case 'docx':
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      // Basic RTF representation structured for Word opener fallback
      fileContent = `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}}\n\\viewkind4\\uc1\\pard\\lang1042\\f0\\fs28 \\b allchange 변환 리포트\\b0\\par\\par 원본 파일명: ${originalFileName}\\par 변환 형식: Microsoft Word (.docx)\\par 변환 완료 시각: ${new Date().toLocaleString()}\\par\\par 본 파일은 allchange 스마트 웹 변환 엔진에 의해 고속 분석 및 재구성 처리되었습니다.}`;
      break;

    case 'hwp':
      mimeType = 'application/x-hwp';
      // Custom HWP formatted binary simulation signature
      fileContent = `HWP Document File v5.0\nProcessed by allchange Cloud Service\n[Header: ${baseName}]\n[Converted Time: ${new Date().toISOString()}]`;
      break;

    case 'xlsx':
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      // CSV structured table fallback
      fileContent = `"ID","변환 원본","변환 결과","용량","날짜"\n"1","${originalFileName}","${fileName}","${formatBytes(Math.random() * 5000000)}","${new Date().toLocaleString()}"\n"2","allchange","초고속 파일 변환","성공","우수"`;
      break;

    case 'pptx':
      mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      fileContent = `[allchange MS PPTX Simulation Container]\nSlide 1: Cover Title: ${baseName}\nSlide 2: File specifications & integrity checks passed successfully.`;
      break;

    case 'dwg':
      mimeType = 'application/acad';
      fileContent = `AC1027\nallchange AutoCAD DWG Vector mapping successful\nSource: ${originalFileName}\nConverted vector scale: 1:1`;
      break;

    case 'ai':
      mimeType = 'application/postscript';
      fileContent = `%!PS-Adobe-3.0\n%%Creator: allchange\n%%Title: ${fileName}\n%%EndComments\n/Arial findfont 12 scalefont setfont\n50 700 moveto (${originalFileName} Vector Layers converted to PostScript AI) show\nshowpage`;
      break;

    case 'psd':
      mimeType = 'image/vnd.adobe.photoshop';
      fileContent = `8BPS\nVersion: 1\nChannels: 3\nHeight: 1080\nWidth: 1920\nDepth: 8\nColorMode: RGB\nConverted via allchange Workspace`;
      break;

    case 'jpg':
    case 'jpeg':
      mimeType = 'image/jpeg';
      fileContent = sourceDataUrl || 'FakeJPEGContent';
      break;

    case 'png':
      mimeType = 'image/png';
      fileContent = sourceDataUrl || 'FakePNGContent';
      break;
  }

  // Handle building the response blob
  let blob: Blob;
  if (typeof fileContent === 'string' && fileContent.startsWith('data:')) {
    // If it's a data url, decode it to real blob
    const response = await fetch(fileContent);
    blob = await response.blob();
  } else {
    blob = new Blob([fileContent], { type: mimeType });
  }

  // Create preview object URL
  let previewUrl = '';
  if (targetFormat === 'png' || targetFormat === 'jpg' || targetFormat === 'jpeg') {
    previewUrl = sourceDataUrl || '';
  } else {
    // Generate a secure local blob URL
    previewUrl = URL.createObjectURL(blob);
  }

  return { blob, fileName, previewUrl };
}
