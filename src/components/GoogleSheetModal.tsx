import React, { useState } from 'react';
import { APPS_SCRIPT_CODE, sendScoreToGoogleSheet } from '../utils/googleSheetSync';
import { Copy, Check, ExternalLink, Sheet, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetUrl: string;
  onSaveSheetUrl: (url: string) => void;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({
  isOpen,
  onClose,
  sheetUrl,
  onSaveSheetUrl,
}) => {
  const [urlInput, setUrlInput] = useState(sheetUrl || '');
  const [isCopied, setIsCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_CODE);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (e) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = APPS_SCRIPT_CODE;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const handleSaveAndTest = async () => {
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) {
      onSaveSheetUrl('');
      setTestStatus('idle');
      setStatusMessage('Đã xóa liên kết Google Sheet.');
      return;
    }

    if (!cleanUrl.startsWith('https://script.google.com/macros/s/')) {
      setTestStatus('error');
      setStatusMessage('URL phải có dạng: https://script.google.com/macros/s/.../exec');
      return;
    }

    setTestStatus('testing');
    setStatusMessage('Đang gửi 1 dòng dữ liệu mẫu thử nghiệm lên Google Sheet...');

    try {
      await sendScoreToGoogleSheet(cleanUrl, {
        playerName: 'Thử nghiệm kết nối',
        className: 'Kiểm tra',
        examTitle: 'Đề kiểm tra kết nối',
        score: 10,
        partIScore: 3.0,
        partIIScore: 4.0,
        partIIIScore: 3.0,
        totalCorrectPartI: 12,
        totalCorrectPartII: 4,
        totalCorrectPartIII: 6,
        timeSpentSeconds: 125,
        violationCount: 0,
      });

      onSaveSheetUrl(cleanUrl);
      setTestStatus('success');
      setStatusMessage('Đã kết nối thành công! Bạn hãy mở Google Sheet xem dòng dữ liệu thử nghiệm vừa được ghi vào nhé.');
    } catch (err: any) {
      setTestStatus('error');
      setStatusMessage('Có lỗi khi gửi dữ liệu: ' + (err?.message || 'Vui lòng kiểm tra lại quyền truy cập Anyone trên Apps Script.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#070e24] border-2 border-emerald-500/80 rounded-2xl p-4 sm:p-6 shadow-2xl text-slate-100 flex flex-col gap-4 animate-in fade-in zoom-in duration-200 relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1e345e] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Sheet size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-emerald-400 font-serif uppercase tracking-wide flex items-center gap-2">
                KẾT NỐI GOOGLE APPS SCRIPT VỚI GOOGLE SHEET
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                Tự động lưu điểm, thời gian và số lần vi phạm của học sinh lên Google Sheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Step-by-step Guide */}
        <div className="bg-[#04091a] p-3.5 rounded-xl border border-emerald-500/30 text-xs space-y-2.5">
          <div className="font-bold text-amber-300 text-xs sm:text-sm uppercase flex items-center gap-1.5">
            <span>📌</span>
            <span>HƯỚNG DẪN 3 BƯỚC ĐỂ DÁN VÀO APPS SCRIPT:</span>
          </div>

          <ol className="list-decimal list-inside space-y-1.5 text-slate-200 leading-relaxed pl-1">
            <li>
              <strong className="text-white">Tại trang Google Apps Script của bạn (như trong ảnh):</strong> Xóa sạch nội dung cũ (<code className="text-amber-300 bg-black/40 px-1 rounded">function myFunction() ...</code>) trong file <code className="text-sky-300">Mã.gs</code>.
            </li>
            <li>
              <strong className="text-white">Sao chép toàn bộ mã</strong> ở khung bên dưới và dán vào file <code className="text-sky-300">Mã.gs</code>, sau đó bấm biểu tượng <strong className="text-amber-300">Lưu (Ctrl + S)</strong>.
            </li>
            <li>
              <strong className="text-white">Triển khai (Deploy):</strong> Bấm nút <strong className="text-blue-400">Triển khai (Deploy)</strong> ở góc phải trên cùng ➔ Chọn <strong className="text-amber-300">Tùy chọn triển khai mới (New deployment)</strong> ➔ Chọn loại: <strong className="text-white">Ứng dụng web (Web app)</strong>.
              <div className="mt-1 ml-4 p-2 bg-emerald-950/50 border border-emerald-500/40 rounded text-[11px] text-emerald-200 space-y-0.5">
                <p>• <strong>Thực thi dưới dạng (Execute as):</strong> Chọn <em>Tôi (email của bạn)</em></p>
                <p>• <strong>Ai có quyền truy cập (Who has access):</strong> Chọn <strong className="text-amber-300 underline">Bất kỳ ai (Anyone)</strong> <em>(quan trọng để app gửi được dữ liệu)</em></p>
              </div>
            </li>
            <li>
              Bấm <strong className="text-emerald-400">Triển khai</strong>, cho phép quyền truy cập (nếu Google yêu cầu), sau đó <strong className="text-white">Sao chép URL ứng dụng web</strong> (có đuôi <code className="text-amber-300">/exec</code>) và dán vào ô bên dưới.
            </li>
          </ol>
        </div>

        {/* Code Box with Copy Button */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#facc15] uppercase tracking-wider flex items-center gap-1.5">
              <span>📋</span> MÃ DÁN VÀO FILE MÃ.GS (APPS SCRIPT):
            </span>
            <button
              onClick={handleCopyCode}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                isCopied
                  ? 'bg-emerald-500 text-slate-950 font-black scale-105'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold'
              }`}
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
              <span>{isCopied ? 'ĐÃ SAO CHÉP MÃ!' : 'SAO CHÉP MÃ'}</span>
            </button>
          </div>

          <div className="relative">
            <pre className="bg-[#020612] text-emerald-300 font-mono text-[11px] p-3 rounded-xl border border-slate-700 max-h-48 overflow-y-auto leading-normal select-all">
              {APPS_SCRIPT_CODE}
            </pre>
          </div>
        </div>

        {/* Input Web App URL */}
        <div className="bg-[#050b1e] p-3.5 rounded-xl border border-[#1e345e] flex flex-col gap-2">
          <label className="text-xs font-bold text-sky-300 uppercase tracking-wide">
            🔗 DÁN URL ỨNG DỤNG WEB (WEB APP URL) TỪ GOOGLE APPS SCRIPT VÀO ĐÂY:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              className="flex-1 bg-[#020514] border border-sky-500/60 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
            <button
              onClick={handleSaveAndTest}
              disabled={testStatus === 'testing'}
              className="px-4 py-2 rounded-lg font-bold text-xs bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 active:scale-95 text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 shrink-0"
            >
              {testStatus === 'testing' ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Đang thử...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>LƯU & THỬ KẾT NỐI</span>
                </>
              )}
            </button>
          </div>

          {/* Test Status Feedback */}
          {testStatus === 'success' && (
            <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {sheetUrl && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> Đang kích hoạt tự động gửi bài thi lên Google Sheet
              </span>
              <button
                onClick={() => {
                  setUrlInput('');
                  onSaveSheetUrl('');
                  setTestStatus('idle');
                }}
                className="text-rose-400 hover:underline cursor-pointer"
              >
                Hủy kết nối
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e345e]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold uppercase transition cursor-pointer"
          >
            ĐÓNG
          </button>
        </div>
      </div>
    </div>
  );
};
