/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LEDWrapper } from './components/LEDWrapper';
import { SettingsPanel } from './components/SettingsPanel';
import { DrawScreen } from './components/DrawScreen';
import { LandingPage } from './components/LandingPage';
import { Participant, Prize, AppSettings } from './types';
import { Settings as SettingsIcon, LogOut } from 'lucide-react';
import { DEFAULT_PRIZES } from './constants';

const DEFAULT_SETTINGS: AppSettings = {
  resolution: { width: 1920, height: 1080 },
  padding: { top: 40, bottom: 40, left: 40, right: 40 },
  theme: {
    primaryColor: '#ffffff',
    backgroundColor: '#000000',
    eventNameColor: '#ffffff',
    backgroundType: 'color',
  },
  sounds: {
    background: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    winner: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg'
  },
  drawCount: 1,
  eventName: 'SỰ KIỆN MAY MẮN 2024',
  eventNameSize: 48,
  prizeNameSize: 72,
  winnerGridCols: 5,
  winnerCardWidth: 'max-w-6xl',
  winnerLayout: 'grid',
  readyText: 'SẴN SÀNG QUAY SỐ'
};

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [winners, setWinners] = useState<Record<string, Participant[]>>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Initial Auth Check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setShowLanding(false);
          await loadUserData();
        }
      } catch (err) {
        console.error('Auth check failed');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const loadUserData = async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        if (data.settings && Object.keys(data.settings).length > 0) {
          setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
        }
        if (data.participants) setParticipants(data.participants);
        if (data.winners) setWinners(data.winners);
      }
    } catch (err) {
      console.error('Failed to load data');
    }
  };

  const saveData = useCallback(async (s: AppSettings, p: Participant[], w: Record<string, Participant[]>) => {
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: s, participants: p, winners: w })
      });
    } catch (err) {
      console.error('Failed to save data');
    }
  }, []);

  // Sync data when changes occur
  useEffect(() => {
    if (user && !isLoading && !showLanding) {
      const timer = setTimeout(() => {
        saveData(settings, participants, winners);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [settings, participants, winners, user, isLoading, showLanding, saveData]);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setShowLanding(false);
    loadUserData();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setShowLanding(true);
    setSettings(DEFAULT_SETTINGS);
    setParticipants([]);
    setWinners({});
  };

  // Save Settings
  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  // Save Participants
  const updateParticipants = (newParticipants: Participant[]) => {
    setParticipants(newParticipants);
  };

  // Save Prizes
  const updatePrizes = (newPrizes: Prize[]) => {
    setPrizes(newPrizes);
  };

  const handleWinnersFound = (prizeId: string, newWinners: Participant[]) => {
    setWinners(prev => ({
      ...prev,
      [prizeId]: [...(prev[prizeId] || []), ...newWinners]
    }));
  };

  const handleResetWinners = () => {
    setWinners({});
  };

  const handleRemoveWinner = (prizeId: string, participantId: string) => {
    setWinners(prev => ({
      ...prev,
      [prizeId]: prev[prizeId].filter(w => w.id !== participantId)
    }));
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white font-black text-4xl italic uppercase tracking-tighter">
        Đang tải hệ thống...
      </div>
    );
  }

  if (showLanding) {
    return <LandingPage onEnterApp={() => setShowLanding(false)} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <LEDWrapper 
        targetWidth={settings.resolution.width} 
        targetHeight={settings.resolution.height}
        padding={settings.padding}
      >
        <DrawScreen 
          settings={settings}
          onUpdateSettings={updateSettings}
          participants={participants}
          prizes={prizes}
          winners={winners}
          onWinnersFound={handleWinnersFound}
          onResetWinners={handleResetWinners}
          onRemoveWinner={handleRemoveWinner}
        />
      </LEDWrapper>

      {/* Floating Controls (Admin only) */}
      <div className="fixed top-6 right-6 z-[100] flex gap-4">
        <button 
          onClick={handleLogout}
          className="p-4 bg-red-500/10 hover:bg-red-500/20 backdrop-blur-md border border-red-500/20 rounded-2xl text-red-400 transition-all opacity-20 hover:opacity-100 flex items-center gap-2"
          title="Đăng xuất"
        >
          <LogOut size={24} />
          <span className="font-bold text-sm">Đăng xuất</span>
        </button>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl text-white transition-all opacity-20 hover:opacity-100"
          title="Cài đặt"
        >
          <SettingsIcon size={24} />
        </button>
      </div>

      {isSettingsOpen && (
        <SettingsPanel 
          settings={settings}
          setSettings={updateSettings}
          participants={participants}
          setParticipants={updateParticipants}
          prizes={prizes}
          setPrizes={updatePrizes}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}

