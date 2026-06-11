import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Terminal, RefreshCw, BarChart2, ShieldAlert } from 'lucide-react';
import { LogEntry } from '../types';

interface ProgressIndicatorProps {
  progress: number;
  logs: LogEntry[];
  speed: string;
}

export default function ProgressIndicator({ progress, logs, speed }: ProgressIndicatorProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(timer);
  }, []);

  const getStepStatusClass = (stepMin: number, stepMax: number) => {
    if (progress >= stepMax) return 'bg-green-500 text-white';
    if (progress >= stepMin) return 'bg-blue-600 text-white animate-pulse';
    return 'bg-slate-100 text-slate-400 border border-slate-200';
  };

  const getStepTextClass = (stepMin: number) => {
    if (progress >= stepMin) return 'text-slate-800 font-bold';
    return 'text-slate-400 font-medium';
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* High precision circular loading HUD */}
      <div className="flex flex-col items-center justify-center py-4 relative">
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Circular background track */}
          <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              className="stroke-slate-100"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Animated blue load line */}
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              className="stroke-blue-600"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray="251.2"
              animate={{ strokeDashoffset: 251.2 - (251.2 * progress) / 100 }}
              transition={{ ease: 'easeOut', duration: 0.1 }}
              strokeLinecap="round"
            />
          </svg>

          {/* Centered digits */}
          <div className="flex flex-col items-center justify-center relative">
            <span className="text-3xl font-extrabold text-blue-900 tracking-tight">
              {progress}%
            </span>
            <span className="text-[9px] text-blue-500 font-bold uppercase tracking-wider mt-0.5">
              변환중{dots}
            </span>
          </div>
        </div>
      </div>

      {/* Speed & Compression HUD info block */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3 flex flex-col gap-1 items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Cpu size={12} />
            클라우드 처리 속도
          </span>
          <span className="text-sm font-extrabold text-slate-800 tracking-tight">
            {speed}
          </span>
        </div>
        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3 flex flex-col gap-1 items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <BarChart2 size={12} />
            변환 실시간 코어
          </span>
          <span className="text-sm font-extrabold text-slate-800 tracking-tight">
            NVIDIA vGPU Accel
          </span>
        </div>
      </div>

      {/* Stepped Checklist Process */}
      <div id="processing-steps" className="flex flex-col gap-3.5 bg-white border border-slate-150 rounded-2xl p-4.5">
        <h4 className="text-xs font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
          <RefreshCw className="animate-spin text-blue-500" size={13} />
          단계별 변환 처리 현황
        </h4>

        <div className="flex flex-col gap-3 text-xs">
          {[
            { min: 0, max: 25, label: '1단계: 파일 정밀 구조 스캔 및 헤더 무결성 검증' },
            { min: 25, max: 55, label: '2단계: 포맷 어댑터 매핑 구조 설계 및 폰트 매칭' },
            { min: 55, max: 85, label: '3단계: 데이터 인코더 압축 및 고해상도 품질 향상' },
            { min: 85, max: 100, label: '4단계: 최종 포맷 패키징 및 다운로드 채널 활성화' },
          ].map((step, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm transition-all ${getStepStatusClass(
                  step.min,
                  step.max
                )}`}
              >
                {idx + 1}
              </span>
              <span className={`transition-colors ${getStepTextClass(step.min)}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Simulated Live Terminal logs */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Terminal size={14} className="text-slate-500" />
            변환 디버그 실시간 로그
          </span>
          <span className="text-[10px] text-slate-400 font-medium">안전 전송 모드</span>
        </div>

        <div className="bg-slate-900 text-slate-300 font-mono text-[10px] leading-relaxed rounded-2xl p-4 h-36 overflow-y-auto flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-slate-700">
          <AnimatePresence initial={false}>
            {logs.map((log, index) => {
              let color = 'text-slate-300';
              if (log.type === 'success') color = 'text-green-400 font-semibold';
              if (log.type === 'warn') color = 'text-yellow-400';
              if (log.type === 'error') color = 'text-rose-400 font-bold';

              return (
                <div key={index} className="flex gap-2">
                  <span className="text-slate-500 font-semibold shrink-0">[{log.timestamp}]</span>
                  <span className={color}>{log.message}</span>
                </div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
