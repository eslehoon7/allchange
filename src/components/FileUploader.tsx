import React, { useRef, useState } from 'react';
import { Upload, FileCode, AlertTriangle, CheckCircle, Smartphone, Monitor } from 'lucide-react';
import { FileData, FileFormat } from '../types';
import { FORMAT_THEMES } from '../utils/converters';

interface FileUploaderProps {
  onFileLoaded: (file: FileData) => void;
  selectedFile: FileData | null;
  onClear: () => void;
}

const SUPPORTED_EXTENSIONS: FileFormat[] = [
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'hwp',
  'docx',
  'pptx',
  'txt',
  'dwg',
  'xlsx',
  'ai',
  'psd',
];

export default function FileUploader({ onFileLoaded, selectedFile, onClear }: FileUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setErrorMsg(null);
    const fileName = file.name;
    const lastDot = fileName.lastIndexOf('.');
    if (lastDot === -1) {
      setErrorMsg('확장자가 없는 파일은 지원하지 않습니다.');
      return;
    }

    const ext = fileName.substring(lastDot + 1).toLowerCase() as FileFormat;

    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      setErrorMsg(`지원하지 않는 파일 형식입니다. (.${ext})`);
      return;
    }

    const reader = new FileReader();

    if (ext === 'txt') {
      reader.onload = (e) => {
        onFileLoaded({
          id: `${Date.now()}-${file.name}`,
          name: file.name,
          size: file.size,
          type: file.type,
          extension: ext,
          rawContent: e.target?.result as string,
        });
      };
      reader.readAsText(file);
    } else if (['jpg', 'jpeg', 'png'].includes(ext)) {
      reader.onload = (e) => {
        onFileLoaded({
          id: `${Date.now()}-${file.name}`,
          name: file.name,
          size: file.size,
          type: file.type,
          extension: ext,
          dataUrl: e.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    } else {
      // For general binary formats (dwg, psd, ai, pdf, docx, pptx, xlsx, hwp)
      // We read as ArrayBuffer or trigger successfully
      onFileLoaded({
        id: `${Date.now()}-${file.name}`,
        name: file.name,
        size: file.size,
        type: file.type,
        extension: ext,
        rawContent: `Binary format ${ext.toUpperCase()}`,
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getFormatBadge = (ext: FileFormat) => {
    const theme = FORMAT_THEMES[ext] || { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
    return (
      <span className={`text-[10px] uppercase font-bold py-0.5 px-2 rounded ${theme.bg} ${theme.text} border ${theme.border}`}>
        {ext}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Upload className="text-blue-500" size={16} />
          변환할 파일 선택
        </h3>
        <span className="text-xs text-slate-400">모바일 & PC 완벽 자동 대응</span>
      </div>

      <div
        id="uploader-container"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={selectedFile ? undefined : triggerFileInput}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-8 text-center transition-all min-h-[220px] ${
          selectedFile
            ? 'border-blue-200 bg-blue-50/20'
            : isDragActive
            ? 'border-blue-600 bg-blue-50/80 scale-[0.98] shadow-inner ring-4 ring-blue-500/10'
            : 'border-slate-200 hover:border-blue-450 hover:bg-slate-50/50 cursor-pointer'
        }`}
      >
        <input
          id="file-input"
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept=".pdf,.jpg,.jpeg,.png,.hwp,.docx,.pptx,.txt,.dwg,.xlsx,.ai,.psd"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center w-full gap-4">
            <div className="relative">
              <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20 animate-bounce-short">
                <FileCode size={36} />
              </div>
              <span className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1 border-2 border-white">
                <CheckCircle size={12} />
              </span>
            </div>

            <div className="flex flex-col items-center gap-1 max-w-[80%]">
              <span className="text-sm font-bold text-slate-800 break-all">{selectedFile.name}</span>
              <div className="flex items-center gap-2 mt-1">
                {getFormatBadge(selectedFile.extension)}
                <span className="text-xs text-slate-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 w-full max-w-xs">
              <button
                id="btn-clear-file"
                onClick={onClear}
                className="flex-1 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                다른 파일 선택
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={`p-4 rounded-2xl transition-all ${isDragActive ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/20' : 'bg-slate-50 text-slate-400 group-hover:text-blue-500'}`}>
              <Upload size={32} className={isDragActive ? 'animate-bounce' : 'animate-pulse'} />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-slate-800 font-bold text-sm">
                {isDragActive ? '여기에 마우스를 놓고 마우스 버튼을 떼서 즉시 업로드하세요!' : '여기에 파일을 드래그하여 놓거나 클릭하여 선택하세요'}
              </p>
              <p className="text-xs text-slate-400">
                PDF, JPG, PNG, HWP, DOCX, PPTX, TXT, DWG, XLSX, AI, PSD 지원
              </p>
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 flex items-start gap-2.5 text-xs">
          <AlertTriangle className="shrink-0 mt-0.5 text-rose-500" size={16} />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold">업로드 실패</span>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* RWD quick guidelines */}
      <div className="grid grid-cols-2 gap-3 bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <Monitor size={14} className="text-slate-400 shrink-0" />
          <span>PC Drag & Drop 지원</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <Smartphone size={14} className="text-slate-400 shrink-0" />
          <span>모바일 터치 앨범/파일 지원</span>
        </div>
      </div>
    </div>
  );
}
