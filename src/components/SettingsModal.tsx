import React, { useState } from 'react';
import { X, Download, Upload, Trash2 } from 'lucide-react';
import { Channel } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  onImportChannels: (channels: Channel[]) => void;
  onClearAllChannels: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  channels,
  onImportChannels,
  onClearAllChannels,
}) => {
  const [directUrl, setDirectUrl] = useState('');

  const exportChannels = () => {
    const dataStr = JSON.stringify(channels, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'iptv-channels.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importChannels = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedChannels = JSON.parse(e.target?.result as string);
        onImportChannels(importedChannels);
      } catch (error) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const playDirectUrl = () => {
    if (directUrl) {
      const tempChannel: Channel = {
        id: 'temp-' + Date.now(),
        name: 'Direct Stream',
        url: directUrl,
        category: 'live',
      };
      
      // You could emit this to parent or handle it differently
      console.log('Playing direct URL:', tempChannel);
      setDirectUrl('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Direct URL Player */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Play Direct URL</h3>
            <div className="space-y-2">
              <input
                type="url"
                value={directUrl}
                onChange={(e) => setDirectUrl(e.target.value)}
                placeholder="Enter stream URL (m3u8, mp4, etc.)"
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                onClick={playDirectUrl}
                disabled={!directUrl}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Play Stream
              </button>
            </div>
          </div>

          {/* Channel Management */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Channel Management</h3>
            <div className="space-y-2">
              <button
                onClick={exportChannels}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Export Channels
              </button>

              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={importChannels}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Upload size={16} />
                  Import Channels
                </button>
              </div>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all channels?')) {
                    onClearAllChannels();
                    onClose();
                  }
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Clear All Channels
              </button>
            </div>
          </div>

          {/* Stats */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Statistics</h3>
            <div className="bg-gray-700 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Total Channels:</span>
                <span className="text-white">{channels.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Live TV:</span>
                <span className="text-white">{channels.filter(c => c.category === 'live').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Movies:</span>
                <span className="text-white">{channels.filter(c => c.category === 'movies').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Series:</span>
                <span className="text-white">{channels.filter(c => c.category === 'series').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;