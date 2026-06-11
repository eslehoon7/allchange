import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Download, RefreshCw, X, HelpCircle, HardDrive } from 'lucide-react';
import { AdData } from '../types';

interface AdSidebarProps {
  position: 'left' | 'right';
}

const MOCK_ADS: Record<'left' | 'right', AdData[]> = {
  left: [
    {
      id: 'l1',
      title: 'allchange Premium',
      description: '용량 제한 무제한 & 더 빠른 동시 일괄 변환 서비스를 경험해보세요.',
      badge: 'PRO 추천',
      cta: '무료 평가판 시작',
      accentColor: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'l2',
      title: 'Secure Cloud 저장소',
      description: '변환된 소중한 비즈니스 문서들을 256비트 암호화 클라우드에 영구 보호하세요.',
      badge: '보안인증',
      cta: '클라우드 무료 20GB',
      accentColor: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'l3',
      title: 'AutoCAD DWG 뷰어',
      description: '프로그램 무설치! 웹 브라우저에서 바로 여는 초경량 도면 설계 모듈.',
      badge: '웹 도구',
      cta: '즉시 열기',
      accentColor: 'from-purple-600 to-violet-600',
    },
  ],
  right: [
    {
      id: 'r1',
      title: 'HWP 오피스 팩 무료',
      description: '맥(Mac)과 모바일에서도 한글 깨짐 걱정 없는 완벽 통합 웹 변환 패키지.',
      badge: '인기 도구',
      cta: '자세히 알아보기',
      accentColor: 'from-sky-500 to-blue-600',
    },
    {
      id: 'r2',
      title: 'PSD/AI 레이어 분리',
      description: '포토샵과 일러스트레이터 없이 레이어 단위로 이미지 고정밀 압축 추출.',
      badge: '디자이너 필히',
      cta: '레이어 변환툴',
      accentColor: 'from-amber-500 to-orange-500',
    },
    {
      id: 'r3',
      title: 'PDF 스마트 압축 엔진',
      description: '해상도는 그대로 유지하면서 파일 크기만 최대 90% 즉시 줄여줍니다.',
      badge: '용량 절약',
      cta: '초특급 압축기',
      accentColor: 'from-rose-500 to-pink-500',
    },
  ],
};

export default function AdSidebar({ position }: AdSidebarProps) {
  const ads = MOCK_ADS[position];
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  const [closedAds, setClosedAds] = useState<Record<string, boolean>>({});

  const handleAdClick = (adId: string) => {
    setClickCounts((prev) => ({
      ...prev,
      [adId]: (prev[adId] || 0) + 1,
    }));
  };

  const closeAd = (adId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setClosedAds((prev) => ({
      ...prev,
      [adId]: true,
    }));
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-semibold text-slate-400 tracking-wider">
          {position === 'left' ? '스마트 제안 서비스 ◀' : '▶ 특화 기능 추천'}
        </span>
        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">
          AD
        </span>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {ads.map((ad, idx) => {
          const isClosed = closedAds[ad.id];
          if (isClosed) {
            // Render basic minimal layout when ad is closed, allowing them to restore it (nice interaction)
            return (
              <div
                key={ad.id}
                className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between text-xs text-slate-400 h-[100px] transition-all"
              >
                <span>제안 슬롯 {idx + 1} 비활성화됨</span>
                <button
                  onClick={() => setClosedAds((prev) => ({ ...prev, [ad.id]: false }))}
                  className="text-blue-500 hover:underline font-medium text-[11px]"
                >
                  슬롯 켜기
                </button>
              </div>
            );
          }

          return (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -3, scale: 1.01 }}
              onClick={() => handleAdClick(ad.id)}
              className="relative group cursor-pointer bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[180px] overflow-hidden"
              style={{
                id: `ad-${position}-${idx}`,
              }}
            >
              {/* Corner decor glow background */}
              <div
                className={`absolute -right-12 -bottom-12 w-28 h-28 rounded-full bg-gradient-to-br ${ad.accentColor} opacity-5 group-hover:opacity-10 transition-all blur-xl`}
              />

              <div className="flex flex-col gap-2 relative z-10">
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${ad.accentColor}`}>
                    {ad.badge}
                  </span>
                  <button
                    onClick={(e) => closeAd(ad.id, e)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-all"
                    title="추천 끄기"
                  >
                    <X size={12} />
                  </button>
                </div>

                <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                  {ad.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-normal line-clamp-2">
                  {ad.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-2 relative z-10 border-t border-slate-100">
                <span className="text-[10px] text-slate-400">
                  {clickCounts[ad.id] ? `클릭 ${clickCounts[ad.id]}회` : '실시간 최적화'}
                </span>
                <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  {ad.cta}
                  <ArrowRight size={12} />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/60 flex items-center gap-3">
        <ShieldCheck className="text-blue-500 shrink-0" size={20} />
        <div className="flex flex-col">
          <span className="text-xs font-bold text-blue-900">100% 안전 보장</span>
          <span className="text-[10px] text-blue-700/80 leading-normal">
            다운로드 직후 서버에서 파일 완전 영구 청소
          </span>
        </div>
      </div>
    </div>
  );
}
