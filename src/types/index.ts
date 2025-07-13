export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  category: 'live' | 'movies' | 'series';
  group?: string;
  isFavorite?: boolean;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isFullscreen: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  currentChannel: Channel | null;
  channels: Channel[];
  activeCategory: 'live' | 'movies' | 'series';
  showAddChannel: boolean;
  showSettings: boolean;
}