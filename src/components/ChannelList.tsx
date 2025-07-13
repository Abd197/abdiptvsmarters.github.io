import React from 'react';
import { Play, Heart, Trash2 } from 'lucide-react';
import { Channel } from '../types';

interface ChannelListProps {
  channels: Channel[];
  currentChannel: Channel | null;
  category: 'live' | 'movies' | 'series';
  onChannelSelect: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
  onDeleteChannel: (channelId: string) => void;
}

const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  currentChannel,
  category,
  onChannelSelect,
  onToggleFavorite,
  onDeleteChannel,
}) => {
  const filteredChannels = channels.filter(channel => channel.category === category);

  if (filteredChannels.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">No channels in this category</p>
        <p className="text-gray-500 text-sm mt-2">Add some channels to get started</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
      {filteredChannels.map((channel) => (
        <div
          key={channel.id}
          className={`group relative bg-gray-800 hover:bg-gray-700 rounded-lg p-4 cursor-pointer transition-all ${
            currentChannel?.id === channel.id ? 'ring-2 ring-blue-500 bg-gray-700' : ''
          }`}
          onClick={() => onChannelSelect(channel)}
        >
          <div className="flex items-center gap-3">
            {channel.logo ? (
              <img
                src={channel.logo}
                alt={channel.name}
                className="w-10 h-10 rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Play size={16} className="text-white" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium truncate">{channel.name}</h4>
              {channel.group && (
                <p className="text-gray-400 text-sm truncate">{channel.group}</p>
              )}
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(channel.id);
                }}
                className={`p-1 rounded ${
                  channel.isFavorite ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                } transition-colors`}
              >
                <Heart size={16} fill={channel.isFavorite ? 'currentColor' : 'none'} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChannel(channel.id);
                }}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChannelList;