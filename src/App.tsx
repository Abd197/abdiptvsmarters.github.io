import React, { useState, useEffect } from 'react';
import { Tv, Search, Calendar, User, Video, Settings, Bell, Download, Upload, Play, Film, MonitorPlay, Plus, Grid3X3, Eye } from 'lucide-react';
import VideoPlayer from './components/VideoPlayer';
import ChannelList from './components/ChannelList';
import AddChannelModal from './components/AddChannelModal';
import SettingsModal from './components/SettingsModal';
import PlaylistLoaderModal from './components/PlaylistLoaderModal';
import { Channel, AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentChannel: null,
    channels: [],
    activeCategory: 'live',
    showAddChannel: false,
    showSettings: false,
  });
  const [showPlaylistLoader, setShowPlaylistLoader] = useState(false);
  const [showChannelList, setShowChannelList] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load channels from localStorage on mount
  useEffect(() => {
    const savedChannels = localStorage.getItem('iptv-channels');
    if (savedChannels) {
      try {
        const channels = JSON.parse(savedChannels);
        setAppState(prev => ({ ...prev, channels }));
      } catch (error) {
        console.error('Failed to load saved channels:', error);
      }
    }

    // Add some sample channels for demo
    const sampleChannels: Channel[] = [
      {
        id: '1',
        name: 'Sample Live Stream',
        url: 'https://demo-live.dacast.com/30a0155c75d7468a8b0dc3071d1b2ad7/index.m3u8',
        category: 'live',
        group: 'Demo',
        isFavorite: false,
      },
      {
        id: '2',
        name: 'Big Buck Bunny',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        category: 'movies',
        group: 'Demo',
        isFavorite: false,
      },
    ];

    setAppState(prev => ({ 
      ...prev, 
      channels: savedChannels ? JSON.parse(savedChannels) : sampleChannels 
    }));
  }, []);

  // Save channels to localStorage whenever channels change
  useEffect(() => {
    localStorage.setItem('iptv-channels', JSON.stringify(appState.channels));
  }, [appState.channels]);

  const handleChannelSelect = (channel: Channel) => {
    setAppState(prev => ({ ...prev, currentChannel: channel }));
    setError(null);
    setShowChannelList(false);
  };

  const handleAddChannel = (newChannel: Omit<Channel, 'id'>) => {
    const channel: Channel = {
      ...newChannel,
      id: Date.now().toString(),
    };
    setAppState(prev => ({
      ...prev,
      channels: [...prev.channels, channel],
    }));
  };

  const handleAddChannels = (newChannels: Omit<Channel, 'id'>[]) => {
    const channels: Channel[] = newChannels.map((channel, index) => ({
      ...channel,
      id: (Date.now() + index).toString(),
    }));
    setAppState(prev => ({
      ...prev,
      channels: [...prev.channels, ...channels],
    }));
  };

  const handleToggleFavorite = (channelId: string) => {
    setAppState(prev => ({
      ...prev,
      channels: prev.channels.map(channel =>
        channel.id === channelId
          ? { ...channel, isFavorite: !channel.isFavorite }
          : channel
      ),
    }));
  };

  const handleDeleteChannel = (channelId: string) => {
    setAppState(prev => ({
      ...prev,
      channels: prev.channels.filter(channel => channel.id !== channelId),
      currentChannel: prev.currentChannel?.id === channelId ? null : prev.currentChannel,
    }));
  };

  const handleImportChannels = (importedChannels: Channel[]) => {
    setAppState(prev => ({
      ...prev,
      channels: [...prev.channels, ...importedChannels],
    }));
  };

  const handleClearAllChannels = () => {
    setAppState(prev => ({
      ...prev,
      channels: [],
      currentChannel: null,
    }));
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  };

  const getCategoryStats = (category: 'live' | 'movies' | 'series') => {
    const count = appState.channels.filter(ch => ch.category === category).length;
    const lastUpdated = '1 sec ago'; // You can implement real last updated logic
    return { count, lastUpdated };
  };

  if (appState.currentChannel) {
    return (
      <div className="h-screen bg-gray-900 flex flex-col">
        {/* Video Player Header */}
        <header className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAppState(prev => ({ ...prev, currentChannel: null }))}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Tv className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">{appState.currentChannel.name}</h1>
                <p className="text-gray-400 text-sm">{appState.currentChannel.category.toUpperCase()}</p>
              </div>
            </div>
            <button
              onClick={() => setShowChannelList(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Grid3X3 size={16} />
              Channels
            </button>
          </div>
        </header>

        {/* Video Player */}
        <VideoPlayer
          channel={appState.currentChannel}
          onError={handleError}
        />

        {/* Channel List Overlay */}
        {showChannelList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Select Channel</h2>
                <button
                  onClick={() => setShowChannelList(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ChannelList
                  channels={appState.channels}
                  currentChannel={appState.currentChannel}
                  category={appState.activeCategory}
                  onChannelSelect={handleChannelSelect}
                  onToggleFavorite={handleToggleFavorite}
                  onDeleteChannel={handleDeleteChannel}
                />
              </div>
            </div>
          </div>
        )}

        {/* Error Toast */}
        {error && (
          <div className="absolute top-20 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
            <p className="font-medium">Playback Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black bg-opacity-30 backdrop-blur-sm border-b border-white border-opacity-10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Tv className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">IPTV SMARTERS</h1>
              <p className="text-gray-300 text-sm">04:06 PM June 30,2021</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Master Search"
                className="bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-gray-300 pl-10 pr-4 py-2 rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="text-white hover:text-blue-400 transition-colors">
                <Calendar size={20} />
              </button>
              <button className="text-white hover:text-blue-400 transition-colors">
                <User size={20} />
              </button>
              <button className="text-white hover:text-blue-400 transition-colors">
                <Video size={20} />
              </button>
              <button 
                onClick={() => setAppState(prev => ({ ...prev, showSettings: true }))}
                className="text-white hover:text-blue-400 transition-colors"
              >
                <Settings size={20} />
              </button>
              <button className="text-white hover:text-blue-400 transition-colors">
                <Bell size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8">
        {/* Main Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Live TV Card */}
          <div 
            className="relative bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-2xl"
            onClick={() => {
              setAppState(prev => ({ ...prev, activeCategory: 'live' }));
              const liveChannels = appState.channels.filter(ch => ch.category === 'live');
              if (liveChannels.length > 0) {
                handleChannelSelect(liveChannels[0]);
              } else {
                setShowChannelList(true);
              }
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                <Tv className="text-white" size={32} />
              </div>
              <div className="text-right">
                <p className="text-white text-sm opacity-80">Last updated: {getCategoryStats('live').lastUpdated}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Eye className="text-white" size={16} />
                  <span className="text-white font-bold">{getCategoryStats('live').count}</span>
                </div>
              </div>
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">LIVE TV</h2>
            <p className="text-white opacity-80">Watch live television channels</p>
          </div>

          {/* Movies Card */}
          <div 
            className="relative bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-2xl"
            onClick={() => {
              setAppState(prev => ({ ...prev, activeCategory: 'movies' }));
              const movieChannels = appState.channels.filter(ch => ch.category === 'movies');
              if (movieChannels.length > 0) {
                handleChannelSelect(movieChannels[0]);
              } else {
                setShowChannelList(true);
              }
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                <Film className="text-white" size={32} />
              </div>
              <div className="text-right">
                <p className="text-white text-sm opacity-80">Last updated: {getCategoryStats('movies').lastUpdated}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Eye className="text-white" size={16} />
                  <span className="text-white font-bold">{getCategoryStats('movies').count}</span>
                </div>
              </div>
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">MOVIES</h2>
            <p className="text-white opacity-80">Stream your favorite movies</p>
          </div>

          {/* Series Card */}
          <div 
            className="relative bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-2xl"
            onClick={() => {
              setAppState(prev => ({ ...prev, activeCategory: 'series' }));
              const seriesChannels = appState.channels.filter(ch => ch.category === 'series');
              if (seriesChannels.length > 0) {
                handleChannelSelect(seriesChannels[0]);
              } else {
                setShowChannelList(true);
              }
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                <MonitorPlay className="text-white" size={32} />
              </div>
              <div className="text-right">
                <p className="text-white text-sm opacity-80">Last updated: {getCategoryStats('series').lastUpdated}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Eye className="text-white" size={16} />
                  <span className="text-white font-bold">{getCategoryStats('series').count}</span>
                </div>
              </div>
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">SERIES</h2>
            <p className="text-white opacity-80">Binge-watch TV series</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setShowPlaylistLoader(true)}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white font-medium hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <Download className="mx-auto mb-2" size={24} />
            LOAD M3U
          </button>
          
          <button
            onClick={() => setAppState(prev => ({ ...prev, showAddChannel: true }))}
            className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 text-white font-medium hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <Plus className="mx-auto mb-2" size={24} />
            ADD CHANNEL
          </button>
          
          <button
            onClick={() => setShowChannelList(true)}
            className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 text-white font-medium hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <Grid3X3 className="mx-auto mb-2" size={24} />
            MULTI-SCREEN
          </button>
          
          <button
            onClick={() => setAppState(prev => ({ ...prev, showSettings: true }))}
            className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl p-4 text-white font-medium hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <Eye className="mx-auto mb-2" size={24} />
            CATCH UP
          </button>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-white">
          <div>
            <p className="text-sm opacity-80">Expiration: Unlimited</p>
          </div>
          <div className="text-center">
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors">
              Buy Premium Version
            </button>
          </div>
          <div>
            <p className="text-sm opacity-80">Logged in: demo</p>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddChannelModal
        isOpen={appState.showAddChannel}
        onClose={() => setAppState(prev => ({ ...prev, showAddChannel: false }))}
        onAddChannel={handleAddChannel}
      />

      <SettingsModal
        isOpen={appState.showSettings}
        onClose={() => setAppState(prev => ({ ...prev, showSettings: false }))}
        channels={appState.channels}
        onImportChannels={handleImportChannels}
        onClearAllChannels={handleClearAllChannels}
      />

      <PlaylistLoaderModal
        isOpen={showPlaylistLoader}
        onClose={() => setShowPlaylistLoader(false)}
        onAddChannels={handleAddChannels}
      />

      {/* Channel List Modal */}
      {showChannelList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">All Channels</h2>
              <button
                onClick={() => setShowChannelList(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-2 mb-4">
              {(['live', 'movies', 'series'] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => setAppState(prev => ({ ...prev, activeCategory: category }))}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    appState.activeCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <ChannelList
                channels={appState.channels}
                currentChannel={appState.currentChannel}
                category={appState.activeCategory}
                onChannelSelect={handleChannelSelect}
                onToggleFavorite={handleToggleFavorite}
                onDeleteChannel={handleDeleteChannel}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed top-20 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <p className="font-medium">Playback Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}
    </div>
  );
};

export default App;