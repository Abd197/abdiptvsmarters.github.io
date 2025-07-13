import React, { useState } from 'react';
import { X, Download, Upload, Link, AlertCircle } from 'lucide-react';
import { Channel } from '../types';

interface PlaylistLoaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChannels: (channels: Omit<Channel, 'id'>[]) => void;
}

const PlaylistLoaderModal: React.FC<PlaylistLoaderModalProps> = ({
  isOpen,
  onClose,
  onAddChannels,
}) => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewChannels, setPreviewChannels] = useState<Omit<Channel, 'id'>[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const parseM3UFile = (content: string): Omit<Channel, 'id'>[] => {
    const lines = content.split('\n');
    const channels: Omit<Channel, 'id'>[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#EXTINF:')) {
        const nextLine = lines[i + 1]?.trim();
        if (nextLine && (nextLine.startsWith('http') || nextLine.startsWith('rtmp'))) {
          const nameMatch = line.match(/,(.+)$/);
          const logoMatch = line.match(/tvg-logo="([^"]+)"/);
          const groupMatch = line.match(/group-title="([^"]+)"/);
          
          if (nameMatch) {
            let category: 'live' | 'movies' | 'series' = 'live';
            const groupTitle = groupMatch ? groupMatch[1].toLowerCase() : '';
            
            if (groupTitle.includes('movie') || groupTitle.includes('film')) {
              category = 'movies';
            } else if (groupTitle.includes('series') || groupTitle.includes('show')) {
              category = 'series';
            }
            
            channels.push({
              name: nameMatch[1].trim(),
              url: nextLine,
              logo: logoMatch ? logoMatch[1] : '',
              category,
              group: groupMatch ? groupMatch[1] : '',
              isFavorite: false,
            });
          }
        }
      }
    }
    
    return channels;
  };

  const loadPlaylistFromUrl = async () => {
    if (!playlistUrl) return;
    
    setIsLoading(true);
    try {
      // Handle CORS issues by trying different approaches
      let content = '';
      
      try {
        const response = await fetch(playlistUrl, {
          mode: 'cors',
          headers: {
            'Accept': 'application/x-mpegURL, application/vnd.apple.mpegurl, text/plain, */*',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        content = await response.text();
      } catch (corsError) {
        // If CORS fails, try with a proxy
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(playlistUrl)}`;
        const proxyResponse = await fetch(proxyUrl);
        const proxyData = await proxyResponse.json();
        content = proxyData.contents;
      }
      
      const channels = parseM3UFile(content);
      
      if (channels.length === 0) {
        throw new Error('No valid channels found in the playlist');
      }
      
      setPreviewChannels(channels);
      setShowPreview(true);
    } catch (error) {
      alert('Failed to load playlist: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const channels = parseM3UFile(content);
      
      if (channels.length === 0) {
        alert('No valid channels found in the file');
        return;
      }
      
      setPreviewChannels(channels);
      setShowPreview(true);
    };
    reader.readAsText(file);
  };

  const importChannels = () => {
    onAddChannels(previewChannels);
    setPreviewChannels([]);
    setShowPreview(false);
    setPlaylistUrl('');
    onClose();
  };

  const reset = () => {
    setPreviewChannels([]);
    setShowPreview(false);
    setPlaylistUrl('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Load M3U Playlist</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {!showPreview ? (
          <div className="space-y-6">
            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Link size={16} className="inline mr-2" />
                Load from URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="https://example.com/playlist.m3u"
                  className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  onClick={loadPlaylistFromUrl}
                  disabled={!playlistUrl || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Download size={16} />
                  )}
                  {isLoading ? 'Loading...' : 'Load'}
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Upload size={16} className="inline mr-2" />
                Upload M3U File
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".m3u,.m3u8,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-gray-600">
                  <Upload size={20} />
                  Choose M3U File or Drag & Drop
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-blue-300 font-medium mb-1">Supported Formats</p>
                  <ul className="text-blue-200 space-y-1">
                    <li>• M3U and M3U8 playlist files</li>
                    <li>• HTTP/HTTPS URLs to playlist files</li>
                    <li>• Supports channel logos, groups, and categories</li>
                    <li>• Auto-detects Movies and Series categories</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Preview Header */}
            <div className="bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 font-medium">
                    Found {previewChannels.length} channels
                  </p>
                  <p className="text-green-200 text-sm">
                    Live: {previewChannels.filter(c => c.category === 'live').length} • 
                    Movies: {previewChannels.filter(c => c.category === 'movies').length} • 
                    Series: {previewChannels.filter(c => c.category === 'series').length}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={reset}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={importChannels}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Import All
                  </button>
                </div>
              </div>
            </div>

            {/* Channel Preview List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {previewChannels.map((channel, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-3 flex items-center gap-3">
                  {channel.logo ? (
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-8 h-8 rounded object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {channel.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{channel.name}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded ${
                        channel.category === 'live' ? 'bg-blue-600' :
                        channel.category === 'movies' ? 'bg-red-600' : 'bg-purple-600'
                      } text-white`}>
                        {channel.category.toUpperCase()}
                      </span>
                      {channel.group && (
                        <span className="text-gray-400">{channel.group}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistLoaderModal;