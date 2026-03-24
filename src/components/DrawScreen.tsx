import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Howl } from 'howler';
import { Participant, Prize, AppSettings } from '../types';
import { Trophy, Play, Square, RotateCcw, Trash2, X } from 'lucide-react';

interface DrawScreenProps {
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  participants: Participant[];
  prizes: Prize[];
  winners: Record<string, Participant[]>;
  onWinnersFound: (prizeId: string, newWinners: Participant[]) => void;
  onResetWinners: () => void;
  onRemoveWinner: (prizeId: string, participantId: string) => void;
}

export const DrawScreen: React.FC<DrawScreenProps> = ({
  settings,
  onUpdateSettings,
  participants,
  prizes,
  winners,
  onWinnersFound,
  onResetWinners,
  onRemoveWinner
}) => {
  const [currentPrizeIdx, setCurrentPrizeIdx] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayParticipants, setDisplayParticipants] = useState<Participant[]>([]);
  const [lastWinners, setLastWinners] = useState<Participant[]>([]);
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const workerRef = useRef<Worker | null>(null);
  const soundsRef = useRef<{
    background?: Howl;
    spinning?: Howl;
    winner?: Howl;
  }>({});

  const currentPrize = prizes[currentPrizeIdx];
  const prizeWinners = currentPrize ? (winners[currentPrize.id] || []) : [];
  const remainingCount = currentPrize ? currentPrize.count - prizeWinners.length : 0;

  // Initialize Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('../worker.ts', import.meta.url));
    
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'SHUFFLE_COMPLETE') {
        const shuffled = e.data.data;
        // Take the first one as winner (default behavior if startSpin not called yet)
        const countToDraw = settings.drawCount || 1;
        finalizeWinners(shuffled.slice(0, countToDraw));
      }
    };

    return () => workerRef.current?.terminate();
  }, []);

  // Initialize Sounds
  useEffect(() => {
    if (settings.sounds.background) {
      soundsRef.current.background = new Howl({ 
        src: [settings.sounds.background], 
        loop: true, 
        volume: 0.5,
        html5: true // Better for long files
      });
      soundsRef.current.background.play();
    }
    
    if (settings.sounds.spinning) {
      soundsRef.current.spinning = new Howl({ 
        src: [settings.sounds.spinning], 
        loop: true, 
        volume: 0.7 
      });
    }
    
    if (settings.sounds.winner) {
      soundsRef.current.winner = new Howl({ 
        src: [settings.sounds.winner], 
        volume: 1.0 
      });
    }

    return () => {
      soundsRef.current.background?.stop();
      soundsRef.current.spinning?.stop();
      soundsRef.current.winner?.stop();
    };
  }, [settings.sounds.background, settings.sounds.spinning, settings.sounds.winner]);

  const startSpin = () => {
    if (!currentPrize || remainingCount <= 0 || isSpinning) return;
    
    setIsSpinning(true);
    setLastWinners([]);
    
    // Play spinning sound
    soundsRef.current.spinning?.play();
    
    // Filter out previous winners
    const allWinnersIds = new Set(Object.values(winners).flat().map((w: Participant) => w.id));
    const available = participants.filter(p => !allWinnersIds.has(p.id));
    
    if (available.length === 0) {
      alert("Không còn người tham gia nào khả dụng!");
      setIsSpinning(false);
      return;
    }

    const countToDraw = Math.min(settings.drawCount, remainingCount, available.length);

    // Start visual shuffle
    const interval = setInterval(() => {
      const randoms = Array.from({ length: 5 }, () => available[Math.floor(Math.random() * available.length)]);
      setDisplayParticipants(randoms);
    }, 80);

    // After 3 seconds, ask worker for final shuffle
    setTimeout(() => {
      clearInterval(interval);
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'SHUFFLE', data: available });
      } else {
        // Fallback if worker fails
        const shuffled = [...available].sort(() => Math.random() - 0.5);
        finalizeWinners(shuffled.slice(0, countToDraw));
      }
    }, 3000);

    // Update worker message handler to handle multiple winners
    if (workerRef.current) {
      workerRef.current.onmessage = (e) => {
        if (e.data.type === 'SHUFFLE_COMPLETE') {
          const shuffled = e.data.data;
          finalizeWinners(shuffled.slice(0, countToDraw));
        }
      };
    }
  };

  const finalizeWinners = (newWinners: Participant[]) => {
    setIsSpinning(false);
    setLastWinners(newWinners);
    onWinnersFound(currentPrize.id, newWinners);
    
    // Stop spinning sound and play winner sound
    soundsRef.current.spinning?.stop();
    soundsRef.current.winner?.play();
    
    // Visual effects - Festive confetti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const colors = [settings.theme.primaryColor, '#ffffff', '#ffd700', '#ff0000', '#00ff00', '#0000ff'];

    const frame = () => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) return;

      const particleCount = 2;
      
      // Cannon from left
      confetti({
        particleCount,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: colors,
        zIndex: 100
      });
      
      // Cannon from right
      confetti({
        particleCount,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: colors,
        zIndex: 100
      });

      requestAnimationFrame(frame);
    };

    frame();

    // Initial big burst
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
      colors: colors,
      zIndex: 100
    });

    if (settings.sounds.winner) {
      new Howl({ src: [settings.sounds.winner] }).play();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-white font-sans overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        {settings.theme.backgroundType === 'color' && (
          <div className="w-full h-full" style={{ backgroundColor: settings.theme.backgroundColor }} />
        )}
        {settings.theme.backgroundType === 'image' && settings.theme.backgroundMedia && (
          <img 
            src={settings.theme.backgroundMedia} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
            alt="bg"
          />
        )}
        {settings.theme.backgroundType === 'video' && settings.theme.backgroundMedia && (
          <video 
            src={settings.theme.backgroundMedia} 
            autoPlay 
            loop 
            muted 
            className="w-full h-full object-cover" 
          />
        )}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-20 px-10">
        {/* Brand Logo */}
        {settings.logo?.url && (
          <div 
            className={`absolute top-10 ${settings.logo.position === 'left' ? 'left-10' : 'right-10'} z-20`}
            style={{ width: settings.logo.size }}
          >
            <img 
              src={settings.logo.url} 
              alt="Brand Logo" 
              className="w-full h-auto object-contain drop-shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Header: Prize Info */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h2 
            className="font-black tracking-[0.2em] uppercase mb-8 drop-shadow-2xl"
            style={{ color: settings.theme.eventNameColor, fontSize: settings.eventNameSize }}
          >
            {settings.eventName}
          </h2>
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 mb-4">
            <Trophy size={20} className="text-yellow-400" />
            <span className="text-sm font-bold tracking-widest uppercase">Giải thưởng hiện tại</span>
          </div>
          <div className="flex flex-col items-center gap-6">
            {currentPrize?.image && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-48 h-48 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl bg-black/20 backdrop-blur-sm p-4"
              >
                <img 
                  src={currentPrize.image} 
                  alt={currentPrize.name} 
                  className="w-full h-full object-contain drop-shadow-xl"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            )}
            <div className="text-center">
              <h1 
                className="font-black tracking-tighter mb-2 drop-shadow-2xl"
                style={{ fontSize: settings.prizeNameSize }}
              >
                {currentPrize?.name || 'Chưa chọn giải thưởng'}
              </h1>
              <p className="text-xl text-white/60 font-medium">
                Còn lại: <span className="text-white">{remainingCount}</span> / {currentPrize?.count}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main: Draw Area */}
        <div className="flex-1 flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            {isSpinning ? (
              <motion.div 
                key="spinning"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                className="flex flex-col gap-4 items-center"
              >
                {displayParticipants.map((p, i) => (
                  <motion.div 
                    key={`${p.id}-${i}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 - i * 0.2 }}
                    className="text-4xl font-bold text-white/80"
                  >
                    {p.name}
                  </motion.div>
                ))}
              </motion.div>
            ) : lastWinners.length > 0 ? (
              <motion.div 
                key="winner"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`w-full mx-auto ${settings.winnerCardWidth} ${settings.winnerCardWidth === 'max-w-full' ? 'px-2' : 'px-4'}`}
              >
                <div 
                  className={`grid gap-4 ${settings.winnerLayout === 'list' ? 'flex flex-col' : ''}`}
                  style={{ 
                    gridTemplateColumns: settings.winnerLayout === 'list' 
                      ? '1fr' 
                      : `repeat(${lastWinners.length === 1 ? 1 : settings.winnerGridCols}, minmax(0, 1fr))` 
                  }}
                >
                  {lastWinners.map((winner, idx) => (
                    <motion.div 
                      key={winner.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`bg-white text-black rounded-2xl shadow-2xl border-2 border-yellow-400 flex items-center justify-between text-left overflow-hidden transition-all ${
                        settings.winnerLayout === 'list' 
                        ? 'p-4 py-6 w-full' 
                        : `flex-col text-center ${
                            lastWinners.length === 1 ? 'p-12 py-16' : 
                            lastWinners.length <= 5 ? 'p-8 py-10' : 
                            lastWinners.length <= 10 ? 'p-6 py-8' : 'p-4 py-6'
                          }`
                      }`}
                    >
                      {settings.winnerLayout === 'list' ? (
                        <>
                          <div className="flex items-center gap-6 flex-1">
                            <span className="text-zinc-300 font-black text-2xl italic">#{idx + 1}</span>
                            <div className="flex flex-col">
                              <div className="font-black text-4xl tracking-tighter leading-tight">
                                {winner.name}
                              </div>
                              <div className="font-mono font-bold text-zinc-400 text-lg">
                                {winner.id}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-zinc-500 text-xl">
                              {winner.department}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <h2 className={`font-bold text-zinc-400 uppercase tracking-widest ${
                            lastWinners.length <= 5 ? 'text-sm mb-2' : 'text-[10px] mb-1'
                          }`}>
                            {lastWinners.length === 1 ? 'Người trúng giải' : `#${idx + 1}`}
                          </h2>
                          <div className={`font-black tracking-tighter leading-tight ${
                            lastWinners.length === 1 ? 'text-7xl' :
                            lastWinners.length <= 5 ? 'text-5xl' :
                            lastWinners.length <= 10 ? 'text-3xl' : 'text-xl'
                          }`}>
                            {winner.name}
                          </div>
                          <div className={`font-mono font-bold text-zinc-400 ${
                            lastWinners.length === 1 ? 'text-2xl mt-2' :
                            lastWinners.length <= 5 ? 'text-xl mt-1' : 'text-sm mt-0.5'
                          }`}>
                            {winner.id}
                          </div>
                          <div className={`font-medium text-zinc-500 truncate w-full px-2 ${
                            lastWinners.length === 1 ? 'text-xl mt-3' :
                            lastWinners.length <= 5 ? 'text-lg mt-2' : 'text-xs mt-1'
                          }`}>
                            {winner.department}
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/20 text-9xl font-black italic uppercase tracking-tighter select-none"
              >
                {settings.readyText || 'Sẵn sàng quay số'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer: Controls & Winners List */}
        <div className="w-full flex flex-col gap-10">
          <div className="grid grid-cols-3 items-end w-full">
            {/* Left: Reset Button */}
            <div className="flex gap-6">
              <div className="relative">
                <button 
                  onClick={() => setShowResetConfirm(!showResetConfirm)}
                  className={`backdrop-blur-md border p-10 rounded-[40px] transition-all shadow-xl ${
                    showResetConfirm 
                    ? 'bg-red-600 border-red-400 text-white scale-110' 
                    : 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/40'
                  }`}
                  title="Reset toàn bộ"
                >
                  <Trash2 size={48} />
                </button>

                <AnimatePresence>
                  {showResetConfirm && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.8 }}
                      className="absolute bottom-full mb-4 left-0 bg-zinc-900 border border-white/10 p-6 rounded-3xl shadow-2xl w-64 z-[100]"
                    >
                      <p className="text-white text-sm font-bold mb-4">Xác nhận xóa toàn bộ kết quả?</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            onResetWinners();
                            setLastWinners([]);
                            setShowResetConfirm(false);
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-xl text-xs font-bold"
                        >
                          XÓA HẾT
                        </button>
                        <button 
                          onClick={() => setShowResetConfirm(false)}
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl text-xs font-bold"
                        >
                          HỦY
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Center: Start Spin Button & Prize Selector */}
            <div className="flex flex-col items-center gap-4">
              <button 
                onClick={startSpin}
                disabled={isSpinning || remainingCount <= 0}
                className="group relative flex items-center gap-6 bg-white text-black px-14 py-10 rounded-[40px] font-black text-4xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              >
                {isSpinning ? <Square fill="black" size={40} /> : <Play fill="black" size={40} />}
                {isSpinning ? 'ĐANG QUAY...' : 'BẮT ĐẦU QUAY'}
              </button>

              <div className="relative">
                <select 
                  value={currentPrizeIdx ?? 0}
                  onChange={(e) => {
                    setCurrentPrizeIdx(parseInt(e.target.value));
                    setLastWinners([]);
                  }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl hover:bg-white/20 transition-all shadow-xl text-white font-bold text-lg appearance-none pr-12 cursor-pointer outline-none"
                  title="Chọn giải thưởng"
                >
                  {prizes.map((prize, idx) => (
                    <option key={prize.id} value={idx} className="bg-zinc-900 text-white">
                      {prize.name} ({winners[prize.id]?.length || 0}/{prize.count})
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                  <RotateCcw size={18} />
                </div>
              </div>
            </div>

            {/* Right: Winners List */}
            <div className="flex justify-end">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-80 max-h-64 overflow-y-auto shadow-2xl">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Danh sách trúng giải</h3>
                <div className="space-y-3">
                  {prizeWinners.length === 0 && <div className="text-sm text-white/20 italic">Chưa có người trúng giải</div>}
                  {prizeWinners.map((w, i) => (
                    <div key={w.id} className="group flex items-center justify-between text-sm hover:bg-white/5 p-1 rounded-lg transition-colors">
                      <div className="flex flex-col">
                        <span className="font-bold">{w.name}</span>
                        <span className="text-[10px] text-white/40 font-mono">{w.id}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white/40 font-mono text-xs">#{prizeWinners.length - i}</span>
                        <button 
                          onClick={() => onRemoveWinner(currentPrize.id, w.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 p-1 transition-all"
                          title="Xóa người này"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Draw Count Selector - Absolutely positioned at bottom right */}
      <div className="absolute bottom-6 right-6 z-30">
        <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full p-1.5 flex items-center gap-3 shadow-2xl">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 ml-4">Số người / lần:</span>
          <div className="flex gap-1.5 pr-1">
            {[1, 10, 20, 30, 50].map(num => (
              <button
                key={num}
                onClick={() => {
                  onUpdateSettings({ ...settings, drawCount: num });
                }}
                className={`px-4 py-1 rounded-full text-[11px] font-black transition-all duration-300 ${
                  settings.drawCount === num 
                    ? 'bg-white text-black scale-105 shadow-lg' 
                    : 'bg-white/5 text-white/20 hover:bg-white/10 hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
