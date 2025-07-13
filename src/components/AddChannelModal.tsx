import React, { useState } from 'react';
import { X, Plus, Upload, Link, Download } from 'lucide-react';
import { Channel } from '../types';

interface AddChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChannel: (channel: Omit<Channel, 'id'>) => void;
}

const AddChannelModal: React.FC<AddChannelModalProps> = ({ isOpen, onClose, onAddChannel }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    logo: '',
    category: 'live' as 'live' | 'movies' | 'series',
    group: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.url) return;

    setIsSubmitting(true);
    try {
      onAddChannel({
        ...formData,
        isFavorite: false,
      });
      setFormData({
        name: '',
        url: '',
        logo: '',
        category: 'live',
        group: '',
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const parseM3UFile = (content: string) => {
    const lines = content.split('\n');
    const channels: Omit<Channel, 'id'>[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#EXTINF:')) {
        const nextLine = lines[i + 1]?.trim();
        if (nextLine && nextLine.startsWith('http')) {
          const nameMatch = line.match(/,(.+)$/);
          const logoMatch = line.match(/tvg-logo="([^"]+)"/);
          const groupMatch = line.match(/group-title="([^"]+)"/);
          
          if (nameMatch) {
            channels.push({
              name: nameMatch[1].trim(),
              url: nextLine,
              logo: logoMatch ? logoMatch[1] : '',
              category: 'live',
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
    
    setIsLoadingPlaylist(true);
    try {
      const response = await fetch(playlistUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch playlist');
      }
      
      const content = await response.text();
      const channels = parseM3UFile(content);
      
      if (channels.length === 0) {
        alert('No valid channels found in the playlist');
        return;
      }
      
      channels.forEach(channel => {
        onAddChannel(channel);
      });
      
      alert(`Successfully imported ${channels.length} channels from playlist`);
      setPlaylistUrl('');
      onClose();
    } catch (error) {
      alert('Failed to load playlist: ' + (error as Error).message);
    } finally {
      setIsLoadingPlaylist(false);
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
      
      channels.forEach(channel => {
        onAddChannel(channel);
      });
      
      alert(`Successfully imported ${channels.length} channels from file`);
      onClose();
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add Channel</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Channel Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter channel name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stream URL *
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="http:// or https://"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Logo URL
            </label>
            <input
              type="url"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Channel logo URL"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="live">Live TV</option>
              <option value="movies">Movies</option>
              <option value="series">Series</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Group
            </label>
            <input
              type="text"
              value={formData.group}
              onChange={(e) => setFormData({ ...formData, group: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Optional group name"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.url}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              {isSubmitting ? 'Adding...' : 'Add Channel'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-700 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Load M3U Playlist from URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                placeholder="Enter M3U playlist URL"
                className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                onClick={loadPlaylistFromUrl}
                disabled={!playlistUrl || isLoadingPlaylist}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isLoadingPlaylist ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Download size={16} />
                )}
                {isLoadingPlaylist ? 'Loading...' : 'Load'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Import M3U File
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".m3u,.m3u8"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <Upload size={16} />
                Choose M3U File
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddChannelModal;