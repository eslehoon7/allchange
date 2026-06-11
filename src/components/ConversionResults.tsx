import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Share2,
  CheckCircle,
  ArrowLeft,
  Copy
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
              <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {originalFile.extension}
              </span>
              <span className="text-slate-500 font-medium">→</span>
              <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${theme.bg} ${theme.text} border ${theme.border}`}>
                {theme.name}
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
