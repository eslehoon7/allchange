import React from 'react';
import { Settings, FileCheck2, Image, Layers, RefreshCw, Eye, Sparkles } from 'lucide-react';
import { FileData, FileFormat, ConversionSettings as SettingsType } from '../types';
import { FORMAT_MAPPINGS, FORMAT_LABELS, FORMAT_THEMES } from '../utils/converters';

interface ConversionSettingsProps {
  file: FileData;
  targetFormat: FileFormat | null;
  onTargetFormatChange: (format: FileFormat) => void;
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
}

export default function ConversionSettings({
  file,
  targetFormat,
  onTargetFormatChange,
  settings,
  onSettingsChange,
}: ConversionSettingsProps) {
  // Get possible target formats for this file
  const availableTargets = FORMAT_MAPPINGS[file.extension] || [];

  const handleSettingsUpdate = <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Target Format Selection */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5 px-0.5">
          <FileCheck2 className="text-blue-500" size={16} />
          변환할 대상 포맷 선택
        </label>

        {availableTargets.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {availableTargets.map((format) => {
              const isSelected = targetFormat === format;
              const theme = FORMAT_THEMES[format] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' };

              return (
                <button
                  key={format}
                  id={`format-btn-${format}`}
                  onClick={() => onTargetFormatChange(format)}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-500/5 ring-1 ring-blue-500'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-[10px] tracking-wider font-extrabold uppercase px-1.5 py-0.5 rounded ${theme.bg} ${theme.text}`}>
                    {format}
                  </span>
                  <span className="text-xs font-bold text-slate-700 mt-2 break-all line-clamp-1">
                    {FORMAT_LABELS[format]?.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center text-xs text-slate-500">
            이 파일 형식은 추가로 제공되는 변환 옵션이 없습니다.
          </div>
        )}
      </div>

      {/* Advanced Parameters Customization */}
      {targetFormat && (
        <div className="bg-slate-50/50 border border-slate-200/60 rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Settings className="text-slate-500" size={14} />
              세부 변환 옵션 설정
            </span>
            <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
              스마트 자동 처리 활성
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Common Document Page Settings */}
            {['pdf', 'docx', 'hwp'].includes(targetFormat) && (
              <>
                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-slate-600">용지 크기 (Page Size)</span>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 rounded-lg p-0.5">
                    {(['A4', 'Letter', 'Original'] as const).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => handleSettingsUpdate('pageSize', sz)}
                        className={`py-1.5 rounded-md font-bold transition-all text-[11px] ${
                          settings.pageSize === sz
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-slate-600">용지 방향 (Orientation)</span>
                  <div className="grid grid-cols-2 gap-1 bg-slate-100 rounded-lg p-0.5">
                    {[
                      { val: 'portrait', name: '세로형' },
                      { val: 'landscape', name: '가로형' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        onClick={() => handleSettingsUpdate('orientation', item.val as 'portrait' | 'landscape')}
                        className={`py-1.5 rounded-md font-bold transition-all text-[11px] ${
                          settings.orientation === item.val
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Custom Image Conversion Parameters */}
            {['jpg', 'jpeg', 'png'].includes(targetFormat) && (
              <>
                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-slate-600">품질 및 압축률 (Quality)</span>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 rounded-lg p-0.5">
                    {[
                      { val: 'low', name: '저용량' },
                      { val: 'medium', name: '일반' },
                      { val: 'high', name: '고화질' },
                    ].map((q) => (
                      <button
                        key={q.val}
                        onClick={() => handleSettingsUpdate('quality', q.val as 'low' | 'medium' | 'high')}
                        className={`py-1.5 rounded-md font-bold transition-all text-[11px] ${
                          settings.quality === q.val
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {q.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-slate-600">색상 스키마 (Color Mode)</span>
                  <div className="grid grid-cols-2 gap-1 bg-slate-100 rounded-lg p-0.5">
                    {[
                      { val: 'color', name: '컬러' },
                      { val: 'grayscale', name: '흑백(Grayscale)' },
                    ].map((m) => (
                      <button
                        key={m.val}
                        onClick={() => handleSettingsUpdate('colorMode', m.val as 'color' | 'grayscale')}
                        className={`py-1.5 rounded-md font-bold transition-all text-[11px] ${
                          settings.colorMode === m.val
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <div className="flex justify-between items-center text-slate-600 font-semibold">
                    <span>이미지 리사이즈 비율</span>
                    <span className="text-blue-600 font-bold">{settings.imageResizePercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="200"
                    step="25"
                    value={settings.imageResizePercent}
                    onChange={(e) => handleSettingsUpdate('imageResizePercent', parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
                    <span>25% (초고속)</span>
                    <span>100% (원본 비율)</span>
                    <span>200% (고해상도 업스케일)</span>
                  </div>
                </div>
              </>
            )}

            {/* Custom Excel settings */}
            {targetFormat === 'xlsx' && (
              <div className="flex flex-col gap-2 sm:col-span-2 bg-white/80 rounded-xl p-3 border border-slate-150">
                <span className="font-semibold text-slate-700">시트 레이아웃 옵션</span>
                <label className="flex items-center gap-2 mt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.xlsxGridlines}
                    onChange={(e) => handleSettingsUpdate('xlsxGridlines', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-[11px] text-slate-600 font-medium">눈금선 표시(Gridlines) 활성화</span>
                </label>
              </div>
            )}

            {/* AutoCAD formats settings */}
            {targetFormat === 'dwg' && (
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="font-semibold text-slate-600">DWG 호환 버전 (AutoCAD Layout Version)</span>
                <select
                  value={settings.dwgVersion}
                  onChange={(e) => handleSettingsUpdate('dwgVersion', e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[11px] font-bold text-slate-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="AutoCAD2018">AutoCAD 2018 호환 도면 (.dwg)</option>
                  <option value="AutoCAD2013">AutoCAD 2013 호환 도면 (.dwg)</option>
                  <option value="AutoCAD2000">AutoCAD 2000 고유 레거시 포맷 (.dwg)</option>
                </select>
              </div>
            )}

            {/* Photoshop/PSD settings */}
            {targetFormat === 'psd' && (
              <div className="flex gap-2 sm:col-span-2 text-[10px] bg-sky-50 text-sky-800 rounded-xl p-3 border border-sky-100">
                <Layers size={16} className="shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold">포토샵 레이어 보존</span>
                  <span>개별 텍스트 및 벡터 레이어를 분할 가능한 독립 채널 레이어로 엮어 변환합니다.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
