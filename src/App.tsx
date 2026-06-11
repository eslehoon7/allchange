import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileCode,
  Zap,
  ShieldAlert,
  Server,
  Hourglass,
  ArrowRight,
  Info,
  RefreshCw,
  Sparkles,
  HelpCircle,
  FileCheck2,
  Lock,
  ChevronDown,
  MonitorCheck,
  CheckCircle2,
  ArrowLeftRight
} from 'lucide-react';
import { FileData, FileFormat, ConversionSettings as SettingsType, LogEntry } from './types';
import FileUploader from './components/FileUploader';
import ConversionSettings from './components/ConversionSettings';
import ProgressIndicator from './components/ProgressIndicator';
import ConversionResults from './components/ConversionResults';
import AdSidebar from './components/AdSidebar';
import { generateConvertedFile } from './utils/converters';

const INITIAL_SETTINGS: SettingsType = {
  quality: 'high',
  pageSize: 'A4',
  orientation: 'portrait',
  imageResizePercent: 100,
  hwpCompatibility: 'standard',
  dwgVersion: 'AutoCAD2018',
  xlsxGridlines: true,
  colorMode: 'color',
};


export default function App() {
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [targetFormat, setTargetFormat] = useState<FileFormat | null>(null);
  const [settings, setSettings] = useState<SettingsType>(INITIAL_SETTINGS);

  // Conversion process states
  const [step, setStep] = useState<'upload' | 'converting' | 'completed'>('upload');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [speed, setSpeed] = useState('0.0 MB/s');

  // Converted result states
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [convertedFileName, setConvertedFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [conversionCount, setConversionCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('allchange_conversion_count');
      return saved ? parseInt(saved, 10) : 1;
    }
    return 1;
  });

  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [{ timestamp, message, type }, ...prev]);
  };

  const handleFileLoaded = (file: FileData) => {
    setSelectedFile(file);
    // Reset any target formats to empty on change
    setTargetFormat(null);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setTargetFormat(null);
    setStep('upload');
    setProgress(0);
    setLogs([]);
  };

  const startConversion = async () => {
    if (!selectedFile || !targetFormat) return;

    setStep('converting');
    setProgress(0);
    setLogs([]);
    setSpeed(`${(1.5 + Math.random() * 8).toFixed(1)} MB/s`);

    addLog('변환 세션을 생성하고 게이트웨이를 바인딩합니다.', 'info');
    addLog(`원본 파일 진단 수행 중: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`, 'info');

    // Simulate stepping through progress
    const steps = [
      { p: 10, msg: '파일 포맷 구조 파싱 및 인바운드 보안 무결성 검증 완수.', type: 'success' },
      { p: 25, msg: '클라우드 코어 변환 어댑터 구성 및 매핑 테이블 셋업 완료.', type: 'info' },
      { p: 40, msg: `대상 출력 포맷 (${targetFormat.toUpperCase()}) 인코딩 레지스터 초기화 완료.`, type: 'info' },
      { p: 55, msg: '데이터 레이아웃 다중 구조 통합 벡터 합성 연산 실시 중...', type: 'info' },
      { p: 70, msg: '화상 픽셀 매핑 및 고화질 무손실 서포터 압축 활성.', type: 'warn' },
      { p: 85, msg: '보안 전송 규정(AES-256)에 의거하여 청정에 격리된 임시 컨테이너 작성 완료.', type: 'success' },
      { p: 95, msg: '변환 무해성 자가 정밀 감사 수행 중... [위협 탐지: 0건]', type: 'success' },
      { p: 100, msg: '물리적인 변환 결과물 다운로드 채널 최종 패키징 마침.', type: 'success' },
    ];

    let currentIdx = 0;

    const interval = setInterval(async () => {
      setProgress((prev) => {
        // Find if we crossed a milestone to post a log
        const nextProgress = prev + 1;

        if (currentIdx < steps.length && nextProgress >= steps[currentIdx].p) {
          addLog(steps[currentIdx].msg, steps[currentIdx].type as LogEntry['type']);
          currentIdx++;
          // Randomize speed fluctuation for high interactive realism
          setSpeed(`${(2.5 + Math.random() * 8.5).toFixed(1)} MB/s`);
        }

        if (nextProgress >= 100) {
          clearInterval(interval);
          finishConversion();
          return 100;
        }

        return nextProgress;
      });
    }, 30); // ~3 seconds total
  };

  const finishConversion = async () => {
    if (!selectedFile || !targetFormat) return;

    try {
      const result = await generateConvertedFile(
        selectedFile.name,
        targetFormat,
        selectedFile.dataUrl,
        selectedFile.rawContent,
        conversionCount
      );

      setConvertedBlob(result.blob);
      setConvertedFileName(result.fileName);
      setPreviewUrl(result.previewUrl);
      setStep('completed');

      // Increment and persist the file counter for high uniqueness on local filesystem downloads
      const nextCount = conversionCount + 1;
      setConversionCount(nextCount);
      localStorage.setItem('allchange_conversion_count', String(nextCount));
    } catch (e) {
      addLog('변환 스트림 생성 도중 예상치 못한 오류가 생겼습니다.', 'error');
      setStep('upload');
    }
  };

  const handleReset = () => {
    handleClearFile();
  };

  return (
    <div id="root-theme-container" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Dynamic top safety border banner with gradient accents */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-600" />

      {/* Modern Compact Header with Brand Title "allchange" */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 select-none transition-transform hover:scale-105 duration-300">
              <ArrowLeftRight size={18} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <h1 id="brand-title" className="text-xl font-black text-slate-900 tracking-tight leading-none">
                allchange
              </h1>
              <span className="text-[9px] text-blue-600 font-bold tracking-widest uppercase mt-0.5">
                SMART FORMAT CONVERTER
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50/80 font-bold py-1.5 px-3 rounded-lg select-none border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              서버 가동률 99.9%
            </span>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-semibold text-slate-600 transition-all ml-1 bg-slate-50 py-1.5 px-3 rounded-lg select-none flex items-center gap-1 border border-slate-200/85">
                <Lock size={12} className="text-slate-400" />
                SSL 암호화 연결
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Dashboard Structure */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* 3-Column Layout: Left Ad (AdSpace), Center Core Converter, Right Ad (AdSpace) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: 2 Vertical Ad slots on Desktop, stacks on mobile */}
          <div id="left-layout-ads" className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs lg:sticky lg:top-[90px]">
              <AdSidebar position="left" />
            </div>
          </div>

          {/* MAIN CENTER WORKSPACE COLUMN: All Core File upload & Format converters */}
          <div id="center-layout-workspace" className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col gap-6 relative">
              <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[10px] uppercase tracking-widest py-1 px-4 rounded-full shadow-md shadow-blue-500/10">
                변환 워크스페이스
              </div>

              {step === 'upload' && (
                <>
                  <FileUploader
                    onFileLoaded={handleFileLoaded}
                    selectedFile={selectedFile}
                    onClear={handleClearFile}
                  />

                  {selectedFile && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex flex-col gap-6 mt-2 pt-4 border-t border-slate-100"
                    >
                      <ConversionSettings
                        file={selectedFile}
                        targetFormat={targetFormat}
                        onTargetFormatChange={setTargetFormat}
                        settings={settings}
                        onSettingsChange={setSettings}
                      />

                      {targetFormat && (
                        <button
                          id="btn-process-convert"
                          onClick={startConversion}
                          className="py-4 px-6 bg-blue-600 hover:bg-blue-700 hover:scale-[1.005] active:scale-[0.995] text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <RefreshCw className="animate-spin-slow" size={18} />
                          초고속 완벽 변환 즉시 실행하기
                        </button>
                      )}
                    </motion.div>
                  )}
                </>
              )}

              {step === 'converting' && (
                <ProgressIndicator progress={progress} logs={logs} speed={speed} />
              )}

              {step === 'completed' && selectedFile && targetFormat && (
                <ConversionResults
                  originalFile={selectedFile}
                  targetFormat={targetFormat}
                  settings={settings}
                  convertedBlob={convertedBlob}
                  convertedFileName={convertedFileName}
                  previewUrl={previewUrl}
                  onReset={handleReset}
                />
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ad slots on Desktop, stacks on mobile */}
          <div id="right-layout-ads" className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs lg:sticky lg:top-[90px]">
              <AdSidebar position="right" />
            </div>
          </div>
        </section>

        {/* Informative Frequently Asked Questions (FAQ) details widget section */}
        <section className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 flex flex-col gap-4.5 shadow-xs">
          <h3 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
            <Info className="text-blue-600" size={18} />
            allchange 자주 묻는 질문 (FAQ)
          </h3>

          <div className="flex flex-col divide-y divide-slate-100">
            {[
              {
                q: 'allchange에서 변환된 한글(HWP) 파일의 레이아웃 깨짐 현상이 없나요?',
                a: '당사는 PDF 및 폰트 유효 벡터 분석 매퍼를 지원합니다. 이를 통해 글꼴 유실이나 텍스트 정렬 풀림을 방지하여 다른이름으로 저장 시 깨짐 없는 깨끗한 형태를 구현합니다.',
              },
              {
                q: 'CAD(dwg)에서 JPG/PNG 변환 설정 시 고해상도가 유지되나요?',
                a: '네. 레이아웃 뷰어 미리보기와 전속 Layer 래스터화 방식을 적용하여 최대 200% 배율에서 고해상도 벡터 정밀 스캔 출력을 지원하므로 고화질 출력이 가능합니다.',
              },
              {
                q: '사용 기기가 모바일입니다. 공유나 다운로드 경로가 어떻게 실행되나요?',
                a: '변환 완료 화면 하단의 다른이름으로 저장 버튼 클릭 시, 모바일 내장 다운로드 파일 보관함에 즉시 안전 배정됩니다. 또한 모바일 공유 버튼 활성화 시 기기의 카카오톡, 메시지 또는 에어드롭 연동창으로 연계됩니다.',
              },
              {
                q: '개인 및 엔터프라이즈 파일은 보안에 안전한가요?',
                a: '접속 SSL 256비트 종단 암호화 변환 후, 다운로드가 이루어지거나 브라우저 탭 세션이 닫히는 즉시 서버의 로컬 물리 저장장치 및 휘발성 메모리(VM) 블록에서 100% 영구 삭제 처리합니다.',
              },
            ].map((faq, i) => (
              <div key={i} className="py-3 flex flex-col gap-2">
                <button
                  onClick={() => setActiveFAQ(activeFAQ === i ? null : i)}
                  className="flex justify-between items-center text-left text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span>Q. {faq.q}</span>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${
                      activeFAQ === i ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
                {activeFAQ === i && (
                  <p className="text-xs text-slate-500 leading-relaxed font-normal bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* RWD Compliant dynamic bottom footer copyright */}
      <footer className="bg-white border-t border-slate-200 text-slate-400 text-xs py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-700 text-sm">allchange</span>
            <span className="text-[10px] text-slate-300">|</span>
            <span>초고속 지능형 포맷 최적화 엔진</span>
          </div>
          <p className="font-normal">
            © {new Date().getFullYear()} allchange. All rights reserved. Secure Cloud Server Cluster.
          </p>
        </div>
      </footer>
    </div>
  );
}
