import React, { useState, useRef, useEffect } from 'react';
import { Settings, Users, Trophy, Palette, Volume2, Upload, Download, Trash2, Plus, X, RotateCcw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Participant, Prize, AppSettings } from '../types';
import { DEFAULT_PRIZES } from '../constants';

interface SettingsPanelProps {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  participants: Participant[];
  setParticipants: (p: Participant[]) => void;
  prizes: Prize[];
  setPrizes: (p: Prize[]) => void;
  winners?: Record<string, Participant[]>;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  setSettings,
  participants,
  setParticipants,
  prizes,
  setPrizes,
  winners,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'display' | 'data' | 'prizes' | 'branding' | 'sounds'>('display');
  const [confirmAction, setConfirmAction] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];
      
      const imported: Participant[] = data.map((row, idx) => ({
        id: String(row.id || row.ID || row['Mã'] || `p-${idx}`),
        name: String(row.name || row.Name || row['Họ tên'] || 'Không xác định'),
        department: String(row.department || row.Department || row['Phòng ban'] || ''),
        phone: String(row.phone || row.Phone || row['SĐT'] || '')
      }));
      
      setParticipants(imported);
    };
    reader.readAsBinaryString(file);
  };

  const exportWinnersToExcel = () => {
    if (!winners || Object.keys(winners).length === 0) {
      alert("Chưa có dữ liệu trúng thưởng!");
      return;
    }
    const data: any[] = [];
    prizes.forEach(prize => {
      const prizeWinners = winners[prize.id] || [];
      prizeWinners.forEach(w => {
        data.push({
          'Giải thưởng': prize.name,
          'Mã NV/ID': w.id,
          'Họ tên': w.name,
          'Phòng ban': w.department || '',
          'Số điện thoại': w.phone || ''
        });
      });
    });
    
    if (data.length === 0) {
      alert("Chưa có dữ liệu trúng thưởng!");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "KẾT QUẢ");
    XLSX.writeFile(wb, "Ket_Qua_Quay_So.xlsx");
  };

  const downloadTemplate = () => {
    const templateData = [
      { 'ID': 'NV001', 'Họ tên': 'Nguyễn Văn A', 'Phòng ban': 'Phòng Kỹ thuật', 'SĐT': '0901234567' },
      { 'ID': 'NV002', 'Họ tên': 'Trần Thị B', 'Phòng ban': 'Phòng Nhân sự', 'SĐT': '0907654321' },
      { 'ID': 'NV003', 'Họ tên': 'Lê Văn C', 'Phòng ban': 'Phòng Kinh doanh', 'SĐT': '0912345678' },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh sách");
    XLSX.writeFile(wb, "Mau_Danh_Sach_Tham_Gia.xlsx");
  };

  const addPrize = () => {
    setPrizes([...prizes, { id: crypto.randomUUID(), name: 'Giải thưởng mới', count: 1 }]);
  };

  const updatePrize = (id: string, updates: Partial<Prize>) => {
    setPrizes(prizes.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removePrize = (id: string) => {
    setPrizes(prizes.filter(p => p.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl h-[80vh] rounded-2xl flex overflow-hidden shadow-2xl">
        {/* Sidebar */}
        <div className="w-64 border-right border-zinc-800 bg-zinc-950 p-4 flex flex-col gap-2">
          <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4 px-2">Cài đặt</h2>
          <button 
            onClick={() => setActiveTab('display')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'display' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Settings size={18} /> Hiển thị
          </button>
          <button 
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'data' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Users size={18} /> Danh sách
          </button>
          <button 
            onClick={() => setActiveTab('prizes')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'prizes' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Trophy size={18} /> Giải thưởng
          </button>
          <button 
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'branding' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Palette size={18} /> Giao diện
          </button>
          <button 
            onClick={() => setActiveTab('sounds')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'sounds' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Volume2 size={18} /> Âm thanh
          </button>
          
          <div className="mt-auto">
            <button 
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 bg-zinc-100 text-black font-bold py-3 rounded-xl hover:bg-white transition-colors"
            >
              Lưu & Đóng
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-zinc-900">
          {activeTab === 'display' && (
            <div className="space-y-10">
              <section className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Settings size={18} />
                  </div>
                  <h3 className="text-xl font-bold">Thông tin sự kiện</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Tên sự kiện</label>
                    <input 
                      type="text" 
                      value={settings.eventName || ''}
                      onChange={(e) => setSettings({ ...settings, eventName: e.target.value })}
                      placeholder="Ví dụ: TẤT NIÊN 2024"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Câu lệnh sẵn sàng</label>
                    <input 
                      type="text" 
                      value={settings.readyText || ''}
                      onChange={(e) => setSettings({ ...settings, readyText: e.target.value })}
                      placeholder="SẴN SÀNG QUAY SỐ"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Cỡ chữ sự kiện</label>
                      <input 
                        type="number" 
                        value={settings.eventNameSize || 0}
                        onChange={(e) => setSettings({ ...settings, eventNameSize: parseInt(e.target.value) || 0 })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Cỡ chữ giải</label>
                      <input 
                        type="number" 
                        value={settings.prizeNameSize || 0}
                        onChange={(e) => setSettings({ ...settings, prizeNameSize: parseInt(e.target.value) || 0 })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                    <Trophy size={18} />
                  </div>
                  <h3 className="text-xl font-bold">Hiển thị người trúng giải</h3>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Số cột hiển thị (Dạng lưới)</label>
                      <input 
                        type="number" 
                        min="1"
                        max="10"
                        value={settings.winnerGridCols || 1}
                        onChange={(e) => setSettings({ ...settings, winnerGridCols: parseInt(e.target.value) || 1 })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-yellow-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Độ rộng vùng hiển thị</label>
                      <select 
                        value={settings.winnerCardWidth || 'max-w-6xl'}
                        onChange={(e) => setSettings({ ...settings, winnerCardWidth: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-yellow-500 transition-all appearance-none"
                      >
                        <option value="max-w-md">Rất hẹp (Mobile)</option>
                        <option value="max-w-2xl">Hẹp</option>
                        <option value="max-w-4xl">Trung bình</option>
                        <option value="max-w-6xl">Rộng</option>
                        <option value="max-w-full">Toàn màn hình (Sát 2 bên)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Kiểu hiển thị kết quả</label>
                    <div className="flex bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
                      <button
                        onClick={() => setSettings({ ...settings, winnerLayout: 'grid' })}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                          settings.winnerLayout === 'grid' ? 'bg-zinc-700 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                          <div className="bg-current opacity-40 rounded-sm" />
                          <div className="bg-current opacity-40 rounded-sm" />
                          <div className="bg-current opacity-40 rounded-sm" />
                          <div className="bg-current opacity-40 rounded-sm" />
                        </div>
                        Dạng Lưới (Ô vuông)
                      </button>
                      <button
                        onClick={() => setSettings({ ...settings, winnerLayout: 'list' })}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                          settings.winnerLayout === 'list' ? 'bg-zinc-700 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <div className="flex flex-col gap-0.5 w-4 h-4">
                          <div className="bg-current opacity-40 rounded-sm h-1" />
                          <div className="bg-current opacity-40 rounded-sm h-1" />
                          <div className="bg-current opacity-40 rounded-sm h-1" />
                        </div>
                        Dạng Danh sách (Rộng)
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800/50">
                  <h3 className="text-sm font-bold mb-6 text-zinc-400 uppercase tracking-widest">Độ phân giải LED</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-wider">Chiều rộng (px)</label>
                      <input 
                        type="number" 
                        value={settings.resolution?.width || 1920}
                        onChange={(e) => setSettings({ ...settings, resolution: { ...settings.resolution, width: parseInt(e.target.value) || 1920 } })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-zinc-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-wider">Chiều cao (px)</label>
                      <input 
                        type="number" 
                        value={settings.resolution?.height || 1080}
                        onChange={(e) => setSettings({ ...settings, resolution: { ...settings.resolution, height: parseInt(e.target.value) || 1080 } })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-zinc-500 transition-all"
                      />
                    </div>
                  </div>
                </section>

                <section className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800/50">
                  <h3 className="text-sm font-bold mb-6 text-zinc-400 uppercase tracking-widest">Vùng an toàn (Padding)</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {['trên', 'phải', 'dưới', 'trái'].map((dir, idx) => {
                      const key = ['top', 'right', 'bottom', 'left'][idx];
                      return (
                        <div key={key}>
                          <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-wider text-center">{dir}</label>
                          <input 
                            type="number" 
                            value={(settings.padding as any)[key] || 0}
                            onChange={(e) => setSettings({ ...settings, padding: { ...settings.padding, [key]: parseInt(e.target.value) || 0 } })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-center focus:outline-none focus:border-zinc-500 transition-all"
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Danh sách tham gia ({participants.length})</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors text-blue-400"
                  >
                    <Download size={16} /> Tải file mẫu
                  </button>
                  <label className="cursor-pointer flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors">
                    <Upload size={16} /> Nhập Excel
                    <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleExcelImport} />
                  </label>
                  <button 
                    onClick={exportWinnersToExcel}
                    className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors text-green-400 font-bold"
                  >
                    <Download size={16} /> Xuất kết quả
                  </button>
                  <button 
                    onClick={() => {
                      setConfirmAction({
                        message: 'Bạn có chắc chắn muốn đặt lại danh sách người trúng giải? Hành động này không thể hoàn tác.',
                        onConfirm: async () => {
                          await fetch('/api/winners', { method: 'DELETE' });
                          window.location.reload();
                        }
                      });
                    }}
                    className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors text-yellow-500 min-w-[140px] justify-center"
                  >
                    Đặt lại kết quả
                  </button>
                  <button 
                    onClick={() => {
                      setConfirmAction({
                        message: 'Bạn có chắc chắn muốn xóa toàn bộ danh sách tham gia? Mọi người sẽ bị xóa khỏi danh sách.',
                        onConfirm: () => setParticipants([])
                      });
                    }}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} /> Xóa tất cả
                  </button>
                </div>
              </div>
              
              <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-zinc-900 text-zinc-500 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3">Mã</th>
                      <th className="px-4 py-3">Họ tên</th>
                      <th className="px-4 py-3">Phòng ban</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {participants.slice(0, 100).map((p) => (
                      <tr key={p.id} className="text-sm text-zinc-300">
                        <td className="px-4 py-3 font-mono">{p.id}</td>
                        <td className="px-4 py-3">{p.name}</td>
                        <td className="px-4 py-3">{p.department}</td>
                      </tr>
                    ))}
                    {participants.length > 100 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-center text-zinc-500 italic">
                          Đang hiển thị 100 trong số {participants.length} người tham gia...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'prizes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Danh sách giải thưởng</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setConfirmAction({
                        message: 'Bạn có chắc chắn muốn đặt lại danh sách giải thưởng về mặc định?',
                        onConfirm: () => setPrizes(DEFAULT_PRIZES)
                      });
                    }}
                    className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors text-zinc-400"
                  >
                    <RotateCcw size={16} /> Mặc định
                  </button>
                  <button 
                    onClick={addPrize}
                    className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus size={16} /> Thêm giải thưởng
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {prizes.map((prize) => (
                  <div key={prize.id} className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Tên giải thưởng</label>
                          <input 
                            value={prize.name || ''}
                            onChange={(e) => updatePrize(prize.id, { name: e.target.value })}
                            placeholder="Tên giải thưởng"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Số lượng</label>
                          <input 
                            type="number"
                            value={prize.count || 0}
                            onChange={(e) => updatePrize(prize.id, { count: parseInt(e.target.value) || 0 })}
                            placeholder="Số lượng"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => removePrize(prize.id)}
                        className="text-zinc-500 hover:text-red-400 p-2 mt-5"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-xs text-zinc-500 mb-1">Hình ảnh giải thưởng (URL)</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={prize.image || ''}
                            onChange={(e) => updatePrize(prize.id, { image: e.target.value })}
                            placeholder="https://..."
                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white text-xs"
                          />
                          <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg transition-colors text-xs flex items-center gap-1">
                            <Upload size={14} /> Tải lên
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const formData = new FormData();
                                formData.append('file', file);
                                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                const data = await res.json();
                                if (data.url) updatePrize(prize.id, { image: data.url });
                              }} 
                            />
                          </label>
                        </div>
                      </div>
                      {prize.image && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-800 bg-black flex items-center justify-center">
                          <img src={prize.image} className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-8">
              <section>
                <h3 className="text-xl font-bold mb-4">Hình nền</h3>
                <div className="grid grid-cols-3 gap-4">
                  {['Màu sắc', 'Hình ảnh', 'Video'].map((label, idx) => {
                    const type = ['color', 'image', 'video'][idx];
                    return (
                      <button 
                        key={type}
                        onClick={() => setSettings({ ...settings, theme: { ...settings.theme, backgroundType: type as any } })}
                        className={`p-4 rounded-xl border capitalize transition-all ${settings.theme.backgroundType === type ? 'bg-zinc-800 border-zinc-500' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-6 p-6 bg-zinc-950 border border-zinc-800 rounded-2xl">
                  <label className="block text-sm font-bold mb-4">Tải lên hình nền</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer bg-zinc-800 hover:bg-zinc-700 border-2 border-dashed border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center gap-2 transition-all">
                      <Upload size={32} className="text-zinc-500" />
                      <span className="text-sm text-zinc-400">Nhấn để tải lên JPG, PNG hoặc MP4</span>
                      <input 
                        type="file" 
                        accept="image/*,video/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append('file', file);
                          const res = await fetch('/api/upload', { method: 'POST', body: formData });
                          const data = await res.json();
                          if (data.url) {
                            const type = file.type.startsWith('video') ? 'video' : 'image';
                            setSettings({ 
                              ...settings, 
                              theme: { 
                                ...settings.theme, 
                                backgroundMedia: data.url,
                                backgroundType: type
                              } 
                            });
                          }
                        }} 
                      />
                    </label>
                    {settings.theme.backgroundMedia && (
                      <div className="w-32 h-32 rounded-xl overflow-hidden border border-zinc-700 bg-black">
                        {settings.theme.backgroundType === 'video' ? (
                          <video src={settings.theme.backgroundMedia} className="w-full h-full object-cover" />
                        ) : (
                          <img src={settings.theme.backgroundMedia} className="w-full h-full object-cover" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs text-zinc-500 mb-1">Hoặc nhập URL</label>
                    <input 
                      type="text" 
                      value={settings.theme.backgroundMedia || ''}
                      onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, backgroundMedia: e.target.value } })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold mb-4">Màu sắc chủ đạo</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Màu chính (Nút, Confetti)</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={settings.theme.primaryColor || '#ff0000'}
                        onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, primaryColor: e.target.value } })}
                        className="h-10 w-10 rounded bg-transparent border-none"
                      />
                      <input 
                        type="text" 
                        value={settings.theme.primaryColor || '#ff0000'}
                        onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, primaryColor: e.target.value } })}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Màu tên sự kiện</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={settings.theme.eventNameColor || '#ffffff'}
                        onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, eventNameColor: e.target.value } })}
                        className="h-10 w-10 rounded bg-transparent border-none"
                      />
                      <input 
                        type="text" 
                        value={settings.theme.eventNameColor || '#ffffff'}
                        onChange={(e) => setSettings({ ...settings, theme: { ...settings.theme, eventNameColor: e.target.value } })}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 text-white"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold mb-4">Logo thương hiệu</h3>
                <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-6">
                  <div className="flex items-center gap-6">
                    <label className="flex-1 cursor-pointer bg-zinc-800 hover:bg-zinc-700 border-2 border-dashed border-zinc-700 rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-all">
                      <Upload size={24} className="text-zinc-500" />
                      <span className="text-xs text-zinc-400">Tải lên Logo (PNG, JPG)</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append('file', file);
                          const res = await fetch('/api/upload', { method: 'POST', body: formData });
                          const data = await res.json();
                          if (data.url) {
                            setSettings({ 
                              ...settings, 
                              logo: { 
                                url: data.url,
                                position: settings.logo?.position || 'left',
                                size: settings.logo?.size || 120
                              } 
                            });
                          }
                        }} 
                      />
                    </label>
                    {settings.logo?.url && (
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900 flex items-center justify-center p-2">
                          <img src={settings.logo.url} className="max-w-full max-h-full object-contain" />
                        </div>
                        <button 
                          onClick={() => setSettings({ ...settings, logo: { ...settings.logo!, url: undefined } })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs text-zinc-500 mb-2">Vị trí hiển thị</label>
                      <div className="flex gap-2">
                        {['Trái', 'Phải'].map((label, idx) => {
                          const pos = ['left', 'right'][idx] as 'left' | 'right';
                          return (
                            <button 
                              key={pos}
                              onClick={() => setSettings({ 
                                ...settings, 
                                logo: { 
                                  ...(settings.logo || { size: 120 }), 
                                  position: pos 
                                } 
                              })}
                              className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all ${settings.logo?.position === pos ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 mb-2">Kích thước (px)</label>
                      <input 
                        type="range"
                        min="40"
                        max="300"
                        value={settings.logo?.size || 120}
                        onChange={(e) => setSettings({ 
                          ...settings, 
                          logo: { 
                            ...(settings.logo || { position: 'left' }), 
                            size: parseInt(e.target.value) 
                          } 
                        })}
                        className="w-full accent-zinc-500"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                        <span>40px</span>
                        <span>{settings.logo?.size || 120}px</span>
                        <span>300px</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'sounds' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-black uppercase italic mb-8">Cài đặt âm thanh</h3>
              
              <div className="grid gap-8">
                {[
                  { key: 'background', label: 'Nhạc nền (Loop)', icon: <Volume2 size={24} /> },
                  { key: 'spinning', label: 'Hiệu ứng quay số', icon: <RotateCcw size={24} /> },
                  { key: 'winner', label: 'Hiệu ứng trúng giải', icon: <Trophy size={24} /> }
                ].map((sound) => (
                  <section key={sound.key} className="bg-zinc-950 p-8 rounded-[32px] border border-zinc-800">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-400">
                        {sound.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{sound.label}</h4>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest">Định dạng hỗ trợ: MP3, WAV, OGG</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <input 
                          type="text" 
                          value={(settings.sounds as any)[sound.key] || ''}
                          onChange={(e) => setSettings({ 
                            ...settings, 
                            sounds: { ...settings.sounds, [sound.key]: e.target.value } 
                          })}
                          placeholder="URL âm thanh..."
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white outline-none focus:border-zinc-500 transition-all"
                        />
                        <label className="cursor-pointer bg-white text-black px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-yellow-400 transition-all flex items-center gap-2">
                          <Upload size={18} /> Tải lên
                          <input 
                            type="file" 
                            accept="audio/*" 
                            className="hidden" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append('file', file);
                              const res = await fetch('/api/upload', { method: 'POST', body: formData });
                              const data = await res.json();
                              if (data.url) {
                                setSettings({ 
                                  ...settings, 
                                  sounds: { ...settings.sounds, [sound.key]: data.url } 
                                });
                              }
                            }} 
                          />
                        </label>
                      </div>
                      
                      {(settings.sounds as any)[sound.key] && (
                        <div className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                          <audio controls className="h-8 flex-1" src={(settings.sounds as any)[sound.key]} />
                          <button 
                            onClick={() => setSettings({ 
                              ...settings, 
                              sounds: { ...settings.sounds, [sound.key]: '' } 
                            })}
                            className="text-red-400 hover:text-red-300 p-2"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md p-8 rounded-3xl shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Bạn có chắc chắn?</h4>
            <p className="text-zinc-400 mb-8">{confirmAction.message}</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={() => {
                  confirmAction.onConfirm();
                  setConfirmAction(null);
                }}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-600/20"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
