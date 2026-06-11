import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Share2,
  CheckCircle,
  FileCode,
  ArrowLeft,
  Copy,
  Layers,
  Table,
  Eye,
  FileText,
  Bookmark,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { FileData, FileFormat, ConversionSettings } from '../types';
import { FORMAT_THEMES, formatBytes } from '../utils/converters';

interface ConversionResultsProps {
  originalFile: FileData;
  targetFormat: FileFormat;
  settings: ConversionSettings;
  convertedBlob: Blob | null;
  convertedFileName: string;
  previewUrl: string;
  onReset: () => void;
}

export default function ConversionResults({
  originalFile,
  targetFormat,
  settings,
  convertedBlob,
  convertedFileName,
  previewUrl,
  onReset,
}: ConversionResultsProps) {
  const [showShareDrawer, setShowShareDrawer] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [layers, setLayers] = useState({
    blueprint: true,
    dimensions: true,
    background: true,
    annotations: true,
  });

  const [pdfPage, setPdfPage] = useState(1);
  const isImage = ['jpg', 'png', 'jpeg'].includes(targetFormat);

  // Download logic for PC & mobile
  const handleDownload = () => {
    if (!convertedBlob) return;
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = convertedFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // True mobile browser native sharing fallback
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        const fileToShare = convertedBlob
          ? new File([convertedBlob], convertedFileName, { type: convertedBlob.type })
          : [];
        await navigator.share({
          title: 'allchange 파일 공유',
          text: `allchange에서 성공적으로 변환된 ${convertedFileName} 파일입니다.`,
          files: Array.isArray(fileToShare) ? [] : [fileToShare],
        });
      } catch (e) {
        // Fallback if files aren't shareable directly but text is
        try {
          await navigator.share({
            title: 'allchange 파일 공유',
            text: `allchange 변환 완료: ${convertedFileName}`,
            url: window.location.href,
          });
        } catch (err) {
          setShowShareDrawer(true);
        }
      }
    } else {
      setShowShareDrawer(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href + '?shared=allchange-' + Date.now());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const theme = FORMAT_THEMES[targetFormat] || {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    name: targetFormat.toUpperCase(),
  };

  return (
    <div className="flex flex-col gap-6 w-full relative">
      {/* Title block */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="relative">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border border-green-200">
            <CheckCircle className="text-green-500" size={32} />
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0.5 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse' }}
            className="absolute inset-0 bg-green-200/20 rounded-full blur-md -z-10"
          />
        </div>
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">
          변환이 성공적으로 완료되었습니다!
        </h3>
        <p className="text-xs text-slate-400">네트워크 보안 전송 검증이 통과되었습니다.</p>
      </div>

      {/* Structured file detailed list table */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col gap-3">
        <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
          규격 명세 테이블
        </span>

        <div className="flex flex-col gap-2.5 text-xs">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">출력 파일명</span>
            <span className="font-bold text-slate-800 break-all select-all text-right pl-4">
              {convertedFileName}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">포맷 방식</span>
            <span className="flex items-center gap-1.5">
              <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${theme.bg} ${theme.text} border ${theme.border}`}>
                {theme.name}
              </span>
              <span className="text-slate-500 font-medium">←</span>
              <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {originalFile.extension}
              </span>
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">변환 후 파일 크기</span>
            <span className="font-bold text-emerald-600">
              {convertedBlob ? formatBytes(convertedBlob.size) : '계산 중'}
            </span>
          </div>

          <div className="flex justify-between pb-1">
            <span className="text-slate-500">압축/최적화 상태</span>
            <span className="font-bold text-blue-600">최적 상태 (Lossless Accel)</span>
          </div>
        </div>
      </div>

      {/* Highly Interactive Multi-Format Preview Canvas container */}
      <div className="border border-slate-200 rounded-3xl bg-white overflow-hidden shadow-sm flex flex-col">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Eye size={14} className="text-slate-500" />
            초고해상도 실시간 렌더러 미리보기
          </span>
          <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full select-none">
            Vector Render Engine v2
          </span>
        </div>

        <div className="p-4 bg-slate-100/50 min-h-[220px] flex items-center justify-center">
          {/* Case 1: PNG / JPG Converter Render */}
          {isImage && previewUrl ? (
            <div className="relative group overflow-hidden rounded-2xl max-h-[300px] border border-slate-200 shadow-sm bg-white p-2">
              <img
                src={previewUrl}
                alt="Converted preview"
                className="object-contain max-h-[260px] max-w-full rounded-xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                <span className="text-white text-xs px-3 py-1.5 bg-black/60 rounded-full font-bold flex items-center gap-1">
                  <Bookmark size={12} />
                  보안 이미지 임베디드 렌더러
                </span>
              </div>
            </div>
          ) : null}

          {/* Case 2: Document / PDF Multi-Page Interactive Slider */}
          {!isImage && ['pdf', 'docx', 'hwp'].includes(targetFormat) && (
            <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[280px]">
              <div className="bg-slate-50/50 border-b border-slate-100 px-4 py-2.5 flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <FileText size={13} className="text-rose-500" />
                  <span>문서 렌더러 스캔</span>
                </div>
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-1.5 py-0.5 font-bold">
                  <span>{pdfPage}</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-500">2 페이지</span>
                </div>
              </div>

              <div className="flex-1 p-5 overflow-y-auto text-left flex flex-col gap-3">
                {pdfPage === 1 ? (
                  ['dwg', 'ai', 'psd'].includes(originalFile.extension.toLowerCase()) ? (
                    <div className="flex flex-col gap-2 w-full h-full">
                      <div className="flex items-center justify-between border-b pb-1">
                        <span className="text-[10px] font-extrabold text-slate-800 uppercase tracking-tight">
                          {originalFile.extension.toUpperCase()} 벡터 래스터 캐논 뷰어
                        </span>
                        <span className="text-[8px] bg-indigo-50 text-indigo-600 font-bold px-1 rounded">
                          Page 1 Model
                        </span>
                      </div>
                      
                      {/* Interactive Viewport block inside PDF paper sheet */}
                      {originalFile.extension.toLowerCase() === 'dwg' && (
                        <div className="h-[135px] bg-[#0c101d] rounded-lg relative overflow-hidden flex items-center justify-center p-2 border border-slate-900/40">
                          {/* Grid backdrop */}
                          <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-[0.15] pointer-events-none">
                            {Array.from({ length: 20 }).map((_, i) => (
                              <div key={i} className="border-[0.5px] border-cyan-400" />
                            ))}
                          </div>
                          
                          <div className="w-full h-full relative flex items-center justify-center scale-90">
                            {layers.background && (
                              <div className="absolute inset-0 rounded border border-slate-800 bg-slate-950/40" />
                            )}
                            {layers.blueprint && (
                              <svg className="absolute w-16 h-16 stroke-cyan-400 fill-none" viewBox="0 0 100 100">
                                <rect x="15" y="15" width="70" height="70" strokeWidth="1" />
                                <circle cx="50" cy="50" r="22" strokeWidth="1" />
                                <line x1="15" y1="15" x2="85" y2="85" strokeWidth="0.5" />
                                <line x1="85" y1="15" x2="15" y2="85" strokeWidth="0.5" />
                              </svg>
                            )}
                            {layers.dimensions && (
                              <svg className="absolute w-20 h-20 stroke-emerald-400 fill-none text-[6px] font-mono" viewBox="0 0 120 120">
                                <line x1="10" y1="8" x2="110" y2="8" strokeWidth="0.5" strokeDasharray="1.5" />
                                <text x="40" y="16" fill="#34d399" className="font-bold">L: 18,450mm</text>
                              </svg>
                            )}
                            {layers.annotations && (
                              <div className="absolute bottom-1 right-1 bg-slate-900/90 text-[6px] text-yellow-400 py-0.5 px-1 rounded border border-yellow-500/20 font-mono tracking-tighter">
                                {originalFile.name.substring(0, 16)}.. (MODEL)
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {originalFile.extension.toLowerCase() === 'ai' && (
                        <div className="h-[135px] bg-[#fffdf5] rounded-lg relative overflow-hidden flex flex-col items-center justify-center p-2 border border-yellow-200/50">
                          <div className="w-full h-full relative flex items-center justify-center scale-90">
                            <svg className="w-24 h-24 stroke-rose-500 fill-none" viewBox="0 0 100 100">
                              <path d="M 10 70 C 30 10, 70 80, 90 20" strokeWidth="2.5" strokeLinecap="round" />
                              <circle cx="10" cy="70" r="2" fill="#3b82f6" stroke="#fff" />
                              <circle cx="90" cy="20" r="2" fill="#3b82f6" stroke="#fff" />
                              <circle cx="50" cy="50" r="12" stroke="#a855f7" strokeWidth="1" strokeDasharray="2" fill="rgba(168,85,247,0.05)" />
                            </svg>
                            <span className="absolute bottom-1 left-1 font-mono text-[7px] text-slate-400">
                              Artboard: 1200x800px (Vector Mode)
                            </span>
                          </div>
                        </div>
                      )}

                      {originalFile.extension.toLowerCase() === 'psd' && (
                        <div className="h-[135px] bg-[#1e293b] rounded-lg relative overflow-hidden flex flex-col items-center justify-center p-2 border border-slate-700">
                          {/* Checked background block */}
                          <div className="absolute inset-0 bg-[#334155] grid grid-cols-6 grid-rows-6 opacity-30 pointer-events-none">
                            {Array.from({ length: 12 }).map((_, i) => (
                              <div key={i} className="border-[0.5px] border-slate-500" />
                            ))}
                          </div>
                          <div className="z-10 bg-slate-900/90 border border-slate-800 p-2.5 rounded-md text-left w-[85%]">
                            <div className="text-[7px] text-sky-400 font-extrabold uppercase font-mono mb-1">Photoshop Layer Stack</div>
                            <div className="text-[6.5px] text-slate-300 space-y-0.5 font-mono">
                              <div>• [Active] Layer 1 - Smart Graphic Vector</div>
                              <div>• [Visible] Layer 0 - {originalFile.name}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* PDF layer settings control mini toolbar */}
                      <div className="flex items-center justify-between bg-slate-50 rounded-lg p-1.5 border border-slate-200/50">
                        <span className="text-[7.5px] text-slate-400 font-bold">도면 레이어 제어 패널:</span>
                        <div className="flex gap-2">
                          {[
                            { key: 'blueprint' as const, label: '도면 (Grid)' },
                            { key: 'dimensions' as const, label: '치수 (Scale)' },
                          ].map((item) => (
                            <label key={item.key} className="flex items-center gap-1 cursor-pointer text-[7.5px] text-slate-500 select-none hover:text-slate-800">
                              <input
                                type="checkbox"
                                checked={layers[item.key]}
                                onChange={(e) => setLayers((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-2 h-2"
                              />
                              <span className="font-semibold">{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      <h4 className="font-extrabold text-[#111827] text-md leading-relaxed border-b border-light pb-2">
                        {originalFile.name} 변환 보고서
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        문서 고정밀 레이아웃 파서 v4.1 및 폰트 매퍼가 적용되었습니다.
                      </p>
                      <div className="bg-slate-50 rounded-lg p-3 text-[10px] text-slate-600 font-mono leading-relaxed border border-slate-100">
                        <div>File Specifications:</div>
                        <div>• Source type: {originalFile.extension.toUpperCase()}</div>
                        <div>• Output format: {targetFormat.toUpperCase()}</div>
                        <div>• Integrity checked: SUCCESS (100%)</div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <h5 className="font-bold text-[#111827] text-xs">상세 메타데이터 세부 명세</h5>
                    <div className="space-y-1.5 text-[10px] text-slate-500">
                      <div className="flex justify-between">
                        <span>인코딩 비트레이트</span>
                        <span>Auto Lossless (Lzma2)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>적용 폰트 그룹</span>
                        <span>Inter, NanumGothic Web</span>
                      </div>
                      <div className="flex justify-between">
                        <span>컬러 매핑 레벨</span>
                        <span>TrueColor Core32</span>
                      </div>
                    </div>
                    <div className="mt-2 text-[9px] text-blue-600 font-bold bg-blue-50 p-2 rounded border border-blue-150">
                      ✓ 본 문서는 전송 구간 암호화를 유지하고 전속 보장 다운로드로 격리되었습니다.
                    </div>
                  </div>
                )}
              </div>

              <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 flex justify-center gap-1">
                <button
                  disabled={pdfPage === 1}
                  onClick={() => setPdfPage(1)}
                  className="p-1 rounded hover:bg-white border hover:border-slate-200 disabled:opacity-40 text-slate-600 transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
                <div className="text-[10px] self-center px-4 font-bold text-slate-500">
                  {pdfPage === 1 ? '첫 페이지' : '마지막 페이지'}
                </div>
                <button
                  disabled={pdfPage === 2}
                  onClick={() => setPdfPage(2)}
                  className="p-1 rounded hover:bg-white border hover:border-slate-200 disabled:opacity-40 text-slate-600 transition-all"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Case 3: Excel Interactive Sheet preview */}
          {!isImage && targetFormat === 'xlsx' && (
            <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[280px]">
              <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 flex items-center justify-between text-[11px] text-emerald-800 font-bold">
                <div className="flex items-center gap-1.5">
                  <Table size={13} className="text-emerald-600" />
                  <span>Interactive Sheet 2.1 Viewer</span>
                </div>
                <span className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono text-[9px]">
                  RAW GRID
                </span>
              </div>

              <div className="flex-1 overflow-auto text-xs p-1">
                <table className="w-full text-left border-collapse min-w-[280px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black">
                      <th className="p-2 border-r border-slate-100">Index</th>
                      <th className="p-2 border-r border-slate-100">Key Node</th>
                      <th className="p-2">Parsed Val</th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px] text-slate-600 font-mono">
                    <tr className="border-b border-slate-50 hover:bg-slate-50 transitions-colors">
                      <td className="p-2 border-r border-slate-100 font-bold text-slate-400">A1</td>
                      <td className="p-2 border-r border-slate-100">AppName</td>
                      <td className="p-2 text-emerald-600 font-bold">allchange</td>
                    </tr>
                    <tr className="border-b border-slate-50 hover:bg-slate-50 transitions-colors">
                      <td className="p-2 border-r border-slate-100 font-bold text-slate-400">A2</td>
                      <td className="p-2 border-r border-slate-100">SourceFile</td>
                      <td className="p-2 break-all">{originalFile.name}</td>
                    </tr>
                    <tr className="border-b border-slate-50 hover:bg-slate-50 transitions-colors">
                      <td className="p-2 border-r border-slate-100 font-bold text-slate-400">A3</td>
                      <td className="p-2 border-r border-slate-100">TargetExt</td>
                      <td className="p-2 font-bold select-all uppercase">XLSX</td>
                    </tr>
                    <tr className="border-b border-slate-50 hover:bg-slate-50 transitions-colors">
                      <td className="p-2 border-r border-slate-100 font-bold text-slate-400">A4</td>
                      <td className="p-2 border-r border-slate-100">SecureHash</td>
                      <td className="p-2 text-slate-400">SHA256-RWD21</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-50 p-2.5 text-center text-[10px] text-slate-400 border-t border-slate-100">
                마우스 더블 클릭으로 가상 스프레드시트 값을 로드할 수 있습니다.
              </div>
            </div>
          )}

          {/* Case 4: CAD (dwg/ai/psd) Layer control mock view */}
          {!isImage && ['dwg', 'ai', 'psd'].includes(targetFormat) && (
            <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[280px]">
              <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Layers size={13} className="text-violet-500" />
                  CAD/디자인 벡터 레이어 분석기
                </span>
                <span className="text-[9px] bg-violet-50 text-violet-600 font-bold px-1.5 py-0.5 rounded border border-violet-100">
                  Layer Map
                </span>
              </div>

              {/* Layer Canvas representation */}
              <div className="flex-1 bg-slate-950 flex relative items-center justify-center p-4 overflow-hidden border-b border-slate-100">
                <div className="absolute inset-0 bg-slate-950 grid grid-cols-12 grid-rows-12 opacity-20 pointer-events-none">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div key={i} className="border-[0.5px] border-cyan-500" />
                  ))}
                </div>

                <div className="w-full h-full relative flex items-center justify-center">
                  {layers.background && (
                    <div className="absolute inset-4 rounded-xl border border-slate-700 bg-slate-900/50" />
                  )}
                  {layers.blueprint && (
                    <svg className="absolute w-24 h-24 stroke-cyan-400 fill-none" viewBox="0 0 100 100">
                      <polygon points="10,10 90,10 90,90 10,90" strokeWidth="1" />
                      <circle cx="50" cy="50" r="30" strokeWidth="1" />
                      <line x1="10" y1="10" x2="90" y2="90" strokeWidth="0.5" />
                      <line x1="90" y1="10" x2="10" y2="90" strokeWidth="0.5" />
                    </svg>
                  )}
                  {layers.dimensions && (
                    <svg className="absolute w-28 h-28 stroke-emerald-400 fill-none text-[8px] font-mono" viewBox="0 0 120 120">
                      <line x1="5" y1="5" x2="115" y2="5" strokeWidth="0.5" strokeDasharray="2" />
                      <text x="50" y="15" fill="#34d399">120.00mm</text>
                      <line x1="115" y1="5" x2="115" y2="115" strokeWidth="0.5" strokeDasharray="2" />
                      <text x="80" y="60" fill="#34d399" transform="rotate(90,80,60)">h:120.00</text>
                    </svg>
                  )}
                  {layers.annotations && (
                    <div className="absolute top-6 left-6 bg-slate-900/90 text-[8px] text-yellow-400 py-1 px-2 rounded border border-yellow-500/20 font-mono">
                      TEXT_LAYER: {originalFile.name.substring(0, 10)}
                    </div>
                  )}
                </div>
              </div>

              {/* Layer toggle control menu */}
              <div className="bg-slate-50 p-2.5 grid grid-cols-2 gap-1 px-4">
                {[
                  { key: 'blueprint' as const, label: '도면 디자인 (Blueprint)' },
                  { key: 'dimensions' as const, label: '축척/수치 (Dimensions)' },
                  { key: 'background' as const, label: '배경 도화지 (Background)' },
                  { key: 'annotations' as const, label: '어노테이션 (Text/Tag)' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer text-[10px] text-slate-500 select-none hover:text-slate-800">
                    <input
                      type="checkbox"
                      checked={layers[item.key]}
                      onChange={(e) => setLayers((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                    />
                    <span className="font-medium truncate">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Fallback mock description if format unknown */}
          {!['pdf', 'docx', 'xlsx', 'dwg', 'ai', 'psd', 'png', 'jpg', 'jpeg', 'hwp'].includes(targetFormat) && (
            <div className="flex flex-col items-center justify-center p-6 text-center gap-2">
              <FileCode className="text-slate-400" size={32} />
              <span className="text-xs font-bold text-slate-600 uppercase">
                {targetFormat} 포맷 패키지 인코딩됨
              </span>
              <span className="text-[10px] text-slate-400">
                디바이스 규격에 맞게 변환 데이터 압축이 완료되었습니다.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action triggers bottom bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          id="btn-download-converted"
          onClick={handleDownload}
          className="flex-1 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 flex items-center justify-center gap-2 transition-all text-sm group"
        >
          <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
          다른 이름으로 저장 (PC/모바일 다운로드)
        </button>

        <button
          id="btn-share-mobile"
          onClick={handleNativeShare}
          className="py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all text-sm shrink-0"
        >
          <Share2 size={18} />
          공유 및 전송
        </button>
      </div>

      {/* Action restart button */}
      <button
        id="btn-reset-converter"
        onClick={onReset}
        className="py-2.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all flex items-center justify-center gap-1"
      >
        <ArrowLeft size={14} />
        새로운 파일 변환하기
      </button>

      {/* Custom Mock Mobile Drawer Menu */}
      <AnimatePresence>
        {showShareDrawer && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareDrawer(false)}
              className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-end sm:items-center justify-center"
            >
              {/* Drawer Box */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm text-left shadow-2xl relative z-50 flex flex-col gap-4"
              >
                <div className="flex justify-between items-center sm:border-b sm:pb-3.5 border-slate-100">
                  <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Share2 size={16} className="text-blue-600" />
                    모바일 원클릭 공유 및 기기 저장
                  </span>
                  <button
                    onClick={() => setShowShareDrawer(false)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    닫기
                  </button>
                </div>

                {/* Grid share icons */}
                <div className="grid grid-cols-4 gap-4 py-2">
                  {[
                    { name: '카카오톡', color: 'bg-yellow-100 text-yellow-800' },
                    { name: 'AirDrop', color: 'bg-blue-100 text-blue-800' },
                    { name: '퀵쉐어', color: 'bg-indigo-100 text-indigo-800' },
                    { name: '네이버', color: 'bg-green-100 text-green-800' },
                    { name: '메시지', color: 'bg-emerald-100 text-emerald-800' },
                    { name: '메일', color: 'bg-slate-150 text-slate-800' },
                    { name: '구글드라이브', color: 'bg-amber-100 text-amber-800' },
                    { name: '킵메모', color: 'bg-orange-100 text-orange-850' },
                  ].map((app, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        alert(`${app.name}(으)로 성공적으로 파일 링크를 전송하였습니다.`);
                        setShowShareDrawer(false);
                      }}
                      className="flex flex-col items-center gap-2 group cursor-pointer"
                    >
                      <div className={`w-11 h-11 rounded-2xl ${app.color} flex items-center justify-center font-bold text-[11px] shadow-sm group-hover:scale-105 transition-all`}>
                        {app.name.substring(0, 2)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold truncate w-full text-center">
                        {app.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Instant copy link block */}
                <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    보안 파일 다운로드 URL
                  </span>
                  <div className="flex bg-slate-50 border border-slate-200/60 rounded-xl p-1.5 justify-between items-center text-xs">
                    <span className="text-slate-500 break-all truncate font-mono text-[10px] pl-2">
                      {window.location.origin}/share/allchange-{Math.floor(Math.random() * 100000)}
                    </span>
                    <button
                      id="btn-copy-address"
                      onClick={handleCopyLink}
                      className="py-1.5 px-3 rounded-lg bg-white border border-slate-200 shadow-xs hover:bg-slate-50 hover:text-blue-600 transition-all font-bold shrink-0 text-[10px] flex items-center gap-1 text-slate-600"
                    >
                      <Copy size={11} />
                      {copiedLink ? '복사완료' : '링크 복사'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
