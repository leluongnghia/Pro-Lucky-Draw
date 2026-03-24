export interface Participant {
  id: string;
  name: string;
  department?: string;
  phone?: string;
}

export interface Prize {
  id: string;
  name: string;
  count: number;
  image?: string;
}

export interface AppSettings {
  resolution: {
    width: number;
    height: number;
  };
  padding: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  theme: {
    primaryColor: string;
    backgroundColor: string;
    eventNameColor: string;
    backgroundMedia?: string;
    backgroundType: 'image' | 'video' | 'color';
  };
  sounds: {
    background?: string;
    spinning?: string;
    winner?: string;
  };
  logo?: {
    url?: string;
    position: 'left' | 'right';
    size: number;
  };
  drawCount: number;
  eventName: string;
  eventNameSize: number;
  prizeNameSize: number;
  winnerGridCols: number;
  winnerCardWidth: string; // e.g., 'max-w-6xl' or 'max-w-full'
  winnerLayout: 'grid' | 'list';
  readyText?: string;
}

export interface DrawState {
  participants: Participant[];
  prizes: Prize[];
  winners: Record<string, Participant[]>; // prizeId -> winners
  currentPrizeId: string | null;
}
