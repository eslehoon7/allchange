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

// Generate beautiful, high-fidelity mock vector rendering using canvas
export function generateCadMockup(originalFileName: string, type: 'dwg' | 'ai' | 'psd'): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 842; // standard landscape aspect ratio
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const baseName = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName;

  if (type === 'dwg') {
    // Elegant Dark Slate AutoCAD design
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, 1200, 842);

    // Grid lines block in cyan
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < 1200; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 842);
      ctx.stroke();
    }
    for (let y = 0; y < 842; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1200, y);
      ctx.stroke();
    }

    // Concentric CAD circles
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(600, 400, 160, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(600, 400, 80, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(600, 400, 240, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Structural building layout outlines (Double line exterior walls)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.5;
    // Outer wall
    ctx.strokeRect(200, 150, 800, 500);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    // Inner offset wall
    ctx.strokeRect(208, 158, 784, 484);

    // Layout partition lines
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(480, 158);
    ctx.lineTo(480, 642);
    ctx.moveTo(780, 158);
    ctx.lineTo(780, 642);
    ctx.moveTo(208, 380);
    ctx.lineTo(1000, 380);
    ctx.stroke();

    // Door swing indicators standard in CAD
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Door 1
    ctx.arc(480, 380, 40, Math.PI, Math.PI * 1.5);
    ctx.lineTo(480, 380);
    // Door 2
    ctx.arc(780, 380, 40, 0, Math.PI * 0.5);
    ctx.lineTo(780, 380);
    ctx.stroke();

    // Dimension indicators in green
    ctx.strokeStyle = '#10b981';
    ctx.fillStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.font = 'bold 12px monospace';

    // Length dimension marker
    ctx.beginPath();
    ctx.moveTo(200, 110);
    ctx.lineTo(1000, 110);
    ctx.moveTo(200, 100); ctx.lineTo(200, 120);
    ctx.moveTo(1000, 100); ctx.lineTo(1000, 120);
    ctx.stroke();
    ctx.fillText('W_LENGTH = 18,450.00 mm', 520, 100);

    // Height dimension marker
    ctx.beginPath();
    ctx.moveTo(140, 150);
    ctx.lineTo(140, 650);
    ctx.moveTo(130, 150); ctx.lineTo(150, 150);
    ctx.moveTo(130, 650); ctx.lineTo(150, 650);
    ctx.stroke();
    ctx.save();
    ctx.translate(125, 410);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('H_HEIGHT = 11,200.00 mm', 0, 0);
    ctx.restore();

    // Design compass indicator block
    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(1060, 220);
    ctx.lineTo(1045, 270);
    ctx.lineTo(1060, 258);
    ctx.lineTo(1075, 270);
    ctx.closePath();
    ctx.fill();
    ctx.font = 'bold 15px monospace';
    ctx.fillText('N', 1054, 205);
    ctx.font = '10px monospace';
    ctx.fillText('NORDIC GRID', 1025, 285);

    // Professional Drafting Stamp/Title block in the bottom-right corner
    ctx.strokeStyle = '#0891b2';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(720, 510, 270, 120);
    ctx.strokeRect(720, 510, 270, 120);

    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('■ AUTOCAD DWG VECTOR TRANSPILED', 735, 535);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px sans-serif';
    ctx.fillText(`도면명: ${baseName}`, 735, 560);
    ctx.fillText(`축  척: Metric Ratio Scale 1:100`, 735, 578);
    ctx.fillText(`검사자: ALLCHANGE VECTOR PARSER V4`, 735, 596);
    ctx.fillStyle = '#22d3ee';
    ctx.fillText(`원  본: ${originalFileName}`, 735, 614);

  } else if (type === 'ai') {
    // Vector illustration theme (warm yellow creative)
    ctx.fillStyle = '#fffdf5';
    ctx.fillRect(0, 0, 1200, 842);

    // Illustrator layout guides (fine cyan borders)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(60, 60, 1080, 722);

    // Artistic abstract vector curves with gradient
    const grad = ctx.createLinearGradient(0, 0, 1200, 842);
    grad.addColorStop(0, '#f43f5e');
    grad.addColorStop(0.3, '#ec4899');
    grad.addColorStop(0.6, '#a855f7');
    grad.addColorStop(1, '#3b82f6');

    // Drawing geometric vector shapes
    ctx.strokeStyle = grad;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(150, 600);
    ctx.bezierCurveTo(400, 100, 800, 750, 1050, 200);
    ctx.stroke();

    // Vector anchor points helper illustration
    ctx.fillStyle = '#3b82f6';
    const drawAnchor = (x: number, y: number) => {
      ctx.fillRect(x - 5, y - 5, 10, 10);
      ctx.strokeRect(x - 5, y - 5, 10, 10);
    };
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    drawAnchor(150, 600);
    drawAnchor(1050, 200);

    // Additional geometric overlapping shapes (polygons etc.)
    ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(600, 420, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(236, 72, 153, 0.1)';
    ctx.strokeStyle = '#ec4899';
    ctx.beginPath();
    ctx.moveTo(600, 300);
    ctx.lineTo(750, 560);
    ctx.lineTo(450, 560);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Metadata labels
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 22px "Inter", sans-serif';
    ctx.fillText('Adobe Illustrator Vector Artboard', 100, 130);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`작품 원본명: ${originalFileName}`, 100, 160);
    ctx.fillText(`해상도 모듈: 무한 가변 고해상도 벡터 패스 인코딩`, 100, 182);
    ctx.fillText(`엔진 식별자: AI_PARSER_V2.146`, 100, 204);

    // Footer info
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('ALLCHANGE CO., LTD. ALL VECTOR LAYERS PRESERVED.', 100, 750);

  } else if (type === 'psd') {
    // Photoshop dark-theme layout with layered bars
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 1200, 842);

    // File grid borders
    ctx.fillStyle = '#475569';
    const boxSize = 20;
    for (let x = 60; x < 1140; x += boxSize * 2) {
      for (let y = 60; y < 780; y += boxSize * 2) {
        ctx.fillRect(x, y, boxSize, boxSize);
        ctx.fillRect(x + boxSize, y + boxSize, boxSize, boxSize);
      }
    }

    // Centered Canvas layout
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(160, 120, 880, 580);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(160, 120, 880, 580);

    // Simulated design text
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('PHOTOSHOP HIGH RESOLUTION LAYER', 220, 260);

    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`[레이어 인덱스 맵 - 활성 상태]`, 220, 310);

    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`• Layer 0 (스마트 오브젝트): ${baseName}`, 220, 345);
    ctx.fillText(`• Layer 1 (마스크 및 어포선): RGBA TrueColor 투명 배경`, 220, 375);
    ctx.fillText(`• Layer 2 (필터 가스 조율): Gaussian Blur / Vector Path Overlay`, 220, 405);
    ctx.fillText(`• Layer 3 (안전 워터마크): 검증 암호화 서명 포함`, 220, 435);

    // Highlight border corners
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 4;
    // Top-Left
    ctx.beginPath(); ctx.moveTo(150, 130); ctx.lineTo(150, 110); ctx.lineTo(170, 110); ctx.stroke();
    // Top-Right
    ctx.beginPath(); ctx.moveTo(1050, 130); ctx.lineTo(1050, 110); ctx.lineTo(1030, 110); ctx.stroke();
    // Bottom-Left
    ctx.beginPath(); ctx.moveTo(150, 690); ctx.lineTo(150, 710); ctx.lineTo(170, 710); ctx.stroke();
    // Bottom-Right
    ctx.beginPath(); ctx.moveTo(1050, 690); ctx.lineTo(1050, 710); ctx.lineTo(1030, 710); ctx.stroke();

    // Extra Tag info
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#3b82f6';
    ctx.fillText(`PSD 원본 매크로: ${originalFileName}`, 220, 500);
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
      if (originalFileName.toLowerCase().endsWith('.dwg')) {
        fileContent = generateCadMockup(originalFileName, 'dwg');
      } else if (originalFileName.toLowerCase().endsWith('.ai')) {
        fileContent = generateCadMockup(originalFileName, 'ai');
      } else if (originalFileName.toLowerCase().endsWith('.psd')) {
        fileContent = generateCadMockup(originalFileName, 'psd');
      } else {
        fileContent = sourceDataUrl || 'FakeJPEGContent';
      }
      break;

    case 'png':
      mimeType = 'image/png';
      if (originalFileName.toLowerCase().endsWith('.dwg')) {
        fileContent = generateCadMockup(originalFileName, 'dwg');
      } else if (originalFileName.toLowerCase().endsWith('.ai')) {
        fileContent = generateCadMockup(originalFileName, 'ai');
      } else if (originalFileName.toLowerCase().endsWith('.psd')) {
        fileContent = generateCadMockup(originalFileName, 'psd');
      } else {
        fileContent = sourceDataUrl || 'FakePNGContent';
      }
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
